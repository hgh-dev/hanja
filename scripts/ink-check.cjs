const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
 try{
 const page=await browser.newPage({viewport:{width:1280,height:800}});
 await page.goto(process.env.APP_URL||'http://localhost:4174/hanja/');
 await page.getByRole('button',{name:'첫 한자 만나러 가기'}).click();
 const svg=page.locator('.trace-practice .writing svg');
 async function pixels(){return svg.evaluate(async el=>{const clone=el.cloneNode(true);clone.setAttribute('width','400');clone.setAttribute('height','400');const img=new Image();img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(new XMLSerializer().serializeToString(clone));await img.decode();const c=document.createElement('canvas');c.width=c.height=400;const ctx=c.getContext('2d');ctx.drawImage(img,0,0);return [...ctx.getImageData(0,0,400,400).data];});}
 await svg.locator('[data-glyph-paths]').waitFor();
 const original=await pixels();let point;
 for(let y=100;y<300&&!point;y++)for(let x=100;x<300;x++){const i=(y*400+x)*4;if(original[i]===225&&original[i+1]===223&&original[i+2]===214&&original[i+3]===255){point={x,y,i};break;}}
 assert(point,'find an opaque guide pixel');
 async function stroke(){const r=await svg.boundingBox();await page.mouse.move(r.x+(point.x-15)/400*r.width,r.y+point.y/400*r.height);await page.mouse.down();await page.mouse.move(r.x+(point.x+15)/400*r.width,r.y+point.y/400*r.height,{steps:6});await page.mouse.up();}
 await stroke();let current=await pixels();assert.deepEqual(current.slice(point.i,point.i+4),[41,46,43,255],'ink must cover guide');
 await page.locator('.trace-practice').getByRole('button',{name:'지우개',exact:true}).click();await stroke();current=await pixels();assert.deepEqual(current.slice(point.i,point.i+4),original.slice(point.i,point.i+4),'eraser reveals unchanged guide');
 await page.locator('.trace-practice').getByRole('button',{name:'✎ 펜',exact:true}).click();await stroke();current=await pixels();assert.deepEqual(current.slice(point.i,point.i+4),[41,46,43,255],'new ink can cover erased area');
 console.log('PASS: ink above guide, eraser preserves guide, redraw after erasing');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
