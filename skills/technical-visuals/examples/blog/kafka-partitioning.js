(() => {
  const keys = [
    "order-101",
    "order-102",
    "order-103",
    "order-109",
    "order-113",
    "order-129",
  ];
  const sequence = [0, 1, 2, 3, 4, 5, 1, 2, 0];
  function murmur2(key) {
    const bytes = new TextEncoder().encode(key);
    let remaining = bytes.length,
      hash = (0x9747b28c ^ remaining) >>> 0,
      i = 0;
    const m = 0x5bd1e995;
    while (remaining >= 4) {
      let k =
        bytes[i] |
        (bytes[i + 1] << 8) |
        (bytes[i + 2] << 16) |
        (bytes[i + 3] << 24);
      k = Math.imul(k, m);
      k ^= k >>> 24;
      k = Math.imul(k, m);
      hash = Math.imul(hash, m) ^ k;
      i += 4;
      remaining -= 4;
    }
    if (remaining === 3) hash ^= bytes[i + 2] << 16;
    if (remaining >= 2) hash ^= bytes[i + 1] << 8;
    if (remaining >= 1) {
      hash ^= bytes[i];
      hash = Math.imul(hash, m);
    }
    hash ^= hash >>> 13;
    hash = Math.imul(hash, m);
    hash ^= hash >>> 15;
    return hash >>> 0;
  }
  const figure = document.querySelector("[data-figure]"),
    svg = document.querySelector("#diagram");
  const play = document.querySelector('[data-action="play"]');
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  let step = 0,
    count = 3,
    mode = "keyed",
    speed = 1,
    playing = false,
    timer,
    animation;
  let theme =
    localStorage.getItem("visual-lab-theme") ||
    (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  function records() {
    const offsets = Array(count).fill(0);
    return sequence.map((k, i) => {
      const hash = murmur2(keys[k]) & 0x7fffffff;
      const partition = (mode === "keyed" ? hash : i) % count;
      return {
        id: i + 1,
        key: keys[k],
        hash,
        partition,
        offset: offsets[partition]++,
      };
    });
  }
  function stop() {
    playing = false;
    clearTimeout(timer);
    animation?.pause();
    play.textContent = "Play";
  }
  function schedule() {
    clearTimeout(timer);
    if (playing && step < 18)
      timer = setTimeout(() => {
        step++;
        render(true);
        schedule();
      }, 1200 / speed);
    else if (step === 18) stop();
  }
  function render(motion = false) {
    animation?.cancel();
    const t = window.visualTokens[theme],
      list = records(),
      appended = list.slice(0, Math.floor(step / 2));
    const current = step ? list[Math.floor((step - 1) / 2)] : null;
    const routing = step % 2 === 1,
      height = 320 + count * 100;
    const text = (x, y, value, size = 14, color = t.text, anchor = "middle") =>
      `<text x="${x}" y="${y}" fill="${color}" font-size="${size}" text-anchor="${anchor}" dominant-baseline="middle">${value}</text>`;
    const rect = (x, y, w, h, fill, stroke = t.border) =>
      `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>`;
    const laneY = (p) => 250 + p * 100;
    const card = (r, x, y, stroke = t.storage) =>
      rect(x, y, 60, 52, t.storageFill, stroke) +
      text(x + 30, y + 17, `#${r.id}`, 15) +
      text(x + 30, y + 37, r.key.slice(6), 12);
    let out = `<title id="svg-title">Producer routes nine records into ${count} partition logs</title><desc id="svg-desc">${mode} routing. Each log has independent offsets. Record numbers identify producer order; three-digit labels are order key suffixes.</desc><rect width="1060" height="${height}" fill="${t.surface}"/>`;
    out += text(
      30,
      30,
      "PRODUCER SEQUENCE · record ID / order key",
      13,
      t.muted,
      "start",
    );
    list.forEach((r, i) => {
      const x = 30 + i * 112;
      out +=
        rect(
          x,
          52,
          100,
          51,
          i < appended.length ? t.raised : t.flowFill,
          current?.id === r.id ? t.focus : t.flow,
        ) +
        text(x + 50, 68, `#${r.id}`, 13) +
        text(x + 50, 88, r.key, 12);
    });
    out +=
      rect(30, 160, 150, 76, t.processingFill, t.processing) +
      text(105, 185, "Producer", 17) +
      text(105, 211, "one record at a time", 12);
    out += text(
      360,
      145,
      "orders.events · append-only logs",
      17,
      t.text,
      "start",
    );
    out += text(
      360,
      174,
      "ID # / key suffix inside each record • local offset below",
      12,
      t.muted,
      "start",
    );
    for (let p = 0; p < count; p++) {
      const y = laneY(p),
        active = routing && current.partition === p;
      out += `<path d="M180 198 H225 V${y + 26} H300" fill="none" stroke="${active ? t.focus : t.border}" stroke-width="${active ? 2.5 : 1.2}"/><path d="M293 ${y + 21} L300 ${y + 26} L293 ${y + 31}" fill="none" stroke="${active ? t.focus : t.border}"/>`;
      out +=
        text(322, y + 26, `P${p}`, 16) +
        rect(350, y - 8, 670, 80, t.storageFill, t.storage);
      const local = list.filter((r) => r.partition === p);
      local.forEach((r) => {
        const x = 362 + r.offset * 72;
        out +=
          `<rect x="${x}" y="${y}" width="60" height="52" rx="6" fill="${t.surface}" stroke="${t.subtle}"/>` +
          text(x + 30, y + 64, `${r.offset}`, 12, t.muted);
      });
      appended
        .filter((r) => r.partition === p)
        .forEach((r) => {
          out += card(
            r,
            362 + r.offset * 72,
            y,
            current.id === r.id ? t.focus : t.storage,
          );
        });
    }
    if (routing) {
      const x = 362 + current.offset * 72,
        y = laneY(current.partition);
      out += `<g id="packet" transform="translate(${x} ${y})">${card(current, 0, 0, t.focus)}</g>`;
    }
    const formula = current
      ? mode === "keyed"
        ? `${current.hash} % ${count} = P${current.partition}`
        : `${current.id - 1} % ${count} = P${current.partition}`
      : mode === "keyed"
        ? `positive(murmur2(UTF-8 key)) % ${count}`
        : `producer counter % ${count}`;
    out +=
      text(30, height - 36, formula, 16, t.control, "start") +
      text(
        1020,
        height - 36,
        `${appended.length} / 9 appended`,
        14,
        t.muted,
        "end",
      );
    svg.setAttribute("viewBox", `0 0 1060 ${height}`);
    svg.setAttribute("font-family", "ui-monospace, monospace");
    svg.innerHTML = out;
    figure.dataset.state = JSON.stringify({ mode, count, step, appended });
    document.querySelector("#status").textContent = current
      ? `${routing ? "Routing" : "Appended"} record #${current.id} (${current.key}) → P${current.partition}, offset ${current.offset}.${step === 18 ? " All nine records are retained." : ""}`
      : `Ready: ${count} ${count === 1 ? "partition" : "partitions"}. Step to route record #1; step again to append it.`;
    document.querySelector('[data-action="step"]').disabled = step === 18;
    if (routing && motion && !reduced.matches) {
      const x = 362 + current.offset * 72,
        y = laneY(current.partition);
      animation = document
        .querySelector("#packet")
        .animate(
          [
            { transform: "translate(75px, 172px)" },
            { transform: `translate(195px, 172px)`, offset: 0.25 },
            { transform: `translate(195px, ${y}px)`, offset: 0.55 },
            { transform: `translate(${x}px, ${y}px)` },
          ],
          { duration: 950 / speed, easing: "ease-in-out", fill: "forwards" },
        );
    }
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
        theme === "dark" ? "Switch to light theme" : "Switch to dark theme",
      );
    render();
  }
  document.querySelector("#theme").onclick = () => {
    theme = theme === "dark" ? "light" : "dark";
    localStorage.setItem("visual-lab-theme", theme);
    applyTheme();
  };
  document.querySelector('[data-action="step"]').onclick = () => {
    stop();
    step = Math.min(18, step + 1);
    render(true);
  };
  document.querySelector('[data-action="reset"]').onclick = () => {
    stop();
    step = 0;
    render();
  };
  play.onclick = () => {
    if (playing) {
      stop();
      return;
    }
    if (step === 18) {
      step = 0;
      render();
    }
    playing = true;
    play.textContent = "Pause";
    animation?.play();
    schedule();
  };
  document.querySelector("#routing").onchange = (e) => {
    stop();
    mode = e.target.value;
    step = 0;
    render();
  };
  document.querySelector("#partitions").onchange = (e) => {
    stop();
    count = Number(e.target.value);
    step = 0;
    render();
  };
  document.querySelector("#speed").onchange = (e) => {
    speed = Number(e.target.value);
    if (playing) schedule();
  };
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stop();
  });
  reduced.addEventListener("change", () => {
    if (reduced.matches) {
      stop();
      render();
    }
  });
  document.querySelector("#export").onclick = () => {
    const clone = svg.cloneNode(true);
    clone.setAttribute("width", "1060");
    clone.setAttribute("height", String(320 + count * 100));
    const url = URL.createObjectURL(
      new Blob([new XMLSerializer().serializeToString(clone)], {
        type: "image/svg+xml",
      }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = `kafka-partitioning-${theme}.svg`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  window.kafkaPartitioning = { murmur2, records };
  applyTheme();
})();
