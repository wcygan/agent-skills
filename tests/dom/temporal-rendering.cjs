// Optional DOM regression check (no browser layout, rasterization, or GPU timing).
// npm install --prefix /tmp/temporal-rendering-tests jsdom
// NODE_PATH=/tmp/temporal-rendering-tests/node_modules node tests/dom/temporal-rendering.cjs
// Add --benchmark [HTML path] to compare identical two-second playback samples.
const {JSDOM, VirtualConsole} = require('jsdom');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {performance} = require('node:perf_hooks');
const html = process.argv[3] || path.resolve(__dirname, '../../skills/style-technical-visuals/references/standalone-3d/temporal-mysql-architecture.html');
const numbers = value => (value.match(/-?\d*\.?\d+(?:e[+-]?\d+)?/gi) || []).map(Number);
const points = value => {const values = numbers(value); return Array.from({length: values.length / 2}, (_, i) => values.slice(i * 2, i * 2 + 2));};
function distance(p, a, b) {
  const dx = b[0] - a[0], dy = b[1] - a[1], length2 = dx * dx + dy * dy;
  const t = length2 ? Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / length2)) : 0;
  return Math.hypot(p[0] - a[0] - t * dx, p[1] - a[1] - t * dy);
}
function inside(p, polygon) {
  let result = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const a = polygon[i], b = polygon[j];
    if ((a[1] > p[1]) !== (b[1] > p[1]) && p[0] < (b[0] - a[0]) * (p[1] - a[1]) / (b[1] - a[1]) + a[0]) result = !result;
  }
  return result;
}
function project([x, y, z], angle) {
  const X = (x - 75) * Math.cos(angle) - (z - 280) * Math.sin(angle) + 75 * Math.cos(.14) - 280 * Math.sin(.14);
  const Z = (x - 75) * Math.sin(angle) + (z - 280) * Math.cos(angle) + 75 * Math.sin(.14) + 280 * Math.cos(.14);
  return [600 + X, 365 + Z * .56 - y * .9];
}
// Independent ray/solid oracle: camera rays preserve the screen projection.
function occluded(position, angle) {
  const direction = [Math.sin(angle), .56 / .9, Math.cos(angle)];
  const boxes = [[-220, 750, 130, 110, 0, 80], [40, 750, 130, 110, 0, 80], [-230, 0, 120, 510, 0, 80], [70, -190, 180, 120, 0, 80], [70, 190, 180, 120, 0, 80], ...[0, 1, 2].map(i => [20 + i * 48, 154, 24, 20, 80, 87])];
  for (const [x, z, width, depth, base, top] of boxes) {
    const lo = [x - width / 2, base, z - depth / 2], hi = [x + width / 2, top, z + depth / 2];
    let near = -Infinity, far = Infinity;
    for (let i = 0; i < 3; i++) {
      if (Math.abs(direction[i]) < 1e-9) {if (position[i] < lo[i] || position[i] > hi[i]) far = -Infinity; continue;}
      const a = (lo[i] - position[i]) / direction[i], b = (hi[i] - position[i]) / direction[i];
      near = Math.max(near, Math.min(a, b)); far = Math.min(far, Math.max(a, b));
    }
    if (far > 1e-4 && far >= Math.max(0, near)) return true;
  }
  const x = position[0] - 380, z = position[2], b = 2 * (x * direction[0] + z * direction[2]), c = x * x + z * z - 3600, discriminant = b * b - 4 * c;
  if (discriminant < 0) return false;
  const near = Math.max((-b - Math.sqrt(discriminant)) / 2, -position[1] / direction[1]);
  const far = Math.min((-b + Math.sqrt(discriminant)) / 2, (100 - position[1]) / direction[1]);
  return far > 1e-4 && far >= Math.max(0, near);
}

function open(reduced = false) {
  const frames = new Map(), observers = [], errors = [], console = new VirtualConsole();
  console.on('jsdomError', error => errors.push(error));
  let next = 1, now = 0, hidden = false;
  const counts = {elements: 0, attributes: 0, replacements: 0};
  const dom = new JSDOM(fs.readFileSync(html, 'utf8'), {
    runScripts: 'dangerously', pretendToBeVisual: true, virtualConsole: console,
    beforeParse(w) {
      w.matchMedia = () => ({matches: reduced, addEventListener() {}});
      w.requestAnimationFrame = callback => {const id = next++; frames.set(id, callback); return id;};
      w.cancelAnimationFrame = id => frames.delete(id);
      w.IntersectionObserver = class {
        constructor(callback) {this.callback = callback; observers.push(this);}
        observe(target) {this.target = target;}
      };
      w.SVGElement.prototype.setPointerCapture = function() {};
      w.SVGElement.prototype.getBBox = () => ({x: 0, y: 0, width: 1200, height: 1100});
      Object.defineProperty(w.document, 'hidden', {get: () => hidden});
      const create = w.Document.prototype.createElementNS;
      w.Document.prototype.createElementNS = function(...args) {counts.elements++; return create.apply(this, args);};
      const set = w.Element.prototype.setAttribute;
      w.Element.prototype.setAttribute = function(...args) {counts.attributes++; return set.apply(this, args);};
      const replace = w.Element.prototype.replaceChildren;
      w.Element.prototype.replaceChildren = function(...args) {if (this.id === 'world') counts.replacements++; return replace.apply(this, args);};
    }
  });
  const document = dom.window.document, world = document.getElementById('world'), svg = document.getElementById('scene');
  const tick = (delta = 1000 / 60) => {
    now += delta;
    const queue = [...frames.values()]; frames.clear();
    for (const callback of queue) callback(now);
  };
  const resetCounts = () => {for (const key of Object.keys(counts)) counts[key] = 0;};
  const pointer = (type, x) => {
    const event = new dom.window.MouseEvent(type, {button: 0, clientX: x, bubbles: true});
    Object.defineProperty(event, 'pointerId', {value: 17}); svg.dispatchEvent(event);
  };
  return {dom, document, world, svg, frames, counts, errors, tick, resetCounts, pointer,
    visible(value) {for (const observer of observers) observer.callback([{target: observer.target, isIntersecting: value}]);},
    hidden(value) {hidden = value; document.dispatchEvent(new dom.window.Event('visibilitychange'));}
  };
}

const app = open();
for (let i = 0; i < 10; i++) app.tick();
const packet = app.world.querySelector('[data-packet="active"]');
app.resetCounts();
const start = performance.now();
for (let i = 0; i < 120; i++) app.tick();
const sample = {...app.counts, averageScriptMs: (performance.now() - start) / 120};
console.log(JSON.stringify({frames: 120, ...sample}));
if (process.argv[2] === '--benchmark') {
  assert.deepEqual(app.errors, []); app.dom.window.close(); process.exit(0);
}
assert.equal(sample.elements, 0, 'Playback within a phase must retain its SVG elements');
assert.equal(sample.replacements, 0, 'Playback must not replace the scene each frame');
assert(sample.attributes <= 120 * 8, 'Playback updates only the small payload glyph and its depth mask');
assert.equal(app.world.querySelector('[data-packet="active"]'), packet);
assert.equal(app.world.querySelectorAll('line[mask]').length, 0, 'Gray and orange strokes do not need per-segment raster masks');
assert.equal(app.world.querySelectorAll('mask').length, 1);
const mask = app.world.querySelector('mask');
assert(Number(mask.getAttribute('width')) <= 18 && Number(mask.getAttribute('height')) <= 18);
const scaled = app.document.getElementById('scale-world').innerHTML;
app.document.getElementById('pause').click();
assert.equal(app.frames.size, 0, 'Paused playback must stop scheduling frames');
app.resetCounts(); app.tick(10000);
assert.deepEqual(app.counts, {elements: 0, attributes: 0, replacements: 0});

// Pointer events can arrive faster than display refresh. Paint the latest angle once.
const portBefore = app.world.querySelector('[data-arrow="active"]').getAttribute('data-tip');
app.pointer('pointerdown', 100);
for (let i = 1; i <= 30; i++) app.pointer('pointermove', 100 + i * 100);
app.pointer('pointerup', 3100);
assert.equal(app.counts.replacements, 0);
assert.equal(app.frames.size, 1);
app.tick();
assert.equal(app.counts.replacements, 1);
assert.notEqual(app.world.querySelector('[data-arrow="active"]').getAttribute('data-tip'), portBefore);
app.document.getElementById('view').click();
assert.equal(app.world.querySelector('[data-arrow="active"]').getAttribute('data-tip'), portBefore);

for (let phase = 1; phase < 12; phase++) {
  app.document.getElementById('step').click();
  assert(app.document.getElementById('status').textContent.startsWith(`${phase + 1}/12`));
  assert.equal(app.world.querySelectorAll('[data-arrow="active"]').length, 1);
  assert.equal(app.frames.size, 0);
}
app.document.getElementById('reset').click(); app.tick();
for (const toggle of [value => app.visible(value), value => app.hidden(!value)]) {
  const position = app.world.querySelector('[data-packet="active"]').getAttribute('data-position');
  toggle(false); assert.equal(app.frames.size, 0, 'Offscreen/hidden playback must stop scheduling frames');
  app.resetCounts(); app.tick(100000);
  assert.deepEqual(app.counts, {elements: 0, attributes: 0, replacements: 0});
  toggle(true); app.tick();
  assert.equal(app.world.querySelector('[data-packet="active"]').getAttribute('data-position'), position, 'Resuming must not catch up background time');
}
assert.equal(app.document.getElementById('scale-world').innerHTML, scaled);
assert.deepEqual(app.errors, []); app.dom.window.close();
// Geometry checks cover shared and reversed routes, arrowheads and payload depth
// throughout full rotation. They inspect SVG coordinates, not rendered pixels.
const geometry = open(true);
let views = 0, hiddenPackets = 0, visiblePackets = 0;
for (let phase = 0; phase < 12; phase++) {
  if (phase) geometry.document.getElementById('step').click();
  for (let progress = 0; progress < 4; progress++) {
    if (progress) {
      geometry.document.getElementById('pause').click(); geometry.tick();
      for (let i = 0; i < 15; i++) geometry.tick(50);
      geometry.document.getElementById('pause').click();
    }
    for (let quadrant = 0; quadrant < 8; quadrant++) {
      const angle = .14 + quadrant * Math.PI / 4;
      geometry.document.getElementById('view').click();
      geometry.pointer('pointerdown', 100); geometry.pointer('pointermove', 100 + (angle - .14) / .004); geometry.pointer('pointerup', 100); geometry.tick(0);
      const world = geometry.world, order = [...world.children];
      const arrow = world.querySelector('[data-arrow="active"]'), head = points(arrow.getAttribute('d'));
      const tip = numbers(arrow.getAttribute('data-tip')), expected = project(numbers(arrow.getAttribute('data-port')), angle);
      assert(Math.hypot(tip[0] - expected[0], tip[1] - expected[1]) < 1e-7);
      const active = [...world.querySelectorAll('[data-line-role="active"]')].map(line => [[+line.getAttribute('x1'), +line.getAttribute('y1')], [+line.getAttribute('x2'), +line.getAttribute('y2')]]);
      const payload = world.querySelector('[data-packet="active"]'), position = numbers(payload.getAttribute('data-position'));
      const center = [+payload.getAttribute('cx'), +payload.getAttribute('cy')], projected = project(position, angle);
      assert(Math.hypot(center[0] - projected[0], center[1] - projected[1]) < 1e-7);
      for (const line of world.querySelectorAll('[data-line-role="baseline"]')) {
        assert(order.indexOf(line) < order.indexOf(payload), 'Gray wires cannot overpaint the moving payload');
        const a = [+line.getAttribute('x1'), +line.getAttribute('y1')], b = [+line.getAttribute('x2'), +line.getAttribute('y2')];
        for (const t of [.01, .2, .5, .8, .99]) {
          const sample = a.map((value, i) => value + (b[i] - value) * t);
          assert(active.every(([a, b]) => distance(sample, a, b) > 1.7), 'Gray strokes must clear the orange stroke, including their own width');
          assert(!inside(sample, head), 'Gray strokes cannot overpaint arrowheads');
        }
      }
      const cutouts = (world.querySelector('mask path').getAttribute('d').match(/M[^M]+/g) || []).map(points);
      // Ignore facet/antialias boundaries; center visibility must agree away from them.
      if (cutouts.every(polygon => polygon.every((a, i) => distance(center, a, polygon[(i + 1) % polygon.length]) > .2))) {
        const hidden = cutouts.some(polygon => inside(center, polygon));
        assert.equal(hidden, occluded(position, angle), `Payload depth: phase ${phase + 1}, progress ${progress}, angle ${angle}`);
        if (hidden) hiddenPackets++; else visiblePackets++;
      }
      assert(geometry.document.getElementById('status').textContent.startsWith(`${phase + 1}/12`)); views++;
    }
  }
}
assert(hiddenPackets > 0 && visiblePackets > 0);
assert.deepEqual(geometry.errors, []); geometry.dom.window.close();
const cycle = open(); cycle.tick(); cycle.resetCounts();
const visited = new Set();
for (let frame = 0; frame < 2341; frame++) {
  cycle.tick(); visited.add(cycle.document.getElementById('status').textContent.split('/')[0]);
}
assert.equal(visited.size, 12, 'Autoplay still visits every execution phase');
assert.equal(cycle.counts.replacements, 12, 'A complete playback cycle rebuilds only at phase boundaries');
assert(cycle.document.getElementById('status').textContent.startsWith('1/12'), 'Autoplay wraps to the first phase');
assert.deepEqual(cycle.errors, []); cycle.dom.window.close();
const reduced = open(true);
assert.equal(reduced.frames.size, 0);
reduced.document.getElementById('pause').click(); reduced.tick(); reduced.tick();
assert(reduced.frames.size > 0, 'Explicit Play works with reduced motion');
assert.deepEqual(reduced.errors, []); reduced.dom.window.close();
console.log(`PASS: retained playback, bounded payload updates, coalesced full orbit, idle/offscreen/hidden scheduling, reduced motion, independent scaled scene; route/arrow/payload geometry in ${views} views (${hiddenPackets} hidden / ${visiblePackets} visible payloads)`);
