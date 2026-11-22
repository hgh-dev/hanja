import {rows} from '../src/catalog.mjs';
import {readFileSync,writeFileSync,copyFileSync,existsSync} from 'node:fs';
const catalog=rows.map(r=>{const path=`node_modules/hanzi-writer-data/${r.character}.json`;if(!existsSync(path))return {...r,strokes:null};const d=JSON.parse(readFileSync(path));copyFileSync(path,`public/strokes/${r.character}.json`);return {...r,strokes:d.strokes.length};});
writeFileSync('src/data.json',JSON.stringify(catalog,null,2));
copyFileSync('node_modules/hanzi-writer-data/ARPHICPL.TXT','public/STROKE-LICENSE.txt');
