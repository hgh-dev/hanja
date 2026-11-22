const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
  const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
  try{
    for(const [width,height] of [[390,844],[412,915],[884,982],[982,884],[1280,800],[1280,720],[800,1280]]){
      const page=await browser.newPage({viewport:{width,height},isMobile:true,hasTouch:true});
      await page.goto(process.env.APP_URL||'http://localhost:4174/hanja/');
      await page.getByRole('button',{name:'첫 한자 만나러 가기'}).click();
      await page.locator('.stroke-board svg').waitFor();
      const layout=await page.evaluate(()=>{
        const rect=selector=>document.querySelector(selector).getBoundingClientRect();
        return {pageHeight:document.documentElement.scrollHeight,viewportHeight:innerHeight,panels:[...document.querySelectorAll('.study-layout .panel')].map(el=>[el.scrollHeight,el.clientHeight]),character:rect('.memory-content .study-info').toJSON(),picture:rect('.memory-content .memory-picture').toJSON(),art:rect('.memory-art').toJSON(),caption:rect('.memory-copy').toJSON(),stroke:rect('.stroke-board svg').toJSON(),writing:rect('.writing-board .writing').toJSON()};
      });
      assert(layout.pageHeight<=layout.viewportHeight,`${width}×${height}: page scrolls`);
      assert(layout.panels.every(([scroll,client])=>scroll<=client),`${width}×${height}: panel clips content`);
      if(width<700)assert(Math.abs(layout.character.width-layout.picture.width)<1,`${width}×${height}: unequal horizontal halves`);
      else assert(Math.abs(layout.character.height-layout.picture.height)<1,`${width}×${height}: unequal vertical halves`);
      assert(layout.art.bottom<=layout.caption.top+1,`${width}×${height}: picture overlaps caption`);
      assert(layout.stroke.bottom<=layout.writing.top,`${width}×${height}: stroke board must be above writing board`);
      await page.getByRole('button',{name:'다음 →'}).click();
      await page.getByText('그림으로 기억해요').waitFor();
      await page.close();
    }
    console.log('PASS: phone and tablet halves, stacked writing boards, no scrolling');
  }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exit(1)});
