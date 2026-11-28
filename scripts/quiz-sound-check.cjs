const {chromium}=require('playwright');
const assert=require('node:assert/strict');

(async()=>{
  const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
  try{
    const page=await browser.newPage();
    await page.addInitScript(()=>{
      window.quizAudio={notes:[],mediaPlays:[]};
      const noteStart=OscillatorNode.prototype.start;
      OscillatorNode.prototype.start=function(...args){
        window.quizAudio.notes.push(this.frequency.value);
        return noteStart.apply(this,args);
      };
      const mediaPlay=HTMLMediaElement.prototype.play;
      HTMLMediaElement.prototype.play=function(...args){
        window.quizAudio.mediaPlays.push(this.src);
        window.lastSound=this;
        return mediaPlay.apply(this,args);
      };
    });
    await page.goto(process.env.APP_URL||'http://localhost:4173/hanja/');
    await page.getByRole('button',{name:'첫 한자 만나러 가기'}).click();
    await page.getByRole('button',{name:'다 배웠어요! ✓'}).click();
    await page.getByRole('button',{name:'다음 →'}).click();
    await page.getByRole('button',{name:'다 배웠어요! ✓'}).click();
    await page.getByRole('button',{name:'한자 테스트',exact:true}).click();
    await page.getByRole('button',{name:'테스트 시작 →'}).click();
    await page.getByText('1 / 2문제').waitFor();
    await page.getByRole('button',{name:'정답 확인'}).click();
    await page.waitForFunction(()=>window.quizAudio.notes.length===4);
    await page.getByRole('button',{name:'맞았어요 ✓'}).click();
    await page.waitForFunction(()=>window.quizAudio.mediaPlays.length===1&&window.lastSound.currentTime>.05);
    assert.deepEqual(await page.evaluate(()=>window.quizAudio.notes.map(Math.round)),[523,659,784,1047]);
    const clip=await page.evaluate(()=>({url:window.lastSound.currentSrc,duration:window.lastSound.duration,volume:window.lastSound.volume}));
    assert(clip.url.endsWith('/hanja/sounds/seola-laugh.m4a'));
    assert(clip.duration>2&&clip.duration<3);
    assert(clip.volume<=.7);

    await page.getByRole('button',{name:'정답 확인'}).click();
    await page.getByRole('button',{name:'다시 배울래요'}).click();
    await page.getByRole('heading',{name:'끝까지 해냈어요!'}).waitFor();
    await page.waitForFunction(()=>window.quizAudio.mediaPlays.length===2&&window.lastSound.currentTime>.05);
    const finishClip=await page.evaluate(()=>({url:window.lastSound.currentSrc,duration:window.lastSound.duration,volume:window.lastSound.volume}));
    assert(finishClip.url.endsWith('/hanja/sounds/quiz-complete.mp3'));
    assert(finishClip.duration>3&&finishClip.duration<4);
    assert(finishClip.volume<=.7);

    await page.getByRole('button',{name:'한자 테스트',exact:true}).click();
    await page.getByRole('button',{name:'테스트 시작 →'}).click();
    await page.getByRole('button',{name:'정답 확인'}).click();
    await page.getByRole('button',{name:'다시 배울래요'}).click();
    await page.waitForFunction(()=>window.quizAudio.mediaPlays.length===3&&window.lastSound.currentTime>.05);
    const reviewClip=await page.evaluate(()=>({url:window.lastSound.currentSrc,duration:window.lastSound.duration}));
    assert(reviewClip.url.endsWith('/hanja/sounds/learn-again.mp3'));
    assert(reviewClip.duration>1&&reviewClip.duration<2);
    await page.getByRole('button',{name:'정답 확인'}).click();
    await page.getByRole('button',{name:'맞았어요 ✓'}).click();
    await page.getByRole('heading',{name:'끝까지 해냈어요!'}).waitFor();
    await page.waitForFunction(()=>window.quizAudio.mediaPlays.length===4);
    assert((await page.evaluate(()=>window.lastSound.currentSrc)).endsWith('/hanja/sounds/quiz-complete.mp3'));

    await page.getByRole('button',{name:'우리 집',exact:true}).click();
    await page.getByRole('button',{name:'⚙ 설정',exact:true}).click();
    await page.getByRole('switch',{name:'효과음',exact:true}).uncheck();
    await page.getByRole('button',{name:'설정 닫기'}).click();
    await page.getByRole('button',{name:'한자 테스트',exact:true}).click();
    await page.getByRole('button',{name:'테스트 시작 →'}).click();
    await page.getByRole('button',{name:'정답 확인'}).click();
    await page.getByRole('button',{name:'다시 배울래요'}).click();
    await page.getByRole('button',{name:'정답 확인'}).click();
    await page.getByRole('button',{name:'맞았어요 ✓'}).click();
    await page.getByRole('heading',{name:'끝까지 해냈어요!'}).waitFor();
    assert.equal(await page.evaluate(()=>window.quizAudio.mediaPlays.length),4);
    console.log('PASS: reveal chime, judgment clips, supplied completion cheer, and effects mute');
  }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exit(1)});
