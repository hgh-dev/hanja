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
      <label className="setting-row"><span><strong>캔버스 표시/숨김</strong><small>따라쓰기와 혼자쓰기 칸을 함께 보여 줘요.</small></span><input type="checkbox" role="switch" checked={settings.canvas} onChange={e=>changeSetting('canvas',e.target.checked)} aria-label="캔버스 표시/숨김"/><b>{settings.canvas?'표시':'숨김'}</b></label>
      <div className="setting-row"><span><strong>테스트 문제 수</strong><small>선택한 범위에서 낼 문제 수를 정해요.</small></span><div className="question-setting"><input aria-label="테스트 문제 수" type="number" min="1" max="150" value={settings.questionCount==='all'?'':settings.questionCount} disabled={settings.questionCount==='all'} onChange={e=>{const n=Number(e.target.value);if(Number.isSafeInteger(n)&&n>=1&&n<=150)changeSetting('questionCount',n);}}/><label><input type="checkbox" checked={settings.questionCount==='all'} onChange={e=>changeSetting('questionCount',e.target.checked?'all':10)}/>배운 한자 전체</label></div></div>
      <p className="settings-hint">선택하면 바로 적용돼요.</p>
    </dialog></>;
}
