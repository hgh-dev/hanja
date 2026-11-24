const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
  const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
  try{
    const context=await browser.newContext({viewport:{width:390,height:844}});
    const page=await context.newPage();
    const errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.goto(process.env.APP_URL||'http://localhost:4174/hanja/');
    await page.getByRole('button',{name:'첫 한자 만나러 가기'}).waitFor();
    // Simulate a record saved before the grade expansion, including the moved 少.
    await page.evaluate(()=>new Promise((resolve,reject)=>{
      const r=indexedDB.open('seola-hanja');r.onsuccess=()=>{const db=r.result;const tx=db.transaction('progress','readwrite');
      tx.objectStore('progress').put({done:['山','少'],last:'少',results:[{date:'2026-11-20T00:00:00Z',type:'read',answers:[{id:'少',correct:true}]}]},'state');
      tx.oncomplete=()=>{db.close();resolve()};tx.onerror=reject;};
    }));
    await page.reload();
    await page.getByRole('button',{name:'이어서 공부하기'}).click();
    await page.getByRole('heading',{name:'적을 소',exact:true}).first().waitFor();
    assert(await page.locator('.completion-badge').isVisible());
    await page.getByRole('button',{name:'← 한자 친구들'}).click();
    assert.equal(await page.getByRole('button',{name:'7급 · 100자',exact:true}).getAttribute('aria-pressed'),'true');
    assert.equal(await page.locator('.hanja-card').count(),100);
    await page.getByRole('button',{name:'학습 완료 1',exact:true}).click();
    assert.equal(await page.locator('.hanja-card').count(),1);
    assert((await page.locator('.hanja-card').innerText()).includes('소'));
    await page.getByRole('button',{name:'8급 · 50자',exact:true}).click();
    assert.equal(await page.locator('.hanja-card').count(),1);
    assert((await page.locator('.hanja-card').innerText()).includes('산'));
    await page.getByRole('button',{name:'전체 50',exact:true}).click();
    assert.equal(await page.locator('.hanja-card').count(),50);
    assert.equal(await page.locator('.hanja-card').filter({hasText:'임금 왕'}).count(),1);
    await page.getByRole('button',{name:'7급 · 100자',exact:true}).click();
    await page.locator('.hanja-card').filter({hasText:'일백 백'}).click();
    await page.locator('.stroke-board svg').waitFor();
    assert.equal(await page.locator('.word-buttons button').count(),2);
    await page.getByRole('button',{name:'다 배웠어요! ✓'}).click();
    await page.waitForFunction(()=>new Promise(resolve=>{const r=indexedDB.open('seola-hanja');r.onsuccess=()=>{const db=r.result;const q=db.transaction('progress').objectStore('progress').get('state');q.onsuccess=()=>{resolve(q.result.done.includes('百'));db.close();};};}));
    await page.getByRole('button',{name:'우리 집',exact:true}).click();
    assert.equal(await page.locator('progress').getAttribute('max'),'150');
    assert.equal(await page.locator('progress').getAttribute('value'),'3');
    await page.getByRole('button',{name:'한자 테스트',exact:true}).click();
    await page.getByRole('button',{name:'지난 도전 기록 보기 →'}).click();
    await page.getByRole('heading',{name:'100점 · 보고 말하기'}).waitFor();
    await page.getByRole('button',{name:'한자 테스트',exact:true}).click();
    await page.getByRole('button',{name:'테스트 시작 →'}).click();
    const tested=[];
    for(let i=0;i<3;i++){
      tested.push(await page.locator('.quiz .big-char svg').getAttribute('aria-label'));
      await page.getByRole('button',{name:'정답 확인'}).click();
      await page.getByRole('button',{name:'맞았어요 ✓'}).click();
    }
    assert.deepEqual(new Set(tested),new Set(['山','少','百']));
    await page.evaluate(async()=>{await navigator.serviceWorker.ready;});
    await context.setOffline(true);
    await page.reload();
    await page.getByRole('button',{name:'이어서 공부하기'}).click();
    await page.locator('.stroke-board svg').waitFor();
    await page.locator('.word-buttons button').first().click();
    await page.getByRole('dialog').waitFor();
    assert((await page.locator('.word-dialog p').first().innerText()).includes('백 원'));
    assert.equal(errors.length,0,errors.join('\n'));
    console.log('PASS: grade filtering/counts, old records preserved, both grades in quiz, new strokes and words offline');
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
