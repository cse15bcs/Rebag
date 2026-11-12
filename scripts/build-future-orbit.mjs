import {readFileSync,writeFileSync} from 'node:fs';
const source=readFileSync(new URL('../public/future-studio.html',import.meta.url),'utf8');
const illustration=source.match(/<svg id="future-bag"[\s\S]*?<\/svg>/)?.[0];
if(!illustration)throw Error('Shared future bag illustration is missing.');
const template=readFileSync(new URL('../templates/future-orbit.html',import.meta.url),'utf8');
const storefront=readFileSync(new URL('../public/design-one.html',import.meta.url),'utf8');
const assets=storefront.match(/<link rel="stylesheet" href="style\.css">[\s\S]*?<\/head>/)?.[0].replace('</head>','');
const dialogStart=storefront.indexOf('<dialog id="studio"'),dialogEnd=storefront.lastIndexOf('</body>');
if(!assets||dialogStart<0||dialogEnd<dialogStart)throw Error('Shared Rebag storefront assets or studio dialogs are missing.');
const output=template.replace('<!-- STOREFRONT_ASSETS -->',assets)
 .replace('<!-- BAG_ILLUSTRATION -->',illustration)
 .replace('<!-- STOREFRONT_DIALOGS -->',storefront.slice(dialogStart,dialogEnd));
writeFileSync(new URL('../public/future-orbit.html',import.meta.url),output);
writeFileSync(new URL('../public/index.html',import.meta.url),output);
