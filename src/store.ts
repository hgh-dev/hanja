export type Result={date:string;type:'read'|'write';answers:{id:string;correct:boolean}[]};
export type Progress={done:string[];learnedAt?:Record<string,string>;last?:string;results:Result[]};
export const empty:Progress={done:[],results:[]};
function open():Promise<IDBDatabase>{return new Promise((resolve,reject)=>{const r=indexedDB.open('seola-hanja',1);r.onupgradeneeded=()=>r.result.createObjectStore('progress');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});}
export async function read():Promise<Progress>{const db=await open();return new Promise((resolve,reject)=>{const t=db.transaction('progress');const r=t.objectStore('progress').get('state');r.onsuccess=()=>resolve(r.result??empty);r.onerror=()=>reject(r.error);t.oncomplete=()=>db.close();});}
export async function save(p:Progress){const db=await open();return new Promise<void>((resolve,reject)=>{const t=db.transaction('progress','readwrite');t.objectStore('progress').put(p,'state');t.oncomplete=()=>{db.close();resolve();};t.onerror=()=>{db.close();reject(t.error);};});}
