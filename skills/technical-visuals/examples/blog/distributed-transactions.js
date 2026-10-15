/* Original teaching trace; no live database or network is simulated. */
(() => {
  let animation = 0;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  let theme;
  try {
    theme = localStorage.getItem("visual-lab-theme");
  } catch {}
  if (!["light", "dark"].includes(theme))
    theme = matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  const t = (role) => window.visualTokens[theme][role];
  const esc = (s) =>
    String(s)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll('"', "&quot;");
  const txt = (x, y, s, size = 16, role = "text") =>
    `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="middle" fill="${t(role)}" font-size="${size}">${esc(s)}</text>`;
  const box = (x, y, w, h, role = "control") =>
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="7" fill="${t(role + "Fill")}" stroke="${t(role)}" stroke-width="1.8"/>`;
  const identity = (i) => i ? "processing" : "storage";
  const db = (x, y, w, h, role = "storage") =>
    `<path d="M${x} ${y + 10} V${y + h - 10} A${w / 2} 10 0 0 0 ${x + w} ${y + h - 10} V${y + 10} Z" fill="${t(role + "Fill")}" stroke="${t(role)}" stroke-width="1.8"/><ellipse cx="${x + w / 2}" cy="${y + 10}" rx="${w / 2}" ry="10" fill="${t(role + "Fill")}" stroke="${t(role)}" stroke-width="1.8"/>`;
  const protocolPaths = [
    [
      [480, 156],
      [480, 214],
      [240, 214],
      [240, 276],
    ],
    [
      [480, 156],
      [480, 214],
      [720, 214],
      [720, 276],
    ],
  ];
  const shardPaths = [
    [[480, 148], [480, 214], [250, 214], [250, 290]],
    [[480, 148], [480, 214], [710, 214], [710, 290]],
  ];
  const replicaPaths = [
    [
      [250, 388],
      [250, 422],
      [150, 422],
      [150, 468],
    ],
    [
      [710, 388],
      [710, 422],
      [610, 422],
      [610, 468],
    ],
  ];
  const pathD = (points) =>
    points.map((p, i) => (i ? "L" : "M") + p.join(" ")).join(" ");
  function point(points, progress) {
    const lengths = points
      .slice(1)
      .map((p, i) => Math.hypot(p[0] - points[i][0], p[1] - points[i][1]));
    let remaining = lengths.reduce((a, b) => a + b, 0) * progress;
    for (let i = 0; i < lengths.length; i++) {
      if (remaining <= lengths[i]) {
        const f = remaining / lengths[i];
        return points[i].map((v, j) => v + (points[i + 1][j] - v) * f);
      }
      remaining -= lengths[i];
    }
    return points.at(-1);
  }
  const msg = (target, label, back = false, replica = false) => ({
    target,
    label,
    back,
    replica,
  });
  function protocol() {
    const votes = [document.querySelector("#vote-a").value, document.querySelector("#vote-b").value];
    const outcome = votes.every(v => v === "YES") ? "COMMIT" : "ABORT";
    const locked = votes.map(v => v === "YES");
    const prepared = votes.map(v => v === "YES" ? "PREPARED · YES" : "NO · rolled back");
    const f = (status, parts, locks, count = 0, record = null, messages = [], extra = {}) => ({status, parts, locks, count, record, messages, phase1Complete: count === 2, phase2Complete: false, ...extra});
    const frames = [
      f("Local changes are staged and rows are locked.", ["STAGED", "STAGED"], [true, true]),
      f("PREPARE arrived. Both participants validate their local change.", ["VALIDATING", "VALIDATING"], [true, true], 0, null, [msg(0, "PREPARE"), msg(1, "PREPARE")]),
      f("YES voters durably prepare and retain locks. NO voters roll back and unlock.", prepared, locked),
      f(`A’s ${votes[0]} vote arrived. Waiting for B.`, prepared, locked, 1, null, [msg(0, votes[0], true)]),
      f(`B’s ${votes[1]} vote arrived. Phase one is complete.`, prepared, locked, 2, null, [msg(1, votes[1], true)]),
      f(`${outcome} is durable. No decision has arrived at a participant yet.`, prepared, locked, 2, outcome),
    ];
    if (document.querySelector("#decision").value === "unavailable") return [...frames, f("Decision delivery is unavailable. Prepared YES voters remain blocked with locks held.", prepared.map((v, i) => locked[i] ? "BLOCKED" : v), locked, 2, outcome, [], {blocked: true})];
    const end = outcome === "COMMIT" ? "COMMITTED · durable" : "ABORTED · durable";
    return [...frames,
      f(`A received ${outcome} and released its lock.`, [end, prepared[1]], [false, locked[1]], 2, outcome, [msg(0, outcome)]),
      f(`B received ${outcome} and released its lock.`, [end, end], [false, false], 2, outcome, [msg(1, outcome)]),
      f("Both ACKs arrived. Phase two is complete.", [end, end], [false, false], 2, outcome, [msg(0, "ACK", true), msg(1, "ACK", true)], {phase2Complete: true, acks: 2}),
    ];
  }
  function shards() {
    const empty = [
        [null, null, null],
        [null, null, null],
      ],
      prep = [
        ["PREPARE", "PREPARE", null],
        ["PREPARE", "PREPARE", null],
      ];
    const committed = [["COMMIT", "COMMIT", null], ["COMMIT", "COMMIT", null]];
    const f = (status, records, count = 0, record = null, messages = [], acks = 0) => ({
      status,
      records,
      count,
      record,
      messages,
      acks,
    });
    return [
      f(
        "Two independent consensus groups. The transaction needs a vote from each leader.",
        empty,
      ),
      f(
        "PREPARE reached both leaders. Each has one durable copy; neither can vote yet.",
        [
          ["PREPARE", null, null],
          ["PREPARE", null, null],
        ],
        0,
        null,
        [msg(0, "PREPARE"), msg(1, "PREPARE")],
      ),
      f(
        "Each leader replicated PREPARE to a follower: two durable copies in each three-replica shard.",
        prep,
        0,
        null,
        [msg(0, "replicate", false, true), msg(1, "replicate", false, true)],
      ),
      f(
        "A’s YES arrived. A local quorum in each shard is not enough: B’s vote is still missing.",
        prep,
        1,
        null,
        [msg(0, "YES", true)],
      ),
      f(
        "B’s YES arrived. Every participant voted YES; the coordinator durably records COMMIT.",
        prep,
        2,
        "COMMIT",
        [msg(1, "YES", true)],
      ),
      f(
        "The durable COMMIT reached both leaders. Each must still replicate the outcome.",
        [
          ["COMMIT", "PREPARE", null],
          ["COMMIT", "PREPARE", null],
        ],
        2,
        "COMMIT",
        [msg(0, "COMMIT"), msg(1, "COMMIT")],
      ),
      f(
        "Each shard replicated COMMIT to its own quorum, applied the change, and released locks.",
        committed,
        2,
        "COMMIT",
        [msg(0, "replicate", false, true), msg(1, "replicate", false, true)],
      ),
      f(
        "Both shard leaders acknowledged COMMIT. The transaction is complete.",
        committed,
        2,
        "COMMIT",
        [msg(0, "ACK", true), msg(1, "ACK", true)],
        2,
      ),
    ];
  }
  const scenes = [...document.querySelectorAll("[data-figure]")].map(
    (section) => ({
      section,
      id: section.dataset.figure,
      index: 0,
      playing: !reduced.matches,
      visible: false,
      elapsed: 0,
      packets: [],
      progress: 0,
      last: 0,
    }),
  );
  const framesFor = (s) =>
    s.id === "replicated-shards" ? shards() : protocol();
  function render(s) {
    const frames = framesFor(s),
      f = frames[s.index],
      isShard = s.id === "replicated-shards";
    const moving = s.progress > 0 && s.index < frames.length - 1;
    const messages = moving ? frames[s.index + 1].messages : f.messages;
    const mobile = matchMedia("(max-width: 600px)").matches;
    const width = mobile ? 360 : 960;
    const center = mobile ? 180 : 480;
    const paths = mobile ? isShard ? [
      [[70, 80], [10, 80], [10, 300], [140, 300]],
      [[70, 80], [10, 80], [10, 620], [140, 620]],
    ] : [
      [[180, 134], [180, 184], [90, 184], [90, 234]],
      [[180, 134], [180, 184], [270, 184], [270, 234]],
    ] : isShard ? shardPaths : protocolPaths;
    const localPaths = mobile ? [
      [[210, 340], [210, 370], [110, 370], [110, 400]],
      [[210, 660], [210, 690], [110, 690], [110, 720]],
    ] : replicaPaths;
    let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${mobile ? isShard ? 900 : 510 : isShard ? 670 : 542}" role="img" aria-label="${esc(s.section.querySelector("h2").textContent)}" font-family="system-ui,sans-serif"><title>${esc(s.section.querySelector("h2").textContent)}</title><desc>${esc(f.status)}</desc><rect width="${width}" height="100%" fill="${t("surface")}"/>`;
    svg += `<defs>${[0, 1].map(i => `<marker id="${s.id}-message-arrow-${i}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="10" markerHeight="10" markerUnits="userSpaceOnUse" orient="auto"><path d="M1 1 L9 5 L1 9" fill="none" stroke="${t(identity(i))}" stroke-width="2" stroke-linejoin="round"/></marker>`).join("")}</defs>`;
    for (const [i, p] of paths.entries())
      svg += `<path class="coordinator-route" data-target="${i}" d="${pathD(p)}" fill="none" stroke="${t("border")}" stroke-width="1.8"/>`;
    svg += box(mobile ? 70 : 350, mobile ? 24 : 40, mobile ? 220 : 260, mobile ? 110 : isShard ? 108 : 116) + txt(center, mobile ? 58 : 76, "Coordinator", 20, "control");
    if (f.record) {
      svg += txt(center, mobile ? 102 : 118, isShard && f.acks === 2 ? "✓ COMMIT" : f.record, 24) + `<path transform="translate(${mobile ? 256 : 578} ${mobile ? 91 : 107})" d="M0 0 v16 h16 v-16 Z M4 0 v5 h8 v-5 M4 10 h8" fill="none" stroke="${t("control")}" stroke-width="1.6"/>`;
    } else {
      [0, 1].forEach(i => {
        const received = f.count > i;
        const vote = isShard ? "YES" : document.querySelector(i ? "#vote-b" : "#vote-a").value;
        const x = mobile ? i ? 187 : 83 : i ? 493 : 367;
        svg += `<rect class="vote-badge" data-received="${received}" x="${x}" y="${mobile ? 82 : 96}" width="${mobile ? 90 : 100}" height="34" rx="6" fill="${received ? t(identity(i) + "Fill") : t("surface")}" stroke="${t(identity(i))}" stroke-width="1.5"/>` + txt(x + (mobile ? 45 : 50), mobile ? 100 : 114, `${i ? "B" : "A"} · ${received ? vote : "…"}`, 16, identity(i));
      });
    }
    if (!isShard) {
      f.parts.forEach((part, i) => {
        const x = mobile ? i ? 200 : 20 : i ? 600 : 120, c = x + (mobile ? 70 : 120);
        const committed = part.startsWith("COMMITTED"), aborted = part.startsWith("ABORT") || part.startsWith("NO");
        const label = committed ? "✓ Committed" : aborted ? "× Aborted" : part.includes("PREPARED") || part.includes("YES") ? "Prepared" : part === "VALIDATING" ? "Checking" : part === "BLOCKED" ? "Waiting" : "Staged";
        svg += db(x, mobile ? 234 : 276, mobile ? 140 : 240, mobile ? 110 : 116, identity(i)) + txt(c, mobile ? 274 : 316, i ? "B" : "A", 26, identity(i)) + txt(c, mobile ? 315 : 358, label, mobile ? 16 : 20);
        const lockX = c - 7, lockY = mobile ? 370 : 419;
        svg += `<rect x="${lockX}" y="${lockY}" width="14" height="12" rx="2" fill="none" stroke="${t(f.locks[i] ? "warning" : "success")}" stroke-width="2"/><path d="M${c - 4} ${lockY} v-5 a4 4 0 0 1 8 0 ${f.locks[i] ? "v5" : "v-1"}" fill="none" stroke="${t(f.locks[i] ? "warning" : "success")}" stroke-width="2"/>`;
      });
    } else {
      f.records.forEach((records, i) => {
        const c = mobile ? 210 : 250 + i * 460, top = mobile ? 210 + i * 320 : 242;
        const leaderY = mobile ? top + 40 : 290, leaderBottom = mobile ? leaderY + 90 : 388;
        const replicaY = mobile ? top + 190 : 468;
        const count = records[0] ? records.filter(r => r === records[0]).length : 0;
        svg += `<rect x="${mobile ? 20 : 70 + i * 460}" y="${top}" width="${mobile ? 320 : 360}" height="${mobile ? 300 : 342}" rx="14" fill="none" stroke="${t(identity(i))}" stroke-dasharray="6 5"/>` + txt(mobile ? 90 : c - 100, top + 23, i ? "Shard B" : "Shard A", 18, identity(i));
        svg += `<g class="shard-member" data-member="leader" data-shard="${i}">${db(c - (mobile ? 70 : 90), leaderY, mobile ? 140 : 180, mobile ? 90 : 98, identity(i))}${txt(c, leaderY + 34, "Leader", 21, identity(i))}${txt(c, leaderY + 71, records[0] || "Ready", 17)}</g>`;
        svg += `<path d="M${c} ${leaderBottom} V${replicaY - 30} H${c - 100} V${replicaY} M${c} ${replicaY - 30} H${c + (mobile ? 60 : 100)} V${replicaY}" fill="none" stroke="${t("border")}" stroke-width="1.8"/>`;
        [1, 2].forEach(j => {
          const rc = c + (j === 1 ? -100 : mobile ? 60 : 100);
          const copied = records[0] && records[j] === records[0];
          svg += `<g class="shard-member" data-member="replica" data-shard="${i}">${db(rc - (mobile ? 60 : 65), replicaY, mobile ? 120 : 130, mobile ? 66 : 70, identity(i))}${txt(rc, replicaY + 32, "Replica", 16, identity(i))}${copied ? `<path d="M${rc - 7} ${replicaY + 51} l5 5 l9 -10" fill="none" stroke="${t("success")}" stroke-width="2"/>` : txt(rc, replicaY + 54, "—", 15, "muted")}</g>`;
        });
        svg += txt(mobile ? 180 : c, top + (mobile ? 280 : 320), `${count}/3${count >= 2 ? " · majority" : ""}`, 18, count >= 2 ? "success" : "muted");
      });
    }
    s.packetPaths = [];
    messages.forEach((m) => {
      let points = m.replica ? localPaths[m.target] : paths[m.target];
      if (m.back) points = [...points].reverse();
      if (moving) s.packetPaths.push(points);
      const [x, y] = point(points, moving ? Math.min(1, s.progress) : 1);
      svg += `<path d="${pathD(points)}" fill="none" stroke="${t(identity(m.target))}" stroke-width="2.5" stroke-linejoin="round" marker-end="url(#${s.id}-message-arrow-${m.target})"/>`;
      if (moving)
        svg += `<rect class="message-packet" x="-6" y="-6" transform="translate(${x} ${y})" width="12" height="12" rx="2" fill="${t(identity(m.target))}" stroke="${t("surface")}" stroke-width="1.5"/>`;
      const lx = mobile ? m.replica ? 150 : isShard ? 80 : m.target ? 270 : 90 : m.replica ? (m.target ? 655 : 195) : isShard ? (m.target ? 595 : 365) : m.target ? 710 : 250,
        ly = mobile ? m.replica ? 390 + m.target * 320 : isShard ? 280 + m.target * 320 : 164 : m.replica ? 448 : isShard ? 194 : 190;
      svg += txt(lx, ly, m.label, 15, identity(m.target)).replace("<text ", `<text class="message-label" data-label="${esc(m.label)}" data-target="${m.target}" `);
    });
    if (!isShard) {
      [f.phase1Complete, f.phase2Complete].forEach((complete, i) => {
        const x = (mobile ? 44 : 344) + i * 142;
        svg += `<rect class="phase-badge" data-complete="${complete}" x="${x}" y="${mobile ? 415 : 451}" width="130" height="28" rx="5" fill="${t("surface")}" stroke="${t(complete ? "success" : "border")}"/>` + txt(x + 65, mobile ? 430 : 466, `Phase ${i + 1} ${complete ? "✓" : "…"}`, 15, complete ? "success" : "muted");
      });
    }
    const timelineY = mobile ? isShard ? 860 : 470 : isShard ? 619 : 497;
    const trackX = mobile ? 60 : 360;
    const segments = frames.length - 1, segmentWidth = 240 / segments;
    svg += `<rect class="phase-track" role="progressbar" aria-label="Steps reached" aria-valuemin="0" aria-valuemax="${segments}" aria-valuenow="${s.index}" x="${trackX}" y="${timelineY}" width="240" height="12" rx="3" fill="${t("raised")}" stroke="${t("border")}" stroke-width="1.2"/><rect class="phase-fill" data-phase="${s.index}" x="${trackX}" y="${timelineY}" width="${segmentWidth * s.index}" height="12" rx="3" fill="${t("success")}"/>`;
    for (let i = 1; i < segments; i++) svg += `<path class="step-divider" d="M${trackX + i * segmentWidth} ${timelineY} v12" stroke="${t("surface")}" stroke-width="2"/>`;
    svg += "</svg>";
    s.section.querySelector(".stage").innerHTML = svg;
    s.packets = [...s.section.querySelectorAll(".message-packet")];
    s.section.dataset.state = JSON.stringify({ step: s.index, ...f });
    s.section.querySelector(".event").textContent = moving && messages.length ? `${[...new Set(messages.map(m => m.label))].join(" / ")} in transit` : isShard ? (f.acks === 2 ? "Both leaders acknowledged. Transaction complete." : f.records.every(r => r[0] === "COMMIT" && r[1] === "COMMIT") ? "Local majorities committed. Waiting for leader ACKs." : f.record ? "One shared decision. Two local quorums." : "Two copies locally. Every vote globally.") : f.phase2Complete ? "Phase two complete. Locks released." : f.blocked ? "Phase one complete. Phase two blocked." : f.record ? `${f.record} is durable${f.locks.some(Boolean) ? "; participants still wait." : "; locks released."}` : "Every YES permits commit. Any NO aborts.";
    s.section.querySelector(".trace-state").textContent = `tx-042 · Intended changes: A row42, balance 100 → 90; B row17, stock 8 → 7. ${f.status} ${isShard ? `Replica logs A: ${f.records[0].map(v => v || "empty").join(" / ")}; B: ${f.records[1].map(v => v || "empty").join(" / ")}.` : `Locks A: ${f.locks[0] ? "held" : "released"}; B: ${f.locks[1] ? "held" : "released"}.`} Votes received: ${f.count}/2. Durable decision: ${f.record || "none"}.`;
    const done = s.index === frames.length - 1;
    s.section.querySelector('[data-action="play"]').textContent = s.playing
      ? "Pause"
      : "Play";
    s.section.querySelector('[data-action="play"]').disabled =
      reduced.matches || done;
    s.section.querySelector('[data-action="step"]').disabled = done;
    s.section.querySelector(".progress").textContent =
      `${s.index + 1} / ${frames.length}${reduced.matches ? " · Reduced motion: use Step" : ""}`;
  }
  function rewind(s) {
    s.progress = 0;
    s.elapsed = 0;
    s.last = 0;
  }
  const active = s => s.playing && s.visible && !document.hidden && !reduced.matches;
  function schedule() {
    if (!animation && scenes.some(active)) animation = requestAnimationFrame(tick);
  }
  scenes.forEach((s) => {
    s.section.querySelector(".playback").innerHTML =
      '<button data-action="play">Pause</button><button data-action="step">Step</button><button data-action="reset">Replay</button><span class="progress"></span>';
    s.section.querySelector(".playback").addEventListener("click", (event) => {
      const action = event.target.dataset.action;
      if (action === "play") {
        s.playing = !s.playing;
        s.last = 0;
      }
      if (action === "step") {
        s.playing = false;
        rewind(s);
        s.index = Math.min(s.index + 1, framesFor(s).length - 1);
      }
      if (action === "reset") {
        rewind(s);
        s.index = 0;
        s.playing = !reduced.matches;
      }
      render(s);
      schedule();
    });
  });
  function applyTheme() {
    Object.entries(window.visualTokens[theme]).forEach(([k, v]) =>
      document.documentElement.style.setProperty("--" + k, v),
    );
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    document
      .querySelector("#theme")
      .setAttribute("aria-pressed", String(theme === "dark"));
    document
      .querySelector("#theme")
      .setAttribute(
        "aria-label",
        `Switch to ${theme === "dark" ? "light" : "dark"} theme`,
      );
    scenes.forEach(render);
  }
  document.querySelector("#theme").onclick = () => {
    theme = theme === "dark" ? "light" : "dark";
    try {
      localStorage.setItem("visual-lab-theme", theme);
    } catch {}
    applyTheme();
  };
  document.querySelectorAll(".choices select").forEach(
    (el) =>
      (el.onchange = () => {
        const s = scenes.find(scene => scene.id === "two-phase-commit");
        rewind(s);
        s.playing = !reduced.matches;
        s.index = 0;
        render(s);
        schedule();
      }),
  );
  document.addEventListener("visibilitychange", () => {
    scenes.forEach(s => { s.last = 0; });
    schedule();
  });
  reduced.addEventListener("change", () => {
    scenes.forEach(s => {
      if (reduced.matches) s.playing = false;
      s.last = 0;
      render(s);
    });
    schedule();
  });
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      const s = scenes.find(scene => scene.section === entry.target);
      s.visible = entry.isIntersecting && entry.intersectionRatio >= 0.15;
      s.last = 0;
    });
    schedule();
  }, { threshold: [0, 0.15] });
  function tick(now) {
    animation = 0;
    scenes.forEach(s => {
      if (!active(s)) { s.last = 0; return; }
      if (s.last) s.elapsed += now - s.last;
      s.last = now;
      const wasMoving = s.progress > 0;
      s.progress = Math.max(0, (s.elapsed - 850) / 1800);
      if (s.progress >= 1) {
        s.index++;
        rewind(s);
        if (s.index === framesFor(s).length - 1) s.playing = false;
        render(s);
      } else if (!wasMoving && s.progress > 0) {
        render(s);
      } else if (s.progress > 0) {
        s.packets.forEach((packet, i) => {
          const [x, y] = point(s.packetPaths[i], s.progress);
          packet.setAttribute("transform", `translate(${x} ${y})`);
        });
      }
    });
    schedule();
  }
  addEventListener("resize", () => { scenes.forEach(s => { s.last = 0; render(s); }); schedule(); });
  applyTheme();
  scenes.forEach(s => observer.observe(s.section));
})();
