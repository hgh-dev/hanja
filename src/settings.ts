import {useSyncExternalStore} from 'react';
type Settings={sound:boolean;canvas:boolean;questionCount:number|'all'};
const keys={sound:'hanja-pencil-sound',canvas:'hanja-trace-canvas',questionCount:'hanja-question-count'};
function read(key:string){try{return localStorage.getItem(key)!=='off';}catch{return true;}}
function readCount():number|'all'{try{const raw=localStorage.getItem(keys.questionCount);if(raw==='all')return 'all';const n=Number(raw);return raw&&Number.isSafeInteger(n)&&n>0&&n<=150?n:10;}catch{return 10;}}
let settings:Settings={sound:read(keys.sound),canvas:read(keys.canvas),questionCount:readCount()};
const listeners=new Set<()=>void>();
function subscribe(listener:()=>void){listeners.add(listener);return()=>{listeners.delete(listener);};}
export function changeSetting(key:keyof Settings,value:Settings[typeof key]){
  settings={...settings,[key]:value};
  try{localStorage.setItem(keys[key],typeof value==='boolean'?(value?'on':'off'):String(value));}catch{/* Keep the setting for this session if storage is unavailable. */}
  listeners.forEach(listener=>listener());
}
window.addEventListener('storage',event=>{
  if(event.key===null||Object.values(keys).includes(event.key)){
    settings={sound:read(keys.sound),canvas:read(keys.canvas),questionCount:readCount()};
    listeners.forEach(listener=>listener());
  }
});
export function useSettings(){return useSyncExternalStore(subscribe,()=>settings);}
