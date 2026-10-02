// Optional DOM/state/geometry regression check; does not render browser pixels.
// npm install --prefix /tmp/mvcc-isolation-tests jsdom
// NODE_PATH=/tmp/mvcc-isolation-tests/node_modules node tests/dom/mvcc-isolation.cjs
const {JSDOM, VirtualConsole} = require('jsdom');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const source = fs.readFileSync(path.resolve(__dirname, '../../skills/style-technical-visuals/references/standalone/mvcc-transaction-isolation.html'), 'utf8');

function open({compact = false, reduced = false} = {}) {
  const tasks = new Map(), media = new Map(), observers = [], errors = [];
  const counts = {created: 0, sceneReplaced: 0, nativeStarts: 0, frames: 0};
  let nextId = 1, hidden = false;
  const console = new VirtualConsole();
  console.on('jsdomError', error => errors.push(error));
  const dom = new JSDOM(source, {
    runScripts: 'dangerously', virtualConsole: console,
    beforeParse(w) {
      w.matchMedia = query => {
        const listeners = [];
        const item = {matches: query.includes('reduced-motion') ? reduced : compact,
          addEventListener(type, callback) {assert.equal(type, 'change'); listeners.push(callback);},
          change(value) {item.matches = value; listeners.forEach(callback => callback(item));}};
        media.set(query, item); return item;
      };
      w.setTimeout = (callback, delay) => {const id = nextId++; tasks.set(id, {callback, delay}); return id;};
      w.clearTimeout = id => tasks.delete(id);
      w.requestAnimationFrame = () => {counts.frames++; throw new Error('No frame loop is needed for this native SVG demo');};
      w.IntersectionObserver = class {
        constructor(callback) {this.callback = callback; observers.push(this);}
        observe(target) {this.target = target;}
      };
      Object.defineProperty(w.document, 'hidden', {get: () => hidden});
      w.SVGElement.prototype.beginElement = function() {counts.nativeStarts++; this.dataset.started = 'true';};
      w.SVGElement.prototype.pauseAnimations = function() {this.dataset.animationState = 'paused';};
      w.SVGElement.prototype.unpauseAnimations = function() {this.dataset.animationState = 'running';};
      const create = w.Document.prototype.createElementNS;
      w.Document.prototype.createElementNS = function(...args) {counts.created++; return create.apply(this, args);};
      const replace = w.Element.prototype.replaceChildren;
      w.Element.prototype.replaceChildren = function(...args) {if (this.id === 'drawing') counts.sceneReplaced++; return replace.apply(this, args);};
    }
  });
  const document = dom.window.document, svg = document.getElementById('scene');
  const app = {
    dom, document, svg, tasks, counts, errors,
    get: id => document.getElementById(id),
    version: id => document.querySelector('[data-version="' + id + '"]'),
    view: id => document.querySelector('[data-node="view-' + id + '"]'),
    click: id => document.getElementById(id).click(),
    mode(value) {const select = app.get('mode'); select.value = value; select.dispatchEvent(new dom.window.Event('change'));},
    scenario(value) {document.querySelector('[data-scenario="' + value + '"]').click();},
    advance() {assert.equal(tasks.size, 1); const [id, task] = tasks.entries().next().value; tasks.delete(id); task.callback(); return task.delay;},
    step() {app.click('step');},
    to(phase) {while (Number(svg.dataset.phase) < phase) app.step(); while (Number(svg.dataset.phase) > phase) app.click('back');},
    visible(value) {observers.forEach(observer => observer.callback([{target: observer.target, isIntersecting: value}]));},
    hidden(value) {hidden = value; document.dispatchEvent(new dom.window.Event('visibilitychange'));},
    media(query, value) {media.get(query).change(value);},
    close() {assert.deepEqual(errors, []); assert.equal(counts.frames, 0); dom.window.close();}
  };
  return app;
}

function box(node) {return ['x', 'y', 'w', 'h'].map(key => Number(node.dataset[key]));}
function points(route) {
  const tokens = route.match(/[MHV]|-?\d+(?:\.\d+)?/g), result = [];
  let i = 0, x = 0, y = 0;
  while (i < tokens.length) {
    const command = tokens[i++];
    if (command === 'M') {x = Number(tokens[i++]); y = Number(tokens[i++]);}
    else if (command === 'H') x = Number(tokens[i++]);
    else {assert.equal(command, 'V'); y = Number(tokens[i++]);}
    result.push([x, y]);
  }
  return result;
}
let geometrySamples = 0;
function geometry(app, compact) {
  geometrySamples++;
  const {document, svg} = app;
  const [vx, vy, vw, vh] = svg.getAttribute('viewBox').split(' ').map(Number);
  const nodes = [...document.querySelectorAll('[data-node]')];
  for (const node of nodes) {
    const [x, y, w, h] = box(node);
    assert([x, y, w, h].every(Number.isFinite));
    assert(x >= vx && y >= vy && x + w <= vx + vw && y + h <= vy + vh, node.dataset.node + ' fits the stage');
    for (const text of node.querySelectorAll('text')) {
      // Conservative monospace width estimate, not a browser font/layout measurement.
      const font = Number(text.getAttribute('font-size')) || (text.classList.contains('value') ? 19 : compact ? 18 : 14);
      const tx = Number(text.getAttribute('x')), ty = Number(text.getAttribute('y'));
      assert(tx >= x && tx + text.textContent.length * font * .61 < x + w - 8, text.textContent + ' fits its card width');
      assert(ty - font >= y && ty < y + h, text.textContent + ' fits its card height');
    }
  }
  const activityOwner = document.querySelector('[data-route]')?.getAttribute('marker-end').match(/arrow-([AB])/)[1];
  for (const wire of document.querySelectorAll('[data-route]')) {
    const route = points(wire.getAttribute('d'));
    const source = app.view(activityOwner), target = app.version(wire.dataset.route);
    const [sx, sy, sw, sh] = box(source), [tx, ty, , th] = box(target);
    assert.deepEqual(route[0], [sx + sw / 2, sy + sh], 'Starts on the source bottom port');
    assert.deepEqual(route.at(-1), [tx, ty + th / 2], 'Ends on the target left port');
    assert.equal(route[0][0], route[1][0], 'Stem leaves the source perpendicularly');
    assert.equal(route.at(-1)[1], route.at(-2)[1], 'Arrow enters the target perpendicularly');
    assert.deepEqual(wire.dataset.start.split(',').map(Number), route[0]);
    assert.deepEqual(wire.dataset.end.split(',').map(Number), route.at(-1));
    for (let i = 1; i < route.length; i++) {
      const a = route[i - 1], b = route[i];
      assert(a[0] === b[0] || a[1] === b[1], 'Routes remain orthogonal');
      for (const node of nodes) {
        const [x, y, w, h] = box(node);
        const enters = a[0] === b[0]
          ? a[0] > x && a[0] < x + w && Math.max(a[1], b[1]) > y && Math.min(a[1], b[1]) < y + h
          : a[1] > y && a[1] < y + h && Math.max(a[0], b[0]) > x && Math.min(a[0], b[0]) < x + w;
        assert(!enters, wire.dataset.route + ' does not intersect ' + node.dataset.node);
      }
    }
    const marker = document.querySelector('#arrow-' + activityOwner);
    assert.equal(marker.getAttribute('refX'), '8'); assert.equal(marker.getAttribute('refY'), '0');
    assert.equal(marker.getAttribute('orient'), 'auto'); assert(marker.querySelector('path').getAttribute('d').includes('L8 0'));
    const motion = document.querySelector('[data-packet="' + wire.dataset.route + '"] animateMotion');
    if (motion) {
      assert.equal(motion.getAttribute('path'), wire.getAttribute('d'), 'Payload follows the exact wire');
      assert.equal(motion.getAttribute('begin'), 'indefinite'); assert.equal(motion.dataset.started, 'true');
    }
  }
}
function version(app, id, expected) {
  for (const [key, value] of Object.entries(expected)) assert.equal(app.version(id).dataset[key], String(value), id + '.' + key);
}
function phase(app, number, compact) {app.to(number); geometry(app, compact);}

// The actual UI drives all six schedules; no simulation internals are exported.
for (const compact of [false, true]) for (const mode of ['rc', 'rr', 'serial']) {
  const app = open({compact});
  app.click('play'); app.mode(mode);
  geometry(app, compact);
  const retained = app.version('account-original');
  phase(app, 1, compact); assert.equal(app.view('A').dataset.snapshot, 'none');
  phase(app, 2, compact); assert.equal(app.view('A').dataset.result, '100'); assert.equal(app.view('A').dataset.snapshot, '0');
  phase(app, 3, compact);
  version(app, 'account-original', {visibleA: true, visibleB: false});
  version(app, 'account-new', {status: 'pending', visibleA: false, visibleB: true, commit: 'none', value: 80});
  assert.equal(app.get('metric').textContent, '100', 'A pending write does not change committed state');
  phase(app, 4, compact); assert.equal(app.view('A').dataset.result, '100', 'No dirty reads at any level');
  phase(app, 5, compact); version(app, 'account-new', {status: 'committed', commit: 1, visibleA: false, visibleB: false});
  assert.equal(app.svg.dataset.commitOrder, '1'); assert.equal(app.get('metric').textContent, '80');
  phase(app, 6, compact);
  assert.equal(app.view('A').dataset.result, mode === 'rc' ? '80' : '100');
  assert.equal(app.view('A').dataset.snapshot, mode === 'rc' ? '1' : '0');
  version(app, 'account-original', {visibleA: mode !== 'rc'});
  version(app, 'account-new', {visibleA: mode === 'rc'});
  phase(app, 7, compact); assert.equal(app.get('a-state').dataset.state, 'committed');
  version(app, 'account-original', {visibleA: false, visibleB: false});
  version(app, 'account-new', {visibleA: false, visibleB: false});
  assert.equal(app.get('a-result').textContent, 'Last SELECT: ' + (mode === 'rc' ? 80 : 100));
  assert.equal(app.version('account-original'), retained, 'Discrete playback retains row-card elements');
  assert.equal(app.counts.sceneReplaced, 1);

  app.scenario('skew'); geometry(app, compact);
  phase(app, 1, compact); assert.equal(app.view('A').dataset.snapshot, 'none'); assert.equal(app.view('B').dataset.snapshot, 'none');
  phase(app, 2, compact); assert.equal(app.view('A').dataset.result, '2');
  phase(app, 3, compact); assert.equal(app.view('B').dataset.result, '2');
  phase(app, 4, compact);
  version(app, 'alice-new', {status: 'pending', visibleA: true, visibleB: false});
  version(app, 'alice-original', {visibleA: false, visibleB: true});
  phase(app, 5, compact);
  version(app, 'bob-new', {status: 'pending', visibleA: false, visibleB: true});
  version(app, 'bob-original', {visibleA: true, visibleB: false});
  assert.equal(app.get('metric').textContent, '2');
  assert.deepEqual(app.svg.dataset.dependencies.split(',').sort(), ['A>B:bob', 'B>A:alice']);
  phase(app, 6, compact); assert.equal(app.get('metric').textContent, '1');
  version(app, 'alice-new', {status: 'committed', commit: 1});
  version(app, 'bob-new', {status: 'pending', commit: 'none', visibleB: true});
  phase(app, 7, compact);
  assert.equal(app.get('metric').textContent, mode === 'serial' ? '1' : '0');
  assert.equal(app.get('outcome').dataset.tone, mode === 'serial' ? 'good' : 'bad');
  assert.equal(app.get('b-state').dataset.state, mode === 'serial' ? 'aborted' : 'committed');
  version(app, 'bob-new', {status: mode === 'serial' ? 'aborted' : 'committed', commit: mode === 'serial' ? 'none' : 2});
  assert.equal(app.svg.dataset.commitOrder, mode === 'serial' ? '1' : '2');
  if (mode === 'serial') {
    assert(app.get('b-query').textContent.includes('40001'));
    phase(app, 8, compact); assert.equal(app.get('b-state').dataset.state, 'active');
    assert.equal(app.view('B').dataset.snapshot, '1'); assert.equal(app.view('B').dataset.result, '1');
    assert.equal(app.svg.dataset.dependencies, '', 'Retry discards prior transaction dependencies');
    version(app, 'bob-original', {visibleB: true}); version(app, 'bob-new', {visibleB: false});
    assert.equal(app.get('b-own').textContent, 'Own pending write: —');
    phase(app, 9, compact); assert.equal(app.get('b-state').dataset.state, 'committed');
    assert.equal(app.get('metric').textContent, '1'); assert.equal(app.svg.dataset.commitOrder, '1', 'Read-only retry publishes no row');
  }
  app.close();
}

// Controls, accessibility, exact native-animation paths, and idle/offscreen work.
const app = open();
assert.equal(app.tasks.size, 1); assert.equal(app.get('play').textContent, 'Pause demo');
const ids = [...app.document.querySelectorAll('[id]')].map(node => node.id);
assert.equal(new Set(ids).size, ids.length);
assert.equal(app.document.querySelectorAll('script[src],link[rel="stylesheet"],img[src],iframe').length, 0, 'No external runtime assets');
assert.equal(app.document.querySelectorAll('footer a[href^="https://www.postgresql.org/docs/18/"]').length, 2);
const unavailable = app.version('account-new');
assert.equal(unavailable.getAttribute('aria-disabled'), 'true'); assert.equal(unavailable.getAttribute('tabindex'), '-1');
unavailable.dispatchEvent(new app.dom.window.MouseEvent('click', {bubbles: true}));
assert.equal(unavailable.getAttribute('aria-pressed'), 'false', 'A version that does not exist cannot be inspected');
for (let i = 0; i < 7; i++) {assert.equal(app.advance(), 2600); geometry(app, false);}
assert.equal(app.svg.dataset.phase, '7'); assert.equal(app.advance(), 5200); assert.equal(app.svg.dataset.phase, '0');
app.advance(); app.advance(); geometry(app, false);
assert.equal(app.document.querySelectorAll('animateMotion').length, 1); assert(app.counts.nativeStarts > 0);
const card = app.version('account-original');
card.dispatchEvent(new app.dom.window.KeyboardEvent('keydown', {key: 'Enter', bubbles: true, cancelable: true}));
assert.equal(card.getAttribute('aria-pressed'), 'true'); assert(app.get('version-detail').textContent.includes('balance = 100'));
assert.equal(app.tasks.size, 1, 'Version inspection preserves autoplay');
const pausedPhase = app.svg.dataset.phase, created = app.counts.created, replaced = app.counts.sceneReplaced;
app.hidden(true); assert.equal(app.tasks.size, 0); assert.equal(app.svg.dataset.animationState, 'paused');
assert.equal(app.svg.dataset.phase, pausedPhase); assert.equal(app.counts.created, created); assert.equal(app.counts.sceneReplaced, replaced);
app.visible(false); app.hidden(false); assert.equal(app.tasks.size, 0);
app.visible(true); assert.equal(app.tasks.size, 1); assert.equal(app.svg.dataset.phase, pausedPhase);
app.click('back'); assert.equal(app.tasks.size, 0); assert.equal(app.get('play').textContent, 'Play demo');
assert.equal(app.view('A').dataset.snapshot, 'none', 'Previous restores the earlier transaction state');
app.click('reset'); assert.equal(app.svg.dataset.phase, '0'); assert.equal(app.tasks.size, 0);
app.mode('rc'); assert.equal(app.svg.dataset.phase, '0'); assert.equal(app.tasks.size, 0);
assert.equal(app.document.querySelector('tr[data-mode="rc"]').dataset.current, 'true');
app.scenario('skew'); assert.equal(app.tasks.size, 0);
app.to(5); const beforeResize = {...app.svg.dataset};
app.media('(max-width: 760px)', true); assert.deepEqual({...app.svg.dataset}, beforeResize); geometry(app, true);
app.click('play'); assert.equal(app.tasks.size, 1);
app.media('(prefers-reduced-motion: reduce)', true);
assert.equal(app.tasks.size, 0); assert.equal(app.get('play').textContent, 'Play demo');
assert.equal(app.document.querySelectorAll('animateMotion').length, 0);
app.close();

const quiet = open({reduced: true});
assert.equal(quiet.tasks.size, 0); assert.equal(quiet.get('play').textContent, 'Play demo');
quiet.step(); quiet.step(); assert.equal(quiet.document.querySelectorAll('animateMotion').length, 0);
quiet.click('play'); quiet.advance(); assert.equal(quiet.document.querySelectorAll('animateMotion').length, 0);
assert.equal(quiet.counts.nativeStarts, 0, 'Reduced motion still permits discrete playback without moving packets');
quiet.close();
console.log(JSON.stringify({schedules: 12, geometrySamples, assertions: 'MVCC visibility, write skew, retry, controls, lifecycle, retained SVG and route geometry passed'}));
