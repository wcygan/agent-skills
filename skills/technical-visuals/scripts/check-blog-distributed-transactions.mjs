const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || "playwright");
import assert from "node:assert/strict";
import {mkdir, writeFile} from "node:fs/promises";
import {resolve} from "node:path";
const out=resolve(process.argv[2] || "/tmp/transaction-review");await mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1200,height:900},reducedMotion:"reduce"});
const errors=[];page.on("pageerror",e=>errors.push(e.message));
const url=new URL("../examples/blog/distributed-transactions.html",import.meta.url).href;
await page.goto(url);
const figure=id=>page.locator(`[data-figure="${id}"]`);
const state=async id=>JSON.parse(await figure(id).getAttribute("data-state"));
const signature=async id=>figure(id).locator("svg").evaluate(svg=>{const copy=svg.cloneNode(true);copy.querySelectorAll(".phase-track,.phase-fill,.step-divider,title,desc").forEach(n=>n.remove());return copy.innerHTML;});
const step=async id=>{const prior=await signature(id);const fill=Number(await figure(id).locator(".phase-fill").getAttribute("width"));await figure(id).locator('[data-action="step"]').click();assert.notEqual(await signature(id),prior,"each step changes a visible actor, packet, vote, or completion badge");assert.ok(Number(await figure(id).locator(".phase-fill").getAttribute("width"))>=fill);};
const commit="two-phase-commit",shards="replicated-shards";
assert.equal(await page.locator("[data-figure]").count(),2);
assert.equal(await figure(commit).getAttribute("data-source-components"),"TwoPhasePrepareDemo TwoPhaseDecisionDemo");
assert.equal(await figure(commit).getAttribute("data-source-component"),"TwoPhaseCommitDemo");
await page.locator(".scenario-options summary").click();
for(const a of ["YES","NO"])for(const b of ["YES","NO"]){
  await page.selectOption("#vote-a",a);await page.selectOption("#vote-b",b);
  await figure(commit).locator('[data-action="reset"]').click();
  assert.equal(await figure(commit).locator(".phase-fill").getAttribute("width"),"0");
  assert.equal(await figure(commit).locator(".phase-track").getAttribute("aria-valuemax"),"8");
  await step(commit);await step(commit);
  assert.equal((await state(commit)).count,0);assert.deepEqual((await state(commit)).locks,[a==="YES",b==="YES"]);
  await step(commit);assert.equal((await state(commit)).count,1);
  assert.deepEqual(await figure(commit).locator(".vote-badge").evaluateAll(bs=>bs.map(b=>b.dataset.received)),["true","false"]);
  assert.match(await figure(commit).locator("svg").textContent(),new RegExp(`A · ${a}`));
  assert.equal((await state(commit)).phase1Complete,false);
  await step(commit);assert.equal((await state(commit)).phase1Complete,true);assert.equal((await state(commit)).record,null);
  assert.match(await figure(commit).locator("svg").textContent(),new RegExp(`B · ${b}`));
  await step(commit);assert.equal((await state(commit)).record,a==="YES"&&b==="YES"?"COMMIT":"ABORT");
  assert.deepEqual((await state(commit)).locks,[a==="YES",b==="YES"]);assert.equal((await state(commit)).phase2Complete,false);
  await step(commit);assert.deepEqual((await state(commit)).locks,[false,b==="YES"]);
  await step(commit);assert.deepEqual((await state(commit)).locks,[false,false]);assert.equal((await state(commit)).phase2Complete,false);
  await step(commit);assert.equal((await state(commit)).phase2Complete,true);
}
await page.selectOption("#vote-a","YES");await page.selectOption("#vote-b","YES");await page.selectOption("#decision","unavailable");
for(let i=0;i<6;i++)await step(commit);
assert.equal((await state(commit)).blocked,true);assert.deepEqual((await state(commit)).locks,[true,true]);assert.equal((await state(commit)).phase1Complete,true);assert.equal((await state(commit)).phase2Complete,false);
assert.equal(await figure(shards).locator('.shard-member[data-member="leader"]').count(),2);assert.equal(await figure(shards).locator('.shard-member[data-member="replica"]').count(),4);
assert.deepEqual(await figure(shards).locator(".coordinator-route").evaluateAll(ps=>ps.map(p=>p.getAttribute("d"))),["M480 148 L480 214 L250 214 L250 290","M480 148 L480 214 L710 214 L710 290"]);
await step(shards);assert.doesNotMatch((await figure(shards).locator("svg text").allTextContents()).join(" "),/majority/);
assert.equal(await figure(shards).locator('.message-label[data-label="PREPARE"]').count(),2);
assert.ok(await figure(shards).locator('.message-label[data-label="PREPARE"]').evaluateAll(labels=>labels.every(label=>{
  const b=label.getBBox();
  return b.y+b.height < 210 && b.x > 260 && b.x+b.width < 700 && !(b.x<=480 && b.x+b.width>=480);
})), "PREPARE labels clear horizontal and vertical route segments");
await step(shards);assert.match(await figure(shards).locator("svg").textContent(),/2\/3 · majority/);assert.equal((await state(shards)).count,0);
while((await state(shards)).step < 6)await step(shards);
assert.equal((await state(shards)).acks,0);
assert.equal(await figure(shards).locator('[data-action="step"]').isDisabled(),false,"local commit still waits for leader ACKs");
await step(shards);
assert.equal((await state(shards)).acks,2);
assert.equal(await figure(shards).locator('[data-action="step"]').isDisabled(),true);
assert.equal(await figure(shards).locator('.message-label[data-label="ACK"]').count(),2);
assert.match(await figure(shards).locator(".event").textContent(),/Both leaders acknowledged/);
assert.deepEqual((await state(shards)).records,[["COMMIT","COMMIT",null],["COMMIT","COMMIT",null]]);
await page.locator(".scenario-options summary").click();
for(const theme of ["light","dark"]){if(await page.locator("html").getAttribute("data-theme")!==theme)await page.click("#theme");for(const id of [commit,shards])await figure(id).screenshot({path:`${out}/${id}-${theme}.png`});}
const before=await state(commit);await page.click("#theme");assert.deepEqual(await state(commit),before);
await page.setViewportSize({width:390,height:844});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);await page.screenshot({path:`${out}/mobile.png`,fullPage:true});
assert.equal(await page.locator('[data-action="export"]').count(),0);
await page.locator(".scenario-options summary").click();
await page.selectOption("#decision", "available");
await page.locator(".scenario-options summary").click();
const mobileChecks=[];
for (const width of [360, 390, 430]) {
  await page.setViewportSize({width,height:844});
  for (const theme of ["light", "dark"]) {
    if(await page.locator("html").getAttribute("data-theme")!==theme) await page.click("#theme");
    for (const id of [commit,shards]) {
      await figure(id).locator('[data-action="reset"]').click();
      const inspect=async()=>{
        const result=await figure(id).evaluate(section=>{
          const stage=section.querySelector(".stage"),svg=stage.querySelector("svg"),scale=svg.getBoundingClientRect().width/svg.viewBox.baseVal.width;
          const labels=[...svg.querySelectorAll("text")];
          return {width:svg.viewBox.baseVal.width,overflow:stage.scrollWidth-stage.clientWidth,minFont:Math.min(...labels.map(t=>Number(t.getAttribute("font-size"))*scale)),clipped:labels.filter(t=>{const b=t.getBBox();return b.x<0 || b.y<0 || b.x+b.width>svg.viewBox.baseVal.width || b.y+b.height>svg.viewBox.baseVal.height;}).map(t=>t.textContent)};
        });
        assert.equal(result.width,360);assert.ok(result.overflow<=1);assert.ok(result.minFont>=12,`phone labels readable: ${result.minFont}`);assert.deepEqual(result.clipped,[]);
        mobileChecks.push({viewport:width,theme,figure:id,step:(await state(id)).step,...result});
      };
      await inspect();
      while(!await figure(id).locator('[data-action="step"]').isDisabled()){await step(id);await inspect();}
      await figure(id).screenshot({path:`${out}/${id}-${width}-${theme}.png`});
      const frozen=await state(id);
      await page.setViewportSize({width:1200,height:900});await page.waitForFunction(() => document.querySelector(".stage svg").viewBox.baseVal.width===960);assert.deepEqual(await state(id),frozen);assert.equal(await figure(id).locator("svg").getAttribute("viewBox"),id===commit?"0 0 960 542":"0 0 960 670");
      await page.setViewportSize({width,height:844});await page.waitForFunction(() => document.querySelector(".stage svg").viewBox.baseVal.width===360);assert.deepEqual(await state(id),frozen);assert.equal(await figure(id).locator('[data-action="play"]').textContent(),"Play");
    }
  }
}
await writeFile(`${out}/mobile-checks.json`,JSON.stringify(mobileChecks,null,2));
const motion=await browser.newPage({viewport:{width:1200,height:900},reducedMotion:"no-preference"});motion.on("pageerror",e=>errors.push(e.message));await motion.goto(url);
const cf=motion.locator(`[data-figure="${commit}"]`);await cf.scrollIntoViewIfNeeded();await motion.waitForTimeout(1200);
assert.equal(JSON.parse(await cf.getAttribute("data-state")).step,0);
await motion.waitForFunction(()=>JSON.parse(document.querySelector('[data-figure="two-phase-commit"]').dataset.state).step===1);
await cf.locator('[data-action="play"]').click();await cf.locator('[data-action="step"]').click();
await cf.locator('[data-action="play"]').click();await motion.waitForTimeout(1200);assert.equal(JSON.parse(await cf.getAttribute("data-state")).count,0);
await motion.evaluate(()=>window.packetSVG=document.querySelector('[data-figure="two-phase-commit"] svg'));await motion.waitForTimeout(200);assert.equal(await motion.evaluate(()=>window.packetSVG===document.querySelector('[data-figure="two-phase-commit"] svg')),true);
await motion.waitForFunction(()=>JSON.parse(document.querySelector('[data-figure="two-phase-commit"]').dataset.state).count===1);await cf.locator('[data-action="play"]').click();
const paused=await cf.getAttribute("data-state");await motion.waitForTimeout(700);assert.equal(await cf.getAttribute("data-state"),paused);
await motion.setViewportSize({width:390,height:844});await motion.waitForFunction(()=>document.querySelector(".stage svg").viewBox.baseVal.width===360);assert.equal(await cf.getAttribute("data-state"),paused);assert.equal(await cf.locator('[data-action="play"]').textContent(),"Play");await cf.screenshot({path:`${out}/first-vote-phone.png`});
await motion.setViewportSize({width:1200,height:900});await motion.waitForFunction(()=>document.querySelector(".stage svg").viewBox.baseVal.width===960);assert.equal(await cf.getAttribute("data-state"),paused);assert.equal(await cf.locator('[data-action="play"]').textContent(),"Play");
for(const theme of ["light","dark"]){if(await motion.locator("html").getAttribute("data-theme")!==theme)await motion.click("#theme");await cf.screenshot({path:`${out}/first-vote-${theme}.png`});}
await motion.locator('[data-figure="replicated-shards"]').scrollIntoViewIfNeeded();await cf.scrollIntoViewIfNeeded();assert.equal(await cf.locator('[data-action="play"]').textContent(),"Play");
const sf = motion.locator('[data-figure="replicated-shards"]');
await sf.scrollIntoViewIfNeeded();
await sf.locator('[data-action="reset"]').click();
await sf.locator('[data-action="play"]').click();
for (let i = 0; i < 6; i++) await sf.locator('[data-action="step"]').click();
await sf.locator('[data-action="play"]').click();
await motion.waitForTimeout(1200);
assert.equal(JSON.parse(await sf.getAttribute('data-state')).acks, 0, 'ACKs remain unreceived during return flight');
assert.equal(await sf.locator('.message-packet').count(), 2);
assert.equal(await sf.locator('.message-label[data-label="ACK"]').count(), 2);
await motion.waitForFunction(() => JSON.parse(document.querySelector('[data-figure="replicated-shards"]').dataset.state).acks === 2);
assert.equal(await sf.locator('[data-action="step"]').isDisabled(), true);
await sf.screenshot({path: `${out}/ack-complete.png`});
assert.deepEqual(errors,[]);await writeFile(`${out}/result.json`,JSON.stringify({figures:2,originalSourceFigures:3,allVotes:true,phaseBoundaries:true,causalArrivals:true,meaningfulSteps:true,localMajority:true,errors},null,2));
console.log("PASS: merged continuous 2PC; all votes; phase boundaries; durable-before-delivery; blocked YES; meaningful steps; cumulative progress; causal arrival; majority; both themes; mobile; reduced motion; pause/step/replay; stable SVG; no errors/export");await browser.close();
