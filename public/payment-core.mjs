// Original Rebag adapter logic. No upstream YouPI source is redistributed.
export const prices=Object.freeze({tote:49900,mini:39900,shoulder:59900,bucket:54900});
export function quote(design={}) {
  if(!Object.hasOwn(prices,design.shape)||!['plain','patch','stripe'].includes(design.pattern)||!['matching','contrast','long'].includes(design.strap)) throw Error('Choose a supported bag, pattern and strap.');
  const amountPaise=prices[design.shape]+(design.pattern==='patch'?10000:0)+(design.strap==='contrast'?8000:design.strap==='long'?12000:0);
  return {amountPaise,currency:'INR',amount:(amountPaise/100).toFixed(2)};
}
export const events=['OBSERVED_SUCCESS','RECONCILED','MANUAL_REVIEW','FAILED','EXPIRED','CANCELLED','SUCCESS'];
export function nextStatus(current,event,method,settlementState) {
  if(!events.includes(event))throw Error('Unsupported gateway event.');
  if(current==='RECONCILED')return current;
  if(event==='RECONCILED'){
    if(method!=='UPI'||settlementState!=='RECONCILED')throw Error('UPI reconciliation needs an explicit reconciled settlement state.');
    return 'RECONCILED';
  }
  if(event==='SUCCESS')return 'MANUAL_REVIEW'; // COD/counter success is not a UPI settlement.
  if(['OBSERVED_SUCCESS','MANUAL_REVIEW'].includes(current)&&['FAILED','EXPIRED','CANCELLED'].includes(event))return current;
  if(['FAILED','EXPIRED','CANCELLED'].includes(current)&&event==='OBSERVED_SUCCESS')return 'MANUAL_REVIEW';
  return event;
}
export const statusText=Object.freeze({PENDING:['Waiting for a test payment','No payment has been confirmed.'],OBSERVED_SUCCESS:['Alert observed — not reconciled','A bank alert alone does not establish settlement.'],RECONCILED:['Gateway reconciliation reported','Check official bank records before accepting or making a real order.'],MANUAL_REVIEW:['Manual review needed','Keep the order on hold while the payment is checked.'],FAILED:['Attempt failed','Check bank records if money appears debited. This status cannot prove that no transfer occurred.'],EXPIRED:['Payment window expired','Review bank records before retrying if a transfer was attempted.'],CANCELLED:['Checkout cancelled','Cancellation does not reverse any transfer already made.']});
