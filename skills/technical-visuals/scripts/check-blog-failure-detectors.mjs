const { chromium } = await import(
  process.env.PLAYWRIGHT_MODULE || "playwright"
);
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
const out = resolve(process.argv[2] || "/tmp/failure-detectors-evidence");
await mkdir(out, { recursive: true });
import assert from "node:assert/strict";
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({
  viewport: { width: 1280, height: 1100 },
  reducedMotion: "reduce",
});
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
await page.goto(
  new URL("../examples/blog/failure-detectors.html", import.meta.url).href,
);
const state = () =>
  page.locator("[data-figure]").getAttribute("data-state").then(JSON.parse);
const click = async (action) => {
  if (action === "reset" && await page.locator("#diagnostic").isVisible())
    return page.getByRole("button", { name: "Reset Demo", exact: true }).click();
  return page.locator(`[data-action="${action}"]`).click();
};
const step = async (n) => {
  for (let i = 0; i < n; i++) await click("step");
};
assert.equal((await state()).now, 0);
await page.waitForTimeout(150);
assert.equal((await state()).now, 0);
await step(7);
let s = await state();
assert.equal(s.now, 700);
assert.equal(s.nodes.A.received, 1);
assert.equal(s.nodes.A.start, 700);
assert.equal(s.packets.length, 4);
assert.ok(new Set(Object.values(s.nodes).map((n) => n.duration)).size > 1);
await click("crash");
assert.equal((await state()).packets.length, 4);
await step(7);
s = await state();
assert.equal(s.sent, 2);
assert.equal(s.nodes.A.received, 2);
for (
  let i = 0;
  i < 40 && !(await page.locator('[data-action="step"]').isDisabled());
  i++
)
  await click("step");
s = await state();
assert.ok(Object.values(s.nodes).some((n) => n.expired));
assert.ok(await page.locator("#diagnostic").isVisible());
assert.equal(await page.locator("#diagnostic").evaluate(el => el.matches(":modal")), true);
assert.match(await page.locator("#failure-node").textContent(), new RegExp(`Follower ${Object.keys(s.nodes).find(id => s.nodes[id].expired)}`));
assert.doesNotMatch(await page.locator("#diagnostic").textContent(), /candidate/i);
await page.screenshot({ path: `${out}/failure-popup-light.png` });
for (const theme of ["light", "dark"]) {
  if (await page.locator("html").getAttribute("data-theme") !== theme) {
    await page.keyboard.press("Escape");
    await page.locator("#theme").click();
  }
  await page.setViewportSize({ width: 360, height: 780 });
  assert.ok(await page.locator("#diagnostic").evaluate(el => {
    const r = el.getBoundingClientRect();
    return r.x >= 0 && r.right <= innerWidth && r.y >= 0 && r.bottom <= innerHeight;
  }), "Popup fits on a phone");
  const expiredId = Object.keys(s.nodes).find(id => s.nodes[id].expired);
  const palette = await page.locator('[data-node]').evaluateAll(nodes => nodes.map(n => n.getAttribute('stroke')));
  assert.equal(new Set(palette).size, 4, "Four distinct follower identities");
  assert.equal(await page.locator('#failure-node-badge').textContent(), expiredId);
  assert.equal(await page.locator('#diagnostic').evaluate(el => el.style.getPropertyValue('--node-color')),
    await page.locator(`[data-node="${expiredId}"]`).getAttribute('stroke'), "Popup matches the expired node color");
  await page.screenshot({ path: `${out}/failure-popup-phone-${theme}.png` });
}
await page.setViewportSize({ width: 1280, height: 1100 });
await click("reset");
assert.equal(await page.locator("#diagnostic").isVisible(), false);
assert.equal((await state()).now, 0);
await click("cut");
s = await state();
const cut = s.cut[0];
assert.equal(s.packets.length, 3);
await step(8);
s = await state();
assert.equal(s.nodes[cut].received, 0);
assert.ok(
  Object.entries(s.nodes)
    .filter(([id]) => id !== cut)
    .every(([, n]) => n.received === 1),
);
await click("reset");
await click("drop");
const target = (await state()).drop;
await step(7);
s = await state();
assert.equal(s.lastDrop, target);
assert.equal(s.dropped, 1);
await step(7);
assert.equal((await state()).nodes[target].received, 1);
await click("reset");
await page.locator("#nodes").fill("2");
s = await state();
assert.equal(Object.keys(s.nodes).length, 1);
await step(4);
await page.locator("#nodes").fill("5");
s = await state();
assert.equal(s.nodes.A.start, 0);
assert.equal(s.nodes.C.start, 400);
await click("reset");
await step(3);
await click("play");
await page.waitForTimeout(250);
await click("play");
assert.ok((await state()).now > 300);
await click("reset");
await step(7);
for (const theme of ["light", "dark"]) {
  if ((await page.locator("html").getAttribute("data-theme")) !== theme)
    await page.locator("#theme").click();
  const hearts = await page.locator('text[data-packet]').evaluateAll(nodes => nodes.map(n => ({ text: n.textContent, fill: n.getAttribute('fill') })));
  assert.ok(hearts.length > 0);
  const red = await page.evaluate(() => window.visualTokens[document.documentElement.dataset.theme].failure);
  for (const heart of hearts) assert.deepEqual(heart, { text: '♥', fill: red });
  const before = await state();
  await page.locator("#theme").click();
  assert.deepEqual(await state(), before);
  await page.locator("#theme").click();
  await page.screenshot({
    path: `${out}/failure-detectors-${theme}.png`,
    fullPage: true,
  });
}
await page.setViewportSize({ width: 390, height: 844 });
assert.equal(
  await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
  false,
);
await page.screenshot({
  path: `${out}/failure-detectors-mobile.png`,
  fullPage: true,
});
for (const width of [360, 390, 430]) {
  await page.setViewportSize({ width, height: 844 });
  for (const count of [2, 3, 4, 5]) {
    await click("reset");
    await page.locator("#nodes").fill(String(count));
    await step(3);
    const beforeResize = await state();
    const geometry = await page.evaluate(() => {
      const stage = document.querySelector(".stage");
      return {
        overflow: stage.scrollWidth > stage.clientWidth + 1 || document.documentElement.scrollWidth > innerWidth,
        small: [...document.querySelectorAll("#network text")].filter(node => parseFloat(getComputedStyle(node).fontSize) * node.getScreenCTM().a < 12).map(node => node.textContent),
      };
    });
    assert.equal(geometry.overflow, false, `${width}px / ${count} nodes must fit`);
    assert.deepEqual(geometry.small, [], "Mobile labels must render at least 12px");
    const pathErrors = await page.evaluate(() => {
      const state = JSON.parse(document.querySelector("[data-figure]").dataset.state);
      return state.packets.map(packet => {
        const heart = document.querySelector(`[data-packet="${packet.id}"]`);
        const route = document.querySelector(`[data-route="${packet.to}"]`);
        const x = Number(heart.getAttribute("x")), y = Number(heart.getAttribute("y"));
        const length = route.getTotalLength();
        let distance = Infinity;
        for (let i = 0; i <= 500; i++) {
          const point = route.getPointAtLength(length * i / 500);
          distance = Math.min(distance, Math.hypot(x - point.x, y - point.y));
        }
        return distance;
      });
    });
    assert.ok(pathErrors.every(distance => distance < 2), "Hearts stay on their actual routes");
    await page.setViewportSize({ width: 1200, height: 900 });
    assert.deepEqual(await state(), beforeResize, "Desktop resize preserves paused clocks");
    await page.setViewportSize({ width, height: 844 });
    assert.deepEqual(await state(), beforeResize, "Portrait resize preserves paused clocks");
  }
}
await page.setViewportSize({ width: 390, height: 844 });
for (const theme of ["light", "dark"]) {
  if (await page.locator("html").getAttribute("data-theme") !== theme) await page.locator("#theme").click();
  await page.locator("[data-figure]").screenshot({ path: `${out}/mobile-390-${theme}.png` });
}
await click("cut");
assert.equal((await state()).cut.length, 1);
await click("drop");
assert.ok((await state()).drop);
await click("crash");
assert.equal((await state()).crashed, true);
await click("reset");
assert.equal((await state()).crashed, false);
assert.deepEqual(errors, []);
console.log(
  "PASS: arrivals/reset, independent timers, crash/in-flight, cut, one-shot drop, settlement, node count, playback, themes, reduced motion, mobile, no JS errors",
);
const auto = await browser.newPage({ viewport: { width: 1280, height: 900 } });
auto.on("pageerror", (e) => errors.push(e.message));
await auto.addInitScript(() => {
  window.frameCosts = [];
  const request = window.requestAnimationFrame.bind(window);
  window.requestAnimationFrame = (callback) => request((time) => {
    const start = performance.now();
    callback(time);
    window.frameCosts.push(performance.now() - start);
  });
});
await auto.goto(process.env.BLOG_BASE_URL
  ? `${process.env.BLOG_BASE_URL}/failure-detectors.html`
  : new URL("../examples/blog/failure-detectors.html", import.meta.url).href);
const autoState = () => auto.locator("[data-figure]").getAttribute("data-state").then(JSON.parse);
await auto.locator(".stage").scrollIntoViewIfNeeded();
await auto.waitForTimeout(350);
assert.ok((await autoState()).now > 0, "visible figure autoplays");
assert.equal(await auto.locator('[data-action="export"]').count(), 0);
await auto.evaluate(() => { window.initialSvgNode = document.querySelector("#network").firstElementChild; });
await auto.waitForTimeout(100);
assert.equal(await auto.evaluate(() => window.initialSvgNode === document.querySelector("#network").firstElementChild), true, "motion preserves static SVG nodes");
await auto.locator('[data-action="play"]').click();
const paused = (await autoState()).now;
await auto.waitForTimeout(150);
assert.equal((await autoState()).now, paused);
await auto.evaluate(() => {
  document.querySelector("main").style.paddingBottom = "1600px";
  scrollTo(0, document.documentElement.scrollHeight);
});
await auto.waitForTimeout(100);
await auto.locator(".stage").scrollIntoViewIfNeeded();
await auto.waitForTimeout(150);
assert.equal((await autoState()).now, paused, "manual pause survives visibility changes");
await auto.locator('[data-action="step"]').click();
assert.equal((await autoState()).now, paused + 100);
await auto.waitForTimeout(100);
assert.equal((await autoState()).now, paused + 100);
await auto.locator('[data-action="play"]').click();
await auto.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
await auto.waitForTimeout(100);
const offscreen = (await autoState()).now;
await auto.waitForTimeout(200);
assert.equal((await autoState()).now, offscreen, "offscreen work suspends");
await auto.locator(".stage").scrollIntoViewIfNeeded();
await auto.waitForTimeout(100);
assert.ok((await autoState()).now > offscreen);
assert.ok((await autoState()).now - offscreen < 100, "offscreen time is not replayed");
await auto.evaluate(() => {
  Object.defineProperty(document, "hidden", { configurable: true, value: true });
  document.dispatchEvent(new Event("visibilitychange"));
});
const hidden = (await autoState()).now;
await auto.waitForTimeout(200);
assert.equal((await autoState()).now, hidden);
await auto.evaluate(() => {
  Object.defineProperty(document, "hidden", { configurable: true, value: false });
  document.dispatchEvent(new Event("visibilitychange"));
});
await auto.waitForTimeout(100);
assert.ok((await autoState()).now - hidden < 100, "hidden time is not replayed");
await auto.setViewportSize({ width: 390, height: 844 });
await auto.locator('.stage').scrollIntoViewIfNeeded();
const mobileRunning = (await autoState()).now;
await auto.waitForTimeout(160);
assert.ok((await autoState()).now > mobileRunning, 'Mobile autoplay continues after layout change');
await auto.locator('[data-action="play"]').click();
const mobilePaused = await autoState();
await auto.setViewportSize({ width: 430, height: 844 });
await auto.waitForTimeout(150);
assert.deepEqual(await autoState(), mobilePaused, 'Mobile resize preserves manual pause and time');
await auto.setViewportSize({ width: 390, height: 844 });
await auto.locator('[data-action="play"]').click();
await auto.locator('.stage').scrollIntoViewIfNeeded();
await auto.waitForTimeout(240);
await auto.locator('[data-figure]').screenshot({ path: `${out}/mobile-390-active.png` });
await auto.waitForTimeout(2000);
const costs = await auto.evaluate(() => window.frameCosts);
costs.sort((a, b) => a - b);
const performanceReport = {
  samples: costs.length,
  medianMs: costs[Math.floor(costs.length * 0.5)],
  p95Ms: costs[Math.floor(costs.length * 0.95)],
  maxMs: costs.at(-1),
  targetFrameBudgetMs: 1000 / 120,
  note: "Headless browser animation callback cost only; does not establish hardware refresh rate or full paint cost.",
};
assert.ok(performanceReport.p95Ms < 1000 / 120);
await writeFile(`${out}/failure-detectors-performance.json`, JSON.stringify(performanceReport, null, 2));
await auto.screenshot({ path: `${out}/failure-detectors-autoplay.png` });
assert.deepEqual(errors, []);
console.log("PASS: visible autoplay, persistent pause/step, offscreen and hidden suspension/resume, no export, callback p95 under 8.33 ms", performanceReport);
await browser.close();
