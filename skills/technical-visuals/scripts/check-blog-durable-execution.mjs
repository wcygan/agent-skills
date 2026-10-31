import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
assert.ok(process.argv[2], "Supply an external evidence directory");
const out = path.resolve(process.argv[2]);
assert.ok(!out.startsWith(root + path.sep));
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
    pathToFileURL(path.join(root, "examples/blog/durable-execution.html")).href,
  );
  const figure = (id) => page.locator(`[data-figure="${id}"]`);
  const state = async (id) =>
    JSON.parse(await figure(id).getAttribute("data-state"));
  const step = async (id, n = 1) => {
    for (let i = 0; i < n; i++)
      await figure(id).locator('[data-action="step"]').click();
  };
  await step("workflow", 2);
  assert.equal((await state("workflow")).seat, "✓ Reserved");
  assert.equal((await state("workflow")).payment, "× Failed");
  assert.equal((await state("workflow")).receipt, "Waiting");
  await step("workflow", 3);
  assert.equal((await state("workflow")).finish, "✓ Done");
  await step("booking", 3);
  assert.deepEqual((await state("booking")).queue, [0, 1, 2]);
  assert.equal(
    await figure("booking").locator('[data-item^="task"]:visible').count(),
    3,
  );
  await figure("booking").screenshot({
    path: path.join(out, "queue-full.png"),
  });
  await step("booking", 2);
  assert.deepEqual((await state("booking")).queue, [1, 2]);
  assert.equal((await state("booking")).worker, "Reserve seat");
  assert.deepEqual((await state("booking")).saved, []);
  await step("booking");
  assert.equal((await state("booking")).seat, "41 → seat 8A");
  assert.deepEqual((await state("booking")).saved, []);
  await step("booking");
  assert.equal((await state("booking")).worker, "✓ Reserved");
  await step("booking", 14);
  assert.deepEqual((await state("booking")).queue, []);
  assert.deepEqual((await state("booking")).saved, [0, 1, 2]);
  await step("replay");
  assert.equal((await state("replay")).poll, "Workflow");
  assert.equal((await state("replay")).read, 0);
  await step("replay");
  assert.equal((await state("replay")).read, 1);
  assert.equal((await state("replay")).rebuilt, "Booking 42 started");
  await step("replay", 2);
  assert.equal((await state("replay")).read, 3);
  assert.equal((await state("replay")).next, "Empty");
  await figure("replay").screenshot({
    path: path.join(out, "history-rebuilt.png"),
  });
  await step("replay", 2);
  assert.equal((await state("replay")).next, "Empty");
  assert.equal((await state("replay")).scheduled, "");
  await step("replay");
  assert.equal((await state("replay")).scheduled, "＋ Receipt scheduled");
  assert.equal((await state("replay")).next, "Send receipt");
  assert.equal((await state("replay")).restored2, "Queued");
  await step("replay");
  assert.equal((await state("replay")).poll, "Activity");
  assert.equal((await state("replay")).next, "Send receipt");
  assert.equal((await state("replay")).restored2, "Queued");
  await step("replay");
  assert.equal((await state("replay")).next, "Empty");
  assert.equal((await state("replay")).workerMode, "Worker · activity code");
  assert.equal((await state("replay")).restored2, "Running");
  assert.equal((await state("replay")).receiptSent, false);
  await step("replay");
  assert.equal((await state("replay")).receiptSent, true);
  assert.equal((await state("replay")).completionRecorded, false);
  await figure("replay").screenshot({path: path.join(out, "receipt-sent.png")});
  await step("replay");
  assert.equal((await state("replay")).completionRecorded, true);
  assert.equal((await state("replay")).scheduled, "✓ Receipt completed");
  await step("replay");
  assert.equal((await state("replay")).poll, "Workflow result");
  assert.equal((await state("replay")).workerMode, "Worker · activity code");
  await step("replay");
  assert.equal((await state("replay")).workerMode, "Worker · workflow code");
  assert.equal((await state("replay")).restored2, "✓ Done");
  await step("retry");
  assert.equal((await state("retry")).charges, 0);
  assert.equal((await state("retry")).check, "New key");
  await step("retry", 2);
  assert.equal((await state("retry")).charges, 1);
  assert.equal((await state("retry")).worker, "× Worker crashed");
  assert.equal((await state("retry")).receipt, "42 → pay-42");
  await step("retry", 2);
  assert.equal((await state("retry")).check, "✓ Seen 42");
  assert.equal((await state("retry")).plainTotal, "$20 total");
  await step("retry");
  assert.equal((await state("retry")).plainTotal, "$40 total");
  assert.equal((await state("retry")).keyTotal, "$20 total");
  assert.equal((await state("retry")).keyed, "↪ Receipt reused");
  for (const theme of ["light", "dark"]) {
    if ((await page.locator("html").getAttribute("data-theme")) !== theme)
      await page.locator("#theme").click();
    const marks = await page.locator(".stage svg text").evaluateAll(elements => elements
      .filter(el => el.textContent.includes("✓"))
      .map(el => ({text:el.textContent, marks:[...el.querySelectorAll("tspan")].filter(t => t.textContent === "✓").map(t => t.getAttribute("fill"))})));
    assert.ok(marks.length > 0);
    const green = await page.evaluate(() => window.visualTokens[document.documentElement.dataset.theme].success);
    for (const mark of marks) {assert.ok(mark.marks.length > 0, mark.text); assert.ok(mark.marks.every(color => color === green), mark.text);}
    for (const id of ["workflow", "booking", "replay", "retry"])
      await figure(id).screenshot({
        path: path.join(out, `${id}-${theme}-390.png`),
      });
  }
  const retryState = await state("retry");
  await page.setViewportSize({width:1200,height:1000});
  await page.waitForFunction(() => document.querySelector('[data-figure="retry"] svg').viewBox.baseVal.width === 720);
  assert.deepEqual(await state("retry"), retryState);
  await figure("retry").screenshot({path:path.join(out,"retry-desktop.png")});
  await page.setViewportSize({width:390,height:844});
  await page.waitForFunction(() => document.querySelector('[data-figure="retry"] svg').viewBox.baseVal.width === 420);
  assert.deepEqual(await state("retry"), retryState);
  assert.equal(await figure("retry").locator('[data-action="play"]').textContent(), "Play");
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
    false,
  );
  assert.deepEqual(errors, []);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await figure("booking").locator('[data-action="replay"]').click();
  await figure("booking").scrollIntoViewIfNeeded();
  await page.waitForTimeout(350);
  const during = await figure("booking").evaluate((el) => {
    const dot = el.querySelector('[data-payload="0"]');
    const path = el.querySelector("#booking-enqueue1");
    const transform = dot.transform.baseVal.consolidate().matrix;
    const x = transform.e,
      y = transform.f;
    let distance = Infinity;
    for (let d = 0; d <= path.getTotalLength(); d += 0.1) {
      const q = path.getPointAtLength(d);
      distance = Math.min(distance, Math.hypot(x - q.x, y - q.y));
    }
    return {
      distance,
      state: JSON.parse(el.dataset.state),
      time: Number(el.dataset.time),
    };
  });
  assert.ok(during.time > 0);
  assert.ok(during.distance < 0.2);
  assert.equal(
    during.state.waiting,
    "0 waiting",
    "Recipient must not change before arrival",
  );
  await page.clock.install();
  let capturedReturn = false;
  for (const id of ["workflow", "booking", "replay", "retry"]) {
    await figure(id).locator('[data-action="replay"]').click();
    await figure(id).scrollIntoViewIfNeeded();
    for (let sample = 0; sample < 300; sample++) {
      await page.clock.runFor(400);
      const overflow = await figure(id).evaluate((section) => {
        const svg = section.querySelector("svg");
        const bounds = svg.getBoundingClientRect();
        return [...svg.querySelectorAll("text, [data-payload-label] rect")]
          .filter((el) => el.getClientRects().length && getComputedStyle(el).display !== "none")
          .filter((el) => {
            const b = el.getBoundingClientRect();
            return b.width && (b.left < bounds.left - 1 || b.right > bounds.right + 1 || b.top < bounds.top - 1 || b.bottom > bounds.bottom + 1);
          }).map((el) => el.textContent || "payload badge");
      });
      assert.deepEqual(overflow, [], `${id}: clipped content`);
      if (id === "booking" && !capturedReturn && await figure(id).evaluate(el => { const marker = el.querySelector('[data-payload="0"]'); return marker.style.display === "none" ? "" : marker.querySelector("text").textContent; }) === "reserved") {
        await figure(id).screenshot({path: path.join(out, "reserved-payload.png")});
        capturedReturn = true;
      }
      if (await figure(id).locator("output").textContent() === "Complete") break;
    }
    await figure(id).screenshot({path: path.join(out, `${id}-bounds.png`)});
  }
  console.log(
    JSON.stringify(
      {
        queueFillsAndDrains: true,
        workflowRetry: true,
        replayReusesResults: true,
        idempotency: true,
        pathCentered: true,
        arrivalState: true,
        browserErrors: errors,
      },
      null,
      2,
    ),
  );
} finally {
  await browser.close();
}
