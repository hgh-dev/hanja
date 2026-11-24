const {chromium}=require('playwright');const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});try{
 const page=await browser.newPage({viewport:{width:390,height:844}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(process.env.APP_URL||'http://localhost:4174/hanja/');
 const open=()=>page.getByRole('button',{name:'⚙ 설정',exact:true}).click();
 await open();assert(await page.getByRole('switch',{name:'효과음',exact:true}).isChecked());assert(await page.getByRole('switch',{name:'따라쓰기 캔버스'}).isChecked());
 await page.getByRole('switch',{name:'효과음',exact:true}).uncheck();await page.getByRole('switch',{name:'따라쓰기 캔버스'}).uncheck();
 await page.keyboard.press('Escape');assert.equal(await page.getByRole('dialog').count(),0);
 await page.getByRole('button',{name:'첫 한자 만나러 가기'}).click();await page.locator('.stroke-canvas svg').waitFor();
 assert.equal(await page.locator('.trace-practice').count(),0);assert.equal(await page.locator('.free-practice').count(),1);
 assert(await page.getByRole('button',{name:'연필 소리 꺼짐'}).isVisible());
 for(const [width,height] of [[390,844],[884,982],[982,884],[1280,800],[800,1280]]){
  await page.setViewportSize({width,height});await page.waitForTimeout(150);
  assert(await page.evaluate(()=>document.documentElement.scrollHeight<=innerHeight&&document.documentElement.scrollWidth<=innerWidth));
  assert(await page.locator('.practice-panel').evaluate(el=>el.scrollHeight<=el.clientHeight));
  const centered=await page.locator('.free-practice').evaluate(el=>{const a=el.getBoundingClientRect(),b=el.querySelector('.writing').getBoundingClientRect();return Math.abs(a.left+a.width/2-b.left-b.width/2)<2;});assert(centered);
 }
 await page.getByRole('button',{name:'연필 소리 꺼짐'}).click();
 await page.getByRole('button',{name:'우리 집',exact:true}).click();await open();assert(await page.getByRole('switch',{name:'효과음',exact:true}).isChecked());
 await page.getByRole('button',{name:'설정 닫기'}).click();await page.reload();await open();
 assert(await page.getByRole('switch',{name:'효과음',exact:true}).isChecked());assert(!await page.getByRole('switch',{name:'따라쓰기 캔버스'}).isChecked());
 await page.getByRole('switch',{name:'따라쓰기 캔버스'}).check();await page.getByRole('button',{name:'설정 닫기'}).click();
 await page.getByRole('button',{name:'이어서 공부하기'}).click();await page.locator('.trace-practice').waitFor();assert.equal(await page.locator('.writing-pair .writing').count(),2);
 assert.equal(errors.length,0,errors.join('\n'));
 console.log('PASS: defaults, settings dialog, shared sound preference, reload persistence, tracing visibility and no-scroll layouts');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1)});
