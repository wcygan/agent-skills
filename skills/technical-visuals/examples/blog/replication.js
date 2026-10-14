(() => {
  "use strict";
  const records = [
    "INSERT user:42",
    "UPDATE user:42",
    "INSERT user:77",
    "DELETE user:19",
    "UPDATE user:77",
    "INSERT user:91",
  ];
  let theme =
    localStorage.getItem("visual-lab-theme") ||
    (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  if (!["light", "dark"].includes(theme)) theme = "light";
  let c;
  const figures = [...document.querySelectorAll("[data-figure]")];
  const states = figures.map((el, i) => ({
    el,
    i,
    playing: false,
    t: 0,
    starts: [],
    read: null,
    b: 0,
    received: 0,
    arrival: [],
    appStart: null,
    off: null,
    membership: "online",
    source: "live",
    rejoin: 0,
    apply: 4,
    latency: 2,
  }));
  function colors() {
    c = window.visualTokens[theme];
    Object.entries(c).forEach(([k, v]) =>
      document.documentElement.style.setProperty("--" + k, v),
    );
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    document
      .querySelector("#theme")
      .setAttribute("aria-pressed", String(theme === "dark"));
  }
  const text = (x, y, s, size = 15, color = c.text) =>
    `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="middle" fill="${color}" font-size="${size}">${s}</text>`;
  function box(x, y, w, h, title, sub, role = "processing") {
    return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="7" fill="${c[role + "Fill"]}" stroke="${c[role]}" stroke-width="1.6"/>${text(x + w / 2, y + h / 2 - 11, title, 16)}${text(x + w / 2, y + h / 2 + 13, sub, 13, c.muted)}`;
  }
  function db(x, y, title, sub) {
    return `<path d="M${x} ${y + 15} C${x} ${y - 5} ${x + 150} ${y - 5} ${x + 150} ${y + 15} V${y + 80} C${x + 150} ${y + 100} ${x} ${y + 100} ${x} ${y + 80}Z" fill="${c.storageFill}" stroke="${c.storage}" stroke-width="1.7"/><ellipse cx="${x + 75}" cy="${y + 15}" rx="75" ry="15" fill="${c.storageFill}" stroke="${c.storage}" stroke-width="1.7"/>${text(x + 75, y + 48, title, 16)}${text(x + 75, y + 72, sub, 13)}`;
  }
  const line = (x, y, x2, y2, label, broken = false) =>
    `<path d="M${x} ${y} L${x2} ${y2}" fill="none" stroke="${broken ? c.failure : c.flow}" stroke-width="2" ${broken ? 'stroke-dasharray="6 5"' : ""} marker-end="url(#arrow)"/>${label ? text((x + x2) / 2, (y + y2) / 2 - 18, label, 12, broken ? c.failure : c.muted) : ""}`;
  const route = (points, broken = false) =>
    `<polyline points="${points}" fill="none" stroke="${broken ? c.failure : c.flow}" stroke-width="2" stroke-linejoin="round" ${broken ? 'stroke-dasharray="6 5"' : ""} marker-end="url(#arrow)"/>`;
  const packet = (x, y, n) =>
    `<rect x="${x - 15}" y="${y - 12}" width="30" height="24" rx="4" fill="${c.flowFill}" stroke="${c.focus}" stroke-width="2"/>${text(x, y, n, 12)}`;
  function slots(x, y, count, applied = count, selected = -1) {
    let s = "";
    for (let k = 0; k < 6; k++) {
      let has = k < count,
        done = k < applied;
      s += `<rect x="${x + k * 56}" y="${y}" width="48" height="42" rx="4" fill="${has ? c.storageFill : c.surface}" stroke="${k === selected ? c.focus : has ? c.storage : c.border}" stroke-width="${k === selected ? 3 : 1.5}" ${has && !done ? 'stroke-dasharray="4 3"' : ""}/>${text(x + k * 56 + 24, y + 21, has ? "#" + (k + 1) : "—", 14, has ? c.text : c.muted)}`;
    }
    return s;
  }
  function counts(s) {
    return {
      p: s.starts.filter((t) => s.t - t >= 2).length,
      r: s.starts.filter((t) => s.t - t >= 4).length,
      a: s.starts.filter((t) => s.t - t >= 6).length,
    };
  }
  function group(s) {
    let p = s.starts.filter((t) => s.t - t >= 3).length,
      a = s.starts.filter((t) => s.t - t >= 4).length,
      ordered = s.starts.filter((t) => s.t - t >= 2).length;
    return { p, a, ordered };
  }
  function tick(s) {
    s.t++;
    s.read = null;
    if (s.i === 2) {
      let { p } = group(s);
      if (s.off !== null) {
        const d = s.t - s.off;
        if (d >= 10) s.membership = "expelled";
        else if (d >= 5 && s.source !== "donor") s.membership = "suspected";
      } else if (s.membership === "rejoining" && s.t >= s.rejoin)
        s.membership = "recovering";
      if (s.off === null && s.membership !== "rejoining") {
        // Recovery first applies the received prefix, then requests missing writes.
        const maySend = s.source !== "donor" || s.b >= s.localTarget;
        if (maySend)
          for (let n = s.received; n < s.starts.length; n++)
            if (
              !s.arrival.some((a) => a.n === n + 1) &&
              s.t >= s.starts[n] + (s.source === "live" ? 1 : 3)
            )
              s.arrival.push({
                n: n + 1,
                at: Math.max(s.t + s.latency, s.starts[n] + 3),
                from: s.t,
              });
        while (s.arrival.some((a) => a.n === s.received + 1 && a.at <= s.t)) {
          s.received++;
          s.arrival = s.arrival.filter((a) => a.n > s.received);
        }
      }
      if (
        ["expelled", "rejoining"].includes(s.membership) &&
        s.appStart !== null
      )
        s.appStart++;
      if (!["expelled", "rejoining"].includes(s.membership)) {
        if (s.appStart !== null && s.t - s.appStart >= s.apply) {
          s.b++;
          s.appStart = null;
        }
        if (s.appStart === null && s.b < s.received) s.appStart = s.t;
      }
      if (
        s.off === null &&
        s.received === s.starts.length &&
        s.source === "cache"
      )
        s.source = "live";
      if (s.membership === "recovering" && s.b === p && p === s.starts.length) {
        s.membership = "online";
        s.source = "live";
      }
    }
    render(s);
  }
  function render(s) {
    let body = "",
      status = "",
      height = 280;
    const count = counts(s),
      g = group(s);
    if (s.i === 0) {
      const n = s.starts.filter((t) => s.t - t >= 2).length;
      body =
        db(
          45,
          80,
          "Database",
          `${n} ${n === 1 ? "write" : "writes"} recorded`,
        ) +
        line(195, 135, 390, 135, "append") +
        text(564, 66, "Append-only log · zero-based offsets", 16) +
        slots(400, 114, n, n, s.read === null ? -1 : s.read) +
        Array.from({ length: 6 }, (_, k) =>
          text(424 + k * 56, 176, "offset " + k, 11, c.muted),
        ).join("");
      for (let k = 0; k < s.starts.length; k++)
        if (s.t - s.starts[k] < 2)
          body += packet(220 + (s.t - s.starts[k]) * 80, 135, k + 1);
      status =
        s.read !== null
          ? s.read < n
            ? `Read offset ${s.read}: ${records[s.read]}. The log retains the entry.`
            : `Offset ${s.read}: not found. That write has not been appended.`
          : `${n} / 6 appended. ${s.starts.length > n ? records[n] + " is traveling to the next offset." : "Write the next entry, then play or step to append it."}`;
    } else if (s.i === 1) {
      height = 400;
      body =
        db(45, 42, "Primary", `${count.p} committed`) +
        db(45, 242, "Replica", `${count.a} applied`) +
        text(554, 44, "Primary log", 16) +
        slots(390, 72, count.p, count.p, s.read === null ? -1 : count.p - 1) +
        text(554, 244, "Replica log", 16) +
        slots(390, 272, count.r, count.a) +
        line(195, 93, 380, 93, "record write") +
        route("718,93 755,93 755,293 718,293") +
        text(679, 195, "copy in order", 12, c.muted) +
        line(380, 293, 205, 293, "apply locally");
      s.starts.forEach((t, k) => {
        let age = s.t - t;
        if (age < 2) body += packet(220 + age * 65, 93, k + 1);
        else if (age < 4) body += packet(755, 140 + (age - 2) * 70, k + 1);
        else if (age < 6) body += packet(350 - (age - 4) * 65, 293, k + 1);
      });
      status =
        s.read !== null
          ? `Primary read: ${count.p ? records[count.p - 1] + " at offset " + (count.p - 1) : "no committed entries"}. Reads do not go to this replica.`
          : `Committed ${count.p} · Received ${count.r} · Applied ${count.a} · Lag ${count.p - count.a}. Dashed entries wait for application.`;
    } else {
      height = 640;
      body =
        box(
          35,
          28,
          210,
          72,
          "Group order + certify",
          `${g.ordered} ordered / ${s.starts.length} proposed`,
          "control",
        ) +
        box(
          295,
          28,
          250,
          72,
          "XCom message cache",
          `${s.starts.filter((t) => s.t - t >= 1).length} messages retained`,
          "flow",
        ) +
        text(660, 120, `Time: ${s.t} ticks`, 14, c.muted) +
        line(245, 64, 285, 64, "") +
        line(140, 100, 140, 152, "") +
        db(65, 155, "Primary", `version ${g.p}`) +
        text(489, 155, "Committed log", 14) +
        slots(325, 180, g.p) +
        line(215, 201, 315, 201, "commit") +
        db(65, 315, "Replica A", `version ${g.a}`) +
        slots(325, 340, g.p, g.a) +
        text(489, 314, "Link 1 · fast application", 14) +
        route("545,50 745,50 745,361 663,361") +
        line(315, 361, 225, 361, "apply") +
        db(65, 475, "Replica B", `version ${s.b}`) +
        slots(325, 500, s.received, s.b) +
        text(
          500,
          474,
          `Link 2 · ${s.off !== null ? "interrupted" : s.source === "cache" ? "cache retransmission" : s.source === "donor" ? "donor recovery" : "live delivery"}`,
          14,
          s.off !== null ? c.failure : c.muted,
        ) +
        (s.source === "donor"
          ? route("653,201 780,201 780,521 663,521", s.off !== null)
          : route("545,82 780,82 780,521 663,521", s.off !== null)) +
        line(315, 521, 225, 521, "apply") +
        text(420, 617, "Solid = applied  ·  Dashed = waiting to apply  ·  Empty = not received", 13, c.muted);
      body += text(
        140,
        582,
        s.membership === "online"
          ? s.off !== null
            ? "Disconnected"
            : "Online"
          : s.membership,
        13,
        s.membership === "online" && s.off === null ? c.success : c.warning,
      );
      for (const a of s.arrival) {
        let f = Math.min(1, (s.t - a.from) / (a.at - a.from));
        body += packet(780, 240 + f * 235, a.n);
      }
      for (let k = 0; k < s.starts.length; k++) {
        const age = s.t - s.starts[k];
        if (age < 2) body += packet(255 + age * 20, 64, k + 1);
        else if (age < 3) body += packet(140, 138, k + 1);
        else if (age < 4) body += packet(745, 285, k + 1);
      }
      if (
        s.appStart !== null &&
        !["expelled", "rejoining"].includes(s.membership)
      )
        body += packet(
          305 - Math.min(1, (s.t - s.appStart) / s.apply) * 70,
          521,
          s.b + 1,
        );
      status = `Primary ${g.p} · A ${g.a} · B ${s.b}. B: ${Math.max(0, g.p - s.received)} not received, ${s.received - s.b} waiting to apply.`;
      if (s.off !== null)
        status +=
          s.membership === "expelled"
            ? " B removed; reconnect to rejoin and recover from donor."
            : ` Link 2 interrupted for ${s.t - s.off} ticks; suspicion at 5, removal at 10.`;
      else if (s.source === "cache")
        status += " Missed decided messages are retransmitted from cache.";
      else if (s.source === "donor")
        status +=
          " B rejoins, applies local work, then recovers missing writes from the primary donor.";
      else if (g.ordered > g.p)
        status += " Ordering completed; primary commit follows.";
      s.el.querySelector('[data-action="link"]').textContent =
        s.off === null ? "Interrupt Link 2" : "Reconnect Link 2";
    }
    s.el.querySelector(".stage").innerHTML =
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 840 ${height}" role="img" aria-label="${s.el.querySelector("h2").textContent}"><title>${s.el.querySelector("h2").textContent}</title><desc>${status}</desc><rect width="840" height="${height}" fill="${c.surface}"/><defs><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0L10 5L0 10Z" fill="${c.flow}"/></marker></defs><g font-family="system-ui,sans-serif">${body}</g></svg>`
        .replaceAll('id="arrow"', `id="arrow-${s.i}"`)
        .replaceAll("url(#arrow)", `url(#arrow-${s.i})`);
    s.el.querySelector('[role="status"]').textContent = status;
    s.el.querySelector('[data-action="play"]').textContent = s.playing
      ? "Pause"
      : "Play";
    s.el.querySelector('[data-action="write"]').disabled = s.starts.length >= 6;
    s.el.dataset.state = JSON.stringify({
      tick: s.t,
      submitted: s.starts.length,
      ...(s.i === 2
        ? {
            committed: g.p,
            a: g.a,
            b: s.b,
            received: s.received,
            membership: s.membership,
            source: s.source,
            disconnected: s.off !== null,
          }
        : count),
      read: s.read,
    });
  }
  function readAll(s) {
    s.playing = false;
    const g = group(s);
    const target = s.el.querySelector(".read-results");
    target.hidden = false;
    const avail = s.off === null && s.membership === "online";
    target.innerHTML = `<h3>Read comparison · captured at tick ${s.t}</h3><div class="read-grid"><div>Primary<strong>Version ${g.p}</strong><p>Successful read</p></div><div>Replica A<strong>Version ${g.a}</strong><p>${g.p - g.a} versions behind</p></div><div>Replica B<strong>${avail ? "Version" : "Last applied"} ${s.b}</strong><p>${avail ? `${g.p - s.b} versions behind` : "Unavailable — this is not a successful read"}</p></div></div><p>Playback is paused. Received ${s.received}; pending application ${s.received - s.b} on B.</p><button data-close>Close comparison</button>`;
    target.querySelector("button").onclick = () => {
      target.hidden = true;
    };
    render(s);
  }
  states.forEach((s) => {
    s.el.addEventListener("click", (e) => {
      const action = e.target.closest("[data-action]")?.dataset.action;
      if (!action) return;
      if (action === "write") {
        if (s.starts.length < 6) s.starts.push(s.t);
        s.read = null;
      }
      if (action === "play") s.playing = !s.playing;
      if (action === "step") {
        s.playing = false;
        tick(s);
      }
      if (action === "reset") {
        Object.assign(s, {
          playing: false,
          t: 0,
          starts: [],
          read: null,
          b: 0,
          received: 0,
          arrival: [],
          appStart: null,
          off: null,
          membership: "online",
          source: "live",
          rejoin: 0,
        });
        const panel = s.el.querySelector(".read-results");
        if (panel) panel.hidden = true;
      }
      if (action === "read") {
        if (s.i === 2) readAll(s);
        else
          s.read = s.i === 0 ? Number(s.el.querySelector("select").value) : 1;
      }
      if (action === "speed") {
        s.apply = 1;
        s.el.querySelector('[data-control="apply"]').value = "1";
      }
      if (action === "link") {
        if (s.off === null) {
          s.off = s.t;
          s.arrival = [];
          if (s.source === "donor") s.membership = "expelled";
        } else {
          s.off = null;
          if (s.membership === "expelled") {
            s.membership = "rejoining";
            s.source = "donor";
            s.rejoin = s.t + 2;
            s.localTarget = s.received;
          } else {
            s.membership = "online";
            s.source = "cache";
          }
        }
      }
      if (action === "catchup") {
        s.playing = false;
        for (let k = 0; k < 100; k++) {
          tick(s);
          if (
            s.off !== null ||
            (s.b === s.starts.length && group(s).a === s.starts.length)
          )
            break;
        }
      }
      if (action === "export") {
        const blob = new Blob([s.el.querySelector("svg").outerHTML], {
          type: "image/svg+xml",
        });
        const u = URL.createObjectURL(blob),
          a = document.createElement("a");
        a.href = u;
        a.download = `replication-${s.el.dataset.figure}-${theme}.svg`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(u), 1000);
      }
      render(s);
    });
    s.el.addEventListener("change", (e) => {
      if (e.target.dataset.control === "apply")
        s.apply = Number(e.target.value);
      if (e.target.dataset.control === "latency")
        s.latency = Number(e.target.value);
      render(s);
    });
  });
  document.querySelector("#theme").onclick = () => {
    theme = theme === "light" ? "dark" : "light";
    localStorage.setItem("visual-lab-theme", theme);
    colors();
    states.forEach(render);
  };
  document.addEventListener("visibilitychange", () => {
    if (document.hidden)
      states.forEach((s) => {
        s.playing = false;
        render(s);
      });
  });
  matchMedia("(prefers-reduced-motion: reduce)").addEventListener(
    "change",
    (e) => {
      if (e.matches)
        states.forEach((s) => {
          s.playing = false;
          render(s);
        });
    },
  );
  colors();
  states.forEach(render);
  setInterval(() => {
    if (!document.hidden)
      states.forEach((s) => {
        if (s.playing) tick(s);
      });
  }, 650);
})();
