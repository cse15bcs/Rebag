// Integration checks against the installed gateway's real local Sandbox API.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {fileURLToPath} from 'node:url';

const root=new URL('../',import.meta.url),origin='http://127.0.0.1:8085';
const credentials=JSON.parse(fs.readFileSync(new URL('.local/upi-runtime/sandbox-api.json',root),'utf8'));
assert.ok(credentials.key.startsWith('test_key_')&&credentials.secret.startsWith('test_sec_'),'Sandbox credentials required');
const headers={'X-Api-Key':credentials.key,'X-Api-Secret':credentials.secret,Accept:'application/json','Content-Type':'application/json'};
const results=[];
let lastOrder;
for(const [outcome,http,status] of [['success',200,'paid'],['failed',200,'failed'],['pending',200,'pending'],['expired',200,'expired'],['timeout',504,'pending'],['invalid_reference',422,'pending']]){
 const client='REBAG_QA_'+randomUUID().replaceAll('-','');
 const input={amount:'1.00',client_order_id:client,note:'Sandbox integration check - no real payment'};
 const created=await fetch(origin+'/api/v1/orders',{method:'POST',headers,body:JSON.stringify(input)});
 assert.equal(created.status,201,'Create Sandbox '+outcome);
 const order=(await created.json()).data;
 assert.equal(order.environment,'sandbox');assert.equal(order.test,true);assert.equal(order.upi_intent,null);
 const url=new URL(order.payment_url);assert.equal(url.origin,origin);assert.ok(url.pathname.startsWith('/sandbox/pay/'));
 const page=await fetch(url),html=await page.text();
 assert.ok(html.includes('NO REAL MONEY'));assert.ok(!html.includes('upi://pay'));
 const token=html.match(/name="_token"[^>]*value="([^"]+)"/)?.[1];assert.ok(token,'Sandbox form CSRF token');
 const cookies=page.headers.getSetCookie().map(value=>value.split(';')[0]).join('; ');
 const simulated=await fetch(url.href+'/simulate',{method:'POST',headers:{Cookie:cookies,Accept:'application/json','Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({_token:token,outcome})});
 assert.equal(simulated.status,http,outcome+' response');
 const checked=await fetch(origin+'/api/v1/orders/'+order.order_id,{headers});assert.equal(checked.status,200);
 const current=(await checked.json()).data;assert.equal(current.status,status);assert.equal(current.environment,'sandbox');assert.equal(current.test,true);
 if(outcome==='success'){
  assert.ok(current.utr.startsWith('TEST'));assert.equal(current.verified_by,'sandbox');
  const replay=await fetch(url.href+'/simulate',{method:'POST',headers:{Cookie:cookies,Accept:'application/json','Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({_token:token,outcome})});assert.equal(replay.status,422,'Completed Sandbox simulation cannot be replayed');
 }
 const duplicate=await fetch(origin+'/api/v1/orders',{method:'POST',headers,body:JSON.stringify(input)});assert.equal(duplicate.status,422,'Client order reference must be unique');
 results.push({outcome,http,status,orderId:order.order_id});lastOrder=current;
 console.log('PASS '+outcome+' -> HTTP '+http+', '+status+' (Sandbox)');
}
assert.equal((await fetch(origin+'/api/v1/orders/'+lastOrder.order_id,{headers:{Accept:'application/json'}})).status,401);
assert.equal((await fetch(origin+'/api/v1/orders/'+lastOrder.order_id,{headers:{...headers,'X-Api-Secret':'incorrect-test-secret'}})).status,401);
console.log('PASS API authentication and invalid secrets');
for(const pathname of ['/.env','/vendor/autoload.php','/storage/logs/laravel.log']){
 const response=await fetch(origin+pathname,{redirect:'manual'});assert.ok([403,404].includes(response.status),pathname+' must be private');
}
console.log('PASS private environment, vendor and log paths');
const manifest=JSON.parse(fs.readFileSync(new URL('.local/upi-gateway/public/build/manifest.json',root),'utf8'));
for(const item of Object.values(manifest))if(item.file?.endsWith('.css')||item.file?.endsWith('.js'))assert.equal((await fetch(origin+'/build/'+item.file)).status,200);
console.log('PASS compiled frontend assets');
const report={checkedAt:new Date().toISOString(),origin,results};
fs.writeFileSync(fileURLToPath(new URL('.local/upi-runtime/smoke-results.json',root)),JSON.stringify(report,null,2));
console.log('Gateway Sandbox integration checks passed. No real payments were made.');
