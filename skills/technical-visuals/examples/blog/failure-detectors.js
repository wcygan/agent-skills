/* Original rendering; event semantics follow the source FailureDetectorDemo model. */
(() => {
  const section = document.querySelector("[data-figure]"),
    svg = document.querySelector("#network");
  const ids = ["A", "C", "D", "E"],
    seed = 14731;
  let s,
    running = false,
    raf = 0,
    previous = 0;
  let theme =
    localStorage.getItem("visual-lab-theme") ||
    (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  if (!["light", "dark"].includes(theme)) theme = "light";
  const next = (n) => (Math.imul(n, 1664525) + 1013904223) >>> 0;
  const followers = () => ids.slice(0, s.count - 1);
  const settled = () => followers().some((id) => s.nodes[id].expired);
  const seconds = (n) => (n / 1000).toFixed(2) + "s";
  function restart(n) {
    n.start = s.now;
    n.seed = next(n.seed);
    n.duration = Math.round(1500 * (1 + n.seed / 4294967296));
  }
  function add(id) {
    let value = seed ^ Math.imul(ids.indexOf(id), 0x9e3779b9);
    value = Math.imul(value ^ (value >>> 16), 0x21f0aaad);
    value = Math.imul(value ^ (value >>> 15), 0x735a2d97);
    const n = {
      seed:
        id === "A" ? (seed ^ 0x9e3779b9) >>> 0 : (value ^ (value >>> 15)) >>> 0,
      last: null,
      received: 0,
      expired: false,
    };
    restart(n);
    s.nodes[id] = n;
  }
  function send() {
    s.lastSent = s.now;
    s.sent++;
    for (const id of followers()) {
      if (s.cut.includes(id) || s.drop === id) {
        s.dropped++;
        if (s.drop === id) {
          s.drop = null;
          s.lastDrop = id;
        }
        continue;
      }
      s.packets.push({
        id: s.serial++,
        to: id,
        start: s.now,
        end: s.now + 700,
      });
    }
  }
  function reset() {
    pause();
    const count = Number(document.querySelector("#nodes").value);
    s = {
      now: 0,
      count,
      nodes: {},
      packets: [],
      cut: [],
      crashed: false,
      drop: null,
      lastDrop: null,
      dropped: 0,
      lastSent: 0,
      sent: 0,
      serial: 1,
      faultSeed: (seed ^ 0x85ebca6b) >>> 0,
    };
    followers().forEach(add);
    send();
    render();
  }
  function advance(amount) {
    if (settled()) return;
    const end = s.now + amount;
    while (true) {
      const at = Math.min(
        s.crashed ? Infinity : s.lastSent + 650,
        ...s.packets.map((p) => p.end),
        ...followers().map((id) => s.nodes[id].start + s.nodes[id].duration),
      );
      if (at > end) {
        s.now = end;
        break;
      }
      s.now = at;
      for (const p of s.packets.filter((p) => p.end <= at)) {
        const n = s.nodes[p.to];
        n.last = at;
        n.received++;
        restart(n);
      }
      s.packets = s.packets.filter((p) => p.end > at);
      followers().forEach((id) => {
        const n = s.nodes[id];
        if (n.start + n.duration <= at) n.expired = true;
      });
      if (settled()) {
        pause();
        break;
      }
      if (!s.crashed && s.lastSent + 650 <= at) send();
    }
    render();
  }
  function target() {
    const eligible = followers().filter((id) => !s.cut.includes(id));
    s.faultSeed = next(s.faultSeed);
    return eligible[Math.floor((s.faultSeed / 4294967296) * eligible.length)];
  }
  function pause() {
    running = false;
    cancelAnimationFrame(raf);
    raf = 0;
  }
  function frame(time) {
    if (!running) return;
    advance(Math.min(100, time - previous) * 0.5);
    previous = time;
    if (running) raf = requestAnimationFrame(frame);
  }
  const t = (name) => window.visualTokens[theme][name];
  const text = (x, y, label, size = 14, role = "text", anchor = "middle") =>
    `<text x="${x}" y="${y}" text-anchor="${anchor}" dominant-baseline="middle" font-family="system-ui,sans-serif" font-size="${size}" fill="${t(role)}">${label}</text>`;
  const rect = (x, y, w, h, role = "processing") =>
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="${t(role + "Fill")}" stroke="${t(role)}" stroke-width="1.5"/>`;
  function render() {
    section.dataset.state = JSON.stringify(s);
    const rows = followers(),
      y = (id) => 96 + ids.indexOf(id) * 118;
    let out = `<title id="svg-title">Heartbeats from leader B and each follower’s independent deadline</title><desc>Hearts move left to right. Only arrivals restart follower timers. The right-hand ledger shows local observations.</desc><rect width="1040" height="600" fill="${t("surface")}"/>`;
    out +=
      text(36, 30, "TRANSPORT", 12, "muted", "start") +
      text(590, 30, "FOLLOWER’S LOCAL EVIDENCE", 12, "muted", "start");
    out +=
      rect(38, 220, 160, 118) +
      text(118, 249, "B · Leader", 19) +
      text(
        118,
        278,
        s.crashed ? "× Crashed" : "Broadcasting",
        14,
        s.crashed ? "failure" : "processing",
      ) +
      text(118, 307, `${s.sent} broadcast${s.sent === 1 ? "" : "s"}`, 12, "muted");
    out +=
      text(118, 377, "Every 650 ms", 13, "muted") +
      text(118, 403, "Transit: 700 ms", 13, "muted");
    for (const id of rows) {
      const n = s.nodes[id],
        cy = y(id),
        cut = s.cut.includes(id),
        end = n.start + n.duration,
        remaining = Math.max(0, end - s.now);
      const path = `M198 279 C290 279 295 ${cy} 390 ${cy}`;
      out += `<path d="${path}" fill="none" stroke="${t(cut ? "failure" : "flow")}" stroke-width="2" ${cut ? 'stroke-dasharray="6 6"' : ""}/>`;
      if (cut) out += text(331, cy - 18, "× cut", 12, "failure");
      else out += `<path d="M378 ${cy-4} L386 ${cy} L378 ${cy+4}" fill="none" stroke="${t("flow")}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`;
      for (const p of s.packets.filter((p) => p.to === id)) {
        const a = (s.now - p.start) / 700,
          b = 1 - a,
          x =
            b * b * b * 198 +
            3 * b * b * a * 290 +
            3 * b * a * a * 295 +
            a * a * a * 390,
          py =
            b * b * b * 279 +
            3 * b * b * a * 279 +
            3 * b * a * a * cy +
            a * a * a * cy;
        out += text(x, py, "♥", 23, "flow");
      }
      out +=
        rect(390, cy - 36, 164, 72, "control") +
        text(
          472,
          cy - 12,
          `${id} · ${n.expired ? "Candidate" : "Follower"}`,
          17,
        ) +
        text(
          472,
          cy + 14,
          n.expired ? "Timer expired" : `${seconds(remaining)} left`,
          14,
          n.expired ? "failure" : "control",
        );
      out +=
        text(
          590,
          cy - 22,
          `Last heard: ${n.last === null ? "not yet" : seconds(n.last)}`,
          14,
          "text",
          "start",
        ) +
        text(810, cy - 22, `Deadline: ${seconds(end)}`, 14, "text", "start");
      out += `<rect x="590" y="${cy - 3}" width="398" height="9" rx="4" fill="${t("raised")}"/><rect x="590" y="${cy - 3}" width="${(398 * remaining) / n.duration}" height="9" rx="4" fill="${t(n.expired ? "failure" : "control")}"/>`;
      out +=
        text(
          590,
          cy + 27,
          `${seconds(n.start)} + ${seconds(n.duration)} sampled timeout`,
          13,
          "muted",
          "start",
        ) + text(988, cy + 27, `${n.received} received`, 12, "muted", "end");
    }
    out +=
      `<line x1="36" y1="548" x2="1004" y2="548" stroke="${t("subtle")}"/>` +
      text(
        36,
        574,
        `t = ${seconds(s.now)}  ·  ${settled() ? "FROZEN AT FIRST TIMEOUT" : running ? "RUNNING" : "PAUSED"}`,
        14,
        "text",
        "start",
      ) +
      text(
        1004,
        574,
        `♥ heartbeat     ${s.packets.length} in flight · ${s.dropped} dropped`,
        13,
        "flow",
        "end",
      );
    svg.innerHTML = out;
    const expired = rows.filter((id) => s.nodes[id].expired);
    document.querySelector("#status").textContent = [
      s.crashed ? "Leader B crashed." : "Leader B is alive.",
      s.cut.length
        ? `Cut links: ${s.cut.map((id) => "B–" + id).join(", ")}.`
        : "",
      s.drop
        ? `Next heartbeat to ${s.drop} will drop.`
        : s.lastDrop
          ? `One heartbeat to ${s.lastDrop} dropped.`
          : "",
      expired.length
        ? `${expired.join(", ")} suspects B: its election timer expired.`
        : "No follower has timed out.",
    ]
      .filter(Boolean)
      .join(" ");
    document.querySelector("#diagnostic").hidden = !settled();
    document.querySelector("#outcome").textContent = expired
      .map((id) => {
        const n = s.nodes[id];
        return `${id} heard ${n.last === null ? "no heartbeat" : `its last heartbeat at ${seconds(n.last)}`}. Its ${seconds(n.duration)} timer expired at ${seconds(s.now)}.`;
      })
      .join(" ");
    const eligible = rows.some((id) => !s.cut.includes(id));
    section.querySelector('[data-action="play"]').textContent = running
      ? "Pause"
      : "Play";
    for (const action of ["play", "step", "crash", "cut", "drop"])
      section.querySelector(`[data-action="${action}"]`).disabled =
        settled() ||
        (["crash", "cut", "drop"].includes(action) && s.crashed) ||
        (["cut", "drop"].includes(action) && !eligible) ||
        (action === "drop" && !!s.drop);
    document.querySelector("#nodes").disabled = settled();
    document.querySelector("#count").value = s.count;
  }
  function applyTheme() {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    Object.entries(window.visualTokens[theme]).forEach(([k, v]) =>
      document.documentElement.style.setProperty("--" + k, v),
    );
    document
      .querySelector("#theme")
      .setAttribute(
        "aria-label",
        `Switch to ${theme === "dark" ? "light" : "dark"} theme`,
      );
    document
      .querySelector("#theme")
      .setAttribute("aria-pressed", String(theme === "dark"));
    if (s) render();
  }
  section.addEventListener("click", (event) => {
    const action = event.target.closest("button")?.dataset.action;
    if (!action) return;
    if (action === "reset") return reset();
    if (action === "export") {
      const blob = new Blob(
        [
          svg.outerHTML.replace(
            "<svg",
            '<svg xmlns="http://www.w3.org/2000/svg"',
          ),
        ],
        { type: "image/svg+xml" },
      );
      const url = URL.createObjectURL(blob),
        a = document.createElement("a");
      a.href = url;
      a.download = `failure-detectors-${theme}.svg`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      return;
    }
    if (action === "play") {
      if (running) pause();
      else {
        running = true;
        previous = performance.now();
        raf = requestAnimationFrame(frame);
      }
    }
    if (action === "step") {
      pause();
      advance(100);
    }
    if (action === "crash") {
      s.crashed = true;
      s.drop = null;
    }
    if (action === "cut") {
      const id = target();
      if (id) {
        s.cut.push(id);
        s.dropped += s.packets.filter((p) => p.to === id).length;
        s.packets = s.packets.filter((p) => p.to !== id);
        if (s.drop === id) s.drop = null;
      }
    }
    if (action === "drop") s.drop = target() || null;
    render();
  });
  document.querySelector("#nodes").addEventListener("input", (event) => {
    s.count = Number(event.target.value);
    const active = followers();
    for (const id of ids) {
      if (active.includes(id)) {
        if (!s.nodes[id]) add(id);
      } else delete s.nodes[id];
    }
    s.packets = s.packets.filter((p) => active.includes(p.to));
    s.cut = s.cut.filter((id) => active.includes(id));
    if (!active.includes(s.drop)) s.drop = null;
    if (!active.includes(s.lastDrop)) s.lastDrop = null;
    render();
  });
  document.querySelector("#theme").addEventListener("click", () => {
    theme = theme === "dark" ? "light" : "dark";
    localStorage.setItem("visual-lab-theme", theme);
    applyTheme();
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      pause();
      render();
    }
  });
  matchMedia("(prefers-reduced-motion: reduce)").addEventListener(
    "change",
    () => {
      pause();
      render();
    },
  );
  applyTheme();
  reset(); // Explicit playback also leaves reduced-motion users initially paused.
})();
