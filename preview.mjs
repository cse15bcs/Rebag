import http from 'node:http';
import {readFile,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {createPaymentService} from './server/payments.mjs';
await mkdir(new URL('./.local/',import.meta.url),{recursive:true});
const service=createPaymentService({database:fileURLToPath(new URL('./.local/payment-tests.sqlite',import.meta.url))});
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8'};
const files={'/':'index.html','/index.html':'index.html','/style.css':'style.css','/app.js':'app.js','/rewards.js':'rewards.js','/design.js':'design.js','/config.js':'config.js','/blueprint-core.mjs':'blueprint-core.mjs','/reference-outline.mjs':'reference-outline.mjs','/reference-editor.js':'reference-editor.js','/reference-design.css':'reference-design.css','/design-approval.js':'design-approval.js','/design-approval.css':'design-approval.css','/payment-entry.js':'payment-entry.js','/payment-test.html':'payment-test.html','/payment-test.js':'payment-test.js','/payment-test.css':'payment-test.css','/payment-core.mjs':'payment-core.mjs'};
const server=http.createServer(async(req,res)=>{
 const host=req.headers.host;if(!['127.0.0.1:4173','localhost:4173'].includes(host)){res.writeHead(400);res.end('Invalid host');return;}
 const url=new URL(req.url,'http://'+host);
 if(url.pathname.startsWith('/api/payments')){
  try{const chunks=[];let size=0;for await(const chunk of req){size+=chunk.length;if(size>32768){res.writeHead(413);res.end();return;}chunks.push(chunk);}
   const body=Buffer.concat(chunks),request=new Request(url,{method:req.method,headers:req.headers,...(req.method==='GET'?{}:{body})});
   const result=await service.handle(request);res.writeHead(result.status,Object.fromEntries(result.headers));res.end(Buffer.from(await result.arrayBuffer()));
  }catch{res.writeHead(500);res.end('Payment test unavailable');}return;
 }
 const file=files[url.pathname];if(!file){res.writeHead(404);res.end('Not found');return;}
 try{const body=await readFile(new URL('./public/'+file,import.meta.url));res.writeHead(200,{'Content-Type':types[file.slice(file.lastIndexOf('.'))],'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(body);}catch{res.writeHead(500);res.end('Preview unavailable');}
});
server.listen(4173,'127.0.0.1',()=>console.log('Local: http://127.0.0.1:4173 — payment mode: '+(process.env.YOUPI_MODE||'mock')));
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>server.close(()=>{service.close();process.exit(0);}));
