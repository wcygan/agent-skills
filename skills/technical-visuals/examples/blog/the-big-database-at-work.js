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
    `<path d="${pts.map((p, i) => (i ? "L" : "M") + p.join(" ")).join(" ")}" fill="none" stroke="${color(role)}" stroke-width="1.8" ${dash ? 'stroke-dasharray="6 5"' : ""} ${arrows ? 'marker-end="url(#arrow)"' : ""}/>`;
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
  function regionLayout(compact = false) {
    let s = text(compact ? 160 : 460, 25, "Primary ↔ primary", "small");
    const centers = compact ? [180, 180, 180] : [170, 460, 750];
    if (compact)
      s += path(
        [
          [25, 98],
          [25, 478],
        ],
        "control",
        true,
      );
    else
      s += path(
        [
          [170, 60],
          [750, 60],
        ],
        "control",
        true,
      );
    centers.forEach((x, i) => {
      const y = compact ? 45 + i * 190 : 85;
      const w = compact ? 260 : 240;
      s += `<rect x="${x - w / 2}" y="${y}" width="${w}" height="170" rx="12" fill="${color("raised")}" stroke="${color("subtle")}" stroke-dasharray="5 5"/>`;
      s += text(
        compact ? x : x - 60,
        y + 20,
        "Region " + String.fromCharCode(65 + i),
        "label",
      );
      s += compact
        ? path(
            [
              [25, y + 53],
              [x - 45, y + 53],
            ],
            "control",
            true,
          )
        : path(
            [
              [x, 60],
              [x, y + 38],
            ],
            "control",
            true,
          );
      s += path(
        [
          [x, y + 83],
          [x, y + 103],
          [x - 58, y + 103],
          [x - 58, y + 120],
        ],
        "flow",
        false,
        true,
      );
      s += path(
        [
          [x, y + 103],
          [x + 58, y + 103],
          [x + 58, y + 120],
        ],
        "flow",
        false,
        true,
      );
      s += database(x - 45, y + 38, 90, 45, "P");
      s += database(x - 98, y + 120, 80, 35, "R");
      s += database(x + 18, y + 120, 80, 35, "R");
    });
    s += text(
      compact ? 160 : 460,
      compact ? 640 : 310,
      "P · Primary     R · Replica",
      "small",
    );
    return { svg: s, height: compact ? 670 : 345 };
  }
  function capacityGeometry(compact = false) {
    return compact
      ? {
          width: 320,
          height: 800,
          disk: { x: 15, y: 75, w: 290, h: 290 },
          map: { x: 51, y: 145, step: 17, size: 14, cols: 13 },
          ram: { x: 15, y: 480, w: 290, h: 290 },
          bank: { x: 66.5, y: 545, step: 19, size: 16 },
          route: [
            [160, 365],
            [160, 395],
            [260, 395],
            [260, 480],
          ],
        }
      : {
          width: 960,
          height: 520,
          disk: { x: 25, y: 90, w: 400, h: 400 },
          map: { x: 71, y: 165, step: 24, size: 20, cols: 13 },
          ram: { x: 535, y: 90, w: 400, h: 400 },
          bank: { x: 597, y: 175, step: 28, size: 24 },
          route: [
            [425, 290],
            [535, 290],
          ],
        };
  }
  function capacityLayout(compact = false) {
    const g = capacityGeometry(compact),
      d = g.disk,
      r = g.ram;
    let s = `<rect data-resource-panel="disk" x="${d.x}" y="${d.y}" width="${d.w}" height="${d.h}" rx="12" fill="${color("storageFill")}" stroke="${color("storage")}" stroke-width="2"/>`;
    s +=
      `<g data-resource-icon="disk">${hardwareIcon("disk", d.x + d.w / 2, d.y - 45, "storage")}</g>` +
      `<g data-resource-icon="ram">${hardwareIcon("memory", r.x + r.w / 2, r.y - 45, "flow")}</g>`;
    s +=
      text(d.x + d.w / 2, d.y + 27, "14.8 TiB stored") +
      text(d.x + d.w / 2, d.y + 52, "1 block = 100 GiB", "tiny muted");
    for (let i = 0; i < 152; i++) {
      const x = g.map.x + (i % g.map.cols) * g.map.step,
        y = g.map.y + Math.floor(i / g.map.cols) * g.map.step;
      s += `<rect data-disk-block="${i}" x="${x}" y="${y}" width="${g.map.size * (i === 151 ? 0.552 : 1)}" height="${g.map.size}" rx="2" fill="${color(i === 0 ? "focus" : "storageFill")}" stroke="${color(i === 0 ? "focus" : "storage")}" stroke-width="1"/>`;
    }
    if (!compact)
      s += text(
        d.x + d.w / 2,
        d.y + d.h - 20,
        "Highlighted block = entire pool",
        "tiny",
      );
    s += `<path data-transfer-route d="${g.route.map((v, i) => (i ? "L" : "M") + v.join(" ")).join(" ")}" fill="none" stroke="${color("flow")}" stroke-width="2"/>`;
    s += compact
      ? text(75, 410, "Zoom", "tiny muted")
      : text(480, 260, "Zoom", "tiny muted") +
        text(480, 327, "1 GiB", "tiny muted");
    s +=
      `<rect data-resource-panel="ram" x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" rx="12" fill="${color("surface")}" stroke="${color("flow")}" stroke-width="2"/>` +
      text(r.x + r.w / 2, r.y + 28, "100 GiB buffer pool") +
      text(r.x + r.w / 2, r.y + 52, "1 slot = 1 GiB", "tiny muted");
    for (let i = 0; i < 100; i++) {
      const x = g.bank.x + (i % 10) * g.bank.step,
        y = g.bank.y + Math.floor(i / 10) * g.bank.step;
      s += `<rect data-slot="${i}" x="${x}" y="${y}" width="${g.bank.size}" height="${g.bank.size}" rx="3"/>`;
    }
    const foot = r.y + r.h - 20;
    s += text(
      r.x + r.w / 2,
      foot,
      "Tinted = active · outlined = free",
      "tiny muted",
    );
    s += `<rect data-budget-packet width="12" height="12" x="-6" y="-6" rx="3" class="pulse"/>`;
    return { svg: s, width: g.width, height: g.height };
  }
  function hardwareLayout(compact = false) {
    let s = "";
    const rows = [
      {
        icon: "cpu",
        label: "CPU",
        value: "32 cores",
        role: "processing",
        share: 0.05,
        note: "5% utilized",
      },
      {
        icon: "memory",
        label: "RAM",
        value: "238 GiB",
        role: "flow",
        share: 100 / 238,
        note: "100 GiB pool",
      },
      {
        icon: "disk",
        label: "Disk",
        value: "≈75% used",
        role: "storage",
        share: 0.75,
        note: "≈6.1 TiB free",
      },
    ];
    rows.forEach((r, i) => {
      const x = compact ? 20 : 35 + i * 295,
        y = compact ? 15 + i * 145 : 25,
        w = compact ? 280 : 260;
      s += `<rect x="${x}" y="${y}" width="${w}" height="${compact ? 125 : 230}" rx="10" fill="${color(r.role + "Fill")}" stroke="${color(r.role)}"/>`;
      s += hardwareIcon(r.icon, x + 38, y + 34, r.role, 0.7);
      s += text(x + 90, y + 34, r.label, "label");
      s += text(
        x + (compact ? 200 : w / 2),
        y + (compact ? 34 : 94),
        r.value,
        compact ? "label" : "value",
      );
      const barY = y + (compact ? 65 : 137);
      s += `<rect x="${x + 18}" y="${barY}" width="${w - 36}" height="16" rx="3" fill="${color("surface")}" stroke="${color(r.role)}"/><rect data-capacity="${r.icon}" x="${x + 18}" y="${barY}" width="${(w - 36) * r.share}" height="16" rx="3" fill="${color(r.role)}"/>`;
      s += text(x + w / 2, y + (compact ? 103 : 191), r.note, "small");
    });
    return { svg: s, width: compact ? 320 : 920, height: compact ? 455 : 285 };
  }
  function queryFacts(compact = false) {
    const x = compact ? 85 : 290,
      other = compact ? 240 : 650,
      y = compact ? 425 : 460,
      w = compact ? 130 : 250;
    return (
      `<rect x="${x - w / 2}" y="${y - 30}" width="${w}" height="90" rx="8" fill="${color("flowFill")}" stroke="${color("flow")}"/>` +
      text(x, y, "100 : 1", "value") +
      text(x, y + 35, "reads / write", "small") +
      `<rect x="${other - w / 2}" y="${y - 30}" width="${w}" height="90" rx="8" fill="${color("processingFill")}" stroke="${color("processing")}"/>` +
      text(other, y, "0.48 ms", "value") +
      text(other, y + 35, "average query", "small")
    );
  }
  const phone = matchMedia("(max-width: 600px)");
  const phoneLeaves = [25, 75, 125, 175, 235, 295];
  function indexGeometry(compact) {
    return compact
      ? {
          root: [160, 30, 70, 30],
          branches: [75, 235],
          routeY: 95,
          rangeY: 155,
          pageW: 100,
          pageH: 25,
          forkY: 80,
          leafForkY: 200,
          leafY: 218.5,
          leafW: 44,
          leafH: 55,
          leaves: phoneLeaves,
          width: 320,
          height: 340,
        }
      : {
          root: [460, 40, 140, 38],
          branches: [250, 670],
          routeY: 135,
          rangeY: 230,
          pageW: 140,
          pageH: 38,
          forkY: 105,
          leafForkY: 305,
          leafY: 335,
          leafW: 96,
          leafH: 60,
          leaves: [130, 250, 370, 550, 670, 790],
          width: 920,
          height: 500,
        };
  }
  function indexRoute(leaf, compact = false) {
    const g = indexGeometry(compact),
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
  function indexLayout(compact = false) {
    const g = indexGeometry(compact),
      [rx, ry, rw, rh] = g.root;
    let s = `<rect x="${compact ? 15 : 110}" y="${compact ? 14 : 20}" width="${compact ? 290 : 740}" height="${compact ? 180 : 270}" rx="10" fill="none" stroke="${color("flow")}" stroke-dasharray="5 5"/>`;
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
    if (!compact) {
      [59, 154, 249, 365].forEach((y, i) => {
        s += text(55, y, String(i + 1), "label");
      });
      s += text(770, 42, "Cached routes", "small");
    }
    s += text(
      g.width / 2,
      compact ? 294 : 435,
      "Older ← row IDs → Newer",
      "small",
    );
    s += text(
      g.width / 2,
      compact ? 322 : 475,
      compact
        ? "4 levels · 1,000³ × 100 rows"
        : "4 levels · 1,000³ × 100 = 100 billion rows",
      "label",
    );
    return { svg: s, width: g.width, height: g.height };
  }
  function phoneFigure(id, original) {
    let s = "",
      height = 400;
    if (id === "regions") {
      ({ svg: s, height } = regionLayout(true));
    } else if (id === "hardware") {
      return { ...original, ...hardwareLayout(true) };
    } else if (id === "working-set-budget") {
      return { ...original, ...capacityLayout(true) };
    } else if (id === "increasing-ids") {
      return { ...original, ...indexLayout(true) };
    } else if (id === "working-set") {
      height = 630;
      s =
        `<rect x="15" y="130" width="290" height="410" rx="8" fill="none" stroke="${color("subtle")}"/>` +
        text(160, 520, "MYSQL INSTANCE", "small");
      for (let lane = 0; lane < 8; lane++)
        s += path(
          [
            [55 + lane * 30, 80],
            [55 + lane * 30, 180],
          ],
          "flow",
        );
      s +=
        path(
          [
            [160, 280],
            [160, 390],
          ],
          "border",
          false,
          true,
        ) +
        text(230, 335, "1% → disk", "label") +
        box(30, 20, 260, 60, "Application", "processing");
      s +=
        box(30, 180, 260, 100, "", "flow") +
        hardwareIcon("memory", 160, 205, "flow", 0.65) +
        text(82, 229, "99%", "value") +
        text(205, 229, "Buffer pool", "label") +
        text(160, 263, "100 GiB", "small");
      s +=
        box(80, 390, 160, 105, "", "storage") +
        hardwareIcon("disk", 160, 410, "storage", 0.65) +
        text(160, 444, "Disk / SSD", "label") +
        text(160, 474, "14.8 TiB stored", "small");
      s += `<g data-cache-summary>${text(160, 565, "", "label")}${text(160, 588, "", "small")}${text(160, 609, "", "small")}</g>`;
    } else if (id === "traffic") {
      height = 505;
      s =
        text(160, 25, "SELECTs / s · 3 primaries", "label") +
        text(160, 48, "Illustrative day", "small");
      for (let v = 0; v <= 12000; v += 4000) {
        const y = 280 - (v / 12000) * 190;
        s +=
          path(
            [
              [55, y],
              [300, y],
            ],
            "subtle",
          ) + text(25, y, v === 0 ? "0" : v / 1000 + "k", "small");
      }
      for (let h = 0; h <= 24; h += 6)
        s += text(
          55 + (h / 24) * 245,
          305,
          String(h).padStart(2, "0"),
          "small",
        );
      const pts = Array.from({ length: 97 }, (_, i) => [
        55 + (i / 96) * 245,
        280 -
          ((10000 + 2000 * Math.cos(((i / 4 - 14) * Math.PI) / 12)) / 12000) *
            190,
      ]);
      s +=
        `<path d="M55 280 ${pts.map((p) => "L" + p.join(" ")).join(" ")} L300 280Z" fill="${color("flow")}" fill-opacity=".09"/>` +
        path(pts, "flow") +
        text(160, 334, "Hour", "small") +
        `<g data-traffic-cursor><path d="M0 80V280" stroke="${color("border")}" stroke-dasharray="6 5"/><circle cx="0" cy="90" r="4" fill="${color("flow")}"/></g><g data-traffic-summary>${text(160, 367, "", "label")}</g>` +
        queryFacts(true);
    }
    return { ...original, svg: s, width: 320, height };
  }

  let frame = null;
  const figures = [];
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const TREE_SPEED = 240;
  const treeRoute = (leaf) => indexRoute(leaf);
  const phoneTreeRoute = (leaf) => indexRoute(leaf, true);
  function routeLength(route) {
    return route
      .slice(1)
      .reduce(
        (sum, p, i) => sum + Math.hypot(p[0] - route[i][0], p[1] - route[i][1]),
        0,
      );
  }
  function treeSnapshot(elapsed) {
    const maxDuration = (587 / TREE_SPEED) * 1000;
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
            phone.matches ? phoneTreeRoute(leaf) : route,
            distance / length,
          );
        const g = indexGeometry(phone.matches),
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
          y = 120 + lane * 24,
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
              [230, y],
              [410, y],
            ],
            age / 450,
          );
        } else if (!r.miss) {
          if (age < 600) {
            phase = "memory";
            p = [410, y];
          } else {
            phase = "return";
            p = point(
              [
                [410, y],
                [230, y],
              ],
              (age - 600) / 900,
            );
          }
        } else if (age < 1800) {
          phase = "disk";
          p = point(
            [
              [630, 245],
              [770, 245],
              [770, 270],
            ],
            (age - 450) / 1350,
          );
        } else if (age < 5000) {
          phase = "wait";
          p = [770, 270];
          waiting++;
        } else if (age < 6000) {
          phase = "fill";
          p = point(
            [
              [770, 270],
              [770, 245],
              [630, 245],
            ],
            (age - 5000) / 1000,
          );
        } else {
          phase = "return";
          p = point(
            [
              [410, y],
              [230, y],
            ],
            (age - 6000) / 1000,
          );
        }
        if (phone.matches) {
          if (phase === "lookup" || phase === "memory" || phase === "return")
            p = [55 + lane * 30, 80 + ((p[0] - 230) / 180) * 100];
          else {
            const traveled = p[0] < 770 ? p[0] - 630 : 140 + p[1] - 245;
            p = [160, 280 + (traveled / 165) * 110];
          }
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
      const summary = `${snap.hits} memory return${snap.hits === 1 ? "" : "s"}   ·   ${snap.misses} disk return${snap.misses === 1 ? "" : "s"}   ·   ${snap.waiting} waiting on disk`;
      const lines = phone.matches
        ? [
            `${snap.hits} memory returns`,
            `${snap.misses} disk returns`,
            `${snap.waiting} waiting on disk`,
          ]
        : [summary];
      f.nodes.summaryParts.forEach((node, i) => {
        if (node.textContent !== lines[i]) node.textContent = lines[i];
      });
    } else if (f.id === "traffic") {
      const hour =
          f.time > 0 && f.time % 72000 === 0 ? 24 : (f.time / 3000) % 24,
        rate = 10000 + 2000 * Math.cos(((hour - 14) * Math.PI) / 12),
        x = phone.matches ? 55 + (hour / 24) * 245 : 110 + (hour / 24) * 730,
        y = phone.matches
          ? 280 - (rate / 12000) * 190
          : 300 - (rate / 12000) * 220;
      f.nodes.cursor.setAttribute("transform", `translate(${x} 0)`);
      f.nodes.cursorDot.setAttribute("cy", y);
      f.nodes.hour.value = hour;
      const label = phone.matches
        ? `${hour.toFixed(2)} h · ${Math.round(rate).toLocaleString()} / s`
        : `${hour.toFixed(2)} h · ${Math.round(rate).toLocaleString()} / s`;
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
    section.innerHTML = `<header class="visual-heading"><h2>${title}</h2></header><div class="controls">${animated ? '<button data-action="play">Play</button><button data-action="step">Step</button><button data-action="reset">Replay</button>' : ""}${extra}</div>${id === "working-set-budget" ? '<div class="capacity-readouts"><div><strong data-used></strong><span>active estimate</span></div><div><strong data-free></strong><span>free capacity</span></div><div><strong>100 GiB</strong><span>buffer pool</span></div></div>' : ""}<div class="stage" tabindex="0" role="region" aria-label="${title}"></div><footer class="result"><p>${caption}</p></footer>`;
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
      if (phone.matches) r = phoneFigure(id, r);
      section.dataset.state = JSON.stringify(
        r.state ?? { time: Math.round(f.time) },
      );
      section.querySelector(".stage").innerHTML =
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${r.width || 920} ${r.height || 390}" role="img" aria-label="${title}" aria-describedby="description-${id}"><title>${title}</title><desc id="description-${id}">${r.status || caption}</desc><rect width="${r.width || 920}" height="${r.height || 390}" fill="${color("surface")}"/><defs><marker id="arrow-${id}" viewBox="0 0 8 8" refX="8" refY="4" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0L8 4L0 8" fill="${color("border")}"/></marker></defs>${r.svg.replaceAll("url(#arrow)", `url(#arrow-${id})`)}</svg>`;
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
    "Each region has one primary and two replicas. Primaries replicate to the primaries in the other regions.",
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
    "Each instance has 32 CPU cores and about 238 GiB of RAM. The buffer pool uses 100 GiB of RAM. CPU utilization is about 5%, and disk usage is about 75%.",
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
    "The estimated active set uses 33–56 GiB of the 100 GiB pool, leaving at least 44 GiB free. The pool’s capacity is 0.66% of the stored data, and its reported page-hit rate is 98.7%. The filling animation is illustrative.",
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
    "Increasing primary keys place newer rows to the right. The read pattern and fan-out are illustrative. With the fan-out shown, four levels can address 100 billion rows; actual depth varies.",
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
    "Nearly all active-data reads are served from memory",
    "OBSERVED 98.7% HITS · ILLUSTRATIVE 99/1 ANIMATION",
    "Most page reads return from the buffer pool. A miss reads disk and fills the pool before returning data. The animation uses 99% hits; the reported page-hit rate is 98.7%.",
    (f) => {
      let s =
        `<rect x="370" y="30" width="500" height="380" rx="10" fill="none" stroke="${color("subtle")}"/>` +
        text(620, 55, "MYSQL INSTANCE", "small");
      s +=
        box(50, 100, 180, 210, "Application", "processing") +
        box(410, 100, 220, 210, "", "flow") +
        text(520, 205, "99%", "value") +
        text(520, 245, "Buffer pool", "label") +
        text(520, 280, "100 GiB", "small") +
        box(700, 270, 140, 100, "", "storage") +
        text(770, 316, "Disk / SSD", "label") +
        text(770, 345, "14.8 TiB stored", "small") +
        hardwareIcon("memory", 520, 150, "flow") +
        hardwareIcon("disk", 770, 286, "storage", 0.65);
      for (let lane = 0; lane < 8; lane++)
        s += path(
          [
            [230, 120 + lane * 24],
            [410, 120 + lane * 24],
          ],
          "flow",
        );
      s +=
        path(
          [
            [630, 245],
            [770, 245],
            [770, 270],
          ],
          "border",
          false,
          true,
        ) + text(752, 222, "1% → disk", "label");
      const { hits, misses, waiting, active } = cacheSnapshot(f.time);
      s +=
        "<g data-cache-summary>" +
        text(
          460,
          455,
          `${hits} memory return${hits === 1 ? "" : "s"}   ·   ${misses} disk return${misses === 1 ? "" : "s"}   ·   ${waiting} waiting on disk`,
          "label",
        ) +
        "</g>";
      return {
        svg: s,
        height: 490,
        state: {
          elapsed: Math.round(f.time),
          memoryReturns: hits,
          diskReturns: misses,
          diskWaiting: waiting,
          active,
        },
        status:
          "Teal circles: memory path. Orange circles: disk path; square: page fill; ring: disk wait. The animation rounds 98.7% to 99% hits. These are page accesses, not whole-query hit rates; timings are illustrative.",
      };
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
    "Reads dominate the workload and fluctuate throughout the day",
    "ILLUSTRATIVE DAY · REPORTED QUERY MIX",
    "Across three primaries, about 10,000 SELECTs run per second, with one write per 100 reads. Average query time is 0.48 ms. The daily curve and its 12,000/s peak are illustrative.",
    (f) => {
      let hour = Number(f.section.querySelector("input")?.value || 14);
      let value = (h) => 10000 + 2000 * Math.cos(((h - 14) * Math.PI) / 12),
        s = "";
      for (let v = 0; v <= 12000; v += 4000) {
        let y = 300 - (v / 12000) * 220;
        s +=
          path(
            [
              [110, y],
              [840, y],
            ],
            "subtle",
          ) + text(62, y, v.toLocaleString(), "small");
      }
      for (let h = 0; h <= 24; h += 6)
        s += text(
          110 + (h / 24) * 730,
          325,
          String(h).padStart(2, "0"),
          "small",
        );
      let pts = Array.from({ length: 97 }, (_, i) => [
        110 + (i / 96) * 730,
        300 - (value(i / 4) / 12000) * 220,
      ]);
      s +=
        `<path d="M110 300 ${pts.map((p) => "L" + p.join(" ")).join(" ")} L840 300Z" fill="${color("flow")}" fill-opacity=".09"/>` +
        path(pts, "flow") +
        text(460, 35, "SELECTs / s · 3 primaries", "label") +
        text(460, 357, "Hour", "small");
      s +=
        `<g data-traffic-cursor><path d="M0 70V300" stroke="${color("border")}" stroke-dasharray="6 5"/><circle cx="0" cy="80" r="4" fill="${color("flow")}"/></g><g data-traffic-summary>${text(460, 395, "", "label")}</g>` +
        queryFacts();
      return {
        svg: s,
        height: 540,
        state: { hour, illustrativeSelectRate: value(hour) },
        status:
          "Most requests return few rows through a primary key or indexed column. The 0.48 ms average does not describe the slowest requests. The daily curve is a model, not telemetry.",
      };
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
  phone.addEventListener("change", () => {
    for (const f of figures) {
      f.previous = null;
      f.draw(true);
    }
    wake();
  });
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
      if (f.previous !== null) f.time += now - f.previous;
      f.previous = now;
      updateMotion(f);
    }
    wake();
  }
})();
