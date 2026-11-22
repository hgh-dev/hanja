import type {ReactNode} from 'react';

// Child-friendly summaries of entries in Make Me a Hanzi's dictionary.txt.
// These are conceptual drawings, never historical glyph reproductions.
const source='https://github.com/skishore/makemeahanzi/blob/master/dictionary.txt';
const stories:Record<string,{kind:string;description:string;picture?:string;label?:string}>={
  '一':{kind:'지사',description:'선 하나로 하나를 나타내요.',label:'선 하나'},
  '二':{kind:'지사',description:'선 두 개로 둘을 나타내요.',label:'선 두 개'},
  '三':{kind:'지사',description:'선 세 개로 셋을 나타내요.',label:'선 세 개'},
  '山':{kind:'상형',description:'뾰족한 산봉우리들이 모인 모습을 떠올려 보세요.',picture:'mountain',label:'산봉우리'},
  '木':{kind:'상형',description:'줄기와 가지가 뻗은 나무를 떠올려 보세요.',picture:'tree',label:'나무'},
  '日':{kind:'상형',description:'둥근 해를 나타낸 글자예요.',picture:'sun',label:'해'},
  '月':{kind:'상형',description:'초승달 모양에서 생각해 볼 수 있어요.',picture:'moon',label:'초승달'},
  '水':{kind:'상형',description:'흐르는 물줄기를 떠올려 보세요.',picture:'water',label:'물줄기'},
  '火':{kind:'상형',description:'타오르는 불꽃을 떠올려 보세요.',picture:'fire',label:'불꽃'},
  '人':{kind:'상형',description:'사람의 다리를 떠올려 보세요.',picture:'person',label:'사람'},
  '女':{kind:'상형',description:'옆으로 돌아앉은 사람의 모습을 나타낸 글자예요.',picture:'woman',label:'앉은 사람'},
  '門':{kind:'상형',description:'열린 문이나 대문을 떠올려 보세요.',picture:'gate',label:'문'},
};
const drawings:Record<string,ReactNode>={
  mountain:<path d="M8 72 32 39 49 58 76 17 105 62 124 45 150 72Z" fill="#adc5a2" stroke="#477d60" strokeWidth="4"/>,
  tree:<><path d="M80 30v89M80 75 44 47M80 72l34-27" stroke="#805d45" strokeWidth="9" strokeLinecap="round"/><path d="M34 50Q42 11 80 14q40-5 49 37" fill="#b9d1a3" stroke="#477d60" strokeWidth="4"/><path d="M56 119h48" stroke="#805d45" strokeWidth="5"/></>,
  sun:<><circle cx="80" cy="68" r="33" fill="#f3d482" stroke="#c89443" strokeWidth="4"/><path d="M80 11v16M80 109v16M23 68h16M121 68h16M40 28l11 11M109 99l11 11M120 28l-11 11M51 99l-11 11" stroke="#c89443" strokeWidth="4" strokeLinecap="round"/></>,
  moon:<path d="M102 15A55 55 0 1 0 125 109 53 53 0 0 1 102 15Z" fill="#f2e5b0" stroke="#b4975a" strokeWidth="4"/>,
  water:<><path d="M78 12q-28 28 0 52t0 58M51 30Q30 51 52 71t-3 41M109 27Q87 46 106 69t4 42" fill="none" stroke="#79abc1" strokeWidth="9" strokeLinecap="round"/></>,
  fire:<><path d="M80 14q18 22 6 41 15-4 22-22 25 32 10 63-11 23-38 23-34 0-39-28Q35 67 63 42q-4 22 5 28Q73 40 80 14Z" fill="#efa76b" stroke="#c77d49" strokeWidth="4"/></>,
  person:<><circle cx="80" cy="23" r="12" fill="#eccda7"/><path d="M80 39v39M80 51 52 72M80 51l27 21M80 77l-25 45M80 77l26 45" fill="none" stroke="#987a63" strokeWidth="9" strokeLinecap="round"/></>,
  woman:<><circle cx="88" cy="23" r="12" fill="#eccda7"/><path d="M86 38q-23 22-9 52l-27 28M75 73l42 11M75 88l32 28" fill="none" stroke="#987a63" strokeWidth="9" strokeLinecap="round"/></>,
  gate:<><path d="M33 120V25h94v95M33 40h94M80 40v80" fill="none" stroke="#987a63" strokeWidth="10" strokeLinejoin="round"/><path d="M45 51v52M115 51v52" stroke="#c7aa84" strokeWidth="5"/></>,
};
export default function Etymology({character}:{character:string}){
  const story=stories[character];
  return <section className="origin-story"><h3>이 글자는 어디에서 왔을까?</h3>{story?<><span className="origin-kind">{story.kind} · 개념 그림</span><p>{story.description}</p><div className="origin-diagram"><div className="origin-picture" aria-label={`${story.label} 개념 그림`}>{story.picture?<svg viewBox="0 0 160 140" role="img" aria-label={story.label}>{drawings[story.picture]}</svg>:<span className="line-picture">{character}</span>}<small>{story.label}</small></div><span aria-hidden="true" className="origin-arrow">→</span><div className="origin-picture"><b>{character}</b><small>지금 쓰는 한자</small></div></div><small>이 그림은 이해를 돕는 개념도이며 실제 옛 글자 모양이 아니에요.</small><p className="origin-source">설명 출처: <a href={source} target="_blank" rel="noreferrer">Make Me a Hanzi 사전</a></p></>:<p>이 글자의 유래 설명과 옛 글자 자료는 출처를 더 확인하고 있어요.</p>}<p className="evolution-note">실제 갑골문·금문 등 변천 자료: 검증 후 제공 예정</p></section>;
}
