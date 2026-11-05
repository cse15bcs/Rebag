'use strict';
globalThis.RebagDesign = (() => {
 const routes=Object.freeze({
  'own-fabric':{name:'Make with my fabric',source:'Your approved fabric',purpose:'bag-fabric'},
  contribution:{name:'Contribute clothes & choose a Rebag bag',source:'Rebag materials, subject to availability',purpose:'contribution'}
 });
 function routeName(route){return routes[route]?.name||'Earlier demo design';}
 function instagramURL(value){if(!value)return null;try{const u=new URL(value);if(u.protocol!=='https:'||!['instagram.com','www.instagram.com'].includes(u.hostname)||u.username||u.password||u.port||u.search||u.hash||!/^\/[A-Za-z0-9_.]{1,30}\/?$/.test(u.pathname))return null;return u.href;}catch{return null;}}
 function brief(make,garments=[],transactions=[]){return {
  brand:'Rebag',kind:'Local concept design — not a submitted order',reference:make.id,
  route:routeName(make.route),shape:make.bagName||make.shape,serviceArea:make.serviceArea||'Not recorded',
  fabricSource:routes[make.route]?.source||'See earlier design',
  materialPreference:make.rebagMaterial||null,fabricUse:make.fabricUse||null,
  colourPreference:make.colour,colourNote:make.route==='own-fabric'?'Actual colour and pattern follow your cloth; this preview does not promise dyeing.':'Colour and material preferences need availability confirmation.',
  layout:make.pattern,handles:make.strap,initials:make.initials||'',
  preserve:make.preservation||'',designNotes:make.notes||'',handoverPreference:make.handover||'Decide after review',
  garments:garments.map(g=>({reference:g.id,name:g.name,material:g.material,purpose:g.purpose||'contribution',status:g.status,possiblePoints:g.points})),
  samplePricing:{currency:'INR',subtotal:make.subtotal??make.total,pointsRedeemed:make.pointsRedeemed||0,totalAfterPoints:make.total,delivery:'Not quoted',note:'Illustrative estimate only; fabric, design and final quote need approval.'},
  rewardTransactions:transactions,rewardTiming:'Accepted contributions earn points for a later order. Pending/rejected garments cannot fund this design.',
  photo:make.hasPhoto?'Previewed locally; photo is not saved in this brief. Attach it separately if you choose.':'No photo added',
  nextStep:'Instagram enquiries are coming soon. Save this brief for a future conversation.',
  notice:'No enquiry was sent, no payment taken, no clothes collected, and no permission to cut fabric was given.'
 };}
 function text(b){return [
  'REBAG — MY DESIGN BRIEF',b.kind,`Reference: ${b.reference}`,'',
  `Route: ${b.route}`,`Bag shape: ${b.shape}`,`Area: ${b.serviceArea}`,`Bag fabric: ${b.fabricSource}`,
  ...(b.materialPreference?[`Rebag material preference: ${b.materialPreference}`]:[]),
  ...(b.fabricUse?[`My fabric will be used as: ${b.fabricUse}`]:[]),
  `Colour preference: ${b.colourPreference}`,b.colourNote,`Layout: ${b.layout}`,`Handles: ${b.handles}`,`Initials: ${b.initials||'None'}`,
  '',`Please preserve: ${b.preserve||'To discuss'}`,`Design notes: ${b.designNotes||'None'}`,`Handover: ${b.handoverPreference}`,
  '', 'GARMENTS',...b.garments.map(g=>`${g.name} | ${g.material} | ${g.purpose} | ${g.status} | ${g.possiblePoints} possible demo points`),
  '',`Illustrative making subtotal: INR ${b.samplePricing.subtotal}`,`Demo points redeemed from earlier contributions: ${b.samplePricing.pointsRedeemed}`,`Illustrative total after demo points: INR ${b.samplePricing.totalAfterPoints}`,'Delivery: not quoted',b.samplePricing.note,
  '',b.rewardTiming,b.photo,'',b.nextStep,b.notice
 ].join('\n');}
 return Object.freeze({routes,routeName,instagramURL,brief,text});
})();
