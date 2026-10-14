/* Deterministic, illustrative models. Every rendered value comes from current state. */
(() => {
  const root = document.documentElement;
  let theme =
    localStorage.getItem("visual-lab-theme") ||
    (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  let c;
  const scenes = [];
  const esc = (s) => String(s).replaceAll("&", "&amp;").replaceAll("<", "&lt;");
  const text = (x, y, s, size = 16, color = c.text, anchor = "middle") =>
    `<text x="${x}" y="${y}" text-anchor="${anchor}" dominant-baseline="middle" fill="${color}" font-size="${size}" font-family="system-ui,sans-serif">${esc(s)}</text>`;
  const rect = (x, y, w, h, fill, stroke = c.subtle) =>
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>`;
  const node = (x, y, w, h, a, b, role = "processing") =>
    rect(x, y, w, h, c[role + "Fill"], c[role]) +
    text(x + w / 2, y + h / 2 - (b ? 11 : 0), a, 16) +
    (b ? text(x + w / 2, y + h / 2 + 14, b, 13, c.muted) : "");
  const line = (x, y, x2, y2, col = c.flow) =>
    `<path d="M${x},${y} L${x2},${y2}" stroke="${col}" stroke-width="2" fill="none"/>`;
  const dot = (x, y) => `<circle cx="${x}" cy="${y}" r="6" fill="${c.focus}"/>`;
  const qps = (n) => (40 * n) / (1 + 0.25 * (n - 1) + 0.0013 * n * (n - 1));
  function applyTheme() {
    if (!window.visualTokens[theme]) theme = "light";
    root.dataset.theme = theme;
    root.style.colorScheme = theme;
    c = window.visualTokens[theme];
    Object.entries(c).forEach(([k, v]) => root.style.setProperty("--" + k, v));
    document
      .querySelector("#theme")
      .setAttribute(
        "aria-label",
        `Switch to ${theme === "light" ? "dark" : "light"} theme`,
      );
    scenes.forEach(render);
  }
  document.querySelector("#theme").onclick = () => {
    theme = theme === "light" ? "dark" : "light";
    localStorage.setItem("visual-lab-theme", theme);
    applyTheme();
  };
  applyTheme();
  const schedule = [
    [0.05, 0.22],
    [0.08, 0.28],
    [0.12, 0.24],
    [0.15, 0.2],
    [0.22, 0.25],
    [0.27, 0.22],
    [0.48, 0.25],
  ];
  function pool(s, exhaustion) {
    const unpooled = s.mode === "unpooled" && !exhaustion,
      size = exhaustion ? 4 : unpooled ? 7 : s.size;
    const t = s.tick * 0.6,
      free = Array(size).fill(0);
    const jobs = (
      exhaustion
        ? [
            [0.9, 30],
            [1.5, 30],
            [2.1, 30],
            [2.7, 30],
            [6, 4.5],
            [7.2, 4.2],
            [9, 4.5],
            [10.8, 4.5],
            [12.6, 4.2],
            [14.4, 4.5],
          ]
        : schedule.map(([a, d]) => [a * 24, d * 24])
    ).map(([arrival, duration], i) => {
      const slot = unpooled ? i : free.indexOf(Math.min(...free));
      const start = Math.max(arrival, free[slot]);
      const dropped = exhaustion && start - arrival > 5.4;
      const end = start + duration + (unpooled ? 2 : 0);
      if (!dropped) free[slot] = end;
      const status =
        t < arrival
          ? "pending"
          : dropped
            ? t >= arrival + 5.4
              ? "timeout"
              : "waiting"
            : t < start
              ? "waiting"
              : t >= end
                ? "done"
                : "active";
      const progress = Math.max(0, Math.min(1, (t - start) / (end - start)));
      const phase =
        unpooled && t - start < 2
          ? "handshake"
          : progress < 0.15
            ? "acquire"
            : progress < 0.25
              ? "send SQL"
              : progress < 0.75
                ? "execute"
                : progress < 0.85
                  ? "result"
                  : "release";
      return { id: i + 1, arrival, start, end, slot, status, progress, phase };
    });
    const active = jobs.filter((j) => j.status === "active"),
      waiting = jobs.filter((j) => j.status === "waiting").length,
      done = jobs.filter((j) => j.status === "done").length,
      dropped = jobs.filter((j) => j.status === "timeout").length;
    let out =
      text(145, 34, "APPLICATION REQUESTS", 14, c.muted) +
      text(
        495,
        34,
        unpooled ? "EPHEMERAL SOCKETS" : "CONNECTION POOL",
        14,
        c.muted,
      ) +
      text(855, 34, "MYSQL SERVER", 14, c.muted);
    out += node(
      758,
      78,
      218,
      348,
      "mysqld",
      `${active.length} executing / returning`,
      "storage",
    );
    out += text(
      867,
      299,
      exhaustion
        ? "SELECT * FROM events"
        : unpooled
          ? "TCP / TLS / auth"
          : "Warm TCP sockets",
      14,
      c.muted,
    );
    out += text(
      867,
      329,
      exhaustion
        ? "30-second holders"
        : unpooled
          ? "2s setup in this model"
          : "No repeated setup",
      13,
      c.muted,
    );
    jobs.forEach((j, i) => {
      const y = 58 + i * (exhaustion ? 38 : 51),
        label =
          j.status === "active"
            ? `socket ${j.slot + 1} · ${j.phase}`
            : j.status === "waiting"
              ? `waiting ${(t - j.arrival).toFixed(1)}s`
              : j.status;
      out += node(
        24,
        y,
        245,
        exhaustion ? 32 : 42,
        `R${j.id}  ${label}`,
        "",
        "flow",
      );
    });
    const pitch = 350 / size;
    for (let i = 0; i < size; i++) {
      const j = active.find((j) => j.slot === i),
        y = 80 + i * pitch,
        h = Math.min(68, pitch - 9),
        cy = y + h / 2;
      const closed = unpooled && jobs[i].status === "done";
      out += node(
        380,
        y,
        230,
        h,
        `Socket ${i + 1}`,
        j
          ? `R${j.id} · ${exhaustion ? "scan held" : j.phase}`
          : closed
            ? "closed"
            : "idle / ready",
        "control",
      );
      out += line(610, cy, 758, cy, j ? c.flow : c.border);
      if (j) {
        const reqY =
          58 + (j.id - 1) * (exhaustion ? 38 : 51) + (exhaustion ? 16 : 21);
        out += `<path d="M269 ${reqY} H320 V${cy} H380" fill="none" stroke="${c.flow}" stroke-width="2"/>`;
        const p = j.progress;
        let x,
          markerY = cy;
        const onAcquireRoute = (ratio) => {
          const vertical = Math.abs(cy - reqY),
            total = 111 + vertical;
          const distance = Math.max(0, Math.min(1, ratio)) * total;
          if (distance <= 51) return [269 + distance, reqY];
          if (distance <= 51 + vertical)
            return [320, reqY + Math.sign(cy - reqY) * (distance - 51)];
          return [320 + distance - 51 - vertical, cy];
        };
        if (j.phase === "handshake") x = 650 + 50 * ((t - j.start) / 2);
        else if (p < 0.15) [x, markerY] = onAcquireRoute(p / 0.15);
        else if (p < 0.25) x = 610 + (148 * (p - 0.15)) / 0.1;
        else if (p < 0.75) x = 758;
        else if (p < 0.85) x = 758 - (148 * (p - 0.75)) / 0.1;
        else [x, markerY] = onAcquireRoute(1 - (p - 0.85) / 0.15);
        out += dot(x, markerY);
      }
    }
    out += text(
      500,
      465,
      `${t.toFixed(1)}s model time  ·  ${active.length} busy  ·  ${waiting} waiting  ·  ${done} completed${exhaustion ? "  ·  " + dropped + " timed out" : ""}`,
      17,
    );
    const message = exhaustion
      ? dropped
        ? `${dropped} waiters timed out. Running scans retain their connections until they finish.`
        : waiting
          ? "All four sockets are held. Short requests wait for acquisition, not for their own query execution."
          : done === 4
            ? "The four scans finished; the six timed-out requests remain failed."
            : "Watch the slow scans acquire all four sockets before ordinary traffic arrives."
      : waiting
        ? `${waiting} ${waiting === 1 ? "request is" : "requests are"} waiting. A returned socket is assigned to the next arrival.`
        : done === 7
          ? `All seven requests finished. ${unpooled ? "Seven ephemeral sockets were closed." : size + " warm sockets remain available for reuse."}`
          : "Orange markers follow acquisition, SQL, server execution, result return, and release.";
    s.summary = {
      time: t,
      busy: active.length,
      waiting,
      done,
      dropped,
      mode: s.mode,
      size,
    };
    return [out, message];
  }
  function scaling(s, board) {
    const n = s.n,
      q = qps(n),
      lat = (n / q) * 1000,
      regime =
        n < 8
          ? "Underutilized"
          : n <= 40
            ? "Useful concurrency"
            : n <= 150
              ? "Contention"
              : "Severe contention";
    let out = "";
    if (!board) {
      const x = (n) => 74 + ((Math.sqrt(n) - 1) / (Math.sqrt(500) - 1)) * 560,
        y = (q) => 360 - (q / 150) * 285;
      out += rect(x(8), 66, x(40) - x(8), 294, c.flowFill, c.flow);
      for (const v of [0, 50, 100, 150])
        out +=
          line(74, y(v), 634, y(v), c.subtle) +
          text(57, y(v), v, 13, c.muted, "end");
      out += text(
        74,
        32,
        "Throughput (queries / second)",
        15,
        c.muted,
        "start",
      );
      for (const n of [1, 8, 24, 40, 100, 250, 500])
        out += text(x(n), 388, n, 13, c.muted);
      out += text(
        350,
        424,
        "Concurrent connections · square-root horizontal scale",
        14,
        c.muted,
      );
      out += `<path d="${Array.from({ length: 500 }, (_, i) => `${i ? "L" : "M"}${x(i + 1)},${y(qps(i + 1))}`).join(" ")}" fill="none" stroke="${c.processing}" stroke-width="3"/>`;
      out += line(x(n), 360, x(n), y(q), c.focus) + dot(x(n), y(q));
      out +=
        node(685, 70, 280, 88, `${n} connections`, regime, "control") +
        node(
          685,
          180,
          299,
          88,
          `${q.toFixed(1)} queries / sec`,
          "Illustrative throughput",
          "processing",
        ) +
        node(
          685,
          290,
          299,
          88,
          `${lat.toFixed(0)} ms / query`,
          "Closed-workload mean latency",
          "flow",
        );
      out += text(
        500,
        465,
        "Shaded band: 8–40 connections on 4 cores · model peak near 24",
        16,
      );
    } else {
      out += node(
        28,
        45,
        290,
        340,
        "Application pool",
        `${n} established sockets`,
        "control",
      );
      out += text(173, 280, "Connections available ≠ capacity", 14, c.muted);
      out += line(318, 215, 402, 215) + dot(330 + (s.tick % 5) * 13, 215);
      out +=
        rect(402, 45, 570, 340, c.surface, c.border) +
        text(687, 75, "SERVER · 4 CPU CORES", 16);
      for (let i = 0; i < 4; i++)
        out += node(
          423 + i * 134,
          100,
          118,
          68,
          `Core ${i + 1}`,
          i >= n ? "idle" : n > 40 ? "switching" : "running",
          "processing",
        );
      const count = Math.min(n, 40);
      for (let i = 0; i < count; i++) {
        const label = i < 4 ? "RUN" : n > 150 && i % 6 === 5 ? "LOCK" : "READY";
        const color =
          label === "RUN"
            ? c.success
            : label === "LOCK"
              ? c.failure
              : c.warning;
        out +=
          rect(
            423 + (i % 10) * 53,
            194 + Math.floor(i / 10) * 32,
            46,
            25,
            c.raised,
            color,
          ) +
          text(
            446 + (i % 10) * 53,
            207 + Math.floor(i / 10) * 32,
            label,
            10,
            color,
          );
      }
      out += text(
        687,
        345,
        `${count} thread chips shown${n > count ? " · +" + (n - count) + " more" : ""} · READY = runnable`,
        13,
        c.muted,
      );
      out += text(
        40,
        421,
        `Active buffer demand: ${n * 8} / 4096 MiB`,
        16,
        c.text,
        "start",
      );
      out +=
        rect(40, 445, 565, 20, c.raised, c.border) +
        rect(
          40,
          445,
          Math.max(2, (565 * n * 8) / 4096),
          20,
          c.storage,
          c.storage,
        );
      out +=
        text(790, 418, regime, 18, c.focus) +
        text(790, 453, `${q.toFixed(1)} queries / second`, 16);
    }
    s.summary = {
      connections: n,
      qps: q,
      latencyMs: lat,
      regime,
      memoryMiB: n * 8,
    };
    return [
      out,
      board
        ? `${n} connections share four CPU cores. The illustrative buffer demand is ${(((n * 8) / 4096) * 100).toFixed(1)}% of the 4 GiB budget; an open socket is not evidence of server headroom.`
        : `At ${n} connections: ${q.toFixed(1)} queries/s and ${lat.toFixed(0)} ms mean latency. The peak is model-specific; measure your own workload before sizing a pool.`,
    ];
  }
  function render(s) {
    const [content, caption] =
      s.id === "socket-reuse"
        ? pool(s, false)
        : s.id === "pool-exhaustion"
          ? pool(s, true)
          : scaling(s, s.id === "server-resources");
    s.svg.innerHTML = `<title>${esc(s.el.querySelector("h2").textContent)}</title><desc>${esc(caption)}</desc><rect width="1000" height="500" fill="${c.canvas}"/>${content}`;
    s.el.dataset.state = JSON.stringify({ tick: s.tick, ...s.summary });
    s.el.querySelector(".status").textContent = caption;
    const slider = s.el.querySelector("input");
    if (slider) {
      slider.value = s.id === "socket-reuse" ? s.size : s.n;
      s.el.querySelector("output").value = slider.value;
    }
  }
  const stops = [1, 24, 64, 150, 300, 500];
  function pause(s) {
    clearInterval(s.timer);
    s.timer = null;
    s.el.querySelector("[data-action=play]").textContent = "Play";
  }
  function step(s) {
    s.tick++;
    if (s.id === "scaling-curve" || s.id === "server-resources") {
      s.n = stops[s.tick % stops.length];
    }
    if (
      (s.tick > 60 && s.id === "pool-exhaustion") ||
      (s.tick > 50 && s.id === "socket-reuse")
    )
      s.tick = 0;
    render(s);
  }
  document.querySelectorAll("[data-figure]").forEach((el) => {
    const s = {
      el,
      svg: el.querySelector("svg"),
      id: el.dataset.figure,
      tick: 0,
      size: 4,
      n: 1,
      mode: "pooled",
      timer: null,
    };
    scenes.push(s);
    render(s);
    el.querySelector("[data-action=play]").onclick = () => {
      if (s.timer) pause(s);
      else {
        s.timer = setInterval(
          () => step(s),
          s.id.includes("curve") || s.id === "server-resources" ? 1600 : 220,
        );
        el.querySelector("[data-action=play]").textContent = "Pause";
      }
    };
    el.querySelector("[data-action=step]").onclick = () => {
      pause(s);
      step(s);
    };
    el.querySelector("[data-action=reset]").onclick = () => {
      pause(s);
      s.tick = 0;
      s.n = 1;
      render(s);
    };
    el.querySelectorAll("input,select").forEach(
      (input) =>
        (input.oninput = () => {
          pause(s);
          s.tick = 0;
          if (input.name === "pool") s.size = +input.value;
          if (input.name === "connections") s.n = +input.value;
          if (input.name === "transport") s.mode = input.value;
          render(s);
        }),
    );
    el.querySelector("[data-action=export]").onclick = () => {
      const clone = s.svg.cloneNode(true);
      clone.setAttribute("width", "1000");
      clone.setAttribute("height", "500");
      const blob = new Blob([new XMLSerializer().serializeToString(clone)], {
          type: "image/svg+xml",
        }),
        url = URL.createObjectURL(blob),
        a = document.createElement("a");
      a.href = url;
      a.download = `connection-pooling-${s.id}-${theme}.svg`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    };
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) scenes.forEach(pause);
  });
  matchMedia("(prefers-reduced-motion: reduce)").addEventListener(
    "change",
    () => scenes.forEach(pause),
  );
})();
