export function selectQuestions(items,random=Math.random){const a=[...new Set(items)];for(let i=a.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a.slice(0,10);}
export function score(answers){return answers.length?Math.round(100*answers.filter(a=>a.correct).length/answers.length):0;}
