import {useEffect,useRef,useState} from 'react';
import HanziWriter from 'hanzi-writer';
import {PencilSound} from './pencilSound';
import {useSettings,changeSetting} from './settings';
export default function Stroke({char}:{char:string}){
  const el=useRef<HTMLDivElement>(null);
  const writer=useRef<HanziWriter|null>(null);
  const sound=useRef(new PencilSound());
  const run=useRef(0);
  const strokeCount=useRef(0);
  const playing=useRef(false);
  const [status,setStatus]=useState('불러오는 중');
  const [busy,setBusy]=useState(false);
  const {sound:enabled}=useSettings();
  const enabledRef=useRef(enabled);
  useEffect(()=>{enabledRef.current=enabled;if(!enabled)sound.current.stop();},[enabled]);
  useEffect(()=>{
    let live=true;
    const controller=new AbortController();
    setStatus('불러오는 중');
    fetch(`${import.meta.env.BASE_URL}strokes/${char}.json`,{signal:controller.signal}).then(r=>{if(!r.ok)throw Error();return r.json();}).then(data=>{
      if(!live)return;
      strokeCount.current=data.strokes.length;
      writer.current=HanziWriter.create(el.current!,char,{width:240,height:240,padding:15,strokeColor:'#437c60',charDataLoader:()=>data});
      el.current?.querySelector('svg')?.setAttribute('viewBox','0 0 240 240');setStatus('');
    }).catch(()=>{if(live)setStatus('이 글자의 획순 자료는 준비 중이에요.');});
    const stopWhenHidden=()=>{
      if(document.hidden&&playing.current){
        run.current++;playing.current=false;sound.current.stop();
        void writer.current?.showCharacter({duration:0});setBusy(false);
      }
    };
    document.addEventListener('visibilitychange',stopWhenHidden);
    return ()=>{
      live=false;run.current++;playing.current=false;controller.abort();sound.current.dispose();
      void writer.current?.pauseAnimation();writer.current=null;el.current?.replaceChildren();
      document.removeEventListener('visibilitychange',stopWhenHidden);
    };
  },[char]);
  async function animate(){
    const current=writer.current;
    if(!current||playing.current)return;
    playing.current=true;setBusy(true);
    const token=++run.current;
    if(enabledRef.current)sound.current.unlock(); // Must originate in the user's tap.
    try{
      await current.hideCharacter({duration:150});
      for(let i=0;i<strokeCount.current;i++){
        if(run.current!==token)return;
        if(enabledRef.current)sound.current.start();
        try{await current.animateStroke(i);}finally{sound.current.stop();}
        if(run.current!==token)return;
        if(i<strokeCount.current-1)await new Promise(resolve=>setTimeout(resolve,1000));
      }
    }finally{
      if(run.current===token){sound.current.stop();playing.current=false;setBusy(false);}
    }
  }
  function toggleSound(){
    const next=!enabledRef.current;enabledRef.current=next;changeSetting('sound',next);
    if(next)sound.current.unlock();else sound.current.stop();
  }
  return <div className="stroke"><div className="stroke-canvas" ref={el}/>{status?<p>{status}</p>:<div className="stroke-controls"><button disabled={busy} onClick={()=>void animate()}>▶ 획순 보기 · 다시 보기</button><button className="stroke-sound" aria-pressed={enabled} onClick={toggleSound}>연필 소리 {enabled?'켜짐':'꺼짐'}</button></div>}<small>Hanzi Writer 중국 자형 자료 · 한국 표준 획순과 다를 수 있어요.</small></div>;
}
