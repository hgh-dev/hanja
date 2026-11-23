const {chromium}=require('playwright');const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});try{
const page=await browser.newPage();await page.goto(process.env.APP_URL||'http://localhost:4174/hanja/');await page.getByRole('button',{name:'첫 한자 만나러 가기'}).click();
for(const name of ['✎ 펜','지우개','모두 지우기'])assert.equal(await page.getByRole('button',{name,exact:true}).count(),1);
const boards=[page.locator('.trace-practice .writing svg'),page.locator('.free-practice .writing svg')];
async function draw(board){const r=await board.boundingBox();await page.mouse.move(r.x+r.width*.3,r.y+r.height*.5);await page.mouse.down();await page.mouse.move(r.x+r.width*.7,r.y+r.height*.5,{steps:4});await page.mouse.up();}
for(const board of boards){await draw(board);assert.equal(await board.locator('[data-ink]>path').count(),1);}
await page.getByRole('button',{name:'지우개',exact:true}).click();
for(const board of boards){await draw(board);assert.equal(await board.locator('defs mask').count(),1);}
await page.getByRole('button',{name:'✎ 펜',exact:true}).click();
for(const board of boards){await draw(board);assert.equal(await board.locator('[data-ink]>path').count(),2);}
await page.getByRole('button',{name:'모두 지우기',exact:true}).click();
for(const board of boards)assert.equal(await board.locator('[data-ink]>path').count(),0);
assert.equal(await boards[0].locator('[data-guide]').getAttribute('data-guide'),'山');assert.equal(await boards[1].locator('[data-guide]').getAttribute('data-guide'),'');
console.log('PASS: one tool set controls both canvases; clear removes both drawings and preserves guide');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exit(1)});
