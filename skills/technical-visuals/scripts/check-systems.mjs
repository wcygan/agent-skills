import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath, pathToFileURL } from "node:url";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const output = path.resolve(process.argv[2]);
assert.ok(
  output !== root && !output.startsWith(root + path.sep),
  "Keep evidence outside the skill",
);
const { chromium } = await import(pathToFileURL(process.env.PLAYWRIGHT_MODULE));
const sandbox = { window: {} };
vm.runInNewContext(
  await fs.readFile(path.join(root, "examples/systems/cases.js"), "utf8"),
  sandbox,
);
const cases = sandbox.window.systemCases;
await fs.mkdir(output, { recursive: true });
const browser = await chromium.launch();
let frames = 0,
  exports = 0;
const errors = [];
try {
  const page = await browser.newPage({
    viewport: { width: 1200, height: 1100 },
    reducedMotion: "reduce",
  });
  page.on("pageerror", (e) => errors.push(e.message));
  for (const [key, model] of Object.entries(cases)) {
    await page.goto(
      pathToFileURL(path.join(root, `examples/systems/${key}.html`)).href,
    );
    assert.equal(await page.title(), model.title + " · Visual system design");
    for (const theme of ["light", "dark"]) {
      if (
        (await page.locator("#theme").getAttribute("aria-pressed")) !==
        String(theme === "dark")
      )
        await page.click("#theme");
      assert.equal(
        await page.locator("[data-step], #previous, #next").count(),
        0,
      );
      assert.equal(await page.locator("#caption").innerText(), model.caption);
      assert.equal(await page.locator(".bottleneck").count(), 3);
      assert.equal(
        await page.locator("#stories li").count(),
        model.brief.stories.length,
      );
      assert.equal(
        await page.locator("#api tr").count(),
        model.brief.api.length,
      );
      assert.equal(
        await page.locator("#entities tr").count(),
        model.brief.entities.length,
      );
      assert.equal(
        await page.locator(".number-card").count(),
        model.brief.numbers.length,
      );
      const order = await page
        .locator(
          "#stories-heading, #numbers-heading, #api-heading, #entities-heading, #diagram",
        )
        .evaluateAll((elements) => elements.map((e) => e.id));
      assert.deepEqual(order, [
        "stories-heading",
        "numbers-heading",
        "api-heading",
        "entities-heading",
        "diagram",
      ]);
      await page
        .locator("#numbers")
        .screenshot({ path: path.join(output, `${key}-${theme}-numbers.png`) });
      await page
        .locator("#api")
        .screenshot({ path: path.join(output, `${key}-${theme}-api.png`) });
      const issues = await page.locator("#diagram svg").evaluate((svg) => {
        const issues = [];
        for (const t of svg.querySelectorAll("text")) {
          const b = t.getBBox();
          if (
            b.x < 0 ||
            b.y < 0 ||
            b.x + b.width > 1000 ||
            b.y + b.height > 520
          )
            issues.push(t.textContent);
        }
        for (const g of svg.querySelectorAll(".node-label")) {
          const b = g.getBBox();
          if (b.width > 168) issues.push("node overflow " + g.textContent);
        }
        return issues;
      });
      assert.deepEqual(issues, [], `${key}/${theme} text bounds`);
      frames++;
      const before = await page.locator("#diagram svg text").allTextContents();
      await page.click("#theme");
      assert.deepEqual(
        await page.locator("#diagram svg text").allTextContents(),
        before,
      );
      await page.click("#theme");
      await page
        .locator("#bottlenecks")
        .screenshot({ path: path.join(output, `${key}-${theme}-scaling.png`) });
      await page
        .locator(".figure-card")
        .screenshot({ path: path.join(output, `${key}-${theme}.png`) });
      const download = page.waitForEvent("download");
      await page.click("#export");
      const file = await download;
      const destination = path.join(output, file.suggestedFilename());
      await file.saveAs(destination);
      const svg = await fs.readFile(destination, "utf8");
      assert.ok(svg.includes(model.title));
      assert.ok(svg.includes('height="620"'));
      assert.ok(!svg.includes("var(--"));
      const preview = await browser.newPage();
      await preview.goto(pathToFileURL(destination).href);
      await preview
        .locator("svg")
        .screenshot({ path: destination.replace(".svg", "-export.png") });
      await preview.close();
      exports++;
    }
    // Theme toggle remains keyboard accessible; diagrams preserve their labels.
    await page.locator("#theme").focus();
    const pressed = await page.locator("#theme").getAttribute("aria-pressed");
    await page.keyboard.press("Enter");
    assert.notEqual(
      await page.locator("#theme").getAttribute("aria-pressed"),
      pressed,
    );
    await page.setViewportSize({ width: 390, height: 844 });
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    );
    assert.ok(
      await page
        .locator("#diagram")
        .evaluate((e) => e.scrollWidth > e.clientWidth),
    );
    await page.setViewportSize({ width: 1200, height: 1100 });
  }
  assert.deepEqual(errors, []);
  console.log(
    JSON.stringify(
      { pages: 4, frames, exports, browserErrors: errors, output },
      null,
      2,
    ),
  );
} finally {
  await browser.close();
}
