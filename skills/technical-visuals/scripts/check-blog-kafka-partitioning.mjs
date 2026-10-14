import { mkdir } from "node:fs/promises";
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE);
import assert from "node:assert/strict";
const dir = process.argv[2];
if (!dir) throw new Error("Pass an external evidence directory");
await mkdir(dir, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1250, height: 1100 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
await page.goto(
  new URL("../examples/blog/kafka-partitioning.html", import.meta.url).href,
);
assert.deepEqual(
  await page.evaluate(() =>
    ["", "a", "hello", "kafka"].map(window.kafkaPartitioning.murmur2),
  ),
  [275646681, 2731586172, 2132663229, 3496464228],
);
for (const mode of ["keyed", "round-robin"])
  for (const count of [1, 2, 3, 4, 5]) {
    await page.selectOption("#routing", mode);
    await page.selectOption("#partitions", String(count));
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
    for (let p = 0; p < count; p++) {
      const rows = state.appended.filter((r) => r.partition === p);
      assert.deepEqual(
        rows.map((r) => r.offset),
        rows.map((_, i) => i),
      );
    }
    if (mode === "keyed")
      assert.equal(new Set(state.appended.map((r) => r.partition)).size, count);
  }
await page.selectOption("#routing", "keyed");
await page.selectOption("#partitions", "3");
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
  const dl = page.waitForEvent("download");
  await page.click("#export");
  const download = await dl;
  await download.saveAs(`${dir}/kafka-${theme}.svg`);
}
await page.click("[data-action=reset]");
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
await page.screenshot({ path: `${dir}/kafka-mobile.png`, fullPage: true });
assert.ok(
  await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
);
await page.emulateMedia({ reducedMotion: "reduce" });
await page.reload();
await page.waitForTimeout(350);
assert.equal(
  JSON.parse(await page.locator("[data-figure]").getAttribute("data-state"))
    .step,
  0,
);
await page.click("[data-action=step]");
assert.equal(await page.evaluate(() => document.getAnimations().length), 0);
assert.deepEqual(errors, []);
await page.setViewportSize({ width: 1100, height: 750 });
await page.goto(`file://${dir}/kafka-light.svg`);
await page.screenshot({ path: `${dir}/kafka-export.png` });
await browser.close();
console.log(
  "PASS: 10 routing/count combinations, reference hashes, offset continuity, play/pause/reset, theme preservation, exports, mobile overflow, reduced motion, no JS errors",
);
