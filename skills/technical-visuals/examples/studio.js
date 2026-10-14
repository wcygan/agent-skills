/* Fresh reference implementations. No network, build step, or animation loop. */
"use strict";
const $ = (id) => document.getElementById(id);
const esc = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (c) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&apos;",
      })[c],
  );
let theme = matchMedia("(prefers-color-scheme: dark)").matches
  ? "dark"
  : "light";
let scene = "routing",
  step = 0,
  angle = 0,
  dimension = "2d";
const models = {
  routing: {
    title: "A router selects one worker.",
    states: ["Worker A selected", "Worker B selected"],
    takeaway:
      "One request follows one selected route. Both workers remain available.",
    good: "A single reading direction and labeled fanout separate the available routes from the selected route.",
    bad: "Every route has the same strong emphasis. The selected worker is named, but visual weight does not help you find it.",
    practice:
      "Use neutral context and one focal path. Keep the unselected route visible.",
  },
  queue: {
    title: "A bounded queue makes pressure visible.",
    states: ["3 of 4 slots occupied", "4 of 4 slots occupied"],
    takeaway:
      "Waiting jobs occupy finite slots. Two workers are already active; a full queue rejects the next arrival in this toy policy.",
    good: "Slots show capacity directly. Waiting and active work have separate places and explicit labels.",
    bad: "Unstructured marks force the reader to count and interpret the label. The uneven spacing makes equivalent waiting jobs look different.",
    practice:
      "Show capacity and overflow policy together. Do not imply that every queue rejects when full.",
  },
  cache: {
    title: "A cache hit avoids the database read.",
    states: ["Cache hit", "Cache miss"],
    takeaway:
      "A hit returns the cached value. A miss reads the database; this simplified view omits the subsequent cache fill.",
    good: "Stable geometry makes hit and miss easy to compare. Numbered verbs identify the selected read path.",
    bad: "Equal-weight arrows and weak grouping make the reader reconstruct the path from the state label.",
    practice:
      "Keep before/after framing constant. State omitted behavior so simplification does not become a false guarantee.",
  },
  replication: {
    title: "Writes flow from primary to replica.",
    states: ["Write at primary", "Copy to replica"],
    takeaway:
      "The primary accepts a write, then copies it to a replica in another region. Acknowledgment policy and lag are outside this model.",
    good: "Named regions establish ownership. The arrow labels the relationship without implying synchronous acknowledgment.",
    bad: "Decoration competes with the region names and replication arrow. Depth and color do not identify a meaningful difference.",
    practice:
      "Keep topology and replication semantics distinct. Add guarantees only when the source establishes them.",
  },
  log: {
    title: "Reading a log advances a position.",
    states: ["Next offset 42", "Next offset 43"],
    takeaway:
      "The consumer advances its next-read position. The records remain in the log; retention is a separate policy.",
    good: "Offsets establish order. A labeled pointer moves while record geometry remains unchanged.",
    bad: "Equal emphasis on all records hides the next-read position even though its label is present.",
    practice:
      "Do not animate consumption as deletion unless deletion is actually the behavior being taught.",
  },
  recovery: {
    title: "Recovery starts from a checkpoint.",
    states: [
      "Checkpoint 42 saved",
      "Crash",
      "Restore checkpoint 42",
      "Replay 43–45",
    ],
    takeaway:
      "Restore the saved state, then replay later records. This toy sequence does not claim exactly-once effects.",
    good: "Four named steps establish order. The current step is emphasized without removing the recovery boundary.",
    bad: "The same steps form a crowded loop, so layout suggests a cycle rather than a clear recovery sequence.",
    practice:
      "Name the recovery point and replay range. Avoid implying delivery guarantees from a simplified sequence.",
  },
};
function c(role) {
  return window.visualTokens[theme][role];
}
function text(x, y, label, role = "text", size = 16, anchor = "middle") {
  return `<text x="${x}" y="${y}" text-anchor="${anchor}" fill="${c(role)}" font-size="${size}">${esc(label)}</text>`;
}
function rect(x, y, w, h, fill = "surface", stroke = "border", radius = 6) {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${radius}" fill="${c(fill)}" stroke="${c(stroke)}" stroke-width="1.5"/>`;
}
function labelGroup(x, y, label, role = "text", subtitle = "") {
  return `<g data-label-x="${x}" data-label-y="${y}">${text(x, y - (subtitle ? 9 : 0), label, role, 16)}${subtitle ? text(x, y + 12, subtitle, "muted", 12) : ""}</g>`;
}
function centerLabels(container) {
  for (const group of container.querySelectorAll("[data-label-x]")) {
    group.removeAttribute("transform");
    const box = group.getBBox();
    group.setAttribute(
      "transform",
      `translate(${Number(group.dataset.labelX) - box.x - box.width / 2} ${Number(group.dataset.labelY) - box.y - box.height / 2})`,
    );
  }
}
function node(x, y, w, label, active = false, subtitle = "") {
  return (
    rect(
      x,
      y,
      w,
      64,
      label === "Cache" ? "storageFill" : "processingFill",
      active ? "focus" : label === "Cache" ? "storage" : "processing",
    ) +
    (label === "Cache"
      ? `<path d="M${x} ${y + 13}h${w}M${x + 20} ${y - 8}v8m35-8v8m35-8v8M${x + 20} ${y + 64}v8m35-8v8m35-8v8" stroke="${c(active ? "focus" : "storage")}" fill="none"/>`
      : label.startsWith("Worker")
        ? `<path d="M${x + 12} ${y}v64M${x + w - 12} ${y}v64" stroke="${c(active ? "focus" : "processing")}"/>`
        : "") +
    labelGroup(
      x + w / 2,
      y + (label === "Cache" ? 39 : 32),
      label,
      active ? "focus" : "text",
      subtitle,
    )
  );
}
function database(x, y, label, active = false) {
  const stroke = active ? "focus" : "storage";
  return (
    `<path d="M${x},${y + 12} C${x},${y - 4} ${x + 130},${y - 4} ${x + 130},${y + 12} V${y + 60} C${x + 130},${y + 76} ${x},${y + 76} ${x},${y + 60} Z" fill="${c("storageFill")}" stroke="${c(stroke)}" stroke-width="1.5"/><ellipse cx="${x + 65}" cy="${y + 12}" rx="65" ry="12" fill="${c("storageFill")}" stroke="${c(stroke)}" stroke-width="1.5"/>` +
    labelGroup(x + 65, y + 42, label, active ? "focus" : "text")
  );
}
function line(points, role = "border", dashed = false, arrow = true) {
  const id = `${role}-arrow`;
  return `<polyline points="${points.map((p) => p.join(",")).join(" ")}" fill="none" stroke="${c(role)}" stroke-width="2" stroke-linejoin="round" ${dashed ? 'stroke-dasharray="6 5"' : ""} ${arrow ? `marker-end="url(#${id})"` : ""}/>`;
}
function defs() {
  return `<defs>${["border", "focus", "information", "failure"].map((role) => `<marker id="${role}-arrow" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 Z" fill="${c(role)}"/></marker>`).join("")}</defs>`;
}
function wrap(content, bad = false, spatial = false) {
  const m = models[scene],
    title = bad ? "Counterexample: " + m.title : m.title;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 400" role="img" aria-labelledby="${bad ? "bad" : "good"}-title ${bad ? "bad" : "good"}-desc" font-family="ui-monospace, SFMono-Regular, Consolas, monospace"><title id="${bad ? "bad" : "good"}-title">${esc(title)}</title><desc id="${bad ? "bad" : "good"}-desc">${esc(m.states[step] + ". " + m.takeaway)}</desc>${defs()}<rect width="960" height="400" fill="${c("surface")}"/>${text(32, 36, m.states[step], bad ? "muted" : "focus", 14, "start")}${content}${text(32, 370, spatial ? "Depth groups regions · conceptual model" : "Conceptual model · " + scene, "muted", 12, "start")}</svg>`;
}
function draw2d(bad = false) {
  let s = "",
    emphasis = bad ? "information" : "focus";
  if (scene === "routing") {
    s += line(
      [
        [210, 192],
        [350, 192],
      ],
      bad ? "information" : "border",
    );
    s += line(
      [
        [490, 192],
        [560, 192],
      ],
      bad ? "information" : "focus",
      false,
      false,
    );
    s += line(
      [
        [560, 192],
        [560, 122],
        [690, 122],
      ],
      bad ? "information" : step === 0 ? emphasis : "border",
    );
    s += line(
      [
        [560, 192],
        [560, 262],
        [690, 262],
      ],
      bad ? "information" : step === 1 ? emphasis : "border",
    );
    s +=
      node(70, 160, 140, "Client") +
      node(350, 160, 140, "Router") +
      node(690, 90, 170, "Worker A", !bad && step === 0) +
      node(690, 230, 170, "Worker B", !bad && step === 1);
    s +=
      text(280, 178, "request", "muted", 13) +
      text(625, 108, "dispatch", "muted", 13) +
      text(625, 248, "dispatch", "muted", 13);
  } else if (scene === "queue") {
    s += node(45, 165, 135, "Producer");
    s += line(
      [
        [180, 197],
        [270, 197],
      ],
      "border",
    );
    s += rect(270, 145, 340, 104, "raised");
    const count = step === 0 ? 3 : 4;
    for (let i = 0; i < 4; i++) {
      const y = bad ? 165 + (i % 2) * 18 : 174;
      s += rect(
        294 + i * 76,
        y,
        56,
        48,
        i < count ? "surface" : "raised",
        i < count ? (bad ? "information" : "warning") : "border",
        3,
      );
      if (i < count)
        s += text(
          322 + i * 76,
          y + 30,
          "J" + (i + 1),
          bad ? "information" : "warning",
          15,
        );
    }
    s += text(440, 125, `${count}/4 waiting slots`, "muted", 14);
    s +=
      line(
        [
          [610, 197],
          [655, 197],
          [655, 120],
          [730, 120],
        ],
        "border",
      ) +
      line(
        [
          [655, 197],
          [655, 274],
          [730, 274],
        ],
        "border",
      );
    s +=
      node(730, 88, 180, "Worker A", false, "active J0") +
      node(730, 242, 180, "Worker B", false, "active J−1");
    if (step === 1)
      s += text(440, 298, "Next arrival: rejected", "failure", 16);
    else s += text(440, 298, "One waiting slot available", "muted", 16);
  } else if (scene === "cache") {
    s +=
      line(
        [
          [230, 194],
          [400, 194],
        ],
        bad ? "information" : emphasis,
      ) +
      line(
        [
          [550, 194],
          [710, 194],
        ],
        bad ? "information" : step === 1 ? emphasis : "border",
      );
    s +=
      node(70, 162, 160, "App", false) +
      node(400, 162, 150, "Cache", !bad && step === 0) +
      database(710, 156, "Database", !bad && step === 1);
    s +=
      text(315, 174, "1. lookup", "muted", 14) +
      text(630, 174, "2. read on miss", "muted", 13);
    s += text(
      480,
      285,
      step === 0 ? "HIT → cached value" : "MISS → database value",
      bad ? "muted" : "focus",
      18,
    );
  } else if (scene === "replication") {
    s +=
      rect(100, 100, 280, 210, "raised", "subtle") +
      rect(580, 100, 280, 210, "raised", "subtle");
    s +=
      text(240, 133, "Region A", "muted", 14) +
      text(720, 133, "Region B", "muted", 14);
    s += line(
      [
        [305, 212],
        [655, 212],
      ],
      bad ? "information" : step === 1 ? emphasis : "border",
    );
    s +=
      database(175, 180, "Primary", !bad && step === 0) +
      database(655, 180, "Replica", !bad && step === 1);
    s += text(480, 192, "replicate write", "muted", 14);
    if (bad) {
      s += `<circle cx="240" cy="212" r="96" fill="none" stroke="${c("information")}" stroke-width="6"/><circle cx="720" cy="212" r="96" fill="none" stroke="${c("information")}" stroke-width="6"/>`;
    }
  } else if (scene === "log") {
    s += rect(130, 145, 700, 98, "raised", "subtle");
    for (let i = 0; i < 6; i++) {
      const active = i === step + 2;
      s +=
        rect(
          154 + i * 110,
          164,
          90,
          60,
          "surface",
          bad ? "information" : active ? "focus" : "border",
          3,
        ) +
        text(
          199 + i * 110,
          200,
          String(40 + i),
          !bad && active ? "focus" : "text",
          18,
        );
    }
    const px = 199 + (step + 2) * 110;
    s +=
      line(
        [
          [px, 310],
          [px, 224],
        ],
        bad ? "information" : "focus",
      ) + text(px, 336, "next read", "muted", 14);
    s += text(480, 125, "Offsets · records retained", "muted", 14);
  } else {
    const labels = ["Save 42", "Crash", "Restore 42", "Replay 43–45"];
    const locations = bad
      ? [
          [170, 110],
          [560, 240],
          [350, 240],
          [660, 110],
        ]
      : [
          [50, 170],
          [275, 170],
          [500, 170],
          [725, 170],
        ];
    for (let i = 0; i < 3; i++) {
      const [x, y] = locations[i],
        [nx, ny] = locations[i + 1];
      s += line(
        [
          [x + 180, y + 32],
          [nx, ny + 32],
        ],
        bad ? "information" : "border",
      );
    }
    locations.forEach(([x, y], i) => {
      s +=
        node(x, y, 180, labels[i], !bad && i === step) +
        text(
          x + 90,
          y - 16,
          `0${i + 1}`,
          bad ? "muted" : i === step ? "focus" : "muted",
          14,
        );
    });
  }
  return wrap(s, bad);
}
// A bounded orthographic camera; world coordinates are x, depth z, and height h.
function project(x, z, h) {
  const azimuth = ((30 + angle) * Math.PI) / 180,
    elevation = (25 * Math.PI) / 180;
  return [
    480 + x * Math.cos(azimuth) + z * Math.sin(azimuth),
    235 +
      x * Math.sin(azimuth) * Math.sin(elevation) -
      z * Math.cos(azimuth) * Math.sin(elevation) -
      h * Math.cos(elevation),
  ];
}
function polygon(points, fill = "raised", stroke = "border") {
  return `<polygon points="${points.map((p) => p.join(",")).join(" ")}" fill="${c(fill)}" stroke="${c(stroke)}" stroke-width="1.5"/>`;
}
function spatialDatabase(x, label, active) {
  const [cx, cy] = project(x, 0, 0),
    [, top] = project(x, 0, 90),
    radius = 52,
    ry = radius * Math.sin((25 * Math.PI) / 180),
    stroke = active ? "focus" : "border";
  return (
    `<path d="M${cx - radius},${top} L${cx - radius},${cy} A${radius},${ry} 0 0 0 ${cx + radius},${cy} L${cx + radius},${top} Z" fill="${c("surface")}" stroke="${c(stroke)}" stroke-width="1.5"/><ellipse cx="${cx}" cy="${top}" rx="${radius}" ry="${ry}" fill="${c("surface")}" stroke="${c(stroke)}" stroke-width="1.5"/>` +
    text(cx, (cy + top) / 2 + 6, label, active ? "focus" : "text", 15)
  );
}
function draw3d(bad = false) {
  let s = "";
  const depth = bad ? 240 : 170;
  // Region planes are on the ground. Cylinders have their bases on that plane.
  for (const x of [-240, 240]) {
    s += polygon(
      [
        project(x - 125, -depth / 2, 0),
        project(x + 125, -depth / 2, 0),
        project(x + 125, depth / 2, 0),
        project(x - 125, depth / 2, 0),
      ],
      "raised",
      "border",
    );
    const label = project(x, -depth / 2, 0);
    s += text(
      label[0],
      label[1] + 32,
      x < 0 ? "Region A" : "Region B",
      "muted",
      14,
    );
  }
  const azimuth = ((30 + angle) * Math.PI) / 180,
    dx = 52 * Math.cos(azimuth),
    dz = 52 * Math.sin(azimuth);
  const a = project(-240 + dx, dz, 45),
    b = project(240 - dx, -dz, 45);
  s +=
    line([a, b], bad ? "information" : step === 1 ? "focus" : "border") +
    text(
      (a[0] + b[0]) / 2,
      (a[1] + b[1]) / 2 - (18 + Math.abs((b[1] - a[1]) / (b[0] - a[0])) * 70),
      "replicate write",
      "muted",
      14,
    );
  s +=
    spatialDatabase(-240, "Primary", !bad && step === 0) +
    spatialDatabase(240, "Replica", !bad && step === 1);
  if (bad) {
    s += polygon(
      [
        [400, 130],
        [510, 110],
        [550, 290],
        [440, 310],
      ],
      "raised",
      "information",
    );
    s += text(480, 100, "decorative plane", "muted", 12);
  }
  return wrap(s, bad, true);
}
function render() {
  const m = models[scene];
  $("export-status").textContent = "";
  document.documentElement.style.colorScheme = theme;
  Object.entries(window.visualTokens[theme]).forEach(([key, value]) =>
    document.documentElement.style.setProperty("--" + key, value),
  );
  document.documentElement.dataset.theme = theme;
  $("theme").setAttribute("aria-pressed", String(theme === "dark"));
  $("theme").title = `Switch to ${theme === "dark" ? "light" : "dark"} theme`;
  $("scenario").value = scene;
  $("dimension").value = dimension;
  $("figure-heading").textContent = m.title;
  $("takeaway").textContent = m.takeaway;
  $("good-reason").textContent = m.good;
  $("bad-reason").textContent =
    dimension === "3d"
      ? "An unrelated foreground plane hides the replication route. The same relationship exists, but the drawing makes it hard to follow."
      : m.bad;
  $("practice").textContent = m.practice;
  $("state").textContent = `${step + 1}/${m.states.length} · ${m.states[step]}`;
  $("previous").disabled = step === 0;
  $("next").disabled = step === m.states.length - 1;
  $("camera-controls").hidden = dimension !== "3d";
  $("orbit-left").disabled = angle <= -20;
  $("orbit-right").disabled = angle >= 20;
  $("good-figure").innerHTML = dimension === "3d" ? draw3d() : draw2d();
  $("bad-figure").innerHTML = dimension === "3d" ? draw3d(true) : draw2d(true);
  $("swatches").innerHTML = [
    "processing",
    "storage",
    "flow",
    "control",
    "focus",
    "success",
    "warning",
    "failure",
    "information",
    "border",
  ]
    .map(
      (role) =>
        `<div class="swatch"><span style="background:${c(role)}"></span>${role}<br>${c(role)}</div>`,
    )
    .join("");
  centerLabels($("good-figure"));
  centerLabels($("bad-figure"));
  window.renderShapeLibrary(theme);
  centerLabels($("shape-groups"));
  // SVG marker IDs must be unique across the two inline figures.
  const badSvg = $("bad-figure").querySelector("svg");
  badSvg.innerHTML = badSvg.innerHTML
    .replaceAll(
      /id="(border|focus|information|failure)-arrow"/g,
      'id="bad-$1-arrow"',
    )
    .replaceAll(
      /url\(#(border|focus|information|failure)-arrow\)/g,
      "url(#bad-$1-arrow)",
    );
}
$("theme").addEventListener("click", () => {
  theme = theme === "dark" ? "light" : "dark";
  render();
});
$("scenario").addEventListener("change", (event) => {
  scene = event.target.value;
  step = 0;
  angle = 0;
  if (scene !== "replication") dimension = "2d";
  render();
});
$("dimension").addEventListener("change", (event) => {
  dimension = event.target.value;
  if (dimension === "3d" && scene !== "replication") {
    scene = "replication";
    step = 0;
  }
  angle = 0;
  render();
});
$("previous").addEventListener("click", () => {
  step = Math.max(0, step - 1);
  render();
});
$("next").addEventListener("click", () => {
  step = Math.min(models[scene].states.length - 1, step + 1);
  render();
});
$("reset").addEventListener("click", () => {
  step = 0;
  angle = 0;
  render();
});
$("orbit-left").addEventListener("click", () => {
  angle = Math.max(-20, angle - 10);
  render();
});
$("orbit-right").addEventListener("click", () => {
  angle = Math.min(20, angle + 10);
  render();
});
$("camera-reset").addEventListener("click", () => {
  angle = 0;
  render();
});
function exportSource() {
  const svg = $("good-figure").querySelector("svg").cloneNode(true);
  svg.setAttribute("width", "960");
  svg.setAttribute("height", "460");
  svg.setAttribute("viewBox", "0 0 960 460");
  svg.querySelector("rect").setAttribute("height", "460");
  // Two explicit caption lines keep exports independent of the surrounding HTML.
  const words = models[scene].takeaway.split(" ");
  let rows = [""];
  for (const word of words) {
    if ((rows.at(-1) + " " + word).length > 100) rows.push(word);
    else rows[rows.length - 1] += (rows.at(-1) ? " " : "") + word;
  }
  rows.forEach((row, i) =>
    svg.insertAdjacentHTML(
      "beforeend",
      text(32, 407 + i * 20, row, "muted", 13, "start"),
    ),
  );
  return new XMLSerializer().serializeToString(svg);
}
function exportIdentity() {
  return {
    name: `${scene}-${dimension}-${theme}-step-${step + 1}`,
    label: models[scene].states[step],
    theme,
  };
}
function save(blob, extension, artifact = exportIdentity()) {
  const url = URL.createObjectURL(blob),
    anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${artifact.name}.${extension}`;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  $("export-status").textContent =
    `Saved ${extension.toUpperCase()} · ${artifact.label} · ${artifact.theme}.`;
}
$("export-svg").addEventListener("click", () =>
  save(new Blob([exportSource()], { type: "image/svg+xml" }), "svg"),
);
$("export-png").addEventListener("click", async () => {
  const artifact = exportIdentity();
  const button = $("export-png");
  button.disabled = true;
  const url = URL.createObjectURL(
    new Blob([exportSource()], { type: "image/svg+xml" }),
  );
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    const canvas = document.createElement("canvas");
    canvas.width = 1920;
    canvas.height = 920;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(image, 0, 0, 1920, 920);
    const blob = await new Promise((resolve) =>
      canvas.toBlob(resolve, "image/png"),
    );
    if (!blob) throw new Error("PNG encoding failed");
    save(blob, "png", artifact);
  } catch (error) {
    $("export-status").textContent = `Export failed: ${error.message}`;
  } finally {
    URL.revokeObjectURL(url);
    button.disabled = false;
  }
});
render();
