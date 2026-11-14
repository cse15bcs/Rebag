// Local-only runner for the separately installed mynkdev-21 UPI Gateway.
// Runtime binaries, upstream code, databases and credentials stay in ignored .local/.
import fs from 'node:fs';
import path from 'node:path';
import net from 'node:net';
import {fileURLToPath} from 'node:url';
import {spawn,execFileSync} from 'node:child_process';
import {randomUUID} from 'node:crypto';

const root=fileURLToPath(new URL('../',import.meta.url));
const runtime=path.join(root,'.local/upi-runtime');
const gateway=path.join(root,'.local/upi-gateway');
const php=path.join(root,'.local/tools/php/php.exe');
const database=path.join(root,'.local/tools/mariadb/mariadb-11.8.9-winx64/bin/mariadbd.exe');
const manifest=path.join(runtime,'processes.json');
const origin='http://127.0.0.1:8085';
const command=process.argv[2]||'status';
const read=()=>fs.existsSync(manifest)?JSON.parse(fs.readFileSync(manifest,'utf8')):{};
const alive=pid=>{try{process.kill(pid,0);return true;}catch{return false;}};
const portOpen=port=>new Promise(resolve=>{const socket=net.connect({host:'127.0.0.1',port});socket.setTimeout(500);socket.once('connect',()=>{socket.destroy();resolve(true);});socket.once('error',()=>resolve(false));socket.once('timeout',()=>{socket.destroy();resolve(false);});});
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function waitFor(port){for(let i=0;i<50;i++){if(await portOpen(port))return;await delay(200);}throw Error('Port '+port+' did not start; inspect .local/upi-runtime logs.');}
function launch(name,exe,args,cwd,processes){
 if(processes[name]&&alive(processes[name].pid))return;
 const log=fs.openSync(path.join(runtime,name+'.log'),'a');
 try{const child=spawn(exe,args,{cwd,detached:true,windowsHide:true,stdio:['ignore',log,log]});
 child.on('error',error=>console.error(name+': '+error.message));
 if(!child.pid)throw Error('Could not launch '+name);
 processes[name]={pid:child.pid,executable:exe,started:new Date().toISOString()};child.unref();
 fs.writeFileSync(manifest,JSON.stringify(processes,null,2));
 }finally{fs.closeSync(log);}
}
async function start(dbOnly=false){
 fs.mkdirSync(runtime,{recursive:true});
 if(!fs.existsSync(php)||!fs.existsSync(database)||!fs.existsSync(path.join(gateway,'vendor/autoload.php')))throw Error('The portable runtime and gateway installation are missing. See docs/upi-gateway-local.md.');
 const processes=read();
 if(await portOpen(3307)){if(!processes.database||!alive(processes.database.pid))throw Error('Port 3307 belongs to an untracked process.');}
 else{launch('database',database,['--defaults-file='+path.join(runtime,'my.ini')],runtime,processes);await waitFor(3307);}
 if(dbOnly)return;
 if(await portOpen(8085)){if(!processes.web||!alive(processes.web.pid))throw Error('Port 8085 belongs to an untracked process.');}
 else{launch('web',php,['-S','127.0.0.1:8085','-t',path.join(gateway,'public'),path.join(gateway,'vendor/laravel/framework/src/Illuminate/Foundation/resources/server.php')],path.join(gateway,'public'),processes);await waitFor(8085);}
 if(fs.existsSync(path.join(gateway,'storage/installed'))){
  launch('queue',php,['artisan','queue:work','--sleep=1','--tries=3','--timeout=30'],gateway,processes);
  launch('scheduler',php,['artisan','schedule:work'],gateway,processes);
 }
 console.log('UPI Gateway: '+origin+'/login');
 console.log('Local login details: '+path.join(runtime,'local-access.txt'));
 console.log('Create a sandbox checkout: node scripts/upi-gateway-local.mjs create-test');
}
async function stop(){
 const processes=read();
 for(const name of ['scheduler','queue','web','database']){
  const record=processes[name];if(!record||!alive(record.pid))continue;
  // Verify executable path and start time before terminating a recorded process tree.
  const info=JSON.parse(execFileSync('powershell.exe',['-NoProfile','-Command',`$entry=Get-CimInstance Win32_Process -Filter 'ProcessId = ${Number(record.pid)}'; [pscustomobject]@{ExecutablePath=$entry.ExecutablePath;CreationDate=$entry.CreationDate.ToUniversalTime().ToString('o')} | ConvertTo-Json -Compress`],{encoding:'utf8',windowsHide:true}));
  const actual=String(info.ExecutablePath||'').toLowerCase();
  if(actual!==record.executable.toLowerCase()||!Number.isFinite(Date.parse(info.CreationDate))||Math.abs(Date.parse(info.CreationDate)-Date.parse(record.started))>10000)throw Error('Process identity changed for '+name+'; leaving it running.');
  if(name==='database'){
   const shutdown='$c=json_decode(file_get_contents($argv[1]),true);$p=new PDO("mysql:host=127.0.0.1;port=3307","root",$c["database"]["rootPassword"]);$p->exec("SHUTDOWN");';
   execFileSync(php,['-r',shutdown,path.join(runtime,'credentials.json')],{windowsHide:true,stdio:'ignore'});
   for(let i=0;i<50&&alive(record.pid);i++)await delay(100);
   if(alive(record.pid))throw Error('Database shutdown is still in progress; leaving its process record intact.');
  }else execFileSync('taskkill.exe',['/PID',String(record.pid),'/T','/F'],{windowsHide:true,stdio:'ignore'});
  delete processes[name];fs.writeFileSync(manifest,JSON.stringify(processes,null,2));
 }
 console.log('Stopped the local gateway processes. Database files and test records are retained.');
}
async function createTest(){
 const config=JSON.parse(fs.readFileSync(path.join(runtime,'sandbox-api.json'),'utf8'));
 if(!config.key.startsWith('test_key_')||!config.secret.startsWith('test_sec_'))throw Error('Only Sandbox credentials are accepted by this runner.');
 const amount=process.argv[3]||'399.00';
 if(!/^\d{1,6}(?:\.\d{1,2})?$/.test(amount)||Number(amount)<1||Number(amount)>100000)throw Error('Use a test amount from 1 to 100000, with at most two decimal places.');
 const response=await fetch(origin+'/api/v1/orders',{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json','X-Api-Key':config.key,'X-Api-Secret':config.secret},body:JSON.stringify({amount,client_order_id:'REBAG_TEST_'+randomUUID().replaceAll('-',''),customer_name:'Rebag sandbox customer',note:'Local sandbox test - no real payment'})});
 const body=await response.json();if(!response.ok)throw Error('Sandbox order creation failed: HTTP '+response.status+' '+JSON.stringify(body.errors||body.message||''));
 const order=body.data,url=new URL(order.payment_url);
 if(order.environment!=='sandbox'||order.test!==true||url.origin!==origin||!url.pathname.startsWith('/sandbox/pay/'))throw Error('The gateway did not return a local Sandbox checkout.');
 fs.writeFileSync(path.join(runtime,'last-test.json'),JSON.stringify(order,null,2));
 console.log('SANDBOX ONLY - no real money.\n'+url.href);
}
try{
 if(command==='start')await start();
 else if(command==='db')await start(true);
 else if(command==='stop')await stop();
 else if(command==='create-test')await createTest();
 else if(command==='status')console.log(JSON.stringify({url:origin,database:await portOpen(3307),web:await portOpen(8085),processes:Object.fromEntries(Object.entries(read()).map(([name,value])=>[name,{pid:value.pid,running:alive(value.pid)}]))},null,2));
 else throw Error('Use start, stop, status or create-test [amount].');
}catch(error){console.error(error.message);process.exitCode=1;}
