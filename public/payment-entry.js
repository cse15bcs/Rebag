'use strict';
// Keep the optional integration lab separate from real order/enquiry actions.
(()=>{
 const makes=document.querySelector('#makes-list');if(!makes)return;
 const decorate=()=>{for(const actions of makes.querySelectorAll('.saved-actions')){
  if(actions.closest('[data-quote-required="true"]'))continue;
  if(actions.querySelector('[data-payment-test]'))continue;
  const reference=actions.querySelector('[data-download]')?.dataset.download||actions.querySelector('[data-remove]')?.dataset.remove;
  if(!reference)continue;
  const a=document.createElement('a');a.dataset.paymentTest='';a.href='/payment-test.html?make='+encodeURIComponent(reference);a.textContent='Test YouPI checkout';a.style.fontSize='10px';a.style.textUnderlineOffset='3px';actions.append(a);
 }};
 new MutationObserver(decorate).observe(makes,{childList:true,subtree:true});decorate();
})();
