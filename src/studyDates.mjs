export const ranges=['today','thisWeek','lastWeek','all'];
export const labels={today:'오늘 배운 한자',thisWeek:'이번 주에 배운 한자',lastWeek:'저번 주에 배운 한자',all:'전체 배운 한자'};
const day=d=>new Date(d.getFullYear(),d.getMonth(),d.getDate()).getTime();
export function eligible(done,dates,range,now=new Date()){
 if(range==='all')return done;
 const today=day(now),weekday=(now.getDay()+6)%7,weekStart=today-weekday*86400000;
 return done.filter(id=>{
  if(!dates[id])return false;
  const date=new Date(dates[id]);if(Number.isNaN(date.getTime()))return false;
  const value=day(date);
  return range==='today'?value===today:range==='thisWeek'?value>=weekStart&&value<weekStart+7*86400000:value>=weekStart-7*86400000&&value<weekStart;
 });
}
