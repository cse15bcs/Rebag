'use strict';
// Prototype tariff calculator. No external courier booking or live rate request.
globalThis.RebagDelivery=(()=>{
 const cities=Object.freeze(['Delhi','Meerut','Ghaziabad','Noida','Greater Noida']);
 const validPin=value=>typeof value==='string'&&/^[1-9][0-9]{5}$/.test(value);
 const paise=n=>Number.isSafeInteger(n)&&n>=0&&n<=10000000;
 function quote(config,pincode,{shape,route='*',garments=2,city='',now=Date.now()}={}){
  pincode=typeof pincode==='string'?pincode.trim():'';
  const result={version:1,pincode,status:pincode?'invalid-pin':'missing-pin',amountPaise:null};
  if(!validPin(pincode))return result;
  result.status='quote-required';
  if(!validPin(config?.originPincode)||!Array.isArray(config?.rates)||!['tote','mini'].includes(shape)||!Number.isInteger(garments)||garments<1||garments>20)return result;
  const matches=config.rates.filter(r=>r&&r.pincode===pincode&&cities.includes(r.city)&&(!city||city===r.city)&&['*',shape].includes(r.shape)&&['*',route].includes(r.route)&&Number.isInteger(r.maxGarments)&&r.maxGarments>=garments&&r.maxGarments<=20&&paise(r.collectionPaise)&&paise(r.deliveryPaise)&&paise(r.collectionPaise+r.deliveryPaise)&&typeof r.id==='string'&&r.id.length>0&&r.id.length<=80&&Number.isFinite(Date.parse(r.validUntil))&&Date.parse(r.validUntil)>now);
  if(matches.length!==1)return result; // Ambiguous or missing tariffs need review.
  const r=matches[0];return {...result,status:'quoted',originPincode:config.originPincode,city:r.city,amountPaise:r.collectionPaise+r.deliveryPaise,rateId:r.id,validUntil:r.validUntil,shape,route,garments};
 }
 function total(makingRupees,delivery,points=0){
  if(!Number.isFinite(makingRupees)||makingRupees<0||delivery?.status!=='quoted'||!paise(delivery.amountPaise)||!Number.isSafeInteger(points)||points<0||points>makingRupees)return null;
  const makingPaise=Math.round(makingRupees*100);return (makingPaise+delivery.amountPaise-points*100)/100;
 }
 return Object.freeze({cities,validPin,quote,total});
})();
