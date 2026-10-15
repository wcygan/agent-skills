import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), ".."),
  out = path.resolve(process.argv[2]);
assert(!out.startsWith(root + path.sep));
await fs.mkdir(out, { recursive: true });
const { chromium } = await import(pathToFileURL(process.env.PLAYWRIGHT_MODULE));
const b = await chromium.launch(),
  errors = [];
const url = pathToFileURL(
  path.join(root, "examples/blog/the-big-database-at-work.html"),
).href;
try {
  const p = await b.newPage({
    viewport: { width: 1200, height: 950 },
    reducedMotion: "reduce",
  });
  p.on("pageerror", (e) => errors.push(e.message));
  await p.goto(url);
  const scene = p.locator("[data-figure=working-set-budget]"),
    state = async () => JSON.parse(await scene.getAttribute("data-state"));
  assert.equal((await state()).used, 33);
  assert.equal(await p.locator("[data-disk-block]").count(), 152);
  assert.equal(await p.locator("[data-slot]").count(), 100);
  for (let n = 34; n <= 56; n++) {
    await p
      .locator("[data-figure=working-set-budget] [data-action=step]")
      .click();
    assert.equal((await state()).used, n);
    assert.equal((await state()).free, 100 - n);
    assert.equal(await p.locator(".occupied").count(), n);
  }
  for (const width of [1200, 390, 360, 430])
    for (const theme of ["light", "dark"]) {
      await p.setViewportSize({ width, height: 950 });
      if ((await p.locator("html").getAttribute("data-theme")) !== theme)
        await p.locator("#theme").click();
      assert.equal((await state()).used, 56, "Reflow and theme preserve usage");
      assert.equal(
        await scene.locator(".occupied").count(),
        56,
        "Rebuilt cells retain their visible occupied state",
      );
      assert.equal(
        await scene.locator(".empty").count(),
        44,
        "Rebuilt cells retain their visible free state",
      );
      assert(
        await p.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
      );
      const panels = await p
        .locator("[data-resource-panel]")
        .evaluateAll((es) =>
          es.map((e) => ({
            w: Number(e.getAttribute("width")),
            h: Number(e.getAttribute("height")),
          })),
        );
      assert.deepEqual(
        panels[0],
        panels[1],
        "Disk and RAM panels share dimensions",
      );
      assert.equal(panels[0].w, panels[0].h, "Both panels are square");
      for (const role of ["disk", "ram"]) {
        const above = await p
          .locator(`[data-resource-icon=${role}]`)
          .evaluate((e) => {
            const icon = e.getBoundingClientRect(),
              panel = document
                .querySelector(
                  `[data-resource-panel=${e.dataset.resourceIcon}]`,
                )
                .getBoundingClientRect();
            return (
              icon.bottom < panel.top &&
              Math.abs(
                (icon.left + icon.right) / 2 - (panel.left + panel.right) / 2,
              ) < 8
            );
          });
        assert(above, "Resource icons are centered above their panels");
      }
      const invalid = await p
        .locator("[data-figure=working-set-budget] .stage text")
        .evaluateAll((es) =>
          es
            .filter((e) => {
              let box = e.getBBox(),
                scale = e.getScreenCTM().a;
              return (
                box.x < 0 ||
                box.x + box.width >
                  e.ownerSVGElement.viewBox.baseVal.width + 0.1 ||
                parseFloat(getComputedStyle(e).fontSize) * scale < 12
              );
            })
            .map((e) => e.textContent),
        );
      assert.deepEqual(invalid, []);
      if (width === 1200 || width === 390)
        await scene.screenshot({
          path: path.join(out, `lab-${width}-${theme}.png`),
        });
    }
  await p
    .locator("[data-figure=working-set-budget] [data-action=reset]")
    .click();
  assert.equal((await state()).used, 33);
  assert.equal((await state()).playing, false);
  await p.locator("[data-figure=working-set-budget] input").fill("45");
  assert.equal((await state()).free, 55);
  const live = await b.newPage({ viewport: { width: 1200, height: 950 } });
  live.on("pageerror", (e) => errors.push(e.message));
  await live.goto(url);
  await live
    .locator("[data-figure=working-set-budget]")
    .scrollIntoViewIfNeeded();
  await live.waitForTimeout(250);
  let a = JSON.parse(
    await live
      .locator("[data-figure=working-set-budget]")
      .getAttribute("data-state"),
  );
  assert.equal(a.used, 33, "Usage does not change before arrival");
  assert(a.elapsed > 0);
  const routeCheck = await live
    .locator("[data-budget-packet]")
    .evaluate((e) => {
      const m = e.transform.baseVal.consolidate().matrix,
        p = document.querySelector("[data-transfer-route]"),
        a = p.getPointAtLength(0),
        b = p.getPointAtLength(p.getTotalLength());
      return Math.abs(m.f - a.y) < 0.01 && m.e >= a.x && m.e <= b.x;
    });
  assert(routeCheck);
  await live.waitForTimeout(650);
  assert(
    JSON.parse(
      await live
        .locator("[data-figure=working-set-budget]")
        .getAttribute("data-state"),
    ).used >= 34,
  );
  await live
    .locator("[data-figure=working-set-budget] [data-action=play]")
    .click();
  const paused = await live
    .locator("[data-figure=working-set-budget]")
    .getAttribute("data-state");
  await live.waitForTimeout(150);
  assert.equal(
    await live
      .locator("[data-figure=working-set-budget]")
      .getAttribute("data-state"),
    paused,
  );
  await live
    .locator("[data-figure=working-set-budget] [data-action=reset]")
    .click();
  await live.waitForTimeout(100);
  assert(
    JSON.parse(
      await live
        .locator("[data-figure=working-set-budget]")
        .getAttribute("data-state"),
    ).playing,
  );
  assert.deepEqual(errors, []);
  console.log(
    JSON.stringify({ passed: true, slotArrivals: 23, views: 8, errors }),
  );
} finally {
  await b.close();
}
