import { mkdir } from "node:fs/promises";
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE);
import assert from "node:assert/strict";
const dir = process.argv[2];
if (!dir) throw new Error("Pass an external evidence directory");
await mkdir(dir, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1250, height: 250 },
  hasTouch: true,
});
const setPartitions = async value => page.locator('#partitions').evaluate((el,value)=>{el.value=String(value);el.dispatchEvent(new Event('input',{bubbles:true}));},value);
const resetPaused = async () => {
  await page.locator('[data-action=reset]').click();
  if((await page.locator('[data-action=play]').textContent()).trim()==='Pause') await page.locator('[data-action=play]').click();
};
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
await page.goto(
  new URL("../examples/blog/kafka-partitioning.html", import.meta.url).href,
);
assert.equal(await page.locator("#export").count(), 0);
await page.waitForTimeout(1300);
assert.equal(
  JSON.parse(await page.locator("[data-figure]").getAttribute("data-state"))
    .step,
  0,
  "offscreen initial load stays idle",
);
const revealAt=Date.now();
await page.setViewportSize({ width: 1250, height: 1100 });
const state = () => page.locator("[data-figure]").getAttribute("data-state");
await page.waitForFunction(
  () =>
    JSON.parse(document.querySelector("[data-figure]").dataset.state).step ===
    1,
);
assert.ok(Date.now()-revealAt<1000,'First visible flight starts without the old 2.3-second wait');
assert.equal(await page.locator('#speed').inputValue(),'1.5');
assert.equal(await page.locator('#packet').evaluate(el=>el.getAnimations()[0].effect.getTiming().duration),1200);
const packetPosition = () =>
  page.locator("#packet").evaluate((node) => {
    const matrix = node.getCTM();
    return [matrix.e, matrix.f];
  });
await page.waitForTimeout(250);
const earlyPosition = await packetPosition();
assert.equal(JSON.parse(await state()).appended.length, 0);
await page.waitForTimeout(650);
const middlePosition = await packetPosition();
assert.notDeepEqual(
  middlePosition,
  earlyPosition,
  "packet visibly moves during flight",
);
assert.equal(
  JSON.parse(await state()).appended.length,
  0,
  "no append during flight",
);
await page.waitForFunction(() => {
  const animation = document.querySelector("#packet")?.getAnimations()[0];
  return (
    animation && animation.currentTime >= animation.effect.getTiming().duration
  );
});
const arrivedPosition = await packetPosition();
assert.notDeepEqual(arrivedPosition, middlePosition);
assert.equal(
  JSON.parse(await state()).appended.length,
  0,
  "settled packet holds before append",
);
await page.waitForTimeout(150);
assert.equal(JSON.parse(await state()).appended.length, 0);
assert.deepEqual(await packetPosition(), arrivedPosition);
await page.waitForFunction(
  () =>
    JSON.parse(document.querySelector("[data-figure]").dataset.state).step ===
    2,
);
assert.equal(
  JSON.parse(await state()).appended.length,
  1,
  "append follows arrival",
);
await resetPaused();
await page.click("[data-action=play]");
await page.waitForFunction(
  () =>
    JSON.parse(document.querySelector("[data-figure]").dataset.state).step ===
    1,
);
await page.waitForTimeout(800);
await page.evaluate(() => document.querySelector("[data-action=play]").click());
await page.waitForTimeout(60);
const frozen = await page.evaluate(
  () => document.querySelector("#packet").getAnimations()[0].currentTime,
);
const pausedState = await state();
await page.waitForTimeout(250);
assert.equal(await state(), pausedState);
assert.equal(
  await page.evaluate(
    () => document.querySelector("#packet").getAnimations()[0].currentTime,
  ),
  frozen,
);
await page.click("#theme");
assert.equal(
  await page.evaluate(
    () => document.querySelector("#packet").getAnimations()[0].currentTime,
  ),
  frozen,
);
await page.screenshot({
  path: `${dir}/kafka-paused-flight.png`,
  fullPage: true,
});
await page.evaluate(() => document.querySelector("[data-action=play]").click());
await page.waitForTimeout(120);
assert.ok(
  (await page.evaluate(
    () => document.querySelector("#packet").getAnimations()[0].currentTime,
  )) > frozen,
);
await page.setViewportSize({ width: 1250, height: 250 });
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(80);
const offscreen = await state();
await page.waitForTimeout(1400);
assert.equal(await state(), offscreen);
await page.setViewportSize({ width: 1250, height: 1100 });
await page.waitForTimeout(30);
assert.equal(await state(), offscreen, "resume has no elapsed-time catchup");
await page.evaluate(() => {
  Object.defineProperty(document, "hidden", {
    configurable: true,
    value: true,
  });
  document.dispatchEvent(new Event("visibilitychange"));
});
const hiddenState = await state();
await page.waitForTimeout(1400);
assert.equal(await state(), hiddenState);
await page.evaluate(() => {
  delete document.hidden;
  document.dispatchEvent(new Event("visibilitychange"));
  document.querySelector("[data-action=play]").click();
});
await resetPaused();
await page.click("[data-action=step]");
const manual = await state();
await page.waitForTimeout(1300);
assert.equal(await state(), manual, "manual step stays paused");
assert.deepEqual(
  await page.evaluate(() =>
    ["", "a", "hello", "kafka"].map(window.kafkaPartitioning.murmur2),
  ),
  [275646681, 2731586172, 2132663229, 3496464228],
);
await page.locator(".routing-settings").evaluate(el => el.open = true);
for (const mode of ["keyed", "round-robin"])
  for (const count of [1, 2, 3, 4, 5]) {
    await page.locator(`[data-mode="${mode}"]`).click();
    await setPartitions(count);
    const initial = await page
      .locator("[data-figure]")
      .getAttribute("data-state");
    await page.click("[data-action=step]");
    assert.notEqual(
      await page.locator("[data-figure]").getAttribute("data-state"),
      initial,
    );
    for (let i = 1; i < 18; i++) await page.click("[data-action=step]");
    const state = JSON.parse(
      await page.locator("[data-figure]").getAttribute("data-state"),
    );
    assert.equal(state.appended.length, 9);
    if (mode === "keyed") {
      const styles = await page.locator('[data-record-key]').evaluateAll(cards => cards.map(card => ({key:card.dataset.recordKey, stroke:card.querySelector('rect').getAttribute('stroke')})));
      for (const r of state.appended) {
        const expected = await page.locator(`[data-key-map="${r.key}"]`).evaluate(chip => chip.style.getPropertyValue('--key'));
        assert.equal(styles.find(card => card.key === r.key).stroke, expected, "The visible record keeps its key-map color");
        assert.equal(Number(await page.locator(`[data-key-map="${r.key}"]`).getAttribute('data-partition-map')),r.partition);
      }
    }
    for (let p = 0; p < count; p++) {
      const rows = state.appended.filter((r) => r.partition === p);
      const lane = page.locator(`[data-partition="${p}"]`);
      assert.equal(
        Number(await lane.getAttribute("data-capacity")),
        rows.length,
      );
      assert.equal(
        Number(await lane.locator("rect").first().getAttribute("width")),
        Math.max(...Array.from({length:count},(_,p)=>state.appended.filter(r=>r.partition===p).length))*64+28,
        "tray fits exact capacity",
      );
      assert.deepEqual(
        rows.map((r) => r.offset),
        rows.map((_, i) => i),
      );
    }
    if (mode === "keyed") {
      for (const key of new Set(state.appended.map(r=>r.key)))
        assert.equal(new Set(state.appended.filter(r=>r.key===key).map(r=>r.partition)).size,1,"Repeated keys retain their destination");
      if(count===3) assert.equal(new Set(state.appended.map(r=>r.partition)).size,3);
    }
  }
await page.locator('[data-mode="keyed"]').click();
await setPartitions(3);
for (let i = 0; i < 18; i++) await page.click("[data-action=step]");
for (const theme of ["light", "dark"]) {
  if ((await page.locator("html").getAttribute("data-theme")) !== theme)
    await page.click("#theme");
  assert.equal(
    JSON.parse(await page.locator("[data-figure]").getAttribute("data-state"))
      .step,
    18,
  );
  await page.screenshot({ path: `${dir}/kafka-${theme}.png`, fullPage: true });
}
await resetPaused();
await page.selectOption("#speed", "8");
await page.click("[data-action=play]");
await page.waitForTimeout(200);
await page.click("[data-action=play]");
const paused = await page.locator("[data-figure]").getAttribute("data-state");
await page.waitForTimeout(250);
assert.equal(
  await page.locator("[data-figure]").getAttribute("data-state"),
  paused,
);
await page.setViewportSize({ width: 390, height: 844 });
await page.waitForFunction(
  () => document.querySelector("#diagram").viewBox.baseVal.width === 320,
);
await setPartitions(3);
await page.locator('#partitions').focus();
await page.locator('#partitions').press('ArrowRight');
assert.equal(JSON.parse(await state()).count,4);
assert.equal(await page.locator('#partition-count').textContent(),'4');
await page.locator('#partitions').press('ArrowLeft');
assert.equal(JSON.parse(await state()).count,3);
for (const width of [360, 390, 430]) {
  await page.setViewportSize({ width, height: 844 });
  assert(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  );
  assert(
    await page
      .locator(".stage")
      .evaluate((el) => el.scrollWidth <= el.clientWidth + 1),
  );
  assert(
    await page
      .locator("#diagram")
      .evaluate((svg) =>
        [...svg.querySelectorAll("text")].every(
          (t) =>
            parseFloat(getComputedStyle(t).fontSize) * t.getScreenCTM().a >= 12,
        ),
      ),
  );
  assert(
    await page
      .locator(".controls button,.controls select")
      .evaluateAll((els) =>
        els.every(
          (el) =>
            el.getBoundingClientRect().height >= 44 &&
            el.getBoundingClientRect().width >= 44,
        ),
      ),
  );
  assert(
    await page
      .locator("select")
      .evaluateAll((els) =>
        els.every((el) => parseFloat(getComputedStyle(el).fontSize) >= 16),
      ),
  );
}
await page.setViewportSize({ width: 390, height: 844 });
for (const count of [1, 2, 3, 4, 5]) {
  await setPartitions(count);
  for (let i = 0; i < 18; i++) await page.click("[data-action=step]");
  const completed = JSON.parse(await state());
  assert.equal(completed.appended.length, 9);
  assert.equal(await page.locator("[data-slot-offset]").count(), 9);
  for (let p = 0; p < count; p++)
    assert.equal(
      await page.locator(`[data-partition="${p}"] [data-slot-offset]`).count(),
      completed.appended.filter((r) => r.partition === p).length,
    );
  assert(
    await page
      .locator(".stage")
      .evaluate((el) => el.scrollWidth <= el.clientWidth + 1),
  );
  await page
    .locator("#diagram")
    .screenshot({ path: `${dir}/mobile-partitions-${count}.png` });
}
await setPartitions(3);
await page.selectOption("#speed", "1");
await page.locator("[data-action=play]").tap();
await page.waitForFunction(
  () =>
    JSON.parse(document.querySelector("[data-figure]").dataset.state).step ===
    1,
);
await page.locator("[data-action=play]").tap();
const mobileState = await state();
assert.equal(JSON.parse(mobileState).appended.length, 0);
const routeProof = await page.evaluate(() => {
  const packet = document.querySelector("#packet"),
    anim = packet.getAnimations()[0],
    points = JSON.parse(
      document.querySelector("[data-packet-route]").dataset.packetRoute,
    );
  const duration = anim.effect.getTiming().duration;
  return { duration, points };
});
assert.equal(routeProof.duration, 1800);
for (const fraction of [0, 0.25, 0.5, 0.75, 1]) {
  const distance = await page.evaluate((f) => {
    const packet = document.querySelector("#packet"),
      anim = packet.getAnimations()[0];
    anim.currentTime = f * 1800;
    const point = new DOMPoint(17, 15)
        .matrixTransform(packet.getCTM())
        .matrixTransform(document.querySelector("#diagram").getCTM().inverse()),
      x = point.x,
      y = point.y,
      points = JSON.parse(
        document.querySelector("[data-packet-route]").dataset.packetRoute,
      );
    return Math.min(
      ...points.slice(1).map((b, i) => {
        const a = points[i],
          dx = b[0] - a[0],
          dy = b[1] - a[1],
          v = Math.max(
            0,
            Math.min(
              1,
              ((x - a[0]) * dx + (y - a[1]) * dy) / (dx * dx + dy * dy || 1),
            ),
          );
        return Math.hypot(x - a[0] - v * dx, y - a[1] - v * dy);
      }),
    );
  }, fraction);
  assert(distance < 0.1, "packet center follows the displayed path");
  assert(
    await page.locator("#packet").evaluate((el) => {
      const r = el.getBoundingClientRect(),
        s = document.querySelector("#diagram").getBoundingClientRect();
      return r.left >= s.left && r.right <= s.right;
    }),
    "flying key chip stays inside the mobile view",
  );
}
await page.evaluate(
  () =>
    (document.querySelector("#packet").getAnimations()[0].currentTime = 900),
);
for (const theme of ["light", "dark"]) {
  if ((await page.locator("html").getAttribute("data-theme")) !== theme)
    await page.locator("#theme").tap();
  assert.equal(await state(), mobileState);
  await page
    .locator("[data-figure]")
    .screenshot({ path: `${dir}/kafka-mobile-${theme}-flight.png` });
}
const preservedTime = await page.evaluate(
  () => document.querySelector("#packet").getAnimations()[0].currentTime,
);
await page.setViewportSize({ width: 1200, height: 1000 });
await page.waitForFunction(
  () => document.querySelector("#diagram").viewBox.baseVal.width === 1060,
);
for (const fraction of [0,.25,.5,.75,1]) {
  const distance = await page.evaluate(f => {
    const packet=document.querySelector('#packet'),a=packet.getAnimations()[0],route=document.querySelector('[data-packet-route]');
    const saved=a.currentTime;a.currentTime=f*a.effect.getTiming().duration;
    const center=new DOMPoint(17,15).matrixTransform(packet.getCTM()).matrixTransform(route.getCTM().inverse());
    const length=route.getTotalLength();let min=Infinity;
    for(let i=0;i<=5000;i++){const p=route.getPointAtLength(length*i/5000);min=Math.min(min,Math.hypot(center.x-p.x,center.y-p.y));}
    a.currentTime=saved;return min;
  },fraction);
  assert.ok(distance<.15,`Desktop packet center is ${distance}px from its actual visible path`);
}

assert.equal(await state(), mobileState);
assert.equal(
  await page.evaluate(
    () => document.querySelector("#packet").getAnimations()[0].currentTime,
  ),
  preservedTime,
);
await page.setViewportSize({ width: 390, height: 844 });
await page.waitForFunction(
  () => document.querySelector("#diagram").viewBox.baseVal.width === 320,
);
assert.equal(await state(), mobileState);
assert.equal(
  await page.evaluate(
    () => document.querySelector("#packet").getAnimations()[0].currentTime,
  ),
  preservedTime,
);
await page.locator("[data-action=play]").tap();
await page.waitForTimeout(100);
await page.locator("[data-action=play]").tap();
assert(
  (await page.evaluate(
    () => document.querySelector("#packet").getAnimations()[0].currentTime,
  )) > preservedTime,
);
await page.locator("[data-action=reset]").tap();
assert.equal(JSON.parse(await state()).step, 1);
assert.equal(JSON.parse(await state()).appended.length, 0);
assert.equal((await page.locator('[data-action=play]').textContent()).trim(), 'Pause');
await page.locator('[data-mode="round-robin"]').click();
assert.equal(JSON.parse(await state()).mode, "round-robin");
await page.screenshot({ path: `${dir}/kafka-mobile.png`, fullPage: true });
await page.emulateMedia({ reducedMotion: "reduce" });
await page.reload();
await page.waitForTimeout(1300);
assert.ok(await page.locator('[data-action="play"]').isDisabled());
assert.equal(
  JSON.parse(await page.locator("[data-figure]").getAttribute("data-state"))
    .step,
  0,
);
await page.click("[data-action=step]");
assert.equal(await page.evaluate(() => document.getAnimations().length), 0);
assert.deepEqual(errors, []);
await browser.close();
console.log(
  "PASS: 10 routing/count combinations, reference hashes, exact tray capacities, actual midflight movement, append after arrival/hold, offset continuity, play/pause/reset, theme preservation, visible autoplay, offscreen/hidden suspension, frozen packet pause/resume, mobile overflow, reduced motion, no JS errors",
);
