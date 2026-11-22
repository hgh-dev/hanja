import {useSyncExternalStore} from 'react';
import {getUpdateState,subscribeUpdates,installUpdate} from './pwa';
export default function UpdateNotice(){
  const state=useSyncExternalStore(subscribeUpdates,getUpdateState);
  if(state==='idle')return null;
  return <aside className="update-notice" role="status"><div><strong>새 버전이 준비됐어요</strong><small>업데이트하면 진행 중인 필기는 초기화돼요.</small></div><button className="primary" disabled={state==='updating'} onClick={()=>{void installUpdate();}}>{state==='updating'?'적용 중…':'업데이트하기'}</button></aside>;
}
