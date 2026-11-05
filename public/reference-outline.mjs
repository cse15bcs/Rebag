const round=n=>Math.round(n*10)/10;
export function polygonArea(points){return points.reduce((sum,p,i)=>{const q=points[(i+1)%points.length];return sum+p[0]*q[1]-q[0]*p[1];},0)/2;}
export function outlineBounds(paths){const points=paths.filter(p=>p.kind==='outer').flatMap(p=>p.points);if(!points.length)return null;return {left:Math.min(...points.map(p=>p[0])),top:Math.min(...points.map(p=>p[1])),right:Math.max(...points.map(p=>p[0])),bottom:Math.max(...points.map(p=>p[1]))};}
export function pointInPolygon(point,polygon){let inside=false;for(let i=0,j=polygon.length-1;i<polygon.length;j=i++){const a=polygon[i],b=polygon[j];if((a[1]>point[1])!==(b[1]>point[1])&&point[0]<(b[0]-a[0])*(point[1]-a[1])/(b[1]-a[1])+a[0])inside=!inside;}return inside;}
function lineDistance(p,a,b){const dx=b[0]-a[0],dy=b[1]-a[1],length=dx*dx+dy*dy,t=length?Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/length)):0;return (p[0]-a[0]-t*dx)**2+(p[1]-a[1]-t*dy)**2;}
function simplify(points,epsilon){if(points.length<3)return points;const keep=new Set([0,points.length-1]),stack=[[0,points.length-1]];while(stack.length){const [a,b]=stack.pop();let index=-1,max=epsilon*epsilon;for(let i=a+1;i<b;i++){const d=lineDistance(points[i],points[a],points[b]);if(d>max){max=d;index=i;}}if(index!==-1){keep.add(index);stack.push([a,index],[index,b]);}}return [...keep].sort((a,b)=>a-b).map(i=>points[i]);}
function simplifyClosed(points,epsilon=1.2){if(points.length<5)return points;let far=1;for(let i=2;i<points.length;i++)if((points[i][0]-points[0][0])**2+(points[i][1]-points[0][1])**2>(points[far][0]-points[0][0])**2+(points[far][1]-points[0][1])**2)far=i;let result=[...simplify(points.slice(0,far+1),epsilon).slice(0,-1),...simplify([...points.slice(far),points[0]],epsilon).slice(0,-1)];if(result.length>300)return simplifyClosed(points,epsilon*1.5);return result;}
function largestComponent(mask,width,height){const seen=new Uint8Array(mask.length),queue=new Int32Array(mask.length);let best=[];for(let start=0;start<mask.length;start++){if(!mask[start]||seen[start])continue;let head=0,tail=0;queue[tail++]=start;seen[start]=1;while(head<tail){const at=queue[head++],x=at%width,y=Math.floor(at/width);for(const next of [x?at-1:-1,x<width-1?at+1:-1,y?at-width:-1,y<height-1?at+width:-1])if(next>=0&&mask[next]&&!seen[next]){seen[next]=1;queue[tail++]=next;}}if(tail>best.length)best=Array.from(queue.subarray(0,tail));}const result=new Uint8Array(mask.length);for(const at of best)result[at]=1;return {mask:result,count:best.length};}
export function traceMask(input,width,height,{imageAspect=width/height,region={left:0,top:0,right:1000,bottom:1000},sourceHash='',smoothing=1.2}={}){
 if(input.length!==width*height||width<2||height<2)throw Error('Invalid image mask.');
 const {mask,count}=largestComponent(input,width,height);if(count<Math.max(8,width*height*.005))throw Error('No clear bag outline found. Crop closer or draw around the bag.');
 const stride=width+1,edges=[],outgoing=new Map();
 const edge=(ax,ay,bx,by,dir)=>{const e={a:ay*stride+ax,b:by*stride+bx,dir,used:false};edges.push(e);if(!outgoing.has(e.a))outgoing.set(e.a,[]);outgoing.get(e.a).push(e);};
 for(let y=0;y<height;y++)for(let x=0;x<width;x++){const at=y*width+x;if(!mask[at])continue;if(!y||!mask[at-width])edge(x,y,x+1,y,0);if(x===width-1||!mask[at+1])edge(x+1,y,x+1,y+1,1);if(y===height-1||!mask[at+width])edge(x+1,y+1,x,y+1,2);if(!x||!mask[at-1])edge(x,y+1,x,y,3);}
 const loops=[];for(const first of edges){if(first.used)continue;let current=first,points=[],closed=false;for(let steps=0;steps<=edges.length;steps++){current.used=true;points.push([current.a%stride,Math.floor(current.a/stride)]);if(current.b===first.a){closed=true;break;}const next=(outgoing.get(current.b)||[]).filter(e=>!e.used).sort((a,b)=>{const rank=e=>({1:0,0:1,3:2,2:3})[(e.dir-current.dir+4)%4];return rank(a)-rank(b);})[0];if(!next)break;current=next;}if(closed&&points.length>=3)loops.push(points);}
 loops.sort((a,b)=>Math.abs(polygonArea(b))-Math.abs(polygonArea(a)));if(!loops.length)throw Error('The outline is incomplete. Draw the bag boundary manually.');
 const outer=loops[0],raw=[{kind:'outer',points:outer},...loops.slice(1).filter(p=>Math.abs(polygonArea(p))>Math.max(12,count*.002)&&pointInPolygon(p[0],outer)).slice(0,4).map(points=>({kind:'hole',points}))];
 const paths=raw.map(p=>({kind:p.kind,points:simplifyClosed(p.points,smoothing).map(([x,y])=>[round(region.left+(x/width)*(region.right-region.left)),round(region.top+(y/height)*(region.bottom-region.top))])}));
 const bounds=outlineBounds(paths),touchesEdge=bounds.left<=region.left+1||bounds.top<=region.top+1||bounds.right>=region.right-1||bounds.bottom>=region.bottom-1;
 return {version:1,paths,imageAspect:round(imageAspect*1000)/1000,sourceHash,method:'foreground-contour',reviewed:false,region,warning:touchesEdge||count>width*height*.9?'The object touches the crop edge or fills most of it. Check that the outline follows only the bag.':''};
}
export function extractOutline(rgba,width,height,options={}){
 if(rgba.length!==width*height*4)throw Error('Invalid image pixels.');const threshold=options.threshold??28,mask=new Uint8Array(width*height);let transparent=0;for(let i=3;i<rgba.length;i+=4)if(rgba[i]<32)transparent++;
 if(transparent>width*height*.01){for(let i=0;i<mask.length;i++)mask[i]=rgba[i*4+3]>=128?1:0;return traceMask(mask,width,height,options);}
 const histogram=new Map();function sample(x,y){const i=(y*width+x)*4,key=((rgba[i]>>5)<<6)|((rgba[i+1]>>5)<<3)|(rgba[i+2]>>5);let bin=histogram.get(key);if(!bin){bin={count:0,r:0,g:0,b:0};histogram.set(key,bin);}bin.count++;bin.r+=rgba[i];bin.g+=rgba[i+1];bin.b+=rgba[i+2];}
 for(let x=0;x<width;x++){sample(x,0);sample(x,height-1);}for(let y=1;y<height-1;y++){sample(0,y);sample(width-1,y);}
 const bins=[...histogram.values()].sort((a,b)=>b.count-a.count),minimum=(width*2+height*2)*.055,background=bins.filter((b,i)=>i===0||b.count>=minimum).slice(0,5).map(b=>[b.r/b.count,b.g/b.count,b.b/b.count]);
 const isBackground=index=>{const i=index*4;return rgba[i+3]<32||background.some(c=>(rgba[i]-c[0])**2+(rgba[i+1]-c[1])**2+(rgba[i+2]-c[2])**2<=threshold*threshold);};
 const seen=new Uint8Array(mask.length),queue=new Int32Array(mask.length);let head=0,tail=0;function add(i){if(!seen[i]&&isBackground(i)){seen[i]=1;queue[tail++]=i;}}
 for(let x=0;x<width;x++){add(x);add((height-1)*width+x);}for(let y=0;y<height;y++){add(y*width);add(y*width+width-1);}
 while(head<tail){const at=queue[head++],x=at%width,y=Math.floor(at/width);if(x)add(at-1);if(x<width-1)add(at+1);if(y)add(at-width);if(y<height-1)add(at+width);}
 for(let i=0;i<mask.length;i++)mask[i]=seen[i]?0:1;
 // Keep enclosed fabric colours in the silhouette. Only substantial enclosed
 // background regions near the top are candidates for handle openings.
 const silhouette=traceMask(mask,width,height,options),b=outlineBounds(silhouette.paths),r=options.region||{left:0,top:0,right:1000,bottom:1000};
 const top=(b.top-r.top)/(r.bottom-r.top)*height,bottom=(b.bottom-r.top)/(r.bottom-r.top)*height;
 const candidates=new Uint8Array(mask.length);for(let i=0;i<mask.length;i++)candidates[i]=mask[i]&&isBackground(i)?1:0;
 const visited=new Uint8Array(mask.length);for(let start=0;start<candidates.length;start++){if(!candidates[start]||visited[start])continue;let h=0,t=0,sumY=0;queue[t++]=start;visited[start]=1;while(h<t){const at=queue[h++],x=at%width,y=Math.floor(at/width);sumY+=y;for(const next of [x?at-1:-1,x<width-1?at+1:-1,y?at-width:-1,y<height-1?at+width:-1])if(next>=0&&candidates[next]&&!visited[next]){visited[next]=1;queue[t++]=next;}}
  if(t>=Math.max(12,width*height*.008)&&sumY/t<top+(bottom-top)*.48)for(let i=0;i<t;i++)mask[queue[i]]=0;
 }
 return traceMask(mask,width,height,options);
}
export function validateOutline(raw,{allowUnreviewed=false}={}){
 if(!raw||raw.version!==1||!Array.isArray(raw.paths)||raw.paths.length<1||raw.paths.length>12)throw Error('Extract or trace the bag outline first.');
 if(!allowUnreviewed&&raw.reviewed!==true)throw Error('Review and confirm the photo outline before approval.');
 if(typeof raw.sourceHash!=='string'||!/^[a-f0-9]{64}$/.test(raw.sourceHash))throw Error('The outline must be linked to the current reference photo.');
 const imageAspect=Number(raw.imageAspect);if(!Number.isFinite(imageAspect)||imageAspect<.1||imageAspect>10)throw Error('Invalid reference image proportions.');let total=0;
 const paths=raw.paths.map(p=>{if(!['outer','hole','detail'].includes(p?.kind)||!Array.isArray(p.points)||p.points.length<(p.kind==='detail'?2:3)||p.points.length>(p.kind==='outer'?500:160))throw Error('Invalid outline path.');total+=p.points.length;return {kind:p.kind,points:p.points.map(point=>{if(!Array.isArray(point)||point.length!==2||point.some(n=>typeof n!=='number'||!Number.isFinite(n)||n<0||n>1000))throw Error('Outline points must stay inside the photo.');return point.map(round);})};});
 if(total>1600||paths.filter(p=>p.kind==='outer').length!==1)throw Error('Use one bag outline with at most 1600 total points.');const outer=paths.find(p=>p.kind==='outer');if(Math.abs(polygonArea(outer.points))<1000)throw Error('The bag outline is too small or incomplete.');
 const bounds=outlineBounds(paths);if(bounds.right-bounds.left<5||bounds.bottom-bounds.top<5)throw Error('The bag outline is incomplete.');
 return {version:1,paths,imageAspect,sourceHash:raw.sourceHash,method:['foreground-contour','manual-trace','edited'].includes(raw.method)?raw.method:'edited',reviewed:raw.reviewed===true};
}
export function referencePath(geometry,{x=70,y=90,width=360,height=330}={}){const b=outlineBounds(geometry.paths),bw=b.right-b.left,bh=b.bottom-b.top;return geometry.paths.map(p=>({kind:p.kind,d:p.points.map(([px,py],i)=>`${i?'L':'M'}${round(x+(px-b.left)/bw*width)} ${round(y+(py-b.top)/bh*height)}`).join(' ')+(p.kind==='detail'?'':' Z')}));}
