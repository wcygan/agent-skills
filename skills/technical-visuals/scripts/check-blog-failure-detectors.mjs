const { chromium } = await import(
  process.env.PLAYWRIGHT_MODULE || "playwright"
);
import { mkdir } from "node:fs/promises";
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
const click = (action) => page.locator(`[data-action="${action}"]`).click();
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
await click("reset");
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
await step(4);
for (const theme of ["light", "dark"]) {
  if ((await page.locator("html").getAttribute("data-theme")) !== theme)
    await page.locator("#theme").click();
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
assert.deepEqual(errors, []);
console.log(
  "PASS: arrivals/reset, independent timers, crash/in-flight, cut, one-shot drop, settlement, node count, playback, themes, reduced motion, mobile, no JS errors",
);
await browser.close();
