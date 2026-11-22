import {GlyphPaths} from './Glyph';
import {useId,useRef,useState} from 'react';
type Stroke={points:[number,number][];erase:boolean};
export default function Writing({guide=''}:{guide?:string}){
  const maskPrefix=useId().replace(/:/g,'');
  const pathFor=(s:Stroke)=>s.points.map((p,j)=>`${j?'L':'M'}${p.join(' ')}`).join(' ')+(s.points.length===1?'l0.1 0':'');
  const [lines,setLines]=useState<Stroke[]>([]);
  const [erase,setErase]=useState(false);
  const active=useRef<number|null>(null);
  const svg=useRef<SVGSVGElement>(null);
  function point(e:React.PointerEvent):[number,number]{
    const r=svg.current!.getBoundingClientRect();
    return [(e.clientX-r.left)*400/r.width,(e.clientY-r.top)*400/r.height];
  }
  return <div><div className="writing"><svg ref={svg} viewBox="0 0 400 400" aria-label="손가락이나 펜으로 한자를 쓰는 공간" onPointerDown={e=>{
    if(active.current!==null)return;
    active.current=e.pointerId;
    e.currentTarget.setPointerCapture(e.pointerId);
    setLines(l=>[...l,{points:[point(e)],erase}]);
  }} onPointerMove={e=>{
    if(active.current!==e.pointerId)return;
    const p=point(e);
    setLines(l=>l.map((s,i)=>i===l.length-1?{...s,points:[...s.points,p]}:s));
  }} onPointerUp={()=>{active.current=null;}} onPointerCancel={()=>{active.current=null;}}>
    <path d="M200 0V400M0 200H400M0 0L400 400M400 0L0 400" stroke="#e7e3d9" strokeDasharray="6 8"/>
    <g data-guide={guide} fill="#e1dfd6" pointerEvents="none"><GlyphPaths character={guide}/></g>
    <defs>{lines.map((s,i)=>!s.erase&&lines.slice(i+1).some(line=>line.erase)?<mask key={i} id={`${maskPrefix}-${i}`} maskUnits="userSpaceOnUse" x="0" y="0" width="400" height="400"><rect width="400" height="400" fill="white"/>{lines.slice(i+1).map((later,j)=>later.erase?<path key={j} d={pathFor(later)} fill="none" stroke="black" strokeWidth="25" strokeLinecap="round" strokeLinejoin="round"/>:null)}</mask>:null)}</defs>
    {/* Only later eraser strokes mask this ink. The guide and new ink stay intact. */}
    <g data-ink="true">{lines.map((s,i)=>!s.erase?<path key={i} d={pathFor(s)} fill="none" stroke="#292e2b" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" mask={lines.slice(i+1).some(line=>line.erase)?`url(#${maskPrefix}-${i})`:undefined}/>:null)}</g>
  </svg></div><div className="tools"><button className={!erase?'selected':''} onClick={()=>setErase(false)}>✎ 펜</button><button className={erase?'selected':''} onClick={()=>setErase(true)}>지우개</button><button onClick={()=>setLines([])}>모두 지우기</button></div></div>;
}
