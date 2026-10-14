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
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="${color(role + "Fill")}" stroke="${color(role)}" stroke-width="1.6"/>${text(x + w / 2, y + h / 2 - (sub ? 10 : 0), label, "label")}${sub ? text(x + w / 2, y + h / 2 + 15, sub, "small") : ""}`;
  const database = (x, y, w, h, label) =>
    `<path d="M${x} ${y + 7}V${y + h - 7}a${w / 2} 7 0 0 0 ${w} 0V${y + 7}" fill="${color("storageFill")}" stroke="${color("storage")}" stroke-width="1.6"/><ellipse cx="${x + w / 2}" cy="${y + 7}" rx="${w / 2}" ry="7" fill="${color("storageFill")}" stroke="${color("storage")}" stroke-width="1.6"/>${text(x + w / 2, y + h / 2 + 5, label, "label")}`;
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
  const figures = [];
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
    section.dataset.sourceComponent = component;
    section.innerHTML = `<div class="visual-heading"><p class="eyebrow">${kind}</p><h2>${title}</h2><p>${caption}</p></div><div class="controls">${animated ? '<button data-action="play">Play</button><button data-action="step">Step</button><button data-action="reset">Reset</button>' : ""}${extra}<button data-action="export">Save SVG</button></div><div class="stage" tabindex="0" role="region" aria-label="${title}; scroll horizontally on narrow screens"></div><div class="result"><p role="status"></p></div>`;
    document.querySelector("#figures").append(section);
    const f = {
      id,
      section,
      time: 0,
      playing: false,
      visible: false,
      render,
      animated,
    };
    figures.push(f);
    f.draw = () => {
      let r = render(f);
      section.dataset.state = JSON.stringify(
        r.state ?? { time: Math.round(f.time) },
      );
      section.querySelector(".stage").innerHTML =
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 920 ${r.height || 390}" role="img" aria-label="${title}"><title>${title}</title><rect width="920" height="${r.height || 390}" fill="${color("surface")}"/><defs><marker id="arrow" viewBox="0 0 8 8" refX="8" refY="4" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0L8 4L0 8" fill="${color("border")}"/></marker></defs>${r.svg}</svg>`;
      section.querySelector("[role=status]").textContent = r.status;
    };
    section.addEventListener("click", (e) => {
      const a = e.target.dataset.action;
      if (a === "play") {
        f.playing = !f.playing;
        e.target.textContent = f.playing ? "Pause" : "Play";
      }
      if (a === "step") {
        f.playing = false;
        f.time += 500;
        section.querySelector("[data-action=play]").textContent = "Play";
        f.draw();
      }
      if (a === "reset") {
        f.time = 0;
        f.playing = false;
        section.querySelector("[data-action=play]").textContent = "Play";
        f.draw();
      }
      if (a === "export") {
        let svg = section.querySelector("svg").cloneNode(true);
        svg.querySelectorAll("text").forEach((n) => {
          let s = getComputedStyle(
            section.querySelectorAll("text")[
              [...svg.querySelectorAll("text")].indexOf(n)
            ],
          );
          n.setAttribute("fill", s.fill);
          n.setAttribute("font-family", "system-ui, sans-serif");
          n.setAttribute("font-size", s.fontSize);
          n.setAttribute("font-weight", s.fontWeight);
          n.setAttribute("text-anchor", "middle");
          n.setAttribute("dominant-baseline", "middle");
        });
        let url = URL.createObjectURL(
          new Blob([new XMLSerializer().serializeToString(svg)], {
            type: "image/svg+xml",
          }),
        );
        let a = document.createElement("a");
        a.href = url;
        a.download = id + "-" + theme + ".svg";
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      }
    });
    f.draw();
    return f;
  }
  add(
    "regions",
    "BigDatabaseRegionsFigure",
    "Three regions, nine instances",
    "REPORTED TOPOLOGY",
    "Each region has one primary and two local replicas. Primaries exchange changes across regions.",
    () => {
      let s = "";
      [170, 460, 750].forEach((x, i) => {
        s +=
          `<rect x="${x - 120}" y="55" width="240" height="315" rx="10" fill="none" stroke="${color("subtle")}" stroke-dasharray="5 5"/>` +
          text(x, 80, "Region " + String.fromCharCode(65 + i), "label");
        s +=
          path(
            [
              [x, 180],
              [x, 210],
              [x - 90, 210],
              [x - 90, 320],
              [x - 75, 320],
            ],
            "flow",
            false,
            true,
          ) +
          path(
            [
              [x - 90, 235],
              [x - 75, 235],
            ],
            "flow",
            false,
            true,
          );
        s +=
          database(x - 75, 120, 150, 60, "Primary") +
          database(x - 75, 215, 150, 42, "Replica 1") +
          database(x - 75, 300, 150, 42, "Replica 2");
      });
      s +=
        path(
          [
            [245, 150],
            [385, 150],
          ],
          "control",
          true,
        ) +
        path(
          [
            [535, 150],
            [675, 150],
          ],
          "control",
          true,
        ) +
        path(
          [
            [95, 150],
            [30, 150],
            [30, 30],
            [890, 30],
            [890, 150],
            [825, 150],
          ],
          "control",
          true,
        );
      s +=
        text(315, 130, "↔ changes", "small") +
        text(605, 130, "↔ changes", "small") +
        text(460, 12, "↔ cross-region changes ↔", "small");
      return {
        svg: s,
        height: 400,
        state: { primaries: 3, replicas: 6 },
        status:
          "Dashed rose links: exchanges between primaries. Solid teal arrows: replication to local replicas. No application routing or consistency guarantee is depicted.",
      };
    },
  );
  add(
    "hardware",
    "BigDatabaseHardwareFigure",
    "A substantial machine; a smaller cache",
    "REPORTED PER INSTANCE",
    "Binary capacities: GiB and TiB. CPU utilization is aggregate capacity, not a per-core activity map.",
    () => {
      let s =
        text(110, 80, "CPU", "label") +
        text(110, 182, "RAM", "label") +
        text(110, 302, "DISK", "label");
      s += text(550, 35, "32 cores · 5% aggregate utilization", "label");
      for (let i = 0; i < 32; i++) {
        s += `<rect x="${230 + i * 19}" y="65" width="14" height="30" fill="${color("raised")}" stroke="${color("border")}"/>`;
        if (i < 2)
          s += `<rect x="${230 + i * 19}" y="65" width="${14 * Math.min(1, 1.6 - i)}" height="30" fill="${color("processing")}"/>`;
      }
      s +=
        text(530, 135, "≈238 GiB RAM", "label") +
        box(230, 160, 610, 44, "", "storage") +
        `<rect x="230" y="160" width="256" height="44" rx="5" fill="${color("storage")}"/>` +
        text(360, 225, "100 GiB buffer pool", "small") +
        text(670, 225, "Other memory uses", "small");
      s +=
        text(530, 260, "≈75% of disk used", "label") +
        `<rect x="230" y="285" width="610" height="34" fill="${color("raised")}" stroke="${color("border")}"/><rect x="230" y="285" width="457.5" height="34" fill="${color("storage")}"/>` +
        text(420, 343, "Includes 14.8 TiB dataset + other usage", "small") +
        text(760, 343, "≈6.1 TiB free", "small");
      return {
        svg: s,
        height: 380,
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
    "The active pages fit comfortably",
    "REPORTED CAPACITY · ESTIMATED WORKING SET",
    "Two weeks of recent row and index pages, plus upper index levels: about 33–56 GiB. The observation is 98.7% page hits; this estimate explains why it is plausible.",
    () => {
      let s = text(460, 40, "100 GiB buffer pool", "label");
      s +=
        `<rect x="100" y="70" width="720" height="65" rx="6" fill="${color("raised")}" stroke="${color("border")}"/><rect x="100" y="70" width="237.6" height="65" fill="${color("storageFill")}"/><rect x="337.6" y="70" width="165.6" height="65" fill="${color("flowFill")}" stroke="${color("flow")}" stroke-dasharray="4 4"/>` +
        text(220, 102, "33 GiB") +
        text(420, 102, "to 56 GiB") +
        text(660, 102, "44 GiB beyond upper estimate");
      s +=
        text(460, 185, "14.8 TiB stored data = 15,155.2 GiB", "label") +
        `<rect x="100" y="215" width="720" height="36" fill="${color("raised")}" stroke="${color("border")}"/><rect x="100" y="215" width="${(720 * 100) / (14.8 * 1024)}" height="36" fill="${color("storage")}"/>` +
        path(
          [
            [103, 251],
            [103, 280],
            [250, 280],
          ],
          "storage",
        ) +
        text(465, 280, "100 GiB pool ≈ 0.66% of stored data", "label");
      return {
        svg: s,
        height: 330,
        state: { estimate: [33, 56], pool: 100, storedGiB: 15155.2 },
        status:
          "The bars use different scales, labeled above each bar. 99.96% of rows changed last week were created in the last 12 days; this is not a fraction of all stored rows.",
      };
    },
  );
  const leaves = [130, 250, 370, 550, 670, 790];
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
    "BigDatabaseIncreasingIdsFigure",
    "Reads keep returning to the recent edge",
    "ILLUSTRATIVE READ DESTINATIONS",
    "Increasing primary keys place newer clustered-index rows toward the right. Play follows reads through routing pages to recent leaves; the 5/25/70 shares are an illustrative sample.",
    (f) => {
      let s = "",
        counts = [0, 0, 0],
        found = new Set();
      s +=
        path([
          [460, 90],
          [460, 115],
          [250, 115],
          [250, 155],
        ]) +
        path([
          [460, 115],
          [670, 115],
          [670, 155],
        ]);
      leaves.forEach(
        (x, i) =>
          (s += path([
            [i < 3 ? 250 : 670, 195],
            [i < 3 ? 250 : 670, 225],
            [x, 225],
            [x, 260],
          ])),
      );
      s +=
        box(390, 40, 140, 50, "Root") +
        box(180, 155, 140, 40, "Older range") +
        box(600, 155, 140, 40, "Recent range");
      const last = Math.floor(f.time / 400);
      const completed = Math.max(0, Math.floor((f.time - 1800) / 400) + 1),
        cycles = Math.floor(completed / 100);
      counts = [cycles * 5, cycles * 25, cycles * 70];
      for (let i = 0; i < completed % 100; i++) counts[targets[i] - 3]++;
      let packets = "";
      for (
        let id = Math.max(0, Math.floor((f.time - 2450) / 400));
        id <= last;
        id++
      ) {
        let age = f.time - id * 400,
          leaf = targets[id % 100];
        if (age >= 1800 && age < 2450) found.add(leaf);
        if (age < 1800) {
          const p = point(
            [
              [460, 90],
              [460, 115],
              [670, 115],
              [670, 225],
              [leaves[leaf], 225],
              [leaves[leaf], 260],
            ],
            age / 1800,
          );
          packets += `<g data-target-leaf="${leaf}">${dot(...p)}</g>`;
        }
      }
      leaves.forEach((x, i) => {
        s += box(
          x - 48,
          260,
          96,
          60,
          i < 3 ? "History" : [5, 25, 70][i - 3] + "%",
          "storage",
          i < 3 ? "cold / rare" : "recent / hot",
        );
        if (i >= 3)
          s += `<path d="M${x - 38} 266h76" stroke="${color("focus")}" stroke-width="3"/>`;
        if (found.has(i))
          s += `<rect x="${x - 51}" y="257" width="102" height="66" rx="7" fill="none" stroke="${color("success")}" stroke-width="3"/>`;
      });
      s +=
        packets +
        path(
          [
            [100, 365],
            [820, 365],
          ],
          "border",
          false,
          true,
        ) +
        text(225, 395, "Lower IDs · older rows", "small") +
        text(700, 395, "Higher IDs · newer rows", "small");
      return {
        svg: s,
        height: 435,
        state: { elapsed: Math.round(f.time), completedByRecentLeaf: counts },
        status: `Completed illustrative reads at recent leaves: ${counts.join(" / ")}. Green outlines mark pages just found. Secondary indexes follow their own key order; they are not necessarily append-only.`,
      };
    },
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
    "Most page requests turn around in RAM",
    "OBSERVED 98.7% HITS · ILLUSTRATIVE 99/1 ANIMATION",
    "Eight concurrent lanes carry page requests from the application. A memory hit returns quickly. A miss visits disk, waits, fills the buffer pool, then returns.",
    (f) => {
      let s =
        `<rect x="370" y="30" width="500" height="380" rx="10" fill="none" stroke="${color("subtle")}"/>` +
        text(620, 55, "MYSQL INSTANCE", "small");
      s +=
        box(50, 100, 180, 210, "Application", "processing") +
        box(
          410,
          100,
          220,
          210,
          "Buffer pool",
          "storage",
          "100 GiB · fast path",
        ) +
        box(700, 270, 140, 100, "Disk / SSD", "storage", "14.8 TiB stored");
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
        ) + text(752, 222, "miss → disk", "small");
      let hits = 0,
        misses = 0,
        waiting = 0,
        active = [];
      const cycle = Math.floor(f.time / 18000);
      hits = Math.max(0, cycle - 1) * 297;
      misses = Math.max(0, cycle - 1) * 3;
      for (let c = Math.max(0, cycle - 1); c <= cycle; c++) {
        for (const r of cacheReads) {
          let id = c * 300 + r.id,
            age = f.time - id * 60;
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
          active.push({ id, phase, miss: r.miss });
          s += `<g data-phase="${phase}" data-miss="${r.miss}">${phase === "fill" ? `<rect x="${p[0] - 6}" y="${p[1] - 7}" width="12" height="14" fill="${color("focus")}"/>` : dot(...p, r.miss)}${phase === "wait" ? `<circle cx="${p[0]}" cy="${p[1]}" r="13" fill="none" stroke="${color("focus")}"/>` : ""}</g>`;
        }
      }
      s += text(
        460,
        455,
        `${hits} memory returns   ·   ${misses} disk returns   ·   ${waiting} waiting on disk`,
        "label",
      );
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
    "Small indexed queries, mostly reads",
    "REPORTED AGGREGATES · ILLUSTRATIVE DAILY CURVE",
    "Across all three primaries: about 10,000 SELECTs/s, one write per 100 reads, and 0.48 ms average query time. The daily shape and 12,000/s peak below are illustrative.",
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
        path(pts, "flow") +
        text(
          460,
          35,
          "SELECT statements / second · three primaries combined",
          "label",
        ) +
        text(460, 357, "Hour of day", "small");
      let x = 110 + (hour / 24) * 730,
        y = 300 - (value(hour) / 12000) * 220;
      s +=
        path(
          [
            [x, 70],
            [x, 300],
          ],
          "border",
          true,
        ) +
        dot(x, y) +
        text(
          460,
          395,
          `${hour.toFixed(2)} h → ${Math.round(value(hour)).toLocaleString()} SELECTs/s in this model`,
          "label",
        );
      return {
        svg: s,
        height: 430,
        state: { hour, illustrativeSelectRate: value(hour) },
        status:
          "Most requests return few rows through a primary key or indexed column. The 0.48 ms average does not describe the slowest requests. The daily curve is a model, not telemetry.",
      };
    },
    false,
    '<label>Hour <input type="range" min="0" max="24" step="0.25" value="14" aria-label="Hour of day"></label>',
  );
  traffic.section.querySelector("input").oninput = () => traffic.draw();
  const depthLevels = [
    { y: 55, x: [460], selected: 460 },
    { y: 155, x: [300, 650], selected: 650 },
    { y: 255, x: [220, 380, 570, 730], selected: 730 },
    { y: 355, x: [180, 260, 340, 420, 530, 610, 690, 770], selected: 770 },
  ];
  add(
    "tree-depth",
    "BigDatabaseTreeDepthFigure",
    "Four levels can address 100 billion rows",
    "ILLUSTRATIVE CAPACITY · NOT MEASURED TABLE DEPTH",
    "1,000 child pointers per routing page × 1,000 × 1,000 × 100 rows per leaf = 100 billion rows. Only a few branches are drawn.",
    (f) => {
      let time = f.time % 6500,
        level = Math.min(3, Math.floor(time / 1500)),
        s =
          `<rect x="145" y="18" width="690" height="278" rx="10" fill="none" stroke="${color("storage")}" stroke-dasharray="5 5"/>` +
          text(745, 40, "Cached routing pages", "small");
      depthLevels.slice(1).forEach((l, i) =>
        l.x.forEach((x, j) => {
          let px = depthLevels[i].x[Math.floor(j / 2)];
          s += path([
            [px, depthLevels[i].y + 19],
            [px, l.y - 50],
            [x, l.y - 50],
            [x, l.y - 19],
          ]);
        }),
      );
      depthLevels.forEach((l, i) => {
        s += text(
          80,
          l.y,
          ["1 · Root", "2 · Route", "3 · Route", "4 · Leaf"][i],
          "label",
        );
        l.x.forEach((x) => {
          const page = box(
            x - 30,
            l.y - 19,
            60,
            38,
            i === 3 ? (x === l.selected ? "hot" : "rows") : "page",
            "storage",
          );
          s +=
            i === 3 && x !== l.selected
              ? page.replace(color("storageFill"), color("surface"))
              : page;
          if (i === 3 && x === l.selected)
            s += `<path d="M${x - 23} ${l.y - 14}h46" stroke="${color("focus")}" stroke-width="3"/>`;
          if (x === l.selected && i <= level)
            s += `<rect x="${x - 33}" y="${l.y - 22}" width="66" height="44" rx="7" fill="none" stroke="${color("success")}" stroke-width="3"/>`;
        });
      });
      if (level < 3) {
        let a = depthLevels[level],
          b = depthLevels[level + 1],
          p = point(
            [
              [a.selected, a.y + 19],
              [a.selected, b.y - 50],
              [b.selected, b.y - 50],
              [b.selected, b.y - 19],
            ],
            Math.max(0, ((time % 1500) - 500) / 1000),
          );
        s += dot(...p);
      }
      s += text(
        460,
        415,
        "Three cached routing pages + one cached hot leaf",
        "label",
      );
      return {
        svg: s,
        height: 450,
        state: {
          elapsed: Math.round(f.time),
          level: level + 1,
          visitedPages: level + 1,
        },
        status:
          [
            "The cached root chooses a branch.",
            "A cached routing page narrows the key range.",
            "A cached routing page chooses the leaf.",
            "Read the row from the cached hot leaf: no disk page needed in this example.",
          ][level] +
          " Actual depth depends on key width and page occupancy. A non-covering secondary lookup may also traverse the clustered index.",
      };
    },
    true,
  );
  function setTheme() {
    for (const [k, v] of Object.entries(window.visualTokens[theme]))
      document.documentElement.style.setProperty("--" + k, v);
    document.documentElement.style.colorScheme = theme;
    document.documentElement.dataset.theme = theme;
    document
      .querySelector("#theme")
      .setAttribute("aria-pressed", String(theme === "dark"));
    figures.forEach((f) => f.draw());
  }
  document.querySelector("#theme").onclick = () => {
    theme = theme === "dark" ? "light" : "dark";
    localStorage.setItem("visual-lab-theme", theme);
    setTheme();
  };
  setTheme();
  const observer = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        let f = figures.find((f) => f.section === e.target);
        f.visible = e.isIntersecting;
      }),
    { threshold: 0.05 },
  );
  figures.forEach((f) => observer.observe(f.section));
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  reduced.addEventListener("change", () => {
    if (reduced.matches)
      figures
        .filter((f) => f.animated)
        .forEach((f) => {
          f.playing = false;
          f.section.querySelector("[data-action=play]").textContent = "Play";
        });
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden)
      figures
        .filter((f) => f.animated)
        .forEach((f) => {
          f.playing = false;
          f.section.querySelector("[data-action=play]").textContent = "Play";
        });
  });
  let previous = 0;
  function tick(now) {
    let dt = Math.min(now - previous, 80);
    previous = now;
    if (!document.hidden)
      figures.forEach((f) => {
        if (f.playing && f.visible) {
          f.time += dt;
          f.draw();
        }
      });
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();
