'use strict';
(()=>{
 const $=selector=>document.querySelector(selector),$$=selector=>[...document.querySelectorAll(selector)];
 const palettes={sage:{name:'Sage',base:'#8a9b85',light:'#aebba1',dark:'#536a54'},denim:{name:'Denim',base:'#728fa4',light:'#a3b8c6',dark:'#3b586d'},copper:{name:'Copper',base:'#bc8971',light:'#d5b29b',dark:'#80543f'}};
 const reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;
 let shape='tote',fabric='sage',progress=100,rotation=-16,tilt=-7,drag=null,frame=0,completionTimer=0,interacted=false;
 const stage=$('#playground'),view=$('#bag-interaction'),object=$('#bag-object'),range=$('#form-progress');
 const mix=(a,b,t)=>Math.round((a+(b-a)*t)*100)/100;
 const announce=message=>$('#concept-status').textContent=message;
 function orientation(){object.style.transform=`rotateX(${tilt}deg) rotateY(${rotation}deg) rotateZ(-7deg)`;}
 function render(){
  const t=progress/100,mini=shape==='mini',top=mix(120,mini?245:196,t),bottom=mix(424,mini?423:438,t),left=mix(106,mini?113:93,t),right=480-left,tl=mix(106,mini?129:116,t),tr=480-tl,curve=mix(120,mini?208:196,t);
  const d=`M${tl+14} ${top}Q240 ${curve} ${tr-14} ${top}Q${tr} ${top} ${tr+2} ${top+14}L${right} ${bottom-16}Q${right+2} ${bottom} ${right-14} ${bottom}H${left+14}Q${left-2} ${bottom} ${left} ${bottom-16}L${tl-2} ${top+14}Q${tl} ${top} ${tl+14} ${top}Z`;
  for(const id of ['fabric-body','fabric-clip-path','body-stitch'])$('#'+id).setAttribute('d',d);
  const handle=mini?'M181 247V195C181 132 299 132 299 195V247':'M173 204V131C173 43 307 43 307 131V204';
  for(const id of ['back-handle','front-handle','handle-stitch'])$('#'+id).setAttribute('d',handle);
  $('#bag-handles').style.opacity=Math.max(0,(t-.23)/.77);$('#bag-handles').setAttribute('transform',`translate(0 ${mix(70,0,t)})`);
  $('#bag-depth').setAttribute('d',`M${tr-10} ${top+2}L${tr+8} ${top+7}L${right+10} ${bottom-9}L${right-3} ${bottom+2}Z`);$('#bag-depth').style.opacity=t*.48;
  $('#panel-seam').setAttribute('d',`M${tl+8} ${top+9}Q240 ${curve+13} ${tr-8} ${top+9}`);
  $('#bag-pocket').style.opacity=mini?0:Math.max(0,(t-.5)*2);$('#bag-label').style.opacity=Math.max(0,(t-.6)*2.5);$('#bag-label').setAttribute('transform',mini?'translate(-5 1)':'');
  $('#bag-initials').style.opacity=Math.max(0,(t-.5)*2);$('#bag-initials').setAttribute('y',mini?'368':'405');
  $('#object-shadow').style.opacity=.04+t*.08;$('#object-shadow').setAttribute('rx',mix(135,mini?119:145,t));
  const phase=progress<15?'Fabric panel':progress<90?'Taking shape':'Bag concept';if($('#form-state').textContent!==phase)$('#form-state').textContent=phase;
  $('#object-name').textContent=mini?'The Little Mood':'The Everyday Tote';$('#bag-title').textContent=(mini?'Little Mood':'Everyday Tote')+' concept in '+palettes[fabric].name;
  range.value=String(Math.round(progress));
 }
 function stop(){cancelAnimationFrame(frame);clearTimeout(completionTimer);frame=0;completionTimer=0;interacted=true;}
 function complete(){cancelAnimationFrame(frame);clearTimeout(completionTimer);frame=0;completionTimer=0;progress=100;render();announce('Fabric transformed into the '+(shape==='mini'?'Little Mood':'Everyday Tote')+' concept.');}
 function transform(){stop();if(reduced||document.hidden){progress=100;render();announce('Bag concept. Use the slider to explore the fabric transformation.');return;}
  progress=0;render();const start=performance.now();function tick(now){const t=Math.min(1,(now-start)/1700);progress=(1-(1-t)**3)*100;render();if(t<1)frame=requestAnimationFrame(tick);else complete();}frame=requestAnimationFrame(tick);completionTimer=setTimeout(complete,1850);
 }
 $$('[data-future-shape]').forEach(button=>button.addEventListener('click',()=>{stop();shape=button.dataset.futureShape;$$('[data-future-shape]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));render();announce((shape==='mini'?'Little Mood':'Everyday Tote')+' selected.');}));
 $$('[data-fabric]').forEach(button=>button.addEventListener('click',()=>{stop();fabric=button.dataset.fabric;const p=palettes[fabric];stage.style.setProperty('--fabric',p.base);stage.style.setProperty('--fabric-light',p.light);stage.style.setProperty('--fabric-dark',p.dark);$('#fabric-name').textContent=p.name;$$('[data-fabric]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));render();announce(p.name+' fabric mood selected.');}));
 $('#future-initials').addEventListener('input',e=>{stop();const value=e.target.value.replace(/[^a-z]/gi,'').toUpperCase().slice(0,3);e.target.value=value;$('#bag-initials').textContent=value;});
 range.addEventListener('input',()=>{stop();progress=Number(range.value);render();});
 $('#watch-transform').addEventListener('click',()=>{transform();if(matchMedia('(max-width:800px)').matches)stage.scrollIntoView({behavior:reduced?'auto':'smooth',block:'start'});});
 $('#reset-view').addEventListener('click',()=>{rotation=-16;tilt=-7;orientation();announce('View reset.');});
 view.addEventListener('pointerdown',e=>{if(e.button!==0||e.target.closest('button,a,input,select,textarea'))return;stop();drag={x:e.clientX,y:e.clientY,rotation,tilt};view.setPointerCapture(e.pointerId);});
 view.addEventListener('pointermove',e=>{if(!drag)return;rotation=Math.max(-38,Math.min(38,drag.rotation+(e.clientX-drag.x)*.2));tilt=Math.max(-16,Math.min(12,drag.tilt-(e.clientY-drag.y)*.08));orientation();});
 for(const event of ['pointerup','pointercancel','lostpointercapture'])view.addEventListener(event,()=>{drag=null;});
 view.addEventListener('keydown',e=>{if(e.target!==view||!['ArrowLeft','ArrowRight','Home'].includes(e.key))return;e.preventDefault();stop();if(e.key==='Home'){rotation=-16;tilt=-7;}else rotation=Math.max(-38,Math.min(38,rotation+(e.key==='ArrowRight'?5:-5)));orientation();});
 const story=$('.future-story');if('IntersectionObserver'in window){const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){story.classList.add('is-visible');observer.disconnect();}},{threshold:.15});observer.observe(story);}else story.classList.add('is-visible');
 render();orientation();if(!reduced)setTimeout(()=>{if(!interacted)transform();},450);
 document.addEventListener('visibilitychange',()=>{if(document.hidden){const animating=!!frame;stop();if(animating){progress=100;render();}}});
})();
