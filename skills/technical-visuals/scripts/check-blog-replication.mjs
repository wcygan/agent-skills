const { chromium } = await import(
  process.env.PLAYWRIGHT_MODULE || "playwright"
);
import { mkdir, writeFile } from "node:fs/promises";
import assert from "node:assert/strict";
const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1200, height: 1000 },
  reducedMotion: "reduce",
});
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
await page.goto(
  process.env.VISUAL_BASE_URL
    ? `${process.env.VISUAL_BASE_URL}/examples/blog/replication.html`
    : new URL("../examples/blog/replication.html", import.meta.url).href,
);
const figs = page.locator("[data-figure]");
assert.equal(await figs.count(), 3);
const state = async (f) => JSON.parse(await f.getAttribute("data-state"));
const click = async (f, a, n = 1) => {
  for (let i = 0; i < n; i++) await f.locator(`[data-action="${a}"]`).click();
};
for (let i = 0; i < 3; i++) {
  const f = figs.nth(i);
  await f.locator("details.experiments").evaluate(el => el.open = true);
  const a = await state(f);
  await page.waitForTimeout(720);
  assert.deepEqual(await state(f), a);
  await click(f, "step");
  assert.notDeepEqual(await state(f), a);
  await click(f, "reset");
}
const log = figs.nth(0);
await click(log, "read");
assert.match(await log.locator("[role=status]").textContent(), /not found/);
await click(log, "write");
await click(log, "step", 2);
await click(log, "read");
assert.match(
  await log.locator("[role=status]").textContent(),
  /INSERT user:42/,
);
assert.equal((await state(log)).p, 1);
const repl = figs.nth(1);
await click(repl, "write", 3);
await click(repl, "step", 2);
assert.equal((await state(repl)).p, 3);
assert.equal((await state(repl)).r, 0);
await click(repl, "step", 2);
assert.equal((await state(repl)).r, 3);
assert.equal((await state(repl)).a, 0);
await click(repl, "step", 2);
assert.equal((await state(repl)).a, 3);
await click(repl, "read");
assert.match(
  await repl.locator("[role=status]").textContent(),
  /primary|Primary/,
);
const group = figs.nth(2);
await click(group, "write", 3);
await click(group, "step", 2);
assert.equal(await group.locator('[data-transfer="receive-a"]').count(), 3);
assert.equal(await group.locator('[data-transfer="receive-b"]').count(), 3);
assert.equal((await state(group)).received, 0, "In-flight writes are not buffered yet");
await click(group, "step", 2);
let g = await state(group);
assert.equal(g.committed, 3);
assert.equal(g.a, 0);
assert.equal(g.receivedA, 3);
assert.equal(g.received, 3);
assert.equal(g.b, 0);
assert.equal(await group.locator('[data-entry-state="pending"]').count(), 6, "Both replicas show received writes waiting for apply");
assert.equal(await group.locator('[data-entry-state="applied"]').count(), 0);
assert.ok(Number(await group.locator('[data-history-strip]').getAttribute('height')) <= 80, "History stays a compact supporting strip");
await click(group, "read");
assert.match(
  await group.locator(".read-results").textContent(),
  /3 versions behind/,
);
await group.locator("[data-close]").click();
await click(group, "step", 2);
assert.equal((await state(group)).a, 1, "A applies one entry, not the received batch");
assert.equal((await state(group)).b, 0);
assert.equal(await group.locator('[data-transfer="apply-a"]').count(), 1);
assert.equal(await group.locator('[data-transfer="apply-b"]').count(), 1);
assert.equal((await state(group)).received, 3, "Buffered entries wait independently of apply");
await click(group, "step", 2);
assert.equal((await state(group)).a, 2);
await click(group, "speed");
await click(group, "catchup");
assert.equal((await state(group)).b, 3);
await click(group, "reset");
await click(group, "link");
await click(group, "write", 3);
await click(group, "step", 3);
assert.equal((await state(group)).received, 0);
await click(group, "read");
assert.match(
  await group.locator(".read-results").textContent(),
  /not a successful read/,
);
await group.locator("[data-close]").click();
await click(group, "link");
assert.equal((await state(group)).source, "cache");
await click(group, "catchup");
assert.equal((await state(group)).b, 3);
await click(group, "reset");
await click(group, "link");
await click(group, "write", 3);
await click(group, "step", 10);
assert.equal((await state(group)).membership, "expelled");
await click(group, "link");
assert.equal((await state(group)).membership, "rejoining");
assert.equal((await state(group)).source, "donor");
await click(group, "catchup");
assert.equal((await state(group)).membership, "online");
assert.equal((await state(group)).b, 3);
await click(group, "reset");
await group.locator("[data-control=latency]").selectOption("8");
await group.locator("[data-control=apply]").selectOption("8");
await click(group, "write", 4);
await click(group, "step", 5);
assert.equal((await state(group)).received, 0);
await click(group, "step", 5);
assert.equal((await state(group)).received, 4);
assert.equal((await state(group)).b, 0);
const before = await state(group);
await page.locator("#theme").click();
assert.deepEqual(await state(group), before);
const out =
  process.argv[2] ||
  process.env.VISUAL_EVIDENCE_DIR ||
  "/tmp/replication-evidence";
await mkdir(out, { recursive: true });
for (const theme of ["light", "dark"]) {
  if ((await page.locator("html").getAttribute("data-theme")) !== theme)
    await page.locator("#theme").click();
  await page.screenshot({
    path: `${out}/replication-${theme}.png`,
    fullPage: true,
  });
  for (let i = 0; i < 3; i++)
    assert(await figs.nth(i).locator("svg").isVisible());
}
await click(log, "play");
const t = (await state(log)).tick;
await page.waitForTimeout(1100);
assert((await state(log)).tick > t);
await click(log, "play");
const paused = await state(log);
await page.waitForTimeout(750);
assert.deepEqual(await state(log), paused);
assert.equal(await page.locator('[data-action="export"]').count(),0);
assert.equal(await page.getByText('Save SVG',{exact:true}).count(),0);
await page.setViewportSize({ width: 390, height: 844 });
assert(
  await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
);
await page.screenshot({
  path: `${out}/replication-mobile.png`,
  fullPage: true,
});
assert.deepEqual(errors, []);
console.log(
  "PASS: 3 figures, reads, ordered pipeline, apply/delivery lag, cache recovery, expulsion/rejoin/donor, catchup, themes, mobile, reduced motion, play/pause, no export controls; no JS errors.",
);
// Autoplay and interpolation use a second page with normal motion preferences.
const live=await browser.newPage({viewport:{width:1200,height:1000},reducedMotion:"no-preference"});
live.on("pageerror",e=>errors.push(e.message));
await live.goto(page.url());
const liveLog=live.locator('[data-figure="database-log"]');
const liveGroup=live.locator('[data-figure="group-lag"]');
await liveLog.locator('.stage').scrollIntoViewIfNeeded();
await live.waitForTimeout(180);
assert.equal(await liveLog.locator('[data-action=play]').textContent(),'Pause');
assert.equal((await state(liveLog)).submitted,1);
const stable=await liveLog.locator('svg').elementHandle();
const packet=liveLog.locator('[data-packet]').first();
const position=await packet.getAttribute('transform');
await live.waitForTimeout(100);
assert.notEqual(await packet.getAttribute('transform'),position);
assert(await stable.evaluate(el=>el.isConnected),'SVG must remain mounted between semantic ticks');
await live.waitForTimeout(1700);
assert((await state(liveLog)).tick>=2);
await liveLog.locator('[data-action=play]').click();
const pausedLive=await state(liveLog);
await live.waitForTimeout(1100);
assert.deepEqual(await state(liveLog),pausedLive);
await liveGroup.locator('.stage').scrollIntoViewIfNeeded();
await live.waitForTimeout(1100);
assert((await state(liveGroup)).tick>0,'Entering viewport starts sample traffic');
assert.deepEqual(await state(liveLog),pausedLive,'Manual pause survives scrolling');
const normalOffscreen=await state(live.locator('[data-figure="log-replication"]'));
await live.waitForTimeout(750);
assert.deepEqual(await state(live.locator('[data-figure="log-replication"]')),normalOffscreen);
await liveGroup.locator('[data-action=play]').click();
await liveGroup.locator('[data-action=replay]').click();
assert.equal((await state(liveGroup)).submitted,1);
assert((await state(liveGroup)).tick<=1);
await liveGroup.locator('.stage').scrollIntoViewIfNeeded();
await live.waitForTimeout(850);
await live.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));});
const hidden=await state(liveGroup);
await live.waitForTimeout(900);
assert.deepEqual(await state(liveGroup),hidden);
await live.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:false});document.dispatchEvent(new Event('visibilitychange'));});
await live.waitForTimeout(100);
assert((await state(liveGroup)).tick-hidden.tick<=1,'No hidden-tab catch-up jump');
await live.waitForTimeout(2600);
const performanceResult=await live.evaluate(()=>{
 const m=window.replicationAnimationMetrics;
 const sorted=[...m.costs].sort((a,b)=>a-b);
 const intervals=[...m.intervals].filter(x=>x<100).sort((a,b)=>a-b);
 return {frames:m.frames,meanMs:m.totalMs/m.frames,p95Ms:sorted[Math.floor(sorted.length*.95)],maxMs:m.maxMs,medianFrameIntervalMs:intervals[Math.floor(intervals.length*.5)],budgetMs:8.33};
});
assert(performanceResult.p95Ms<8.33,'Animation callback p95 must fit 8.33ms work budget');
await writeFile(`${out}/replication-animation-performance.json`,JSON.stringify(performanceResult,null,2));
console.log('Animation metrics:',performanceResult,'No actual 120Hz claim.');
const bounded=await browser.newPage({viewport:{width:1200,height:6000},reducedMotion:"no-preference"});
bounded.on("pageerror",e=>errors.push(e.message));
await bounded.goto(page.url());
await bounded.waitForFunction(()=>[...document.querySelectorAll('[data-figure]')].every(el=>{
 const s=JSON.parse(el.dataset.state);
 return s.submitted===6 && el.querySelector('[data-action=play]').textContent==='Play' && (s.b===6 || s.a===6 || s.p===6);
}),{},{timeout:60000});
for(const el of await bounded.locator('[data-figure]').all()){
 const s=await state(el);
 assert.equal(s.submitted,6);
 if('b' in s) {assert.equal(s.b,6);assert.equal(s.received,6);assert.equal(s.a,6);}
}
assert.equal(JSON.parse(await bounded.locator('[data-figure="log-replication"]').getAttribute('data-state')).a,6);
const finished=await bounded.locator('[data-figure]').evaluateAll(els=>els.map(el=>el.dataset.state));
await bounded.waitForTimeout(1100);
assert.deepEqual(await bounded.locator('[data-figure]').evaluateAll(els=>els.map(el=>el.dataset.state)),finished);
console.log('PASS: all three viewport samples finish six writes and stop without looping.');
assert.deepEqual(errors,[]);
const mobile=await browser.newPage({viewport:{width:390,height:844},reducedMotion:"reduce"});
mobile.on("pageerror",e=>errors.push(e.message));
await mobile.goto(page.url());
const mobileFigures=mobile.locator("[data-figure]");
for(const figure of await mobileFigures.all())await figure.locator('[data-action="step"]').click();
const mobileState=await mobileFigures.evaluateAll(els=>els.map(el=>el.dataset.state));
for(const width of [360,390,430]) {
  await mobile.setViewportSize({width,height:844});
  for(const theme of ["light","dark"]) {
    if(await mobile.locator("html").getAttribute("data-theme")!==theme)await mobile.locator("#theme").click();
    for(const figure of await mobileFigures.all()) {
      const metrics=await figure.evaluate(el=>{
        const stage=el.querySelector(".stage"),svg=stage.querySelector("svg");
        return {overflow:stage.scrollWidth>stage.clientWidth,minText:Math.min(...[...svg.querySelectorAll("text")].map(text=>parseFloat(getComputedStyle(text).fontSize)*text.getScreenCTM().a)),viewBox:svg.viewBox.baseVal.width};
      });
      assert.equal(metrics.overflow,false,"Compact replication stage must not pan horizontally");
      assert.equal(metrics.viewBox,320,"Small screens receive the vertical layout");
      assert(metrics.minText>=12,"Compact diagram labels must stay readable");
    }
    assert(await mobile.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  }
}
await mobile.setViewportSize({width:1200,height:1000});
await mobile.waitForTimeout(50);
assert.deepEqual(await mobileFigures.evaluateAll(els=>els.map(el=>el.dataset.state)),mobileState,"Desktop orientation preserves simulation state");
await mobile.setViewportSize({width:390,height:844});
await mobile.waitForTimeout(50);
assert.deepEqual(await mobileFigures.evaluateAll(els=>els.map(el=>el.dataset.state)),mobileState,"Returning to mobile preserves simulation state");
assert.deepEqual(errors,[]);
console.log("PASS: compact 360/390/430 layouts, both themes, stage/document bounds, readable labels, and resize state preservation.");
await browser.close();
