import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
assert.ok(process.argv[2] && process.env.PLAYWRIGHT_MODULE);
const out = path.resolve(process.argv[2]);
assert.ok(!out.startsWith(root));
await fs.mkdir(out, { recursive: true });
const { chromium } = await import(pathToFileURL(process.env.PLAYWRIGHT_MODULE));
const browser = await chromium.launch();
try {
  const page = await browser.newPage({
    viewport: { width: 390, height: 844 },
    reducedMotion: "reduce",
  });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(
    pathToFileURL(path.join(root, "examples/blog/change-data-capture.html"))
      .href,
  );
  const figure = (id) => page.locator(`[data-figure="${id}"]`);
  const state = async (id) =>
    JSON.parse(await figure(id).getAttribute("data-state"));
  const step = async (id, n = 1) => {
    for (let i = 0; i < n; i++)
      await figure(id).locator('[data-action="step"]').click();
  };
  await step("pipeline");
  assert.equal((await state("pipeline")).source, "42 · pro");
  assert.equal((await state("pipeline")).sink, "42 · free");
  await figure("pipeline").screenshot({
    path: path.join(out, "committed-before-cache.png"),
  });
  await step("pipeline", 4);
  assert.equal((await state("pipeline")).sink, "42 · pro");
  await step("backlog", 3);
  assert.equal((await state("backlog")).buffered, 3);
  assert.equal((await state("backlog")).applied, 0);
  assert.equal((await state("backlog")).worker, "Paused");
  await figure("backlog").screenshot({
    path: path.join(out, "retained-while-paused.png"),
  });
  assert.equal(
    await figure("backlog").locator('[data-mode="paused"]:visible').count(),
    1,
  );
  await step("backlog");
  assert.equal((await state("backlog")).mode, "running");
  await step("backlog");
  assert.equal((await state("backlog")).cursor, -1);
  assert.equal((await state("backlog")).applied, 0);
  await step("backlog");
  assert.equal((await state("backlog")).cursor, 0);
  assert.equal((await state("backlog")).applied, 0);
  await step("backlog");
  assert.equal((await state("backlog")).applied, 1);
  await figure("backlog").screenshot({
    path: path.join(out, "one-of-three-applied.png"),
  });
  await step("backlog", 6);
  assert.equal((await state("backlog")).applied, 3);
  assert.deepEqual(
    [0, 1, 2].map((i) => ["pro", "—", "team"][i]),
    [
      (await state("backlog")).row0,
      (await state("backlog")).row1,
      (await state("backlog")).row2,
    ],
  );
  await step("backlog", 3);
  assert.equal((await state("backlog")).duplicateIgnored, true);
  assert.equal((await state("backlog")).mode, "caught-up");
  assert.equal((await state("backlog")).row2, "team");
  const retained = await state("backlog");
  assert.ok([0, 1, 2].every((i) => retained["record" + i]));
  assert.equal(await figure("deletes").locator("[data-icon]").count(), 5);
  const families = await figure("deletes")
    .locator("[data-family]")
    .evaluateAll((es) => es.map((el) => el.dataset.family));
  assert.equal(new Set(families).size, 5);
  await step("deletes");
  assert.equal((await state("deletes")).customer, "× Deleted");
  assert.equal((await state("deletes")).order0, "Live");
  await step("deletes");
  assert.equal((await state("deletes")).order0, "× Deleted");
  assert.equal((await state("deletes")).shipment0, "Live");
  await step("deletes");
  assert.equal((await state("deletes")).shipment1, "× Deleted");
  for (const width of [390, 1200]) {
    await page.setViewportSize({ width, height: 900 });
    await page.waitForFunction(
      (w) =>
        document.querySelector('[data-figure="pipeline"] svg').viewBox.baseVal
          .width === w,
      width === 390 ? 420 : 720,
    );
    for (const theme of ["light", "dark"]) {
      if ((await page.locator("html").getAttribute("data-theme")) !== theme)
        await page.locator("#theme").click();
      for (const id of ["pipeline", "backlog", "deletes"])
        await figure(id).screenshot({
          path: path.join(out, `${id}-${width}-${theme}.png`),
        });
    }
  }
  assert.equal((await state("backlog")).duplicateIgnored, true);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.clock.install();
  for (const id of ["pipeline", "backlog", "deletes"]) {
    await figure(id).scrollIntoViewIfNeeded();
    await figure(id).locator('[data-action="replay"]').click();
    let sawPayload = false;
    for (let sample = 0; sample < 240; sample++) {
      await page.clock.runFor(250);
      const check = await figure(id).evaluate((section) => {
        const svg = section.querySelector("svg"),
          bounds = svg.getBoundingClientRect();
        const overflow = [...svg.querySelectorAll("text")]
          .filter((el) => {
            const r = el.getBoundingClientRect();
            return (
              r.width &&
              (r.left < bounds.left - 1 ||
                r.right > bounds.right + 1 ||
                r.top < bounds.top - 1 ||
                r.bottom > bounds.bottom + 1)
            );
          })
          .map((el) => el.textContent);
        const active = [...svg.querySelectorAll("[data-payload]")].filter(
          (el) => el.style.display !== "none",
        );
        return {
          overflow,
          active: active.length,
          done:
            section.querySelector('[data-action="play"]').textContent ===
            "Play",
        };
      });
      assert.deepEqual(check.overflow, [], id + " clipped content");
      sawPayload ||= check.active > 0;
      if (check.done) break;
    }
    assert.ok(sawPayload, id + " animates records");
  }
  assert.deepEqual(errors, []);
  console.log(
    JSON.stringify(
      {
        commitBeforeCache: true,
        retainedLog: true,
        orderedCatchup: true,
        sinkReplayProtection: true,
        causalCleanup: true,
        responsiveThemes: true,
        bounds: true,
        browserErrors: errors,
      },
      null,
      2,
    ),
  );
} finally {
  await browser.close();
}
