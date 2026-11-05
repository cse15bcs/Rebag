import {DatabaseSync} from 'node:sqlite';
import {randomBytes,randomUUID,createHash,createHmac,timingSafeEqual} from 'node:crypto';
import {quote,nextStatus} from '../public/payment-core.mjs';
import {gatewayConfig,createGatewayPayment,verify,sign} from './youpi.mjs';

const hash=value=>createHash('sha256').update(value).digest('hex');
export function createPaymentService({database=':memory:',env=process.env,fetcher=fetch,now=Date.now}={}){
  const config=gatewayConfig(env),db=new DatabaseSync(database),csrfSecret=randomBytes(32).toString('hex'),mockSecret=randomBytes(32).toString('hex');
  db.exec(`PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON;
    CREATE TABLE IF NOT EXISTS payment_tests(id TEXT PRIMARY KEY,owner TEXT NOT NULL,request_key TEXT NOT NULL,reference TEXT NOT NULL,design TEXT NOT NULL,amount_paise INTEGER NOT NULL,payment_id TEXT UNIQUE,checkout_url TEXT,status TEXT NOT NULL,mode TEXT NOT NULL,created INTEGER NOT NULL,history TEXT NOT NULL,UNIQUE(owner,request_key));
    CREATE TABLE IF NOT EXISTS payment_deliveries(id TEXT PRIMARY KEY,body_hash TEXT NOT NULL,payment_id TEXT NOT NULL);
  `);
  const csrf=value=>createHmac('sha256',csrfSecret).update(value).digest('hex');
  function session(request){const cookie=request.headers.get('cookie')?.match(/(?:^|;\s*)rebag_payment_owner=([a-f0-9]{64})(?:;|$)/)?.[1];return cookie||randomBytes(32).toString('hex');}
  function publicOrder(row){return {id:row.id,reference:row.reference,design:JSON.parse(row.design),amountPaise:row.amount_paise,currency:'INR',status:row.status,paymentId:row.payment_id,checkoutUrl:row.checkout_url,mode:row.mode,history:JSON.parse(row.history),bankVerified:false,fulfilmentAllowed:false};}
  function getOrder(id,owner){const row=db.prepare('SELECT * FROM payment_tests WHERE id=? AND owner=?').get(id,hash(owner));if(!row)throw Object.assign(Error('Payment test not found.'),{status:404});return row;}
  function receive(raw,headers,secret){
    let payload;try{payload=verify(secret,raw,headers,now());}catch{throw Object.assign(Error('Webhook authentication failed.'),{status:401});}
    const row=db.prepare('SELECT * FROM payment_tests WHERE id=?').get(payload.orderId);
    if(!row||row.payment_id!==payload.paymentId||row.amount_paise!==payload.amountPaise||payload.currency!=='INR'||payload.amount!==(row.amount_paise/100).toFixed(2))throw Object.assign(Error('Webhook order, payment or amount mismatch.'),{status:409});
    if(['OBSERVED_SUCCESS','RECONCILED'].includes(payload.event)&&(!/^\d{12}$/.test(payload.utr||'')||payload.method!=='UPI'))throw Object.assign(Error('A UPI reference is required for this outcome.'),{status:422});
    let status;try{status=nextStatus(row.status,payload.event,payload.method,payload.settlementState);}catch(error){throw Object.assign(error,{status:422});}
    db.exec('BEGIN IMMEDIATE');
    try{
      const old=db.prepare('SELECT body_hash FROM payment_deliveries WHERE id=?').get(payload.deliveryId);
      if(old){if(old.body_hash!==hash(raw))throw Object.assign(Error('Delivery ID reused with different contents.'),{status:409});db.exec('COMMIT');return {received:true,duplicate:true};}
      const history=JSON.parse(row.history);history.push({event:payload.event,status,at:now(),method:payload.method,settlementState:payload.settlementState});
      db.prepare('INSERT INTO payment_deliveries(id,body_hash,payment_id) VALUES(?,?,?)').run(payload.deliveryId,hash(raw),payload.paymentId);
      db.prepare('UPDATE payment_tests SET status=?,history=? WHERE id=?').run(status,JSON.stringify(history),row.id);db.exec('COMMIT');return {received:true,duplicate:false};
    }catch(error){db.exec('ROLLBACK');throw error;}
  }
  async function handle(request){
    const url=new URL(request.url),owner=session(request),cookie=`rebag_payment_owner=${owner}; HttpOnly; SameSite=Strict; Path=/api/payments; Max-Age=2592000${url.protocol==='https:'?'; Secure':''}`;
    const reply=(body,status=200)=>new Response(JSON.stringify(body),{status,headers:{'content-type':'application/json','cache-control':'no-store','set-cookie':cookie,'x-content-type-options':'nosniff'}});
    try{
      if(!['GET','POST'].includes(request.method))return reply({error:'Method not allowed.'},405);
      if(request.method==='POST'&&url.pathname==='/api/payments/webhook'){
        const raw=await request.text();if(raw.length>32768)return reply({error:'Payload too large.'},413);
        return reply(receive(raw,new Headers(request.headers),config.mode==='mock'?mockSecret:config.webhookSecret));
      }
      if(request.method==='GET'&&url.pathname==='/api/payments/config')return reply({mode:config.mode,csrf:csrf(owner),server:true,bankVerified:false});
      if(request.method==='POST'){
        if(request.headers.get('origin')!==url.origin||!request.headers.get('content-type')?.startsWith('application/json'))return reply({error:'Same-origin JSON request required.'},403);
        const presented=request.headers.get('x-rebag-csrf')||'',expected=csrf(owner);
        if(presented.length!==expected.length||!timingSafeEqual(Buffer.from(presented),Buffer.from(expected)))return reply({error:'Refresh the payment test before trying again.'},403);
      }
      if(request.method==='POST'&&url.pathname==='/api/payments'){
        const raw=await request.text();if(raw.length>8192)return reply({error:'Request too large.'},413);const body=JSON.parse(raw);
        if(typeof body.requestKey!=='string'||!/^[-a-zA-Z0-9]{8,80}$/.test(body.requestKey))return reply({error:'A valid request key is required.'},422);
        let price;try{price=quote(body.design);}catch(error){return reply({error:error.message},422);}
        const design={shape:body.design.shape,pattern:body.design.pattern,strap:body.design.strap};
        const existing=db.prepare('SELECT * FROM payment_tests WHERE owner=? AND request_key=?').get(hash(owner),body.requestKey);
        if(existing){if(existing.design!==JSON.stringify(design))return reply({error:'This request key belongs to a different design.'},409);if(existing.payment_id)return reply(publicOrder(existing));return reply({error:'This request is pending or its gateway result is uncertain. Use its existing payment test; do not submit another payment.'},409);}
        const count=db.prepare('SELECT count(*) AS n FROM payment_tests WHERE owner=? AND created>?').get(hash(owner),now()-3600000).n;
        if(count>=20)return reply({error:'Payment-test limit reached. Try later.'},429);
        const id='RBP-'+randomUUID(),reference=typeof body.reference==='string'?body.reference.slice(0,80):'Bag design';
        db.prepare('INSERT INTO payment_tests(id,owner,request_key,reference,design,amount_paise,status,mode,created,history) VALUES(?,?,?,?,?,?,?,?,?,?)').run(id,hash(owner),body.requestKey,reference,JSON.stringify(design),price.amountPaise,'PENDING',config.mode,now(),JSON.stringify([{event:'CREATED',status:'PENDING',at:now()}]));
        let gateway;
        try{gateway=config.mode==='mock'?{paymentId:randomUUID(),checkoutUrl:null}:await createGatewayPayment(config,{id,reference,...price},fetcher);}catch(error){return reply({error:error.message,orderId:id},502);}
        db.prepare('UPDATE payment_tests SET payment_id=?,checkout_url=? WHERE id=?').run(gateway.paymentId,gateway.checkoutUrl,id);
        return reply(publicOrder(getOrder(id,owner)),201);
      }
      const match=url.pathname.match(/^\/api\/payments\/(RBP-[a-f0-9-]+)(\/simulate)?$/i);
      if(match){const row=getOrder(match[1],owner);
        if(request.method==='GET'&&!match[2])return reply(publicOrder(row));
        if(request.method==='POST'&&match[2]){
          if(config.mode!=='mock')return reply({error:'Simulation is disabled for an external gateway.'},403);
          const text=await request.text();if(text.length>1024)return reply({error:'Request too large.'},413);const {event}=JSON.parse(text);
          const timestamp=now(),deliveryId=randomUUID(),payload={deliveryId,timestamp,event,orderId:row.id,paymentId:row.payment_id,amount:(row.amount_paise/100).toFixed(2),amountPaise:row.amount_paise,currency:'INR',method:event==='SUCCESS'?'COD':'UPI',settlementState:event==='RECONCILED'?'RECONCILED':event==='SUCCESS'?'NOT_BANK_SETTLEMENT':'NOT_RECONCILED',utr:'000000000001'};
          const raw=JSON.stringify(payload),headers=new Headers({'x-gateway-event':event,'x-gateway-delivery-id':deliveryId,'x-gateway-timestamp':String(timestamp),'x-gateway-signature-v2':sign(mockSecret,raw,timestamp)});
          receive(raw,headers,mockSecret);return reply(publicOrder(getOrder(row.id,owner)));
        }
      }
      return reply({error:'Not found.'},404);
    }catch(error){return reply({error:error.status?error.message:'Payment request could not be processed.'},error.status||400);}
  }
  return {handle,close:()=>db.close()};
}
