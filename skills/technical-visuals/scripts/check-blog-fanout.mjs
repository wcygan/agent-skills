import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
assert.ok(process.env.PLAYWRIGHT_MODULE && process.argv[2], 'Set PLAYWRIGHT_MODULE and provide external output directory');
const out=path.resolve(process.argv[2]);
assert.ok(out!==root && !out.startsWith(root+path.sep));
await fs.mkdir(out,{recursive:true});
const {chromium}=await import(pathToFileURL(process.env.PLAYWRIGHT_MODULE));
const browser=await chromium.launch();
try {
 const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto(pathToFileURL(path.join(root,'examples/blog/fanout.html')).href);
 for(const id of ['service-graph','amplification']) {
  const figure=page.locator(`[data-figure="${id}"]`);
  const events=await figure.locator('[data-payload]').evaluateAll(nodes=>nodes.map(n=>({...n.dataset,start:+n.dataset.start,duration:+n.dataset.duration,delay:+n.dataset.delay})));
  for(const e of events) if(e.after!==undefined) {
   const parent=events[+e.after];
   assert.ok(Math.abs(e.start-parent.start-parent.duration-e.delay)<0.001,'Launch must derive from parent arrival');
  }
  assert.ok(events.some(e=>e.after!==undefined && e.delay===0),'First child launches immediately');
 }
 const figure=page.locator('[data-figure="amplification"]');
 await figure.scrollIntoViewIfNeeded();
 await figure.locator('[data-action="replay"]').click();
 await page.waitForFunction(()=>{
  const visible=[...document.querySelectorAll('[data-payload^="a-calls-"]')].filter(n=>n.style.display!=='none');
  return visible.length===3;
 });
 await figure.locator('[data-action="play"]').click();
 const paths=await figure.locator('[data-payload^="a-calls-"]').evaluateAll(nodes=>nodes.map(n=>n.dataset.payload));
 assert.equal(new Set(paths).size,3,'Multiplied requests take distinct paths');
 const distances=await figure.locator('[data-payload]').evaluateAll(nodes=>nodes.filter(n=>n.style.display!=='none').map(n=>{
  const route=n.closest('svg').querySelector('#'+n.dataset.payload),length=route.getTotalLength();
  let best=Infinity;
  for(let i=0;i<=2000;i++){const p=route.getPointAtLength(length*i/2000);best=Math.min(best,Math.hypot(p.x-n.cx.baseVal.value,p.y-n.cy.baseVal.value));}
  return best;
 }));
 assert.ok(distances.every(d=>d<0.2),'Payload centers must lie on routes');
 await figure.screenshot({path:path.join(out,'three-concurrent-branches.png')});
 for(let i=0;i<10;i++)await figure.locator('[data-action="step"]').click();
 assert.deepEqual(JSON.parse(await figure.getAttribute('data-state')),{a:1,b:3,reads:6});
 assert.deepEqual(errors,[]);
 console.log(JSON.stringify({arrivalScheduling:true,distinctConcurrentPaths:3,finalCounts:{a:1,b:3,reads:6},errors}));
}finally{await browser.close();}
