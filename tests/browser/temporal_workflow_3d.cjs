// Run with Playwright installed: node tests/browser/temporal_workflow_3d.cjs
const { chromium } = require("playwright");
const { pathToFileURL } = require("node:url");
const path = require("node:path");
const assert = require("node:assert/strict");
(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({
      viewport: { width: 1400, height: 1600 },
    });
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto(
      pathToFileURL(
        path.resolve(
          __dirname,
          "../../skills/style-technical-visuals/references/standalone-3d/temporal-workflow.html",
        ),
      ).href,
    );
    await page.locator("#play").click();
    await page.evaluate(() => {
      window.keptNode = document.querySelector("#validate");
      window.keptSide = document.querySelector(".block-side");
      window.keptWire = document.querySelector("#wire-start");
      window.allocations = 0;
      const create = document.createElementNS.bind(document);
      document.createElementNS = (...args) => {
        window.allocations++;
        return create(...args);
      };
    });
    await page.locator("#step").click();
    await page.waitForTimeout(120);
    const pos = () =>
      page
        .locator("#packets circle")
        .first()
        .evaluate((e) => {
          const t = e.getCTM();
          return [t.e, t.f];
        });
    const a = await pos();
    const count = await page.evaluate(() => window.allocations);
    await page.waitForTimeout(240);
    const b = await pos();
    assert.notDeepEqual(a, b);
    assert.equal(await page.evaluate(() => window.allocations), count);
    assert(
      await page.evaluate(
        () =>
          window.keptNode === document.querySelector("#validate") &&
          window.keptSide === document.querySelector(".block-side") &&
          window.keptWire === document.querySelector("#wire-start"),
      ),
    );
    await page.waitForFunction(() => !document.getElementById("step").disabled);
    await page.locator("#step").click();
    await page.waitForFunction(() => !document.getElementById("step").disabled);
    for (const angle of [
      "-180",
      "-135",
      "-90",
      "-45",
      "0",
      "45",
      "90",
      "135",
      "180",
    ]) {
      await page.locator("#orbit").fill(angle);
      await page.waitForTimeout(50);
      const t = await page.locator("#projection").getAttribute("transform");
      assert(!t.includes("NaN"));
      const bounds = await page.locator("#ground polygon").evaluate((e) => {
        const b = e.getBBox();
        return { x: b.x, y: b.y, width: b.width, height: b.height };
      });
      assert(
        bounds.x >= 0 &&
          bounds.y >= 0 &&
          bounds.x + bounds.width <= 1100 &&
          bounds.y + bounds.height <= 940,
        "Camera clips the platform",
      );
      assert(
        await page.evaluate(
          () => window.keptNode === document.querySelector("#validate"),
        ),
      );
    }
    await page.locator("#view-reset").click();
    await page.locator("#scene").focus();
    const before = await page.locator("#projection").getAttribute("transform");
    await page.keyboard.press("ArrowRight");
    await page.waitForTimeout(50);
    assert.notEqual(
      before,
      await page.locator("#projection").getAttribute("transform"),
    );
    await page.locator("#top-view").click();
    await page.waitForTimeout(50);
    assert.equal(await page.locator("#sides").getAttribute("display"), "none");
    await page.locator("#view-reset").click();
    await page.waitForTimeout(50);
    assert.equal(
      await page.locator("#sides").getAttribute("display"),
      "inline",
    );
    await page.emulateMedia({ reducedMotion: "reduce" });
    for (const mode of [
      "approved",
      "low",
      "rejected",
      "timeout",
      "deliveryTimeout",
    ]) {
      await page.selectOption("#scenario", mode);
      for (let i = 0; i < 18; i++) {
        const text = await page.locator("#status").textContent();
        if (["Order canceled", "Order workflow completed"].includes(text))
          break;
        await page.locator("#step").click();
      }
      assert.equal(
        await page.locator("#status").textContent(),
        ["rejected", "timeout"].includes(mode)
          ? "Order canceled"
          : "Order workflow completed",
      );
    }
    await page.setViewportSize({ width: 390, height: 1000 });
    assert(
      !(await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      )),
    );
    assert.deepEqual(errors, []);
    console.log(
      "PASS: projected packet motion, retained nodes/faces/wires, zero allocations during motion, full orbit, keyboard camera, top view, five paths, reduced motion, compact layout",
    );
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
