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
  "connection-pooling": [
    "PlanetScaleConnectionPoolDemo",
    "ConnectionScalingCurveDemo",
    "ConnectionServerBoardDemo",
    "ConnectionPoolExhaustionDemo",
  ],
};
assert.ok(
  process.env.PLAYWRIGHT_MODULE,
  "Set PLAYWRIGHT_MODULE to an existing installation",
);
const { chromium } = await import(pathToFileURL(process.env.PLAYWRIGHT_MODULE));
const browser = await chromium.launch();
let exportsChecked = 0;
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
    const actual = await figures.evaluateAll((es) =>
      es.map((e) => e.dataset.sourceComponent),
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
        assert.ok(
          await figure.locator("h2,h3").count(),
          `${slug}/${id}: no heading`,
        );
        await figure.screenshot({
          path: path.join(output, `${slug}-${id}-${theme}.png`),
        });
        const save = figure.getByRole("button", {
          name: "Save SVG",
          exact: true,
        });
        if (await save.count()) {
          const pending = page.waitForEvent("download");
          await save.click();
          const download = await pending;
          const dest = path.join(output, `${slug}-${id}-${theme}.svg`);
          await download.saveAs(dest);
          const xml = await fs.readFile(dest, "utf8");
          assert.ok(xml.includes("<svg"), `${slug}/${id}: invalid export`);
          assert.ok(
            !xml.includes("var(--"),
            `${slug}/${id}: unresolved export tokens`,
          );
          const preview = await browser.newPage();
          await preview.goto(pathToFileURL(dest).href);
          assert.ok(
            await preview.locator("svg").count(),
            `${slug}/${id}: export failed to render`,
          );
          await preview
            .locator("svg")
            .screenshot({ path: dest.replace(".svg", "-export.png") });
          await preview.close();
          exportsChecked++;
        }
        const step = figure.locator('[data-action="step"]');
        if (await step.count()) {
          assert.ok(await figure.locator('[data-action="play"]').count());
          await figure.locator('[data-action="reset"]').click();
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
          await figure.locator('[data-action="reset"]').click();
        }
      }
      // Meaningful text must remain inside the exported SVG viewport.
      const clipped = await figures.locator("svg").evaluateAll((svgs) =>
        svgs.flatMap((svg) => {
          const vb = svg.viewBox.baseVal;
          if (!vb.width) return [];
          return [...svg.querySelectorAll("text")]
            .filter((t) => {
              if (!t.getClientRects().length) return false;
              const b = t.getBBox();
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
    report.push({ slug, figures: actual.length, sources: actual });
  }
  await page.goto(
    pathToFileURL(path.join(root, "examples/blog/index.html")).href,
  );
  assert.equal(await page.locator(".post-card").count(), 8);
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
        exportsChecked,
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
