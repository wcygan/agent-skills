import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
assert.ok(process.argv[2], "Provide an external evidence directory");
const output = path.resolve(process.argv[2]);
assert.ok(output !== root && !output.startsWith(root + path.sep));
await fs.mkdir(output, { recursive: true });
const expected = {
  "the-big-database-at-work": [
    "BigDatabaseHardwareFigure",
    "BigDatabaseTrafficFigure",
    "BigDatabaseIncreasingIdsFigure",
    "BigDatabaseWorkingSetBudgetFigure",
    "BigDatabaseRegionsFigure",
    "BigDatabaseWorkingSetFigure",
    "BigDatabaseTreeDepthFigure",
  ],
  "distributed-transactions": [
    "TwoPhasePrepareDemo",
    "TwoPhaseDecisionDemo",
    "ReplicatedShardsDemo",
  ],
  "gossip-protocols": ["EpidemicSpreadDemo", "GossipDemo"],
  replication: [
    "DatabaseLogDemo",
    "DatabaseLogReplicationDemo",
    "GroupReplicationLagDemo",
  ],
  "leader-election": ["RaftElectionDemo"],
  "failure-detectors": ["FailureDetectorDemo"],
  "kafka-partitioning": ["KafkaPartitioningDemo"],
};
assert.ok(
  process.env.PLAYWRIGHT_MODULE,
  "Set PLAYWRIGHT_MODULE to an existing installation",
);
const { chromium } = await import(pathToFileURL(process.env.PLAYWRIGHT_MODULE));
const browser = await chromium.launch();
let figuresChecked = 0;
const errors = [],
  report = [];
try {
  const page = await browser.newPage({
    viewport: { width: 1200, height: 1000 },
    reducedMotion: "reduce",
  });
  page.on("pageerror", (e) => errors.push(e.message));
  for (const [slug, sources] of Object.entries(expected)) {
    if (
      process.env.POST_FILTER &&
      !process.env.POST_FILTER.split(",").includes(slug)
    )
      continue;
    await page.goto(
      pathToFileURL(path.join(root, "examples/blog", slug + ".html")).href,
    );
    const figures = page.locator("[data-figure]");
    const svgIds = await figures
      .locator("svg [id]")
      .evaluateAll((es) => es.map((e) => e.id));
    assert.equal(
      new Set(svgIds).size,
      svgIds.length,
      `${slug}: duplicate SVG IDs`,
    );
    const actual = await figures.evaluateAll((es) =>
      es.flatMap((e) => e.dataset.sourceComponents
        ? e.dataset.sourceComponents.split(/\s+/)
        : [e.dataset.sourceComponent]),
    );
    for (const source of sources)
      assert.ok(actual.includes(source), `${slug}: missing ${source}`);
    const ids = await figures.evaluateAll((es) =>
      es.map((e) => e.dataset.figure),
    );
    assert.equal(
      new Set(ids).size,
      ids.length,
      `${slug}: duplicate figure IDs`,
    );
    for (const theme of ["light", "dark"]) {
      if ((await page.locator("html").getAttribute("data-theme")) !== theme)
        await page.locator("#theme").click();
      assert.equal(
        await page.locator("html").getAttribute("data-theme"),
        theme,
      );
      for (let i = 0; i < (await figures.count()); i++) {
        const figure = figures.nth(i),
          id = await figure.getAttribute("data-figure");
        assert.ok(await figure.locator("svg").count(), `${slug}/${id}: no SVG`);
        assert.equal(await figure.locator(":scope > header.visual-heading").count(), 1,
          `${slug}/${id}: one header`);
        assert.equal(await figure.locator(".visual-heading > *").count(), 1,
          `${slug}/${id}: header contains only the title`);
        assert.equal(await figure.locator(":scope > footer.result > p").count(), 1,
          `${slug}/${id}: one factual footer`);
        assert.equal(await figure.locator(".eyebrow").count(), 0,
          `${slug}/${id}: no extra section labels`);
        assert.ok(
          await figure.locator("h2,h3").count(),
          `${slug}/${id}: no heading`,
        );
        await figure.screenshot({
          path: path.join(output, `${slug}-${id}-${theme}.png`),
        });
        assert.equal(await figure.getByRole("button", { name: /save svg|export svg/i }).count(), 0,
          `${slug}/${id}: export control remains`);
        figuresChecked++;
        const step = figure.locator('[data-action="step"]');
        if (await step.count()) {
          assert.ok(await figure.locator('[data-action="play"]').count());
          const replay = figure.locator('[data-action="replay"]');
          const restart = await replay.count() ? replay : figure.locator('[data-action="reset"]');
          await restart.click();
          const initial = await figure.getAttribute("data-state");
          assert.ok(initial, `${slug}/${id}: missing serialized state`);
          await step.click();
          const advanced = await figure.getAttribute("data-state");
          assert.notEqual(
            advanced,
            initial,
            `${slug}/${id}: step did not change state`,
          );
          await page.locator("#theme").click();
          assert.equal(
            await figure.getAttribute("data-state"),
            advanced,
            `${slug}/${id}: theme changed state`,
          );
          await page.locator("#theme").click();
          await restart.click();
        }
      }
      // Meaningful text must remain inside the SVG viewport.
      const clipped = await figures.locator("svg").evaluateAll((svgs) =>
        svgs.flatMap((svg) => {
          const vb = svg.viewBox.baseVal;
          if (!vb.width) return [];
          return [...svg.querySelectorAll("text")]
            .filter((t) => {
              if (!t.getClientRects().length) return false;
              const local = t.getBBox();
              const matrix = svg.getCTM().inverse().multiply(t.getCTM());
              const corners = [[local.x, local.y], [local.x + local.width, local.y],
                [local.x, local.y + local.height], [local.x + local.width, local.y + local.height]]
                .map(([x, y]) => new DOMPoint(x, y).matrixTransform(matrix));
              const x = Math.min(...corners.map(p => p.x)), y = Math.min(...corners.map(p => p.y));
              const b = { x, y, width: Math.max(...corners.map(p => p.x)) - x,
                height: Math.max(...corners.map(p => p.y)) - y };
              return (
                b.width &&
                (b.x < vb.x - 2 ||
                  b.y < vb.y - 2 ||
                  b.x + b.width > vb.x + vb.width + 2 ||
                  b.y + b.height > vb.y + vb.height + 2)
              );
            })
            .map((t) => t.textContent);
        }),
      );
      assert.deepEqual(clipped, [], `${slug}: text outside SVG`);
    }
    await page.setViewportSize({ width: 390, height: 844 });
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
      `${slug}: mobile overflow`,
    );
    await page.screenshot({ path: path.join(output, `${slug}-mobile.png`) });
    await page.locator("#theme").focus();
    const theme = await page.locator("html").getAttribute("data-theme");
    await page.keyboard.press("Enter");
    assert.notEqual(
      await page.locator("html").getAttribute("data-theme"),
      theme,
    );
    await page.setViewportSize({ width: 1200, height: 1000 });
    report.push({ slug, figures: await figures.count(), sources: actual });
  }
  const motion = await browser.newPage({
    viewport: { width: 1200, height: 1000 }, reducedMotion: "no-preference",
  });
  motion.on("pageerror", e => errors.push(e.message));
  let autoplayChecked = 0;
  for (const { slug } of report) {
    const url = pathToFileURL(path.join(root, "examples/blog", slug + ".html")).href;
    await motion.goto(url);
    const ids = await motion.locator('[data-figure]').evaluateAll(es =>
      es.filter(e => e.querySelector('[data-action="play"]')).map(e => e.dataset.figure));
    for (const id of ids) {
      await motion.goto(url);
      const figure = motion.locator(`[data-figure="${id}"]`);
      await figure.scrollIntoViewIfNeeded();
      await motion.waitForTimeout(250);
      const play = figure.locator('[data-action="play"]');
      assert.match(await play.textContent(), /pause/i, `${slug}/${id}: no visible autoplay`);
      await play.click();
      const paused = await figure.getAttribute('data-state');
      await motion.waitForTimeout(150);
      assert.equal(await figure.getAttribute('data-state'), paused, `${slug}/${id}: pause drift`);
      await motion.evaluate(() => window.scrollTo(0, 0));
      await figure.scrollIntoViewIfNeeded();
      await motion.waitForTimeout(150);
      assert.doesNotMatch(await play.textContent(), /pause/i, `${slug}/${id}: manual pause lost`);
      const replay = figure.locator('[data-action="replay"]');
      const restart = await replay.count() ? replay : figure.locator('[data-action="reset"]');
      await restart.click();
      assert.match(await play.textContent(), /pause/i, `${slug}/${id}: reset did not resume playback`);
      const restarted = await figure.getAttribute('data-state');
      await motion.waitForFunction(([id,before])=>document.querySelector(`[data-figure="${id}"]`).dataset.state !== before,[id,restarted],{timeout:6000});
      autoplayChecked++;
    }
  }
  await motion.close();
  await page.goto(
    pathToFileURL(path.join(root, "examples/blog/index.html")).href,
  );
  assert.equal(await page.locator(".post-card").count(), Object.keys(expected).length);
  assert.deepEqual(errors, []);
  await fs.writeFile(
    path.join(output, "coverage.json"),
    JSON.stringify(report, null, 2),
  );
  console.log(
    JSON.stringify(
      {
        pages: report.length,
        figures: report.reduce((n, r) => n + r.figures, 0),
        sourceFigures: report.reduce((n, r) => n + r.sources.length, 0),
        figuresChecked,
        autoplayChecked,
        browserErrors: errors,
        output,
      },
      null,
      2,
    ),
  );
} finally {
  await browser.close();
}
