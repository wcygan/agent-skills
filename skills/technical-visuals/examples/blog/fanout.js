(() => {
  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  let theme =
    localStorage.getItem("visual-lab-theme") ||
    (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  if (!window.visualTokens[theme]) theme = "light";
  let p,
    frame = null,
    previous = null;
  const t = (x, y, s, role = "text", size = 20) =>
    `<text x="${x}" y="${y}" fill="${p[role]}" font-size="${size}" text-anchor="middle" dominant-baseline="middle">${s}</text>`;
  const service = (x, y, w, label, role = "processing") =>
    `<rect x="${x}" y="${y}" width="${w}" height="56" rx="7" fill="${p[role + "Fill"]}" stroke="${p[role]}" stroke-width="2"/>${label.includes("|") ? label.split("|").map((line, i) => t(x + w / 2, y + 18 + i * 23, line)).join("") : t(x + w / 2, y + 28, label)}`;
  const cylinder = (x, y, w, label) =>
    `<path d="M${x} ${y + 10}V${y + 53}C${x} ${y + 70} ${x + w} ${y + 70} ${x + w} ${y + 53}V${y + 10}" fill="${p.storageFill}" stroke="${p.storage}" stroke-width="2"/><ellipse cx="${x + w / 2}" cy="${y + 10}" rx="${w / 2}" ry="10" fill="${p.storageFill}" stroke="${p.storage}" stroke-width="2"/>${t(x + w / 2, y + 37, label)}`;
  const route = (id, points, role = "border") =>
    `<path id="${id}" d="M${points.map((a) => a.join(",")).join("L")}" fill="none" stroke="${p[role]}" stroke-width="2" marker-end="url(#${id.split("-")[0]}-arrow)"/>`;
  const models = [...document.querySelectorAll("[data-figure]")].map(
    (section, i) => ({
      section,
      i,
      time: 0,
      wanted: !motion.matches,
      visible: false,
      duration: [11000, 11000, 16000][i],
      events: [],
    }),
  );
  function graph(m) {
    const pre = "g",
      xs = [60, 185, 310, 435];
    let s =
      route(
        "g-in",
        [
          [250, 71],
          [250, 110],
        ],
        "flow",
      ) +
      route(
        "g-a",
        [
          [250, 166],
          [250, 195],
          [122, 195],
          [122, 225],
        ],
        "processing",
      ) +
      route(
        "g-b",
        [
          [250, 166],
          [250, 195],
          [372, 195],
          [372, 225],
        ],
        "control",
      );
    xs.forEach(
      (x, i) =>
        (s += route(
          "g-" + i,
          [
            [i < 2 ? 122 : 372, 281],
            [i < 2 ? 122 : 372, 315],
            [x, 315],
            [x, 365],
          ],
          i === 2 ? "focus" : "border",
        )),
    );
    s += `<rect x="190" y="15" width="120" height="45" rx="5" fill="${p.flowFill}" stroke="${p.flow}" stroke-width="2"/><path d="M250 60V71M225 71H275" stroke="${p.flow}" stroke-width="2"/>${t(250, 38, "Browser")}`;
    s +=
      service(185, 110, 130, "Front end", "flow") +
      service(67, 225, 110, "Mid tier|A") +
      service(317, 225, 110, "Mid tier|B", "control");
    xs.forEach(
      (x, i) =>
        (s +=
          service(
            x - 48,
            365,
            96,
            "Back end|" + (i + 1),
            i === 2 ? "storage" : i % 2 ? "control" : "processing",
          ) +
          t(x, 455, "0", i === 2 ? "focus" : "muted").replace(
            "<text ",
            '<text data-count="' + i + '" ',
          )),
    );
    s += t(250, 505, "Calls received this burst", "muted");
    m.events = [
      { path: "g-in", start: 0, key: "front" },
      { path: "g-a", after: 0, delay: 0, key: "a" },
      { path: "g-b", after: 0, delay: 0, key: "b" },
      ...xs.flatMap((_, i) =>
        Array.from({ length: i === 2 ? 5 : 1 }, (_, j) => ({
          path: "g-" + i,
          after: i < 2 ? 1 : 2,
          delay: j * 240,
          key: String(i),
        })),
      ),
    ];
    return s;
  }
  function amplification(m) {
    let s =
      route(
        "a-in",
        [
          [250, 55],
          [250, 125],
        ],
        "flow",
      ) +
      [250, 190, 310].map((x, i) => route(
        `a-calls-${i}`, [[250,181],[250,255],[x,255],[x,285]], "processing"
      )).join("") +
      [220, 280].map((x, i) => route(
        `a-reads-${i}`, [[250,341],[250,415],[x,415],[x,445]], "storage"
      )).join("");
    s +=
      t(250, 32, "1 request", "flow") +
      service(165, 125, 170, "Service A", "flow") +
      service(165, 285, 170, "Service B") +
      cylinder(165, 445, 170, "Database");
    s +=
      t(92, 153, "5 /s", "flow") +
      t(92, 313, "15 /s", "processing") +
      t(92, 480, "30 /s", "storage");
    s +=
      t(397, 225, "× 3", "processing", 27) + t(397, 385, "× 2", "storage", 27);
    s += [
      ["a", 153],
      ["b", 313],
      ["reads", 480],
    ]
      .map(([key, y]) =>
        t(407, y, "0 received", key === "reads" ? "storage" : "muted").replace(
          "<text ",
          '<text data-received="' + key + '" ',
        ),
      )
      .join("");
    m.events = [
      { path: "a-in", start: 0, key: "a" },
      ...Array.from({ length: 3 }, (_, j) => ({
        path: "a-calls-" + j,
        after: 0,
        delay: j * 240,
        key: "b",
      })),
      ...Array.from({ length: 3 }, (_, j) =>
        [0, 1].map((k) => ({
          path: "a-reads-" + k,
          after: j + 1,
          delay: k * 240,
          key: "reads",
        })),
      ).flat(),
    ];
    return s;
  }
  function traffic(m) {
    const points = Array.from({ length: 97 }, (_, i) => {
      const h = i / 2;
      return [
        60 + (h / 48) * 390,
        330 -
          ((h < 36
            ? 5000 + 3000 * Math.sin((h / 24) * Math.PI * 2 - Math.PI / 2)
            : 10) /
            8000) *
            220,
      ];
    });
    m.events = [];
    return `<path d="M60 90V330H450" fill="none" stroke="${p.border}"/>${[0, 4000, 8000].map((v) => t(30, 330 - (v / 8000) * 220, v === 0 ? "0" : v / 1000 + "k", "muted")).join("")}<path d="M${points.map((a) => a.join(",")).join("L")}" fill="none" stroke="${p.control}" stroke-width="3"/><path d="M352.5 90V340" stroke="${p.success}" stroke-width="2" stroke-dasharray="5 5"/>${t(352, 65, "Fix deployed", "success")}${[0, 24, 48].map((h) => t(60 + (h / 48) * 390, 360, h + "h", "muted")).join("")}${t(250, 410, "Downstream queries / second", "muted")}<path data-cursor d="M60 95V330" stroke="${p.focus}" stroke-width="2"/><circle data-cursor-dot r="6" fill="${p.focus}" stroke="${p.surface}" stroke-width="2"/>${t(250, 465, "", "control", 30).replace("<text ", "<text data-qps ")}${t(250, 505, "Illustrative daily traffic", "muted")}`;
  }
  function render(m) {
    const title = m.section.querySelector("h2").textContent,
      prefix = ["g", "a", "t"][m.i];
    m.section.querySelector(".stage").innerHTML =
      `<svg viewBox="0 0 500 ${m.i === 1 ? 590 : 540}" role="img" aria-label="${title}" font-family="system-ui,sans-serif"><title>${title}</title><defs><marker id="${prefix}-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0L10 5L0 10Z" fill="${p.border}"/></marker></defs>${[graph, amplification, traffic][m.i](m)}</svg>`;
    m.svg = m.section.querySelector("svg");
    m.events.forEach((e, index) => {
      e.route = m.svg.querySelector("#" + e.path);
      e.length = e.route.getTotalLength();
      e.duration = (e.length / 125) * 1000;
      if (e.after !== undefined) {
        const parent = m.events[e.after];
        e.start = parent.start + parent.duration + e.delay;
      }
      e.node = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      e.node.setAttribute("r", "6");
      e.node.setAttribute("fill", p[e.key === "2" ? "focus" : "flow"]);
      e.node.setAttribute("stroke", p.surface);
      e.node.setAttribute("stroke-width", "2");
      e.node.dataset.payload = e.path;
      e.node.dataset.event = index;
      e.node.dataset.start = e.start;
      e.node.dataset.duration = e.duration;
      if (e.after !== undefined) e.node.dataset.after = e.after;
      e.node.dataset.delay = e.delay || 0;
      m.svg.append(e.node);
    });
    if (m.events.length) m.duration = Math.max(...m.events.map(e => e.start + e.duration)) + 350;
    paint(m);
  }
  function paint(m) {
    const counts = {};
    m.events.forEach((e) => {
      const f = (m.time - e.start) / e.duration;
      e.node.style.display = !motion.matches && f >= 0 && f < 1 ? "" : "none";
      if (f >= 1) counts[e.key] = (counts[e.key] || 0) + 1;
      const q = e.route.getPointAtLength(
        Math.max(0, Math.min(1, f)) * e.length,
      );
      e.node.setAttribute("cx", q.x);
      e.node.setAttribute("cy", q.y);
    });
    if (m.i === 0)
      m.svg
        .querySelectorAll("[data-count]")
        .forEach((n) => (n.textContent = counts[n.dataset.count] || 0));
    if (m.i === 1)
      m.svg
        .querySelectorAll("[data-received]")
        .forEach(
          (n) =>
            (n.textContent = (counts[n.dataset.received] || 0) + " received"),
        );
    if (m.i === 2) {
      const h = (m.time / m.duration) * 48,
        q =
          h < 36
            ? 5000 + 3000 * Math.sin((h / 24) * Math.PI * 2 - Math.PI / 2)
            : 10,
        x = 60 + (h / 48) * 390,
        y = 330 - (q / 8000) * 220;
      m.svg.querySelector("[data-cursor]").setAttribute("d", `M${x} 95V330`);
      m.svg.querySelector("[data-cursor-dot]").setAttribute("cx", x);
      m.svg.querySelector("[data-cursor-dot]").setAttribute("cy", y);
      m.svg.querySelector("[data-qps]").textContent =
        Math.round(q).toLocaleString() + " queries/s";
      counts.hour = Number(h.toFixed(1));
      counts.qps = Math.round(q);
    }
    m.section.dataset.state = JSON.stringify(counts);
    m.section.querySelector("progress").value = m.time / m.duration;
    m.section.querySelector('[data-action="play"]').textContent =
      m.wanted && m.time < m.duration ? "Pause" : "Play";
    m.section.querySelector("output").textContent =
      m.time >= m.duration ? "Complete" : "";
  }
  function active(m) {
    return m.wanted && m.visible && m.time < m.duration && !document.hidden;
  }
  function tick(now) {
    frame = null;
    const dt = previous === null ? 0 : Math.min(80, now - previous);
    previous = now;
    models.filter(active).forEach((m) => {
      m.time = Math.min(m.duration, m.time + dt);
      paint(m);
    });
    if (models.some(active)) frame = requestAnimationFrame(tick);
    else previous = null;
  }
  function schedule() {
    if (frame === null && models.some(active)) {
      previous = null;
      frame = requestAnimationFrame(tick);
    }
  }
  function applyTheme() {
    p = window.visualTokens[theme];
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    Object.entries(p).forEach(([k, v]) =>
      document.documentElement.style.setProperty("--" + k, v),
    );
    document
      .querySelector("#theme")
      .setAttribute("aria-pressed", theme === "dark");
    document
      .querySelector("#theme")
      .setAttribute(
        "aria-label",
        theme === "dark" ? "Light theme" : "Dark theme",
      );
    models.forEach(render);
  }
  models.forEach((m) =>
    m.section.addEventListener("click", (e) => {
      const a = e.target.closest("[data-action]")?.dataset.action;
      if (!a) return;
      if (a === "replay") {
        m.time = 0;
        m.wanted = !motion.matches;
      }
      if (a === "step") {
        m.wanted = false;
        m.time = Math.min(m.duration, m.time + 1000);
      }
      if (a === "play") {
        if (m.time === m.duration) m.time = 0;
        m.wanted = !m.wanted;
      }
      paint(m);
      schedule();
    }),
  );
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(
      (e) =>
        (models.find((m) => m.section === e.target).visible = e.isIntersecting),
    );
    schedule();
  });
  document.querySelector("#theme").addEventListener("click", () => {
    theme = theme === "dark" ? "light" : "dark";
    localStorage.setItem("visual-lab-theme", theme);
    applyTheme();
  });
  motion.addEventListener("change", () => {
    if (motion.matches)
      models.forEach((m) => {
        m.wanted = false;
        paint(m);
      });
    schedule();
  });
  document.addEventListener("visibilitychange", () => {
    previous = null;
    schedule();
  });
  applyTheme();
  models.forEach((m) => observer.observe(m.section));
})();
