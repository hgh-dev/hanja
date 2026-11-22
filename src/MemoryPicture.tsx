import {memory} from './memory.mjs';
export default function MemoryPicture({character}:{character:string}){
  const [picture,caption]=(memory as Record<string,string[]>)[character]??['❔','기억 그림 준비 중'];
  const numbers='一二三四五六七八九十';
  const isNumber=numbers.includes(character);
  return <section className="memory-picture" aria-label={`${character} 기억 그림`}><div className="memory-art" aria-hidden="true">{isNumber?<div className="count-dots">{Array.from({length:numbers.indexOf(character)+1},(_,i)=><span key={i}/>)}</div>:picture}</div><div className="memory-copy"><strong>그림으로 기억해요</strong><span>{caption}</span><small>뜻을 떠올리는 그림이에요.</small></div></section>;
}
