'use strict';
// Demo policy. A production wallet must enforce these rules on the server.
globalThis.RebagRewards = (() => {
  const policy = Object.freeze({pointsPerGarment:50,rupeesPerPoint:1,maxPercent:25});
  function empty(makes=[]) { return {version:2,makes,garments:[],ledger:[]}; }
  function parse(value,legacy=[]) {
    if(!value) return empty(legacy);
    const state=JSON.parse(value);
    if(state?.version!==2 || !['makes','garments','ledger'].every(k=>Array.isArray(state[k]))) throw Error('Saved rewards could not be read. Your stored data has not been changed.');
    if(state.ledger.some(e=>!['credit','debit'].includes(e.type)||!Number.isSafeInteger(e.points)||e.points<1) || state.garments.some(g=>!['pending','accepted','rejected'].includes(g.status))) throw Error('Saved rewards could not be read. Your stored data has not been changed.');
    return state;
  }
  function wallet(state) {
    const earned=state.ledger.filter(e=>e.type==='credit').reduce((n,e)=>n+e.points,0);
    const redeemed=state.ledger.filter(e=>e.type==='debit').reduce((n,e)=>n+e.points,0);
    const pending=state.garments.filter(g=>g.status==='pending').reduce((n,g)=>n+g.points,0);
    return {earned,redeemed,pending,available:Math.max(0,earned-redeemed)};
  }
  function limit(state,subtotal) { return Number.isFinite(subtotal)?Math.min(wallet(state).available,Math.floor(subtotal*policy.maxPercent/100/policy.rupeesPerPoint)):0; }
  function checkout(state,{make,garments,points=0,now}) {
    if(state.makes.some(m=>m.id===make.id)) throw Error('This request is already saved.');
    if(make.quoteRequired&&points!==0)throw Error('A complete quote is required before redeeming points.');
    if(!Number.isSafeInteger(points)||points<0||points>limit(state,make.subtotal)) throw Error('Your points balance or checkout limit changed. Review the total and try again.');
    if(!Number.isInteger(garments.length)||garments.length<1||garments.length>20) throw Error('Add between 1 and 20 garments.');
    let total=make.quoteRequired?null:make.subtotal-points*policy.rupeesPerPoint;
    if(make.delivery&&!make.quoteRequired){
      const q=make.delivery;if(!Number.isFinite(make.subtotal)||make.subtotal<0||q.status!=='quoted'||q.pincode!==make.pincode||q.shape!==make.shape||q.route!==make.route||q.city!==make.serviceArea||q.garments!==garments.length||!Number.isSafeInteger(q.amountPaise)||q.amountPaise<0||q.amountPaise>10000000||!Number.isFinite(Date.parse(q.validUntil))||Date.parse(q.validUntil)<=Date.parse(now))throw Error('Refresh the courier quote before saving.');
      total=(Math.round(make.subtotal*100)+q.amountPaise-points*100)/100;
    }
    state.makes.unshift({...make,pointsRedeemed:points,total});
    const ownFabric=make.route==='own-fabric';
    garments.forEach((g,i)=>state.garments.push({id:`${make.id}-G${i+1}`,orderId:make.id,name:g.name,material:g.material,purpose:ownFabric?'bag-fabric':'contribution',status:'pending',points:ownFabric?0:policy.pointsPerGarment,created:now}));
    if(points) state.ledger.push({id:`spend:${make.id}`,type:'debit',orderId:make.id,points,created:now,label:'Redeemed at checkout'});
  }
  function review(state,id,decision,now) {
    const garment=state.garments.find(g=>g.id===id);
    if(!garment) throw Error('This garment could not be found.');
    if(garment.status!=='pending') throw Error('This garment has already been reviewed. Points cannot be awarded twice.');
    if(!['accepted','rejected'].includes(decision)) throw Error('Choose an acceptance decision.');
    garment.status=decision;garment.reviewed=now;
    if(decision==='accepted' && garment.points>0) {
      if(state.ledger.some(e=>e.id===`earn:${id}`)) throw Error('Points were already issued for this garment.');
      state.ledger.push({id:`earn:${id}`,type:'credit',garmentId:id,orderId:garment.orderId,points:garment.points,created:now,label:garment.name});
    }
  }
  return Object.freeze({policy,empty,parse,wallet,limit,checkout,review});
})();
