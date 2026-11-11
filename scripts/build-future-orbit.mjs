import {readFileSync,writeFileSync} from 'node:fs';
const source=readFileSync(new URL('../public/future-studio.html',import.meta.url),'utf8');
const illustration=source.match(/<svg id="future-bag"[\s\S]*?<\/svg>/)?.[0];
if(!illustration)throw Error('Shared future bag illustration is missing.');
const template=readFileSync(new URL('../templates/future-orbit.html',import.meta.url),'utf8');
const output=template.replace('<!-- BAG_ILLUSTRATION -->',illustration);
writeFileSync(new URL('../public/future-orbit.html',import.meta.url),output);
writeFileSync(new URL('../public/index.html',import.meta.url),output);
