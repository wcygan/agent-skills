const { chromium } = await import(
  process.env.PLAYWRIGHT_MODULE || "playwright"
);
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";
const out = resolve(process.argv[2] || "/tmp/transaction-review");
await mkdir(out, { recursive: true });
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
await page.goto(
  new URL("../examples/blog/distributed-transactions.html", import.meta.url)
    .href,
);
const figure = (id) => page.locator(`[data-figure="${id}"]`);
const state = async (id) =>
  JSON.parse(await figure(id).getAttribute("data-state"));
const step = async (id, n = 1) => {
  for (let i = 0; i < n; i++)
    await figure(id).locator('[data-action="step"]').click();
};
assert.equal(await page.locator("[data-figure]").count(), 3);
await step("prepare", 3);
assert.deepEqual((await state("prepare")).locks, [true, true]);
assert.equal((await state("prepare")).record, null);
for (const a of ["YES", "NO"])
  for (const b of ["YES", "NO"]) {
    await page.selectOption("#vote-a", a);
    await page.selectOption("#vote-b", b);
    await figure("decision").locator('[data-action="reset"]').click();
    await step("decision", 3);
    let s = await state("decision");
    assert.equal(s.record, a === "YES" && b === "YES" ? "COMMIT" : "ABORT");
    assert.deepEqual(s.locks, [a === "YES", b === "YES"]);
    await step("decision", 3);
    assert.deepEqual((await state("decision")).locks, [false, false]);
  }
await page.selectOption("#vote-a", "YES");
await page.selectOption("#vote-b", "YES");
await page.selectOption("#decision", "unavailable");
await step("decision", 4);
assert.deepEqual((await state("decision")).locks, [true, true]);
await step("replicated-shards", 2);
let s = await state("replicated-shards");
assert.equal(s.count, 0);
assert.deepEqual(s.records, [
  ["PREPARE", "PREPARE", null],
  ["PREPARE", "PREPARE", null],
]);
await step("replicated-shards", 4);
s = await state("replicated-shards");
assert.equal(s.count, 2);
assert.equal(s.record, "COMMIT");
assert.equal(s.records[0][0], "PREPARE");
await step("replicated-shards", 2);
assert.equal((await state("replicated-shards")).records[1][1], "COMMIT");
for (const theme of ["light", "dark"]) {
  if ((await page.locator("html").getAttribute("data-theme")) !== theme)
    await page.click("#theme");
  for (const id of ["prepare", "decision", "replicated-shards"])
    await figure(id).screenshot({
      path: `${out}/distributed-transactions-${id}-${theme}.png`,
    });
}
const before = await state("decision");
await page.click("#theme");
assert.deepEqual(await state("decision"), before);
await figure("prepare").locator('[data-action="reset"]').click();
await figure("prepare").locator('[data-action="play"]').click();
await page.waitForTimeout(1000);
assert.match(
  await figure("prepare").locator(".event").textContent(),
  /in transit/,
);
await page.waitForTimeout(900);
assert.equal((await state("prepare")).step, 1);
await figure("prepare").locator('[data-action="play"]').click();
const paused = await state("prepare");
await page.waitForTimeout(1900);
assert.deepEqual(await state("prepare"), paused);
await figure("prepare").locator("[data-action=play]").click();
await page.evaluate(() => {
  Object.defineProperty(document, "hidden", {
    configurable: true,
    value: true,
  });
  document.dispatchEvent(new Event("visibilitychange"));
  delete document.hidden;
});
assert.equal(
  await figure("prepare").locator("[data-action=play]").textContent(),
  "Play",
);
await page.setViewportSize({ width: 390, height: 844 });
assert.equal(
  await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
  true,
);
await page.screenshot({
  path: `${out}/distributed-transactions-mobile.png`,
  fullPage: true,
});
await page.emulateMedia({ reducedMotion: "reduce" });
await page.waitForFunction(
  () =>
    document.querySelector("[data-figure=prepare] [data-action=play]").disabled,
);
assert.equal(
  await figure("prepare").locator('[data-action="play"]').isDisabled(),
  true,
);
await figure("prepare").locator('[data-action="reset"]').click();
await step("prepare");
assert.equal((await state("prepare")).step, 1);
const downloadPromise = page.waitForEvent("download");
await figure("prepare").locator('[data-action="export"]').click();
const download = await downloadPromise;
await download.saveAs(`${out}/distributed-transactions-export.svg`);
const exported = await browser.newPage({
  viewport: { width: 960, height: 444 },
});
await exported.goto(
  pathToFileURL(`${out}/distributed-transactions-export.svg`).href,
);
assert.equal(await exported.locator("svg").count(), 1);
await exported.screenshot({
  path: `${out}/distributed-transactions-export.png`,
});
assert.deepEqual(errors, []);
console.log(
  "PASS: 3 figures; all votes; durable ordering; blocked YES; local quorums; play/pause/reset/step; both themes; mobile; reduced motion; SVG download; no JS errors",
);
await browser.close();
