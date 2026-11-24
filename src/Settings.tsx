import {useEffect,useRef} from 'react';
import {changeSetting,useSettings} from './settings';
export default function Settings(){
  const dialog=useRef<HTMLDialogElement>(null);
  const settings=useSettings();
  useEffect(()=>()=>{dialog.current?.close();},[]);
  return <><button className="settings-open" onClick={()=>dialog.current?.showModal()} aria-haspopup="dialog">⚙ 설정</button>
    <dialog ref={dialog} className="word-dialog settings-dialog" aria-labelledby="settings-title" onClick={event=>{
      if(event.target!==event.currentTarget)return;
      const r=event.currentTarget.getBoundingClientRect();
      if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.current?.close();
    }}>
      <div className="word-dialog-heading"><h2 id="settings-title">설정</h2><button autoFocus onClick={()=>dialog.current?.close()} aria-label="설정 닫기">닫기 ×</button></div>
      <label className="setting-row"><span><strong>효과음</strong><small>획순을 볼 때 연필 소리를 내요.</small></span><input type="checkbox" role="switch" checked={settings.sound} onChange={e=>changeSetting('sound',e.target.checked)} aria-label="효과음"/><b>{settings.sound?'켜짐':'꺼짐'}</b></label>
      <label className="setting-row"><span><strong>따라쓰기 캔버스</strong><small>밑글씨가 있는 따라쓰기 칸을 보여 줘요.</small></span><input type="checkbox" role="switch" checked={settings.trace} onChange={e=>changeSetting('trace',e.target.checked)} aria-label="따라쓰기 캔버스"/><b>{settings.trace?'표시':'숨김'}</b></label>
      <p className="settings-hint">선택하면 바로 적용돼요.</p>
    </dialog></>;
}
