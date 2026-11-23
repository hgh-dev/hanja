import {useEffect, useRef, useState} from 'react';
import {words} from './words.mjs';

type Word = (typeof words)[string][number];
export default function WordExamples({character}:{character:string}) {
  const [selected, setSelected] = useState<Word|null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (selected) dialog.current?.showModal();
  }, [selected]);
  const close = () => dialog.current?.close();
  return <section className="word-examples" aria-label="이 한자가 들어간 단어">
    <h2>단어로 만나요</h2>
    <div className="word-buttons">{words[character].map(word =>
      <button key={word.label} onClick={() => setSelected(word)} aria-haspopup="dialog">{word.label}<span aria-hidden="true">＋</span></button>
    )}</div>
    <dialog ref={dialog} className="word-dialog" aria-labelledby="word-title" onClose={() => setSelected(null)} onClick={event => {
      if (event.target !== event.currentTarget) return;
      const rect = event.currentTarget.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) close();
    }}>
      {selected && <>
        <div className="word-dialog-heading"><h2 id="word-title">{selected.label}</h2><button autoFocus onClick={close} aria-label="단어 설명 닫기">닫기 ×</button></div>
        <div className="word-spelling">{[...selected.spelling].map((letter, index) => letter === character ? <mark key={index}>{letter}</mark> : <span key={index}>{letter}</span>)}</div>
        <h3>무슨 뜻일까요?</h3><p>{selected.meaning}</p>
        <h3>쉽게 알아봐요</h3><p>{selected.explanation}</p>
      </>}
    </dialog>
  </section>;
}
