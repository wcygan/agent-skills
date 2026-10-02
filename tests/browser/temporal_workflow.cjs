// Run with Playwright installed: node tests/browser/temporal_workflow.cjs
const { chromium } = require("playwright");
const assert = require("node:assert/strict");
const { pathToFileURL } = require("node:url");
const path = require("node:path");

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(
      pathToFileURL(
        path.resolve(
          __dirname,
          "../../skills/style-technical-visuals/references/standalone/temporal-workflow.html",
        ),
      ).href,
    );
    await page.locator("#play").click();
    const status = () => page.locator("#status").textContent();
    const hasClass = (id, name) =>
      page
        .locator("#" + id)
        .evaluate((el, name) => el.classList.contains(name), name);
    const waitForArrival = () =>
      page.waitForFunction(() => !document.getElementById("step").disabled);
    async function toApproval(mode = "approved") {
      await page.selectOption("#scenario", mode);
      for (let i = 0; i < 5; i++) {
        await page.locator("#step").click();
        await waitForArrival();
      }
      assert(await hasClass("approval", "active"));
    }
    // Audit every painted frame: no activity starts before its input arrives,
    // no fanout before the fork, and no join output before both inputs arrive.
    await page.evaluate(() => {
      window.timingIssues = [];
      window.observedRoutes = new Set();
      function audit() {
        const packets = [...document.querySelectorAll("#packets circle")];
        for (const packet of packets) {
          const id = packet.dataset.route;
          window.observedRoutes.add(id);
          const route = document.getElementById("wire-" + id);
          const destination = document.getElementById(
            route.dataset.destination,
          );
          if (
            destination.dataset.kind === "activity" &&
            destination.classList.contains("active")
          )
            window.timingIssues.push(
              id + ": destination active before arrival",
            );
          if (
            ["reserve", "risk"].includes(id) &&
            !document.getElementById("fork").classList.contains("done")
          )
            window.timingIssues.push(id + ": branch sent before fork arrival");
          if (
            id === "decide" &&
            document.getElementById("join-progress").textContent !==
              "JOIN ALL · 2/2 ready"
          )
            window.timingIssues.push(
              "join released before both results arrived",
            );
        }
        const ids = packets.map((p) => p.dataset.route);
        if (
          ids.includes("start") &&
          ids.some((id) => ["reserve", "risk"].includes(id))
        )
          window.timingIssues.push(
            "fork input and output animated simultaneously",
          );
        if (ids.includes("riskJoin") && ids.includes("decide"))
          window.timingIssues.push(
            "join input and output animated simultaneously",
          );
        requestAnimationFrame(audit);
      }
      requestAnimationFrame(audit);
    });
    // Exercise the fork and join's visible intermediate phases explicitly.
    await page.locator("#step").click();
    assert.equal(await status(), "Validation complete · approaching fork");
    assert(!(await hasClass("reserve", "active")));
    assert(!(await hasClass("risk", "active")));
    await page.waitForFunction(
      () =>
        document.getElementById("status").textContent ===
        "Fork reached · dispatching parallel activities",
    );
    assert(await hasClass("fork", "done"));
    assert(!(await hasClass("reserve", "active")));
    await waitForArrival();
    assert(await hasClass("reserve", "active"));
    assert(await hasClass("risk", "active"));
    await page.locator("#step").click();
    assert.equal(
      await page.locator("#join-progress").textContent(),
      "JOIN ALL · 0/2 ready",
    );
    await waitForArrival();
    assert.equal(
      await page.locator("#join-progress").textContent(),
      "JOIN ALL · 1/2 ready",
    );
    await page.locator("#step").click();
    assert.equal(await status(), "Risk complete · result traveling to join");
    assert.equal(
      await page.locator("#join-progress").textContent(),
      "JOIN ALL · 1/2 ready",
    );
    assert(!(await hasClass("decision", "active")));
    await page.waitForFunction(
      () =>
        document.getElementById("status").textContent ===
        "Both results received · leaving join",
    );
    assert.equal(
      await page.locator("#join-progress").textContent(),
      "JOIN ALL · 2/2 ready",
    );
    assert(!(await hasClass("decision", "active")));
    await waitForArrival();
    assert(await hasClass("decision", "active"));
    // Run every branch with motion so the frame audit covers ordinary edges.
    for (const mode of [
      "approved",
      "low",
      "rejected",
      "timeout",
      "deliveryTimeout",
    ]) {
      await page.selectOption("#scenario", mode);
      for (let i = 0; i < 18; i++) {
        if (
          ["Order canceled", "Order workflow completed"].includes(
            await status(),
          )
        )
          break;
        await page.locator("#step").click();
        await waitForArrival();
      }
      assert.equal(
        await status(),
        ["rejected", "timeout"].includes(mode)
          ? "Order canceled"
          : "Order workflow completed",
      );
    }
    assert.deepEqual(await page.evaluate(() => window.timingIssues), []);
    const observed = await page.evaluate(() => [...window.observedRoutes]);
    for (const id of [
      "start",
      "reserve",
      "risk",
      "reserveJoin",
      "riskJoin",
      "decide",
      "high",
      "low",
      "requestWait",
      "approve",
      "release",
      "ship",
      "delivery",
      "notify",
      "approvalSignal",
      "deliverySignal",
    ])
      assert(observed.includes(id), "Frame audit did not observe " + id);
    for (const [mode, downstream, completedStatus] of [
      ["approved", "capture", "Approval received"],
      ["rejected", "release", "Reviewer rejected the order"],
    ]) {
      await toApproval(mode);
      await page.locator("#signal").click();
      assert.equal(await status(), "Reviewer signal in transit");
      assert(await hasClass("approval", "active"));
      assert(!(await hasClass("approval", "done")));
      assert(!(await hasClass(downstream, "active")));
      assert.equal(await page.locator("#packets animateMotion").count(), 1);
      assert(
        !(await page
          .locator("#history")
          .textContent()
          .then((t) => t.includes("WorkflowExecutionSignaled"))),
      );
      await waitForArrival();
      assert.equal(await status(), completedStatus);
      assert(await hasClass("approval", "done"));
      assert(await hasClass(downstream, "active"));
      assert.equal(
        await page
          .locator("#packets animateMotion")
          .evaluateAll((es) =>
            es.some(
              (e) =>
                e.getAttribute("path") ===
                document
                  .getElementById("wire-approvalSignal")
                  .getAttribute("d"),
            ),
          ),
        false,
      );
    }
    await toApproval();
    await page.locator("#signal").click();
    await page.locator("#reset").click();
    await page.waitForTimeout(1000);
    assert.equal(await status(), "Validate the order");
    assert(!(await hasClass("approval", "done")));
    await toApproval();
    await page.locator("#signal").click();
    await page.selectOption("#scenario", "low");
    await page.waitForTimeout(1000);
    assert.equal(await status(), "Validate the order");
    // Timer expiry requires no signal flight.
    await toApproval();
    await page.locator("#expire").click();
    await waitForArrival();
    assert.equal(await status(), "Approval deadline expired");
    assert(await hasClass("release", "active"));
    // Delivery has the same causal ordering as approval.
    await toApproval();
    await page.locator("#signal").click();
    await waitForArrival();
    for (let i = 0; i < 4; i++) {
      await page.locator("#step").click();
      await waitForArrival();
    }
    assert(await hasClass("delivery", "active"));
    await page.locator("#step").click();
    assert.equal(await status(), "Delivery signal in transit");
    assert(await hasClass("delivery", "active"));
    assert(!(await hasClass("notify", "active")));
    await waitForArrival();
    assert(await hasClass("delivery", "done"));
    assert(await hasClass("notify", "active"));
    // Changing reduced-motion preference during flight settles the transition.
    await toApproval();
    await page.locator("#signal").click();
    await page.emulateMedia({ reducedMotion: "reduce" });
    await waitForArrival();
    assert.equal(await status(), "Approval received");
    assert.equal(await page.locator("#packets animateMotion").count(), 0);
    await toApproval();
    await page.locator("#signal").click();
    assert.equal(await status(), "Approval received");
    // Every scenario reaches its final result under manual stepping.
    for (const mode of [
      "approved",
      "low",
      "rejected",
      "timeout",
      "deliveryTimeout",
    ]) {
      await page.selectOption("#scenario", mode);
      for (let i = 0; i < 18; i++) {
        if (
          ["Order canceled", "Order workflow completed"].includes(
            await status(),
          )
        )
          break;
        await page.locator("#step").click();
      }
      assert.equal(
        await status(),
        ["rejected", "timeout"].includes(mode)
          ? "Order canceled"
          : "Order workflow completed",
      );
    }
    assert.deepEqual(await page.evaluate(() => window.timingIssues), []);
    assert.deepEqual(errors, []);
    console.log(
      "PASS: all 16 routes audited frame by frame; fork and join ordering; activity starts; signals; reset; path changes; deadlines; reduced motion; five paths.",
    );
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
