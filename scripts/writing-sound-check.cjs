const {chromium}=require('playwright');
const assert=require('node:assert/strict');

(async()=>{
  const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
  try{
    const page=await browser.newPage();
    await page.addInitScript(()=>{
      window.pencil=[];
      window.brushFilters=[];
      window.brushBuffers=[];
      const makeFilter=AudioContext.prototype.createBiquadFilter;
      AudioContext.prototype.createBiquadFilter=function(...args){
        const filter=makeFilter.apply(this,args);
        window.brushFilters.push(filter);
        return filter;
      };
      for(const method of ['start','stop']){
        const original=AudioBufferSourceNode.prototype[method];
        AudioBufferSourceNode.prototype[method]=function(...args){
          window.pencil.push(method);
          if(method==='start')window.brushBuffers.push(this.buffer);
          return original.apply(this,args);
        };
      }
    });
    await page.goto(process.env.APP_URL||'http://localhost:4174/hanja/');
    await page.getByRole('button',{name:'첫 한자 만나러 가기'}).click();
    const svg=page.locator('.trace-practice .writing svg');
    const box=await svg.boundingBox();
    await page.mouse.move(box.x+40,box.y+40);
    await page.mouse.down();
    await page.mouse.move(box.x+80,box.y+80);
    await page.mouse.up();
    const profile=await page.evaluate(()=>{
      const buffer=window.brushBuffers[0];
      const samples=buffer.getChannelData(0);
      const chunk=Math.round(buffer.sampleRate*.025);
      const levels=[];
      for(let start=0;start+chunk<=samples.length;start+=chunk){
        let energy=0;
        for(let i=start;i<start+chunk;i++)energy+=samples[i]*samples[i];
        levels.push(Math.sqrt(energy/chunk));
      }
      return {filter:window.brushFilters[0].type,frequency:window.brushFilters[0].frequency.value,
        levelRatio:Math.max(...levels)/Math.min(...levels),duration:buffer.duration};
    });
    assert.deepEqual(await page.evaluate(()=>window.pencil),['start','stop']);
    assert.equal(profile.filter,'lowpass');
    assert(profile.frequency<=1200);
    assert(profile.levelRatio<1.5,'brush sound should not pulse rapidly');
    assert(profile.duration>=2,'loop should be long enough to avoid obvious repetition');
    await page.getByRole('button',{name:'지우개'}).click();
    await page.mouse.down();
    await page.mouse.move(box.x+90,box.y+90);
    await page.mouse.up();
    assert.deepEqual(await page.evaluate(()=>window.pencil),['start','stop']);
    console.log('PASS: smooth brush noise while drawing; eraser remains silent');
  }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exit(1)});
