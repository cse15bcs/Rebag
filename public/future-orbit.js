'use strict';
(()=>{
 const body=document.body,buttons=[...document.querySelectorAll('[data-orbit-view]')],motion=document.querySelector('#orbit-motion');
 const preference=matchMedia('(prefers-reduced-motion:reduce)');let motionEnabled=!preference.matches;
 function updateMotion(){body.classList.toggle('motion-paused',!motionEnabled||document.hidden);motion.setAttribute('aria-pressed',String(motionEnabled));motion.innerHTML='<span aria-hidden="true">&#9680;</span> '+(preference.matches?'Reduced motion':motionEnabled?'Ambient motion: on':'Ambient motion: off');motion.disabled=preference.matches;}
 buttons.forEach(button=>button.addEventListener('click',()=>{const stitch=button.dataset.orbitView==='stitch';body.classList.toggle('stitch-mode',stitch);buttons.forEach(b=>b.setAttribute('aria-pressed',String(b===button)));document.querySelector('#concept-status').textContent=stitch?'Illustrative stitch view selected. This is not a cutting pattern.':'Fabric view selected.';}));
 motion.addEventListener('click',()=>{motionEnabled=!motionEnabled;updateMotion();});
 preference.addEventListener('change',()=>{motionEnabled=!preference.matches;updateMotion();});
 document.addEventListener('visibilitychange',updateMotion);updateMotion();
 const themes={
  midnight:{name:'Midnight Sage',colour:'#0c1213',description:'Charcoal, sage and copper. The original dark study.'},
  pearl:{name:'Lunar Pearl',colour:'#f2f1e9',description:'Warm ivory, forest green and bronze. A softer light alternative.'},
  indigo:{name:'Indigo Copper',colour:'#0e1220',description:'Selected base: deep indigo, pale blue and copper.'},
  sand:{name:'Sand Bronze',colour:'#1a1512',description:'Earthy charcoal, sand and bronze. A warm, tactile atmosphere.'},
  arctic:{name:'Arctic Cyan',colour:'#08171c',description:'Deep teal, cyan and champagne. A fresh technical direction.'}
 };
 const defaultPalette='indigo',themeButtons=[...document.querySelectorAll('button[data-site-palette]')],finishButtons=[...document.querySelectorAll('button[data-site-finish]')],finishPanel=document.querySelector('#indigo-finish');
 let activePalette=defaultPalette,activeFinish='matte';
 function shareURL(){const url=new URL(location.href);url.pathname='/future-orbit.html';if(activePalette===defaultPalette)url.searchParams.delete('palette');else url.searchParams.set('palette',activePalette);if(activeFinish==='metallic')url.searchParams.set('finish','metallic');else url.searchParams.delete('finish');history.replaceState(null,'',url);}
 function setFinish(kind,updateURL=true){activeFinish=activePalette==='indigo'&&kind==='metallic'?'metallic':'matte';document.documentElement.dataset.siteFinish=activeFinish;finishButtons.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.siteFinish===activeFinish)));document.querySelector('#finish-label').textContent=activeFinish==='metallic'?'Metallic: brushed copper sheen on website accents.':'Matte: soft, flat website accents.';if(updateURL){shareURL();document.querySelector('#palette-status').textContent=(activeFinish==='metallic'?'Metallic Copper':'Matte')+' website finish selected. The bag remains a fabric illustration.';}}
 function setPalette(key,updateURL=true){if(!Object.hasOwn(themes,key))key=defaultPalette;activePalette=key;const theme=themes[key];document.documentElement.dataset.sitePalette=key;themeButtons.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.sitePalette===key)));document.querySelector('#palette-name').textContent=theme.name;document.querySelector('#palette-description').textContent=theme.description;document.querySelector('meta[name="theme-color"]').content=theme.colour;finishPanel.hidden=key!=='indigo';setFinish(activeFinish,false);document.querySelector('#palette-status').textContent=theme.name+' website palette selected. Bag fabric mood stays separate.';if(updateURL)shareURL();}
 themeButtons.forEach(button=>button.addEventListener('click',()=>setPalette(button.dataset.sitePalette)));
 finishButtons.forEach(button=>button.addEventListener('click',()=>setFinish(button.dataset.siteFinish)));
 const initialOptions=new URL(location.href).searchParams;activeFinish=initialOptions.get('finish')==='metallic'?'metallic':'matte';setPalette(initialOptions.get('palette'),false);
 const stage=document.querySelector('#playground'),light=document.querySelector('#scene-light');
 function lighting(){const value=Math.max(20,Math.min(100,Number(light.value)||65));stage.style.setProperty('--scene-light',String(value/100));stage.style.setProperty('--bag-light',String(.85+value/100*.35));document.querySelector('#scene-light-value').textContent=value+'%';}
 light.addEventListener('input',lighting);lighting();
 const detailToggle=document.querySelector('#detail-toggle'),layer=document.querySelector('#detail-layer'),description=document.querySelector('#detail-description');
 const descriptions={fabric:'Fabric: your actual cloth, its texture and its condition need review by the maker.',construction:'Construction: handle reinforcement and stitching need sample testing and maker approval.',personal:'Personal detail: agree which pockets, buttons or embroidery to preserve before any cutting.'};
 detailToggle.addEventListener('click',()=>{const open=detailToggle.getAttribute('aria-expanded')!=='true';detailToggle.setAttribute('aria-expanded',String(open));detailToggle.textContent=open?'Hide bag details -':'Show bag details +';layer.hidden=!open;body.classList.toggle('details-open',open);description.textContent=open?'Choose a detail point on the illustration. These are concept notes, not a cutting pattern.':'Explore the concept with lighting and optional detail points.';});
 const detailButtons=[...document.querySelectorAll('[data-bag-detail]')];detailButtons.forEach(button=>button.addEventListener('click',()=>{detailButtons.forEach(b=>b.setAttribute('aria-pressed',String(b===button)));description.textContent=descriptions[button.dataset.bagDetail];}));
})();
