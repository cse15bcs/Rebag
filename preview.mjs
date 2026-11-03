import http from 'node:http';
import {readFile} from 'node:fs/promises';
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8'};
const files={'/':'index.html','/index.html':'index.html','/style.css':'style.css','/app.js':'app.js','/rewards.js':'rewards.js'};
http.createServer(async(req,res)=>{const pathname=new URL(req.url,'http://localhost').pathname;const file=files[pathname];if(!file){res.writeHead(404);res.end('Not found');return;}try{const body=await readFile(new URL('./dist/'+file,import.meta.url));res.writeHead(200,{'Content-Type':types[file.slice(file.lastIndexOf('.'))],'Cache-Control':'no-store'});res.end(body);}catch{res.writeHead(500);res.end('Preview unavailable');}}).listen(4173,'127.0.0.1',()=>console.log('Local: http://127.0.0.1:4173'));
