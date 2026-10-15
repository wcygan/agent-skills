import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
assert.ok(process.argv[2], 'Provide an external evidence directory');
const out = resolve(process.argv[2]);
await mkdir(out, { recursive: true });
const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 1000 }, reducedMotion: 'reduce' });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const url = process.env.VISUAL_BASE_URL
    ? `${process.env.VISUAL_BASE_URL}/examples/blog/replication.html`
    : new URL('../examples/blog/replication.html', import.meta.url).href;
  await page.goto(url);
  const ids = ['database-log', 'log-replication', 'group-lag'];
  const figure = id => page.locator(`[data-figure="${id}"]`);
  const click = (id, action) => figure(id).locator(`[data-action="${action}"]`).click();
  const state = id => figure(id).getAttribute('data-state').then(JSON.parse);
  const states = () => page.locator('[data-figure]').evaluateAll(nodes => nodes.map(node => node.dataset.state));
  assert.equal(await page.locator('[data-figure]').count(), 3);
  assert.equal(await page.locator('.experiments, [data-open], a[href*="studies/"]').count(), 0);

  function transition(id, before, after) {
    if (id === 'database-log') { assert.equal(after.appended - before.appended, 1); return; }
    assert.ok(after.primary >= after.received && after.received >= after.applied);
    for (const key of ['primary', 'received', 'applied']) assert.ok(after[key] - before[key] <= 1);
    if (after.received > before.received) {
      assert.ok(before.connected, 'A disconnected peer cannot receive a write');
      assert.ok(before.primary >= after.received, 'Only an already logged write can be copied');
    }
    if (after.applied > before.applied) assert.ok(before.received >= after.applied, 'Receive before applying');
  }
  async function checkLogs(id) {
    const current = await state(id);
    const logs = await figure(id).locator('[data-log]').evaluateAll(nodes => nodes.map(log => ({
      name: log.dataset.log, received: Number(log.dataset.received), applied: Number(log.dataset.applied),
      slots: [...log.querySelectorAll('[data-entry] > rect')].map(slot => ({ x: Number(slot.getAttribute('x')), y: Number(slot.getAttribute('y')) })),
      active: log.querySelectorAll('[data-entry-state="active"]').length,
      filled: log.querySelectorAll('[data-entry]:not([data-entry-state="empty"])').length,
    })));
    assert.deepEqual(logs.map(log => log.name), id === 'database-log' ? ['database'] : ['primary', 'peer']);
    for (const log of logs) {
      assert.equal(log.slots.length, 6);
      assert.ok(log.slots.every((slot, i) => slot.y === log.slots[0].y && (!i || slot.x > log.slots[i - 1].x)), 'Logs remain horizontal and ordered');
      assert.equal(log.filled, log.received);
      assert.ok(log.active <= 1, 'Only one entry is next to apply');
    }
    if (id !== 'database-log') {
      assert.match(await figure(id).locator('[data-node="primary"]').textContent(), new RegExp(`v${current.primary}`));
      assert.match(await figure(id).locator('[data-node="peer"]').textContent(), new RegExp(`v${current.applied}`));
      assert.equal(logs[1].received, current.received);
      assert.equal(logs[1].applied, current.applied);
    }
  }
  for (const id of ids) {
    await checkLogs(id);
    for (let step = 0; step < 3; step++) {
      const before = await state(id);
      await click(id, 'step');
      transition(id, before, await state(id));
      await checkLogs(id);
    }
  }
  const paused = await states();
  await page.waitForTimeout(150);
  assert.deepEqual(await states(), paused);
  for (const theme of ['light', 'dark']) {
    if (await page.locator('html').getAttribute('data-theme') !== theme) await page.locator('#theme').click();
    assert.deepEqual(await states(), paused, 'Theme switches preserve state');
    for (const id of ids) await figure(id).screenshot({ path: `${out}/${id}-${theme}.png` });
    for (const width of [360, 390, 430]) {
      await page.setViewportSize({ width, height: 844 });
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
      assert.ok(await page.locator('.stage').evaluateAll(nodes => nodes.every(node => node.scrollWidth <= node.clientWidth + 1)));
      const font = await page.locator('.stage svg text').evaluateAll(nodes => Math.min(...nodes.map(node => Number(node.getAttribute('font-size')) * node.ownerSVGElement.getBoundingClientRect().width / 500)));
      assert.ok(font >= 12, `Readable labels at ${width}: ${font}`);
      assert.ok(await page.locator('.controls button').evaluateAll(nodes => nodes.every(node => node.getBoundingClientRect().height >= 44)));
      for (const id of ids) await figure(id).screenshot({ path: `${out}/${id}-${theme}-${width}.png` });
      assert.deepEqual(await states(), paused, 'Resizing preserves state and pause intent');
    }
    await page.setViewportSize({ width: 1200, height: 1000 });
  }
  for (const id of ids) {
    let last = await state(id), buffered = last.received > last.applied, disconnected = last.connected === false;
    while (await figure(id).locator('[data-action="step"]').isEnabled()) {
      await click(id, 'step');
      const current = await state(id);
      transition(id, last, current);
      await checkLogs(id);
      buffered ||= current.received > current.applied;
      disconnected ||= current.connected === false;
      last = current;
    }
    if (id === 'database-log') assert.equal(last.appended, 6);
    else {
      assert.ok(buffered, 'Both paired demos show buffered entries');
      assert.equal(last.primary, 6); assert.equal(last.received, 6); assert.equal(last.applied, 6);
      assert.equal(last.connected, true);
      if (id === 'group-lag') assert.ok(disconnected, 'Lag includes interruption and recovery');
    }
    assert.equal(await figure(id).locator('output').textContent(), 'Complete');
    await click(id, 'replay');
    assert.equal(await figure(id).getAttribute('data-phase'), '0');
    assert.equal(await figure(id).locator('[data-action="play"]').textContent(), 'Play', 'Reduced motion remains paused');
  }

  await page.emulateMedia({ reducedMotion: 'no-preference' });
  for (const id of ids) {
    await figure(id).scrollIntoViewIfNeeded();
    await click(id, 'replay');
    assert.equal(await figure(id).locator('[data-action="play"]').textContent(), 'Pause');
    const initial = await state(id);
    const packet = figure(id).locator('[data-payload]').first();
    const before = await packet.getAttribute('transform');
    await page.waitForTimeout(220);
    assert.notEqual(await packet.getAttribute('transform'), before, 'Playback moves packets');
    assert.deepEqual(await state(id), initial, 'Recipient state waits for arrival');
    assert.ok(await figure(id).locator('[data-payload]').evaluateAll(nodes => nodes.every(node => {
      const path = document.getElementById(node.dataset.path);
      const match = node.getAttribute('transform').match(/translate\(([-\d.]+) ([-\d.]+)\)/);
      if (!match) return false;
      const x = Number(match[1]), y = Number(match[2]), length = path.getTotalLength();
      let nearest = Infinity;
      for (let d = 0; d <= length; d += 0.5) {
        const point = path.getPointAtLength(d);
        nearest = Math.min(nearest, Math.hypot(point.x - x, point.y - y));
      }
      return nearest < 0.6;
    })), 'Every payload stays centered on its actual connector');
    await figure(id).locator('.stage svg').evaluate(svg => svg.dataset.originalRoot = 'true');
    await page.setViewportSize({ width: 390, height: 844 });
    assert.equal(await figure(id).locator('svg').getAttribute('data-original-root'), 'true');
    await click(id, 'play');
    const frozen = await packet.getAttribute('transform');
    await page.waitForTimeout(150);
    assert.equal(await packet.getAttribute('transform'), frozen, 'Pause freezes in-flight progress');
    await page.setViewportSize({ width: 1200, height: 1000 });
    await click(id, 'replay');
    await page.waitForTimeout(2350);
    assert.equal(await figure(id).getAttribute('data-phase'), '1', 'Autoplay completes a causal transition');
    assert.equal(await figure(id).locator('svg').getAttribute('data-original-root'), 'true', 'The SVG root is retained between phases');
    await click(id, 'play');
  }
  await figure(ids[0]).scrollIntoViewIfNeeded();
  await click(ids[0], 'replay');
  await page.waitForTimeout(100);
  await page.evaluate(() => scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(100);
  const offscreen = await state(ids[0]);
  const offscreenProgress = await figure(ids[0]).locator('progress').evaluate(node => node.value);
  await page.waitForTimeout(2400);
  assert.deepEqual(await state(ids[0]), offscreen);
  assert.equal(await figure(ids[0]).locator('progress').evaluate(node => node.value), offscreenProgress, 'Offscreen animation suspends');
  await figure(ids[0]).scrollIntoViewIfNeeded();
  await page.waitForTimeout(100);
  assert.notEqual(await figure(ids[0]).locator('progress').evaluate(node => node.value), offscreenProgress, 'Visible playback resumes');
  assert.deepEqual(errors, []);
  await writeFile(`${out}/results.json`, JSON.stringify({ demos: 3, themes: 2, phoneWidths: [360, 390, 430], horizontalLogs: true, causalArrival: true, serialApplication: true, exactRoutes: true, reducedMotion: true, autoplay: true, offscreenSuspension: true, errors }, null, 2));
  console.log('PASS: 3 approved demos; horizontal logs; buffering and recovery; causal arrival; exact routes; themes and phone layouts; pause, replay, autoplay and offscreen suspension');
} finally { await browser.close(); }
