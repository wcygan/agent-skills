// Serve references/gallery on port 8765. Run in a dedicated playwright-cli session.
async function verifyGalleryGeometry(page) {
  const base = "http://127.0.0.1:8765/";
  const slugs = [
    "mvcc",
    "deadlock",
    "gap-locks",
    "raft",
    "outbox",
    "consumer-replay",
    "consumer-groups",
    "watermarks",
    "backpressure",
  ];
  await page.route(base + "**", (route) => route.continue());
  await page.emulateMedia({ reducedMotion: "reduce" });
  const failures = [];
  const errors = [];
  let states = 0;
  let wires = 0;
  page.on("pageerror", (error) => errors.push(error.message));
  for (const width of [1040, 640]) {
    await page.setViewportSize({ width, height: 1100 });
    for (const slug of slugs) {
      await page.goto(base + "demos/" + slug + ".html");
      await page.locator("#play").click();
      const modes = await page
        .locator("select option")
        .evaluateAll((nodes) => nodes.map((n) => n.value));
      for (const mode of modes) {
        await page.locator("select").selectOption(mode);
        const steps = Number(
          (await page.locator("#count").innerText()).split("/")[1],
        );
        for (let step = 0; step <= steps; step++) {
          if (step) await page.locator("#step").click();
          const result = await page
            .locator("svg[aria-labelledby]")
            .evaluate((svg) => {
              const issues = [];
              const nodes = [...svg.querySelectorAll("[data-node]")].map(
                (n) => ({
                  id: n.dataset.node,
                  x: +n.dataset.x,
                  y: +n.dataset.y,
                  w: +n.dataset.w,
                  h: +n.dataset.h,
                  container: n.dataset.container === "true",
                  el: n,
                }),
              );
              const texts = [...svg.querySelectorAll("text")].map((t) => ({
                text: t.textContent,
                b: t.getBBox(),
              }));
              const overlap = (a, b) =>
                Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x) >
                  1 &&
                Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y) >
                  1;
              const crosses = (a, b, r) =>
                a[0] === b[0]
                  ? a[0] > r.x + 1 &&
                    a[0] < r.x + r.width - 1 &&
                    Math.max(a[1], b[1]) > r.y + 1 &&
                    Math.min(a[1], b[1]) < r.y + r.height - 1
                  : a[1] > r.y + 1 &&
                    a[1] < r.y + r.height - 1 &&
                    Math.max(a[0], b[0]) > r.x + 1 &&
                    Math.min(a[0], b[0]) < r.x + r.width - 1;
              const port = (n, s) =>
                s === "left"
                  ? [n.x, n.y + n.h / 2]
                  : s === "right"
                    ? [n.x + n.w, n.y + n.h / 2]
                    : s === "top"
                      ? [n.x + n.w / 2, n.y]
                      : [n.x + n.w / 2, n.y + n.h];
              for (const n of nodes) {
                for (const t of n.el.querySelectorAll("text")) {
                  const b = t.getBBox();
                  if (
                    b.x < n.x ||
                    b.x + b.width > n.x + n.w ||
                    b.y < n.y ||
                    b.y + b.height > n.y + n.h
                  )
                    issues.push(
                      `${n.id}: label outside node (${t.textContent})`,
                    );
                }
                if (n.x < 0 || n.y < 0 || n.x + n.w > 820 || n.y + n.h > 400)
                  issues.push(`${n.id}: outside stage`);
              }
              for (let i = 0; i < nodes.length; i++)
                for (let j = i + 1; j < nodes.length; j++) {
                  const a = nodes[i],
                    b = nodes[j];
                  if (
                    !a.container &&
                    !b.container &&
                    overlap(
                      { x: a.x, y: a.y, width: a.w, height: a.h },
                      { x: b.x, y: b.y, width: b.w, height: b.h },
                    )
                  )
                    issues.push(`overlapping nodes: ${a.id} / ${b.id}`);
                }
              for (let i = 0; i < texts.length; i++) {
                if (texts[i].b.x < 0 || texts[i].b.x + texts[i].b.width > 820)
                  issues.push(`clipped label: ${texts[i].text}`);
                for (let j = i + 1; j < texts.length; j++)
                  if (overlap(texts[i].b, texts[j].b))
                    issues.push(
                      `overlapping labels: ${texts[i].text} / ${texts[j].text}`,
                    );
              }
              const paths = [...svg.querySelectorAll("[data-wire]")];
              for (const wire of paths) {
                const points = JSON.parse(wire.dataset.points),
                  from = nodes.find((n) => n.id === wire.dataset.from),
                  to = nodes.find((n) => n.id === wire.dataset.to),
                  name = `${from.id} → ${to.id}`;
                for (const [actual, expected] of [
                  [points[0], port(from, wire.dataset.fromSide)],
                  [points.at(-1), port(to, wire.dataset.toSide)],
                ])
                  if (actual.some((v, i) => v !== expected[i]))
                    issues.push(`${name}: missed port`);
                let length = 0;
                for (let i = 1; i < points.length; i++) {
                  const a = points[i - 1],
                    b = points[i];
                  if (a[0] !== b[0] && a[1] !== b[1])
                    issues.push(`${name}: diagonal segment`);
                  length += Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);
                  for (const n of nodes)
                    if (
                      !n.container &&
                      crosses(a, b, { x: n.x, y: n.y, width: n.w, height: n.h })
                    )
                      issues.push(`${name}: crosses ${n.id}`);
                  for (const t of texts)
                    if (crosses(a, b, t.b))
                      issues.push(`${name}: crosses label ${t.text}`);
                }
                const first = points[0],
                  last = points.at(-1),
                  shortest =
                    Math.abs(first[0] - last[0]) + Math.abs(first[1] - last[1]);
                if (wire.dataset.corridor === "false" && length !== shortest)
                  issues.push(`${name}: unnecessary detour`);
                const markerUrl = wire.getAttribute("marker-end");
                const marker =
                  markerUrl && svg.querySelector(markerUrl.slice(4, -1));
                if (
                  !marker ||
                  marker.getAttribute("refX") !== "8" ||
                  marker.getAttribute("refY") !== "0" ||
                  marker.getAttribute("orient") !== "auto"
                )
                  issues.push(`${name}: arrowhead is not centered on the port`);
                const before = points.at(-2),
                  dx = last[0] - before[0],
                  dy = last[1] - before[1];
                const side = wire.dataset.toSide;
                if (
                  !(side === "left"
                    ? dx > 0 && dy === 0
                    : side === "right"
                      ? dx < 0 && dy === 0
                      : side === "top"
                        ? dy > 0 && dx === 0
                        : dy < 0 && dx === 0)
                )
                  issues.push(
                    `${name}: arrowhead does not enter perpendicular to the face`,
                  );
              }
              return { issues, wires: paths.length };
            });
          states++;
          wires += result.wires;
          for (const issue of result.issues)
            failures.push(`${width}/${slug}/${mode}/${step}: ${issue}`);
          if (step === Math.min(4, steps) && mode === modes[0])
            await page.screenshot({
              path: `/tmp/refined-${width}-${slug}.png`,
              fullPage: true,
            });
        }
      }
      if (
        await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth,
        )
      )
        failures.push(`${width}/${slug}: horizontal page overflow`);
    }
  }
  if (errors.length || failures.length)
    throw new Error(
      JSON.stringify({ states, wires, errors, failures }, null, 2),
    );
  return { states, wires, widths: [1040, 640], screenshots: 18, errors: 0 };
}
