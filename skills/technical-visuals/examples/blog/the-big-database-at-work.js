(() => {
  "use strict";
  let theme =
    localStorage.getItem("visual-lab-theme") ||
    (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  if (!window.visualTokens[theme]) theme = "light";
  const color = (k) => window.visualTokens[theme][k];
  const text = (x, y, s, cls = "") =>
    `<text x="${x}" y="${y}" class="${cls}">${s}</text>`;
  const box = (x, y, w, h, label, role = "storage", sub = "") =>
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="${color(role + "Fill") || color(role)}" fill-opacity="${color(role + "Fill") ? 1 : 0.1}" stroke="${color(role)}" stroke-width="1.6"/>${text(x + w / 2, y + h / 2 - (sub ? 10 : 0), label, "label")}${sub ? text(x + w / 2, y + h / 2 + 15, sub, "small") : ""}`;
  const database = (x, y, w, h, label) =>
    `<path d="M${x} ${y + 7}V${y + h - 7}a${w / 2} 7 0 0 0 ${w} 0V${y + 7}" fill="${color("storageFill")}" stroke="${color("storage")}" stroke-width="1.6"/><ellipse cx="${x + w / 2}" cy="${y + 7}" rx="${w / 2}" ry="7" fill="${color("storageFill")}" stroke="${color("storage")}" stroke-width="1.6"/>${text(x + w / 2, y + h / 2 + 5, label, "label")}`;
  function hardwareIcon(kind, x, y, role, scale = 1) {
    const shapes =
      kind === "memory"
        ? '<rect x="-24" y="-13" width="48" height="26" rx="3"/><rect x="-17" y="-7" width="12" height="13" rx="1"/><rect x="5" y="-7" width="12" height="13" rx="1"/><path d="M-17 13v5m8-5v5m9-5v5m9-5v5m8-5v5"/>'
        : kind === "cpu"
          ? '<rect x="-16" y="-16" width="32" height="32" rx="3"/><rect x="-8" y="-8" width="16" height="16" rx="1"/><path d="M-9-22v6m9-6v6m9-6v6m-18 32v6m9-6v6m9-6v6M-22-9h6m-6 9h6m-6 9h6m32-18h6m-6 9h6m-6 9h6"/>'
          : '<rect x="-20" y="-15" width="40" height="30" rx="4"/><circle cx="-5" cy="0" r="9"/><circle cx="-5" cy="0" r="2"/><path d="M13 8L-3 1m-10 19h26"/>';
    return `<g data-hardware-icon="${kind}" transform="translate(${x} ${y}) scale(${scale})" fill="${color(role + "Fill")}" stroke="${color(role)}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${shapes}</g>`;
  }
  const path = (pts, role = "border", dash = false, arrows = false) =>
    `<path d="${pts.map((p, i) => (i ? "L" : "M") + p.join(" ")).join(" ")}" fill="none" stroke="${color(role)}" stroke-width="1.8" ${dash ? 'stroke-dasharray="6 5"' : ""} ${arrows ? `marker-end="url(#arrow-${role})"` : ""}/>`;
  const dot = (x, y, miss = false) =>
    `<circle cx="${x}" cy="${y}" r="${miss ? 7 : 4}" fill="${color(miss ? "focus" : "flow")}" stroke="${color("surface")}" stroke-width="1"/>`;
  function point(pts, p) {
    let lengths = pts
        .slice(1)
        .map((v, i) => Math.hypot(v[0] - pts[i][0], v[1] - pts[i][1])),
      d = Math.max(0, Math.min(1, p)) * lengths.reduce((a, b) => a + b, 0);
    for (let i = 0; i < lengths.length; i++) {
      if (d <= lengths[i]) {
        let f = lengths[i] ? d / lengths[i] : 0;
        return pts[i].map((v, j) => v + (pts[i + 1][j] - v) * f);
      }
      d -= lengths[i];
    }
    return pts.at(-1);
  }
  function regionLayout() {
    let s = path([[90,55],[410,55]], 'control', true);
    [90,250,410].forEach((x,i)=>{
      s += `<rect x="${x-70}" y="65" width="140" height="190" rx="10" fill="${color('raised')}" stroke="${color('subtle')}" stroke-dasharray="5 5"/>`;
      s += text(x,25,'Region '+String.fromCharCode(65+i),'label');
      s += path([[x,55],[x,110]],'control',true);
      for(const dx of [-35,35]) s += path([[x,160],[x,185],[x+dx,185],[x+dx,205]],'flow',false,true);
      s += database(x-40,110,80,50,'P');
      s += database(x-65,205,60,35,'R') + database(x+5,205,60,35,'R');
    });
    return {svg:s,width:500,height:280};
  }

  function capacityGeometry() {
    return { width:500, height:340,
      disk:{x:18,y:65,w:210,h:210}, ram:{x:272,y:65,w:210,h:210},
      map:{x:40,y:108,step:13,size:10,cols:13},
      bank:{x:299,y:108,step:16,size:13},
      route:[[228,170],[272,170]],
    };
  }
  function capacityLayout() {
    const g=capacityGeometry(),d=g.disk,r=g.ram;
    let s='';
    for(const [name,panel,role,icon] of [['disk',d,'storage','disk'],['ram',r,'flow','memory']]) {
      s += `<rect data-resource-panel="${name}" x="${panel.x}" y="${panel.y}" width="${panel.w}" height="${panel.h}" rx="10" fill="${color(role+'Fill')}" stroke="${color(role)}" stroke-width="2"/>`;
      s += `<g data-resource-icon="${name}">${hardwareIcon(icon,panel.x+105,30,role,.8)}</g>`;
    }
    s += text(123,90,'14.8 TiB','label') + text(377,90,'100 GiB','label');
    for(let i=0;i<152;i++) {
      const x=g.map.x+(i%13)*13,y=g.map.y+Math.floor(i/13)*13;
      s += `<rect data-disk-block="${i}" x="${x}" y="${y}" width="${10*(i===151?.552:1)}" height="10" rx="1" fill="${color(i===0?'focus':'storageFill')}" stroke="${color(i===0?'focus':'storage')}"/>`;
    }
    s += `<path data-transfer-route d="M228 170H272" fill="none" stroke="${color('flow')}" stroke-width="2"/>`;
    for(let i=0;i<100;i++) s += `<rect data-slot="${i}" x="${g.bank.x+(i%10)*16}" y="${g.bank.y+Math.floor(i/10)*16}" width="13" height="13" rx="2"/>`;
    s += text(123,306,'100 GiB / tile','small') + text(377,306,'1 GiB / slot','small');
    s += `<rect data-budget-packet width="10" height="10" x="-5" y="-5" rx="2" class="pulse"/>`;
    return {svg:s,width:500,height:340};
  }

  function hardwareLayout() {
    let s='';
    const rows=[
      {icon:'cpu',label:'CPU',value:'32 cores',role:'processing',share:.05,note:'5% busy'},
      {icon:'memory',label:'RAM',value:'238 GiB',role:'flow',share:100/238,note:'100 GiB pool'},
      {icon:'disk',label:'Disk',value:'≈75% used',role:'storage',share:.75,note:'≈6.1 TiB free'},
    ];
    rows.forEach((r,i)=>{
      const y=15+i*100;
      s += `<rect x="20" y="${y}" width="460" height="85" rx="8" fill="${color(r.role+'Fill')}" stroke="${color(r.role)}"/>`;
      s += hardwareIcon(r.icon,52,y+27,r.role,.6) + text(112,y+27,r.label,'label') + text(370,y+27,r.value,'label');
      s += text(108,y+63,r.note,'small');
      s += `<rect x="210" y="${y+56}" width="250" height="14" rx="3" fill="${color('surface')}" stroke="${color(r.role)}"/><rect data-capacity="${r.icon}" x="210" y="${y+56}" width="${250*r.share}" height="14" rx="3" fill="${color(r.role)}"/>`;
    });
    return {svg:s,width:500,height:320};
  }
  function queryFacts() {
    return [[140,'100 : 1','reads / write','flow'],[360,'0.48 ms','average query','processing']].map(([x,value,label,role])=>
      `<rect x="${x-100}" y="285" width="200" height="65" rx="8" fill="${color(role+'Fill')}" stroke="${color(role)}"/>`+text(x,305,value,'value')+text(x,334,label,'small')).join('');
  }
  function indexGeometry() {
    return {root:[250,25,90,35],branches:[130,370],routeY:100,rangeY:165,pageW:110,pageH:30,
      forkY:80,leafForkY:225,leafY:245,leafW:60,leafH:45,leaves:[60,130,200,300,370,440],width:500,height:370};
  }

  function indexRoute(leaf) {
    const g = indexGeometry(),
      branch = g.branches[leaf < 3 ? 0 : 1];
    return [
      [g.root[0], g.root[1] + g.root[3]],
      [g.root[0], g.forkY],
      [branch, g.forkY],
      [branch, g.leafForkY],
      [g.leaves[leaf], g.leafForkY],
      [g.leaves[leaf], g.leafY],
    ];
  }
  function indexLayout() {
    const g = indexGeometry(),
      [rx, ry, rw, rh] = g.root;
    let s = `<rect x="${30}" y="${10}" width="${440}" height="${210}" rx="10" fill="none" stroke="${color("flow")}" stroke-dasharray="5 5"/>`;
    g.branches.forEach((x, i) => {
      s += path([
        [rx, ry + rh],
        [rx, g.forkY],
        [x, g.forkY],
        [x, g.routeY],
      ]);
      s += path([
        [x, g.routeY + g.pageH],
        [x, g.rangeY],
      ]);
      s += box(x - g.pageW / 2, g.routeY, g.pageW, g.pageH, "");
      s +=
        path(
          [
            [x - 12, g.routeY + g.pageH / 2 - 4],
            [x + 12, g.routeY + g.pageH / 2 - 4],
          ],
          "storage",
        ) +
        path(
          [
            [x - 12, g.routeY + g.pageH / 2 + 4],
            [x + 12, g.routeY + g.pageH / 2 + 4],
          ],
          "storage",
        );
      s += box(
        x - g.pageW / 2,
        g.rangeY,
        g.pageW,
        g.pageH,
        i ? "Recent" : "Older",
      );
      [g.routeY, g.rangeY].forEach((y, level) => {
        s += `<rect data-route-page="${i}-${level}" x="${x - g.pageW / 2}" y="${y}" width="${g.pageW}" height="${g.pageH}" rx="6" fill="none" stroke="${color("flow")}" stroke-width="3" display="none"/>`;
      });
    });
    s += box(rx - rw / 2, ry, rw, rh, "Root");
    g.leaves.forEach((x, i) => {
      const branch = g.branches[i < 3 ? 0 : 1];
      s += path([
        [branch, g.rangeY + g.pageH],
        [branch, g.leafForkY],
        [x, g.leafForkY],
        [x, g.leafY],
      ]);
      s += box(
        x - g.leafW / 2,
        g.leafY,
        g.leafW,
        g.leafH,
        i < 3 ? "" : [5, 25, 70][i - 3] + "%",
        i < 3 ? "storage" : "focus",
      );
      if (i < 3)
        s +=
          path(
            [
              [x - 9, g.leafY + 20],
              [x + 9, g.leafY + 20],
            ],
            "storage",
          ) +
          path(
            [
              [x - 9, g.leafY + 32],
              [x + 9, g.leafY + 32],
            ],
            "storage",
          );
      s += `<rect data-found="${i}" x="${x - g.leafW / 2}" y="${g.leafY}" width="${g.leafW}" height="${g.leafH}" rx="6" fill="none" stroke="${color("success")}" stroke-width="3" display="none"/>`;
    });
    {
      [42, 115, 180, 267].forEach((y, i) => {
        s += text(16, y, String(i + 1), "label");
      });
      s += text(390, 42, "In RAM", "small");
    }
    s += text(
      g.width / 2,
      320,
      "Older ← row IDs → Newer",
      "small",
    );
    s += text(
      g.width / 2,
      350,
      "4 levels → 100 billion rows",
      "label",
    );
    return { svg: s, width: g.width, height: g.height };
  }

  let frame = null;
  const figures = [];
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const TREE_SPEED = 240;
  const treeRoute = (leaf) => indexRoute(leaf);
  function routeLength(route) {
    return route
      .slice(1)
      .reduce(
        (sum, p, i) => sum + Math.hypot(p[0] - route[i][0], p[1] - route[i][1]),
        0,
      );
  }
  function treeSnapshot(elapsed) {
    const maxDuration = Math.max(...[3,4,5].map(leaf=>routeLength(treeRoute(leaf)))) / TREE_SPEED * 1000;
    const wholeCycles = Math.floor(
      Math.max(0, Math.floor((elapsed - maxDuration) / 400) + 1) / 100,
    );
    const counts = [wholeCycles * 5, wholeCycles * 25, wholeCycles * 70],
      found = new Set(),
      pages = new Set(),
      packets = [];
    for (
      let id = Math.max(
        0,
        wholeCycles * 100 - Math.ceil((maxDuration + 650) / 400),
      );
      id <= Math.floor(elapsed / 400);
      id++
    ) {
      const leaf = targets[id % 100],
        route = treeRoute(leaf),
        length = routeLength(route),
        duration = (length / TREE_SPEED) * 1000,
        age = elapsed - id * 400;
      if (age >= duration) {
        if (id >= wholeCycles * 100) counts[leaf - 3]++;
        if (age < duration + 650) found.add(leaf);
      } else {
        const distance = (age * TREE_SPEED) / 1000,
          [x, y] = point(
            route,
            distance / length,
          );
        const g = indexGeometry(),
          branch = leaf < 3 ? 0 : 1;
        let hidden = false;
        [g.routeY, g.rangeY].forEach((top, level) => {
          if (x === g.branches[branch] && y > top && y < top + g.pageH) {
            hidden = true;
            pages.add(`${branch}-${level}`);
          }
        });
        packets.push({ id, leaf, x, y, distance, duration, hidden });
      }
    }
    return { counts, found, pages, packets };
  }
  function cacheSnapshot(elapsed) {
    let hits = 0,
      misses = 0,
      waiting = 0,
      active = [];
    const cycle = Math.floor(elapsed / 18000);
    hits = Math.max(0, cycle - 1) * 297;
    misses = Math.max(0, cycle - 1) * 3;
    for (let c = Math.max(0, cycle - 1); c <= cycle; c++) {
      for (const r of cacheReads) {
        let id = c * 300 + r.id,
          age = elapsed - id * 60;
        if (age < 0) continue;
        let lane = id % 8,
          y = 145 + lane * 12,
          phase,
          p;
        if (age >= (r.miss ? 7000 : 1500)) {
          r.miss ? misses++ : hits++;
          continue;
        }
        if (age < 450) {
          phase = "lookup";
          p = point(
            [
              [120, y],
              [220, y],
            ],
            age / 450,
          );
        } else if (!r.miss) {
          if (age < 600) {
            phase = "memory";
            p = [220, y];
          } else {
            phase = "return";
            p = point(
              [
                [220, y],
                [120, y],
              ],
              (age - 600) / 900,
            );
          }
        } else if (age < 1800) {
          phase = "disk";
          p = point(
            [
              [350, 215],
              [425, 215],
              [425, 255],
            ],
            (age - 450) / 1350,
          );
        } else if (age < 5000) {
          phase = "wait";
          p = [425, 255];
          waiting++;
        } else if (age < 6000) {
          phase = "fill";
          p = point(
            [
              [425, 255],
              [425, 215],
              [350, 215],
            ],
            (age - 5000) / 1000,
          );
        } else {
          phase = "return";
          p = point(
            [
              [220, y],
              [120, y],
            ],
            (age - 6000) / 1000,
          );
        }
        active.push({ id, phase, miss: r.miss, x: p[0], y: p[1] });
      }
    }

    return { hits, misses, waiting, active };
  }

  function syncPackets(f, packets) {
    const ns = "http://www.w3.org/2000/svg";
    const ids = new Set(packets.map((p) => p.id));
    for (const [id, n] of f.nodes.packets)
      if (!ids.has(id)) {
        n.group.remove();
        f.nodes.packets.delete(id);
      }
    for (const p of packets) {
      let n = f.nodes.packets.get(p.id);
      if (!n) {
        const group = document.createElementNS(ns, "g"),
          circle = document.createElementNS(ns, "circle"),
          fill = document.createElementNS(ns, "rect"),
          ring = document.createElementNS(ns, "circle");
        circle.setAttribute("r", p.miss ? "7" : "4");
        circle.setAttribute("fill", color(p.miss ? "focus" : "flow"));
        circle.setAttribute("stroke", color("surface"));
        circle.setAttribute("stroke-width", "1");
        for (const [k, v] of Object.entries({
          x: -6,
          y: -7,
          width: 12,
          height: 14,
          fill: color("focus"),
        }))
          fill.setAttribute(k, v);
        for (const [k, v] of Object.entries({
          r: 13,
          fill: "none",
          stroke: color("focus"),
        }))
          ring.setAttribute(k, v);
        group.append(circle, fill, ring);
        f.nodes.layer.append(group);
        n = { group, circle, fill, ring };
        f.nodes.packets.set(p.id, n);
      }
      n.group.setAttribute("transform", `translate(${p.x} ${p.y})`);
      n.group.style.visibility = p.hidden ? "hidden" : "visible";
      if (p.leaf !== undefined) n.group.dataset.targetLeaf = p.leaf;
      if (p.distance !== undefined) n.group.dataset.distance = p.distance;
      if (p.duration !== undefined) n.group.dataset.duration = p.duration;
      n.group.dataset.request = p.id;
      if (p.phase) n.group.dataset.phase = p.phase;
      if (p.miss !== undefined) n.group.dataset.miss = p.miss;
      n.circle.style.display = p.phase === "fill" ? "none" : "";
      n.fill.style.display = p.phase === "fill" ? "" : "none";
      n.ring.style.display = p.phase === "wait" ? "" : "none";
    }
  }
  function updateMotion(f) {
    if (f.id === "working-set-budget") {
      f.time = Math.min(16100, f.time);
      const used = 33 + Math.min(23, Math.floor((f.time + 1e-7) / 700));
      if (used === 56) {
        f.playing = false;
        f.previous = null;
      }
      if (f.nodes.lastUsed !== used) {
        f.nodes.lastUsed = used;
        f.nodes.slots.forEach((n, i) =>
          n.setAttribute(
            "class",
            i < used
              ? "occupied"
              : i === used && used < 56
                ? "empty next"
                : "empty",
          ),
        );
        f.nodes.used.textContent = used + " GiB";
        f.nodes.free.textContent = 100 - used + " GiB";
      }
      f.nodes.hour.value = used;
      const p = f.nodes.budgetRoute.getPointAtLength(
        (f.nodes.budgetRoute.getTotalLength() * (f.time % 700)) / 700,
      );
      f.nodes.budgetPacket.setAttribute(
        "transform",
        `translate(${p.x} ${p.y})`,
      );
      f.nodes.budgetPacket.style.display =
        used === 56 || reduced.matches ? "none" : "";
      f.section.dataset.state = JSON.stringify({
        elapsed: Math.round(f.time),
        used,
        free: 100 - used,
        estimate: [33, 56],
        pool: 100,
        storedGiB: 15155.2,
        playing: f.playing,
      });
      f.section.querySelector("[data-action=play]").textContent = f.playing
        ? "Pause"
        : used === 56
          ? "Play again"
          : "Play";
      return;
    }

    let state, packets, status;
    if (f.id === "increasing-ids") {
      const snap = treeSnapshot(f.time);
      packets = snap.packets;
      f.nodes.routing.forEach((n) =>
        n.setAttribute(
          "display",
          snap.pages.has(n.dataset.routePage) ? "inline" : "none",
        ),
      );
      f.nodes.found.forEach((n) =>
        n.setAttribute(
          "display",
          snap.found.has(Number(n.dataset.found)) ? "inline" : "none",
        ),
      );
      state = {
        elapsed: Math.round(f.time),
        completedByRecentLeaf: snap.counts,
      };
      status = `Completed illustrative reads at recent leaves: ${snap.counts.join(" / ")}. Green outlines mark pages just found. Three cached routing levels → one leaf. Actual depth varies with key width and page occupancy. Secondary indexes follow their own key order; they are not necessarily append-only.`;
    } else if (f.id === "working-set") {
      const snap = cacheSnapshot(f.time);
      packets = snap.active;
      state = {
        elapsed: Math.round(f.time),
        memoryReturns: snap.hits,
        diskReturns: snap.misses,
        diskWaiting: snap.waiting,
        active: snap.active.map(({ id, phase, miss }) => ({ id, phase, miss })),
      };
      const lines=[`${snap.hits} RAM`,`${snap.misses} disk`];
      f.nodes.summaryParts.forEach((node, i) => {
        if (node.textContent !== lines[i]) node.textContent = lines[i];
      });
    } else if (f.id === "traffic") {
      const hour =
          f.time > 0 && f.time % 72000 === 0 ? 24 : (f.time / 3000) % 24,
        rate = 10000 + 2000 * Math.cos(((hour - 14) * Math.PI) / 12),
        x = 55+(hour/24)*415,
        y = 215-(rate/12000)*155;
      f.nodes.cursor.setAttribute("transform", `translate(${x} 0)`);
      f.nodes.cursorDot.setAttribute("cy", y);
      f.nodes.hour.value = hour;
      const label=`${hour.toFixed(1)} h · ${Math.round(rate).toLocaleString()} / s`;
      if (f.nodes.trafficSummary.textContent !== label)
        f.nodes.trafficSummary.textContent = label;
      state = {
        elapsed: Math.round(f.time),
        hour,
        illustrativeSelectRate: rate,
      };
      packets = [];
    }
    syncPackets(f, packets);
    f.section.dataset.state = JSON.stringify(state);
    if (status && f.nodes.status.textContent !== status)
      f.nodes.status.textContent = status;
  }

  function add(
    id,
    component,
    title,
    kind,
    caption,
    render,
    animated = false,
    extra = "",
  ) {
    const section = document.createElement("section");
    section.className = "visual";
    section.dataset.figure = id;
    if (component.includes(" ")) section.dataset.sourceComponents = component;
    else section.dataset.sourceComponent = component;
    section.dataset.evidence = kind;
    section.innerHTML = `<header class="visual-heading"><h2>${title}</h2></header><div class="stage" tabindex="0" role="region" aria-label="${title}"></div>${id==='working-set-budget'?'<div class="capacity-readouts"><div><strong data-used></strong><span>active estimate</span></div><div><strong data-free></strong><span>free capacity</span></div></div>':''}<div class="controls">${animated?'<button data-action="play">Play</button><button data-action="step">Step</button><button data-action="reset">Replay</button>':''}${extra}</div><footer class="result"><p>${caption}</p></footer>`;
    document.querySelector("#figures").append(section);
    const f = {
      id,
      section,
      time: id === "traffic" ? 42000 : 0,
      playing: animated && !reduced.matches,
      previous: null,
      visible: false,
      render,
      animated,
    };
    figures.push(f);
    f.draw = (rebuild = false) => {
      if (f.animated && f.nodes && !rebuild) {
        updateMotion(f);
        return;
      }
      let r = render(f);
      section.dataset.state = JSON.stringify(
        r.state ?? { time: Math.round(f.time) },
      );
      section.querySelector(".stage").innerHTML =
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${r.width || 920} ${r.height || 390}" role="img" aria-label="${title}" aria-describedby="description-${id}"><title>${title}</title><desc id="description-${id}">${r.status || caption}</desc><rect width="${r.width || 920}" height="${r.height || 390}" fill="${color("surface")}"/><defs>${['border','flow','storage'].map(role=>`<marker id="arrow-${id}-${role}" viewBox="0 0 8 8" refX="8" refY="4" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0L8 4L0 8Z" fill="${color(role)}"/></marker>`).join('')}</defs>${r.svg.replaceAll("url(#arrow-", `url(#arrow-${id}-`)}</svg>`;
      if (animated) {
        const svg = section.querySelector("svg");
        const layer = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "g",
        );
        layer.dataset.motion = "";
        svg.append(layer);
        f.nodes = {
          layer,
          packets: new Map(),
          found: [...svg.querySelectorAll("[data-found]")],
          routing: [...svg.querySelectorAll("[data-route-page]")],
          summary: svg.querySelector("[data-cache-summary] text"),
          summaryParts: [...svg.querySelectorAll("[data-cache-summary] text")],
          status: svg.querySelector("desc"),
          cursor: svg.querySelector("[data-traffic-cursor]"),
          cursorDot: svg.querySelector("[data-traffic-cursor] circle"),
          hour: section.querySelector("input"),
          trafficSummary: svg.querySelector("[data-traffic-summary] text"),
          slots: [...svg.querySelectorAll("[data-slot]")],
          used: section.querySelector("[data-used]"),
          free: section.querySelector("[data-free]"),
          budgetRoute: svg.querySelector("[data-transfer-route]"),
          budgetPacket: svg.querySelector("[data-budget-packet]"),
        };
        updateMotion(f);
        section.querySelector("[data-action=play]").textContent = f.playing
          ? "Pause"
          : "Play";
      }
    };
    section.addEventListener("click", (e) => {
      const a = e.target.dataset.action;
      if (a === "play") {
        if (id === "working-set-budget" && f.time >= 16100) f.time = 0;
        f.playing = !f.playing;
        f.previous = null;
        wake();
        e.target.textContent = f.playing ? "Pause" : "Play";
        if (id === "working-set-budget") f.draw();
      }
      if (a === "step") {
        f.playing = false;
        f.time =
          id === "working-set-budget"
            ? Math.min(16100, (Math.floor(f.time / 700) + 1) * 700)
            : f.time + 500;
        section.querySelector("[data-action=play]").textContent = "Play";
        f.draw();
      }
      if (a === "reset") {
        f.time = 0;
        f.previous = null;
        f.playing = !reduced.matches;
        section.querySelector("[data-action=play]").textContent = f.playing
          ? "Pause"
          : "Play";
        wake();
        f.draw();
      }
    });
    if (id === "working-set-budget") {
      section.querySelector("[data-action=step]").textContent = "Step 1 GiB";
      section.querySelector("input").oninput = (e) => {
        f.playing = false;
        f.previous = null;
        f.time = (Number(e.target.value) - 33) * 700;
        f.draw();
      };
    }
    f.draw();
    return f;
  }
  add(
    "regions",
    "BigDatabaseRegionsFigure",
    "Database topology",
    "REPORTED TOPOLOGY",
    "Each region has one primary (P) and two replicas (R). Primaries replicate across regions.",
    () => {
      return {
        ...regionLayout(),
        state: { primaries: 3, replicas: 6 },
        status:
          "Dashed rose links: exchanges between primaries. Solid teal arrows: replication to local replicas. No application routing or consistency guarantee is depicted.",
      };
    },
  );
  add(
    "hardware",
    "BigDatabaseHardwareFigure",
    "Each machine has powerful hardware",
    "REPORTED PER INSTANCE",
    "The buffer pool uses 100 GiB of RAM. CPU utilization is about 5%; disk usage is about 75%.",
    () => {
      return {
        ...hardwareLayout(),
        state: {
          cores: 32,
          utilization: 0.05,
          ramGiB: 238,
          poolGiB: 100,
          diskUsed: 0.75,
        },
        status:
          "The dataset is not the only disk consumer. A 100 GiB buffer pool uses about 42% of RAM.",
      };
    },
  );
  add(
    "working-set-budget",
    "BigDatabaseWorkingSetBudgetFigure",
    "The active dataset fits in memory",
    "REPORTED CAPACITY · ESTIMATED WORKING SET",
    "An estimated 33–56 GiB is active, leaving at least 44 GiB free. The pool holds 0.66% of stored data and serves 98.7% of page reads.",
    () => ({
      ...capacityLayout(),
      status:
        "Disk: 151 full 100 GiB blocks plus 55.2 GiB = 14.8 TiB. The highlighted block equals the entire 100 GiB pool. The enlarged bank has 100 one-GiB capacity units, not literal database pages or contiguous cached data. At 33 GiB active, 67 GiB remains free; at 56 GiB, 44 GiB remains free. The observed 98.7% page-hit rate is separate from the estimate, not whole queries or a result measured by this animation.",
    }),
    true,
    '<label>Active estimate <input type="range" min="33" max="56" value="33" aria-label="Active estimate in GiB"></label>',
  );
  let targets = Array.from({ length: 100 }, (_, i) =>
      i < 5 ? 3 : i < 30 ? 4 : 5,
    ),
    seed = 73;
  for (let i = 99; i > 0; i--) {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    let j = seed % (i + 1);
    [targets[i], targets[j]] = [targets[j], targets[i]];
  }
  add(
    "increasing-ids",
    "BigDatabaseIncreasingIdsFigure BigDatabaseTreeDepthFigure",
    "New data tends to cluster in the same pages",
    "ILLUSTRATIVE INDEX · RECENT READS",
    "Increasing primary keys put newer rows on the right. Read destinations and the four-level capacity are illustrative; actual index depth varies.",
    (f) => ({
      ...indexLayout(),
      state: {
        elapsed: Math.round(f.time),
        completedByRecentLeaf: treeSnapshot(f.time).counts,
      },
      status:
        "Dashed boundary: cached routing pages. Moving dots: reads. Green outline: a leaf reached. Actual depth depends on key width and page occupancy. Secondary indexes follow their own key order; a non-covering lookup may also traverse the clustered index.",
    }),
    true,
  );
  let cacheSeed = 42;
  const cacheReads = Array.from({ length: 3 }, (_, batch) => {
    cacheSeed = (Math.imul(cacheSeed, 1664525) + 1013904223) >>> 0;
    let miss = 20 + (cacheSeed % 60);
    return Array.from({ length: 100 }, (_, i) => ({
      id: batch * 100 + i,
      miss: i === miss,
    }));
  }).flat();
  const cache = add(
    "working-set",
    "BigDatabaseWorkingSetFigure",
    "Most page reads return from memory",
    "OBSERVED 98.7% HITS · ILLUSTRATIVE 99/1 ANIMATION",
    "A miss reads disk and fills the buffer pool before returning. The animation uses 99% hits; the reported page-hit rate is 98.7%.",
    (f) => {
      let s=`<rect x="200" y="65" width="290" height="280" rx="10" fill="none" stroke="${color('subtle')}"/>`+text(345,85,'MySQL','small');
      for(let lane=0;lane<8;lane++) s+=path([[120,145+lane*12],[220,145+lane*12]],'flow');
      s+=path([[350,215],[425,215],[425,255]],'storage',false,true)+text(413,190,'1%','small');
      s+=box(20,130,100,120,'App','processing');
      s+=box(220,110,130,150,'','flow')+hardwareIcon('memory',285,136,'flow',.65)+text(285,178,'99%','value')+text(285,210,'Buffer pool','label')+text(285,240,'100 GiB','small');
      s+=box(370,255,110,78,'','storage')+hardwareIcon('disk',425,275,'storage',.5)+text(425,310,'Disk','label');
      s+='<g data-cache-summary>'+text(140,30,'','label')+text(360,30,'','label')+'</g>';
      return {svg:s,width:500,height:365,status:'Teal circles return from RAM. Orange circles visit disk; a ring marks waiting and a square marks the page fill. These are page accesses, not whole-query hits. Timings and the rounded 99/1 ratio are illustrative.'};
    },
    true,
    '<button data-action="miss">Show a disk miss</button>',
  );
  cache.section.querySelector("[data-action=miss]").onclick = () => {
    cache.playing = false;
    cache.time = cacheReads.find((r) => r.miss).id * 60 + 2300;
    cache.section.querySelector("[data-action=play]").textContent = "Play";
    cache.draw();
  };
  const traffic = add(
    "traffic",
    "BigDatabaseTrafficFigure",
    "Reads dominate the daily workload",
    "ILLUSTRATIVE DAY · REPORTED QUERY MIX",
    "About 10,000 SELECTs/s run across three primaries. The daily curve is illustrative; the read/write mix and average query time are reported.",
    (f) => {
      let s='';
      for(const v of [0,6000,12000]) {
        const y=215-v/12000*155;
        s+=path([[55,y],[470,y]],'subtle')+text(25,y,v===0?'0':v/1000+'k','small');
      }
      for(const h of [0,6,12,18,24]) s+=text(55+h/24*415,236,String(h).padStart(2,'0'),'small');
      const pts=Array.from({length:97},(_,i)=>[55+i/96*415,215-(10000+2000*Math.cos((i/4-14)*Math.PI/12))/12000*155]);
      s+=path(pts,'flow')+text(250,25,'SELECTs / s','label');
      s+=`<g data-traffic-cursor><path d="M0 55V215" stroke="${color('border')}" stroke-dasharray="6 5"/><circle cx="0" cy="60" r="5" fill="${color('flow')}"/></g><g data-traffic-summary>${text(250,260,'','label')}</g>`+queryFacts();
      return {svg:s,width:500,height:365,status:'The curve models one day, not measured telemetry. About 10,000 SELECTs/s is reported across all primaries; the 12,000/s peak is illustrative. The average query time does not describe tail latency.'};
    },
    true,
    '<label>Hour <input type="range" min="0" max="24" step="0.01" value="14" aria-label="Hour of day"></label>',
  );
  traffic.section.querySelector("input").oninput = () => {
    traffic.playing = false;
    traffic.previous = null;
    traffic.time = Number(traffic.section.querySelector("input").value) * 3000;
    traffic.section.querySelector("[data-action=play]").textContent = "Play";
    traffic.draw();
  };
  function setTheme() {
    for (const [k, v] of Object.entries(window.visualTokens[theme]))
      document.documentElement.style.setProperty("--" + k, v);
    document.documentElement.style.colorScheme = theme;
    document.documentElement.dataset.theme = theme;
    document
      .querySelector("#theme")
      .setAttribute("aria-pressed", String(theme === "dark"));
    figures.forEach((f) => f.draw(true));
  }
  document.querySelector("#theme").onclick = () => {
    theme = theme === "dark" ? "light" : "dark";
    localStorage.setItem("visual-lab-theme", theme);
    setTheme();
  };
  setTheme();
  const observer = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        const f = figures.find((f) => f.section === e.target);
        f.visible = e.isIntersecting && e.intersectionRatio >= 0.05;
        f.previous = null;
      }
      wake();
    },
    { threshold: [0, 0.05] },
  );
  figures.forEach((f) => observer.observe(f.section));
  reduced.addEventListener("change", () => {
    if (reduced.matches)
      for (const f of figures.filter((f) => f.animated)) {
        f.playing = false;
        f.previous = null;
        f.section.querySelector("[data-action=play]").textContent = "Play";
      }
    wake();
  });
  document.addEventListener("visibilitychange", () => {
    for (const f of figures) f.previous = null;
    wake();
  });
  function eligible(f) {
    return f.animated && f.playing && f.visible && !document.hidden;
  }
  function wake() {
    if (frame === null && figures.some(eligible))
      frame = requestAnimationFrame(tick);
  }
  function tick(now) {
    frame = null;
    for (const f of figures) {
      if (!eligible(f)) {
        f.previous = null;
        continue;
      }
      if (f.previous !== null) f.time += Math.min(80, now - f.previous);
      f.previous = now;
      updateMotion(f);
    }
    wake();
  }
})();
