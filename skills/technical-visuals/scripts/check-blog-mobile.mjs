import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
assert.ok(process.argv[2], "Provide an external evidence directory");
const output = path.resolve(process.argv[2]);
assert.ok(output !== root && !output.startsWith(root + path.sep));
await fs.mkdir(output, { recursive: true });
assert.ok(process.env.PLAYWRIGHT_MODULE, "Set PLAYWRIGHT_MODULE to an existing installation");
const { chromium } = await import(pathToFileURL(process.env.PLAYWRIGHT_MODULE));
const browser = await chromium.launch();
const report = [], errors = [];
try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, reducedMotion: "reduce" });
  page.on("pageerror", e => errors.push(e.message));
  const directory = path.join(root, "examples/blog");
  const slugs = (await fs.readdir(directory)).filter(f => f.endsWith(".html")).map(f => f.slice(0, -5));
  for (const slug of slugs) {
    if (process.env.POST_FILTER && !process.env.POST_FILTER.split(",").includes(slug)) continue;
    for (const width of [360, 390, 430]) {
      await page.setViewportSize({ width, height: 844 });
      await page.goto(pathToFileURL(path.join(directory, slug + ".html")).href);
      for (const theme of ["light", "dark"]) {
        if (await page.locator("html").getAttribute("data-theme") !== theme) await page.locator("#theme").tap();
        const metrics = await page.evaluate(() => {
          const visible = e => !!e.getClientRects().length && getComputedStyle(e).visibility !== "hidden";
          return {
            documentOverflow: document.documentElement.scrollWidth - innerWidth,
            stages: [...document.querySelectorAll(".stage")].filter(visible).map(stage => ({
              id: stage.closest("[data-figure]")?.dataset.figure,
              overflow: stage.scrollWidth - stage.clientWidth,
              labels: [...stage.querySelectorAll("svg text")].filter(e => visible(e) && e.textContent.trim()).map(e => {
                const m = e.getScreenCTM();
                return { text: e.textContent, size: parseFloat(getComputedStyle(e).fontSize) * Math.hypot(m.c, m.d) };
              })
            })),
            controls: [...document.querySelectorAll('.controls button, .controls select, .controls input:not([type="checkbox"]), #theme')].filter(visible).map(e => ({
              label: e.textContent.trim() || e.getAttribute("aria-label") || e.type,
              height: e.getBoundingClientRect().height,
              size: parseFloat(getComputedStyle(e).fontSize),
              native: e.matches("input,select"),
              right: e.getBoundingClientRect().right,
              left: e.getBoundingClientRect().left
            }))
          };
        });
        if (slug === "index") {
          const distances = await page.locator('a[href="failure-detectors.html"] svg').evaluate(svg => {
            const route = svg.querySelector("path.wire");
            const length = route.getTotalLength();
            return [...svg.querySelectorAll("circle.signal")].map(dot => {
              let nearest = Infinity;
              for (let i = 0; i <= 4000; i++) {
                const p = route.getPointAtLength(length * i / 4000);
                nearest = Math.min(nearest, Math.hypot(p.x - dot.cx.baseVal.value, p.y - dot.cy.baseVal.value));
              }
              return nearest;
            });
          });
          assert.ok(distances.every(d => d < 0.1), `Failure preview dots off route: ${distances}`);
        }
        const context = `${slug}/${width}/${theme}`;
        assert.ok(metrics.documentOverflow <= 1, `${context}: document overflows ${metrics.documentOverflow}px`);
        for (const stage of metrics.stages) {
          assert.ok(stage.overflow <= 1, `${context}/${stage.id}: stage overflows ${stage.overflow}px`);
          for (const label of stage.labels) assert.ok(label.size >= 11.9, `${context}/${stage.id}: ${label.text} only ${label.size}px`);
        }
        for (const control of metrics.controls) {
          assert.ok(control.height >= 43.9, `${context}: ${control.label} touch height ${control.height}px`);
          assert.ok(control.left >= 0 && control.right <= width + 1, `${context}: ${control.label} clipped`);
          if (control.native) assert.ok(control.size >= 16, `${context}: native input text ${control.size}px`);
        }
        if (width === 390) {
          const figures = page.locator("[data-figure]");
          for (const figure of await figures.all()) {
            const id = await figure.getAttribute("data-figure");
            await figure.screenshot({ path: path.join(output, `${slug}-${id}-${theme}.png`) });
          }
          if (slug === "index") await page.screenshot({ path: path.join(output, `index-${theme}.png`), fullPage: true });
        }
        report.push({ slug, width, theme, ...metrics });
      }
    }
  }
  assert.deepEqual(errors, []);
  await fs.writeFile(path.join(output, "report.json"), JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ pageThemeWidths: report.length, stageChecks: report.reduce((n, r) => n + r.stages.length, 0), errors }));
} finally { await browser.close(); }
