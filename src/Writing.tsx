import {PencilSound} from './pencilSound';
import {useSettings} from './settings';
import {useEffect} from 'react';
import {GlyphPaths} from './Glyph';
import {useId,useRef,useState} from 'react';
import {brushPenPath} from './brushPen.mjs';
type Point=[number,number,number];
type Stroke={points:Point[];erase:boolean};
export default function Writing({guide='',eraseMode,showTools=true}:{guide?:string;eraseMode?:boolean;showTools?:boolean}){
  const {sound:audible}=useSettings();
  const pencil=useRef(new PencilSound());
  useEffect(()=>()=>pencil.current.dispose(),[]);
  useEffect(()=>{if(!audible)pencil.current.stop();},[audible]);
  const maskPrefix=useId().replace(/:/g,'');
  const pathFor=(s:Stroke)=>s.points.map((p,j)=>`${j?'L':'M'}${p[0]} ${p[1]}`).join(' ')+(s.points.length===1?'l0.1 0':'');
  const [lines,setLines]=useState<Stroke[]>([]);
  const [localErase,setErase]=useState(false);
  const erase=eraseMode??localErase;
  const active=useRef<number|null>(null);
  const svg=useRef<SVGSVGElement>(null);
  function point(e:PointerEvent | React.PointerEvent):Point{
    const r=svg.current!.getBoundingClientRect();
    return [(e.clientX-r.left)*400/r.width,(e.clientY-r.top)*400/r.height,e.timeStamp];
  }
  return <div><div className="writing"><svg ref={svg} viewBox="0 0 400 400" aria-label="손가락이나 펜으로 한자를 쓰는 공간" onPointerDown={e=>{
    if(active.current!==null)return;
    active.current=e.pointerId;
    if(!erase&&audible){pencil.current.unlock();pencil.current.start();}
    e.currentTarget.setPointerCapture(e.pointerId);
    setLines(l=>[...l,{points:[point(e)],erase}]);
  }} onPointerMove={e=>{
    if(active.current!==e.pointerId)return;
    const incoming=(e.nativeEvent.getCoalescedEvents?.()??[e.nativeEvent]).map(point);
    setLines(l=>l.map((s,i)=>{if(i!==l.length-1)return s;const points=[...s.points];for(const p of incoming){const last=points.at(-1)!;if(Math.hypot(p[0]-last[0],p[1]-last[1])>0.15)points.push(p);}return {...s,points};}));
  }} onPointerUp={()=>{active.current=null;pencil.current.stop();}} onPointerCancel={()=>{active.current=null;pencil.current.stop();}} onLostPointerCapture={()=>{active.current=null;pencil.current.stop()} }>
    <path d="M200 0V400M0 200H400M0 0L400 400M400 0L0 400" stroke="#e7e3d9" strokeDasharray="6 8"/>
    <g data-guide={guide} fill="#e1dfd6" pointerEvents="none"><GlyphPaths character={guide}/></g>
    <defs>{lines.map((s,i)=>!s.erase&&lines.slice(i+1).some(line=>line.erase)?<mask key={i} id={`${maskPrefix}-${i}`} maskUnits="userSpaceOnUse" x="0" y="0" width="400" height="400"><rect width="400" height="400" fill="white"/>{lines.slice(i+1).map((later,j)=>later.erase?<path key={j} d={pathFor(later)} fill="none" stroke="black" strokeWidth="25" strokeLinecap="round" strokeLinejoin="round"/>:null)}</mask>:null)}</defs>
    {/* Only later eraser strokes mask this ink. The guide and new ink stay intact. */}
    <g data-ink="true">{lines.map((s,i)=>!s.erase?<path key={i} d={brushPenPath(s.points)} fill="#292e2b" mask={lines.slice(i+1).some(line=>line.erase)?`url(#${maskPrefix}-${i})`:undefined}/>:null)}</g>
  </svg></div>{showTools&&<div className="tools"><button className={!erase?'selected':''} onClick={()=>setErase(false)}>✎ 펜</button><button className={erase?'selected':''} onClick={()=>setErase(true)}>지우개</button><button onClick={()=>setLines([])}>모두 지우기</button></div>}</div>;
}
