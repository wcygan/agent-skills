/* Original rendering; event semantics follow the source FailureDetectorDemo model. */
(() => {
  const section = document.querySelector("[data-figure]"),
    svg = document.querySelector("#network");
  const ids = ["A", "C", "D", "E"],
    seed = 14731;
  let s,
    running = false,
    raf = 0,
    previous = 0,
    visible = false,
    wantsPlayback = !matchMedia("(prefers-reduced-motion: reduce)").matches,
    motionNodes;
  const compact = matchMedia('(max-width: 600px)');
  const motionPreference = matchMedia("(prefers-reduced-motion: reduce)");
  let theme =
    localStorage.getItem("visual-lab-theme") ||
    (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  if (!["light", "dark"].includes(theme)) theme = "light";
  const identities = { A: "processing", B: "storage", C: "flow", D: "control", E: "warning" };
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
    wantsPlayback = !motionPreference.matches;
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
    syncPlayback();
  }
  function advance(amount) {
    if (settled()) return;
    const end = s.now + amount;
    let changed = false;
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
      changed = true;
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
    if (changed) render();
    else renderMotion();
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
  function syncPlayback() {
    const active = wantsPlayback && visible && !document.hidden && !settled();
    if (active && !running) {
      running = true;
      previous = performance.now();
      raf = requestAnimationFrame(frame);
    } else if (!active) pause();
    render();
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
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="${t(role + "Fill") ?? `color-mix(in srgb, ${t(role)} 12%, ${t("surface")})`}" stroke="${t(role)}" stroke-width="1.5"/>`;
  function route(id) {
    const index = ids.indexOf(id);
    if (compact.matches) {
      const lane = 18 + index * 12;
      const y = 188 + index * 180;
      return [[104, 69], [lane, 69], [lane, y], [80, y]];
    }
    const y = 96 + index * 118;
    return [[198, 279], [290, 279], [295, y], [390, y]];
  }
  function routePoint(points, progress) {
    const a = Math.max(0, Math.min(1, progress)), b = 1 - a;
    return [0, 1].map(axis => b*b*b*points[0][axis] + 3*b*b*a*points[1][axis] + 3*b*a*a*points[2][axis] + a*a*a*points[3][axis]);
  }
  function routePath(points) {
    return `M${points[0]} C${points[1]} ${points[2]} ${points[3]}`;
  }
  function compactMarkup(rows) {
    const height = 160 + rows.length * 180 + 50;
    svg.setAttribute('viewBox', `0 0 360 ${height}`);
    let out = `<title id="svg-title">Leader B sends heartbeats to independent follower deadlines</title><desc>Red hearts follow each curved route. Only delivery restarts the receiving follower's clock.</desc><rect width="360" height="${height}" fill="${t('surface')}"/>`;
    for (const id of rows) {
      const cut = s.cut.includes(id), points = route(id);
      out += `<path data-route="${id}" d="${routePath(points)}" fill="none" stroke="${t(cut ? 'failure' : identities[id])}" stroke-width="2" ${cut ? 'stroke-dasharray="6 6"' : ''}/>`;
      const [x,y] = points[3];
      out += cut ? text(x-12,y-18,'×',20,'failure') : `<path d="M${x-8} ${y-4} L${x-1} ${y} L${x-8} ${y+4}" fill="none" stroke="${t(identities[id])}" stroke-width="2"/>`;
    }
    out += rect(104,16,236,106,identities.B) + text(222,42,'B · Leader',21)
      + text(222,70,s.crashed ? '× Crashed' : 'Broadcasting',16,s.crashed ? 'failure' : identities.B)
      + text(222,98,`♥ ${s.sent} sent`,14,'failure');
    rows.forEach((id,index) => {
      const n=s.nodes[id], top=160+index*180, end=n.start+n.duration;
      const left=Math.max(0,end-s.now);
      out += rect(80,top,260,148,identities[id]).replace("<rect ", `<rect data-node="${id}" `)
        + text(98,top+24,`${id} · Follower`,18,'text','start')
        + text(322,top+51,n.expired ? 'Expired' : `${seconds(left)} left`,16,n.expired ? 'failure':identities[id],'end').replace('<text ',`<text data-timer="${id}" `)
        + text(98,top+51,`♥ ${n.received}`,14,'failure','start')
        + text(98,top+77,`Last arrival: ${n.last===null ? '—' : seconds(n.last)}`,14,'text','start')
        + text(98,top+100,`Deadline: ${seconds(end)}`,14,'text','start')
        + `<rect x="98" y="${top+115}" width="224" height="8" rx="4" fill="${t('raised')}"/><rect data-bar="${id}" x="98" y="${top+115}" width="${224*left/n.duration}" height="8" rx="4" fill="${t(identities[id])}"/>`;
    });
    for (const p of s.packets) {
      const [x,y]=routePoint(route(p.to),(s.now-p.start)/700);
      out += text(x,y,'♥',23,'failure').replace('<text ',`<text data-packet="${p.id}" `);
    }
    out += text(180,height-47,`t = ${seconds(s.now)} · ${settled()?'FIRST TIMEOUT':running?'RUNNING':'PAUSED'}`,16).replace('<text ','<text data-clock="" ')
      + text(180,height-18,`♥ ${s.packets.length} in flight · ${s.dropped} dropped`,14,'failure');
    return out;
  }
  function render() {
    section.dataset.state = JSON.stringify(s);
    const rows = followers(),
      y = (id) => 96 + ids.indexOf(id) * 118;
    let out;
    if (compact.matches) out = compactMarkup(rows);
    else {
    svg.setAttribute('viewBox', '0 0 1040 600');
    out = `<title id="svg-title">Heartbeats from leader B and each follower’s independent deadline</title><desc>Hearts move left to right. Only arrivals restart follower timers. The right-hand ledger shows local observations.</desc><rect width="1040" height="600" fill="${t("surface")}"/>`;
    out +=
      text(36, 30, "TRANSPORT", 12, "muted", "start") +
      text(590, 30, "FOLLOWER’S LOCAL EVIDENCE", 12, "muted", "start");
    out +=
      rect(38, 220, 160, 118, identities.B) +
      text(118, 249, "B · Leader", 19) +
      text(
        118,
        278,
        s.crashed ? "× Crashed" : "Broadcasting",
        14,
        s.crashed ? "failure" : identities.B,
      ) +
      text(
        118,
        307,
        `♥ ${s.sent} sent`,
        12,
        "failure",
      );

    for (const id of rows) {
      const n = s.nodes[id],
        cy = y(id),
        cut = s.cut.includes(id),
        end = n.start + n.duration,
        remaining = Math.max(0, end - s.now);
      const path = routePath(route(id));
      out += `<path d="${path}" fill="none" stroke="${t(cut ? "failure" : identities[id])}" stroke-width="2" ${cut ? 'stroke-dasharray="6 6"' : ""}/>`;
      if (cut) out += text(331, cy - 18, "× cut", 12, "failure");
      else
        out += `<path d="M378 ${cy - 4} L386 ${cy} L378 ${cy + 4}" fill="none" stroke="${t(identities[id])}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`;
      for (const p of s.packets.filter((p) => p.to === id)) {
        const [x, py] = routePoint(route(id), (s.now - p.start) / 700);
        out += text(x, py, "♥", 23, "failure").replace("<text ", `<text data-packet="${p.id}" `);
      }
      out +=
        rect(390, cy - 36, 164, 72, identities[id]).replace("<rect ", `<rect data-node="${id}" `) +
        text(
          472,
          cy - 12,
          `${id} · Follower`,
          17,
        ) +
        text(
          472,
          cy + 14,
          n.expired ? "Timer expired" : `${seconds(remaining)} left`,
          14,
          n.expired ? "failure" : identities[id],
        ).replace("<text ", `<text data-timer="${id}" `);
      out +=
        text(
          590,
          cy - 22,
          `Last arrival: ${n.last === null ? "—" : seconds(n.last)}`,
          14,
          "text",
          "start",
        ) +
        text(810, cy - 22, `Deadline: ${seconds(end)}`, 14, "text", "start");
      out += `<rect x="590" y="${cy - 3}" width="398" height="9" rx="4" fill="${t("raised")}"/><rect data-bar="${id}" x="590" y="${cy - 3}" width="${(398 * remaining) / n.duration}" height="9" rx="4" fill="${t(identities[id])}"/>`;
      out += text(988, cy + 27, `♥ ${n.received}`, 14, "failure", "end");
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
      ).replace("<text ", '<text data-clock="" ') +
      text(
        1004,
        574,
        `♥ ${s.packets.length} in flight · ${s.dropped} dropped`,
        13,
        "failure",
        "end",
      );
    }
    svg.innerHTML = out;
    motionNodes = {
      clock: svg.querySelector("[data-clock]"),
      barWidth: compact.matches ? 224 : 398,
      followers: rows.map((id) => ({
        id,
        timer: svg.querySelector(`[data-timer="${id}"]`),
        bar: svg.querySelector(`[data-bar="${id}"]`),
      })),
      packets: s.packets.map((p) => ({
        packet: p,
        node: svg.querySelector(`[data-packet="${p.id}"]`),
      })),
    };
    const expired = rows.filter((id) => s.nodes[id].expired);
    document.querySelector("#status").textContent = [
      s.crashed ? "B crashed." : "",
      s.cut.length
        ? `Cut links: ${s.cut.map((id) => "B–" + id).join(", ")}.`
        : "",
      s.drop
        ? `Next heartbeat to ${s.drop} will drop.`
        : s.lastDrop
          ? `One heartbeat to ${s.lastDrop} dropped.`
          : "",
      expired.length
        ? `${expired.join(", ")} suspects B · timer expired.`
        : "Each follower watches its own timer.",
    ]
      .filter(Boolean)
      .join(" ");
    const diagnostic = document.querySelector("#diagnostic");
    document.querySelector("#outcome").textContent = expired
      .map((id) => {
        return `Leader B · heartbeat timer expired at ${seconds(s.now)}.`;
      })
      .join("\n");
    if (expired.length) {
      const id = expired[0];
      diagnostic.style.setProperty("--node-color", t(identities[id]));
      document.querySelector("#failure-node").textContent = `Follower ${id}`;
      document.querySelector("#failure-node-badge").textContent = id;
    }
    if (settled() && !diagnostic.open) diagnostic.showModal();
    else if (!settled() && diagnostic.open) diagnostic.close();
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
  function renderMotion() {
    section.dataset.state = JSON.stringify(s);
    for (const { id, timer, bar } of motionNodes.followers) {
      const n = s.nodes[id],
        remaining = Math.max(0, n.start + n.duration - s.now);
      const label = n.expired ? "Timer expired" : `${seconds(remaining)} left`;
      if (timer.textContent !== label) timer.textContent = label;
      bar.setAttribute("width", (motionNodes.barWidth * remaining) / n.duration);
    }
    for (const { packet: p, node } of motionNodes.packets) {
      const [x, y] = routePoint(route(p.to), (s.now - p.start) / 700);
      node.setAttribute('x', x);
      node.setAttribute('y', y);
    }
    const label = `t = ${seconds(s.now)}  ·  ${settled() ? (compact.matches ? "FIRST TIMEOUT" : "FROZEN AT FIRST TIMEOUT") : running ? "RUNNING" : "PAUSED"}`;
    if (motionNodes.clock.textContent !== label) motionNodes.clock.textContent = label;
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
    if (action === "reset" || action === "restart") return reset();
    if (action === "play") {
      wantsPlayback = !wantsPlayback;
      syncPlayback();
    }
    if (action === "step") {
      wantsPlayback = false;
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
  document.addEventListener("visibilitychange", syncPlayback);
  motionPreference.addEventListener("change", () => {
    if (motionPreference.matches) wantsPlayback = false;
    syncPlayback();
  });
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    syncPlayback();
  }).observe(section.querySelector(".stage"));
  compact.addEventListener('change', () => render());
  applyTheme();
  reset();
})();
