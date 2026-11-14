import {spawnSync} from 'node:child_process';
import {writeFileSync,mkdirSync,existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const root=path.dirname(fileURLToPath(import.meta.url));
mkdirSync(path.join(root,'work'),{recursive:true});
const fps=24,width=1080,height=1920;
const serif='C\\:/Windows/Fonts/georgia.ttf';
const sans='C\\:/Windows/Fonts/segoeui.ttf';
const bold='C\\:/Windows/Fonts/segoeuib.ttf';
const scenes=[
 {file:'01-human-memory.png',label:'A FAVOURITE SHIRT',copy:'Some things hold\nmore than memories.',footer:'For the people we love.'},
 {file:'02-pet-memory.png',label:'A LITTLE BANDANA. A FAMILIAR BLANKET.',copy:'For the love\nthat stays with us.',footer:'And the companions who became family.'},
 {file:'03-careful-craft.png',label:'FABRIC KEEPSAKES, CAREFULLY REIMAGINED',copy:'A new shape.\nThe same story.',footer:'Clothes and suitable fabric belongings, made into a bag.'},
 {file:'04-keepsake-bag.png',label:'SOMETHING OF THEIRS. SOMETHING FOR YOU.',copy:'Made from memories.\nCarried with love.',footer:'A personal keepsake for your everyday.'}
];
function run(args){const r=spawnSync('ffmpeg',['-hide_banner','-loglevel','warning','-y',...args],{cwd:root,stdio:'inherit'});if(r.status!==0)throw Error(`FFmpeg failed (${r.status})`);}
function saveText(file,text){writeFileSync(path.join(root,'work',file),text,'utf8');return `work/${file}`;}
function text(file,{font=sans,size=34,y=100,x='(w-text_w)/2',colour='0x263c2e',alpha='1',spacing=16}={}){return `drawtext=fontfile='${font}':textfile='${file}':fontsize=${size}:fontcolor=${colour}:x=${x}:y=${y}:line_spacing=${spacing}:alpha='${alpha}'`;}
const fade="if(lt(t,0.4),0,if(lt(t,1.15),(t-0.4)/0.75,1))";
for(let i=0;i<scenes.length;i++){
 const s=scenes[i],file=path.join(root,'assets',s.file);if(!existsSync(file))throw Error(`Missing image: ${s.file}`);
 const headline=saveText(`scene-${i}-headline.txt`,s.copy),label=saveText(`scene-${i}-label.txt`,s.label),footer=saveText(`scene-${i}-footer.txt`,s.footer);
 const filter=[
  `scale=2160:3840:force_original_aspect_ratio=increase,crop=2160:3840`,
  `zoompan=z='1.015+0.045*on/161':x='iw/2-iw/zoom/2':y='ih/2-ih/zoom/2':d=162:s=${width}x${height}:fps=${fps}`,
  'setsar=1,format=yuv420p',
  'drawbox=x=0:y=0:w=1080:h=475:color=0xf8f5ec@0.78:t=fill',
  'drawbox=x=0:y=1760:w=1080:h=160:color=0xf8f5ec@0.93:t=fill',
  text(label,{font:bold,size:21,y:116,x:83,alpha:fade}),
  text(headline,{font:serif,size:i===3?64:70,y:195,x:80,alpha:fade,spacing:17}),
  text(footer,{size:i===2?28:31,y:1814}),
  ...(i===0?['fade=t=in:st=0:d=0.8']:[])
 ].join(',');
 run(['-i',file,'-vf',filter,'-frames:v','162','-an','-c:v','libx264','-preset','fast','-crf','18','-pix_fmt','yuv420p',`work/scene-${i}.mp4`]);
 console.log(`Rendered scene ${i+1}/4`);
}
const brand=saveText('brand.txt','rebag');
const tagline=saveText('tagline.txt','Keep a little\nof them close.');
const description=saveText('description.txt','Handbags made from treasured clothes\nand suitable fabric keepsakes.');
const cta=saveText('cta.txt','Message us about pre-orders');
const detail=saveText('detail.txt','For the people and pets we carry in our hearts.');
const note=saveText('concept-note.txt','Concept visuals · Every fabric needs a suitability review.');
const endFilter=[
 'drawbox=x=82:y=222:w=916:h=2:color=0xa5af92:t=fill',
 text(brand,{font:bold,size:135,y:338}),
 text(tagline,{font:serif,size:87,y:615,spacing:24}),
 text(description,{size:34,y:916,spacing:16}),
 'drawbox=x=95:y=1175:w=890:h=125:color=0x304a36:t=fill',
 text(cta,{font:bold,size:36,y:1215,colour:'0xfff9ec'}),
 text(detail,{font:serif,size:29,y:1445}),
 'drawbox=x=82:y=1652:w=916:h=2:color=0xa5af92:t=fill',
 text(note,{size:23,y:1730})
].join(',');
run(['-f','lavfi','-i',`color=c=0xf8f5ec:s=${width}x${height}:r=${fps}:d=6`,'-vf',endFilter,'-an','-c:v','libx264','-preset','fast','-crf','18','-pix_fmt','yuv420p','work/end-card.mp4']);

// A short original, generative ambient composition. No stock music or borrowed melody.
const sampleRate=48000,seconds=30,length=sampleRate*seconds;
const signal=new Float64Array(length),notes=[];
const frequency=n=>440*Math.pow(2,(n-69)/12);
const chords=[[48,55,59,64],[45,52,55,60],[41,48,52,57],[43,50,55,60],[48,55,59,64]];
for(let bar=0;bar<5;bar++){
 const chord=chords[bar];
 chord.forEach((midi,i)=>notes.push({time:bar*6+i*.32,midi,duration:6.5,level:.11}));
 [0,2,1,3].forEach((p,i)=>notes.push({time:bar*6+1.5+i*1.1,midi:chord[p]+12,duration:3.4,level:.065}));
}
for(const n of notes){const start=Math.floor(n.time*sampleRate),duration=Math.floor(n.duration*sampleRate),f=frequency(n.midi);for(let j=0;j<duration&&start+j<length;j++){const t=j/sampleRate,attack=1-Math.exp(-t*32),decay=Math.exp(-t/1.9),release=Math.min(1,(n.duration-t)/.7);const fundamental=Math.sin(2*Math.PI*f*t),overtones=.18*Math.sin(2*Math.PI*f*2*t)+.05*Math.sin(2*Math.PI*f*3*t);signal[start+j]+=n.level*attack*decay*release*(fundamental+overtones);}}
let peak=0;for(const s of signal)peak=Math.max(peak,Math.abs(s));
const wav=Buffer.alloc(44+length*2);wav.write('RIFF',0);wav.writeUInt32LE(wav.length-8,4);wav.write('WAVEfmt ',8);wav.writeUInt32LE(16,16);wav.writeUInt16LE(1,20);wav.writeUInt16LE(1,22);wav.writeUInt32LE(sampleRate,24);wav.writeUInt32LE(sampleRate*2,28);wav.writeUInt16LE(2,32);wav.writeUInt16LE(16,34);wav.write('data',36);wav.writeUInt32LE(length*2,40);
for(let i=0;i<length;i++){const t=i/sampleRate,envelope=Math.min(1,t/1.2,(seconds-t)/2.4);wav.writeInt16LE(Math.round(signal[i]/peak*.42*envelope*32767),44+i*2);}
writeFileSync(path.join(root,'assets','original-ambient-score.wav'),wav);
const inputs=[];for(let i=0;i<4;i++)inputs.push('-i',`work/scene-${i}.mp4`);inputs.push('-i','work/end-card.mp4','-i','assets/original-ambient-score.wav');
const transitions='[0:v][1:v]xfade=transition=fade:duration=0.75:offset=6[v1];[v1][2:v]xfade=transition=fade:duration=0.75:offset=12[v2];[v2][3:v]xfade=transition=fade:duration=0.75:offset=18[v3];[v3][4:v]xfade=transition=fade:duration=0.75:offset=24,fade=t=out:st=29.2:d=0.8[v];[5:a]loudnorm=I=-21:TP=-2:LRA=8,afade=t=out:st=27.5:d=2.5[a]';
run([...inputs,'-filter_complex_threads','2','-filter_complex',transitions,'-map','[v]','-map','[a]','-t','30','-r','24','-c:v','libx264','-preset','fast','-crf','18','-pix_fmt','yuv420p','-c:a','aac','-ar','48000','-ac','2','-b:a','192k','-movflags','+faststart','rebag-made-from-memories-portrait.mp4']);
console.log('Finished: rebag-made-from-memories-portrait.mp4');
