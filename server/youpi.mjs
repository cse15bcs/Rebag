import {createHmac,timingSafeEqual} from 'node:crypto';

export function sign(secret,raw,timestamp){return 'sha256='+createHmac('sha256',secret).update(`${timestamp}.${raw}`).digest('hex');}
export function verify(secret,raw,headers,now=Date.now()){
  const signature=headers.get('x-gateway-signature-v2')||headers.get('x-gateway-signature')||'';
  if(!/^sha256=[a-f0-9]{64}$/i.test(signature))throw Error('Invalid signature.');
  const timestamp=headers.get('x-gateway-timestamp'),n=Number(timestamp);
  if(!timestamp||!Number.isSafeInteger(n)||now-n>2*60*60*1000||n-now>5*60*1000)throw Error('Webhook timestamp is missing or outside the delivery window.');
  // Prefer v2's signed timestamp. Accept the documented v1 raw-body form only
  // when the identical timestamp and delivery id are inside its signed JSON.
  const expected=headers.has('x-gateway-signature-v2')?sign(secret,raw,timestamp):'sha256='+createHmac('sha256',secret).update(raw).digest('hex');
  if(!timingSafeEqual(Buffer.from(signature.toLowerCase()),Buffer.from(expected)))throw Error('Invalid signature.');
  const payload=JSON.parse(raw);
  if(String(payload.timestamp)!==timestamp||!payload.deliveryId||headers.get('x-gateway-delivery-id')!==payload.deliveryId||headers.get('x-gateway-event')!==payload.event)throw Error('Signed webhook metadata mismatch.');
  return payload;
}
export function gatewayConfig(env=process.env){
  const mode=env.YOUPI_MODE||'mock';
  if(!['mock','external'].includes(mode))throw Error('YOUPI_MODE must be mock or external.');
  const config={mode};
  if(mode==='external'){
    for(const name of ['YOUPI_API_URL','YOUPI_CHECKOUT_ORIGIN','YOUPI_MERCHANT_ID','YOUPI_MERCHANT_API_KEY','YOUPI_WEBHOOK_SECRET','PUBLIC_STORE_URL'])if(!env[name])throw Error(`${name} must be configured for external mode.`);
    const parse=value=>{const url=new URL(value);if(url.username||url.password||!(url.protocol==='https:'||(url.protocol==='http:'&&['localhost','127.0.0.1','[::1]'].includes(url.hostname))))throw Error('Gateway URLs must use HTTPS, or local HTTP for testing.');return url;};
    config.apiUrl=parse(env.YOUPI_API_URL).href.replace(/\/$/,'');config.checkoutOrigin=parse(env.YOUPI_CHECKOUT_ORIGIN).origin;config.storeOrigin=parse(env.PUBLIC_STORE_URL).origin;
    config.merchantId=env.YOUPI_MERCHANT_ID;config.apiKey=env.YOUPI_MERCHANT_API_KEY;config.webhookSecret=env.YOUPI_WEBHOOK_SECRET;
  }
  return config;
}
export async function createGatewayPayment(config,order,fetcher=fetch){
  const response=await fetcher(`${config.apiUrl}/api/v1/payments`,{method:'POST',redirect:'error',signal:AbortSignal.timeout(10000),headers:{'Content-Type':'application/json','X-Merchant-Id':config.merchantId,'X-Merchant-Key':config.apiKey,'Idempotency-Key':order.id},body:JSON.stringify({orderId:order.id,amount:(order.amountPaise/100).toFixed(2),currency:'INR',returnUrl:`${config.storeOrigin}/payment-test.html`,metadata:{source:'rebag-payment-evaluation',reference:order.reference}})});
  if(!response.ok)throw Error(`YouPI session could not be created (HTTP ${response.status}).`);
  const body=await response.json();
  const url=new URL(body.checkoutUrl,config.checkoutOrigin);
  if(url.origin!==config.checkoutOrigin||url.username||url.password||!url.pathname.startsWith('/checkout/')||typeof body.paymentId!=='string'||!body.paymentId||body.orderId!==order.id||body.currency!=='INR'||String(body.amount)!==(order.amountPaise/100).toFixed(2))throw Error('Gateway response did not match the requested checkout.');
  return {paymentId:body.paymentId,checkoutUrl:url.href};
}
