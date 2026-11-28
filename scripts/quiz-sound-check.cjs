const {chromium}=require('playwright');
const assert=require('node:assert/strict');

(async()=>{
  const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
  try{
    const page=await browser.newPage();
    await page.addInitScript(()=>{
      window.quizAudio={notes:[],claps:[]};
      const noteStart=OscillatorNode.prototype.start;
      OscillatorNode.prototype.start=function(...args){
        window.quizAudio.notes.push(this.frequency.value);
        return noteStart.apply(this,args);
      };
      const clapStart=AudioBufferSourceNode.prototype.start;
      AudioBufferSourceNode.prototype.start=function(...args){
        window.quizAudio.claps.push({duration:this.buffer?.duration,loop:this.loop});
        return clapStart.apply(this,args);
      };
    });
    await page.goto(process.env.APP_URL||'http://localhost:4173/hanja/');
    await page.getByRole('button',{name:'첫 한자 만나러 가기'}).click();
    await page.getByRole('button',{name:'다 배웠어요! ✓'}).click();
    await page.getByRole('button',{name:'한자 테스트',exact:true}).click();
    await page.getByRole('button',{name:'테스트 시작 →'}).click();
    await page.getByRole('button',{name:'정답 확인'}).click();
    await page.waitForFunction(()=>window.quizAudio.notes.length===4);
    await page.getByRole('button',{name:'맞았어요 ✓'}).click();
    await page.waitForFunction(()=>window.quizAudio.claps.length===1);
    const cues=await page.evaluate(()=>window.quizAudio);
    assert.deepEqual(cues.notes.slice(0,4).map(Math.round),[523,659,784,1047]);
    assert.equal(cues.notes.length,7,'three cheer voices should join the applause');
    assert(cues.claps[0].duration>1.5&&cues.claps[0].loop===false);

    await page.getByRole('button',{name:'우리 집',exact:true}).click();
    await page.getByRole('button',{name:'⚙ 설정',exact:true}).click();
    await page.getByRole('switch',{name:'효과음',exact:true}).uncheck();
    await page.getByRole('button',{name:'설정 닫기'}).click();
    await page.getByRole('button',{name:'한자 테스트',exact:true}).click();
    await page.getByRole('button',{name:'테스트 시작 →'}).click();
    await page.getByRole('button',{name:'정답 확인'}).click();
    await page.getByRole('button',{name:'맞았어요 ✓'}).click();
    assert.deepEqual(await page.evaluate(()=>window.quizAudio),cues);
    console.log('PASS: reveal chime, applause with cheer voices, and effects mute');
  }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exit(1)});
