// PLAYWRIGHT_MODULE=/path/to/playwright/index.mjs node scripts/check-pull-requests.mjs /outside/output
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
if (!process.env.PLAYWRIGHT_MODULE || !process.argv[2])
  throw new Error("Set PLAYWRIGHT_MODULE and supply an output directory.");
const { chromium } = await import(
  pathToFileURL(path.resolve(process.env.PLAYWRIGHT_MODULE)).href
);
import fs from "node:fs/promises";
import assert from "node:assert/strict";
const out = path.resolve(process.argv[2]);
if (out === root || out.startsWith(root + path.sep))
  throw new Error("Output must be outside the skill.");
await fs.mkdir(out, { recursive: true });
const browser = await chromium.launch();
let checks = 0;
const errors = [];
try {
  for (const width of [1280, 390, 360]) {
    const page = await browser.newPage({
      viewport: { width, height: 1000 },
      colorScheme: "light",
    });
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto(
      pathToFileURL(path.join(root, "examples/pull-requests/index.html")).href,
    );
    for (const theme of ["light", "dark"]) {
      if (theme === "dark") await page.locator("#theme").click();
      assert.equal(
        await page.evaluate(() => document.documentElement.style.colorScheme),
        theme,
      );
      for (const key of ["cache", "retry", "queue"]) {
        await page.locator(`[data-example="${key}"]`).click();
        assert.equal(
          await page
            .locator(`[data-example="${key}"]`)
            .getAttribute("aria-pressed"),
          "true",
        );
        assert.match(await page.locator("#pr-body").innerText(), /not run|not an executed test run/i);
        assert.match(await page.locator("#pr-body").innerText(), /Limit:/);
        assert.deepEqual(await page.locator("#pr-body h2").allTextContents(), [
          "Problem & Solution Overview", "Testing Done",
        ]);
        assert.equal(await page.locator("#pr-body img").first().getAttribute("width"), "448");
        for (const image of await page.locator("#pr-body img").all()) {
          await image.evaluate((element) => element.decode());
        }
        {
          assert.equal(await page.locator("#pr-body img").count(), 4);
          assert.equal(await page.locator("#pr-body h3").count(), 3);
          assert.equal(await page.locator("#pr-body h3 + p img").count(), 3);
          assert.equal(await page.locator("#pr-body details[open]").count(), 0);
          assert.equal(await page.locator("#pr-body pre:visible").count(), 0);
          assert.equal(await page.locator("#pr-body img:visible").count(), 4);
          const scenarios = page.locator("#pr-body details").filter({ has: page.locator("summary", { hasText: "Commands and results" }) });
          assert.equal(await scenarios.count(), 3);
          for (const scenario of await scenarios.all()) {
            await scenario.locator("summary").click();
            assert.ok(await scenario.locator("pre:visible").count() >= 2);
            await scenario.locator("summary").click();
          }

        }
        const dimensions = await page.evaluate(() => ({
          overflow: document.documentElement.scrollWidth > innerWidth,
          imageWidth: document
            .querySelector("#pr-body img")
            .getBoundingClientRect().width,
          imageLoaded: document.querySelector("#pr-body img").naturalWidth > 0,
        }));
        assert.equal(
          dimensions.overflow,
          false,
          `${width} ${key} horizontal overflow`,
        );
        assert.ok(dimensions.imageWidth <= 450, "Diagram exceeds its compact width");
        assert.ok(
          dimensions.imageLoaded && (dimensions.imageWidth / 640) * 28 >= 12,
          JSON.stringify(dimensions),
        );
        await page
          .locator("article")
          .screenshot({ path: `${out}/${key}-${width}-${theme}.png` });
        checks++;
      }
    }
    await page.locator("#pr-body details summary").first().click();
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
      false,
    );
    await page.locator(".template summary").click();
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
      false,
    );
    const d = page.waitForEvent("download");
    await page.locator("#download").click();
    const download = await d;
    await download.saveAs(`${out}/template-${width}.md`);
    assert.match(
      await fs.readFile(`${out}/template-${width}.md`, "utf8"),
      /not run|not an executed test run/i,
    );
    assert.equal(await fs.readFile(`${out}/template-${width}.md`, "utf8"),
      await fs.readFile(path.join(root, "examples/pull-requests/queue.md"), "utf8"));
    await page.close();
  }
  assert.deepEqual(errors, []);
  console.log(JSON.stringify({ checks, errors, output: out }));
} finally {
  await browser.close();
}
