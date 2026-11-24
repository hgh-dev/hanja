const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
 try{
  const page=await browser.newPage({viewport:{width:390,height:844}});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{
   window.audioEvents=[];
   for(const method of ['start','stop']){
    const original=AudioBufferSourceNode.prototype[method];
    AudioBufferSourceNode.prototype[method]=function(...args){
     window.audioEvents.push({method,time:performance.now(),energy:this.buffer?.getChannelData(0).some(v=>Math.abs(v)>.1)});
     return original.apply(this,args);
    };
   }
  });
  await page.goto(process.env.APP_URL||'http://localhost:4174/hanja/');
  await page.getByRole('button',{name:'첫 한자 만나러 가기'}).click();
  const play=page.getByRole('button',{name:'▶ 획순 보기 · 다시 보기'});
  await play.click();
  await page.waitForFunction(()=>document.querySelector('.stroke-controls button')?.disabled===false);
  const events=await page.evaluate(()=>window.audioEvents);
  assert.deepEqual(events.map(e=>e.method),['start','stop','start','stop','start','stop']);
  assert(events.filter(e=>e.method==='start').every(e=>e.energy));
  assert(events[2].time-events[1].time>=900,'sound must stop between strokes');
  // Previously drawn strokes remain visible at completion.
  const opacity=await page.locator('.stroke-canvas svg g').evaluateAll(nodes=>nodes.map(n=>n.style.opacity));
  assert(!opacity.includes('0'));
  await page.getByRole('button',{name:'우리 집',exact:true}).click();
  await page.getByRole('button',{name:'⚙ 설정',exact:true}).click();
  await page.getByRole('switch',{name:'효과음',exact:true}).uncheck();
  await page.getByRole('button',{name:'설정 닫기'}).click();
  await page.getByRole('button',{name:'이어서 공부하기'}).click();
  assert.equal(await page.locator('.stroke-sound').count(),0);
  await play.click();
  await page.waitForFunction(()=>document.querySelector('.stroke-controls button')?.disabled===false);
  assert.equal(await page.evaluate(()=>window.audioEvents.filter(e=>e.method==='start').length),3);
  assert.equal(errors.length,0,errors.join('\n'));
  await page.context().close();
  const silent=await browser.newPage();
  await silent.addInitScript(()=>{window.AudioContext=undefined;window.webkitAudioContext=undefined;});
  await silent.goto(process.env.APP_URL||'http://localhost:4174/hanja/');
  await silent.getByRole('button',{name:'첫 한자 만나러 가기'}).click();
  await silent.getByRole('button',{name:'▶ 획순 보기 · 다시 보기'}).click();
  await silent.waitForFunction(()=>document.querySelector('.stroke-controls button')?.disabled===false);
  console.log('PASS: one audible buffer per stroke, silent gaps, settings mute, no-audio fallback');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
