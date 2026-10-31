(() => {
  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  let theme;
  try {
    theme = localStorage.getItem("visual-lab-theme");
  } catch {}
  if (!window.visualTokens[theme])
    theme = matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  let p,
    frame = null,
    previous = null;
  const models = [...document.querySelectorAll("[data-figure]")].map(
    (section) => ({
      section,
      id: section.dataset.figure,
      time: 0,
      wanted: !motion.matches,
      visible: false,
    }),
  );
  const completionMarks = value => String(value).replaceAll("✓", `<tspan fill="${p.success}">✓</tspan>`);
  const text = (x, y, value, role = "text", key = "", size = 18) =>
    `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="middle" font-size="${size}" fill="${p[role]}"${key ? ` data-label="${key}"` : ""}>${completionMarks(value)}</text>`;
  const box = (x, y, w, h, title, role = "processing", key = "", value = "") =>
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="${(p[role + "Fill"] || p.raised)}" stroke="${p[role]}" stroke-width="2"/>${text(x + w / 2, y + 24, title, role)}${key ? text(x + w / 2, y + h - 22, value, "text", key) : ""}`;
  const chip = (x, y, w, label, key, role = "storage") =>
    `<g data-item="${key}"><rect x="${x}" y="${y}" width="${w}" height="32" rx="5" fill="${(p[role + "Fill"] || p.raised)}" stroke="${p[role]}" stroke-width="2"/>${text(x + w / 2, y + 17, label, role)}</g>`;
  function build(m) {
    m.wide = m.id === "retry" && m.section.querySelector(".stage").clientWidth >= 600;
    m.width = m.wide ? 720 : 420;
    let s = "",
      steps = [],
      initial = {};
    const route = (id, points, role = "border", arrow = true) => {
      s += `<path id="${m.id}-${id}" d="M${points.map((q) => q.join(",")).join("L")}" fill="none" stroke="${p[role]}" stroke-width="2"${arrow ? ` marker-end="url(#${m.id}-arrow)"` : ""}/>`;
    };
    const event = (paths, label, patch, startPatch = {}, duration = 900) =>
      steps.push({
        paths: paths ? [paths].flat() : [],
        label,
        patch,
        startPatch,
        duration,
      });
    if (m.id === "workflow") {
      route("reserve", [
        [210, 60],
        [210, 105],
      ]);
      route("charge", [
        [210, 175],
        [210, 235],
      ]);
      route(
        "retry",
        [
          [300, 270],
          [365, 270],
          [365, 205],
          [210, 205],
          [210, 235],
        ],
        "warning",
      );
      route("receipt", [
        [210, 305],
        [210, 365],
      ]);
      route("finish", [
        [210, 435],
        [210, 490],
      ]);
      s +=
        `<rect x="155" y="22" width="110" height="38" rx="19" fill="${p.controlFill}" stroke="${p.control}" stroke-width="2"/>` +
        text(210, 42, "Book trip", "control");
      s +=
        box(120, 105, 180, 70, "Reserve seat", "storage", "seat", "Waiting") +
        box(
          120,
          235,
          180,
          70,
          "Charge card",
          "processing",
          "payment",
          "Waiting",
        ) +
        box(120, 365, 180, 70, "Send receipt", "flow", "receipt", "Waiting");
      s +=
        `<rect x="155" y="490" width="110" height="40" rx="20" fill="${p.surface}" stroke="${p.success}" stroke-width="2"/>` +
        text(210, 511, "Waiting", "success", "finish");
      s += text(345, 185, "Retry", "warning");
      initial = {
        seat: "Waiting",
        payment: "Waiting",
        receipt: "Waiting",
        finish: "Waiting",
      };
      event("reserve", "start", { seat: "✓ Reserved" });
      event("charge", "next", { payment: "× Failed" });
      event("retry", "retry", { payment: "✓ Paid" });
      event("receipt", "next", { receipt: "✓ Sent" });
      event("finish", "done", { finish: "✓ Done" });
    } else if (m.id === "booking") {
      route(
        "enqueue1",
        [
          [100, 100],
          [100, 160],
          [115, 160],
          [115, 190],
        ],
        "flow",
      );
      route(
        "enqueue2",
        [
          [100, 100],
          [100, 160],
          [225, 160],
          [225, 190],
        ],
        "flow",
      );
      route(
        "enqueue3",
        [
          [100, 100],
          [100, 160],
          [335, 160],
          [335, 190],
        ],
        "flow",
      );
      for (let i = 0; i < 3; i++) {
        const x = [115, 225, 335][i];
        route(
          "take" + i,
          [
            [x, 283],
            [x, 320],
            [120, 320],
            [120, 370],
          ],
          "flow",
        );
        route(
          "poll" + i,
          [
            [120, 370],
            [120, 320],
            [x, 320],
            [x, 283],
          ],
          "border",
          false,
        );
      }
      route(
        "result",
        [
          [45, 410],
          [12, 410],
          [12, 65],
          [30, 65],
        ],
        "processing",
      );
      route(
        "save",
        [
          [170, 65],
          [250, 65],
        ],
        "storage",
      );
      s += box(
        30,
        25,
        140,
        75,
        "Temporal",
        "control",
        "service",
        "Ready tasks",
      );
      s +=
        `<path d="M250 37V91C250 105 390 105 390 91V37" fill="${p.storageFill}" stroke="${p.storage}" stroke-width="2"/><ellipse cx="320" cy="37" rx="70" ry="12" fill="${p.storageFill}" stroke="${p.storage}" stroke-width="2"/>` +
        text(320, 61, "MySQL", "storage") +
        text(320, 85, "Results", "muted");
      s +=
        `<rect x="60" y="190" width="330" height="93" rx="10" fill="${p.flowFill}" stroke="${p.flow}" stroke-width="2"/>` +
        text(210, 209, "Reserve seat · task queue", "flow");
      for (let i = 0; i < 3; i++) {
        const x = 65 + i * 110;
        s +=
          `<rect x="${x + 5}" y="223" width="90" height="32" rx="5" fill="${p.surface}" stroke="${p.subtle}"/>` +
          chip(x + 5, 223, 90, "Book " + (41 + i), "task" + i, "flow");
        s += chip(
          30 + i * 125,
          525,
          110,
          "Book " + (41 + i) + " ✓",
          "saved" + i,
        );
      }
      route(
        "reserve",
        [
          [195, 395],
          [255, 395],
        ],
        "processing",
      );
      route(
        "confirmed",
        [
          [255, 435],
          [195, 435],
        ],
        "storage",
      );
      s += box(45, 370, 150, 90, "Worker", "processing", "worker", "Polling");
      s += box(
        255,
        370,
        150,
        90,
        "Seat service",
        "storage",
        "seat",
        "Available",
      );
      s += text(65, 345, "result", "processing");
      s += text(315, 350, "0 waiting", "flow", "waiting");
      s += text(210, 500, "Recorded results", "storage");
      initial = {
        service: "Ready tasks",
        worker: "Polling",
        seat: "Available",
        waiting: "0 waiting",
        queue: [],
        saved: [],
      };
      for (let i = 0; i < 3; i++)
        event("enqueue" + (i + 1), "Book " + (41 + i), {
          queue: Array.from({ length: i + 1 }, (_, n) => n),
          waiting: i + 1 + " waiting",
        });
      for (let i = 0; i < 3; i++) {
        const rest = Array.from({ length: 2 - i }, (_, n) => i + n + 1);
        event("poll" + i, "poll", { worker: "Taking " + (41 + i) });
        event(
          "take" + i,
          "Book " + (41 + i),
          { worker: "Reserve seat" },
          { queue: rest, waiting: rest.length + " waiting" },
        );
        event("reserve", "Book " + (41 + i), {
          seat: 41 + i + " → seat 8" + String.fromCharCode(65 + i),
          worker: "Await result",
        });
        event("confirmed", "seat 8" + String.fromCharCode(65 + i), {
          worker: "✓ Reserved",
        });
        event("result", "reserved", {
          worker: "Polling",
          service: "Save " + (41 + i),
        });
        event("save", 41 + i + " ✓", {
          saved: Array.from({ length: i + 1 }, (_, n) => n),
          service: i === 2 ? "✓ Recorded" : "Ready tasks",
        });
      }
    } else if (m.id === "replay") {
      route("poll", [[340,350],[340,260]], "processing");
      route("history", [[80,260],[80,305],[210,305],[210,350]], "storage");
      route("command", [[380,525],[400,525],[400,120],[380,120]], "processing");
      s += `<rect x="40" y="20" width="340" height="240" rx="10" fill="${p.controlFill}" stroke="${p.control}" stroke-width="2"/>`;
      s += text(210,45,"Temporal", "control", "", 22);
      s += text(110,76,"History", "storage", "", 17);
      for (const [i, title] of ["✓ Seat reserved", "✓ Card charged"].entries()) {
        const y = 103 + i * 40;
        s += `<rect x="60" y="${y-15}" width="300" height="30" rx="4" fill="${p.storageFill}" stroke="${p.storage}"/>`;
        s += text(210,y,title,"text","",17);
      }
      s += text(210,182,"", "storage", "scheduled",17);
      s += `<rect x="60" y="205" width="300" height="40" rx="6" fill="${p.flowFill}" stroke="${p.flow}"/>`;
      s += text(115,225,"Queue", "flow", "",17);
      s += text(270,225,"Empty", "text", "next",17);
      s += text(190,283,"Workflow task + history", "storage", "handoff",17);
      s += `<rect x="40" y="350" width="340" height="210" rx="10" fill="${p.processingFill}" stroke="${p.processing}" stroke-width="2"/>`;
      s += text(210,375,"Worker · workflow code", "processing", "workerMode",21);
      const names = ["Reserve seat", "Charge card", "Send receipt"];
      for (let i=0;i<3;i++) {
        const y=415+i*55;
        s += `<rect data-row="${i}" x="60" y="${y-20}" width="300" height="40" rx="6" fill="${p.surface}" stroke="${p.subtle}"/>`;
        s += text(140,y,names[i],"text","",17);
        s += text(285,y,i===2 ? "Waiting" : "—",i===2 ? "warning" : "success","restored"+i,17);
      }
      s += text(210,575,"Load history", "muted", "cursor",17);
      initial = {
        cursor:"Load history", restored0:"—", restored1:"—", restored2:"Waiting",
        rebuilt:"Start from the beginning", next:"Empty", scheduled:"", row:-1, read:0,
        workerMode:"Worker · workflow code", handoff:"Workflow task + history", receiptSent:false, completionRecorded:false, poll:"None",
      };
      event("poll", "poll", {poll:"Workflow", cursor:"Workflow poll reaches Temporal"}, {cursor:"Worker polls for workflow work"});
      event("history", "history", {cursor:"Replay from the beginning", rebuilt:"Booking 42 started", read:1});
      event(null,"", {row:0, restored0:"✓ Reused", cursor:"Use the saved seat result", rebuilt:"Seat 8A · reserved", read:2}, {}, 180);
      event(null,"", {row:1, restored1:"✓ Reused", cursor:"Use the saved payment result", rebuilt:"Seat reserved · card paid", read:3}, {}, 180);
      event(null,"", {row:2, restored2:"Schedule", cursor:"No completed receipt in history", rebuilt:"Next: send receipt"}, {}, 350);
      event("command", "schedule", {cursor:"Temporal records the command", restored2:"Requested"});
      event(null,"", {next:"Send receipt", scheduled:"＋ Receipt scheduled", restored2:"Queued", cursor:"Activity task ready for a worker"}, {}, 1200);
      event("poll", "poll", {poll:"Activity", cursor:"Activity poll reaches Temporal"}, {cursor:"Worker polls for activity work"});
      event("history", "activity", {
        workerMode:"Worker · activity code", restored2:"Running", cursor:"Worker sends the receipt",
      }, {next:"Empty", handoff:"Activity task", cursor:"Worker picks up the activity"});
      event(null,"", {restored2:"✓ Sent", receiptSent:true, cursor:"Report activity completion"}, {}, 1300);
      event("command", "sent", {
        scheduled:"✓ Receipt completed", completionRecorded:true,
        cursor:"Temporal records the result", restored2:"✓ Sent",
      });
      event("poll", "poll", {poll:"Workflow result", cursor:"Workflow poll reaches Temporal"}, {cursor:"Worker polls for workflow work"});
      event("history", "result", {
        workerMode:"Worker · workflow code", restored2:"✓ Done", cursor:"Workflow continues with the saved result",
      }, {handoff:"Workflow task + result"});
    } else {
      const center = m.width / 2;
      const keyLeft = m.wide ? 40 : 30;
      const keyRight = m.wide ? 110 : 85;
      const keyCenter = (keyLeft + keyRight) / 2 - 5;
      const gateLeft = m.wide ? 280 : 115;
      const gateWidth = m.wide ? 160 : 120;
      const gateCenter = gateLeft + gateWidth / 2;
      const ledgerLeft = m.wide ? 560 : 265;
      const ledgerRight = m.wide ? 700 : 395;
      const ledgerCenter = (ledgerLeft + ledgerRight) / 2;
      s += text(center, 35, "Charge $20", "text", "", 24);
      s += text(center, 70, "Attempt 1", "processing", "worker");
      s += text(center, 105, "", "failure", "incident", 17);
      for (const [name,y] of [["plain",135],["keyed",355]]) {
        s += `<rect x="15" y="${y}" width="${m.width-30}" height="205" rx="12" fill="${p.surface}" stroke="${p.subtle}"/>`;
        route(name+"In", [[keyRight,y+100],[gateLeft,y+100]], "processing");
        route(name, [[gateLeft+gateWidth,y+100],[ledgerLeft,y+100]], name === "plain" ? "failure" : "flow");
        if (name === "keyed") route("reuse", [[gateLeft,y+120],[keyRight,y+120]], "success");
        s += `<path d="M${keyLeft} ${y+70}H${keyRight-20}L${keyRight} ${y+100}L${keyRight-20} ${y+130}H${keyLeft}Z" fill="${p.processingFill}" stroke="${p.processing}" stroke-width="2"/>`;
        s += text(keyCenter,y+100,"42","processing","",22);
        s += text(keyCenter,y+150,"Key","muted","",17);
        s += `<rect x="${gateLeft}" y="${y+58}" width="${gateWidth}" height="84" rx="8" fill="${name === "plain" ? p.surface : p.controlFill}" stroke="${name === "plain" ? p.border : p.control}" stroke-width="2"${name === "plain" ? ' stroke-dasharray="5 5"' : ""}/>`;
        if (name === "plain") s += text(gateCenter,y+100,"No check","muted","",18);
        else {
          s += text(gateCenter,y+78,"Idempotency","control","",17);
          s += text(gateCenter,y+100,"check","control","",17);
          s += text(gateCenter,y+126,"—","text","check",16);
        }
        const teeth = Array.from({length:11},(_,i) => `${ledgerRight-(ledgerRight-ledgerLeft)*i/10},${y+(i%2 ? 148 : 155)}`).join("L");
        s += `<path d="M${ledgerLeft} ${y+55}H${ledgerRight}V${y+155}L${teeth}Z" fill="${p.storageFill}" stroke="${p.storage}" stroke-width="2"/>`;
        s += text(ledgerCenter,y+75,"Charges","storage","",17);
        s += `<g data-item="${name === "plain" ? "plain1" : "key1"}">${text(ledgerCenter,y+105,"$20","text","",22)}</g>`;
        if (name === "plain") s += `<g data-item="plain2">${text(ledgerCenter,y+133,"+ $20","failure","",22)}</g>`;
        s += text(ledgerCenter,y+180,"$0 total","text",name === "plain" ? "plainTotal" : "keyTotal",17);
      }
      initial = {
        worker:"Attempt 1", incident:"", plain:"Ready", keyed:"Ready", receipt:"—",
        plainTotal:"$0 total", keyTotal:"$0 total", charges:0, check:"—",
      };
      event(["plainIn","keyedIn"], "key 42", {check:"New key"});
      event(["plain","keyed"], "$20", {
        plain:"✓ Charged", keyed:"✓ Charged", receipt:"42 → pay-42", check:"42 saved",
        plainTotal:"$20 total", keyTotal:"$20 total", charges:1,
      });
      event(null,"",{worker:"× Worker crashed",incident:"Completion not recorded"},{},1000);
      event(null,"",{worker:"Attempt 2",incident:"Timeout → retry"},{},1200);
      event(["plainIn","keyedIn"], "key 42", {check:"✓ Seen 42",incident:""});
      event(["plain","reuse"], ["$20", "receipt"], {
        plain:"✓ Charged again", keyed:"↪ Receipt reused", plainTotal:"$40 total", keyTotal:"$20 total", charges:2,
      });
    }
    m.initial = initial;
    m.section.querySelector(".stage").innerHTML =
      `<svg viewBox="0 0 ${m.width} 590" role="img" aria-label="${m.section.querySelector("h2").textContent}"><defs><marker id="${m.id}-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M1 1L9 5L1 9" fill="none" stroke="${p.border}" stroke-width="1.6"/></marker></defs>${s}<g data-payload="0"><circle r="5" fill="${p.flow}" stroke="${p.surface}"/><g data-payload-label><rect x="-38" y="-14" width="76" height="28" rx="5" fill="${p.flow}" stroke="${p.surface}"/>${text(0, 1, "", "canvas", "payload0", 16)}</g></g><g data-payload="1"><circle r="5" fill="${p.control}" stroke="${p.surface}"/><g data-payload-label><rect x="-38" y="-14" width="76" height="28" rx="5" fill="${p.control}" stroke="${p.surface}"/>${text(0, 1, "", "canvas", "payload1", 16)}</g></g></svg>`;
    m.svg = m.section.querySelector("svg");
    let start = 0;
    m.events = steps.map((step) => {
      const paths = step.paths.map((id) =>
        m.svg.querySelector("#" + m.id + "-" + id),
      );
      const duration = paths.length
        ? (Math.max(...paths.map((path) => path.getTotalLength())) / 120) * 1000
        : step.duration;
      const e = { ...step, paths, start, arrival: start + duration, duration };
      start = e.arrival + (m.id === "replay" && (step.paths.length === 0 || step.paths[0] === "history") ? 90 : 450);
      return e;
    });
    m.duration = m.events.at(-1).arrival;
    paint(m);
  }
  function paint(m) {
    const state = { ...m.initial };
    for (const e of m.events) {
      if (m.time >= e.start) Object.assign(state, e.startPatch);
      if (m.time >= e.arrival) Object.assign(state, e.patch);
    }
    const active = m.events.find(
      (e) => m.time >= e.start && m.time < e.arrival,
    );
    for (const [key, value] of Object.entries(state)) {
      const el = m.svg.querySelector(`[data-label="${key}"]`);
      if (el) {
        if (el.textContent !== String(value)) el.innerHTML = completionMarks(value);
        if (m.id === "replay" && key.startsWith("restored"))
          el.setAttribute("fill", value.startsWith("✓") ? p.success : value === "Waiting" ? p.warning : value === "—" ? p.muted : p.processing);
      }
    }
    m.svg.querySelectorAll("[data-item]").forEach((el) => {
      const key = el.dataset.item;
      let visible = true;
      if (key.startsWith("task"))
        visible = state.queue.includes(Number(key.slice(4)));
      if (key.startsWith("saved"))
        visible = state.saved.includes(Number(key.slice(5)));
      if (key === "plain1" || key === "key1") visible = state.charges >= 1;
      if (key === "plain2") visible = state.charges >= 2;
      el.style.display = visible ? "" : "none";
    });
    m.svg.querySelectorAll("[data-row]").forEach((el) => {
      const i = Number(el.dataset.row);
      el.setAttribute("stroke", state["restored" + i]?.startsWith("✓") ? p.success : i === state.row ? p.processing : p.subtle);
      el.setAttribute("stroke-width", i === state.row ? "4" : "2");
    });
    m.svg.querySelectorAll("[data-payload]").forEach((el, i) => {
      const path = active?.paths[i];
      el.style.display = path && !motion.matches ? "" : "none";
      if (path) {
        const q = path.getPointAtLength(
          (path.getTotalLength() * (m.time - active.start)) / active.duration,
        );
        el.setAttribute("transform", `translate(${q.x},${q.y})`);
        const label = el.querySelector("[data-payload-label]");
        const caption = label.querySelector("text");
        const payloadLabel = Array.isArray(active.label) ? active.label[i] : active.label;
        if (caption.textContent !== payloadLabel) {
          caption.innerHTML = completionMarks(payloadLabel);
          const width = Math.max(76, caption.getComputedTextLength() + 16);
          label.dataset.width = String(width);
          label.querySelector("rect").setAttribute("x", String(-width / 2));
          label.querySelector("rect").setAttribute("width", String(width));
        }
        const halfWidth = Number(label.dataset.width) / 2;
        const x = Math.max(halfWidth + 6, Math.min(m.width - 6 - halfWidth, q.x));
        const y = q.y >= 42 ? q.y - 24 : q.y + 24;
        label.setAttribute("transform", `translate(${x - q.x},${y - q.y})`);
      }
    });
    m.section.dataset.state = JSON.stringify(state);
    m.section.dataset.time = String(Math.round(m.time));
    m.section.querySelector("progress").value = m.time / m.duration;
    m.section.querySelector('[data-action="play"]').textContent =
      m.wanted && m.time < m.duration ? "Pause" : "Play";
    m.section.querySelector("output").textContent =
      m.time >= m.duration ? "Complete" : "";
  }
  const active = (m) =>
    m.wanted && m.visible && m.time < m.duration && !document.hidden;
  function tick(now) {
    frame = null;
    const dt = previous === null ? 0 : Math.min(80, now - previous);
    previous = now;
    models.filter(active).forEach((m) => {
      m.time = Math.min(m.duration, m.time + dt);
      paint(m);
    });
    if (models.some(active)) frame = requestAnimationFrame(tick);
    else previous = null;
  }
  function schedule() {
    if (frame === null && models.some(active)) {
      previous = null;
      frame = requestAnimationFrame(tick);
    }
  }
  function applyTheme() {
    p = window.visualTokens[theme];
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    Object.entries(p).forEach(([k, v]) =>
      document.documentElement.style.setProperty("--" + k, v),
    );
    document
      .querySelector("#theme")
      .setAttribute("aria-pressed", String(theme === "dark"));
    models.forEach(build);
  }
  models.forEach((m) =>
    m.section.addEventListener("click", (e) => {
      const a = e.target.closest("[data-action]")?.dataset.action;
      if (!a) return;
      if (a === "replay") {
        m.time = 0;
        m.wanted = !motion.matches;
      }
      if (a === "step") {
        m.wanted = false;
        m.time =
          m.events.find((e) => e.arrival > m.time)?.arrival ?? m.duration;
      }
      if (a === "play") {
        if (m.time === m.duration) m.time = 0;
        m.wanted = !m.wanted;
      }
      paint(m);
      schedule();
    }),
  );
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(
      (e) =>
        (models.find((m) => m.section === e.target).visible = e.isIntersecting),
    );
    schedule();
  });
  document.querySelector("#theme").addEventListener("click", () => {
    theme = theme === "dark" ? "light" : "dark";
    try {
      localStorage.setItem("visual-lab-theme", theme);
    } catch {}
    applyTheme();
  });
  motion.addEventListener("change", () => {
    if (motion.matches)
      models.forEach((m) => {
        m.wanted = false;
        paint(m);
      });
    schedule();
  });
  document.addEventListener("visibilitychange", () => {
    previous = null;
    schedule();
  });
  applyTheme();
  const layoutObserver = new ResizeObserver(() => {
    const m = models.find(model => model.id === "retry");
    if (m.wide === (m.section.querySelector(".stage").clientWidth >= 600)) return;
    const index = m.events.findIndex(event => event.arrival >= m.time);
    const event = m.events[index];
    const offset = event ? m.time-event.start : 0;
    const fraction = event && offset >= 0 ? offset/event.duration : null;
    build(m);
    m.time = index < 0 ? m.duration : m.events[index].start + (fraction === null ? offset : fraction*m.events[index].duration);
    paint(m);
    schedule();
  });
  layoutObserver.observe(models.find(m => m.id === "retry").section.querySelector(".stage"));
  models.forEach((m) => observer.observe(m.section));
})();
