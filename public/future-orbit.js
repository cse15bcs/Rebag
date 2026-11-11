'use strict';
(()=>{
 const body=document.body,buttons=[...document.querySelectorAll('[data-orbit-view]')],motion=document.querySelector('#orbit-motion');
 const preference=matchMedia('(prefers-reduced-motion:reduce)');let motionEnabled=!preference.matches;
 function updateMotion(){body.classList.toggle('motion-paused',!motionEnabled||document.hidden);motion.setAttribute('aria-pressed',String(motionEnabled));motion.innerHTML='<span aria-hidden="true">&#9680;</span> '+(preference.matches?'Reduced motion':motionEnabled?'Ambient motion: on':'Ambient motion: off');motion.disabled=preference.matches;}
 buttons.forEach(button=>button.addEventListener('click',()=>{const stitch=button.dataset.orbitView==='stitch';body.classList.toggle('stitch-mode',stitch);buttons.forEach(b=>b.setAttribute('aria-pressed',String(b===button)));document.querySelector('#concept-status').textContent=stitch?'Illustrative stitch view selected. This is not a cutting pattern.':'Fabric view selected.';}));
 motion.addEventListener('click',()=>{motionEnabled=!motionEnabled;updateMotion();});
 preference.addEventListener('change',()=>{motionEnabled=!preference.matches;updateMotion();});
 document.addEventListener('visibilitychange',updateMotion);updateMotion();
})();
