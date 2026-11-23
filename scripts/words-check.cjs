const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
  const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
  try{
    for(const [width,height] of [[360,800],[390,844],[884,982],[982,884],[1280,800],[800,1280]]){
      const page=await browser.newPage({viewport:{width,height}});
      const errors=[];page.on('pageerror',e=>errors.push(e.message));
      await page.goto(process.env.APP_URL||'http://localhost:4174/hanja/');
      await page.getByRole('button',{name:'첫 한자 만나러 가기'}).click();
      const buttons=page.locator('.word-buttons button');
      assert.equal(await buttons.count(),2);
      await buttons.first().click();
      const dialog=page.getByRole('dialog');
      await dialog.waitFor();
      assert.equal(await dialog.locator('h2').innerText(),'등산');
      assert.equal(await dialog.locator('mark').innerText(),'山');
      assert((await dialog.innerText()).includes('산에 올라가는'));
      await page.keyboard.press('Escape');
      await dialog.waitFor({state:'hidden'});
      assert(await buttons.first().evaluate(el=>el===document.activeElement));
      await buttons.nth(1).click();
      await dialog.waitFor();
      assert.equal(await dialog.locator('h2').innerText(),'산맥');
      await page.getByRole('button',{name:'단어 설명 닫기'}).click();
      await buttons.nth(1).click();
      await dialog.waitFor();
      await page.mouse.click(1,1);
      await dialog.waitFor({state:'hidden'});
      const layout=await page.evaluate(()=>{
        const r=s=>document.querySelector(s).getBoundingClientRect();
        const memory=r('.memory-panel'),words=r('.word-examples');
        return {aligned:Math.abs(memory.left-words.left)<1&&Math.abs(memory.width-words.width)<1,below:words.top>=memory.bottom,fit:document.documentElement.scrollWidth<=innerWidth&&document.documentElement.scrollHeight<=innerHeight,buttons:[...document.querySelectorAll('.word-buttons button')].every(el=>el.scrollWidth<=el.clientWidth)};
      });
      assert(layout.aligned&&layout.below&&layout.fit&&layout.buttons,`${width}x${height}: ${JSON.stringify(layout)}`);
      await page.getByRole('button',{name:'다음 →'}).click();
      assert.equal(await buttons.first().textContent(),'백색＋');
      assert.equal(errors.length,0,errors.join('\n'));
      await page.close();
    }
    // All 50 characters are reachable and ship their word explanations offline.
    const page=await browser.newPage();
    await page.goto(process.env.APP_URL||'http://localhost:4174/hanja/');
    await page.getByRole('button',{name:'한자 공부',exact:true}).click();
    await page.locator('.hanja-card').first().click();
    await page.context().setOffline(true);
    for(let i=0;i<50;i++){
      assert.equal(await page.locator('.word-buttons button').count(),2);
      await page.locator('.word-buttons button').first().click();
      await page.getByRole('dialog').waitFor();
      assert((await page.locator('.word-dialog p').first().innerText()).length>0);
      await page.getByRole('button',{name:'단어 설명 닫기'}).click();
      if(i<49)await page.getByRole('button',{name:'다음 →'}).click();
    }
    console.log('PASS: vocabulary strip placement, popup content/closing/focus, all 50 characters offline');
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
