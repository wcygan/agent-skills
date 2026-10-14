const key = document.body.dataset.case;
const model = window.systemCases[key];
let theme = matchMedia("(prefers-color-scheme: dark)").matches
  ? "dark"
  : "light";
const $ = (id) => document.getElementById(id);
const esc = (s) =>
  String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const positions = [
  [50, 100],
  [410, 100],
  [770, 100],
  [50, 320],
  [410, 320],
  [770, 320],
];
const W = 180,
  H = 78;
function label(x, y, s, size = 14, color = "text") {
  return `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="central" font-size="${size}" fill="${window.visualTokens[theme][color]}">${esc(s)}</text>`;
}
// Explicit routes keep cross-row edges out of unrelated nodes.
function route(id, a, b) {
  const [ax, ay] = positions[a],
    [bx, by] = positions[b];
  if (id === "redirect")
    return {
      points: [
        [ax + W / 2, ay],
        [ax + W / 2, 45],
        [980, 45],
        [980, by + H / 2],
        [bx + W, by + H / 2],
      ],
      label: [750, 28],
    };
  if (id === "miss")
    return {
      points: [
        [ax + W / 2, ay + H],
        [bx + W / 2, by],
      ],
      label: [ax + W / 2 - 75, 249],
    };
  if (id === "fill")
    return {
      points: [
        [bx + W / 2, by + H],
        [bx + W / 2, by + 145],
        [ax + W / 2 + 35, by + 145],
        [ax + W / 2 + 35, ay],
      ],
      label: [740, 263],
      reverse: true,
    };
  if (id === "restore")
    return {
      points: [
        [ax + W, ay + H / 2],
        [980, ay + H / 2],
        [980, 40],
        [bx + W / 2, 40],
        [bx + W / 2, by],
      ],
      label: [750, 26],
    };
  if (id === "retry")
    return {
      points: [
        [ax + W / 2, ay + H],
        [ax + W / 2, 450],
        [bx + W / 2, 450],
        [bx + W / 2, by + H],
      ],
      label: [680, 472],
    };
  if (ay === by)
    return {
      points:
        ax < bx
          ? [
              [ax + W, ay + H / 2],
              [bx, by + H / 2],
            ]
          : [
              [ax, ay + H / 2],
              [bx + W, by + H / 2],
            ],
      label: [(ax + bx + W) / 2, ay + H / 2 - 17],
    };
  if (ax === bx)
    return {
      points:
        ay < by
          ? [
              [ax + W / 2, ay + H],
              [bx + W / 2, by],
            ]
          : [
              [ax + W / 2, ay],
              [bx + W / 2, by + H],
            ],
      label: [ax + W / 2 + 5, 249],
    };
  // Diagonal relationships bend through the open center corridor.
  const from = [ax + W / 2, ay < by ? ay + H : ay],
    to = [bx + W / 2, ay < by ? by : by + H];
  return {
    points: [from, [from[0], 230], [to[0], 230], to],
    label: [(from[0] + to[0]) / 2, 211],
  };
}
function diagram() {
  const t = window.visualTokens[theme];
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 520" role="img" aria-labelledby="diagram-title diagram-desc" font-family="ui-monospace,SFMono-Regular,Consolas,monospace"><title id="diagram-title">${esc(model.title)}</title><desc id="diagram-desc">${esc(model.caption)}</desc><rect width="1000" height="520" fill="${t.surface}"/><defs>${["border", "focus"].map((role) => `<marker id="arrow-${role}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0 10 5 0 10Z" fill="${t[role]}"/></marker>`).join("")}</defs>`;
  for (const [id, a, b, name] of model.edges) {
    const role = "border";
    let { points, label: xy, reverse } = route(id, a, b);
    if (reverse) points.reverse();
    svg += `<polyline data-edge="${id}" points="${points.map((p) => p.join(",")).join(" ")}" stroke="${t[role]}" stroke-width="${role === "focus" ? 3 : 1.5}" fill="none" stroke-linejoin="round" marker-end="url(#arrow-${role})"/>`;
    // Label backing keeps text legible where a logical path passes behind it.
    const width = name.length * 7.3 + 16;
    svg +=
      `<rect x="${xy[0] - width / 2}" y="${xy[1] - 11}" width="${width}" height="22" rx="4" fill="${t.surface}"/>` +
      label(...xy, name, 12, role);
  }
  model.nodes.forEach(([title, sub, kind, category], i) => {
    const [x, y] = positions[i],
      stroke = t[category],
      fill = t[category + "Fill"];
    const attrs = `fill="${fill}" stroke="${stroke}" stroke-width="2"`;
    if (kind === "database")
      svg += `<path d="M${x} ${y + 14}C${x} ${y - 4} ${x + W} ${y - 4} ${x + W} ${y + 14}V${y + H - 12}C${x + W} ${y + H + 6} ${x} ${y + H + 6} ${x} ${y + H - 12}Z" ${attrs}/><ellipse cx="${x + W / 2}" cy="${y + 14}" rx="90" ry="14" ${attrs}/>`;
    else if (kind === "document")
      svg += `<path d="M${x} ${y}H${x + W - 18}L${x + W} ${y + 18}V${y + H}H${x}Z" ${attrs}/><path d="M${x + W - 18} ${y}v18h18" fill="none" stroke="${stroke}"/>`;
    else
      svg += `<rect x="${x}" y="${y}" width="${W}" height="${H}" rx="6" ${attrs}/>`;
    if (kind === "worker")
      svg += `<path d="M${x + 10} ${y}v${H}M${x + W - 10} ${y}v${H}" stroke="${stroke}"/>`;
    if (kind === "cache")
      svg += `<path d="M${x} ${y + 15}h${W}M${x + 30} ${y - 8}v8m60-8v8m60-8v8M${x + 30} ${y + H}v8m60-8v8m60-8v8" stroke="${stroke}"/>`;
    if (kind === "log")
      for (let j = 0; j < 4; j++)
        svg += label(x + 32 + j * 38, y + H - 12, String(40 + j), 10, "flow");
    if (kind === "queue")
      for (let j = 0; j < 4; j++)
        svg += `<rect x="${x + 20 + j * 38}" y="${y + H - 17}" width="26" height="7" fill="${t.flow}" rx="1"/>`;
    const cy =
      y +
      (kind === "database"
        ? 49
        : kind === "cache"
          ? 47
          : kind === "queue"
            ? 33
            : 39);
    svg +=
      `<g class="node-label" data-cx="${x + W / 2}" data-cy="${cy}">` +
      label(x + W / 2, cy - 9, title, 15) +
      label(x + W / 2, cy + 13, sub, 10) +
      `</g>`;
  });
  return (
    svg +
    label(
      500,
      503,
      "CONCEPTUAL MODEL · " + model.title.toUpperCase(),
      11,
      "muted",
    ) +
    "</svg>"
  );
}
function render() {
  const t = window.visualTokens[theme];
  Object.entries(t).forEach(([name, value]) =>
    document.documentElement.style.setProperty("--" + name, value),
  );
  document.documentElement.style.colorScheme = theme;
  $("theme").setAttribute("aria-pressed", String(theme === "dark"));
  $("theme").title =
    "Switch to " + (theme === "dark" ? "light" : "dark") + " theme";
  $("diagram").innerHTML = diagram();
  for (const g of document.querySelectorAll(".node-label")) {
    const b = g.getBBox();
    g.setAttribute(
      "transform",
      `translate(${Number(g.dataset.cx) - b.x - b.width / 2} ${Number(g.dataset.cy) - b.y - b.height / 2})`,
    );
  }
  $("caption").textContent = model.caption;
}
$("title").textContent = model.title;
$("intro").textContent = model.intro;
$("scope").textContent = "Scope: " + model.scope;
$("case-name").textContent = model.title;
$("question").textContent = model.question;
const brief = model.brief;
$("stories").innerHTML = brief.stories
  .map((story) => `<li>${esc(story)}</li>`)
  .join("");
$("numbers").innerHTML = brief.numbers
  .map(
    ([value, title, note]) =>
      `<article class="number-card"><p class="number-value">${esc(value)}</p><h3>${esc(title)}</h3><p>${esc(note)}</p></article>`,
  )
  .join("");
$("api").innerHTML = brief.api
  .map(
    ([endpoint, input, outcome]) =>
      `<tr><th scope="row"><code>${esc(endpoint)}</code></th><td>${esc(input)}</td><td>${esc(outcome)}</td></tr>`,
  )
  .join("");
$("entities").innerHTML = brief.entities
  .map(
    ([name, fields, role]) =>
      `<tr><th scope="row">${esc(name)}</th><td>${esc(fields)}</td><td>${esc(role)}</td></tr>`,
  )
  .join("");
$("api-contract").textContent = brief.contract;
$("architecture").innerHTML = model.architecture
  .map((p) => `<p>${esc(p)}</p>`)
  .join("");
$("bottlenecks").innerHTML = model.bottlenecks
  .map(
    ([title, pressure, response]) =>
      `<article class="bottleneck"><h3>${esc(title)}</h3><p><strong>Pressure</strong>${esc(pressure)}</p><p><strong>Scale out / contain</strong>${esc(response)}</p></article>`,
  )
  .join("");
$("notes").innerHTML = [model.tradeoff, model.scale, model.interview]
  .map(
    ([title, body]) =>
      `<article><h2>${esc(title)}</h2><p>${esc(body)}</p></article>`,
  )
  .join("");
$("sources").innerHTML = model.sources.length
  ? "References: " +
    model.sources
      .map(([title, url]) => `<a href="${esc(url)}">${esc(title)}</a>`)
      .join(" · ")
  : "Original illustrative design; assumptions are stated above.";
$("theme").onclick = () => {
  theme = theme === "dark" ? "light" : "dark";
  render();
};
$("export").onclick = () => {
  const svg = $("diagram").querySelector("svg").cloneNode(true);
  // Keep the architecture title and caption with the portable figure.
  svg.setAttribute("viewBox", "0 0 1000 620");
  svg.setAttribute("width", "1000");
  svg.setAttribute("height", "620");
  svg.querySelector("rect").setAttribute("height", "620");
  let words = model.caption.split(" "),
    lines = [""];
  words.forEach((word) => {
    let i = lines.length - 1;
    if ((lines[i] + " " + word).length > 108) lines.push(word);
    else lines[i] += (lines[i] ? " " : "") + word;
  });
  svg.insertAdjacentHTML(
    "beforeend",
    label(500, 543, model.title, 17) +
      lines.map((line, i) => label(500, 574 + i * 20, line, 13)).join(""),
  );
  const url = URL.createObjectURL(
    new Blob([new XMLSerializer().serializeToString(svg)], {
      type: "image/svg+xml",
    }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = `${key}-${theme}-architecture.svg`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};
render();
