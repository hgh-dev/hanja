// Korean Eomunhoe grade grouping; reference details in CATALOG-SOURCES.md.
import {grade7Readings} from './grade7.mjs';
const readings = `校 학교 교
敎 가르칠 교
九 아홉 구
國 나라 국
軍 군사 군
金 쇠 금
南 남녘 남
女 여자 녀
年 해 년
大 큰 대
東 동녘 동
六 여섯 륙
萬 일만 만
母 어머니 모
木 나무 목
門 문 문
民 백성 민
白 흰 백
父 아버지 부
北 북녘 북
四 넉 사
山 메 산
三 석 삼
生 날 생
西 서녘 서
先 먼저 선
小 작을 소
王 임금 왕
水 물 수
室 집 실
十 열 십
五 다섯 오
外 바깥 외
月 달 월
二 두 이
人 사람 인
一 한 일
日 날 일
長 길 장
弟 아우 제
中 가운데 중
靑 푸를 청
寸 마디 촌
七 일곱 칠
土 흙 토
八 여덟 팔
學 배울 학
韓 나라 한
兄 형 형
火 불 화`.split('\n').map(s=>s.split(' '));

// The order of these groups is also the previous/next learning sequence.
// Weekdays follow the Korean calendar convention: Monday through Sunday.
export const groups = [
  {name:'숫자', characters:'一二三四五六七八九十萬'},
  {name:'요일', characters:'月火水木金土日'},
  {name:'방향과 위치', characters:'東西南北中外'},
  {name:'가족과 사람', characters:'人父母兄弟女'},
  {name:'학교와 공부', characters:'校學敎室'},
  {name:'자연과 색', characters:'山白靑'},
  {name:'나라와 사회', characters:'國韓民軍王'},
  {name:'크기와 길이', characters:'大小長寸'},
  {name:'시간과 생활', characters:'年生先門'},
];
export const grade7Groups = [
  {name:'숫자와 셈', characters:'百千數算'},
  {name:'계절과 시간', characters:'春夏秋冬夕午時每'},
  {name:'방향과 위치', characters:'上下左右前後內間方平直'},
  {name:'가족과 사람', characters:'家男子夫祖老姓名主孝'},
  {name:'몸과 마음', characters:'口手足面心命力'},
  {name:'학교와 말', characters:'字文語話問答記歌紙漢'},
  {name:'자연과 색', characters:'天地川江海林花草植色空氣電然'},
  {name:'마을과 생활', characters:'里村洞邑市場所道車農工食物住事世旗'},
  {name:'움직임과 상태', characters:'出入來登動活休立育自有不安全少重便同正'},
];
const byCharacter = new Map(readings.map(([character,meaning,sound])=>[character,{meaning,sound}]));
const grade7ByCharacter = new Map(grade7Readings.map(([character,meaning,sound])=>[character,{meaning,sound}]));
export const gradeGroups = [{grade:8, groups}, {grade:7, groups:grade7Groups}];
export const rows = gradeGroups.flatMap(({grade,groups:topics})=>topics.flatMap(group=>[...group.characters].map(character=>({character,category:group.name,grade})))).map(({character,category,grade},order)=>{
  const reading=(grade===8?byCharacter:grade7ByCharacter).get(character);
  if(!reading)throw new Error(`훈음이 없는 한자: ${character}`);
  return {id:character,character,...reading,category,grade,order,sources:['https://www.hanja.re.kr','https://github.com/hsun1022011/hanja_7-8','https://github.com/hellossook/hanja7'],verification:'공개 학습 목록 대조 · 공식 배정표 재확인 대기'};
});
if(rows.length!==150||new Set(rows.map(row=>row.id)).size!==150||rows.filter(r=>r.grade===8).length!==50)throw new Error('한자 주제에 빠지거나 중복된 글자가 있습니다.');
