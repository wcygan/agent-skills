import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || "playwright");
const out = process.env.VISUAL_EVIDENCE_DIR || "/tmp/leader-election-review";
await mkdir(out, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 1100 }, reducedMotion: "reduce" });
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
await page.goto(process.env.VISUAL_BASE_URL ? `${process.env.VISUAL_BASE_URL}/examples/blog/leader-election.html` : new URL("../examples/blog/leader-election.html", import.meta.url).href);
const state = () => page.locator("[data-figure]").getAttribute("data-state").then(JSON.parse);
const click = (action) => page.locator(`[data-action="${action}"]`).click();
const routes = () => page.locator('[data-leader-route="true"]').evaluateAll((lines) => lines.map((line) => line.dataset.route).sort());
const identities = () => page.locator("[data-node]").evaluateAll((nodes) => Object.fromEntries(nodes.map((node) => [node.dataset.node, node.querySelector("rect").getAttribute("stroke")])));
const centeredPackets = () => page.locator('[data-packet]').evaluateAll(packets => packets.every(packet => {
  const line = document.querySelector(`[data-route="${packet.dataset.from}${packet.dataset.to}"]`);
  if (!line) return false;
  const x1 = +line.getAttribute('x1'), y1 = +line.getAttribute('y1');
  const dx = +line.getAttribute('x2') - x1, dy = +line.getAttribute('y2') - y1;
  const matrix = packet.transform.baseVal.consolidate().matrix;
  const px = matrix.e - x1, py = matrix.f - y1;
  const distance = Math.abs(px * dy - py * dx) / Math.hypot(dx, dy);
  const position = (px * dx + py * dy) / (dx * dx + dy * dy);
  return distance < 0.01 && position >= -0.0001 && position <= 1.0001;
}));
const geometry = () => page.evaluate(() => {
  const onEdge = (id, x, y) => {
    const rect = document.querySelector(`[data-node="${id}"] rect`);
    const left = +rect.getAttribute("x"), top = +rect.getAttribute("y");
    const right = left + +rect.getAttribute("width"), bottom = top + +rect.getAttribute("height");
    return x >= left - .01 && x <= right + .01 && y >= top - .01 && y <= bottom + .01 && Math.min(Math.abs(x-left), Math.abs(x-right), Math.abs(y-top), Math.abs(y-bottom)) < .01;
  };
  return [...document.querySelectorAll("[data-route]")].every((line) => onEdge(line.dataset.route[0], +line.getAttribute("x1"), +line.getAttribute("y1")) && onEdge(line.dataset.route[1], +line.getAttribute("x2"), +line.getAttribute("y2")));
});
const verifyNodeFacts = async () => {
  const s = await state();
  for (const [id, node] of Object.entries(s.nodes)) {
    const view = page.locator(`[data-node="${id}"]`);
    const role = s.crashed.includes(id) ? "crashed" : node.role;
    assert.equal(await view.getAttribute("data-role"), role);
    assert.equal(await view.locator("[data-node-term], [data-node-vote]").count(), 2);
    assert(await view.evaluate(node => {
      const body = node.querySelector("rect").getBoundingClientRect();
      const marks = [...node.querySelectorAll("text, [data-role-icon], [data-timer-bar]")].map(mark => mark.getBoundingClientRect());
      const inside = marks.every(mark => mark.left >= body.left && mark.right <= body.right && mark.top >= body.top && mark.bottom <= body.bottom);
      const separate = marks.every((mark, i) => marks.slice(i + 1).every(other => mark.right <= other.left || mark.left >= other.right || mark.bottom <= other.top || mark.top >= other.bottom));
      const icon = node.querySelector("[data-role-icon]")?.getBoundingClientRect();
      return inside && separate && (!icon || (icon.right < body.left + body.width / 2 && icon.bottom < body.top + body.height / 2));
    }), `${id}: icon, ID, two metadata lines, and timer fit without overlap`);
    assert.equal(await view.locator("[data-node-term]").textContent(), `Term ${node.term}`);
    assert.equal(await view.locator("[data-node-vote]").textContent(), `Vote ${node.votedFor ? `→ ${node.votedFor}` : "—"}`);
    const icons = view.locator("[data-role-icon]");
    assert.equal(await icons.count(), ["leader", "candidate"].includes(role) ? 1 : 0);
    if (["leader", "candidate"].includes(role)) {
      assert.equal(await icons.getAttribute("data-role-icon"), role);
      assert.match(await icons.getAttribute("aria-label"), role === "candidate" ? /ballot box/i : /leader/i);
    }
    if (role === "crashed") assert.match(await view.textContent(), /crashed/);
  }
};
assert.equal((await state()).now, 0);
assert(await centeredPackets(), "Initial packets sit on their connector centerlines");
const visibleWords = await page.locator("#network svg text").evaluateAll(nodes => nodes.map(node => node.textContent).join(" ").match(/\b[\p{L}\p{N}]+\b/gu)?.length ?? 0);

assert.deepEqual(await routes(), ["BA", "BC", "BD", "BE"]);
assert(await geometry(), "All route endpoints meet node bounds");
const palette = {};
for (const theme of ["light", "dark"]) {
  if (await page.locator("html").getAttribute("data-theme") !== theme) await page.locator("#theme").click();
  await verifyNodeFacts();
  palette[theme] = await identities();
  assert.equal(new Set(Object.values(palette[theme])).size, 5);
  assert.equal(await page.locator('[data-packet] text').first().getAttribute('fill'), await page.evaluate(() => window.visualTokens[document.documentElement.dataset.theme].failure));
  await page.screenshot({ path: `${out}/leader-${theme}-static.png`, fullPage: true });
}
await page.locator("#scenario").selectOption("split");
await click("crash");
assert.deepEqual(await routes(), []);
assert.deepEqual(await identities(), palette.dark);
let split = false, recovery = false, elected = false, candidateCaptured = false;
await verifyNodeFacts();
for (let i = 0; i < 35; i++) {
  await click("step");
  const s = await state();
  await verifyNodeFacts();
  if (!candidateCaptured && Object.values(s.nodes).filter(node => node.role === "candidate").length >= 2) {
    for (const theme of ["light", "dark"]) {
      if (await page.locator("html").getAttribute("data-theme") !== theme) await page.locator("#theme").click();
      await verifyNodeFacts();
      await page.screenshot({ path: `${out}/leader-${theme}-candidates.png`, fullPage: true });
    }
    candidateCaptured = true;
  }
  split ||= s.splitSeen;
  recovery ||= !s.crashed.length;
  assert.deepEqual(await identities(), palette.dark);
  assert(await geometry());
  assert(await centeredPackets(), "Election packets follow their connector centerlines");
  if (s.leader && s.nodes[s.leader].term >= 3) {
    elected = true;
    assert.deepEqual(await routes(), ["A", "B", "C", "D", "E"].filter(id => id !== s.leader && !s.crashed.includes(id)).map(id => `${s.leader}${id}`).sort());
  }
}
assert(candidateCaptured);
assert(split && recovery && elected, "Split vote, recovery, and later-term election remain real protocol events");
await click("reset");
for (const theme of ["light", "dark"]) {
  if (await page.locator("html").getAttribute("data-theme") !== theme) await page.locator("#theme").click();
  await click("play");
  await page.waitForTimeout(100);
  assert(await centeredPackets(), "Animated packets remain centered on their connectors");
  await page.waitForTimeout(550);
  await click("play");
  assert.deepEqual(await routes(), ["BA", "BC", "BD", "BE"]);
  assert(await centeredPackets(), "Paused packets remain on their connector centerlines");
  await page.screenshot({ path: `${out}/leader-${theme}-midflight.png`, fullPage: true });
  const paused = await state();
  await page.waitForTimeout(150);
  assert.deepEqual(await state(), paused);
  await click("reset");
}
const mobile = [];
for (const width of [360, 390, 430]) {
  await page.setViewportSize({ width, height: 844 });
  await page.waitForFunction(() => document.querySelector("#network svg").viewBox.baseVal.width === 376);
  const snapshot = await state();
  for (const theme of ["light", "dark"]) {
    if (await page.locator("html").getAttribute("data-theme") !== theme) await page.locator("#theme").click();
    await verifyNodeFacts();
    assert(await geometry());
    assert(await centeredPackets());
    const metrics = await page.evaluate(() => {
      const stage = document.querySelector("#network");
      const svg = stage.querySelector("svg");
      const scale = svg.getBoundingClientRect().width / svg.viewBox.baseVal.width;
      return {
        width: stage.clientWidth, scrollWidth: stage.scrollWidth,
        smallestLabel: Math.min(...[...svg.querySelectorAll("text")].map(text => +text.getAttribute("font-size") * scale)),
        controls: [...document.querySelectorAll(".controls button, .controls select")].map(control => ({ height: control.getBoundingClientRect().height, font: parseFloat(getComputedStyle(control).fontSize) })),
      };
    });
    assert(metrics.scrollWidth <= metrics.width + 1, "Portrait diagram fits without horizontal scrolling");
    assert(metrics.smallestLabel >= 12, "Portrait labels remain at least 12 CSS pixels");
    assert(metrics.controls.every(control => control.height >= 44 && control.font >= 16));
    assert.deepEqual(await state(), snapshot, "Resize and theme preserve the paused model");
    mobile.push({ width, theme, ...metrics });
    if (width === 390) await page.screenshot({ path: `${out}/leader-mobile-${theme}.png`, fullPage: true });
  }
}
await page.setViewportSize({ width: 390, height: 844 });
await click("crash");
let mobileCandidates = false;
for (let i = 0; i < 35; i++) {
  await click("step");
  await verifyNodeFacts();
  assert(await geometry());
  assert(await centeredPackets());
  const s = await state();
  if (!mobileCandidates && Object.values(s.nodes).filter(node => node.role === "candidate").length >= 2) {
    for (const theme of ["light", "dark"]) {
      if (await page.locator("html").getAttribute("data-theme") !== theme) await page.locator("#theme").click();
      await verifyNodeFacts();
      await page.screenshot({ path: `${out}/leader-mobile-${theme}-candidates.png`, fullPage: true });
    }
    mobileCandidates = true;
  }
}
assert(mobileCandidates);
const beforeOrientation = await state();
await page.setViewportSize({ width: 1400, height: 1100 });
await page.waitForFunction(() => document.querySelector("#network svg").viewBox.baseVal.width === 1000);
assert.deepEqual(await state(), beforeOrientation);
await verifyNodeFacts();
assert(await centeredPackets());
await writeFile(`${out}/leader-mobile-results.json`, JSON.stringify(mobile, null, 2));
assert.equal(await page.locator('[data-action="export"]').count(), 0);
assert.deepEqual(errors, []);
await writeFile(`${out}/leader-results.json`, JSON.stringify({ visibleWords, persistentRoutes: true, edgePorts: true, palette, split, recovery, elected, candidateCaptured, errors }, null, 2));
await browser.close();
console.log("PASS: persistent leader routes, exact edge ports, five stable identities in both themes, red hearts, split/recovery/re-election, pause/reset, and screenshots.");
