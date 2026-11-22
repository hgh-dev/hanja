const {chromium}=require('playwright');
const fs=require('node:fs');
const assert=require('node:assert/strict');
(async()=>{
  const swPath='dist/sw.js';
  const original=fs.readFileSync(swPath,'utf8');
  const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
  try{
    const context=await browser.newContext();
    const page=await context.newPage();
    await page.goto(process.env.APP_URL||'http://localhost:4174/hanja/');
    await page.getByRole('button',{name:'한자 공부',exact:true}).waitFor();
    await page.evaluate(async()=>{await navigator.serviceWorker.ready;});
    await page.reload();
    await page.getByRole('button',{name:'한자 공부',exact:true}).waitFor();
    let navigations=0;
    page.on('framenavigated',frame=>{if(frame===page.mainFrame()) navigations++});
    fs.writeFileSync(swPath,original+'\n// update check\n');
    await page.evaluate(()=>window.dispatchEvent(new Event('focus')));
    await page.getByRole('button',{name:'업데이트하기',exact:true}).waitFor({timeout:30000});
    assert.equal(navigations,0,'new version must wait for the user');
    await page.getByRole('button',{name:'업데이트하기',exact:true}).click();
    await page.waitForFunction(()=>performance.getEntriesByType('navigation')[0]?.type==='reload',{timeout:15000});
    assert(navigations>0);
    console.log('PASS: update button appears without reload, clicking applies the new version');
  }finally{fs.writeFileSync(swPath,original);await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
