// Protocol model adapted from wcygan.net/src/demos/raft-election/model.ts.
// Retains deterministic event ordering, durable votes, and recovery scheduling.
(() => {
  const NODES = ["A", "B", "C", "D", "E"];
  const MAJORITY = 3;
  // 2,500 model milliseconds equals five seconds at half-speed playback.
  const RECOVERY_DELAY = 2500;
  // Deliberately stretched, repeatable teaching schedules, not production timings.
  function timeout(s, id) {
    const n = s.nodes[id];
    if (!s.election.peers.includes(id) && n.role === "follower") return 3600;
    if (n.role === "candidate")
      return 2400 + Math.max(0, s.election.peers.indexOf(id)) * 900;
    if (
      s.scenario === "split" &&
      n.term < s.election.term &&
      s.election.peers.slice(0, 2).includes(id)
    )
      return 1500;
    return 1500 + Math.max(0, s.election.peers.indexOf(id)) * 700;
  }
  function resetTimer(s, id) {
    s.nodes[id].timerDuration = timeout(s, id);
    s.nodes[id].deadline = s.now + s.nodes[id].timerDuration;
  }
  function send(s, from, to, kind, granted) {
    const node = s.nodes[from];
    let delay = 700;
    if (
      s.scenario === "split" &&
      node.term === s.election.term &&
      kind === "request"
    ) {
      const [first, second, firstVoter, secondVoter] = s.election.peers;
      delay =
        (from === first && to === firstVoter) ||
        (from === second && to === secondVoter)
          ? 700
          : 1000;
      // The recovering fifth voter is on the slower path in the split schedule.
      if (!s.election.peers.includes(to)) delay = 2000;
    }
    s.packets.push({
      id: s.nextId++,
      from,
      to,
      kind,
      granted,
      term: node.term,
      sentAt: s.now,
      arrivesAt: s.now + delay,
    });
  }
  function heartbeat(s, id) {
    s.nodes[id].heartbeatAt = s.now + 650;
    for (const peer of NODES) if (peer !== id) send(s, id, peer, "heartbeat");
  }
  function follow(s, id, term) {
    const n = s.nodes[id];
    n.role = "follower";
    n.term = term;
    n.votedFor = null;
    n.votes = [];
    n.leader = null;
    n.heartbeatAt = Infinity;
    resetTimer(s, id);
  }
  function receive(s, p) {
    if (s.crashed.includes(p.to)) return;
    const n = s.nodes[p.to];
    if (p.term > n.term) follow(s, p.to, p.term);
    if (p.term < n.term) {
      if (p.kind === "request") send(s, p.to, p.from, "reply", false);
      return;
    }
    if (p.kind === "heartbeat") {
      n.role = "follower";
      n.leader = p.from;
      n.votes = [];
      n.heartbeatAt = Infinity;
      resetTimer(s, p.to);
    } else if (p.kind === "request") {
      const granted = n.votedFor === null || n.votedFor === p.from;
      if (granted) {
        n.votedFor = p.from;
        resetTimer(s, p.to);
      }
      send(s, p.to, p.from, "reply", granted);
    } else if (
      n.role === "candidate" &&
      p.granted &&
      !n.votes.includes(p.from)
    ) {
      n.votes.push(p.from);
      if (n.votes.length >= MAJORITY) {
        n.role = "leader";
        n.leader = p.to;
        n.deadline = Infinity;
        s.status = `${p.to} received ${n.votes.length} of 5 votes in term ${n.term}. It is leader and sends heartbeats.`;
        heartbeat(s, p.to);
      }
    }
  }
  function elect(s, id) {
    const n = s.nodes[id];
    n.term++;
    n.role = "candidate";
    n.votedFor = id;
    n.votes = [id];
    n.leader = null;
    resetTimer(s, id);
    s.status = `${id} timed out, started term ${n.term}, and voted for itself. It requests votes from its peers.`;
    for (const peer of NODES) if (peer !== id) send(s, id, peer, "request");
  }
  function createSimulation(scenario = "success") {
    const s = {
      now: 0,
      scenario,
      nextId: 1,
      crashed: [],
      recoverAt: {},
      splitSeen: false,
      election: { term: 2, peers: ["A", "C", "D", "E"] },
      packets: [],
      status: "B leads term 1. Crash the leader to follow the election.",
      nodes: Object.fromEntries(
        NODES.map((id) => [
          id,
          {
            role: id === "B" ? "leader" : "follower",
            term: 1,
            votedFor: "B",
            votes: [],
            deadline: Infinity,
            timerDuration: 1500,
            heartbeatAt: Infinity,
            leader: "B",
          },
        ]),
      ),
    };
    for (const id of NODES) if (id !== "B") resetTimer(s, id);
    heartbeat(s, "B");
    return s;
  }
  function nextEventAt(s) {
    return Math.min(
      ...Object.values(s.recoverAt),
      ...s.packets.map((p) => p.arrivesAt),
      ...NODES.filter((id) => !s.crashed.includes(id)).map((id) =>
        s.nodes[id].role === "leader"
          ? s.nodes[id].heartbeatAt
          : s.nodes[id].deadline,
      ),
    );
  }
  function transition(state, action) {
    if (action.type === "reset")
      return createSimulation(action.scenario ?? state.scenario);
    const s = structuredClone(state);
    if (action.type === "scenario") {
      applyScenario(s, action.scenario);
      return s;
    }
    if (action.type === "crash") {
      const leader = currentLeader(s);
      if (!leader) return state;
      applyScenario(s, s.scenario);
      s.crashed.push(leader);
      s.recoverAt[leader] = s.now + RECOVERY_DELAY;
      s.status = `${leader} has crashed and will return as a follower after five seconds of playback. Peers only observe silence; their election timers keep running.`;
      return s;
    }
    const target = action.type === "step" ? nextEventAt(s) : action.to;
    if (!Number.isFinite(target) || target < s.now) return state;
    while (nextEventAt(s) <= target) {
      s.now = nextEventAt(s);
      // Recovery precedes deliveries at the same timestamp. Durable term/vote survive.
      for (const id of s.crashed) {
        if ((s.recoverAt[id] ?? Infinity) > s.now) continue;
        delete s.recoverAt[id];
        const n = s.nodes[id];
        n.role = "follower";
        n.votes = [];
        n.leader = null;
        n.heartbeatAt = Infinity;
        resetTimer(s, id);
        s.status = `${id} is back online as a follower. Its term and vote survive the crash; messages tell it who leads.`;
      }
      s.crashed = s.crashed.filter((id) => s.recoverAt[id] !== undefined);
      // Deliveries precede timeouts at the same timestamp. No observer sees partial batches.
      const arriving = s.packets
        .filter((p) => p.arrivesAt <= s.now)
        .sort((a, b) => a.id - b.id);
      s.packets = s.packets.filter((p) => p.arrivesAt > s.now);
      for (const p of arriving) receive(s, p);
      for (const id of NODES) {
        if (s.crashed.includes(id)) continue;
        const n = s.nodes[id];
        if (n.role === "leader") {
          if (n.heartbeatAt <= s.now) heartbeat(s, id);
        } else if (n.deadline <= s.now) elect(s, id);
      }
      const contenders = s.election.peers.filter(
        (id) =>
          !s.crashed.includes(id) &&
          s.nodes[id].role === "candidate" &&
          s.nodes[id].term === s.election.term,
      );
      if (
        !s.splitSeen &&
        contenders.length >= 2 &&
        !s.packets.some(
          (p) =>
            p.term === s.election.term &&
            p.kind !== "heartbeat" &&
            s.election.peers.includes(p.from) &&
            s.election.peers.includes(p.to),
        )
      ) {
        s.splitSeen = true;
        s.status = `Split vote in term ${s.election.term}: ${contenders.map((id) => `${id} has ${s.nodes[id].votes.length} of 5 votes`).join("; ")}. Neither has a majority. Their retry timers differ.`;
      }
      const winner = currentLeader(s);
      if (
        winner &&
        s.nodes[winner].term > 1 &&
        NODES.filter((id) => !s.crashed.includes(id) && id !== winner).every(
          (id) =>
            s.nodes[id].leader === winner &&
            s.nodes[id].term === s.nodes[winner].term,
        )
      ) {
        s.status = `${winner} leads term ${s.nodes[winner].term}. Heartbeats continue. Crash the leader again to trigger another election.`;
      } else if (s.crashed.length > NODES.length - MAJORITY) {
        s.status =
          "Fewer than three nodes remain online. Candidates keep retrying, but cannot win a majority. Reset to restore the cluster.";
      }
    }
    s.now = target;
    return s;
  }

  function currentLeader(s) {
    return NODES.find(
      (id) => !s.crashed.includes(id) && s.nodes[id].role === "leader",
    );
  }

  /** Change only future scheduling; delivered votes and traveling packets stay real. */
  function applyScenario(s, scenario) {
    const leader = currentLeader(s);
    // Rotate the teaching schedule around the current leader. Node IDs do not
    // confer a permanent timeout advantage; elections still require real votes.
    const cycle = ["B", "A", "C", "D", "E"];
    const offset = leader ? cycle.indexOf(leader) + 1 : 0;
    const order = leader
      ? [...cycle.slice(offset), ...cycle.slice(0, offset)]
      : [
          ...s.election.peers,
          ...NODES.filter((id) => !s.election.peers.includes(id)),
        ];
    const peers = order.filter(
      (id) => !s.crashed.includes(id) && id !== leader,
    );
    s.scenario = scenario;
    s.splitSeen = false;
    s.election = {
      peers,
      term:
        Math.max(
          ...peers.map((id) => s.nodes[id].term),
          leader ? s.nodes[leader].term : 0,
        ) + 1,
    };
    // Preserve elapsed time. Switching scenarios never restarts a timer or clock.
    for (const id of peers) {
      const n = s.nodes[id];
      const startedAt = n.deadline - n.timerDuration;
      n.timerDuration = timeout(s, id);
      n.deadline = Math.max(s.now + 1, startedAt + n.timerDuration);
    }
    if (scenario === "split" && peers.length >= 2) {
      const first = s.nodes[peers[0]],
        second = s.nodes[peers[1]];
      const deadline = Math.min(first.deadline, second.deadline);
      for (const n of [first, second]) {
        const startedAt = n.deadline - n.timerDuration;
        n.deadline = deadline;
        n.timerDuration = Math.max(1, deadline - startedAt);
      }
    }
  }

  const section = document.querySelector("[data-figure]");
  const network = document.querySelector("#network");
  const play = section.querySelector('[data-action="play"]');
  const crash = section.querySelector('[data-action="crash"]');
  const reduce = matchMedia("(prefers-reduced-motion: reduce)");
  let s = createSimulation(),
    playing = false,
    frame = 0,
    anchor = 0;
  let theme;
  try {
    theme = localStorage.getItem("visual-lab-theme");
  } catch {}
  if (!["dark", "light"].includes(theme))
    theme = matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  const centers = {
    A: [500, 100],
    B: [790, 270],
    C: [680, 510],
    D: [320, 510],
    E: [210, 270],
  };
  const esc = (v) =>
    String(v)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll('"', "&quot;");
  function text(x, y, str, size = 14, color = "text", weight = 400) {
    return `<text x="${x}" y="${y}" fill="${window.visualTokens[theme][color]}" text-anchor="middle" dominant-baseline="middle" font-size="${size}" font-weight="${weight}">${esc(str)}</text>`;
  }
  function route(from, to) {
    const [ax, ay] = centers[from],
      [bx, by] = centers[to],
      dx = bx - ax,
      dy = by - ay;
    const f = Math.min(112 / Math.abs(dx), 87 / Math.abs(dy));
    return [ax + dx * f, ay + dy * f, bx - dx * f, by - dy * f];
  }
  function render() {
    const t = window.visualTokens[theme],
      leader = currentLeader(s);
    let parts = [
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 620" role="img" aria-labelledby="raft-title raft-desc" font-family="system-ui,sans-serif"><title id="raft-title">Five-node Raft election at ${(s.now / 1000).toFixed(2)} model seconds</title><desc id="raft-desc">${esc(s.status)} Lines connect sending and receiving peers. Moving letters identify heartbeat, request, granted and denied vote packets.</desc><defs><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10" fill="${t.border}"/></marker></defs><rect width="1000" height="620" fill="${t.surface}"/>`,
    ];
    const links = [...new Set(s.packets.map((p) => `${p.from}${p.to}`))];
    for (const link of links) {
      const [x1, y1, x2, y2] = route(link[0], link[1]);
      parts.push(
        `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${t.border}" stroke-width="1.25" marker-end="url(#arrow)"/>`,
      );
    }
    // Packets use the same clipped path as the route. Reverse traffic gets a lane offset.
    for (const p of s.packets) {
      const [x1, y1, x2, y2] = route(p.from, p.to),
        progress = Math.min(
          1,
          Math.max(0, (s.now - p.sentAt) / (p.arrivesAt - p.sentAt)),
        );
      const dx = x2 - x1,
        dy = y2 - y1,
        len = Math.hypot(dx, dy),
        x = x1 + dx * progress - (dy / len) * 10,
        y = y1 + dy * progress + (dx / len) * 10;
      const role =
        p.kind === "heartbeat"
          ? "flow"
          : p.kind === "request"
            ? "control"
            : p.granted
              ? "success"
              : "failure";
      const label =
        p.kind === "heartbeat"
          ? "♥"
          : p.kind === "request"
            ? "R"
            : p.granted
              ? "✓"
              : "×";
      parts.push(
        `<g data-packet="${p.id}"><title>${p.from} → ${p.to}: ${p.kind}${p.kind === "reply" ? (p.granted ? " granted" : " denied") : ""}, term ${p.term}</title><rect x="${x - 12}" y="${y - 12}" width="24" height="24" rx="5" fill="${t.surface}" stroke="${t[role]}" stroke-width="1.8"/>${text(x, y, label, 15, role, 650)}</g>`,
      );
    }
    for (const id of NODES) {
      const n = s.nodes[id],
        [x, y] = centers[id],
        dead = s.crashed.includes(id),
        role = dead ? "crashed" : n.role;
      const border = dead
        ? t.failure
        : n.role === "leader"
          ? t.focus
          : t.control;
      const remaining = dead ? s.recoverAt[id] - s.now : n.deadline - s.now,
        duration = dead ? RECOVERY_DELAY : n.timerDuration;
      const fraction = Number.isFinite(remaining)
        ? Math.min(1, Math.max(0, remaining / duration))
        : 1;
      const timer = dead
        ? `Recovery ${(remaining / 1000).toFixed(2)} s`
        : n.role === "leader"
          ? "Heartbeats every 0.65 s"
          : `Timeout ${Math.max(0, remaining / 1000).toFixed(2)} s`;
      parts.push(
        `<g data-node="${id}" data-role="${role}"><rect x="${x - 90}" y="${y - 65}" width="180" height="130" rx="8" fill="${dead ? t.raised : t.controlFill}" stroke="${border}" stroke-width="${n.role === "leader" && !dead ? 3 : 1.8}"/>${text(x, y - 42, `${id} · ${role}`, 17, dead ? "failure" : n.role === "leader" ? "focus" : "text", 650)}${text(x, y - 17, `Term ${n.term} · voted ${n.votedFor ?? "—"}`, 13)}${text(x, y + 5, n.role === "candidate" && !dead ? `${n.votes.length} / 5 votes · need 3` : dead ? "Durable term & vote kept" : n.leader ? `Leader known: ${n.leader}` : "Awaiting a leader", 12, "muted")}<rect x="${x - 70}" y="${y + 25}" width="140" height="5" rx="2" fill="${t.subtle}"/><rect x="${x - 70}" y="${y + 25}" width="${140 * fraction}" height="5" rx="2" fill="${border}"/>${text(x, y + 46, timer, 12, "muted")}</g>`,
      );
    }
    parts.push("</svg>");
    network.innerHTML = parts.join("");
    document.querySelector("#clock").textContent =
      `Model time ${(s.now / 1000).toFixed(2)} s · ${leader ? `leader ${leader}, term ${s.nodes[leader].term}` : "no active leader"}`;
    const status = document.querySelector("#status");
    if (status.textContent !== s.status) status.textContent = s.status;
    crash.disabled = !leader;
    crash.textContent = leader
      ? `Crash leader ${leader}`
      : "No leader to crash";
    document.querySelector("#playback-state").textContent = `½ speed · ${playing ? "playing" : "paused"}`;
    play.textContent = playing ? "Pause" : "Play";
    play.setAttribute("aria-pressed", String(playing));
    section.dataset.state = JSON.stringify({
      now: s.now,
      scenario: s.scenario,
      leader: leader ?? null,
      splitSeen: s.splitSeen,
      crashed: s.crashed,
      nodes: Object.fromEntries(
        NODES.map((id) => [
          id,
          {
            role: s.nodes[id].role,
            term: s.nodes[id].term,
            votedFor: s.nodes[id].votedFor,
            votes: s.nodes[id].votes,
            leader: s.nodes[id].leader,
          },
        ]),
      ),
      packets: s.packets.map((p) => ({
        kind: p.kind,
        from: p.from,
        to: p.to,
        granted: p.granted,
      })),
    });
  }
  function applyTheme() {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    Object.entries(window.visualTokens[theme]).forEach(([k, v]) =>
      document.documentElement.style.setProperty(`--${k}`, v),
    );
    document
      .querySelector("#theme")
      .setAttribute("aria-pressed", String(theme === "dark"));
    document
      .querySelector("#theme")
      .setAttribute(
        "aria-label",
        `Switch to ${theme === "dark" ? "light" : "dark"} theme`,
      );
    render();
  }
  function stop() {
    playing = false;
    cancelAnimationFrame(frame);
    frame = 0;
    render();
  }
  function tick(now) {
    if (!playing) return;
    s = transition(s, {
      type: "advance",
      to: s.now + Math.min(100, now - anchor) * 0.5,
    });
    anchor = now;
    render();
    frame = requestAnimationFrame(tick);
  }
  play.onclick = () => {
    if (playing) stop();
    else {
      playing = true;
      anchor = performance.now();
      render();
      frame = requestAnimationFrame(tick);
    }
  };
  section.querySelector('[data-action="step"]').onclick = () => {
    stop();
    s = transition(s, { type: "step" });
    render();
  };
  crash.onclick = () => {
    s = transition(s, { type: "crash" });
    render();
  };
  section.querySelector('[data-action="reset"]').onclick = () => {
    stop();
    s = createSimulation(document.querySelector("#scenario").value);
    render();
  };
  document.querySelector("#scenario").onchange = (e) => {
    s = transition(s, { type: "scenario", scenario: e.target.value });
    render();
  };
  document.querySelector("#theme").onclick = () => {
    theme = theme === "light" ? "dark" : "light";
    try {
      localStorage.setItem("visual-lab-theme", theme);
    } catch {}
    applyTheme();
  };
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stop();
  });
  reduce.addEventListener("change", () => {
    if (reduce.matches) stop();
  });
  section.querySelector('[data-action="export"]').onclick = () => {
    const blob = new Blob([network.innerHTML], { type: "image/svg+xml" }),
      url = URL.createObjectURL(blob),
      a = document.createElement("a");
    a.href = url;
    a.download = `raft-election-${theme}-${Math.round(s.now)}.svg`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  applyTheme();
})();
