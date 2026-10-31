(() => {
  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  let theme;
  try {
    theme = localStorage.getItem("visual-lab-theme");
  } catch {}
  if (!window.visualTokens[theme])
    theme = matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  let p,
    frame = null,
    previous = null;
  const models = [...document.querySelectorAll("[data-figure]")].map(
    (section) => ({
      section,
      id: section.dataset.figure,
      time: 0,
      wanted: !motion.matches,
      visible: false,
    }),
  );
  const completionMarks = (value) =>
    String(value).replaceAll("✓", `<tspan fill="${p.success}">✓</tspan>`);
  const text = (x, y, value, role = "text", key = "", size = 18) =>
    `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="middle" font-size="${size}" fill="${p[role]}"${key ? ` data-label="${key}"` : ""}>${completionMarks(value)}</text>`;
  function build(m) {
    m.wide = m.section.querySelector(".stage").clientWidth >= 600;
    m.width = m.wide ? 720 : 420;
    m.height =
      m.id === "backlog"
        ? m.wide
          ? 600
          : 640
        : m.wide
          ? m.id === "pipeline"
            ? 470
            : 440
          : 590;
    let s = "",
      steps = [],
      initial = {};
    const label = (x, y, value, key, role = "text", size = 18) =>
      text(x, y, value, role, key, size).replace(
        "<text ",
        `<text data-color="${role}" `,
      );
    const route = (id, points, role = "border") => {
      s += `<path id="${m.id}-${id}" d="M${points.map((q) => q.join(",")).join("L")}" fill="none" stroke="${p[role]}" stroke-width="2" marker-end="url(#${m.id}-arrow)"/>`;
    };
    const event = (
      paths,
      patch,
      labelValue = "",
      duration = 850,
      startPatch = {},
      reverse = false,
    ) =>
      steps.push({
        paths: paths ? [paths].flat() : [],
        patch,
        label: labelValue,
        duration,
        startPatch,
        reverse,
      });
    const node = (x, y, w, h, title, role, key, value) => {
      s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="9" fill="${p[role + "Fill"] || p.raised}" stroke="${p[role]}" stroke-width="2"/>`;
      s += text(x + w / 2, y + 24, title, role);
      if (key) s += label(x + w / 2, y + h - 24, value, key);
    };
    const store = (x, y, w, title, key, value) => {
      s += `<path d="M${x} ${y + 12}V${y + 82}C${x} ${y + 99} ${x + w} ${y + 99} ${x + w} ${y + 82}V${y + 12}" fill="${p.storageFill}" stroke="${p.storage}" stroke-width="2"/><ellipse cx="${x + w / 2}" cy="${y + 12}" rx="${w / 2}" ry="12" fill="${p.storageFill}" stroke="${p.storage}" stroke-width="2"/>`;
      s +=
        text(x + w / 2, y + 39, title, "storage") +
        label(x + w / 2, y + 70, value, key);
    };
    if (m.id === "pipeline") {
      const nodes = m.wide
        ? [
            [25, 70],
            [280, 70],
            [535, 70],
            [535, 300],
            [280, 300],
          ]
        : [
            [35, 55],
            [255, 55],
            [255, 255],
            [35, 255],
            [35, 455],
          ];
      const w = m.wide ? 160 : 130;
      const ports = m.wide
        ? [
            [
              [185, 120],
              [280, 120],
            ],
            [
              [440, 120],
              [535, 120],
            ],
            [
              [615, 170],
              [615, 300],
            ],
            [
              [535, 350],
              [440, 350],
            ],
          ]
        : [
            [
              [165, 105],
              [255, 105],
            ],
            [
              [320, 155],
              [320, 255],
            ],
            [
              [255, 305],
              [165, 305],
            ],
            [
              [100, 355],
              [100, 455],
            ],
          ];
      ports.forEach((points, i) => route("flow" + i, points, "flow"));
      store(...nodes[0], w, "MySQL", "source", "42 · free");
      node(...nodes[1], w, 100, "Debezium", "flow", "capture", "Reading log");
      const kafka = nodes[2];
      s += `<rect x="${kafka[0]}" y="${kafka[1]}" width="${w}" height="100" rx="8" fill="${p.flowFill}" stroke="${p.flow}" stroke-width="2"/>${text(kafka[0] + w / 2, kafka[1] + 24, "Kafka", "flow")}`;
      for (let i = 0; i < 3; i++) {
        const x = kafka[0] + 10 + (i * (w - 20)) / 3,
          cell = (w - 26) / 3;
        s += `<rect x="${x}" y="${kafka[1] + 46}" width="${cell}" height="38" rx="4" fill="${p.surface}" stroke="${p.subtle}"/>`;
        if (i === 0)
          s += `<g data-show="published"><rect x="${x}" y="${kafka[1] + 46}" width="${cell}" height="38" rx="4" fill="${p.storageFill}" stroke="${p.storage}"/>${text(x + cell / 2, kafka[1] + 66, "42", "text", "", 16)}</g>`;
      }
      node(...nodes[3], w, 100, "Flink", "processing", "process", "Waiting");
      const redis = nodes[4];
      s += `<rect x="${redis[0]}" y="${redis[1]}" width="${w}" height="100" rx="8" fill="${p.storageFill}" stroke="${p.storage}" stroke-width="2"/>${text(redis[0] + w / 2, redis[1] + 24, "Redis", "storage")}<path d="M${redis[0] + 10} ${redis[1] + 42}H${redis[0] + w - 10}M${redis[0] + 36} ${redis[1] + 42}V${redis[1] + 90}" stroke="${p.storage}"/>${text(redis[0] + 21, redis[1] + 69, "42", "muted", "", 16)}${label(redis[0] + w / 2 + 16, redis[1] + 69, "free", "cachedPlan")}`;
      const source = nodes[0];
      s += `<g data-show="committed"><rect x="${source[0] + 12}" y="${source[1] + 102}" width="${w - 24}" height="29" rx="5" fill="${p.surface}" stroke="${p.storage}"/>${text(source[0] + w / 2, source[1] + 117, "binlog · 42", "storage", "", 16)}</g>`;
      s += label(
        m.width / 2,
        m.height - 20,
        "Both stores agree",
        "status",
        "muted",
        18,
      );
      initial = {
        source: "42 · free",
        sink: "42 · free",
        capture: "Reading log",
        log: "Empty",
        process: "Waiting",
        committed: false,
        published: false,
        cachedPlan: "free",
        status: "Both stores agree",
      };
      event(
        null,
        {
          source: "42 · pro",
          committed: true,
          status: "Committed · Redis is still behind",
        },
        "",
        900,
      );
      event("flow0", { capture: "✓ Captured" }, "42");
      event("flow1", { log: "[ 42 → pro ]", published: true }, "42");
      event("flow2", { process: "Apply update" }, "42");
      event(
        "flow3",
        {
          sink: "42 · pro",
          cachedPlan: "pro",
          process: "✓ Applied",
          status: "✓ Redis caught up",
        },
        "42",
      );
    } else if (m.id === "backlog") {
      const logX = m.wide ? 100 : 20,
        logY = 90,
        logW = m.wide ? 520 : 380;
      const cellW = m.wide ? 136 : 96,
        cellXs = m.wide ? [120, 292, 464] : [38, 162, 286];
      const flink = m.wide ? [100, 330, 180, 200] : [25, 355, 150, 200];
      const redis = m.wide ? [440, 330, 180, 225] : [235, 355, 160, 225];
      const inputX = logX + logW / 2;
      s += text(inputX, 30, "MySQL → Debezium", "muted", "", 18);
      s += `<rect x="${logX}" y="${logY}" width="${logW}" height="135" rx="10" fill="${p.flowFill}" stroke="${p.flow}" stroke-width="2"/>`;
      s += text(inputX, logY + 22, "Kafka · one partition", "flow");
      for (let i = 0; i < 3; i++) {
        const x = cellXs[i],
          cy = logY + 52;
        route(
          "append" + i,
          [
            [inputX, 50],
            [inputX, 75],
            [x + cellW / 2, 75],
            [x + cellW / 2, logY],
          ],
          "flow",
        );
        s += `<rect x="${x}" y="${cy}" width="${cellW}" height="44" rx="5" fill="${p.surface}" stroke="${p.flow}"/><g data-show="record${i}"><rect x="${x}" y="${cy}" width="${cellW}" height="44" rx="5" fill="${p.storageFill}" stroke="${p.storage}"/>${text(x + cellW / 2, cy + 23, ["42 ↑", "7 ×", "9 ↑"][i], "text")}</g>`;
        s += text(x + cellW / 2, logY + 116, String(i), "muted", "", 16);
        s += `<path data-cursor="${i}" d="M${x + cellW / 2 - 7} ${logY + 153}L${x + cellW / 2} ${logY + 143}L${x + cellW / 2 + 7} ${logY + 153}Z" fill="${p.focus}"/>`;
      }
      const read = [
        [m.width / 2, logY + 135],
        [m.width / 2, 280],
        [flink[0] + flink[2] / 2, 280],
        [flink[0] + flink[2] / 2, flink[1]],
      ];
      route("read", read, "flow");
      route(
        "apply",
        [
          [flink[0] + flink[2], flink[1] + 100],
          [redis[0], redis[1] + 100],
        ],
        "processing",
      );
      node(...flink, "Flink", "processing");
      s += label(
        flink[0] + flink[2] / 2,
        flink[1] + 122,
        "Paused",
        "worker",
        "text",
        18,
      );
      const ix = flink[0] + flink[2] / 2,
        iy = flink[1] + 73;
      s += `<g transform="translate(${ix},${iy})"><g data-mode="paused"><circle r="23" fill="none" stroke="${p.warning}" stroke-width="3" stroke-dasharray="5 4"/>${text(0, 1, "Ⅱ", "warning", "", 24)}</g><g data-mode="running"><circle r="23" fill="none" stroke="${p.subtle}" stroke-width="3"/><path data-spinner d="M0 -23A23 23 0 0 1 23 0" fill="none" stroke="${p.processing}" stroke-width="4" stroke-linecap="round"/></g><g data-mode="caught-up"><circle r="23" fill="none" stroke="${p.success}" stroke-width="3"/>${text(0, 1, "✓", "success", "", 24)}</g></g>`;
      s += `<rect x="${flink[0] + 16}" y="${flink[1] + 151}" width="${flink[2] - 32}" height="8" rx="4" fill="${p.subtle}"/><rect data-processing-progress x="${flink[0] + 16}" y="${flink[1] + 151}" width="0" height="8" rx="4" fill="${p.success}" data-max-width="${flink[2] - 32}"/>${label(ix, flink[1] + 177, "0 / 3", "processed", "muted", 17)}`;
      node(...redis, "Redis", "storage");
      for (let i = 0; i < 3; i++) {
        const y = redis[1] + 65 + i * 48;
        s += text(redis[0] + 35, y, ["42", "7", "9"][i], "muted");
        s += label(redis[0] + redis[2] - 43, y, "free", "row" + i, "text", 18);
        s += `<path d="M${redis[0] + 14} ${y + 23}H${redis[0] + redis[2] - 14}" stroke="${p.subtle}"/>`;
      }
      s += label(m.width / 2, m.height - 20, "0 waiting", "status", "muted");
      initial = {
        record0: false,
        record1: false,
        record2: false,
        worker: "Paused",
        mode: "paused",
        processed: "0 / 3",
        row0: "free",
        row1: "free",
        row2: "free",
        applied: 0,
        buffered: 0,
        cursor: -1,
        status: "0 waiting",
        duplicateIgnored: false,
      };
      for (let i = 0; i < 3; i++)
        event(
          "append" + i,
          { ["record" + i]: true, buffered: i + 1, status: i + 1 + " waiting" },
          String(i),
        );
      event(
        null,
        {
          worker: "Running",
          mode: "running",
          status: "Flink fetches the next event",
        },
        "",
        900,
      );
      for (let i = 0; i < 3; i++) {
        event(
          "read",
          { worker: "Fetching" },
          "?",
          850,
          { worker: "Fetching" },
          true,
        );
        event(
          "read",
          { cursor: i, worker: "Apply " + [42, 7, 9][i] },
          String(i),
        );
        event(
          "apply",
          {
            ["row" + i]: ["pro", "—", "team"][i],
            applied: i + 1,
            worker: "Running",
            processed: i + 1 + " / 3",
            status: 2 - i + " waiting",
          },
          String(i),
        );
      }
      event(
        "read",
        { worker: "Fetching" },
        "?",
        850,
        { worker: "Fetching" },
        true,
      );
      event(
        "read",
        { worker: "Retry offset 2", status: "Replay the last event" },
        "2",
      );
      event(
        "apply",
        {
          worker: "✓ Up to date",
          mode: "caught-up",
          status: "✓ Same version · no change",
          duplicateIgnored: true,
        },
        "2",
      );
    } else {
      const centers = m.wide ? [190, 530] : [110, 310];
      const top = m.wide ? 15 : 35,
        middle = m.wide ? 175 : 240,
        bottom = m.wide ? 335 : 445;
      const w = m.wide ? 150 : 145,
        h = 85;
      const cx = m.width / 2;
      const identities = {
        customer: "control",
        order0: "processing",
        order1: "flow",
        shipment0: "storage",
        shipment1: "warning",
      };
      const record = (id, x, y, title) => {
        const role = identities[id];
        const icon =
          id === "customer"
            ? '<circle cx="12" cy="6" r="4"/><path d="M4 25V21a8 8 0 0 1 16 0v4"/>'
            : id.startsWith("order")
              ? '<path d="M4 2H20V26L16 23L12 26L8 23L4 26ZM8 8H16M8 13H16M8 18H13"/>'
              : '<path d="M12 2L23 8V20L12 26L1 20V8ZM1 8L12 14L23 8M12 14V26M6 5L17 11"/>';
        s += `<g data-record="${id}" data-family="${role}"><rect x="${x - w / 2}" y="${y}" width="${w}" height="${h}" rx="8" fill="${p[role + "Fill"] || p.raised}" stroke="${p[role]}" stroke-width="2"/><g data-icon="${id}" transform="translate(${x - 12},${y + 6})" fill="none" stroke="${p[role]}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round">${icon}</g>${text(x, y + 46, title, role)}${label(x, y + 69, "Live", id, "text", 18)}</g>`;
      };
      record("customer", cx, top, "Customer");
      for (let i = 0; i < 2; i++) {
        record("order" + i, centers[i], middle, "Order " + ["A", "B"][i]);
        record("shipment" + i, centers[i], bottom, "Shipment " + ["A", "B"][i]);
        route(
          "order" + i,
          [
            [cx, top + h],
            [cx, top + h + 35],
            [centers[i], top + h + 35],
            [centers[i], middle],
          ],
          identities["order" + i],
        );
        route(
          "shipment" + i,
          [
            [centers[i], middle + h],
            [centers[i], bottom],
          ],
          identities["shipment" + i],
        );
      }
      s += text(cx, top + h + 57, "CDC → purge events", "failure", "", 17);
      initial = {
        customer: "Live",
        order0: "Live",
        order1: "Live",
        shipment0: "Live",
        shipment1: "Live",
      };
      event(null, { customer: "× Deleted" }, "", 1000);
      event(
        ["order0", "order1"],
        { order0: "× Deleted", order1: "× Deleted" },
        "×",
      );
      event(
        ["shipment0", "shipment1"],
        { shipment0: "× Deleted", shipment1: "× Deleted" },
        "×",
      );
    }
    m.initial = initial;
    m.section.querySelector(".stage").innerHTML =
      `<svg viewBox="0 0 ${m.width} ${m.height}" role="img" aria-label="${m.section.querySelector("h2").textContent}"><defs><marker id="${m.id}-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M1 1L9 5L1 9" fill="none" stroke="${p.border}" stroke-width="1.6"/></marker></defs>${s}<g data-payload="0"><rect x="-12" y="-13" width="24" height="26" rx="4" fill="${m.id === "deletes" ? p.failure : p.flow}" stroke="${p.surface}"/>${text(0, 1, "", "canvas", "payload0", 16)}</g><g data-payload="1"><rect x="-12" y="-13" width="24" height="26" rx="4" fill="${p.failure}" stroke="${p.surface}"/>${text(0, 1, "", "canvas", "payload1", 16)}</g></svg>`;
    m.svg = m.section.querySelector("svg");
    if (m.id === "backlog")
      m.svg
        .querySelector("#backlog-read")
        .setAttribute("marker-start", "url(#backlog-arrow)");
    let start = 0;
    m.events = steps.map((step) => {
      const paths = step.paths.map((id) =>
        m.svg.querySelector("#" + m.id + "-" + id),
      );
      const duration = paths.length
        ? (Math.max(...paths.map((path) => path.getTotalLength())) / 80) * 1000
        : step.duration;
      const event = {
        ...step,
        paths,
        start,
        duration,
        arrival: start + duration,
      };
      start = event.arrival + 500;
      return event;
    });
    m.duration = m.events.at(-1).arrival;
    paint(m);
  }
  function paint(m) {
    const state = { ...m.initial };
    for (const event of m.events) {
      if (m.time >= event.start) Object.assign(state, event.startPatch);
      if (m.time >= event.arrival) Object.assign(state, event.patch);
    }
    for (const [key, value] of Object.entries(state)) {
      const el = m.svg.querySelector(`[data-label="${key}"]`);
      if (!el) continue;
      if (el.textContent !== String(value))
        el.innerHTML = completionMarks(value);
      if (value?.startsWith?.("✓")) el.setAttribute("fill", p.success);
      else if (value?.startsWith?.("×")) el.setAttribute("fill", p.failure);
      else if (
        m.id === "pipeline" &&
        ["source", "cachedPlan"].includes(key) &&
        String(value).endsWith("pro")
      )
        el.setAttribute("fill", p.success);
      else el.setAttribute("fill", p[el.dataset.color || "text"]);
    }
    m.svg
      .querySelectorAll("[data-show]")
      .forEach(
        (el) => (el.style.display = state[el.dataset.show] ? "" : "none"),
      );
    m.svg
      .querySelectorAll("[data-cursor]")
      .forEach(
        (el) =>
          (el.style.display =
            state.cursor === Number(el.dataset.cursor) ? "" : "none"),
      );
    m.svg.querySelectorAll("[data-record]").forEach((el) => {
      const deleted = state[el.dataset.record].startsWith("×");
      el.querySelector("rect").setAttribute(
        "fill",
        deleted ? p.surface : p[el.dataset.family + "Fill"] || p.raised,
      );
      el.querySelector("rect").setAttribute("stroke", p[el.dataset.family]);
    });
    const active = m.events.find(
      (event) => m.time >= event.start && m.time < event.arrival,
    );
    if (m.id === "backlog") {
      m.svg
        .querySelectorAll("[data-mode]")
        .forEach(
          (el) =>
            (el.style.display = el.dataset.mode === state.mode ? "" : "none"),
        );
      m.svg
        .querySelector("[data-spinner]")
        .setAttribute("transform", `rotate(${m.time * 0.2})`);
      const fill = m.svg.querySelector("[data-processing-progress]");
      const applying =
        active?.paths[0]?.id === m.id + "-apply" && !state.duplicateIgnored;
      const fraction = applying
        ? Math.max(0, Math.min(1, (m.time - active.start) / active.duration))
        : 0;
      fill.setAttribute(
        "width",
        Number(fill.dataset.maxWidth) *
          Math.min(1, (state.applied + fraction) / 3),
      );
    }
    m.svg.querySelectorAll("[data-payload]").forEach((el, i) => {
      const path = active?.paths[i];
      el.style.display = path && !motion.matches ? "" : "none";
      if (!path) return;
      const fraction = (m.time - active.start) / active.duration;
      const point = path.getPointAtLength(
        path.getTotalLength() * (active.reverse ? 1 - fraction : fraction),
      );
      el.setAttribute("transform", `translate(${point.x},${point.y})`);
      el.querySelector("rect").setAttribute(
        "fill",
        m.id === "deletes" ? p.failure : active.reverse ? p.processing : p.flow,
      );
      el.querySelector("text").textContent = active.label;
    });
    m.section.dataset.state = JSON.stringify(state);
    m.section.dataset.time = String(Math.round(m.time));
    m.section.querySelector("progress").value = m.time / m.duration;
    m.section.querySelector('[data-action="play"]').textContent =
      m.wanted && m.time < m.duration ? "Pause" : "Play";
  }
  const active = (m) =>
    m.wanted && m.visible && m.time < m.duration && !document.hidden;
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
      .setAttribute("aria-pressed", String(theme === "dark"));
    models.forEach(build);
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
        m.time =
          m.events.find((e) => e.arrival > m.time)?.arrival ?? m.duration;
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
    try {
      localStorage.setItem("visual-lab-theme", theme);
    } catch {}
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
  const layoutObserver = new ResizeObserver(() => {
    for (const m of models) {
      if (m.wide === m.section.querySelector(".stage").clientWidth >= 600)
        continue;
      const index = m.events.findIndex((event) => event.arrival >= m.time);
      const event = m.events[index];
      const offset = event ? m.time - event.start : 0;
      const fraction = event && offset >= 0 ? offset / event.duration : null;
      build(m);
      m.time =
        index < 0
          ? m.duration
          : m.events[index].start +
            (fraction === null ? offset : fraction * m.events[index].duration);
      paint(m);
      schedule();
    }
  });
  models.forEach((m) =>
    layoutObserver.observe(m.section.querySelector(".stage")),
  );
  models.forEach((m) => observer.observe(m.section));
})();
