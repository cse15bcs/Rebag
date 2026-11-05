import {quote,nextStatus,statusText} from './payment-core.mjs';
const $=s=>document.querySelector(s),key='rebag-payment-lab-v1';
const currency=n=>new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR'}).format(n/100);
let config=null,current=null,requestKey=crypto.randomUUID(),reference='Sample design',busy=false;
const design=()=>({shape:$('#shape').value,pattern:$('#pattern').value,strap:$('#strap').value});
function error(message){$('#error').textContent=message;}
function remember(){try{sessionStorage.setItem(key,JSON.stringify({current,requestKey,reference}));}catch{error('This browser cannot remember the test across reloads.');}}
async function api(path,body){const response=await fetch(path,{credentials:'same-origin',cache:'no-store',...(body?{method:'POST',headers:{'content-type':'application/json','x-rebag-csrf':config.csrf},body:JSON.stringify(body)}:{})});const result=await response.json();if(!response.ok)throw Error(result.error||'Payment-test request failed.');return result;}
function render(){
 $('#empty').hidden=!!current;$('#session').hidden=!current;$('#create').disabled=busy||!config||!!current;
 for(const selector of ['#shape','#pattern','#strap'])$(selector).disabled=!!current||busy;
 $('#amount').textContent=currency(current?current.amountPaise:quote(design()).amountPaise);
 if(!current)return;
 const [title,description]=statusText[current.status]||['Awaiting review','Refresh the status or check the gateway.'];
 $('#reference').textContent=`${current.id} · ${current.reference}`;$('#status-code').textContent=current.status;$('#status-title').textContent=title;$('#status-description').textContent=description;
 $('#authority').textContent=config.mode==='external'?'External gateway status only. Official bank review and an approved design/quote are still required. This test does not mark a Rebag order paid.':'Simulation only. No funds have moved, no reward points were spent and no order is approved for making.';
 $('#simulator').hidden=config.mode==='external';$('#gateway-link').hidden=!current.checkoutUrl;
 if(current.checkoutUrl)$('#gateway-link').href=current.checkoutUrl;
 $('#history').replaceChildren(...current.history.map(e=>{const li=document.createElement('li');li.textContent=`${new Date(e.at).toLocaleTimeString()} · ${e.event} → ${e.status}`;return li;}));
 $('#new-attempt').hidden=config.mode==='external';
 document.querySelectorAll('[data-event]').forEach(b=>b.disabled=busy||current.status==='RECONCILED');remember();
}
async function initialize(){
 try{
  const response=await fetch('/api/payments/config',{credentials:'same-origin',cache:'no-store'});
  if(response.ok&&response.headers.get('content-type')?.includes('application/json')){config=await response.json();if(!['mock','external'].includes(config.mode)||!config.csrf)throw Error('Invalid payment server configuration.');}
  else if(response.status===404||response.status===405||response.ok){config={mode:'browser',server:false};}
  else throw Error('The payment server is unavailable. No checkout was created.');
  $('#mode').textContent=config.mode==='browser'?'Browser-only simulation · No YouPI gateway connected. Run the local server for signed webhooks and persistent server records.':config.mode==='mock'?'Local server test mode · Signed synthetic webhooks + SQLite history. No bank account or money transfer.':'External YouPI evaluation · A separately configured gateway is connected. Its checkout may request a real UPI transfer. This lab cannot verify bank settlement.';
  $('#mode').classList.toggle('external',config.mode==='external');
  const raw=sessionStorage.getItem(key);if(raw){try{const saved=JSON.parse(raw);if(saved.current?.mode===config.mode){current=saved.current;requestKey=saved.requestKey;reference=saved.reference;if(config.server)current=await api('/api/payments/'+current.id);}}catch{current=null;}}
  if(current){for(const field of ['shape','pattern','strap'])$('#'+field).value=current.design[field];}
  else{const makeId=new URLSearchParams(location.search).get('make');if(makeId){try{const stored=JSON.parse(localStorage.getItem('rebag-state-v2')||'{}'),make=stored.makes?.find(m=>m.id===makeId);if(make){quote(make);for(const field of ['shape','pattern','strap'])$('#'+field).value=make[field];reference=make.id;$('#design-reference').textContent=`From saved design ${make.id}. Its demo reward balance is unchanged.`;}}catch{error('This saved design could not be loaded. A sample design is shown.');}}}
  render();
 }catch(e){error(e.message);$('#mode').textContent='Payment test could not connect. Refresh to try again.';}
}
$('#payment-form').addEventListener('submit',async event=>{event.preventDefault();if(busy||current||!config)return;busy=true;error('');render();try{
 if(config.server)current=await api('/api/payments',{design:design(),reference,requestKey});
 else current={id:'BROWSER-'+crypto.randomUUID(),reference,design:design(),...quote(design()),mode:'browser',status:'PENDING',history:[{event:'CREATED',status:'PENDING',at:Date.now()}],checkoutUrl:null};
 }catch(e){error(e.message);}finally{busy=false;render();}});
document.querySelectorAll('select').forEach(select=>select.addEventListener('change',()=>{requestKey=crypto.randomUUID();$('#amount').textContent=currency(quote(design()).amountPaise);}));
document.querySelectorAll('[data-event]').forEach(button=>button.addEventListener('click',async()=>{if(busy||!current)return;busy=true;error('');render();try{const event=button.dataset.event;if(config.server)current=await api(`/api/payments/${current.id}/simulate`,{event});else{current.status=nextStatus(current.status,event,event==='SUCCESS'?'COD':'UPI',event==='RECONCILED'?'RECONCILED':'NOT_RECONCILED');current.history.push({event,status:current.status,at:Date.now()});}}catch(e){error(e.message);}finally{busy=false;render();}}));
$('#refresh').addEventListener('click',async()=>{if(!current||busy)return;try{if(config.server)current=await api('/api/payments/'+current.id);render();}catch(e){error(e.message);}});
$('#new-attempt').addEventListener('click',()=>{current=null;requestKey=crypto.randomUUID();$('#consent').checked=false;error('');remember();render();});
initialize();
