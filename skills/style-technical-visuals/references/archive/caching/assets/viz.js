window.VIZ = window.VIZ || {};
window.VIZ.postgres = false;
window.VIZ.handlers = [];
window.VIZ.channel = ('BroadcastChannel' in window) ? new BroadcastChannel('viz-stats') : null;
window.VIZ.onPostgresChange = function (fn) { window.VIZ.handlers.push(fn); };
window.VIZ.setPostgres = function (value) { window.VIZ.postgres = value; window.VIZ.handlers.forEach(function (fn) { fn(value); }); };
/* Shared clean-room visualization engines for the caching reference.
 * Each fragment page sets data-id on its root element, loads this file,
 * and constructs one engine from window.VIZ. */
(function () {
  'use strict';

  var PALETTE = ['#E06666', '#6FA8DC', '#7CCC9C', '#E6C74C', '#B694E8',
    '#E87F5A', '#5CC6B6', '#DB9B9B', '#919392', '#8BB675', '#7298A8', '#B16A76'];

  function pick(list) { return list[Math.floor(Math.random() * list.length)]; }

  function shuffle(list) {
    for (var i = list.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = list[i]; list[i] = list[j]; list[j] = t;
    }
    return list;
  }

  function cssVar(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }

  function reduceMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function sleep(ms) {
    var wait = reduceMotion() ? Math.min(ms, 140) : ms;
    return new Promise(function (resolve) { setTimeout(resolve, wait); });
  }

  function animate(node, frames, options) {
    var keyframes = reduceMotion()
      ? frames.map(function (frame, index) {
          return { opacity: frame.opacity === undefined ? (index ? 1 : 0.45) : frame.opacity };
        })
      : frames;
    var settings = Object.assign({ fill: 'forwards', easing: 'cubic-bezier(.77,0,.175,1)' }, options);
    settings.duration = reduceMotion() ? Math.min(options.duration || 200, 140) : options.duration;
    return node.animate(keyframes, settings);
  }

  function centerOf(node, frame) {
    var a = node.getBoundingClientRect();
    var b = frame.getBoundingClientRect();
    return { x: a.left - b.left + a.width / 2, y: a.top - b.top + a.height / 2 };
  }

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function gridStyle(grid, rows, cols) {
    grid.style.cssText = 'display:grid;gap:16px;padding:16px;background:var(--component-background);' +
      'grid-template-rows:repeat(' + rows + ',var(--cell,40px));' +
      'grid-template-columns:repeat(' + cols + ',var(--cell,40px));';
  }

  /* Paint one data cell. Postgres mode renders a colored disc instead of a square. */
  function paintCell(cell, color, postgres, label) {
    cell.innerHTML = '';
    cell.style.border = 'none';
    cell.style.display = 'grid';
    cell.style.placeItems = 'center';
    cell.style.fontWeight = '700';
    cell.style.color = '#fff';
    if (!color) {
      cell.style.background = 'transparent';
      cell.style.border = '1px solid var(--component-border)';
      return;
    }
    if (postgres) {
      var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('viewBox', '0 0 40 40');
      svg.style.width = '88%';
      svg.style.height = '88%';
      svg.innerHTML = '<circle cx="20" cy="20" r="18" fill="' + color + '"/>' +
        (label ? '<text x="20" y="25" text-anchor="middle" font-size="11" font-weight="700" fill="#fff">' + label + '</text>' : '');
      cell.appendChild(svg);
    } else {
      cell.style.background = color;
      if (label) cell.textContent = label;
    }
  }

  /* Animated marker that visits each target in order, then removes itself. */
  function travel(frame, targets, color, size, segment, shape) {
    size = size || 18;
    segment = segment || 800;
    shape = shape || 'circle';
    var marker = document.createElement('i');
    marker.className = 'request-circle';
    marker.style.width = size + 'px';
    marker.style.height = size + 'px';
    marker.style.borderRadius = shape === 'circle' ? '50%' : '0';
    marker.style.left = '0';
    marker.style.top = '0';
    marker.style.background = color;
    frame.appendChild(marker);
    var points = targets.map(function (target) { return centerOf(target, frame); });
    var keyframes = points.map(function (point, index) {
      return {
        offset: index / (points.length - 1),
        opacity: index === 0 || index === points.length - 1 ? 0 : 1,
        transform: 'translate3d(' + (point.x - size / 2) + 'px,' + (point.y - size / 2) + 'px,0)'
      };
    });
    return animate(marker, keyframes, { duration: 300 + segment * (points.length - 1) })
      .finished.catch(function () {})
      .then(function () { marker.remove(); });
  }

  function flash(frame, target, word) {
    target.animate([
      { transform: 'scale(1)' }, { transform: 'scale(.82)' }, { transform: 'scale(1)' }
    ], { duration: reduceMotion() ? 140 : 1000, easing: 'ease-in-out' });
    if (!word) return Promise.resolve();
    var point = centerOf(target, frame);
    var label = document.createElement('strong');
    label.textContent = word;
    label.style.cssText = 'position:absolute;z-index:31;font-weight:700;font-size:14px;pointer-events:none;' +
      'font-family:monospace;white-space:nowrap;color:' + (word === 'HIT' ? '#2e7d32' : '#d32f2f') + ';' +
      'left:' + (point.x + 14) + 'px;top:' + (point.y - 12) + 'px;';
    frame.appendChild(label);
    return animate(label, [
      { opacity: 0, transform: 'translate3d(0,0,0)' },
      { opacity: 1, transform: 'translate3d(0,0,0)', offset: 0.2 },
      { opacity: 0, transform: 'translate3d(48px,0,0)' }
    ], { duration: 1000 }).finished.catch(function () {}).then(function () { label.remove(); });
  }

  VIZ.core = { PALETTE: PALETTE, pick: pick, shuffle: shuffle, css: cssVar,
    animate: animate, sleep: sleep, centerOf: centerOf, paintCell: paintCell,
    travel: travel, flash: flash, gridStyle: gridStyle, reduceMotion: reduceMotion };
})();

/* ============ CacheViz: requester -> cache layer(s) -> database ============ */
(function () {
  'use strict';
  var core = VIZ.core;

  class CacheViz {
    constructor(options) {
      this.config = Object.assign({
        rows: 5, cols: 3,
        layers: [{ rows: 3, cols: 1, label: 'Cache' }],
        requester: 'Requester', database: 'Database',
        mode: 'random', automation: 'manual', interval: 2000,
        prewarm: true, numbered: false, recency: false
      }, options);
      var config = this.config;
      this.root = document.querySelector('[data-id]');
      var count = config.rows * config.cols;
      this.numbers = core.shuffle(Array.from({ length: count }, function (_, i) { return i + 1; }));
      this.recency = Array.from({ length: count }, function (_, i) { return i / (count - 1); });
      core.shuffle(this.recency);
      this.data = [];
      for (var i = 0; i < count; i++) {
        this.data.push(config.mode === 'recency'
          ? 'rgb(' + Math.round(this.recency[i] * 255) + ',0,' + Math.round((1 - this.recency[i]) * 255) + ')'
          : core.PALETTE[i % core.PALETTE.length]);
      }
      var slots = core.shuffle(Array.from({ length: count }, function (_, i) { return i; }));
      this.caches = config.layers.map(function (layer, layerIndex) {
        var cells = Array(layer.rows * layer.cols).fill(null);
        if (config.prewarm !== false) {
          for (var slot = 0; slot < cells.length && layerIndex === 0; slot++) {
            cells[slot] = this.data[slots[slot]];
          }
        }
        return cells;
      }, this);
      this.rr = this.caches.map(function () { return 0; });
      this.stats = { hits: 0, misses: 0 };
      this.busy = false;
      this.build();
      document.addEventListener('viz:postgres', function () { this.renderAll(); }.bind(this));
      if (config.automation !== 'manual') this.startAuto();
    }

    build() {
      var self = this;
      var config = this.config;
      this.frame = document.createElement('div');
      this.frame.style.cssText = 'position:relative;width:100%;padding:20px;box-sizing:border-box;';
      var inner = document.createElement('div');
      inner.style.cssText = 'display:flex;justify-content:space-between;align-items:flex-start;gap:20px;';
      this.frame.appendChild(inner);

      this.requester = document.createElement('div');
      this.requester.textContent = config.requester;
      this.requester.style.cssText = 'min-width:72px;min-height:160px;display:grid;place-items:center;padding:8px;' +
        'background:var(--component-background);font-weight:700;writing-mode:vertical-rl;transform:rotate(180deg);' +
        'cursor:pointer;user-select:none;';
      this.requester.addEventListener('click', function () { self.request(-1); });
      inner.appendChild(this.requester);

      this.panes = config.layers.map(function (layer) {
        var pane = document.createElement('div');
        pane.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:6px;';
        var grid = document.createElement('div');
        pane.appendChild(grid);
        var caption = document.createElement('div');
        caption.textContent = layer.label;
        caption.style.cssText = 'font-weight:700;font-size:19px;text-align:center;visibility:' +
          (layer.label ? 'visible' : 'hidden') + ';';
        pane.appendChild(caption);
        inner.appendChild(pane);
        pane.grid = grid;
        return pane;
      });

      this.dbPane = document.createElement('div');
      this.dbPane.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:6px;';
      this.dbGrid = document.createElement('div');
      this.dbPane.appendChild(this.dbGrid);
      var dbCaption = document.createElement('div');
      dbCaption.textContent = config.database;
      dbCaption.style.cssText = 'font-weight:700;font-size:19px;text-align:center;';
      this.dbPane.appendChild(dbCaption);
      inner.appendChild(this.dbPane);
      this.root.appendChild(this.frame);

      if (config.mode === 'recency') {
        var legend = document.createElement('div');
        legend.style.cssText = 'position:relative;height:24px;margin-top:14px;';
        legend.innerHTML = '<div style="width:100%;height:100%;background:linear-gradient(to right,#ff0000,#0000ff)"></div>' +
          '<span style="position:absolute;left:10px;top:50%;transform:translateY(-50%);color:#fff;font-weight:700;font-size:13px;text-shadow:1px 1px 1px rgba(0,0,0,.5)">NEWER</span>' +
          '<span style="position:absolute;right:10px;top:50%;transform:translateY(-50%);color:#fff;font-weight:700;font-size:13px;text-shadow:1px 1px 1px rgba(0,0,0,.5)">OLDER</span>';
        this.frame.appendChild(legend);
      }

      this.renderCaches();
      this.renderDb();
    }

    renderCaches() {
      var self = this;
      this.panes.forEach(function (pane, layer) {
        var config = self.config.layers[layer];
        core.gridStyle(pane.grid, config.rows, config.cols);
        pane.grid.innerHTML = '';
        self.caches[layer].forEach(function (color) {
          var cell = document.createElement('div');
          cell.style.cssText = 'width:var(--cell,40px);height:var(--cell,40px);cursor:pointer;';
          core.paintCell(cell, color, VIZ.postgres);
          cell.addEventListener('click', function () {
            var index = self.data.indexOf(color);
            if (index >= 0) self.request(index);
          });
          pane.grid.appendChild(cell);
        });
      });
    }

    renderDb() {
      var self = this;
      core.gridStyle(this.dbGrid, this.config.rows, this.config.cols);
      this.dbGrid.innerHTML = '';
      this.data.forEach(function (color, index) {
        var cell = document.createElement('div');
        cell.style.cssText = 'width:var(--cell,40px);height:var(--cell,40px);cursor:pointer;';
        core.paintCell(cell, color, VIZ.postgres, self.config.numbered ? String(self.numbers[index]) : undefined);
        cell.addEventListener('click', function () { self.request(index); });
        self.dbGrid.appendChild(cell);
      });
    }

    nextIndex() {
      if (this.config.mode === 'recency') {
        var weights = this.recency.map(function (t) { return Math.pow(t, 4); });
        var total = weights.reduce(function (a, b) { return a + b; }, 0);
        var threshold = Math.random() * total;
        for (var i = 0; i < weights.length; i++) {
          threshold -= weights[i];
          if (threshold <= 0) return i;
        }
        return weights.length - 1;
      }
      return Math.floor(Math.random() * this.data.length);
    }

    hitLayer(color) {
      for (var layer = 0; layer < this.caches.length; layer++) {
        if (this.caches[layer].indexOf(color) !== -1) return layer;
      }
      return -1;
    }

    fill(color) {
      for (var layer = this.caches.length - 1; layer >= 0; layer--) {
        var slots = this.caches[layer];
        var slot = slots.indexOf(null);
        if (slot === -1) {
          slot = this.rr[layer];
          this.rr[layer] = (this.rr[layer] + 1) % slots.length;
        }
        slots[slot] = color;
      }
    }

    startAuto() {
      var self = this;
      setInterval(function () {
        if (document.hidden || !self.root.isConnected || self.busy) return;
        if (self.config.automation === 'automatic-hit') {
          var cached = [];
          self.caches[0].forEach(function (color) { if (color) cached.push(color); });
          self.request(self.data.indexOf(cached.length ? core.pick(cached) : core.pick(self.data)));
        } else if (self.config.automation === 'automatic-miss') {
          var uncached = self.data.filter(function (color) { return self.hitLayer(color) === -1; });
          self.request(self.data.indexOf(uncached.length ? core.pick(uncached) : core.pick(self.data)));
        } else {
          self.request(-1);
        }
      }, this.config.interval);
    }

    async request(dbIndex) {
      if (this.busy) return;
      this.busy = true;
      try {
        var index = dbIndex >= 0 ? dbIndex : this.nextIndex();
        var color = this.data[index];
        var hitLayer = this.hitLayer(color);
        if (hitLayer >= 0) {
          // Circle travels to the exact cache slot holding the color, square comes straight back.
          var slot = this.caches[hitLayer].indexOf(color);
          var slotCell = this.panes[hitLayer].grid.children[slot];
          this.stats.hits++;
          await core.travel(this.frame, [this.requester, slotCell], color);
          await core.flash(this.frame, slotCell, 'HIT');
          await core.travel(this.frame, [slotCell, this.requester], color, 40, 800, 'square');
        } else {
          // Circle passes through each cache layer, then reaches the exact disk cell.
          this.stats.misses++;
          var dbCell = this.dbGrid.children[index];
          var through = [this.requester].concat(this.panes, [dbCell]);
          await core.travel(this.frame, through, color);
          await core.flash(this.frame, dbCell, 'MISS');
          for (var layer = this.caches.length - 1; layer >= 0; layer--) this.fill(color);
          this.renderCaches();
          // Square returns disk -> each cache slot it landed in -> requester.
          var back = [dbCell];
          for (var l = this.panes.length - 1; l >= 0; l--) {
            var slot = this.caches[l].indexOf(color);
            back.push(this.panes[l].grid.children[slot]);
          }
          back.push(this.requester);
          await core.sleep(250);
          await core.travel(this.frame, back, color, 40, 800, 'square');
        }
        document.dispatchEvent(new CustomEvent('viz:stats', {
          detail: { source: this.config.source, hits: this.stats.hits, misses: this.stats.misses }
        }));
        if (window.VIZ.channel) {
          window.VIZ.channel.postMessage({ source: this.config.source, hits: this.stats.hits, misses: this.stats.misses });
        }
      } finally { this.busy = false; }
    }
  }

  /* Spatial locality: numbered cells; a miss loads the cell plus its neighbors. */
  class SpatialViz extends CacheViz {
    constructor(config) {
      config.automation = 'manual';
      config.numbered = true;
      super(config);
      this.distance = config.distance || 1;
    }
    neighbors(index) {
      var self = this;
      var number = this.numbers[index];
      var found = [];
      for (var d = 1; d <= this.distance; d++) {
        [number - d, number + d].forEach(function (value) {
          var i = self.numbers.indexOf(value);
          if (i >= 0 && self.hitLayer(self.data[i]) === -1) found.push(i);
        });
      }
      return found;
    }
    async request(dbIndex) {
      if (this.busy) return;
      this.busy = true;
      try {
        var self = this;
        var color = this.data[dbIndex];
        var hitLayer = this.hitLayer(color);
        if (hitLayer >= 0) {
          var slot = this.caches[0].indexOf(color);
          var slotCell = this.panes[0].grid.children[slot];
          this.stats.hits++;
          await core.travel(this.frame, [this.requester, slotCell], color);
          await core.flash(this.frame, slotCell, 'HIT');
          await core.travel(this.frame, [slotCell, this.requester], color, 40, 800, 'square');
        } else {
          this.stats.misses++;
          var dbCell = this.dbGrid.children[dbIndex];
          await core.travel(this.frame, [this.requester, this.panes[0].pane, dbCell], color);
          await core.flash(this.frame, dbCell, 'MISS');
          var room = this.caches[0].indexOf(null);
          if (room >= 0) this.caches[0][room] = color;
          this.neighbors(dbIndex).forEach(function (index) {
            var slot = self.caches[0].indexOf(null);
            if (slot >= 0) self.caches[0][slot] = self.data[index];
          });
          this.renderCaches();
          var back = [dbCell, this.panes[0].grid.children[this.caches[0].indexOf(color)], this.requester];
          await core.sleep(250);
          await core.travel(this.frame, back, color, 40, 800, 'square');
        }
        document.dispatchEvent(new CustomEvent('viz:stats', {
          detail: { source: this.config.source, hits: this.stats.hits, misses: this.stats.misses }
        }));
        if (window.VIZ.channel) {
          window.VIZ.channel.postMessage({ source: this.config.source, hits: this.stats.hits, misses: this.stats.misses });
        }
      } finally { this.busy = false; }
    }
  }

  /* Replacement policies: fifo, lifo, lru, time-aware-lru. */
  class PolicyViz {
    constructor(config) {
      var self = this;
      this.config = config;
      this.size = config.size || 7;
      this.algorithm = config.algorithm || 'fifo';
      this.interval = config.interval || 2500;
      this.expiration = config.expiration || 15000;
      this.root = document.querySelector('[data-id]');
      this.slots = Array(this.size).fill(null);
      this.stats = { hits: 0, misses: 0 };
      this.busy = false;

      this.frame = document.createElement('div');
      this.frame.style.cssText = 'position:relative;width:100%;max-width:800px;margin:0 auto;min-height:240px;';
      this.cacheRow = document.createElement('div');
      this.cacheRow.style.cssText = 'position:absolute;left:50%;top:65px;transform:translateX(-50%);' +
        'display:flex;gap:12px;padding:10px;background:var(--component-background);';
      this.grid = document.createElement('div');
      this.grid.style.cssText = 'display:flex;gap:12px;';
      this.cacheRow.appendChild(this.grid);
      this.labels = document.createElement('div');
      this.labels.style.cssText = 'position:absolute;left:50%;top:145px;transform:translateX(-50%);display:flex;gap:12px;';
      for (var i = 0; i < this.size; i++) {
        var b = document.createElement('b');
        b.style.cssText = 'width:45px;text-align:center;font-family:monospace;';
        b.textContent = String(i + 1);
        this.labels.appendChild(b);
      }
      this.score = document.createElement('div');
      this.score.style.cssText = 'position:absolute;left:0;bottom:0;width:100%;text-align:center;font-weight:700;font-family:monospace;';
      this.frame.appendChild(this.cacheRow);
      this.frame.appendChild(this.labels);
      this.frame.appendChild(this.score);
      this.root.appendChild(this.frame);
      this.render();
      this.updateScore();
      setTimeout(function () { self.makeRequest(); }, 400);
      setInterval(function () {
        if (!document.hidden && self.root.isConnected && !self.busy) self.makeRequest();
      }, this.interval);
    }
    render() {
      var self = this;
      this.grid.innerHTML = '';
      this.slots.forEach(function (color) {
        var cell = document.createElement('div');
        cell.style.cssText = 'width:45px;height:45px;border:1px solid var(--component-border);position:relative;display:grid;place-items:center;';
        core.paintCell(cell, color, VIZ.postgres);
        self.grid.appendChild(cell);
      });
      this.renderTimers();
    }
    renderTimers() {
      var self = this;
      this.grid.querySelectorAll('.cache-timer').forEach(function (node) { node.remove(); });
      if (this.algorithm !== 'time-aware-lru') return;
      this.slots.forEach(function (color, index) {
        if (!color) return;
        var timer = document.createElement('div');
        timer.style.cssText = 'position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:30px;height:30px;pointer-events:none;z-index:5;';
        var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 30 30');
        svg.setAttribute('width', '30');
        svg.setAttribute('height', '30');
        svg.innerHTML = '<circle cx="15" cy="15" r="14" fill="white" opacity="0.9"/>' +
          '<circle cx="15" cy="15" r="13" fill="none" stroke="#333" stroke-width="2"/>' +
          '<line x1="15" y1="15" x2="15" y2="5" stroke="#333" stroke-width="2" stroke-linecap="round"/>';
        timer.appendChild(svg);
        self.grid.children[index].appendChild(timer);
        var hand = svg.querySelector('line');
        hand.style.transformOrigin = '15px 15px';
        var motion = hand.animate(
          [{ transform: 'rotate(0deg)' }, { transform: 'rotate(360deg)' }],
          { duration: self.expiration, iterations: 1, easing: 'linear' });
        motion.finished.then(function () { self.expire(color); }).catch(function () {});
      });
    }
    makeRequest() {
      var self = this;
      this.busy = true;
      var cached = this.slots.filter(Boolean);
      var isHit = cached.length > 0 && Math.random() < 0.5;
      var color = isHit ? core.pick(cached) : core.pick(core.PALETTE);
      var index = this.slots.indexOf(color);
      if (index !== -1) {
        this.stats.hits++;
        if (this.algorithm === 'lru' || this.algorithm === 'time-aware-lru') {
          this.slots.splice(index, 1);
          this.slots.unshift(color);
        }
      } else {
        this.stats.misses++;
        this.slots.pop();
        this.slots.unshift(color);
      }
      var marker = document.createElement('i');
      marker.className = 'request-circle';
      marker.style.cssText = 'position:absolute;left:50%;top:10px;width:30px;height:30px;border-radius:50%;background:' + color + ';';
      this.frame.appendChild(marker);
      marker.animate([
        { transform: 'translateY(0)', opacity: 1 },
        { transform: 'translateY(60px)', opacity: 1, offset: 0.5 },
        { transform: 'translateY(-150px)', opacity: 0 }
      ], { duration: core.reduceMotion() ? 140 : 1100, easing: 'ease-in-out' })
        .finished.catch(function () {}).then(function () {
          marker.remove();
          self.render();
          self.updateScore();
          self.busy = false;
        });
    }
    updateScore() {
      var total = this.stats.hits + this.stats.misses;
      var rate = total ? Math.round(this.stats.hits / total * 100) : 0;
      this.score.textContent = 'Hits: ' + this.stats.hits + ' | Misses: ' + this.stats.misses + ' | Hit rate: ' + rate + '%';
    }
  }

  VIZ.CacheViz = CacheViz;
  VIZ.SpatialViz = SpatialViz;
  VIZ.PolicyViz = PolicyViz;
})();

/* ============ Latency comparison, tweet card, simulator, stats, geo, title ============ */
(function () {
  'use strict';
  var core = VIZ.core;

  class LatencyViz {
    constructor() {
      this.root = document.querySelector('[data-id]');
      this.entities = [
        { name: 'L1', latency: '1ns', speed: 1.2 },
        { name: 'L2', latency: '4ns', speed: 2 },
        { name: 'L3', latency: '40ns', speed: 3 },
        { name: 'RAM', latency: '80ns', speed: 3.4 },
        { name: 'SSD', latency: '100μs', speed: 16 }];
      this.build();
      var self = this;
      var input = this.root.querySelector('input');
      var output = this.root.querySelector('output');
      input.addEventListener('input', function () {
        var value = Number(input.value);
        var multiplier = Math.max(1, Math.round(value / 5));
        output.value = multiplier + '× slower';
        self.entities.forEach(function (entity, index) {
          var ball = self.balls[index];
          entity.multiplier = multiplier;
          ball.style.animationDuration = (entity.speed / multiplier) + 's';
        });
      });
    }
    build() {
      var width = this.root.clientWidth || 700;
      var height = 300;
      var text = core.css('--text') || '#171717';
      var bg = getComputedStyle(document.documentElement).getPropertyValue('--component-background').trim() || '#d8d8d8';
      var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('viewBox', '0 0 ' + width + ' ' + height);
      svg.style.cssText = 'display:block;width:100%;height:auto;';
      var cpu = document.createElementNS('http://www.w3.org/2000/svg', 'rect');

      function set(node, attrs) { Object.keys(attrs || {}).forEach(function (k) { node.setAttribute(k, attrs[k]); }); }
      var cpuBox = { x: 0, y: 30, width: 150, height: height - 60 };
      set(svg, { viewBox: '0 0 ' + width + ' ' + height });
      var cpuRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      set(cpuRect, { x: 0, y: 30, width: 150, height: height - 60, fill: bg });
      svg.appendChild(cpuRect);
      var cpuText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      set(cpuText, { x: 75, y: height / 2, 'text-anchor': 'middle', 'dominant-baseline': 'middle',
        'font-size': '18', 'font-weight': 'bold', fill: text });
      cpuText.textContent = 'CPU';
      svg.appendChild(cpuText);
      this.balls = [];
      this.entities.forEach(function (entity, index) {
        var y = height / (this.entities.length + 1) * (index + 1);
        var x = 220 + (width - 320) / (this.entities.length - 1) * index;
        var tower = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        set(tower, { x: x, y: 30, width: 48, height: y + 25 - 30, fill: bg });
        svg.appendChild(tower);
        var name = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        set(name, { x: x + 24, y: y + 10, 'text-anchor': 'middle', 'font-size': '15', 'font-weight': 'bold', fill: text });
        name.textContent = entity.name;
        svg.appendChild(name);
        var tag = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        set(tag, { x: 172, y: y - 8, 'text-anchor': 'start', 'font-size': '16', fill: text });
        tag.textContent = entity.latency;
        svg.appendChild(tag);
        var ball = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        set(ball, { cx: 162, cy: y + 10, r: 12, fill: core.PALETTE[index] });
        ball.style.setProperty('--dist', (x - 12 - 162) + 'px');
        ball.style.animation = 'latency-ball ' + entity.speed + 's ease-in-out infinite alternate';
        svg.appendChild(ball);
        this.balls.push(ball);
      }, this);
      this.root.appendChild(svg);
      var row = document.createElement('div');
      row.style.cssText = 'display:flex;align-items:center;gap:14px;margin-top:14px;padding-right:10px;';
      var label = document.createElement('label');
      label.textContent = 'Time scale';
      var input = document.createElement('input');
      input.type = 'range'; input.min = '0'; input.max = '100'; input.value = '20';
      input.style.flex = '1'; input.className = 'latency-slider';
      var output = document.createElement('output');
      output.value = '1× slower';
      row.appendChild(label);
      row.appendChild(input);
      row.appendChild(output);
      this.root.appendChild(row);
      this.slider = input;
      this.output = output;
    }
  }

  /* Tweet card (clean-room: initials avatar, unicode icon glyphs). */
  class TweetCard {
    constructor(config) {
      var root = document.querySelector('[data-id]');
      var initials = config.name.split(' ').map(function (word) { return word[0]; }).join('');
      root.innerHTML =
        '<article class="tweet-card">' +
        '<div style="display:flex;align-items:center;gap:12px">' +
        '<div class="tweet-avatar">' + initials + '</div>' +
        '<div><strong>' + config.name + '</strong><div class="tweet-handle">@' + config.handle + '</div></div>' +
        '<strong style="margin-left:auto">𝕏</strong></div>' +
        '<p class="tweet-copy">' + config.text + '</p>' +
        '<p class="tweet-handle">Jan 24, 2023 · ↻ ' + config.retweets.toLocaleString() + ' · ♡ ' + config.likes.toLocaleString() + '</p>' +
        '</article>';
    }
  }

  /* Impression simulator: cumulative impressions curve. */
  class TweetSim {
    constructor(config) {
      var root = document.querySelector('[data-id]');
      this.total = 7000000;
      root.innerHTML =
        '<div style="text-align:center;margin-bottom:10px"><button class="sim-start control" type="button">Click to Start</button></div>' +
        '<div style="position:relative;height:250px;border:1px solid var(--border)">' +
        '<svg viewBox="0 0 700 220" preserveAspectRatio="none" style="width:100%;height:100%">' +
        '<polyline class="sim-line" points="0,210" fill="none" stroke="' + core.PALETTE[0] + '" stroke-width="3" vector-effect="non-scaling-stroke"></polyline></svg>' +
        '<div style="position:absolute;top:10px;right:12px;font-weight:700;color:' + core.PALETTE[0] + '">' +
        'Total impressions: <output>0</output></div></div>';
      var button = root.querySelector('.sim-start');
      var line = root.querySelector('.sim-line');
      var output = root.querySelector('output');
      button.addEventListener('click', function () {
        button.textContent = 'Restart';
        var start = performance.now();
        var duration = reduceMotion() ? 600 : 12000;
        function frame(now) {
          var progress = Math.min(1, (now - start) / duration);
          var steps = Math.max(2, Math.round(progress * 100));
          var points = [];
          for (var i = 0; i <= steps; i++) {
            var reach = Math.min(1, (i / 100) / Math.max(progress, 0.001));
            var impressions = 7000000 * (1 - Math.exp(-6.2 * reach));
            points.push([i / 100 * 700, 210 - impressions / 7000000 * 190].join(','));
          }
          line.setAttribute('points', points.join(' '));
          output.value = Math.round(7000000 * (1 - Math.exp(-6.2 * progress))).toLocaleString();
          if (progress < 1) requestAnimationFrame(frame);
        }
        requestAnimationFrame(frame);
      });
    }
  }

  /* Rolling hit-rate chart bound to a cache via viz:stats events. */
  class StatsChart {
    constructor(config) {
      var root = document.querySelector('[data-id]');
      this.source = config.source;
      this.samples = [];
      this.lastHits = 0;
      this.lastMisses = 0;
      this.canvas = document.createElement('canvas');
      this.canvas.style.width = '100%';
      this.canvas.height = config.height || 100;
      this.canvas.className = 'stats-canvas';
      var row = document.createElement('div');
      row.className = 'stats-row';
      row.style.cssText = 'display:flex;gap:10px;margin-top:10px;';
      this.outputs = {};
      var self = this;
      ['Hits', 'Misses', 'Hit rate'].forEach(function (name) {
        var box = document.createElement('div');
        box.style.cssText = 'flex:1;border:1px solid var(--line);padding:10px;font-weight:700;';
        var out = document.createElement('output');
        out.style.cssText = 'float:right;font-weight:700;color:' + core.PALETTE[0] + ';';
        box.appendChild(document.createTextNode(name + ' '));
        box.appendChild(out);
        row.appendChild(box);
        self.outputs[name] = out;
      });
      root.appendChild(this.canvas);
      root.appendChild(row);
      this.lastHits = 0; this.lastMisses = 0;
      document.addEventListener('viz:stats', function (event) {
        if (event.detail.source !== self.source) return;
        self.record(event.detail);
      });
      if (window.VIZ.channel) {
        window.VIZ.channel.addEventListener('message', function (event) {
          if (event.data && event.data.source === self.source) self.record(event.data);
        });
      }
      this.record({ hits: 0, misses: 0 });
    }
    record(stats) {
      if (stats.hits > this.lastHits || stats.misses > this.lastMisses) {
        var total = stats.hits + stats.misses;
        this.samples.push(total ? stats.hits / total * 100 : 0);
        if (this.samples.length > 22) this.samples.shift();
        this.lastHits = stats.hits;
        this.lastMisses = stats.misses;
      }
      this.outputs.Hits.value = String(stats.hits);
      this.outputs.Misses.value = String(stats.misses);
      var total = stats.hits + stats.misses;
      this.outputs['Hit rate'].value = (total ? stats.hits / total * 100 : 0).toFixed(1) + '%';
      this.draw();
    }
    draw() {
      var canvas = this.canvas;
      canvas.width = this.canvas.clientWidth || 500;
      canvas.height = 100;
      var ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (var i = 1; i <= 4; i++) {
        ctx.fillStyle = 'rgba(128,128,128,.25)';
        ctx.fillRect(0, canvas.height * (i * 25 / 100), canvas.width - 40, 1);
      }
      var width = canvas.width * 0.041;
      var bars = Math.min(this.samples.length, 22);
      for (var i = 0; i < bars; i++) {
        var value = this.samples[this.samples.length - bars + i];
        var x = canvas.width - 60 - (bars - 1 - i) * (width + 2);
        ctx.fillStyle = core.PALETTE[i % core.PALETTE.length];
        ctx.fillRect(x, canvas.height - value / 100 * canvas.height, width, canvas.height);
      }
    }
  }

  /* Geo map: requester moves between regional caches. */
  class GeoViz {
    constructor(config) {
      var self = this;
      this.rows = config.rows || 3;
      this.cols = config.cols || 5;
      this.distributed = config.distributed !== false;
      this.root = document.querySelector('[data-id]');
      this.locations = [
        { label: 'US East', x: .2 }, { label: 'US Central', x: .5 }, { label: 'US West', x: .8 }];
      this.caches = [Array(4).fill(null), Array(4).fill(null), Array(4).fill(null)];
      this.region = 1;
      this.frame = document.createElement('div');
      this.frame.style.cssText = 'position:relative;width:100%;height:460px;';
      this.dbPane = document.createElement('div');
      this.dbPane.style.cssText = 'position:absolute;left:50%;top:18%;transform:translate(-50%,-50%);display:flex;flex-direction:column;align-items:center;';
      this.dbGrid = document.createElement('div');
      this.dbPane.appendChild(this.dbGrid);
      var dbCaption = document.createElement('div');
      dbCaption.textContent = 'Database';
      dbCaption.style.cssText = 'font-weight:700;font-size:19px;text-align:center;';
      this.dbPane.appendChild(dbCaption);
      this.frame.appendChild(this.dbPane);
      this.panes = this.locations.map(function (location) {
        var pane = document.createElement('div');
        pane.style.cssText = 'position:absolute;top:58%;transform:translate(-50%,-50%);display:flex;flex-direction:column;align-items:center;gap:4px;';
        var grid = document.createElement('div');
        pane.appendChild(grid);
        var caption = document.createElement('strong');
        caption.textContent = location.label;
        caption.style.cssText = 'font-size:12px;white-space:nowrap;';
        pane.appendChild(caption);
        self.frame.appendChild(pane);
        pane.grid = grid;
        pane.style.left = (location.x * 100) + '%';
        return pane;
      });
      this.requester = document.createElement('div');
      this.requester.textContent = 'Requester';
      this.requester.style.cssText = 'position:absolute;top:75%;transform:translate(-50%,-50%);padding:12px 20px;' +
        'background:var(--component-background);font-weight:700;transition:left .3s ease-in-out;';
      this.frame.appendChild(this.requester);
      this.requester.style.left = '50%';
      var controls = document.createElement('div');
      ['left', 'right'].forEach(function (direction) {
        var button = document.createElement('button');
        button.type = 'button';
        button.textContent = direction === 'left' ? '←' : '→';
        button.style.cssText = 'width:54px;height:48px;border:0;background:var(--component-background);font-size:28px;cursor:pointer;';
        button.addEventListener('click', function () { self.move(direction === 'left' ? -1 : 1); });
        controls.appendChild(button);
      });
      controls.style.cssText = 'position:absolute;left:50%;bottom:0;transform:translateX(-50%);display:flex;gap:30px;';
      this.frame.appendChild(controls);
      this.root.appendChild(this.frame);
      var count = this.rows * this.cols;
      this.data = [];
      for (var i = 0; i < count; i++) this.data.push(core.PALETTE[i % core.PALETTE.length]);
      core.shuffle(this.data);
      if (this.distributed) {
        this.caches = this.caches.map(function () {
          return core.shuffle(core.PALETTE.slice(0, 4)).slice();
        });
      } else {
        this.caches = this.caches.map(function () {
          var slots = Array(4).fill(null);
          slots[0] = core.pick(core.PALETTE);
          slots[1] = core.pick(core.PALETTE);
          return slots;
        });
      }
      this.render();
      setInterval(function () { self.makeRequest(); }, 4000);
    }
    render() {
      var self = this;
      core.gridStyle(this.dbGrid, this.rows, this.cols);
      this.dbGrid.innerHTML = '';
      this.data.forEach(function (color) {
        var cell = document.createElement('div');
        cell.style.cssText = 'width:30px;height:30px;';
        core.paintCell(cell, color, VIZ.postgres);
        self.dbGrid.appendChild(cell);
      });
      this.panes.forEach(function (pane, index) {
        core.gridStyle(pane.firstChild, 2, 2);
        pane.firstChild.innerHTML = '';
        self.caches[index].forEach(function (color) {
          var cell = document.createElement('div');
          cell.style.cssText = 'width:30px;height:30px;';
          core.paintCell(cell, color, VIZ.postgres);
          pane.firstChild.appendChild(cell);
        });
      });
    }
    move(direction) {
      this.region = Math.max(0, Math.min(2, this.region + direction));
      this.requester.style.left = (this.locations[this.region].x * 100) + '%';
    }
    makeRequest() {
      var self = this;
      var color = core.pick(this.data);
      var cache = this.caches[this.region];
      var slot = cache.indexOf(color);
      var isHit = slot !== -1;
      if (isHit) {
        core.travel(this.frame, [this.requester, this.panes[this.region], this.requester], color);
      } else {
        core.travel(this.frame, [this.requester, this.panes[this.region], this.dbPane], color);
        var free = cache.indexOf(null);
        if (free >= 0) cache[free] = color;
        else cache[0] = color;
        this.render();
      }

    }
  }

  /* Pixel title: staggered letters, random neighbor swaps. */
  class PixelTitle {
    constructor() {
      var patterns = [
        [[1, 1, 1, 1], [1, 0, 0, 0], [1, 0, 0, 0], [1, 0, 0, 0], [1, 1, 1, 1]],
        [[0, 1, 1, 0], [1, 0, 0, 1], [1, 1, 1, 1], [1, 0, 0, 1], [1, 0, 0, 1]],
        [[1, 1, 1, 1], [1, 0, 0, 0], [1, 0, 0, 0], [1, 0, 0, 0], [1, 1, 1, 1]],
        [[1, 0, 0, 1], [1, 0, 0, 1], [1, 1, 1, 1], [1, 0, 0, 1], [1, 0, 0, 1]],
        [[1, 1, 1, 1], [0, 1, 1, 0], [0, 1, 1, 0], [0, 1, 1, 0], [1, 1, 1, 1]],
        [[1, 0, 0, 1], [1, 1, 0, 1], [1, 0, 1, 1], [1, 0, 0, 1], [1, 0, 0, 1]],
        [[1, 1, 1, 1], [1, 0, 0, 0], [1, 0, 1, 1], [1, 0, 0, 1], [1, 1, 1, 1]]];
      this.root = document.querySelector('[data-id]');
      this.filled = [];
      var total = 7 * 4 + 6;
      var self = this;
      this.root.style.cssText = 'display:grid;gap:5px;max-width:760px;margin:24px auto;' +
        'grid-template-columns:repeat(35,1fr);';
      for (var row = 0; row < 5; row++) {
        var filledInLetter = self.filled.length;
        patterns.forEach(function (letter, letterIndex) {
          for (var col = 0; col < 4; col++) {
            var cell = document.createElement('div');
            cell.style.aspectRatio = '1';
            if (letter[row][col]) {
              cell.style.background = core.pick(core.PALETTE);
              cell.style.transform = 'scale(0)';
              cell.style.transition = 'transform .2s ease-out';
              self.filled.push(cell);
              setTimeout(function (node) { return function () { node.style.transform = 'scale(1)'; }; }(cell),
                letterIndex * 300 + (self.filled.length - filledInLetter) * 40);
            }
            self.root.appendChild(cell);
          }
          var gap = document.createElement('div');
          gap.style.aspectRatio = '1';
          self.root.appendChild(gap);
        });
      }
      setTimeout(function () { self.startSwap(); }, 3500);
    }
    startSwap() {
      var self = this;
      setInterval(function () {
        if (self.filled.length < 2) return;
        var first = core.pick(self.filled);
        var box = first.getBoundingClientRect();
        var neighbors = self.filled.filter(function (cell) {
          var other = cell.getBoundingClientRect();
          return cell !== first && Math.hypot(cell.getBoundingClientRect().left - box.left,
            cell.getBoundingClientRect().top - box.top) < box.width * 1.8;
        });
        if (!neighbors.length) return;
        var second = core.pick(neighbors);
        var secondBox = second.getBoundingClientRect();
        var dx = secondBox.left - box.left;
        var dy = secondBox.top - box.top;
        core.animate(first, [
          { transform: 'translate3d(0,0,0)' },
          { transform: 'translate3d(' + dx + 'px,' + dy + 'px,0)' },
          { transform: 'translate3d(0,0,0)' }
        ], { duration: 1000 });
        core.animate(second, [
          { transform: 'translate3d(0,0,0)' },
          { transform: 'translate3d(' + (-dx) + 'px,' + (-dy) + 'px,0)' },
          { transform: 'translate3d(0,0,0)' }
        ], { duration: 1000 });
        var firstColor = first.style.background;
        first.style.background = second.style.background;
        second.style.background = firstColor;
      }, 2000);
    }
  }

  /* Postgres-mode toggle. */
  class PgToggle {
    constructor() {
      var root = document.querySelector('[data-id]');
      var row = document.createElement('div');
      row.style.cssText = 'display:flex;align-items:center;gap:12px;justify-content:center;padding:24px;';
      row.appendChild(document.createTextNode('Postgres Mode'));
      var track = document.createElement('button');
      track.type = 'button';
      track.setAttribute('aria-label', 'Toggle Postgres mode');
      track.style.cssText = 'width:50px;height:24px;border:0;border-radius:12px;position:relative;cursor:pointer;' +
        'background:#ccc;transition:background-color .3s ease;';
      var circle = document.createElement('div');
      circle.style.cssText = 'width:20px;height:20px;border-radius:50%;background:#fff;position:absolute;top:2px;left:2px;' +
        'transition:left .3s ease;box-shadow:0 2px 4px rgba(0,0,0,.2);';
      track.appendChild(circle);
      track.addEventListener('click', function () {
        var enabled = track.style.backgroundColor !== 'rgb(76, 175, 80)';
        VIZ.setPostgres(!VIZ.postgres);
        track.style.background = VIZ.postgres ? '#4CAF50' : '#ccc';
        circle.style.left = VIZ.postgres ? '28px' : '2px';
      });
      row.appendChild(track);
      root.appendChild(row);
    }
  }

  window.VIZ.LatencyViz = LatencyViz;
  window.VIZ.TweetCard = TweetCard;
  window.VIZ.TweetSim = TweetSim;
  window.VIZ.StatsChart = StatsChart;
  window.VIZ.GeoViz = GeoViz;
  window.VIZ.PixelTitle = PixelTitle;
  window.VIZ.PgToggle = PgToggle;
})();
