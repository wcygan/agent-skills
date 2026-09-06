// Serve the gallery directory at http://127.0.0.1:8765, then run:
// playwright-cli run-code --filename=tests/browser/gallery_playback.js
// Use a dedicated browser session. This check navigates its active tab.
async function verifyGalleryPlayback(page) {
  const base = "http://127.0.0.1:8765/";
  // Routing disables the browser cache during local revision checks.
  await page.route(base + "**", (route) => route.continue());
  const slugs = [
    "mvcc",
    "deadlock",
    "gap-locks",
    "raft",
    "outbox",
    "consumer-replay",
    "consumer-groups",
    "watermarks",
    "backpressure",
  ];
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const assert = (condition, message) => {
    if (!condition) throw new Error(message);
  };
  const count = (target) => target.locator("#count").innerText();
  const next = (target) =>
    target
      .locator("#count")
      .filter({ hasText: "STEP 01" })
      .waitFor({ timeout: 6000 });
  await page.setViewportSize({ width: 1040, height: 900 });
  await page.emulateMedia({ reducedMotion: "no-preference" });

  // No Play click: every standalone demo must advance on its own.
  for (const slug of slugs) {
    await page.goto(base + "demos/" + slug + ".html");
    assert(
      (await page.locator("#play").innerText()) === "Pause",
      slug + " did not start automatically",
    );
    await next(page);
    await page.locator("#play").click();
    const stopped = await count(page);
    await page.waitForTimeout(1900);
    assert((await count(page)) === stopped, slug + " ignored Pause");
  }

  // Each diagram must move packets along its declared connection, without Play.
  for (const slug of slugs) {
    await page.goto(base + "demos/" + slug + ".html");
    await page.locator("#play").click();
    if (slug === "gap-locks") await page.locator("select").selectOption("25");
    const targetStep = ["raft", "consumer-groups", "gap-locks"].includes(slug)
      ? 2
      : 1;
    for (let i = 0; i < targetStep; i++) await page.locator("#step").click();
    const packets = page.locator("[data-packet]");
    assert((await packets.count()) > 0, slug + " has no event packet");
    const sample = () =>
      packets.first().evaluate((n) => ({ x: n.getCTM().e, y: n.getCTM().f }));
    await page.waitForTimeout(100);
    const a = await sample();
    await page.waitForTimeout(250);
    const b = await sample();
    assert(
      Math.hypot(a.x - b.x, a.y - b.y) > 2,
      slug + " packet is stationary",
    );
    const match = await page.locator("svg[aria-labelledby]").evaluate((svg) => {
      const active = [
        ...svg.querySelectorAll('[data-wire][data-active="true"]'),
      ];
      const motions = [...svg.querySelectorAll("animateMotion")];
      return (
        active.length === motions.length &&
        motions.every((m) =>
          active.some((w) => w.getAttribute("d") === m.getAttribute("path")),
        )
      );
    });
    assert(match, slug + " packet does not follow its active route");
  }

  // Measure motion after the SVG document is older than the animation duration.
  // Merely finding an animateMotion element did not detect the original bug.
  await page.goto(base + "demos/mvcc.html");
  await page.locator("#play").click();
  await page.waitForTimeout(1500);
  await page.locator("#step").click();
  const point = () =>
    page
      .locator("circle")
      .evaluate((node) => ({ x: node.getCTM().e, y: node.getCTM().f }));
  await page.waitForTimeout(120);
  const a = await point();
  await page.waitForTimeout(250);
  const b = await point();
  assert(
    Math.hypot(a.x - b.x, a.y - b.y) > 10,
    "Packet did not travel along its wire",
  );

  await page.goto(base + "demos/watermarks.html");
  await page.locator("#play").click();
  await page.waitForTimeout(1000);
  await page.locator("#step").click();
  const markerX = () =>
    page
      .locator("animateTransform")
      .first()
      .evaluate((node) => node.parentNode.getCTM().e);
  await page.waitForTimeout(120);
  const x = await markerX();
  await page.waitForTimeout(250);
  assert(Math.abs((await markerX()) - x) > 10, "Watermark did not move");

  // Real-time loop: show the final result, then restart without user input.
  await page.goto(base + "demos/gap-locks.html");
  await page
    .locator("#count")
    .filter({ hasText: "STEP 04" })
    .waitFor({ timeout: 12000 });
  await page
    .locator("#count")
    .filter({ hasText: "STEP 00" })
    .waitFor({ timeout: 5000 });
  await next(page);

  // Gallery ownership: visible frames run; manual pauses survive scrolling.
  await page.goto(base + "GALLERY.html");
  const firstElement = page.locator("iframe[data-stepped]").first();
  await firstElement.scrollIntoViewIfNeeded();
  const first = page.frameLocator("iframe[data-stepped]").first();
  await next(first);
  await first.locator("#play").click();
  const paused = await count(first);
  const lastElement = page.locator("iframe[data-stepped]").last();
  await lastElement.scrollIntoViewIfNeeded();
  const last = page.frameLocator("iframe[data-stepped]").last();
  await next(last);
  assert(
    (await count(first)) === paused,
    "Offscreen frame lost its manual pause",
  );
  await firstElement.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1900);
  assert(
    (await count(first)) === paused,
    "Scrolling restarted a manually paused demo",
  );
  await first.locator("#play").click();

  // Pause all suspends embedded demos; Resume restores automatic playback.
  await page.locator("#pause-all").click();
  await first
    .locator("#play")
    .filter({ hasText: /^Play$/ })
    .waitFor();
  await lastElement.scrollIntoViewIfNeeded();
  await last
    .locator("#play")
    .filter({ hasText: /^Play$/ })
    .waitFor();
  const held = await count(last);
  await page.waitForTimeout(1900);
  assert((await count(last)) === held, "Pause all failed");
  await page.locator("#pause-all").click();
  await lastElement.scrollIntoViewIfNeeded();
  await last
    .locator("#play")
    .filter({ hasText: /^Pause$/ })
    .waitFor();
  await page.waitForTimeout(1900);
  assert((await count(last)) !== held, "Resume all failed");

  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(base + "demos/mvcc.html");
  await next(page);
  assert(
    (await page.locator("animateMotion, animateTransform").count()) === 0,
    "Reduced motion still uses spatial animation",
  );
  assert(errors.length === 0, errors.join("\n"));
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto(base + "GALLERY.html");
  return "PASS: nine autoplay demos; packet and watermark movement; looping; pause; gallery visibility; reduced motion.";
}
