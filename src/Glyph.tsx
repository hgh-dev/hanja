import {useEffect,useState} from 'react';
import HanziWriter from 'hanzi-writer';
import catalog from './data.json';
type GlyphData={strokes:string[]};
const supported=new Set(catalog.filter(c=>c.strokes).map(c=>c.id));
const requests=new Map<string,Promise<GlyphData|null>>();
function load(character:string){
  if(!supported.has(character))return Promise.resolve(null);
  if(!requests.has(character))requests.set(character,fetch(`${import.meta.env.BASE_URL}strokes/${character}.json`).then(r=>{if(!r.ok)throw Error();return r.json();}).then(d=>Array.isArray(d.strokes)?d:null).catch(()=>{requests.delete(character);return null;}));
  return requests.get(character)!;
}
export function GlyphPaths({character,size=400}:{character:string;size?:number}){
  const [result,setResult]=useState<{character:string;data:GlyphData|null}>();
  useEffect(()=>{let live=true;void load(character).then(data=>{if(live)setResult({character,data});});return()=>{live=false;};},[character]);
  if(!character)return null;
  const data=result?.character===character?result.data:null;
  return data?<g transform={HanziWriter.getScalingTransform(size,size,size/16).transform} data-glyph-paths={character}>{data.strokes.map((d,i)=><path key={i} d={d}/>)}</g>:<text x={size/2} y={size*.7875} textAnchor="middle" fontSize={size*.75} fontFamily="serif">{character}</text>;
}
export default function Glyph({character}:{character:string}){
  return <svg className="hanja-glyph" viewBox="0 0 400 400" role="img" aria-label={character} fill="currentColor"><GlyphPaths character={character}/></svg>;
}
