import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
assert(process.argv[2], "Provide an external evidence directory");
const output = path.resolve(process.argv[2]);
assert(output !== root && !output.startsWith(root + path.sep));
await fs.mkdir(output, { recursive: true });
assert(
  process.env.PLAYWRIGHT_MODULE,
  "Set PLAYWRIGHT_MODULE to an existing installation",
);
const { chromium } = await import(pathToFileURL(process.env.PLAYWRIGHT_MODULE));
const browser = await chromium.launch();
const errors = [];
const url = pathToFileURL(
  path.join(root, "examples/blog/the-big-database-at-work.html"),
).href;
const target = Array.from({ length: 100 }, (_, i) =>
  i < 5 ? 3 : i < 30 ? 4 : 5,
);
let seed = 73;
for (let i = 99; i > 0; i--) {
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  const j = seed % (i + 1);
  [target[i], target[j]] = [target[j], target[i]];
}
const leafX = [130, 250, 370, 550, 670, 790];
function arc(packet) {
  const points = [
    [460, 78],
    [460, 105],
    [670, 105],
    [670, 305],
    [leafX[packet.leaf], 305],
    [leafX[packet.leaf], 335],
  ];
  let sum = 0;
  for (let i = 1; i < points.length; i++) {
    const [ax, ay] = points[i - 1],
      [bx, by] = points[i];
    if (
      packet.x >= Math.min(ax, bx) - 0.001 &&
      packet.x <= Math.max(ax, bx) + 0.001 &&
      packet.y >= Math.min(ay, by) - 0.001 &&
      packet.y <= Math.max(ay, by) + 0.001
    )
      return sum + Math.hypot(packet.x - ax, packet.y - ay);
    sum += Math.hypot(bx - ax, by - ay);
  }
  throw Error("Packet is off its route");
}
try {
  const p = await browser.newPage({
    viewport: { width: 1200, height: 950 },
    reducedMotion: "reduce",
  });
  p.on("pageerror", (e) => errors.push(e.message));
  await p.goto(url);
  assert.equal(await p.locator("[data-action=export]").count(), 0);
  assert.equal(await p.locator("[data-action=play]").count(), 4);
  const tree = p.locator("[data-figure=increasing-ids]");
  assert.equal(
    await p.locator("[data-figure=tree-depth]").count(),
    0,
    "Index lessons share one demo",
  );
  assert.equal(await p.locator("[data-figure]").count(), 6);
  assert(
    (await tree.getAttribute("data-source-components")).includes(
      "BigDatabaseTreeDepthFigure",
    ),
  );
  assert(
    (await tree.locator("svg").textContent()).includes("100 billion rows"),
  );
  const snapshot = () =>
    tree.locator("[data-request]").evaluateAll((es) =>
      es.map((e) => {
        const m = e.transform.baseVal.consolidate().matrix;
        return {
          id: Number(e.dataset.request),
          leaf: Number(e.dataset.targetLeaf),
          duration: Number(e.dataset.duration),
          x: m.e,
          y: m.f,
        };
      }),
    );
  let previous = await snapshot(),
    short = 0,
    long = 0;
  for (let i = 1; i <= 86; i++) {
    await tree.locator("[data-action=step]").click();
    const current = await snapshot(),
      state = JSON.parse(await tree.getAttribute("data-state"));
    for (const n of current) {
      const old = previous.find((o) => o.id === n.id);
      if (old) {
        assert(
          Math.abs(arc(n) - arc(old) - 120) < 0.001,
          "500ms must travel120 SVG units along the full polyline",
        );
        if (n.duration < 2000) short++;
        else long++;
      }
    }
    const expected = [0, 0, 0],
      found = new Set();
    for (let id = 0; id <= Math.floor(state.elapsed / 400); id++) {
      const leaf = target[id % 100],
        duration = ((467 + Math.abs(leafX[leaf] - 670)) / 240) * 1000,
        age = state.elapsed - id * 400;
      if (age >= duration) {
        expected[leaf - 3]++;
        if (age < duration + 650) found.add(leaf);
      }
    }
    assert.deepEqual(
      state.completedByRecentLeaf,
      expected,
      "Arrival counts honor route-dependent duration",
    );
    const actual = await tree
      .locator("[data-found][display=inline]")
      .evaluateAll((es) => es.map((e) => Number(e.dataset.found)));
    assert.deepEqual(
      actual.sort(),
      [...found].sort(),
      "Found highlights persist through sample-cycle boundary",
    );
    previous = current;
  }
  assert(short > 0 && long > 0, "Equal-speed checks cover both route lengths");
  for (const selector of ["[data-found]"]) {
    const nodes = await p.locator(selector).evaluateAll((es) =>
      es.map((n) => {
        const attrs = ["x", "y", "width", "height", "rx"];
        return attrs.every((a) =>
          [...n.ownerSVGElement.querySelectorAll("rect")].some(
            (other) =>
              other !== n &&
              attrs.every((k) => other.getAttribute(k) === n.getAttribute(k)),
          ),
        );
      }),
    );
    assert(
      nodes.every(Boolean),
      "Highlights exactly share page rectangle geometry",
    );
  }
  const traffic = p.locator("[data-figure=traffic]");
  await traffic.scrollIntoViewIfNeeded();
  let state = await traffic.getAttribute("data-state");
  await p.waitForTimeout(160);
  assert.equal(
    await traffic.getAttribute("data-state"),
    state,
    "Reduced motion stays paused",
  );
  await traffic.locator("input").fill("24");
  assert.equal(JSON.parse(await traffic.getAttribute("data-state")).hour, 24);
  await traffic.locator("[data-action=step]").click();
  assert.notEqual(await traffic.getAttribute("data-state"), state);
  for (const theme of ["light", "dark"]) {
    if ((await p.locator("html").getAttribute("data-theme")) !== theme)
      await p.locator("#theme").click();
    assert.equal(
      await p.locator("[data-figure=hardware] [data-hardware-icon]").count(),
      3,
    );
    assert.equal(
      await p.locator("[data-figure=working-set] [data-hardware-icon]").count(),
      2,
    );
    const colors = await p
      .locator("[data-figure=hardware] [data-hardware-icon]")
      .evaluateAll((es) => es.map((e) => e.getAttribute("stroke")));
    assert.equal(new Set(colors).size, 3);
    assert.equal(
      await p
        .locator('svg [fill="undefined"], svg [stroke="undefined"]')
        .count(),
      0,
      "Every shape has a valid theme color",
    );
    for (const id of [
      "regions",
      "hardware",
      "traffic",
      "working-set-budget",
      "increasing-ids",
      "working-set",
    ]) {
      const section = p.locator(`[data-figure=${id}]`);
      assert.equal(await section.locator(":scope > header").count(), 1);
      assert.equal(await section.locator(":scope > header h2").count(), 1);
      assert.equal(
        await section.locator(":scope > header p").count(),
        0,
        "No second header label",
      );
      assert.equal(await section.locator(":scope > footer").count(), 1);
      assert.equal(
        await section.locator(":scope > footer > p").count(),
        1,
        "One factual caption",
      );
      assert.equal(
        await section.locator("details,.capacity-facts,.visual-lesson").count(),
        0,
        "No duplicate footer sections",
      );
      assert(
        await section.locator("svg desc").textContent(),
        "Supporting qualifications remain in the image description",
      );
    }
    const shares = await p
      .locator("[data-figure=hardware] [data-capacity]")
      .evaluateAll((es) =>
        es.map(
          (e) =>
            e.width.baseVal.value /
            e.previousElementSibling.width.baseVal.value,
        ),
      );
    [0.05, 100 / 238, 0.75].forEach((share, i) =>
      assert(
        Math.abs(shares[i] - share) < 0.00001,
        "Capacity bars encode their reported proportions",
      ),
    );
    const queryFacts = await p
      .locator("[data-figure=traffic] svg")
      .textContent();
    assert(
      queryFacts.includes("100 : 1") && queryFacts.includes("0.48 ms"),
      "Reported query mix and average remain visible",
    );
    const budget = p.locator("[data-figure=working-set-budget]");
    assert.equal(await budget.locator("[data-slot]").count(), 100);
    assert.equal(await budget.locator("[data-disk-block]").count(), 152);
    assert((await budget.textContent()).includes("98.7%"));
    const gap = await p
      .locator("[data-figure=working-set] svg")
      .evaluate((svg) => {
        const icon = svg
            .querySelector("[data-hardware-icon=disk]")
            .getBoundingClientRect(),
          label = [...svg.querySelectorAll("text")]
            .find((n) => n.textContent === "Disk / SSD")
            .getBoundingClientRect();
        return label.top - icon.bottom;
      });
    assert(gap >= 7, "Disk icon has a clear gap above its label");
    await p.screenshot({
      path: path.join(output, `database-feedback-${theme}.png`),
      fullPage: true,
    });
  }
  const phoneChecks = [];
  for (const width of [360, 390, 430]) {
    const before = await p
      .locator("[data-figure]")
      .evaluateAll((es) => es.map((e) => e.dataset.state));
    await p.setViewportSize({ width, height: 844 });
    await p.waitForTimeout(40);
    assert.deepEqual(
      await p
        .locator("[data-figure]")
        .evaluateAll((es) => es.map((e) => e.dataset.state)),
      before,
      "Reflow preserves exact model state",
    );
    for (const theme of ["light", "dark"]) {
      if ((await p.locator("html").getAttribute("data-theme")) !== theme)
        await p.locator("#theme").click();
      const sizes = await p.locator("[data-figure]").evaluateAll((es) =>
        es.map((e) => {
          const stage = e.querySelector(".stage"),
            svg = stage.querySelector("svg"),
            vb = svg.viewBox.baseVal;
          const texts = [...svg.querySelectorAll("text")]
            .filter((n) => n.textContent.trim())
            .map((n) => {
              const m = n.getScreenCTM(),
                b = n.getBBox();
              return {
                label: n.textContent,
                pixels:
                  parseFloat(getComputedStyle(n).fontSize) *
                  Math.hypot(m.a, m.b),
                fits: b.x >= -1 && b.x + b.width <= vb.width + 1,
              };
            });
          return {
            id: e.dataset.figure,
            width: stage.clientWidth,
            scroll: stage.scrollWidth,
            smallest: Math.min(...texts.map((t) => t.pixels)),
            clipped: texts.filter((t) => !t.fits),
          };
        }),
      );
      for (const row of sizes) {
        assert(
          row.scroll <= row.width + 1,
          `${width} ${row.id}: no diagram panning`,
        );
        assert(
          row.smallest >= 12,
          `${width} ${row.id}: main SVG labels >=12px (${row.smallest})`,
        );
        assert.deepEqual(
          row.clipped,
          [],
          `${width} ${row.id}: text inside compact scene`,
        );
      }
      const controls = await p.locator("button,input").evaluateAll((es) =>
        es.map((e) => ({
          name: e.textContent || e.getAttribute("aria-label"),
          height: e.getBoundingClientRect().height,
          font: parseFloat(getComputedStyle(e).fontSize),
          input: e.tagName === "INPUT",
        })),
      );
      for (const c of controls) {
        assert(c.height >= 44, `${c.name}: touch height >=44px`);
        if (c.input) assert(c.font >= 16, "Native inputs >=16px");
      }
      phoneChecks.push({
        width,
        theme,
        figures: sizes.length,
        minTextPx: Math.min(...sizes.map((s) => s.smallest)),
      });
      if (width === 390)
        for (const section of await p.locator("[data-figure]").all())
          await section.screenshot({
            path: path.join(
              output,
              `${await section.getAttribute("data-figure")}-${theme}.png`,
            ),
          });
    }
  }
  await traffic.locator("input").fill("6");
  const phoneState = await traffic.getAttribute("data-state");
  await p.waitForTimeout(100);
  assert.equal(
    await traffic.getAttribute("data-state"),
    phoneState,
    "Phone slider pauses playback",
  );
  await traffic.locator("[data-action=step]").click();
  assert.notEqual(await traffic.getAttribute("data-state"), phoneState);
  await tree.locator("[data-action=reset]").click();
  let mobilePrevious = await snapshot(),
    mobileSpeedChecks = 0;
  const mobileArc = (packet) => {
    const xs = [25, 75, 125, 175, 235, 295],
      pts = [
        [160, 60],
        [160, 80],
        [235, 80],
        [235, 200],
        [xs[packet.leaf], 200],
        [xs[packet.leaf], 218.5],
      ];
    let sum = 0;
    for (let i = 1; i < pts.length; i++) {
      const [ax, ay] = pts[i - 1],
        [bx, by] = pts[i];
      if (
        packet.x >= Math.min(ax, bx) - 0.001 &&
        packet.x <= Math.max(ax, bx) + 0.001 &&
        packet.y >= Math.min(ay, by) - 0.001 &&
        packet.y <= Math.max(ay, by) + 0.001
      )
        return sum + Math.hypot(packet.x - ax, packet.y - ay);
      sum += Math.hypot(bx - ax, by - ay);
    }
    throw Error("Phone packet must follow compact route");
  };
  for (let i = 0; i < 20; i++) {
    await tree.locator("[data-action=step]").click();
    const current = await snapshot();
    for (const n of current) {
      const prior = mobilePrevious.find((o) => o.id === n.id);
      if (prior) {
        assert(
          Math.abs(mobileArc(n) - mobileArc(prior) - 60) < 0.001,
          "Compact routes travel60units per500ms at one uniform speed",
        );
        mobileSpeedChecks++;
      }
    }
    mobilePrevious = current;
  }
  const beforeDesktop = await p
    .locator("[data-figure]")
    .evaluateAll((es) => es.map((e) => e.dataset.state));
  await p.setViewportSize({ width: 1200, height: 950 });
  await p.waitForTimeout(40);
  assert.deepEqual(
    await p
      .locator("[data-figure]")
      .evaluateAll((es) => es.map((e) => e.dataset.state)),
    beforeDesktop,
    "Returning to desktop preserves exact state",
  );
  const live = await browser.newPage({
    viewport: { width: 1200, height: 900 },
  });
  live.on("pageerror", (e) => errors.push(e.message));
  await live.addInitScript(() => {
    window.costs = [];
    const raf = window.requestAnimationFrame;
    window.requestAnimationFrame = (cb) =>
      raf.call(window, (t) => {
        const start = performance.now();
        cb(t);
        window.costs.push(performance.now() - start);
      });
  });
  await live.goto(url);
  const chart = live.locator("[data-figure=traffic]");
  await chart.scrollIntoViewIfNeeded();
  await live.waitForTimeout(100);
  await chart.locator("svg").evaluate((n) => (window.chartSvg = n));
  state = JSON.parse(await chart.getAttribute("data-state"));
  await live.waitForTimeout(450);
  assert(JSON.parse(await chart.getAttribute("data-state")).hour > state.hour);
  assert(
    await chart.locator("svg").evaluate((n) => n === window.chartSvg),
    "SVG remains stable during playback",
  );
  await chart.locator("input").fill("6");
  state = await chart.getAttribute("data-state");
  await live.waitForTimeout(100);
  assert.equal(
    await chart.getAttribute("data-state"),
    state,
    "Slider pauses autoplay",
  );
  await live.locator("main > header").scrollIntoViewIfNeeded();
  await chart.scrollIntoViewIfNeeded();
  await live.waitForTimeout(100);
  assert.equal(
    await chart.getAttribute("data-state"),
    state,
    "Manual pause persists across viewport changes",
  );
  await chart.locator("[data-action=reset]").click();
  await live.waitForTimeout(100);
  assert(JSON.parse(await chart.getAttribute("data-state")).hour < 1);
  await live.locator("main > header").scrollIntoViewIfNeeded();
  await live.waitForTimeout(80);
  state = await chart.getAttribute("data-state");
  await live.waitForTimeout(150);
  assert.equal(
    await chart.getAttribute("data-state"),
    state,
    "Offscreen clock suspends",
  );
  await chart.scrollIntoViewIfNeeded();
  await live.waitForTimeout(120);
  assert.notEqual(await chart.getAttribute("data-state"), state);
  await live.evaluate(() => {
    Object.defineProperty(document, "hidden", {
      value: true,
      configurable: true,
    });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  state = await chart.getAttribute("data-state");
  await live.waitForTimeout(160);
  assert.equal(
    await chart.getAttribute("data-state"),
    state,
    "Hidden document suspends traffic",
  );
  await live.evaluate(() => {
    Object.defineProperty(document, "hidden", {
      value: false,
      configurable: true,
    });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await live.waitForTimeout(100);
  const resumed = JSON.parse(await chart.getAttribute("data-state"));
  assert(
    resumed.elapsed > JSON.parse(state).elapsed &&
      resumed.elapsed - JSON.parse(state).elapsed < 150,
    "Resume excludes hidden duration",
  );
  await chart.locator("[data-action=play]").click();
  state = await chart.getAttribute("data-state");
  await live.locator("#theme").click();
  assert.equal(
    await chart.getAttribute("data-state"),
    state,
    "Theme preserves state",
  );
  await live.setViewportSize({ width: 390, height: 844 });
  await live.waitForTimeout(40);
  assert.equal(
    await chart.getAttribute("data-state"),
    state,
    "Paused state persists at phone breakpoint",
  );
  assert.equal(
    await chart.locator("[data-action=play]").textContent(),
    "Play",
    "Manual pause intent persists at phone breakpoint",
  );
  await chart.scrollIntoViewIfNeeded();
  await chart.locator("[data-action=play]").click();
  await live.waitForTimeout(100);
  await live.evaluate(() => {
    Object.defineProperty(document, "hidden", {
      value: true,
      configurable: true,
    });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  const runningState = await chart.getAttribute("data-state");
  await live.setViewportSize({ width: 1200, height: 900 });
  await live.waitForTimeout(40);
  assert.equal(
    await chart.getAttribute("data-state"),
    runningState,
    "Playing model stays unchanged while hidden during resize",
  );
  assert.equal(
    await chart.locator("[data-action=play]").textContent(),
    "Pause",
    "Autoplay intent survives orientation/reflow",
  );
  await live.evaluate(() => {
    Object.defineProperty(document, "hidden", {
      value: false,
      configurable: true,
    });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await chart.scrollIntoViewIfNeeded();
  await live.waitForTimeout(120);
  assert.notEqual(
    await chart.getAttribute("data-state"),
    runningState,
    "Playback resumes after reflow",
  );
  const costs = await live.evaluate(() => window.costs);
  costs.sort((a, b) => a - b);
  const report = {
    passed: true,
    phoneChecks,
    mobileSpeedChecks,
    equalSpeedChecks: { short, long, speedSvgUnitsPerSecond: 240 },
    frameCallbackCosts: {
      samples: costs.length,
      meanMs: costs.reduce((a, b) => a + b) / costs.length,
      p95Ms: costs[Math.floor(costs.length * 0.95)],
      maxMs: costs.at(-1),
    },
    limitation:
      "Callback costs exclude paint/compositor work; not an actual120Hz display measurement.",
  };
  assert.deepEqual(errors, []);
  await fs.writeFile(
    path.join(output, "database-feedback-check.json"),
    JSON.stringify(report, null, 2),
  );
  console.log(JSON.stringify(report));
} finally {
  await browser.close();
}
