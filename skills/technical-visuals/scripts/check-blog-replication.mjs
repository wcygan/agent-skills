const { chromium } = await import(
  process.env.PLAYWRIGHT_MODULE || "playwright"
);
import { mkdir } from "node:fs/promises";
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
await click(group, "step", 4);
let g = await state(group);
assert.equal(g.committed, 3);
assert.equal(g.a, 3);
assert.equal(g.received, 3);
assert.equal(g.b, 0);
await click(group, "read");
assert.match(
  await group.locator(".read-results").textContent(),
  /3 versions behind/,
);
await group.locator("[data-close]").click();
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
await click(group, "step", 4);
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
await page.waitForTimeout(800);
assert((await state(log)).tick > t);
await click(log, "play");
const paused = await state(log);
await page.waitForTimeout(750);
assert.deepEqual(await state(log), paused);
const downloadPromise = page.waitForEvent("download");
await click(group, "export");
const download = await downloadPromise;
await download.saveAs(`${out}/replication-export.svg`);
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
  "PASS: 3 figures, reads, ordered pipeline, apply/delivery lag, cache recovery, expulsion/rejoin/donor, catchup, themes, mobile, reduced motion, play/pause, SVG export; no JS errors.",
);
await browser.close();
