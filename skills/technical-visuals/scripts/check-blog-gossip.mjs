import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || "playwright");
const output = resolve(process.argv[2] || "/tmp/gossip-causal-evidence");
await mkdir(output, { recursive: true });
const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 1000 } });
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto(new URL("../examples/blog/gossip-protocols.html", import.meta.url).href);
  const sections = page.locator("[data-figure]");
  const state = async i => JSON.parse(await sections.nth(i).getAttribute("data-state"));
  const checkKnowledgeBadges = async () => {
    const visibleKnowledge = await sections.nth(1).locator('[data-peer]').evaluateAll(nodes =>
      nodes.filter(node => [...node.querySelectorAll('text')].some(label => label.textContent === '✓ E')).map(node => node.dataset.peer).sort());
    assert.deepEqual(visibleKnowledge, (await state(1)).known.sort(), "Only recipients that received E get its knowledge badge");
  };
  const click = (i, action) => sections.nth(i).locator(`[data-action="${action}"]`).click();
  const phase = (i, expected) => page.waitForFunction(([i, expected]) =>
    JSON.parse(document.querySelectorAll("[data-figure]")[i].dataset.state).phase === expected,
    [i, expected]);
  const position = i => sections.nth(i).locator("[data-packet]").first().getAttribute("transform");
  const capture = async name => {
    await sections.nth(name.startsWith("epidemic") ? 0 : 1).screenshot({ path: `${output}/${name}.png` });
  };

  await sections.nth(0).locator(".stage").scrollIntoViewIfNeeded();
  await phase(0, "in-flight");
  await page.waitForTimeout(200);
  const mid = await state(0);
  assert.equal(mid.infected.length, 1);
  assert.ok(mid.pending.length > 0);
  const progressWidth = () => sections.nth(0).locator('[data-infection-progress]').evaluate(bar => Number(bar.getAttribute('width')));
  const beforeWidth = await progressWidth();
  const fullWidth = Number(await sections.nth(0).locator('[data-infection-progress]').getAttribute('data-full-width'));
  assert.ok(beforeWidth > fullWidth / 36 && beforeWidth < fullWidth * (1 + mid.pending.length) / 36,
    "Progress interpolates between confirmed and incoming infections");
  const beforePosition = await position(0);
  await page.waitForTimeout(80);
  assert.notEqual(await position(0), beforePosition, "Packet must actually move");
  assert.ok(await progressWidth() > beforeWidth, "Progress fills during flight, before infections commit");
  await click(0, "play");
  const paused = await state(0);
  const pausedPosition = await position(0);
  const pausedWidth = await progressWidth();
  await page.waitForTimeout(850);
  assert.deepEqual(await state(0), paused, "Pause must prevent arrival commit");
  assert.equal(await position(0), pausedPosition, "Pause must freeze the marker");
  assert.equal(await progressWidth(), pausedWidth, "Pause freezes progress");
  await capture("epidemic-causal-light");
  await page.locator("#theme").click();
  assert.deepEqual(await state(0), paused);
  assert.equal(await position(0), pausedPosition, "Theme must preserve flight position");
  assert.equal(await progressWidth(), pausedWidth, "Theme preserves progress");
  await capture("epidemic-causal-dark");
  await click(0, "play");
  await phase(0, "settled");
  assert.equal((await state(0)).infected.length, 1 + mid.pending.length);
  await click(0, "play");

  await sections.nth(1).scrollIntoViewIfNeeded();
  await phase(1, "in-flight");
  assert.equal((await state(1)).step, 0, "Entrance is not yet committed");
  await phase(1, "settled");
  assert.equal((await state(1)).step, 1);
  await phase(1, "in-flight");
  await page.waitForTimeout(300);
  assert.deepEqual((await state(1)).known, ["E"]);
  assert.equal((await state(1)).pendingStep, 2);
  await checkKnowledgeBadges();
  assert.equal(await sections.nth(1).locator("[data-packet]").count(), 1);
  await click(1, "play");
  await capture("peer-causal-dark");
  await page.locator("#theme").click();
  await capture("peer-causal-light");
  await click(1, "play");
  await phase(1, "settled");
  assert.deepEqual((await state(1)).known, ["E", "A"]);
  await click(1, "step");
  assert.deepEqual((await state(1)).known, ["E", "A", "B"]);
  await page.selectOption("#speed", "4");
  await click(1, "play");
  await page.waitForFunction(() => {
    const s = JSON.parse(document.querySelector('[data-figure="membership-gossip"]').dataset.state);
    return s.known.length === 5 && s.phase === "settled";
  });
  assert.equal(await sections.nth(1).locator('[data-action="play"]').isDisabled(), true);
  await checkKnowledgeBadges();

  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.reload();
  const initial = await state(0);
  await page.waitForTimeout(1100);
  assert.deepEqual(await state(0), initial, "Reduced motion must not autoplay");
  let previous = initial;
  for (let n = 0; n < 100 && previous.infected.length < 34; n++) {
    await click(0, "step");
    const next = await state(0);
    assert.equal(next.phase, "settled");
    for (const [from, to] of next.transmissions) {
      assert.ok(previous.infected.includes(from));
      assert.ok(!previous.infected.includes(to));
      assert.equal(Math.abs(Math.floor(from / 6) - Math.floor(to / 6)) + Math.abs(from % 6 - to % 6), 1);
    }
    previous = next;
  }
  assert.equal(await page.locator("[data-motion-from]").count(), 0);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await click(0, "play");
  await page.waitForFunction(() => {
    const s = JSON.parse(document.querySelector('[data-figure="epidemic-spread"]').dataset.state);
    return s.infected.length === 36 && s.phase === "settled";
  });
  assert.equal(await sections.nth(0).locator('[data-action="play"]').isDisabled(), true);
  assert.equal(await page.locator('[data-action="export"]').count(), 0);
  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
  mobile.on("pageerror", error => errors.push(error.message));
  await mobile.goto(new URL("../examples/blog/gossip-protocols.html", import.meta.url).href);
  const mobileSections = mobile.locator("[data-figure]");
  const mobileState = async i => JSON.parse(await mobileSections.nth(i).getAttribute("data-state"));
  const mobilePhase = (i, expected) => mobile.waitForFunction(([i, expected]) =>
    JSON.parse(document.querySelectorAll("[data-figure]")[i].dataset.state).phase === expected,
    [i, expected]);
  const mobileClick = (i, action) => mobileSections.nth(i).locator(`[data-action="${action}"]`).click();
  const progress = i => mobileSections.nth(i).locator("[data-packet]").first().evaluate(node => {
    const from = node.dataset.motionFrom.split(",").map(Number);
    const to = node.dataset.motionTo.split(",").map(Number);
    const matrix = node.transform.baseVal.consolidate().matrix;
    return from[0] === to[0] ? (matrix.f - from[1]) / (to[1] - from[1]) : (matrix.e - from[0]) / (to[0] - from[0]);
  });
  await mobileSections.nth(0).locator(".stage").scrollIntoViewIfNeeded();
  await mobilePhase(0, "in-flight");
  const startPosition = await progress(0);
  await mobile.waitForTimeout(160);
  assert.ok(await progress(0) > startPosition, "Mobile packet must move");
  await mobileClick(0, "play");
  const mobilePending = await mobileState(0);
  assert.equal(mobilePending.infected.length, 1);
  const plusSigns = await mobileSections.nth(0).locator("svg text").evaluateAll(nodes => nodes.filter(node => node.textContent === "+").length);
  assert.equal(plusSigns, 1, "Pending recipients must retain minus signs");
  const pausedProgress = await progress(0);
  for (const width of [1200, 360, 430, 390]) {
    await mobile.setViewportSize({ width, height: 844 });
    await mobile.waitForTimeout(80);
    assert.deepEqual(await mobileState(0), mobilePending, "Resize must preserve phase and model");
    assert.ok(Math.abs(await progress(0) - pausedProgress) < 0.0001, "Resize must preserve flight progress");
    assert.equal(await mobileSections.nth(0).locator('[data-action="play"]').textContent(), "Play");
    if (width <= 600) {
      const geometry = await mobile.evaluate(() => ({
        overflow: document.documentElement.scrollWidth > innerWidth || [...document.querySelectorAll(".stage")].some(node => node.scrollWidth > node.clientWidth),
        small: [...document.querySelectorAll(".stage svg text")].filter(node => parseFloat(getComputedStyle(node).fontSize) * node.getScreenCTM().a < 12).map(node => node.textContent),
      }));
      assert.equal(geometry.overflow, false);
      assert.deepEqual(geometry.small, []);
    }
  }
  for (const theme of ["light", "dark"]) {
    if (theme === "dark") await mobile.locator("#theme").click();
    await mobileSections.nth(0).screenshot({ path: `${output}/mobile-epidemic-${theme}.png` });
  }
  await mobileSections.nth(1).locator(".stage").scrollIntoViewIfNeeded();
  await mobilePhase(1, "in-flight");
  await mobilePhase(1, "settled");
  await mobilePhase(1, "in-flight");
  await mobile.waitForTimeout(220);
  await mobileClick(1, "play");
  assert.deepEqual((await mobileState(1)).known, ["E"]);
  const peerProgress = await progress(1);
  await mobile.waitForTimeout(500);
  assert.equal(await progress(1), peerProgress);
  for (const theme of ["dark", "light"]) {
    if (theme === "light") await mobile.locator("#theme").click();
    await mobileSections.nth(1).screenshot({ path: `${output}/mobile-peer-${theme}.png` });
  }
  await mobileClick(1, "step");
  assert.deepEqual((await mobileState(1)).known, ["E", "A"]);
  assert.deepEqual(errors, []);
  console.log("PASS: moving packets, causal arrivals, pause/theme/step, reduced motion, convergence, mobile 360/390/430 bounds and resize continuity");
} finally {
  await browser.close();
}
