// Usage: PLAYWRIGHT_MODULE=/absolute/path/to/playwright/index.mjs node scripts/check-examples.mjs /output
// No dependencies are installed or files written inside this skill.
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath, pathToFileURL } from "node:url";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const modulePath = process.env.PLAYWRIGHT_MODULE;
if (!modulePath || !process.argv[2])
  throw new Error(
    "Set PLAYWRIGHT_MODULE to an installed Playwright module and supply an output directory.",
  );
const output = path.resolve(process.argv[2]);
if (output === root || output.startsWith(root + path.sep))
  throw new Error("Output must be outside the skill directory.");
await fs.mkdir(output, { recursive: true });
const sandbox = { window: {} };
vm.runInNewContext(
  await fs.readFile(path.join(root, "examples/tokens.js"), "utf8"),
  sandbox,
);
const tokens = sandbox.window.visualTokens;
function luminance(hex) {
  const rgb = hex
    .slice(1)
    .match(/../g)
    .map((v) => parseInt(v, 16) / 255)
    .map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
}
function ratio(a, b) {
  const x = luminance(a),
    y = luminance(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}
let contrastPairs = 0;
for (const [theme, t] of Object.entries(tokens))
  for (const background of ["canvas", "surface", "raised"]) {
    for (const role of [
      "text",
      "muted",
      "focus",
      "success",
      "warning",
      "failure",
      "information",
    ]) {
      assert.ok(
        ratio(t[role], t[background]) >= 4.5,
        `${theme} ${role}/${background} text contrast: ${ratio(t[role], t[background])}`,
      );
      contrastPairs++;
    }
    assert.ok(
      ratio(t.border, t[background]) >= 3,
      `${theme} meaningful border contrast`,
    );
    contrastPairs++;
  }
for (const [theme, t] of Object.entries(tokens)) {
  for (const category of ["processing", "storage", "flow", "control"]) {
    for (const background of ["surface", "canvas", category + "Fill"]) {
      for (const role of [category, "text", "muted", "focus"]) {
        assert.ok(
          ratio(t[role], t[background]) >= 4.5,
          `${theme} ${role}/${background}: ${ratio(t[role], t[background])}`,
        );
        contrastPairs++;
      }
    }
  }
}
const { chromium } = await import(pathToFileURL(path.resolve(modulePath)).href);
const browser = await chromium.launch({ headless: true });
const errors = [];
let frames = 0,
  exports = 0;
try {
  const page = await browser.newPage({
    viewport: { width: 1280, height: 1080 },
    reducedMotion: "reduce",
  });
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(pathToFileURL(path.join(root, "examples/index.html")).href);
  await page.waitForSelector("#good-figure svg");
  async function setTheme(value) {
    if (
      (await page.locator("#theme").getAttribute("aria-pressed")) !==
      String(value === "dark")
    )
      await page.click("#theme");
  }

  async function checkCameraLabel() {
    const overlap = await page.locator("#good-figure svg").evaluate((svg) => {
      const label = [...svg.querySelectorAll("text")]
        .find((t) => t.textContent === "replicate write")
        .getBBox();
      const points = svg.querySelector("polyline").points,
        a = points.getItem(0),
        b = points.getItem(1);
      const ys = [label.x, label.x + label.width].map(
        (x) => a.y + ((x - a.x) * (b.y - a.y)) / (b.x - a.x),
      );
      return (
        Math.min(...ys) <= label.y + label.height + 4 &&
        Math.max(...ys) >= label.y - 4
      );
    });
    assert.equal(
      overlap,
      false,
      "Replication label clears the projected route",
    );
  }

  assert.equal(await page.locator("#dimension").inputValue(), "2d");
  for (const theme of ["light", "dark"]) {
    await setTheme(theme);
    assert.equal(await page.locator(".shape-card").count(), 38);
    const clippedShapes = await page
      .locator(".shape-card svg")
      .evaluateAll((svgs) =>
        svgs.flatMap((svg) =>
          [...svg.querySelectorAll("text")]
            .filter((text) => {
              const b = text.getBBox();
              return (
                b.x < 0 ||
                b.y < 0 ||
                b.x + b.width > 280 ||
                b.y + b.height > 150
              );
            })
            .map(
              (text) =>
                `${svg.getAttribute("aria-label")}: ${text.textContent}`,
            ),
        ),
      );
    assert.deepEqual(clippedShapes, [], "Gallery text must fit the viewBox");

    await page
      .locator("#shape-library")
      .screenshot({ path: path.join(output, `shapes-${theme}.png`) });
    for (const [scenario, count] of Object.entries({
      routing: 2,
      queue: 2,
      cache: 2,
      replication: 2,
      log: 2,
      recovery: 4,
    })) {
      await page.selectOption("#scenario", scenario);
      for (let i = 0; i < count; i++) {
        assert.match(
          await page.locator("#state").innerText(),
          new RegExp(`^${i + 1}/${count}`),
        );
        const title = await page
          .locator("#good-figure svg title")
          .textContent();
        assert.ok(title.length > 10);
        const overflow = await page
          .locator("#good-figure svg")
          .evaluate((svg) =>
            [...svg.querySelectorAll("text")]
              .filter((t) => {
                const b = t.getBBox();
                return (
                  b.x < 0 ||
                  b.y < 0 ||
                  b.x + b.width > 960 ||
                  b.y + b.height > 400
                );
              })
              .map((t) => t.textContent),
          );
        assert.deepEqual(overflow, [], `${scenario}: text outside viewBox`);
        const ids = await page
          .locator("svg [id]")
          .evaluateAll((nodes) => nodes.map((n) => n.id));
        assert.equal(new Set(ids).size, ids.length, "Unique inline SVG IDs");
        const visible = await page.locator("#good-figure svg").textContent();
        const expected = {
          queue: [
            ["3/4 waiting slots", "One waiting slot available"],
            ["4/4 waiting slots", "Next arrival: rejected"],
          ],
          cache: [["HIT → cached value"], ["MISS → database value"]],
          log: [["Next offset 42"], ["Next offset 43"]],
        };
        for (const value of expected[scenario]?.[i] ?? [])
          assert.ok(
            visible.includes(value),
            `${scenario} state ${i}: ${value}`,
          );
        await page.locator("#good-figure").screenshot({
          path: path.join(output, `${scenario}-${theme}-state-${i + 1}.png`),
        });
        const misaligned = await page
          .locator("#good-figure [data-label-x]")
          .evaluateAll(
            (groups) =>
              groups.filter((group) => {
                const b = group.getBBox(),
                  m = group.transform.baseVal.consolidate().matrix;
                return (
                  Math.abs(
                    b.x + b.width / 2 + m.e - Number(group.dataset.labelX),
                  ) > 0.1 ||
                  Math.abs(
                    b.y + b.height / 2 + m.f - Number(group.dataset.labelY),
                  ) > 0.1
                );
              }).length,
          );
        assert.equal(
          misaligned,
          0,
          "Node label groups are centered on both axes",
        );
        frames++;
        if (i < count - 1) await page.click("#next");
      }
      assert.equal(await page.locator("#next").isDisabled(), true);
      await page.click("#reset");
      assert.match(await page.locator("#state").innerText(), /^1\//);
    }
    await page.selectOption("#scenario", "routing");
    await page.locator("#next").focus();
    await page.keyboard.press("Enter");
    assert.match(await page.locator("#state").innerText(), /^2\/2/);
    await page.screenshot({
      path: path.join(output, `studio-${theme}.png`),
      fullPage: true,
    });
    await page.selectOption("#dimension", "3d");
    assert.equal(await page.locator("#scenario").inputValue(), "replication");
    assert.equal(await page.locator("#camera-controls").isVisible(), true);
    await page.click("#next");
    const state = await page.locator("#state").innerText();
    await checkCameraLabel();
    const original = await page.locator("#good-figure").innerHTML();
    await page.click("#orbit-right");
    await page.click("#orbit-right");
    assert.equal(await page.locator("#orbit-right").isDisabled(), true);
    await checkCameraLabel();
    assert.notEqual(await page.locator("#good-figure").innerHTML(), original);
    assert.equal(await page.locator("#state").innerText(), state);
    await page.screenshot({
      path: path.join(output, `3d-right-${theme}.png`),
      fullPage: true,
    });
    await page.click("#camera-reset");
    assert.equal(await page.locator("#good-figure").innerHTML(), original);
    await page.click("#orbit-left");
    await page.click("#orbit-left");
    assert.equal(await page.locator("#orbit-left").isDisabled(), true);
    await checkCameraLabel();
    await page.screenshot({
      path: path.join(output, `3d-left-${theme}.png`),
      fullPage: true,
    });
    for (const format of ["svg", "png"]) {
      const downloadEvent = page.waitForEvent("download");
      await page.click(`#export-${format}`);
      const download = await downloadEvent;
      const target = path.join(output, download.suggestedFilename());
      await download.saveAs(target);
      const bytes = await fs.readFile(target);
      assert.ok(bytes.length > 500);
      if (format === "svg") {
        const source = bytes.toString();
        assert.ok(source.includes(tokens[theme].surface));
        assert.ok(source.includes("Copy to replica"));
        assert.ok(source.includes("Acknowledgment"));
        assert.ok(!source.includes("var("));
      } else {
        assert.equal(bytes.subarray(1, 4).toString(), "PNG");
        assert.equal(bytes.readUInt32BE(16), 1920);
        assert.equal(bytes.readUInt32BE(20), 920);
      }
      exports++;
    }
  }
  // Export identity must describe the captured image even if UI state changes while PNG encoding awaits.
  await page.selectOption("#scenario", "queue");
  await setTheme("light");
  const pendingDownload = page.waitForEvent("download");
  await page.evaluate(() => {
    document.getElementById("export-png").click();
    const theme = document.getElementById("theme");
    theme.click();
    document.getElementById("next").click();
  });
  const racedDownload = await pendingDownload;
  assert.equal(racedDownload.suggestedFilename(), "queue-2d-light-step-1.png");
  await racedDownload.saveAs(
    path.join(output, racedDownload.suggestedFilename()),
  );
  exports++;
  // Theme changes preserve state, and responsive framing contains diagram scrolling.
  const state = await page.locator("#state").innerText();
  await setTheme("light");
  assert.equal(await page.locator("#state").innerText(), state);
  await page.setViewportSize({ width: 390, height: 844 });
  assert.ok(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
    "No page-level horizontal overflow",
  );
  await page.screenshot({
    path: path.join(output, "studio-compact.png"),
    fullPage: true,
  });
  assert.deepEqual(errors, [], "No browser errors");
  await page.close();
  console.log(
    JSON.stringify(
      { contrastPairs, frames, exports, browserErrors: errors, output },
      null,
      2,
    ),
  );
} finally {
  await browser.close();
}
