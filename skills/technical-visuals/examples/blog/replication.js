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
  const compactLayout = matchMedia("(max-width: 600px)");
  const motionPreference = matchMedia("(prefers-reduced-motion: reduce)");
  const TICK_MS = 900;
  const figures = [...document.querySelectorAll("[data-figure]")];
  const states = figures.map((el, i) => ({
    el,
    i,
    playing: !motionPreference.matches,
    visible: false,
    fraction: 0,
    lastFrame: null,
    autoWrites: true,
    t: 0,
    starts: [0],
    read: null,
    a: 0,
    appStartA: null,
    b: 0,
    received: 0,
    arrival: [],
    appStart: null,
    off: null,
    membership: "online",
    source: "live",
    rejoin: 0,
    apply: 8,
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
    `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="middle" fill="${color}" font-size="${compactLayout.matches ? Math.max(16,size) : size}">${s}</text>`;
  function db(x, y, title, sub, role = "storage") {
    return `<path d="M${x} ${y + 15} C${x} ${y - 5} ${x + 150} ${y - 5} ${x + 150} ${y + 15} V${y + 80} C${x + 150} ${y + 100} ${x} ${y + 100} ${x} ${y + 80}Z" fill="${c[role + "Fill"]}" stroke="${c[role]}" stroke-width="1.7"/><ellipse cx="${x + 75}" cy="${y + 15}" rx="75" ry="15" fill="${c[role + "Fill"]}" stroke="${c[role]}" stroke-width="1.7"/>${text(x + 75, y + 48, title, 16)}${text(x + 75, y + 72, sub, 13)}`;
  }
  const line = (x, y, x2, y2, label, broken = false) =>
    `<path d="M${x} ${y} L${x2} ${y2}" fill="none" stroke="${broken ? c.failure : c.flow}" stroke-width="2" ${broken ? 'stroke-dasharray="6 5"' : ""} marker-end="url(#arrow)"/>${label ? text((x + x2) / 2, (y + y2) / 2 - 18, label, 12, broken ? c.failure : c.muted) : ""}`;
  const route = (points, broken = false) =>
    `<polyline points="${points}" fill="none" stroke="${broken ? c.failure : c.flow}" stroke-width="2" stroke-linejoin="round" ${broken ? 'stroke-dasharray="6 5"' : ""} marker-end="url(#arrow)"/>`;
  function motionTracks(s) {
    const tracks = [];
    const add = (id, start, duration, points, kind = "") => {
      if (s.t >= start && s.t < start + duration)
        tracks.push({ id, start, duration, points, kind });
    };
    s.starts.forEach((start, i) => {
      const id = i + 1;
      if (s.i === 0) add(id, start, 2, [[195,135],[390,135]]);
      else if (s.i === 1) {
        add(id, start, 2, [[195,93],[380,93]]);
        add(id, start+2, 2, [[718,93],[755,93],[755,293],[718,293]]);
        add(id, start+4, 2, [[380,293],[205,293]]);
      } else {
        add(id, start, 2, [[190,255],[285,255]], "order");
        add(id, start+2, 2, [[505,235],[550,235],[550,115],[593,115]], "receive-a");

      }
    });
    if (s.i === 2) {
      for (const flight of s.arrival) {
        const points = s.source === "donor"
          ? [[190,255],[230,255],[230,500],[565,500],[565,375],[593,375]]
          : [[505,285],[560,285],[560,375],[593,375]];
        add(flight.n, flight.from, flight.at-flight.from, points, "receive-b");
      }
      if (s.appStart !== null && !["expelled","rejoining"].includes(s.membership))
        add(s.b+1, s.appStart, s.apply, [[685,390],[685,435]], "apply-b");
      if (s.appStartA !== null)
        add(s.a+1, s.appStartA, 2, [[685,130],[685,175]], "apply-a");
    }
    if (compactLayout.matches) {
      for (const track of tracks) {
        const start=s.starts[track.id-1];
        if(s.i===0) track.points=[[160,115],[160,190]];
        else if(s.i===1) track.points=track.start===start?[[160,115],[160,190]]:track.start===start+2?[[160,218],[160,300]]:[[160,328],[160,400]];
        else if(track.kind === "apply-b") track.points=[[160,588],[160,625]];
        else if(track.kind === "receive-b") track.points=s.source==="donor"?[[85,80],[25,80],[25,572],[58,572]]:[[270,216],[285,216],[285,572],[262,572]];
        else if(track.kind === "order") track.points=[[160,115],[160,170]];
        else if(track.kind === "receive-a") track.points=[[270,204],[285,204],[285,312],[262,312]];
        else track.points=[[160,328],[160,365]];
      }
    }
    return tracks.map(track => {
      const lengths = track.points.slice(1).map((p,i) => Math.hypot(p[0]-track.points[i][0],p[1]-track.points[i][1]));
      return {...track, lengths, length:lengths.reduce((a,b)=>a+b,0)};
    });
  }
  function animatePackets(s) {
    for (const track of s.motion || []) {
      let distance = Math.min(1,Math.max(0,(s.t+s.fraction-track.start)/track.duration))*track.length;
      let segment = 0;
      while(segment < track.lengths.length-1 && distance > track.lengths[segment]) distance -= track.lengths[segment++];
      const progress = distance / track.lengths[segment];
      const a = track.points[segment], b = track.points[segment+1];
      track.node.setAttribute("transform",`translate(${a[0]+(b[0]-a[0])*progress} ${a[1]+(b[1]-a[1])*progress})`);
    }
  }
  function slots(x, y, count, applied = count, selected = -1, size = 48, gap = 8, kind = "apply") {
    let output = "";
    for (let k = 0; k < 6; k++) {
      const has=k<count, done=k<applied;
      const color=k===selected?c.focus:has?kind==="ordered"?c.flow:done?c.success:c.warning:c.border;
      output += `<rect data-entry="${k}" data-entry-state="${has ? kind==="ordered" ? "ordered" : done ? "applied" : "pending" : "missing"}" x="${x+k*(size+gap)}" y="${y}" width="${size}" height="${size}" rx="4" fill="${has&&done?kind==="ordered"?c.flow:c.success:c.surface}" stroke="${color}" stroke-width="${k===selected?3:1.6}"/>`;
      if (has && kind === "apply" && size >= 24) output += text(x+k*(size+gap)+size/2,y+size/2,`w${k+1}`,12,done ? c.surface : c.text);
    }
    return output;
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
      a = s.a,
      receivedA = s.starts.filter((t) => s.t - t >= 4).length,
      ordered = s.starts.filter((t) => s.t - t >= 2).length;
    return { p, a, receivedA, ordered };
  }
  function tick(s) {
    s.t++;
    if (s.autoWrites && s.starts.length < 6 && s.t % 4 === 0)
      s.starts.push(s.t);
    s.read = null;
    if (s.i === 2) {
      let { p } = group(s);
      if (s.appStartA !== null && s.t - s.appStartA >= 2) {
        s.a++;
        s.appStartA = null;
      }
      if (s.appStartA === null && s.a < group(s).receivedA) s.appStartA = s.t;
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
              s.t >= s.starts[n] + (s.source === "live" ? 2 : 3)
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
    if (s.autoWrites && s.starts.length === 6) {
      const done = s.i === 2 ? s.b === 6 && group(s).a === 6 : s.i === 1 ? counts(s).a === 6 : counts(s).p === 6;
      if (done) s.playing = false;
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
          "",
        ) +
        line(195, 135, 390, 135, "append") +
        text(564, 66, "History", 16) +
        slots(400, 114, n, n, s.read === null ? -1 : s.read) +
        text(564,186, `${n} / 6`, 18);
      status =
        s.read !== null
          ? s.read < n
            ? `Read offset ${s.read}: ${records[s.read]}. The log retains the entry.`
            : `Offset ${s.read}: not found. That write has not been appended.`
          : `${n} / 6 appended. ${s.starts.length > n ? records[n] + " is traveling to the next offset." : "Write the next entry, then play or step to append it."}`;
    } else if (s.i === 1) {
      height = 400;
      body =
        db(45, 42, "Primary", `${count.p} committed`, "processing") +
        db(45, 242, "Replica", `${count.a} applied`, "flow") +
        text(554, 44, "History", 16) +
        slots(390, 72, count.p, count.p, s.read === null ? -1 : count.p - 1) +
        text(554, 244, `${count.r} received`, 14) +
        slots(390, 272, count.r, count.a) +
        line(195, 93, 380, 93, "append") +
        route("718,93 755,93 755,293 718,293") +
        text(679, 195, "copy", 12, c.muted) +
        line(380, 293, 205, 293, "apply");
      status =
        s.read !== null
          ? `Primary read: ${count.p ? records[count.p - 1] + " at offset " + (count.p - 1) : "no committed entries"}. Reads do not go to this replica.`
          : `Committed ${count.p} · Received ${count.r} · Applied ${count.a} · Lag ${count.p - count.a}. Dashed entries wait for application.`;
    } else {
      height = 570;
      const retained = s.starts.filter(start => s.t-start>=2).length;
      body =
        db(40,210,"Primary",`${g.p} committed`,"processing") +
        line(190,255,275,255,"write") +
        `<rect data-history-strip="" x="285" y="212" width="220" height="76" rx="7" fill="${c.flowFill}" stroke="${c.flow}" stroke-width="1.6"/>` +
        text(395,228,"XCom history",14,c.muted) +
        slots(308,248,retained,retained,-1,22,7,"ordered") +
        route("505,235 550,235 550,115 593,115") +
        route(s.source === "donor" ? "190,255 230,255 230,500 565,500 565,375 593,375" : "505,285 560,285 560,375 593,375",s.off!==null) +
        text(685,80,`${g.receivedA} received`,16,c.muted) +
        slots(603,103,g.receivedA,g.a,s.appStartA===null?-1:g.a,24,4) +
        line(685,130,685,175,"") +
        db(610,175,"Replica A",`${g.a} applied`,"flow") +
        text(685,340,`${s.received} received`,16,c.muted) +
        slots(603,363,s.received,s.b,s.appStart===null?-1:s.b,24,4) +
        line(685,390,685,435,"",["expelled","rejoining"].includes(s.membership)) +
        db(610,435,"Replica B",`${s.b} applied`,"control") +
        `<rect x="325" y="386" width="13" height="13" rx="2" fill="${c.surface}" stroke="${c.warning}" stroke-width="1.7"/>` + text(375,393,"Waiting",13,c.muted) + `<rect x="425" y="386" width="13" height="13" rx="2" fill="${c.success}"/>` + text(480,393,"Readable",13,c.muted);
      if(s.off!==null || s.membership!=="online" || s.source!=="live")
        body+=text(410,465,s.off!==null?"Link interrupted":s.source==="donor"?"Donor recovery":s.source==="cache"?"Cache retry":s.membership,14,s.off!==null?c.failure:c.warning);
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
    if(compactLayout.matches) {
      const tray=(y,received,applied=received,selected=-1)=>slots(58,y,received,applied,selected,28,7);
      if(s.i===0) {
        height=300;
        body=db(85,20,"Database","","storage")+line(160,115,160,190,"")+text(160,165,"History",18)+tray(190,count.p)+text(160,258,`${count.p} / 6`,18);
      } else if(s.i===1) {
        height=530;
        body=db(85,20,"Primary",`${count.p} committed`,"processing")+line(160,115,160,190,"")+text(160,165,"History",18)+tray(190,count.p)+line(160,218,160,300,"")+text(160,275,`${count.r} received`,18)+tray(300,count.r,count.a)+line(160,328,160,400,"")+db(85,400,"Replica",`${count.a} applied`,"flow");
      } else {
        height=780;
        const retained=s.starts.filter(start=>s.t-start>=2).length;
        body=db(85,20,"Primary",`${g.p} committed`,"processing")+line(160,115,160,170,"")+`<rect data-history-strip="" x="50" y="170" width="220" height="65" rx="7" fill="${c.flowFill}" stroke="${c.flow}" stroke-width="1.6"/>`+text(160,186,"XCom history",16)+slots(78,204,retained,retained,-1,22,6,"ordered")+route("270,204 285,204 285,312 262,312")+route(s.source==="donor"?"85,80 25,80 25,572 58,572":"270,216 285,216 285,572 262,572",s.off!==null)+text(160,275,`${g.receivedA} received`,18)+tray(300,g.receivedA,g.a,s.appStartA===null?-1:g.a)+line(160,328,160,365,"")+db(85,365,"Replica A",`${g.a} applied`,"flow")+text(160,535,`${s.received} received`,18)+tray(560,s.received,s.b,s.appStart===null?-1:s.b)+line(160,588,160,625,"",["expelled","rejoining"].includes(s.membership))+db(85,625,"Replica B",`${s.b} applied`,"control")+text(160,755,"Outline: waiting · Green: readable",16,c.muted);
      }
    }
    s.motion = motionTracks(s);
    body += s.motion.map((track,index) => `<g data-packet="${index}" data-transfer="${track.kind}" data-write="${track.id}"><rect x="-19" y="-13" width="38" height="26" rx="4" fill="${c.flowFill}" stroke="${c.focus}" stroke-width="2"/>${text(0,0,"w"+track.id,12)}</g>`).join("");
    s.el.querySelector(".stage").innerHTML =
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${compactLayout.matches ? 320 : 840} ${height}" role="img" aria-label="${s.el.querySelector("h2").textContent}"><title>${s.el.querySelector("h2").textContent}</title><desc>${status}</desc><rect width="${compactLayout.matches ? 320 : 840}" height="${height}" fill="${c.surface}"/><defs><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0L10 5L0 10Z" fill="${c.flow}"/></marker></defs><g font-family="system-ui,sans-serif">${body}</g></svg>`
        .replaceAll('id="arrow"', `id="arrow-${s.i}"`)
        .replaceAll("url(#arrow)", `url(#arrow-${s.i})`);
    const nodes = s.el.querySelectorAll("[data-packet]");
    s.motion.forEach((track,index) => track.node=nodes[index]);
    animatePackets(s);
    s.el.querySelector('[role="status"]').textContent = status;
    s.el.querySelector("[data-summary]").textContent = s.i===0 ? `${count.p} of 6 writes recorded.` : s.i===1 ? "Copy first. Apply next." : s.received>s.b ? `${s.received-s.b} received write${s.received-s.b===1?"":"s"} waiting to apply on B.` : s.off!==null ? "Replica B is disconnected." : s.b===0 ? "Writes become readable after application." : "Applied writes are ready to read.";
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
            receivedA: g.receivedA,
            applyingA: s.appStartA === null ? null : s.a + 1,
            applyingB: s.appStart === null ? null : s.b + 1,
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
        s.autoWrites = false;
        if (s.starts.length < 6) s.starts.push(s.t);
        s.read = null;
      }
      if (action === "play") { s.playing = !s.playing; s.lastFrame = null; }
      if (action === "step") {
        s.playing = false;
        s.fraction = 0;
        s.lastFrame = null;
        tick(s);
      }
      if (action === "reset" || action === "replay") {
        Object.assign(s, {
          playing: action === "replay" && !motionPreference.matches,
          fraction: 0,
          lastFrame: null,
          autoWrites: action === "replay",
          t: 0,
          starts: action === "replay" ? [0] : [],
          read: null,
          a: 0,
          appStartA: null,
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
        s.playing = false;
        s.lastFrame = null;
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
        s.autoWrites = false;
        s.fraction = 0;
        s.lastFrame = null;
        for (let k = 0; k < 100; k++) {
          tick(s);
          if (
            s.off !== null ||
            (s.b === s.starts.length && group(s).a === s.starts.length)
          )
            break;
        }
      }
      render(s);
      schedule();
    });
    s.el.addEventListener("change", (e) => {
      if (e.target.dataset.control === "apply")
        s.apply = Number(e.target.value);
      if (e.target.dataset.control === "latency")
        s.latency = Number(e.target.value);
      render(s);
      schedule();
    });
  });
  document.querySelector("#theme").onclick = () => {
    theme = theme === "light" ? "dark" : "light";
    localStorage.setItem("visual-lab-theme", theme);
    colors();
    states.forEach(render);
  };
  const metrics = {frames:0, totalMs:0, maxMs:0, costs:[], intervals:[]};
  window.replicationAnimationMetrics = metrics;
  let frameId = null;
  let previousFrame = null;
  function runnable(s) { return s.playing && s.visible && !document.hidden; }
  function schedule() {
    if (frameId === null && states.some(runnable)) frameId=requestAnimationFrame(frame);
  }
  function frame(now) {
    frameId=null;
    const began=performance.now();
    if (previousFrame !== null && metrics.intervals.length < 600) metrics.intervals.push(now-previousFrame);
    previousFrame=now;
    for (const s of states) {
      if (!runnable(s)) { s.lastFrame=null; continue; }
      // A stall is a pause, not a burst of catch-up animation.
      const delta=s.lastFrame===null ? 0 : Math.min(50,Math.max(0,now-s.lastFrame));
      s.lastFrame=now;
      s.fraction += delta/TICK_MS;
      if (s.fraction >= 1) { s.fraction-=1; tick(s); }
      animatePackets(s);
    }
    const cost=performance.now()-began;
    metrics.frames++; metrics.totalMs+=cost; metrics.maxMs=Math.max(metrics.maxMs,cost);
    if(metrics.costs.length<600)metrics.costs.push(cost);
    schedule();
    if(frameId===null)previousFrame=null;
  }
  const observer=new IntersectionObserver(entries => {
    for(const entry of entries) {
      const s=states.find(state=>state.el===entry.target);
      s.visible=entry.isIntersecting;
      s.lastFrame=null;
    }
    schedule();
  },{threshold:0});
  document.addEventListener("visibilitychange",()=>{
    states.forEach(s=>s.lastFrame=null);
    previousFrame=null;
    if(document.hidden && frameId!==null){cancelAnimationFrame(frameId);frameId=null;}
    schedule();
  });
  motionPreference.addEventListener("change",e=>{
    if(e.matches)states.forEach(s=>{s.playing=false;s.lastFrame=null;render(s);});
    schedule();
  });
  compactLayout.addEventListener("change",()=>states.forEach(render));
  colors();
  states.forEach(s=>{render(s);observer.observe(s.el);});
})();
