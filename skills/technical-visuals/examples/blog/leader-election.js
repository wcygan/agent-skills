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
    playing = !reduce.matches,
    frame = 0,
    anchor = 0;
  let visible = false, packetViews = [], timerViews = [], lastLabels = -Infinity;
  let theme;
  try {
    theme = localStorage.getItem("visual-lab-theme");
  } catch {}
  if (!["dark", "light"].includes(theme))
    theme = matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  const identities = { A: "processing", B: "storage", C: "flow", D: "control", E: "warning" };
  const portrait = matchMedia("(max-width: 600px)");
  const desktopCenters = {
    A: [500, 100],
    B: [790, 270],
    C: [680, 510],
    D: [320, 510],
    E: [210, 270],
  };
  const portraitCenters = {
    A: [188, 70], B: [298, 220], C: [268, 510],
    D: [108, 510], E: [78, 220],
  };
  let centers = portrait.matches ? portraitCenters : desktopCenters;
  const esc = (v) =>
    String(v)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll('"', "&quot;");
  function text(x, y, str, size = 14, color = "text", weight = 400) {
    if (portrait.matches) size = Math.max(14, size);
    return `<text x="${x}" y="${y}" fill="${window.visualTokens[theme][color]}" text-anchor="middle" dominant-baseline="middle" font-size="${size}" font-weight="${weight}">${esc(str)}</text>`;
  }
  function route(from, to) {
    const [ax, ay] = centers[from],
      [bx, by] = centers[to],
      dx = bx - ax,
      dy = by - ay;
    const f = Math.min(70 / Math.abs(dx), 50 / Math.abs(dy));
    return [ax + dx * f, ay + dy * f, bx - dx * f, by - dy * f];
  }
  function roleIcon(role, x, y) {
    const t = window.visualTokens[theme];
    if (role === "leader")
      return `<g data-role-icon="leader" transform="translate(${x} ${y})" role="img" aria-label="Leader"><title>Leader</title><path d="M11 1 14 7.5 21 8.5 16 13.5 17.2 21 11 17.5 4.8 21 6 13.5 1 8.5 8 7.5Z" fill="#ffd34e" stroke="#805600" stroke-width="1.5" stroke-linejoin="round"/></g>`;
    if (role === "candidate")
      return `<g data-role-icon="candidate" transform="translate(${x} ${y})" role="img" aria-label="Candidate ballot box"><title>Candidate ballot box</title><path d="M2 10H20V21H2Z" fill="${t.surface}" stroke="${t.text}" stroke-width="1.5" stroke-linejoin="round"/><path d="M6 10 8 7H16L18 10" fill="${t.raised}" stroke="${t.text}" stroke-width="1.5"/><path d="M8 1H15V11H8Z" fill="${t.surface}" stroke="${t.text}" stroke-width="1.5"/><path d="m9.5 5 1.5 1.5 2.5-3M6 12H17" fill="none" stroke="${t.text}" stroke-width="1.3"/><path d="M8 16H14" stroke="${t.muted}" stroke-width="1.5"/></g>`;
    return "";
  }
  function render() {
    centers = portrait.matches ? portraitCenters : desktopCenters;
    const width = portrait.matches ? 376 : 1000, height = portrait.matches ? 580 : 620;
    const t = window.visualTokens[theme],
      leader = currentLeader(s);
    let parts = [
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="raft-title raft-desc" font-family="system-ui,sans-serif"><title id="raft-title">Five-node Raft election at ${(s.now / 1000).toFixed(2)} model seconds</title><desc id="raft-desc">${esc(s.status)} Solid arrows continuously connect the current leader to its online peers. Other routes carry election messages. Node colors identify peers, independently of their roles. Moving letters identify heartbeat, request, granted and denied vote packets.</desc><defs><marker id="arrow" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10" fill="${t.border}"/></marker></defs><rect width="${width}" height="${height}" fill="${t.surface}"/>`,
    ];
    const leaderLinks = leader ? NODES.filter((id) => id !== leader && !s.crashed.includes(id)).map((id) => `${leader}${id}`) : [];
    const links = [...new Set([...leaderLinks, ...s.packets.map((p) => `${p.from}${p.to}`)])];
    for (const link of links) {
      const [x1, y1, x2, y2] = route(link[0], link[1]);
      parts.push(
        `<line data-route="${link}" data-leader-route="${leaderLinks.includes(link)}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${t.border}" stroke-width="${leaderLinks.includes(link) ? 1.8 : 1.25}" stroke-dasharray="${leaderLinks.includes(link) ? "none" : "5 4"}" marker-end="url(#arrow)"/>`,
      );
    }
    // Packet centers follow the same clipped segment as their connector.
    for (const p of s.packets) {
      const [x1, y1, x2, y2] = route(p.from, p.to),
        progress = Math.min(
          1,
          Math.max(0, (s.now - p.sentAt) / (p.arrivesAt - p.sentAt)),
        );
      const dx = x2 - x1,
        dy = y2 - y1,
        x = x1 + dx * progress,
        y = y1 + dy * progress;
      const role =
        p.kind === "heartbeat"
          ? "failure"
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
        `<g data-packet="${p.id}" data-from="${p.from}" data-to="${p.to}" transform="translate(${x} ${y})"><title>${p.from} → ${p.to}: ${p.kind}${p.kind === "reply" ? (p.granted ? " granted" : " denied") : ""}, term ${p.term}</title><rect x="-12" y="-12" width="24" height="24" rx="5" fill="${t.surface}" stroke="${t[role]}" stroke-width="1.8"/>${text(0, 0, label, 15, role, 650)}</g>`,
      );
    }
    for (const id of NODES) {
      const n = s.nodes[id],
        [x, y] = centers[id],
        dead = s.crashed.includes(id),
        role = dead ? "crashed" : n.role;
      const identity = identities[id], border = t[identity];
      const fill = t[`${identity}Fill`] ?? `color-mix(in srgb, ${t.warning} 12%, ${t.surface})`;
      const remaining = dead ? s.recoverAt[id] - s.now : n.deadline - s.now,
        duration = dead ? RECOVERY_DELAY : n.timerDuration;
      const fraction = Number.isFinite(remaining)
        ? Math.min(1, Math.max(0, remaining / duration))
        : 1;
      parts.push(
        `<g data-node="${id}" data-role="${role}" data-identity="${identity}"><rect x="${x - 70}" y="${y - 50}" width="140" height="100" rx="8" fill="${fill}" stroke="${border}" stroke-dasharray="${dead ? "5 4" : "none"}" stroke-width="${n.role === "leader" && !dead ? 3 : 1.8}"/><title>${id}: ${role}</title>${roleIcon(role, x - 59, y - 40)}${text(x, y - 27, dead ? `${id} · crashed` : id, dead ? 16 : 23, "text", 650)}<g data-node-term="${n.term}">${text(x, y - 1, `Term ${n.term}`, 13, "muted")}</g><g data-node-vote="${n.votedFor ?? ""}">${text(x, y + 19, `Vote ${n.votedFor ? `→ ${n.votedFor}` : "—"}`, 13, "text")}</g><rect x="${x - 50}" y="${y + 36}" width="100" height="4" rx="2" fill="${t.subtle}"/><rect x="${x - 50}" y="${y + 36}" data-timer-bar="${id}" width="${100 * fraction}" height="4" rx="2" fill="${border}"/></g>`,
      );
    }
    parts.push("</svg>");
    network.innerHTML = parts.join("");
    packetViews = s.packets.map((packet) => {
      const [x1, y1, x2, y2] = route(packet.from, packet.to);
      const dx = x2 - x1, dy = y2 - y1;
      return { packet, element: network.querySelector(`[data-packet="${packet.id}"]`),
        x: x1, y: y1, dx, dy };
    });
    timerViews = NODES.map((id) => ({ id,
      bar: network.querySelector(`[data-timer-bar="${id}"]`) }));
    updateLabels();
    updatePlayback();
    updateState();
  }
  function updateLabels() {
    const leader = currentLeader(s);
    document.querySelector("#clock").textContent =
      `Model time ${(s.now / 1000).toFixed(2)} s · ${leader ? `leader ${leader}, term ${s.nodes[leader].term}` : "no active leader"}`;
    const summary = leader ? `${leader} leads · term ${s.nodes[leader].term}`
      : s.splitSeen ? "Split vote · retrying" : "No leader · election in progress";
    document.querySelector("#summary").textContent = summary;
    const status = document.querySelector("#status");
    if (status.textContent !== s.status) status.textContent = s.status;
    crash.disabled = !leader;
    crash.textContent = leader
      ? `Crash leader ${leader}`
      : "No leader to crash";
  }
  function updatePlayback() {
    document.querySelector("#playback-state").textContent =
      `½ speed · ${playing ? (visible && !document.hidden ? "playing" : "waiting for view") : "paused"}`;
    play.textContent = playing ? "Pause" : "Play";
    play.setAttribute("aria-pressed", String(playing));
  }
  function updateState() {
    const leader = currentLeader(s);
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
  function animate(now) {
    for (const { packet, element, x, y, dx, dy } of packetViews) {
      const progress = Math.min(1, Math.max(0,
        (s.now - packet.sentAt) / (packet.arrivesAt - packet.sentAt)));
      element.setAttribute("transform", `translate(${x + dx * progress} ${y + dy * progress})`);
    }
    const labelsDue = now - lastLabels >= 100;
    for (const { id, bar } of timerViews) {
      const n = s.nodes[id], dead = s.crashed.includes(id);
      const remaining = dead ? s.recoverAt[id] - s.now : n.deadline - s.now;
      const duration = dead ? RECOVERY_DELAY : n.timerDuration;
      bar.setAttribute("width", 100 * (Number.isFinite(remaining)
        ? Math.min(1, Math.max(0, remaining / duration)) : 1));
    }
    if (labelsDue) {
      lastLabels = now;
      updateLabels();
      updateState();
    }
  }
  function syncPlayback() {
    cancelAnimationFrame(frame);
    frame = 0;
    anchor = 0;
    if (playing && visible && !document.hidden) frame = requestAnimationFrame(tick);
    updatePlayback();
  }
  function stop() {
    playing = false;
    syncPlayback();
    updateState();
  }
  function tick(now) {
    frame = 0;
    if (!playing || !visible || document.hidden) return;
    const target = s.now + (anchor ? Math.min(100, now - anchor) * 0.5 : 0);
    anchor = now;
    if (nextEventAt(s) <= target) {
      s = transition(s, { type: "advance", to: target });
      render();
    } else s.now = target;
    animate(now);
    frame = requestAnimationFrame(tick);
  }
  play.onclick = () => {
    playing = !playing;
    syncPlayback();
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
    playing = !reduce.matches;
    render();
    syncPlayback();
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
  document.addEventListener("visibilitychange", syncPlayback);
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    syncPlayback();
  }, { threshold: 0 }).observe(network);
  reduce.addEventListener("change", () => {
    if (reduce.matches) stop();
  });
  portrait.addEventListener("change", render);
  applyTheme();
})();
