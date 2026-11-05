import {normalizeDesign,canonical,digest,renderBlueprint,APPROVAL_TEXT,APPROVAL_TEXT_VERSION} from './blueprint-core.mjs';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let draftId=crypto.randomUUID(),requestKey=crypto.randomUUID(),approved=null,session=null,busy=false,referenceURL=null,refreshTimer,editRevision=0;
const hashes=new WeakMap(),history=new Map();
function raw(preview=false){const route=$('input[name=route]:checked')?.value||'',source=$('input[name=design-source]:checked')?.value||'shape';return {
 source,route:preview&&!route?'own-fabric':route,shape:$('#bag-shape').value,colour:$('input[name=colour]:checked')?.value,
 pattern:$('#fabric-pattern').value,strap:$('#strap').value,initials:$('#initials').value,notes:$('#design-notes').value,
 preservation:route==='own-fabric'?$('#preservation').value:'',fabricUse:$('#fabric-use').value,rebagMaterial:$('#rebag-material').value,
 serviceArea:$('#service-area').value||(preview?'Delhi':''),referenceNotes:source==='reference'?$('#reference-notes').value:'',externalPocket:$('#design-pocket').checked,
 dimensions:{width:$('#design-width').value,height:$('#design-height').value,depth:$('#design-depth').value,strapDrop:$('#design-drop').value},
 garments:$$('#garment-list .garment-entry').map(e=>({name:e.querySelector('input').value.trim()||e.querySelector('input').placeholder,material:e.querySelector('select').value}))
 };}
function referenceFile(){return $('input[name=design-source]:checked')?.value==='reference'?$('#design-reference').files[0]:null;}
function fabricFile(){return $('#cloth-photo').files[0];}
function validFile(file){return !file||(['image/jpeg','image/png','image/webp'].includes(file.type)&&file.size<=5*1024*1024);}
async function fileHash(file){if(!file)return null;if(!hashes.has(file))hashes.set(file,file.arrayBuffer().then(digest));return hashes.get(file);}
async function fingerprint(design,reference=referenceFile(),fabric=fabricFile()){return digest(canonical({design,referenceHash:await fileHash(reference),fabricHash:await fileHash(fabric)}));}
function invalidated(){editRevision++;if(approved){approved=null;$('#approval-receipt').hidden=true;$('#approval-status').textContent='The design changed. Review it and approve a new version.';}$('#approve-design-consent').checked=false;requestKey=crypto.randomUUID();}
function draw(element,design){element.innerHTML=renderBlueprint(design).replaceAll('id="grid"',`id="${element.id}-grid"`).replaceAll('#grid',`#${element.id}-grid`).replaceAll('id="arrow"',`id="${element.id}-arrow"`).replaceAll('#arrow',`#${element.id}-arrow`);}
function refresh(){
 const reference=$('input[name=design-source]:checked')?.value==='reference';$('#reference-input').hidden=!reference;$('#design-reference').required=reference;
 let preview;try{preview=normalizeDesign(raw(true));draw($('#design-blueprint'),preview);draw($('#review-blueprint'),preview);draw($('#large-blueprint'),preview);}catch(error){$('#design-blueprint').textContent=error.message;$('#review-blueprint').textContent='Check the requested dimensions before approval.';}
 let design=null;try{design=normalizeDesign(raw());}catch{}
 $('#approval-spec').innerHTML=design?`<dl class="blueprint-spec"><dt>Requested size</dt><dd>${design.dimensions.width} × ${design.dimensions.height} × ${design.dimensions.depth} cm</dd><dt>Handle drop</dt><dd>${design.dimensions.strapDrop} cm</dd><dt>Outside pocket</dt><dd>${design.externalPocket?'Yes':'No'}</dd><dt>Starting point</dt><dd>${design.source==='reference'?'Reference photo + chosen silhouette':'Chosen silhouette'}</dd><dt>Reference details</dt><dd>${esc(design.referenceNotes||'None added')}</dd><dt>Preserve</dt><dd>${esc(design.preservation||'Discuss with maker')}</dd></dl>`:'<p class="studio-help">Complete your design and area before submitting an approval.</p>';
 const imagesValid=validFile(referenceFile())&&validFile(fabricFile()),hasReference=!reference||!!referenceFile();
 $('#submit-design-approval').disabled=busy||!session||!design||!imagesValid||!hasReference||!$('#approve-design-consent').checked||!!approved;
 if(!hasReference)$('#approval-status').textContent='Add your design reference photo, or choose “Start from a bag shape”.';
}
function schedule(){clearTimeout(refreshTimer);refreshTimer=setTimeout(refresh,0);}
function setShapeDefaults(){const mini=$('#bag-shape').value==='mini';$('#design-width').value=mini?24:32;$('#design-height').value=mini?20:34;$('#design-depth').value=mini?8:10;$('#design-drop').value=mini?14:20;$('#design-pocket').checked=!mini;$('#design-pocket').dispatchEvent(new Event('input',{bubbles:true}));}
function download(name,content,type){const url=URL.createObjectURL(new Blob([content],{type})),a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
function receiptText(r){const d=r.design;return ['REBAG — CUSTOMER DESIGN APPROVAL',`Reference: ${r.id}`,`Version: ${r.version}`,`Received: ${r.createdAt}`,`Approved by: ${r.approvedBy}`,'Status: Customer approved — maker review pending',`Fingerprint: ${r.fingerprint}`,'',`Shape: ${d.shape}`,`Requested width / height / depth: ${d.dimensions.width} / ${d.dimensions.height} / ${d.dimensions.depth} cm`,`Handle drop: ${d.dimensions.strapDrop} cm`,`Layout: ${d.pattern}`,`Handles: ${d.strap}`,`Outside pocket: ${d.externalPocket?'Yes':'No'}`,`Colour preference: ${d.colour}`,`Initials: ${d.initials||'None'}`,`Area: ${d.serviceArea}`,`Fabric source: ${d.route==='own-fabric'?'Customer fabric':'Rebag materials, subject to confirmation'}`,`Reference details: ${d.referenceNotes||'None'}`,`Preserve: ${d.preservation||'To discuss'}`,`Other notes: ${d.notes||'None'}`,'','GARMENTS',...d.garments.map(g=>`${g.name} — ${g.material}`),'',`Reference photo stored: ${r.referenceAttached?'Yes':'No'}`,`Fabric photo stored: ${r.fabricAttached?'Yes':'No'}`,'','APPROVAL STATEMENT',r.approvalText,'','This is a design-intent approval only. No payment, production slot, fabric receipt or cutting permission is confirmed.'].join('\n');}
function showReceipt(r){$('#approval-receipt').hidden=false;$('#approval-receipt').innerHTML=`<strong>Design version ${r.version} received ✓</strong><span>${esc(r.id)}</span><p>Stored on this site at ${esc(new Date(r.createdAt).toLocaleString())}. Maker review pending.</p><button type="button" class="text-button" data-receipt-text="${esc(r.id)}">Download approval brief ↓</button><button type="button" class="text-button" data-receipt-svg="${esc(r.id)}">Download approved blueprint ↓</button>`;history.set(r.id,r);}
async function api(url,options={}){const response=await fetch(url,{credentials:'same-origin',cache:'no-store',...options});let data;try{data=await response.json();}catch{const error=Error('Approval storage is unavailable here. Use the full-stack site preview; no approval confirmation has been issued.');error.status=response.status;throw error;}if(!response.ok){const error=Error(data.error||'Could not read design approvals.');error.status=response.status;throw error;}return data;}
async function checkSession(){try{session=await api('/api/design-approvals/session');$('#approval-account').textContent=`Design approvals: signed in as ${session.name}`;}catch(error){session=null;if(error.status===401)$('#approval-account').innerHTML=`<a href="/signin-with-chatgpt?return_to=%2Findex.html" target="_top">Sign in to send a design approval</a><span> · Local drafts stay on this device.</span>`;else $('#approval-account').textContent='Design approval storage is unavailable in this preview. Local drafts still work.';$('#approval-status').textContent=error.message;}refresh();}
async function submit(){
 if(busy||!$('#approve-design-consent').checked)return;
 let design;try{design=normalizeDesign(raw());}catch(error){$('#approval-status').textContent=error.message;return;}
 if(!validFile(referenceFile())||!validFile(fabricFile())){$('#approval-status').textContent='Photos must be JPG, PNG or WebP, at most 5 MB each.';return;}
 if(design.source==='reference'&&!referenceFile()){$('#approval-status').textContent='Add a reference photo or choose a bag shape.';return;}
 busy=true;refresh();$('#approval-status').textContent='Uploading selected photos and recording this exact design version…';
 const sentKey=requestKey,sentDraft=draftId,sentRevision=editRevision,selectedReference=referenceFile(),selectedFabric=fabricFile(),controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),45000);
 try{
  const sentFingerprint=await fingerprint(design,selectedReference,selectedFabric),form=new FormData();form.set('design',JSON.stringify(design));form.set('draftId',sentDraft);form.set('requestKey',sentKey);form.set('approved','true');form.set('approvalTextVersion',APPROVAL_TEXT_VERSION);if(selectedReference)form.set('reference',selectedReference);if(selectedFabric)form.set('fabric',selectedFabric);
  const r=await api('/api/design-approvals',{method:'POST',body:form,signal:controller.signal});
  if(r.fingerprint!==sentFingerprint)throw Error('The stored version could not be matched to your approval. Please check My approved designs.');
  history.set(r.id,r);const current=await fingerprint(normalizeDesign(raw()));
  if(current===r.fingerprint&&draftId===sentDraft&&editRevision===sentRevision){approved=r;showReceipt(r);$('#approval-status').textContent='This design version is approved and stored. A maker must still review it before making.';}
  else{$('#approval-status').textContent='Your earlier version was received, but you changed the design while it was sending. Review and approve the current version separately.';}
 }catch(error){$('#approval-status').textContent=error.name==='AbortError'?'The connection timed out. Check My approved designs before retrying; a retry of this version will not create a duplicate.':error.message;}
 finally{clearTimeout(timeout);busy=false;refresh();}
}
async function openHistory(){const modal=$('#approved-designs');if(!modal.open){modal.showModal();document.body.classList.add('modal-open');}$('#approved-design-list').textContent='Loading your design approvals…';try{const {designs}=await api('/api/design-approvals');designs.forEach(r=>history.set(r.id,r));$('#approved-design-list').innerHTML=designs.length?designs.map(r=>`<article class="approved-record"><div><span class="eyebrow">VERSION ${r.version} · MAKER REVIEW PENDING</span><h3>${r.design.shape==='tote'?'Everyday Tote':'Little Mood'}</h3><p>${esc(r.id)}<br>${esc(new Date(r.createdAt).toLocaleString())}</p><p>${r.design.dimensions.width} × ${r.design.dimensions.height} × ${r.design.dimensions.depth} cm · ${esc(r.design.pattern)} layout</p><div class="approved-record-actions"><button data-receipt-text="${esc(r.id)}">Approval brief ↓</button><button data-receipt-json="${esc(r.id)}">Full record (.json) ↓</button><button data-receipt-svg="${esc(r.id)}">Blueprint (.svg) ↓</button>${r.referenceAttached?`<a target="_blank" rel="noopener" href="/api/design-approvals/${r.id}/reference">Reference photo ↗</a>`:''}${r.fabricAttached?`<a target="_blank" rel="noopener" href="/api/design-approvals/${r.id}/fabric">Fabric photo ↗</a>`:''}</div></div></article>`).join(''):'<p class="studio-help">No approved designs yet. Build a design, review the blueprint, then choose “Approve & send design”.</p>';}catch(error){$('#approved-design-list').textContent=error.message;}}
$('#approval-consent-copy').textContent=APPROVAL_TEXT;
$('#submit-design-approval').addEventListener('click',submit);
$('#approve-design-consent').addEventListener('change',refresh);
$('#view-approvals').addEventListener('click',openHistory);
$('#close-approved-designs').addEventListener('click',()=>$('#approved-designs').close());
$('#close-blueprint').addEventListener('click',()=>$('#blueprint-expanded').close());
document.addEventListener('click',e=>{
 const svg=e.target.closest('[data-blueprint-download]'),expand=e.target.closest('[data-blueprint-expand]'),txt=e.target.closest('[data-receipt-text]'),json=e.target.closest('[data-receipt-json]'),approvedSvg=e.target.closest('[data-receipt-svg]');
 try{if(svg)download('rebag-proposed-blueprint.svg',renderBlueprint(normalizeDesign(raw(true))),'image/svg+xml');if(expand){refresh();$('#blueprint-expanded').showModal();document.body.classList.add('modal-open');}const id=txt?.dataset.receiptText||json?.dataset.receiptJson||approvedSvg?.dataset.receiptSvg;if(id){const r=history.get(id);if(!r)return;if(txt)download(`rebag-${id}-v${r.version}-approval.txt`,receiptText(r),'text/plain;charset=utf-8');if(json)download(`rebag-${id}-v${r.version}.json`,JSON.stringify(r,null,2),'application/json');if(approvedSvg)download(`rebag-${id}-v${r.version}.svg`,renderBlueprint(r.design),'image/svg+xml');}}catch(error){$('#approval-status').textContent=error.message;}
});
$('#design-form').addEventListener('input',e=>{if(!['approve-design-consent','demo-consent','redeem-points','use-points'].includes(e.target.id)){invalidated();schedule();}});
$('#design-form').addEventListener('change',e=>{
 if(!['approve-design-consent','demo-consent','redeem-points','use-points'].includes(e.target.id)){invalidated();schedule();}
 if(e.target.id==='bag-shape')setShapeDefaults();
 if(e.target.id==='design-reference'){
  if(referenceURL)URL.revokeObjectURL(referenceURL);referenceURL=null;const file=$('#design-reference').files[0],img=$('#design-reference-preview');$('#design-reference').setCustomValidity('');$('#reference-error').textContent='';img.hidden=true;
  if(file&&!validFile(file)){$('#design-reference').setCustomValidity('Choose a JPG, PNG or WebP image up to 5 MB.');$('#reference-error').textContent='Choose a JPG, PNG or WebP image up to 5 MB.';}
  else if(file){referenceURL=URL.createObjectURL(file);img.src=referenceURL;img.hidden=false;img.onerror=()=>{$('#design-reference').setCustomValidity('This reference photo could not be read.');$('#reference-error').textContent='This reference photo could not be read. Choose another file.';img.hidden=true;};}
 }
});
$('#design-form').addEventListener('reset',()=>{draftId=crypto.randomUUID();requestKey=crypto.randomUUID();approved=null;$('#approval-receipt').hidden=true;$('#approval-status').textContent='';$('#design-reference').setCustomValidity('');$('#design-reference-preview').hidden=true;$('#reference-error').textContent='';if(referenceURL)URL.revokeObjectURL(referenceURL);referenceURL=null;queueMicrotask(()=>{setShapeDefaults();schedule();});});
$$('.form-step').forEach(el=>new MutationObserver(schedule).observe(el,{attributes:true,attributeFilter:['hidden']}));
window.addEventListener('rebag:design-updated',schedule);
globalThis.RebagBlueprint={draftData(){try{const blueprint=normalizeDesign(raw());return {blueprint,designApproval:approved&&canonical(approved.design)===canonical(blueprint)?{id:approved.id,version:approved.version,fingerprint:approved.fingerprint,createdAt:approved.createdAt,status:approved.status}:null};}catch{return {};}}};
checkSession();
