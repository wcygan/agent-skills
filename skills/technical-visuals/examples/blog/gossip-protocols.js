(() => {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  let theme =
    localStorage.getItem("visual-lab-theme") ||
    (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  let t;
  const sections = [...document.querySelectorAll("[data-figure]")];
  const models = [
    { turn: 0, infected: new Set([14]), edges: [], seed: 1947 },
    { count: 0 },
  ];
  const timers = [null, null];
  const pending = [null, null];
  const flightMs = [720, 900];
  const playing = [false, false];
  const wanted = [!reduced.matches, !reduced.matches];
  const visible = [false, false];
  const remaining = [1000, 1600];
  const deadline = [0, 0];
  const duration = (i) => i ? 1600 / Number(document.querySelector("#speed").value) : 1000;
  const compact = matchMedia("(max-width: 600px)");
  const desktopPositions = {
    A: [330, 140],
    B: [700, 140],
    C: [700, 360],
    D: [330, 360],
    E: [100, 250],
  };
  const exchanges = [
    ["E", "A"],
    ["A", "B"],
    ["B", "C"],
    ["A", "D"],
  ];
  const labels = ["Waiting for E.", "E arrives.", "A knows E.", "B knows E.", "C knows E.", "Everyone knows E."];
  const text = (x, y, value, size = 15, color = t.text) =>
    `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="middle" font-size="${size}" fill="${color}">${value}</text>`;
  const line = (a, b, color = t.border, dash = "") =>
    `<path d="M${a} L${b}" fill="none" stroke="${color}" stroke-width="2" ${dash ? 'stroke-dasharray="6 6"' : ""}/>`;
  function packet(a, b, animate, i) {
    if (!animate || reduced.matches) return '';
    return `<g data-packet="${i}" data-motion-from="${a}" data-motion-to="${b}" transform="translate(${a})"><circle r="${i ? 14 : 6}" fill="${i ? t.flowFill : t.flow}" stroke="${i ? t.flow : t.surface}" stroke-width="2"/>${i ? text(0,0,'E',14,t.flow) : ''}</g>`;
  }

  function mount(i, markup) {
    const stage = sections[i].querySelector('.stage');
    const old = stage.querySelector('svg');
    if (!old) { stage.innerHTML = markup; return; }
    const template = document.createElement('template');
    template.innerHTML = markup;
    old.setAttribute('viewBox', template.content.firstElementChild.getAttribute('viewBox'));
    old.innerHTML = template.content.firstElementChild.innerHTML;
    old.setCurrentTime(0);

  }
  let frame = null;
  function paint(i, left) {
    if (!pending[i]) return;
    const progress = Math.max(0, Math.min(1, 1 - (left - 34) / flightMs[i]));
    const eased = progress * progress * (3 - 2 * progress);
    if (i === 0) {
      const bar = sections[0].querySelector('[data-infection-progress]');
      const count = models[0].infected.size
        + (pending[0].infected.size - models[0].infected.size) * eased;
      bar.setAttribute('width', Number(bar.dataset.fullWidth) * count / 36);
    }
    sections[i].querySelectorAll('[data-motion-from]').forEach(node => {
      const from = node.dataset.motionFrom.split(',').map(Number);
      const to = node.dataset.motionTo.split(',').map(Number);
      node.setAttribute('transform', `translate(${from[0] + (to[0]-from[0])*eased} ${from[1] + (to[1]-from[1])*eased})`);
    });
  }
  function animateFrames() {
    frame = null;
    let active = false;
    sections.forEach((_, i) => {
      if (playing[i] && pending[i]) { paint(i, deadline[i] - performance.now()); active = true; }
    });
    if (active) frame = requestAnimationFrame(animateFrames);
  }
  function requestFrames() {
    if (frame === null) frame = requestAnimationFrame(animateFrames);
  }
  function svg(title, content, figure = 0) {
    const width = compact.matches ? 360 : 1000;
    const height = compact.matches ? (figure ? 540 : 450) : 490;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="${title}"><title>${title}</title><rect width="${width}" height="${height}" fill="${t.surface}"/><g font-family="system-ui, sans-serif">${content}</g></svg>`;
  }
  function epidemic(animate) {
    const s = models[0],
      edges = pending[0]?.edges || s.edges,
      point = (i) => compact.matches ? [45 + (i % 6) * 54, 40 + Math.floor(i / 6) * 54] : [95 + (i % 6) * 65, 65 + Math.floor(i / 6) * 65];
    const half = compact.matches ? 20 : 22;
    let content = '';
    edges.forEach(([a, b]) => { content += line(point(a), point(b), t.flow); });
    for (let i = 0; i < 36; i++) {
      const [x, y] = point(i),
        infected = s.infected.has(i),
        fresh = edges.some((e) => e[1] === i);
      content +=
        `<rect x="${x - half}" y="${y - half}" width="${half * 2}" height="${half * 2}" rx="6" fill="${infected ? t.flowFill : t.storageFill}" stroke="${fresh ? t.focus : infected ? t.flow : t.storage}" stroke-width="${fresh ? 3 : 1.5}"/>` +
        text(x, y, infected ? "+" : "−", 22, infected ? t.flow : t.storage);
    }
    if (pending[0]) edges.forEach(([a,b]) => { content += packet(point(a), point(b), animate, 0); });
    const metricX = compact.matches ? 180 : 730;
    const metricY = compact.matches ? 365 : 150;
    const barWidth = compact.matches ? 270 : 280;
    content += text(metricX, metricY, `${s.infected.size} / 36`, 30)
      + text(metricX, metricY + 34, `infected · turn ${s.turn}`, 16, t.muted)
      + `<rect x="${metricX-barWidth/2}" y="${metricY+58}" width="${barWidth}" height="8" rx="4" fill="${t.raised}"/><rect x="${metricX-barWidth/2}" y="${metricY+58}" data-infection-progress data-full-width="${barWidth}" aria-hidden="true" width="${barWidth*s.infected.size/36}" height="8" rx="4" fill="${t.flow}"/>`;
    if (!compact.matches) content += text(metricX, 300, '+ Infected     − Uninfected', 18)
      + text(metricX, 345, 'Orange = new contact', 16, t.focus);
    mount(0, svg(
      "Epidemic spread across a six by six neighbor grid",
      content,
    ));
    sections[0].querySelector("[role=status]").textContent = pending[0]
      ? "Contact in flight."
      : s.infected.size === 36 ? "All 36 infected."
      : s.turn === 0 ? "+ Infected · − Uninfected"
      : `${s.edges.length} new this turn.`;
    sections[0].dataset.state = JSON.stringify({
      turn: s.turn,
      infected: [...s.infected],
      transmissions: s.edges,
      phase: pending[0] ? 'in-flight' : 'settled',
      pending: pending[0]?.edges || [],
    });
  }
  function gossip(animate) {
    const committed = models[1].count,
      count = pending[1]?.count ?? committed,
      known = new Set(committed ? ["E"] : []);
    const mobile = compact.matches;
    const positions = mobile ? { E: [90, 60], A: [90, 240], B: [270, 240], C: [270, 400], D: [90, 400] } : desktopPositions;
    const halfWidth = mobile ? 58 : 66;
    const halfHeight = mobile ? 32 : 39;
    let payload = '';
    exchanges.slice(0, Math.max(0, committed - 1)).forEach(([a, b]) => {
      known.add(a);
      known.add(b);
    });
    let content = mobile
      ? `<rect x="12" y="182" width="336" height="268" rx="12" fill="${t.canvas}" stroke="${t.subtle}"/>` + text(180, 194, 'CLUSTER', 14, t.muted)
      : `<rect x="235" y="53" width="560" height="370" rx="12" fill="${t.canvas}" stroke="${t.subtle}"/>` +
      text(515, 80, "CLUSTER", 12, t.muted);
    [
      ["A", "B"],
      ["B", "C"],
      ["C", "D"],
      ["D", "A"],
      ...(count >= 2 ? [["E", "A"]] : []),
    ].forEach(
      ([a, b]) => (content += line(positions[a], positions[b], t.border, true)),
    );
    if (count >= 2) {
      const [a, b] = exchanges[count - 2],
        p = positions[a],
        q = positions[b];
      const dx = q[0] - p[0],
        dy = q[1] - p[1],
        cut = Math.min(
          dx === 0 ? Infinity : halfWidth / Math.abs(dx),
          dy === 0 ? Infinity : halfHeight / Math.abs(dy),
        );
      const end = [q[0] - dx * cut, q[1] - dy * cut],
        angle = Math.atan2(dy, dx);
      content +=
        line(p, end, t.focus) +
        `<path d="M0 0 L-10 -5 L-10 5 Z" transform="translate(${end}) rotate(${(angle * 180) / Math.PI})" fill="${t.focus}"/>` +
        '';
      const start = [p[0] + dx * cut, p[1] + dy * cut];
      payload = pending[1] ? packet(start, end, animate, 1) : '';
    }
    Object.entries(positions).forEach(([name, [x, y]]) => {
      if (name === "E" && !count) return;
      const knows = known.has(name);
      content +=
        `<g data-peer="${name}" data-knows-e="${knows}" ${name === "E" && count === 1 && pending[1] && animate && !reduced.matches ? `data-motion-from="${mobile ? '130,0' : '0,85'}" data-motion-to="0,0" transform="translate(${mobile ? '130 0' : '0 85'})"` : ''}><rect x="${x - halfWidth}" y="${y - halfHeight}" width="${halfWidth * 2}" height="${halfHeight * 2}" rx="7" fill="${t.processingFill}" stroke="${t.processing}" stroke-width="1.7"/>` +
        text(x, y - 12, name + (name === "A" ? " · seed" : ""), 20) +
        text(
          x,
          y + 17,
          name === 'E' && pending[1]?.count === 1 ? '↓' : knows ? '✓ E' : '—',
          mobile ? 16 : 14,
          knows ? t.success : t.muted,
        ) +
        "</g>";
    });
    content += payload;
    const metricX = mobile ? 180 : 895;
    const metricY = mobile ? 478 : 180;
    content += text(metricX, metricY, `${known.size} / 5`, 27);
    if (mobile) content += text(metricX, metricY+32, "know E", 16, t.muted);
    if (!mobile) {
      content += text(metricX, metricY + 38, 'know E', 16, t.muted);
      ['E','A','B','C','D'].forEach((name,i) => {
        const x = 827 + i * 34;
        content += `<circle cx="${x}" cy="285" r="12" fill="${known.has(name) ? t.flowFill : t.surface}" stroke="${known.has(name) ? t.flow : t.border}"/>` + text(x,285,name,13,known.has(name) ? t.flow : t.muted);
      });
    }
    mount(1, svg(
      "Peer to peer dissemination of E joining the cluster",
      content,
      1,
    ));
    sections[1].querySelector("[role=status]").textContent = pending[1] ? count === 1 ? 'E arrives.' : `${exchanges[count-2].join(' → ')} · E joined` : labels[count];
    sections[1].dataset.state = JSON.stringify({
      step: committed,
      phase: pending[1] ? 'in-flight' : 'settled',
      pendingStep: pending[1]?.count ?? null,
      known: [...known],
      exchange: count >= 2 ? exchanges[count - 2] : null,
    });
  }
  function random(s) {
    s.seed = (Math.imul(s.seed, 1664525) + 1013904223) >>> 0;
    return s.seed / 4294967296;
  }
  function done(i) {
    return i === 0 ? models[0].infected.size === 36 : models[1].count === 5;
  }
  function buttons(i) {
    sections[i].querySelector("[data-action=play]").textContent = playing[i]
      ? "Pause"
      : "Play";
    sections[i].querySelector("[data-action=play]").disabled = done(i);
    sections[i].querySelector("[data-action=step]").disabled = done(i);
  }
  function suspend(i) {
    if (timers[i] !== null) remaining[i] = Math.max(1, deadline[i] - performance.now());
    paint(i, remaining[i]);
    clearTimeout(timers[i]);
    timers[i] = null;
    playing[i] = false;
    sections[i].querySelector("svg")?.pauseAnimations();
    buttons(i);
  }
  function sync(i) {
    if (!wanted[i] || !visible[i] || document.hidden || done(i)) {
      suspend(i);
      return;
    }
    if (playing[i]) return;
    playing[i] = true;
    sections[i].querySelector("svg")?.unpauseAnimations();
    buttons(i);
    schedule(i);
  }
  function stop(i) {
    wanted[i] = false;
    suspend(i);
  }
  function finish(i) {
    if (!pending[i]) return;
    models[i] = pending[i];
    pending[i] = null;
    (i ? gossip : epidemic)(false);
    remaining[i] = Math.max(180, duration(i) - flightMs[i]);
    if (done(i)) playing[i] = false;
    buttons(i);
  }
  function step(i, animate = true) {
    if (pending[i]) { finish(i); return; }
    if (done(i)) return;
    if (i) pending[1] = { count: models[1].count + 1 };
    else {
      const old = models[0];
      const next = { ...old, infected: new Set(old.infected), edges: [], turn: old.turn + 1 };
      old.infected.forEach(from => {
        const row = Math.floor(from / 6), col = from % 6;
        [row > 0 ? from-6 : -1, col < 5 ? from+1 : -1, row < 5 ? from+6 : -1, col > 0 ? from-1 : -1].filter(n=>n>=0).forEach(to=>{
          if (!old.infected.has(to) && random(next) < .5 && !next.infected.has(to)) {
            next.infected.add(to); next.edges.push([from,to]);
          }
        });
      });
      pending[0] = next;
    }
    flightMs[i] = i ? 900 / Number(document.querySelector('#speed').value) : 720;
    if (!animate || reduced.matches || (i === 0 && !pending[0].edges.length)) { finish(i); return; }
    remaining[i] = flightMs[i] + 34;
    (i ? gossip : epidemic)(true);
    sections[i].querySelector('svg').unpauseAnimations();
    buttons(i);
  }
  function schedule(i) {
    clearTimeout(timers[i]);
    timers[i] = null;
    if (!playing[i]) return;
    deadline[i] = performance.now() + remaining[i];
    requestFrames();
    timers[i] = setTimeout(() => {
      timers[i] = null;
      if (pending[i]) finish(i);
      else step(i);
      schedule(i);
    }, remaining[i]);
  }
  function reset(i) {
    stop(i);
    pending[i] = null;
    if (i) {
      models[1] = { count: 0 };
      gossip(false);
    } else {
      models[0] = {
        turn: 0,
        infected: new Set([Number(document.querySelector("#origin").value)]),
        edges: [],
        seed: 1947,
      };
      epidemic(false);
    }
    remaining[i] = duration(i);
    wanted[i] = !reduced.matches;
    sync(i);
  }
  function applyTheme() {
    t = window.visualTokens[theme];
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    Object.entries(t).forEach(([k, v]) =>
      document.documentElement.style.setProperty(`--${k}`, v),
    );
    document
      .querySelector("#theme")
      .setAttribute("aria-pressed", String(theme === "dark"));
    sections.forEach((section, i) => {
      const prior = section.querySelector("svg");
      const clock = prior?.getCurrentTime() || 0;
      const animated = Boolean(pending[i]) && !reduced.matches;
      (i ? gossip : epidemic)(animated);
      const next = section.querySelector("svg");
      next.setCurrentTime(clock);
      paint(i, playing[i] ? deadline[i] - performance.now() : remaining[i]);
      if (!playing[i]) next.pauseAnimations();
    });
  }
  sections.forEach((section, i) =>
    section.addEventListener("click", (event) => {
      const action = event.target.closest("button")?.dataset.action;
      if (action === "play") {
        if (playing[i]) stop(i);
        else {
          wanted[i] = true;
          sync(i);
        }
      }
      if (action === "step") {
        stop(i);
        step(i, false);
        remaining[i] = duration(i);
        sections[i].querySelector("svg").pauseAnimations();
      }
      if (action === "reset") reset(i);
    }),
  );
  document.querySelector("#origin").addEventListener("change", () => reset(0));
  document
    .querySelector("#speed")
    .addEventListener("change", () => {
      if (!pending[1]) { remaining[1] = duration(1); schedule(1); }
    });
  document.querySelector("#theme").addEventListener("click", () => {
    theme = theme === "dark" ? "light" : "dark";
    localStorage.setItem("visual-lab-theme", theme);
    applyTheme();
  });
  document.addEventListener("visibilitychange", () => {
    sections.forEach((_, i) => sync(i));
  });
  reduced.addEventListener("change", () => {
    if (reduced.matches) {
      sections.forEach((_, i) => stop(i));
      applyTheme();
    }
  });
  compact.addEventListener('change', applyTheme);
  applyTheme();
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      const i = sections.indexOf(entry.target);
      visible[i] = entry.isIntersecting && entry.intersectionRatio >= 0.25;
      sync(i);
    }
  }, { threshold: [0, 0.25] });
  sections.forEach(section => observer.observe(section));
})();
