// Candidate grade-eight list; official Korean assignment/reading cross-check pending.
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
少 적을 소
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
  {name:'나라와 사회', characters:'國韓民軍'},
  {name:'크기와 길이', characters:'大小少長寸'},
  {name:'시간과 생활', characters:'年生先門'},
];
const byCharacter = new Map(readings.map(([character,meaning,sound])=>[character,{meaning,sound}]));
export const rows = groups.flatMap(group=>[...group.characters].map(character=>({character,category:group.name}))).map(({character,category},order)=>{
  const reading=byCharacter.get(character);
  if(!reading)throw new Error(`훈음이 없는 한자: ${character}`);
  return {id:character,character,...reading,category,grade:8,order,origin:null,evolution:[],sources:['https://www.hanja.re.kr','https://funsoft.co.kr/hanja/table/8/'],verification:'공식 배정표 대조 대기'};
});
if(rows.length!==readings.length||new Set(rows.map(row=>row.id)).size!==readings.length)throw new Error('한자 주제에 빠지거나 중복된 글자가 있습니다.');
