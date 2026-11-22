import {registerSW} from 'virtual:pwa-register';

type UpdateState = 'idle' | 'available' | 'updating';
let state:UpdateState='idle';
const listeners=new Set<()=>void>();
function setState(next:UpdateState){state=next;listeners.forEach(listener=>listener());}
export const getUpdateState=()=>state;
export function subscribeUpdates(listener:()=>void){listeners.add(listener);return()=>{listeners.delete(listener);};}

const applyUpdate=registerSW({
  immediate:true,
  onNeedRefresh(){setState('available');},
  onRegisteredSW(_url,registration){
    if(!registration)return;
    let checking=false;
    const check=async()=>{
      if(checking||!navigator.onLine||document.visibilityState==='hidden'||registration.installing)return;
      checking=true;
      try{await registration.update();}catch{/* Retry on the next check after connectivity returns. */}
      finally{checking=false;}
    };
    window.setInterval(check,15_000);
    document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')void check();});
    window.addEventListener('focus',()=>{void check();});
    window.addEventListener('pageshow',()=>{void check();});
    window.addEventListener('online',()=>{void check();});
    void check();
  },
});
export async function installUpdate(){
  if(state!=='available')return;
  setState('updating');
  try{await applyUpdate(true);}catch{setState('available');}
  // Allow retry if another tab or a navigation confirmation prevents the reload.
  window.setTimeout(()=>{if(state==='updating')setState('available');},15_000);
}
