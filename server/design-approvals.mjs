import {normalizeDesign,canonical,digest,APPROVAL_TEXT_VERSION,APPROVAL_TEXT} from '../public/blueprint-core.mjs';
const MAX_IMAGE=5*1024*1024,MAX_BODY=MAX_IMAGE*2+65536;
class Problem extends Error{constructor(message,status=400){super(message);this.status=status;}}
const json=(data,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
const uuid=v=>typeof v==='string'&&/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(v);
async function limitedBody(request){if(Number(request.headers.get('content-length'))>MAX_BODY)throw new Problem('Design upload is too large.',413);const reader=request.body?.getReader();if(!reader)throw new Problem('No design supplied.');let size=0;const chunks=[];for(;;){const {value,done}=await reader.read();if(done)break;size+=value.byteLength;if(size>MAX_BODY){await reader.cancel();throw new Problem('Design upload is too large.',413);}chunks.push(value);}const result=new Uint8Array(size);let offset=0;for(const chunk of chunks){result.set(chunk,offset);offset+=chunk.length;}return result;}
export async function readImage(file,label){
 if(!file||typeof file==='string'||file.size===0)return null;
 if(file.size>MAX_IMAGE)throw new Problem(`${label} must be at most 5 MB.`,413);
 const bytes=new Uint8Array(await file.arrayBuffer()),type=file.type;
 const png=bytes.length>=8&&[137,80,78,71,13,10,26,10].every((n,i)=>bytes[i]===n);
 const jpg=bytes.length>=3&&bytes[0]===255&&bytes[1]===216&&bytes[2]===255;
 const webp=bytes.length>=12&&new TextDecoder().decode(bytes.subarray(0,4))==='RIFF'&&new TextDecoder().decode(bytes.subarray(8,12))==='WEBP';
 if(!((type==='image/png'&&png)||(type==='image/jpeg'&&jpg)||(type==='image/webp'&&webp)))throw new Problem(`${label} must be a valid JPG, PNG or WebP image.`);
 return {bytes,type,hash:await digest(bytes)};
}
function receipt(row){return {id:row.id,draftId:row.draft_id,version:row.version,status:'customer-approved-maker-review-pending',design:JSON.parse(row.payload_json),designHash:row.design_hash,fingerprint:row.fingerprint,referenceAttached:!!row.reference_key,fabricAttached:!!row.fabric_key,referenceHash:row.reference_hash,fabricHash:row.fabric_hash,approvedBy:row.approved_name,approvalTextVersion:row.approval_text_version,approvalText:row.approval_text,createdAt:row.created_at};}
export function createDesignApprovalService({db,bucket,now=()=>new Date().toISOString()}){
 const find=(owner,key)=>db.prepare('SELECT * FROM design_approvals WHERE owner_id = ? AND idempotency_key = ?').bind(owner,key).first();
 async function handle(request,user){
  try{
   if(!user?.userId||!user?.email)return json({error:'Sign in to send or view approved designs.',signIn:'/signin-with-chatgpt?return_to=%2Findex.html'},401);
   if(!db||!bucket)return json({error:'Design approval storage is not available yet. Your design has not been submitted.'},503);
   const url=new URL(request.url),path=url.pathname.replace(/\/$/,'').split('/').slice(3);
   if(request.method==='GET'&&path[0]==='session')return json({signedIn:true,name:user.displayName||user.email,storageReady:true});
   if(request.method==='GET'&&path.length===0){const result=await db.prepare('SELECT * FROM design_approvals WHERE owner_id = ? ORDER BY created_at DESC LIMIT 50').bind(user.userId).all();return json({designs:result.results.map(receipt)});}
   if(request.method==='GET'&&path.length>=1){
    const row=await db.prepare('SELECT * FROM design_approvals WHERE owner_id = ? AND id = ?').bind(user.userId,path[0]).first();if(!row)return json({error:'Design not found.'},404);
    if(path.length===1)return json(receipt(row));
    const kind=path[1];if(!['reference','fabric'].includes(kind)||path.length!==2)return json({error:'Not found.'},404);
    const key=row[kind+'_key'];if(!key)return json({error:'Image not found.'},404);const file=await bucket.get(key);if(!file)return json({error:'Image not found.'},404);
    return new Response(file.body,{headers:{'Content-Type':row[kind+'_type'],'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}});
   }
   if(request.method!=='POST'||path.length!==0)return json({error:'Method not allowed.'},405);
   if(request.headers.get('origin')!==url.origin)throw new Problem('Open this design from the same site before submitting.',403);
   if(!(request.headers.get('content-type')||'').startsWith('multipart/form-data;'))throw new Problem('Submit a design form.');
   const raw=await limitedBody(request),form=await new Response(raw,{headers:{'Content-Type':request.headers.get('content-type')}}).formData();
   const draftId=form.get('draftId'),requestKey=form.get('requestKey');if(!uuid(draftId)||!uuid(requestKey))throw new Problem('Invalid design reference.');
   if(form.get('approved')!=='true'||form.get('approvalTextVersion')!==APPROVAL_TEXT_VERSION)throw new Problem('Read and approve the current design statement before sending.');
   const encoded=form.get('design');if(typeof encoded!=='string'||encoded.length>32768)throw new Problem('Design specification is too large.');
   let design;try{design=normalizeDesign(JSON.parse(encoded));}catch(error){throw new Problem(error.message||'Invalid design.');}
   const reference=await readImage(form.get('reference'),'Reference photo'),fabric=await readImage(form.get('fabric'),'Fabric photo');
   if(design.source==='reference'&&!reference)throw new Problem('Add a reference photo, or start from a shape.');
   const designHash=await digest(canonical(design)),fingerprint=await digest(canonical({design,referenceHash:reference?.hash||null,fabricHash:fabric?.hash||null}));
   const existing=await find(user.userId,requestKey);if(existing){if(existing.fingerprint!==fingerprint)return json({error:'This approval reference belongs to another design version. Review and submit the changed design as a new version.'},409);return json(receipt(existing));}
   const count=await db.prepare('SELECT COUNT(*) AS total FROM design_approvals WHERE owner_id = ? AND created_at >= ?').bind(user.userId,now().slice(0,10)+'T00:00:00.000Z').first();if(count.total>=30)throw new Problem('You have reached today’s design submission limit. Please try again tomorrow.',429);
   const ownerHash=await digest(user.userId),root=`design-approvals/${ownerHash}/${draftId}/${requestKey}`,referenceKey=reference?`${root}/reference-${reference.hash}`:null,fabricKey=fabric?`${root}/fabric-${fabric.hash}`:null,stored=[];
   try{
    if(reference){await bucket.put(referenceKey,reference.bytes,{httpMetadata:{contentType:reference.type}});stored.push(referenceKey);}
    if(fabric){await bucket.put(fabricKey,fabric.bytes,{httpMetadata:{contentType:fabric.type}});stored.push(fabricKey);}
    const id=crypto.randomUUID(),created=now();
    await db.prepare(`INSERT INTO design_approvals (id,owner_id,draft_id,version,idempotency_key,payload_json,design_hash,fingerprint,reference_key,reference_type,reference_hash,fabric_key,fabric_type,fabric_hash,approved_name,approval_text_version,approval_text,created_at) SELECT ?,?,?,COALESCE(MAX(version),0)+1,?,?,?,?,?,?,?,?,?,?,?,?,?,? FROM design_approvals WHERE owner_id = ? AND draft_id = ?`).bind(id,user.userId,draftId,requestKey,canonical(design),designHash,fingerprint,referenceKey,reference?.type||null,reference?.hash||null,fabricKey,fabric?.type||null,fabric?.hash||null,user.displayName||user.email,APPROVAL_TEXT_VERSION,APPROVAL_TEXT,created,user.userId,draftId).run();
    return json(receipt(await find(user.userId,requestKey)),201);
   }catch(error){
    const raced=await find(user.userId,requestKey);if(raced&&raced.fingerprint===fingerprint)return json(receipt(raced));
    for(const key of stored){if(!raced||![raced.reference_key,raced.fabric_key].includes(key))try{await bucket.delete(key);}catch{}}
    if(raced)return json({error:'This design reference was used for another version. Review and approve again.'},409);throw error;
   }
  }catch(error){return json({error:error instanceof Problem?error.message:'Could not store your approval. No confirmation has been issued. Please try again.'},error instanceof Problem?error.status:500);}
 }
 return {handle};
}
