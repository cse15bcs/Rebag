import {readFileSync,writeFileSync} from 'node:fs';
const source=readFileSync(new URL('../public/design-one.html',import.meta.url),'utf8');
const head=source.match(/<head>([\s\S]*?)<\/head>/)?.[1];
const start=source.indexOf('<dialog id="studio"'),end=source.lastIndexOf('</body>');
if(!head||start<0||end<start)throw Error('Shared Rebag studio markup is missing.');
const themedHead=head.replace(/<title>.*?<\/title>/,'<title>Rebag Atelier — Design 02</title>')
 .replace('</head>','')+'\n<link rel="stylesheet" href="design-two.css">\n<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&display=swap" rel="stylesheet">\n';
const template=readFileSync(new URL('../templates/design-two.html',import.meta.url),'utf8');
writeFileSync(new URL('../public/design-two.html',import.meta.url),template.replace('<!-- SHARED_HEAD -->',themedHead).replace('<!-- SHARED_DIALOGS -->',source.slice(start,end)));
