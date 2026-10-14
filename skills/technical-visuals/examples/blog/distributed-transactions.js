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
  const db = (x, y, w, h) =>
    `<path d="M${x} ${y + 10} V${y + h - 10} A${w / 2} 10 0 0 0 ${x + w} ${y + h - 10} V${y + 10} Z" fill="${t("storageFill")}" stroke="${t("storage")}" stroke-width="1.8"/><ellipse cx="${x + w / 2}" cy="${y + 10}" rx="${w / 2}" ry="10" fill="${t("storageFill")}" stroke="${t("storage")}" stroke-width="1.8"/>`;
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
    [
      [480, 148],
      [480, 198],
      [70, 198],
      [70, 282],
      [250, 282],
      [250, 290],
    ],
    [
      [480, 148],
      [480, 198],
      [890, 198],
      [890, 282],
      [710, 282],
      [710, 290],
    ],
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
  function protocol(phase) {
    const votes = [
      document.querySelector("#vote-a").value,
      document.querySelector("#vote-b").value,
    ];
    const locked = votes.map((v) => v === "YES");
    const initial = votes.map((v) =>
      v === "YES" ? "PREPARED · YES" : "NO · rolled back",
    );
    const outcome = votes.every((v) => v === "YES") ? "COMMIT" : "ABORT";
    const f = (
      status,
      parts,
      locks,
      count = 0,
      record = null,
      messages = [],
    ) => ({ status, parts, locks, count, record, messages });
    if (phase === "prepare")
      return [
        f(
          "Local changes are staged; row42 and row17 are locked.",
          ["STAGED", "STAGED"],
          [true, true],
        ),
        f(
          "PREPARE arrived. Both participants validate their changes; delivery is not a vote.",
          ["VALIDATING", "VALIDATING"],
          [true, true],
          0,
          null,
          [msg(0, "PREPARE"), msg(1, "PREPARE")],
        ),
        f(
          "Both participants saved PREPARED durably. Their rows remain locked.",
          ["PREPARED · durable", "PREPARED · durable"],
          [true, true],
        ),
        f(
          "Both YES votes are ready to send in phase two. No decision has been recorded.",
          ["YES ready", "YES ready"],
          [true, true],
        ),
      ];
    const frames = [
      f(
        "Prepared participants are ready to send YES; NO voters have already rolled back.",
        initial,
        locked,
      ),
      f(
        `A’s ${votes[0]} vote arrived. The coordinator still waits for B.`,
        initial,
        locked,
        1,
        null,
        [msg(0, votes[0], true)],
      ),
      f(
        `Both votes arrived: A ${votes[0]}, B ${votes[1]}. The coordinator can choose ${outcome}.`,
        initial,
        locked,
        2,
        null,
        [msg(1, votes[1], true)],
      ),
      f(
        `${outcome} is now saved durably. No decision message has been delivered yet.`,
        initial,
        locked,
        2,
        outcome,
      ),
    ];
    if (document.querySelector("#decision").value === "unavailable")
      return [
        ...frames,
        f(
          "The decision is unavailable to participants. Every YES voter remains prepared and blocked, holding its lock.",
          initial,
          locked,
          2,
          outcome,
        ),
      ];
    const end =
      outcome === "COMMIT" ? "COMMITTED · durable" : "ABORTED · durable";
    return [
      ...frames,
      f(
        `A received ${outcome}, saved its outcome, and released its row lock.`,
        [end, initial[1]],
        [false, locked[1]],
        2,
        outcome,
        [msg(0, outcome)],
      ),
      f(
        `B received ${outcome}. Both outcomes are durable and both rows are unlocked.`,
        [end, end],
        [false, false],
        2,
        outcome,
        [msg(1, outcome)],
      ),
      f(
        `Both ACKs arrived. ${outcome} is complete.`,
        [end, end],
        [false, false],
        2,
        outcome,
        [msg(0, "ACK", true), msg(1, "ACK", true)],
      ),
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
    const f = (status, records, count = 0, record = null, messages = []) => ({
      status,
      records,
      count,
      record,
      messages,
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
        "Shard A has a prepare quorum and is ready to send YES. Votes received: 0/2.",
        prep,
      ),
      f(
        "A’s YES arrived. A local quorum in each shard is not enough: B’s vote is still missing.",
        prep,
        1,
        null,
        [msg(0, "YES", true)],
      ),
      f(
        "Shard B has a prepare quorum and is ready to send YES. Votes received: 1/2.",
        prep,
        1,
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
        [
          ["COMMIT", "COMMIT", null],
          ["COMMIT", "COMMIT", null],
        ],
        2,
        "COMMIT",
        [msg(0, "replicate", false, true), msg(1, "replicate", false, true)],
      ),
    ];
  }
  const scenes = [...document.querySelectorAll("[data-figure]")].map(
    (section) => ({
      section,
      id: section.dataset.figure,
      index: 0,
      playing: false,
      progress: 0,
      last: 0,
    }),
  );
  const framesFor = (s) =>
    s.id === "replicated-shards" ? shards() : protocol(s.id);
  function render(s) {
    const frames = framesFor(s),
      f = frames[s.index],
      isShard = s.id === "replicated-shards";
    const moving = s.playing && s.progress > 0 && s.index < frames.length - 1;
    const messages = moving ? frames[s.index + 1].messages : f.messages;
    const paths = isShard ? shardPaths : protocolPaths;
    let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 ${isShard ? 590 : 444}" role="img" aria-label="${esc(s.section.querySelector("h2").textContent)}" font-family="system-ui,sans-serif"><title>${esc(s.section.querySelector("h2").textContent)}</title><desc>${esc(f.status)}</desc><rect width="960" height="100%" fill="${t("surface")}"/>`;
    svg += `<defs><marker id="${s.id}-message-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="10" markerHeight="10" markerUnits="userSpaceOnUse" orient="auto"><path d="M1 1 L9 5 L1 9" fill="none" stroke="${t("flow")}" stroke-width="2" stroke-linejoin="round"/></marker></defs>`;
    for (const p of paths)
      svg += `<path d="${pathD(p)}" fill="none" stroke="${t("border")}" stroke-width="1.8"/>`;
    svg +=
      box(310, 24, 340, isShard ? 124 : 132) +
      txt(480, 51, "TRANSACTION COORDINATOR", 14, "control") +
      txt(
        480,
        84,
        f.record ? `${f.record} · saved durably` : "No durable decision",
        20,
      ) +
      txt(480, 117, `${f.count}/2 participant votes received`, 15);
    if (!isShard) {
      f.parts.forEach((part, i) => {
        const x = i ? 580 : 100,
          c = x + 140;
        svg +=
          db(x, 276, 280, 100) +
          txt(c, 310, `PARTICIPANT ${i ? "B" : "A"}`, 14, "storage") +
          txt(c, 343, part, 18) +
          box(x, 394, 280, 34, "processing") +
          txt(
            c,
            412,
            `${i ? "row17" : "row42"} · ${f.locks[i] ? "LOCK HELD" : "UNLOCKED"}`,
            14,
            f.locks[i] ? "warning" : "success",
          );
      });
      svg += txt(
        480,
        251,
        s.id === "prepare"
          ? "Validate → durable prepare → vote"
          : "All YES → COMMIT   ·   Any NO → ABORT",
        15,
        "muted",
      );
    } else {
      f.records.forEach((records, i) => {
        const offset = i * 460,
          c = 250 + offset,
          count = records[0]
            ? records.filter((r) => r === records[0]).length
            : 0;
        svg +=
          `<rect x="${40 + offset}" y="242" width="420" height="330" rx="10" fill="none" stroke="${t("border")}" stroke-dasharray="6 5"/>` +
          txt(
            c,
            264,
            `SHARD ${i ? "B" : "A"} · independent consensus group`,
            15,
            "muted",
          );
        svg += `<path d="M${c} 388 V422 H${c - 100} V468 M${c} 422 H${c + 100} V468" fill="none" stroke="${t("border")}" stroke-width="1.8"/>`;
        svg +=
          db(c - 130, 290, 260, 98) +
          txt(c, 320, "LEADER", 14, "storage") +
          txt(c, 348, records[0] || "READY", 18) +
          txt(
            c,
            373,
            `${count}/3 copies · ${count >= 2 ? "quorum" : "need 2"}`,
            14,
            count >= 2 ? "success" : "muted",
          );
        records.slice(1).forEach((r, j) => {
          const rc = c + (j ? 100 : -100);
          svg +=
            db(rc - 82, 468, 164, 82) +
            txt(rc, 500, `REPLICA ${j + 1}`, 13, "storage") +
            txt(rc, 525, r || "—", 16);
        });
      });
    }
    messages.forEach((m) => {
      let points = m.replica ? replicaPaths[m.target] : paths[m.target];
      if (m.back) points = [...points].reverse();
      const [x, y] = point(points, moving ? Math.min(1, s.progress) : 1);
      svg += `<path d="${pathD(points)}" fill="none" stroke="${t("flow")}" stroke-width="2.5" stroke-linejoin="round" marker-end="url(#${s.id}-message-arrow)"/>`;
      if (moving)
        svg += `<rect x="${x - 6}" y="${y - 6}" width="12" height="12" rx="2" fill="${t("focus")}"/>`;
      const lx = m.replica ? (m.target ? 655 : 195) : m.target ? 710 : 250,
        ly = m.replica ? 448 : isShard ? 222 : 190;
      svg += txt(lx, ly, `${m.back ? "↑" : "↓"} ${m.label}`, 15, "flow");
    });
    svg += "</svg>";
    s.section.querySelector(".stage").innerHTML = svg;
    s.section.dataset.state = JSON.stringify({ step: s.index, ...f });
    s.section.querySelector(".event").textContent =
      moving && messages.length
        ? `${messages.map((m) => m.label).join(" / ")} in transit. State changes when delivery completes.`
        : f.status;
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
  function stop(s) {
    s.playing = false;
    s.progress = 0;
    s.last = 0;
  }
  scenes.forEach((s) => {
    s.section.querySelector(".playback").innerHTML =
      '<button data-action="play">Play</button><button data-action="step">Step</button><button data-action="reset">Replay</button><span class="progress"></span><button data-action="export">Save SVG</button>';
    s.section.querySelector(".playback").addEventListener("click", (event) => {
      const action = event.target.dataset.action;
      if (action === "play") {
        if (s.playing) stop(s);
        else {
          s.playing = true;
          s.last = performance.now();
          if (!animation) animation = requestAnimationFrame(tick);
        }
      }
      if (action === "step") {
        stop(s);
        s.index = Math.min(s.index + 1, framesFor(s).length - 1);
      }
      if (action === "reset") {
        stop(s);
        s.index = 0;
      }
      render(s);
      if (action === "export") {
        const blob = new Blob([s.section.querySelector("svg").outerHTML], {
            type: "image/svg+xml",
          }),
          url = URL.createObjectURL(blob),
          a = document.createElement("a");
        a.href = url;
        a.download = `distributed-transactions-${s.id}-${theme}.svg`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      }
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
        const s = scenes[1];
        stop(s);
        s.index = 0;
        render(s);
      }),
  );
  document.addEventListener("visibilitychange", () => {
    if (document.hidden)
      scenes.forEach((s) => {
        stop(s);
        render(s);
      });
  });
  reduced.addEventListener("change", () =>
    scenes.forEach((s) => {
      stop(s);
      render(s);
    }),
  );
  function tick(now) {
    animation = 0;
    scenes.forEach((s) => {
      if (!s.playing) return;
      const elapsed = now - s.last;
      s.progress = Math.max(0, (elapsed - 650) / 1100);
      if (s.progress >= 1) {
        s.index++;
        s.progress = 0;
        s.last = now;
        if (s.index === framesFor(s).length - 1) stop(s);
      }
      render(s);
    });
    if (scenes.some((s) => s.playing)) animation = requestAnimationFrame(tick);
  }
  applyTheme();
})();
