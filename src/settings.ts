import {useSyncExternalStore} from 'react';
type Settings={sound:boolean;trace:boolean};
const keys={sound:'hanja-pencil-sound',trace:'hanja-trace-canvas'};
function read(key:string){try{return localStorage.getItem(key)!=='off';}catch{return true;}}
let settings:Settings={sound:read(keys.sound),trace:read(keys.trace)};
const listeners=new Set<()=>void>();
function subscribe(listener:()=>void){listeners.add(listener);return()=>{listeners.delete(listener);};}
export function changeSetting(key:keyof Settings,value:boolean){
  settings={...settings,[key]:value};
  try{localStorage.setItem(keys[key],value?'on':'off');}catch{/* Keep the setting for this session if storage is unavailable. */}
  listeners.forEach(listener=>listener());
}
window.addEventListener('storage',event=>{
  if(event.key===null||Object.values(keys).includes(event.key)){
    settings={sound:read(keys.sound),trace:read(keys.trace)};
    listeners.forEach(listener=>listener());
  }
});
export function useSettings(){return useSyncExternalStore(subscribe,()=>settings);}
