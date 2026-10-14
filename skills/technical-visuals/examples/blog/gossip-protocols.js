(() => {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  let theme =
    localStorage.getItem("visual-lab-theme") ||
    (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  let t;
  const sections = [...document.querySelectorAll("[data-figure]")];
  const models = [
    { turn: 0, infected: new Set([14]), edges: [], seed: 1947 },
    { count: 0 },
  ];
  const timers = [null, null];
  const playing = [false, false];
  const positions = {
    A: [330, 140],
    B: [700, 140],
    C: [700, 360],
    D: [330, 360],
    E: [100, 250],
  };
  const exchanges = [
    ["E", "A"],
    ["A", "B"],
    ["B", "C"],
    ["A", "D"],
  ];
  const labels = [
    "Existing cluster · A–D know one another. E has not joined.",
    "E arrives · it needs an initial peer to contact.",
    "E → A · first contact introduces E to seed A.",
    "A → B · an ordinary peer learns that E joined.",
    "B → C · B now forwards the same membership information.",
    "A → D · all five nodes now know E. The cluster has converged.",
  ];
  const text = (x, y, value, size = 15, color = t.text) =>
    `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="middle" font-size="${size}" fill="${color}">${value}</text>`;
  const line = (a, b, color = t.border, dash = "") =>
    `<path d="M${a} L${b}" fill="none" stroke="${color}" stroke-width="2" ${dash ? 'stroke-dasharray="6 6"' : ""}/>`;
  function packet(a, b, animate) {
    return animate && !reduced.matches
      ? `<circle r="6" fill="${t.flow}" stroke="${t.surface}" stroke-width="2"><animateMotion dur="${0.8 / Number(document.querySelector("#speed").value)}s" path="M${a} L${b}" fill="freeze"/></circle>`
      : "";
  }
  function svg(title, content) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 490" role="img" aria-label="${title}"><title>${title}</title><rect width="1000" height="490" fill="${t.surface}"/><g font-family="system-ui, sans-serif">${content}</g></svg>`;
  }
  function epidemic(animate) {
    const s = models[0],
      point = (i) => [95 + (i % 6) * 65, 65 + Math.floor(i / 6) * 65];
    let content =
      `<rect x="525" y="34" width="410" height="397" rx="10" fill="${t.canvas}"/>` +
      text(730, 70, "LOCAL CONTACTS", 12, t.muted) +
      text(730, 120, `${s.infected.size} / 36 infected`, 30) +
      text(730, 160, `Turn ${s.turn}`, 17, t.muted);
    s.edges.forEach(([a, b]) => {
      content +=
        line(point(a), point(b), t.flow) + packet(point(a), point(b), animate);
    });
    for (let i = 0; i < 36; i++) {
      const [x, y] = point(i),
        infected = s.infected.has(i),
        fresh = s.edges.some((e) => e[1] === i);
      content +=
        `<rect x="${x - 22}" y="${y - 22}" width="44" height="44" rx="6" fill="${infected ? t.flowFill : t.storageFill}" stroke="${fresh ? t.focus : infected ? t.flow : t.storage}" stroke-width="${fresh ? 3 : 1.5}"/>` +
        text(x, y, infected ? "+" : "−", 22, infected ? t.flow : t.storage);
    }
    content +=
      text(730, 235, "+ Infected     − Uninfected", 17) +
      text(730, 275, "Orange outline = infected this turn", 14, t.focus) +
      text(730, 330, "Only cells infected before the turn", 15, t.muted) +
      text(730, 354, "can transmit during that turn.", 15, t.muted) +
      text(
        730,
        405,
        "No diagonal contacts. No same-turn cascade.",
        13,
        t.muted,
      ) +
      text(
        260,
        454,
        "6 × 6 population · solid paths = new transmissions",
        13,
        t.muted,
      );
    sections[0].querySelector(".stage").innerHTML = svg(
      "Epidemic spread across a six by six neighbor grid",
      content,
    );
    sections[0].querySelector("[role=status]").textContent =
      s.infected.size === 36
        ? "Complete · all 36 cells are infected. Reset to explore another starting location."
        : s.turn === 0
          ? "One infected cell starts the outbreak. Each turn uses independent 50% transmission attempts."
          : `${s.edges.length} newly infected this turn. A turn can add no infections; unsuccessful contacts can be retried later.`;
    sections[0].dataset.state = JSON.stringify({
      turn: s.turn,
      infected: [...s.infected],
      transmissions: s.edges,
    });
  }
  function gossip(animate) {
    const count = models[1].count,
      known = new Set(count ? ["E"] : []);
    exchanges.slice(0, Math.max(0, count - 1)).forEach(([a, b]) => {
      known.add(a);
      known.add(b);
    });
    let content =
      `<rect x="235" y="53" width="560" height="370" rx="12" fill="${t.canvas}" stroke="${t.subtle}"/>` +
      text(515, 80, "EXISTING CLUSTER", 12, t.muted);
    [
      ["A", "B"],
      ["B", "C"],
      ["C", "D"],
      ["D", "A"],
      ...(count >= 2 ? [["E", "A"]] : []),
    ].forEach(
      ([a, b]) => (content += line(positions[a], positions[b], t.border, true)),
    );
    if (count >= 2) {
      const [a, b] = exchanges[count - 2],
        p = positions[a],
        q = positions[b];
      const dx = q[0] - p[0],
        dy = q[1] - p[1],
        cut = Math.min(
          dx === 0 ? Infinity : 66 / Math.abs(dx),
          dy === 0 ? Infinity : 39 / Math.abs(dy),
        );
      const end = [q[0] - dx * cut, q[1] - dy * cut],
        angle = Math.atan2(dy, dx);
      content +=
        line(p, end, t.focus) +
        `<path d="M0 0 L-10 -5 L-10 5 Z" transform="translate(${end}) rotate(${(angle * 180) / Math.PI})" fill="${t.focus}"/>` +
        packet(p, end, animate);
    }
    Object.entries(positions).forEach(([name, [x, y]]) => {
      if (name === "E" && !count) return;
      const knows = known.has(name);
      content +=
        `<g>${name === "E" && count === 1 && animate && !reduced.matches ? '<animateTransform attributeName="transform" type="translate" from="0 85" to="0 0" dur="0.65s"/>' : ""}<rect x="${x - 66}" y="${y - 39}" width="132" height="78" rx="7" fill="${t.processingFill}" stroke="${t.processing}" stroke-width="1.7"/>` +
        text(x, y - 12, name + (name === "A" ? " · seed" : ""), 20) +
        text(
          x,
          y + 17,
          knows ? "✓ Knows E" : "Not yet",
          14,
          knows ? t.success : t.muted,
        ) +
        "</g>";
    });
    content +=
      text(895, 140, `${known.size} / 5`, 25) +
      text(895, 175, "know E", 14, t.muted) +
      text(895, 265, "“E joined”", 16, t.flow) +
      text(895, 295, "membership", 13, t.muted) +
      text(895, 315, "information", 13, t.muted) +
      line([860, 365], [930, 365], t.border, true) +
      text(895, 391, "Peer relationship", 12, t.muted) +
      text(
        500,
        458,
        count >= 2
          ? `${exchanges[count - 2].join(" → ")} · ${count === 2 ? "first contact via seed" : "peer gossip"}`
          : count
            ? "E approaches the cluster"
            : "A–D are connected peers",
        17,
        t.focus,
      );
    sections[1].querySelector(".stage").innerHTML = svg(
      "Peer to peer dissemination of E joining the cluster",
      content,
    );
    sections[1].querySelector("[role=status]").textContent = labels[count];
    sections[1].dataset.state = JSON.stringify({
      step: count,
      known: [...known],
      exchange: count >= 2 ? exchanges[count - 2] : null,
    });
  }
  function random(s) {
    s.seed = (Math.imul(s.seed, 1664525) + 1013904223) >>> 0;
    return s.seed / 4294967296;
  }
  function done(i) {
    return i === 0 ? models[0].infected.size === 36 : models[1].count === 5;
  }
  function buttons(i) {
    sections[i].querySelector("[data-action=play]").textContent = playing[i]
      ? "Pause"
      : "Play";
    sections[i].querySelector("[data-action=play]").disabled = done(i);
    sections[i].querySelector("[data-action=step]").disabled = done(i);
  }
  function stop(i) {
    clearTimeout(timers[i]);
    timers[i] = null;
    playing[i] = false;
    sections[i].querySelector("svg")?.pauseAnimations();
    buttons(i);
  }
  function step(i) {
    if (done(i)) return;
    if (i === 1) {
      models[1].count++;
      gossip(true);
    } else {
      const s = models[0],
        old = new Set(s.infected);
      s.edges = [];
      old.forEach((from) => {
        const row = Math.floor(from / 6),
          col = from % 6;
        [
          row > 0 ? from - 6 : -1,
          col < 5 ? from + 1 : -1,
          row < 5 ? from + 6 : -1,
          col > 0 ? from - 1 : -1,
        ]
          .filter((n) => n >= 0)
          .forEach((to) => {
            if (!old.has(to) && random(s) < 0.5 && !s.infected.has(to)) {
              s.infected.add(to);
              s.edges.push([from, to]);
            }
          });
      });
      s.turn++;
      epidemic(true);
    }
    if (done(i)) {
      clearTimeout(timers[i]);
      playing[i] = false;
    }
    buttons(i);
  }
  function schedule(i) {
    clearTimeout(timers[i]);
    if (playing[i])
      timers[i] = setTimeout(
        () => {
          step(i);
          schedule(i);
        },
        i ? 1600 / Number(document.querySelector("#speed").value) : 1000,
      );
  }
  function reset(i) {
    stop(i);
    if (i) {
      models[1] = { count: 0 };
      gossip(false);
    } else {
      models[0] = {
        turn: 0,
        infected: new Set([Number(document.querySelector("#origin").value)]),
        edges: [],
        seed: 1947,
      };
      epidemic(false);
    }
    buttons(i);
  }
  function applyTheme() {
    t = window.visualTokens[theme];
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    Object.entries(t).forEach(([k, v]) =>
      document.documentElement.style.setProperty(`--${k}`, v),
    );
    document
      .querySelector("#theme")
      .setAttribute("aria-pressed", String(theme === "dark"));
    epidemic(false);
    gossip(false);
  }
  sections.forEach((section, i) =>
    section.addEventListener("click", (event) => {
      const action = event.target.closest("button")?.dataset.action;
      if (action === "play") {
        if (playing[i]) stop(i);
        else {
          playing[i] = true;
          buttons(i);
          schedule(i);
        }
      }
      if (action === "step") {
        stop(i);
        step(i);
      }
      if (action === "reset") reset(i);
      if (action === "export") {
        const clone = section.querySelector("svg").cloneNode(true);
        clone
          .querySelectorAll("animateMotion")
          .forEach((el) => el.parentNode.remove());
        clone.querySelectorAll("animateTransform").forEach((el) => el.remove());
        const blob = new Blob([clone.outerHTML], { type: "image/svg+xml" }),
          url = URL.createObjectURL(blob),
          link = document.createElement("a");
        link.href = url;
        link.download = `${section.dataset.figure}-${theme}.svg`;
        link.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      }
    }),
  );
  document.querySelector("#origin").addEventListener("change", () => reset(0));
  document
    .querySelector("#speed")
    .addEventListener("change", () => schedule(1));
  document.querySelector("#theme").addEventListener("click", () => {
    theme = theme === "dark" ? "light" : "dark";
    localStorage.setItem("visual-lab-theme", theme);
    applyTheme();
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) sections.forEach((_, i) => stop(i));
  });
  reduced.addEventListener("change", () => {
    if (reduced.matches) {
      sections.forEach((_, i) => stop(i));
      applyTheme();
    }
  });
  applyTheme();
})();
