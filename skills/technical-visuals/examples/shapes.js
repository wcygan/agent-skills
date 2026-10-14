/* A semantic vocabulary, not a set of vendor logos or protocol guarantees. */
window.renderShapeLibrary = function (theme) {
  const t = window.visualTokens[theme];
  const groups = [
    [
      "Compute & ownership",
      [
        [
          "service",
          "Service",
          "API",
          "Rounded rectangle for a service or process.",
          "Do not use a different silhouette for every service.",
        ],
        [
          "worker",
          "Worker",
          "Worker",
          "A task lane with input and output ports; consumes or runs work.",
          "Ports show work entering and leaving; label concurrency separately.",
        ],
        [
          "client",
          "Client",
          "Client",
          "Screen frame for a user-facing application or caller.",
          "Use a service box for machine callers when the distinction is irrelevant.",
        ],
        [
          "boundary",
          "Boundary",
          "Region A",
          "Dashed enclosure groups ownership, region, or trust.",
          "Name the boundary; dashed styling alone does not define security.",
        ],
      ],
    ],
    [
      "Storage & data organization",
      [
        [
          "database",
          "Database",
          "Database",
          "Cylinder for a persistent structured store.",
          "A cylinder does not promise transactions or replication.",
        ],
        [
          "cache",
          "Cache",
          "Cache",
          "A memory module with pins, distinct from durable storage.",
          "Do not assume persistence, eviction, or a hit rate.",
        ],
        [
          "object",
          "Object storage",
          "Objects",
          "Bucket with discrete objects for blob storage.",
          "Do not imply filesystem paths or atomic directory operations.",
        ],
        [
          "table",
          "Table / dataset",
          "Rows",
          "Named columns and sample records, like a database table.",
          "Rows describe organization, not storage technology.",
        ],
        [
          "shards",
          "Sharded store",
          "Shards",
          "Several labeled partitions in one enclosing store.",
          "Distinguish partitioning from replicas of the same data.",
        ],
      ],
    ],
    [
      "Data movement & execution",
      [
        [
          "queue",
          "Bounded queue",
          "Queue",
          "Tray with finite slots for waiting work.",
          "Show capacity and overflow policy when they matter.",
        ],
        [
          "log",
          "Append-only log",
          "Log",
          "Ordered offset cells for retained events.",
          "Advancing a reader is not deleting a record.",
        ],
        [
          "stream",
          "Stream",
          "Stream",
          "Directed sequence of events for ongoing flow.",
          "Do not imply global ordering or delivery guarantees.",
        ],
        [
          "batch",
          "Batch",
          "Batch",
          "Grouped records processed as a bounded unit.",
          "A group is not automatically one transaction.",
        ],
        [
          "document",
          "Document / artifact",
          "Artifact",
          "Folded corner for a file, message payload, or generated artifact.",
          "Label its content or role; the icon does not define a format.",
        ],
      ],
    ],
    [
      "Decisions & control flow",
      [
        [
          "decision",
          "Decision",
          "Hit?",
          "Diamond for a condition with labeled outgoing branches.",
          "Never leave yes/no or other branch conditions implicit.",
        ],
        [
          "terminal",
          "Start / finish",
          "Start",
          "Capsule marks a process entry or terminal state.",
          "Do not use it as an interchangeable service box.",
        ],
        [
          "gate",
          "Gate / policy",
          "Allow?",
          "Hexagon for an admission check or explicit policy boundary.",
          "Label the rule; the shape alone is not a security control.",
        ],
        [
          "timer",
          "Timer / wait",
          "Wait",
          "Clock for a delay, deadline, or scheduled wake-up.",
          "State the duration or event; waiting is not processing.",
        ],
        [
          "fork",
          "Fork / join",
          "Fork",
          "Bar with branches for parallel control flow.",
          "State whether completion waits for all, any, or a quorum.",
        ],
      ],
    ],
  ];
  groups.push([
    "Data structures & algorithms",
    [
      [
        "array",
        "Array",
        "",
        "Indexed contiguous slots.",
        "Show indices; do not draw pointers between cells.",
      ],
      [
        "list",
        "List",
        "",
        "An ordered sequence as an abstract collection.",
        "A list does not specify linked or contiguous storage.",
      ],
      [
        "linked",
        "Linked list",
        "",
        "Separate nodes joined by next pointers.",
        "Show head, termination, and direction when relevant.",
      ],
      [
        "fifo",
        "FIFO queue",
        "",
        "Insert at the tail; remove the oldest item at the head.",
        "FIFO order is separate from capacity and delivery guarantees.",
      ],
      [
        "stack",
        "Stack",
        "",
        "Push and pop at the same top end.",
        "Do not imply FIFO order.",
      ],
      [
        "hash",
        "Hash table",
        "",
        "Hash selects a bucket; collisions share that bucket.",
        "This example uses chaining; name other collision strategies.",
      ],
      [
        "node",
        "Node",
        "",
        "A labeled vertex or element.",
        "An isolated node says nothing about its relationships.",
      ],
      [
        "tree",
        "Tree",
        "",
        "Rooted hierarchy with parent-child edges.",
        "A tree has no cycles; child order needs explicit meaning.",
      ],
      [
        "graph",
        "Graph",
        "",
        "Vertices and edges; cycles are possible.",
        "Add arrows or weights only when they have meaning.",
      ],
      [
        "search",
        "Binary search",
        "",
        "Compare the midpoint and narrow a sorted interval.",
        "Requires a sorted search space; show eliminated ranges in a walkthrough.",
      ],
    ],
  ]);
  groups.push([
    "Streaming & time",
    [
      [
        "tumbling",
        "Tumbling windows",
        "",
        "Fixed-size adjacent time ranges with no overlap.",
        "Label size, time basis, and boundary inclusion in a real example.",
      ],
      [
        "sliding",
        "Sliding windows",
        "",
        "Fixed-size ranges start at a regular slide; these overlap.",
        "State both size and slide. Overlap occurs only when slide is smaller.",
      ],
      [
        "session",
        "Session windows",
        "",
        "Activity groups separated by an inactivity gap.",
        "A late event can merge sessions; boundaries are data-dependent.",
      ],
      [
        "join",
        "Stream join",
        "",
        "Two keyed streams match under a stated time condition.",
        "Distinguish window joins from interval joins; bound retained state.",
      ],
      [
        "watermark",
        "Watermark",
        "",
        "An event-time progress estimate.",
        "It is not a promise that no older event can arrive.",
      ],
      [
        "checkpoint",
        "Checkpoint",
        "",
        "A consistent recovery point for source positions and operator state.",
        "A snapshot alone does not make external side effects exactly once.",
      ],
    ],
  ]);
  groups.push([
    "Delivery & processing contracts",
    [
      [
        "atmost",
        "At-most-once delivery",
        "",
        "An event is received zero or one times; loss is possible.",
        "State the sender/receiver boundary and failure assumptions.",
      ],
      [
        "atleast",
        "At-least-once delivery",
        "",
        "Successful delivery may include duplicate events.",
        "Retries need recovery assumptions; consumers may need deduplication.",
      ],
      [
        "exactly",
        "Exactly-once processing",
        "",
        "Each event affects consistent managed state once, even after replay.",
        "End-to-end effects also require replayable sources and compatible transactional or idempotent sinks.",
      ],
    ],
  ]);
  const categories = [
    "processing",
    "storage",
    "flow",
    "control",
    "storage",
    "flow",
    "control",
  ];
  function glyph(kind, label, category) {
    const ink = t[category],
      fill = t[category + "Fill"];
    const stroke = `fill="${fill}" stroke="${ink}" stroke-width="2"`;
    const path = (d) => `<path d="${d}" ${stroke}/>`;
    const ln = (d) =>
      `<path d="${d}" fill="none" stroke="${ink}" stroke-width="2"/>`;
    const box = (x = 55, y = 40, w = 170, h = 70, r = 6) =>
      `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" ${stroke}/>`;
    const small = (x, y, value) =>
      `<text x="${x}" y="${y}" dominant-baseline="central" text-anchor="middle" fill="${t.text}" font-size="12">${esc(value)}</text>`;
    const cell = (x, y, value, w = 40) =>
      box(x, y, w, 28, 3) + small(x + w / 2, y + 14, value);
    const arrow = (x, y, end) => ln(`M${x} ${y}H${end}m-6-5 6 5-6 5`);
    const circle = (x, y, value) =>
      `<circle cx="${x}" cy="${y}" r="17" ${stroke}/>` + small(x, y, value);
    function pattern(kind) {
      if (["array", "list", "linked", "fifo", "stack", "hash"].includes(kind)) {
        if (kind === "stack")
          return (
            cell(100, 90, "A", 80) +
            cell(100, 62, "B", 80) +
            cell(100, 34, "C", 80) +
            small(140, 17, "push / pop ↓")
          );
        if (kind === "hash")
          return (
            cell(25, 30, "h(k)", 60) +
            arrow(85, 44, 115) +
            cell(115, 30, "0", 35) +
            cell(150, 30, "A", 40) +
            arrow(190, 44, 210) +
            cell(210, 30, "D", 40) +
            cell(115, 65, "1", 35) +
            cell(150, 65, "B", 40) +
            cell(115, 100, "2", 35) +
            small(215, 118, "collision chain")
          );
        let out = "";
        for (let i = 0; i < 4; i++) {
          const x = 30 + i * 58;
          out += cell(
            x,
            60,
            String.fromCharCode(65 + i),
            kind === "array" ? 58 : 40,
          );
          if (kind === "array") out += small(x + 29, 45, String(i));
          else if (kind === "linked" && i < 3) out += arrow(x + 40, 74, x + 58);
        }
        return (
          out +
          small(
            140,
            116,
            kind === "fifo"
              ? "out ← A · B · C · D ← in"
              : kind === "linked"
                ? "head → next pointers"
                : kind === "list"
                  ? "ordered sequence"
                  : "contiguous indexed slots",
          )
        );
      }
      if (["tree", "graph", "node", "search"].includes(kind)) {
        if (kind === "node") return circle(140, 75, "v");
        if (kind === "search")
          return (
            cell(25, 62, "2") +
            cell(72, 62, "5") +
            cell(119, 62, "8") +
            cell(166, 62, "12") +
            cell(213, 62, "19") +
            small(140, 35, "target 12 > midpoint 8") +
            ln("M166 101h87") +
            small(208, 120, "search right")
          );
        let out = ln("M140 35 75 90M140 35 205 90");
        if (kind === "graph") out += ln("M75 90h130");
        else out += ln("M75 90 40 127M75 90 110 127");
        return (
          out +
          circle(140, 35, "A") +
          circle(75, 90, "B") +
          circle(205, 90, "C") +
          (kind === "tree"
            ? circle(40, 127, "D") + circle(110, 127, "E")
            : small(140, 130, "edges may form cycles"))
        );
      }
      if (["tumbling", "sliding", "session"].includes(kind)) {
        let out = arrow(25, 120, 255) + small(140, 139, "event time →");
        const spans =
          kind === "tumbling"
            ? [
                [25, 45, 70],
                [95, 45, 70],
                [165, 45, 70],
              ]
            : kind === "sliding"
              ? [
                  [25, 30, 120],
                  [75, 65, 120],
                  [125, 100, 120],
                ]
              : [
                  [25, 55, 85],
                  [170, 55, 65],
                ];
        for (const [x, y, w] of spans) out += box(x, y, w, 25, 2);
        if (kind === "session") out += small(140, 45, "gap");
        return out;
      }
      if (kind === "join")
        return (
          cell(20, 25, "A:k7", 65) +
          cell(20, 95, "B:k7", 65) +
          ln("M85 39 120 75M85 109 120 75") +
          box(120, 52, 65, 46) +
          small(152, 75, "join") +
          arrow(185, 75, 205) +
          cell(205, 61, "A+B", 55) +
          small(140, 135, "same key + time condition")
        );
      if (kind === "watermark")
        return (
          arrow(25, 80, 255) +
          ln("M155 45v65") +
          small(155, 28, "WM 10s") +
          cell(45, 66, "8s") +
          cell(200, 66, "12s") +
          small(140, 135, "progress estimate")
        );
      if (kind === "checkpoint")
        return (
          cell(20, 40, "source", 65) +
          arrow(85, 54, 110) +
          cell(110, 40, "state", 60) +
          arrow(170, 54, 195) +
          cell(195, 40, "sink", 60) +
          ln("M140 68v30") +
          box(90, 98, 100, 30) +
          small(140, 113, "snapshot n")
        );
      const output =
        kind === "atmost"
          ? "A, C"
          : kind === "atleast"
            ? "A, B, B, C"
            : "A, B, C";
      return (
        small(
          140,
          22,
          kind === "exactly" ? "attempts may replay" : "sent: A, B, C",
        ) +
        arrow(35, 48, 245) +
        box(35, 65, 210, 35) +
        small(140, 82, output) +
        small(
          140,
          125,
          kind === "atmost"
            ? "received · B lost"
            : kind === "atleast"
              ? "received · B duplicated"
              : "committed effects · B once",
        )
      );
    }
    let shape = "",
      labelY = 75;
    switch (kind) {
      case "service":
        shape = box();
        break;
      case "worker":
        shape =
          box(65, 40, 150, 70) +
          ln(
            "M30 75h35m-8-6 8 6-8 6M215 75h35m-8-6 8 6-8 6M78 40v70M202 40v70",
          );
        break;
      case "client":
        shape = box(55, 30, 170, 70) + ln("M140 100v18m-30 0h60");
        labelY = 65;
        break;
      case "boundary":
        shape =
          `<rect x="35" y="25" width="210" height="100" rx="6" ${stroke} stroke-dasharray="6 5"/>` +
          box(70, 50, 140, 50);
        break;
      case "external":
        shape =
          box() +
          `<path d="M208 53h20V33m-20 20 20-20" fill="none" stroke="${t.information}" stroke-width="2"/>`;
        break;
      case "database":
        shape =
          path("M65 43C65 22 215 22 215 43V105C215 126 65 126 65 105Z") +
          `<ellipse cx="140" cy="43" rx="75" ry="15" ${stroke}/>`;
        labelY = 84;
        break;
      case "cache":
        shape =
          box(55, 38, 170, 78, 4) +
          ln(
            "M55 55h170M77 27v11m42-11v11m42-11v11m42-11v11M77 116v11m42-11v11m42-11v11m42-11v11",
          );
        labelY = 85;
        break;
      case "object":
        shape = path("M65 35h150l-18 85H83Z") + ln("M65 44h150");
        labelY = 80;
        break;
      case "table":
        shape =
          box(35, 25, 210, 100, 2) +
          ln("M35 55h210M35 90h210M93 25v100M170 25v100");
        return (
          shape +
          small(64, 40, "id") +
          small(132, 40, "name") +
          small(207, 40, "state") +
          small(64, 72, "01") +
          small(132, 72, "Ada") +
          small(207, 72, "ready") +
          small(64, 107, "02") +
          small(132, 107, "Lin") +
          small(207, 107, "busy")
        );
      case "shards":
        shape = box(35, 30, 210, 100);
        for (let i = 0; i < 3; i++)
          shape +=
            box(50 + i * 63, 67, 54, 48, 2) +
            `<text x="${77 + i * 63}" y="94" text-anchor="middle" fill="${t.muted}" font-size="12">${i}</text>`;
        labelY = 47;
        break;
      case "queue":
        shape = box(35, 30, 210, 100);
        for (let i = 0; i < 4; i++) shape += box(49 + i * 48, 67, 38, 45, 2);
        labelY = 47;
        break;
      case "log":
        shape = box(30, 30, 220, 100);
        for (let i = 0; i < 4; i++)
          shape +=
            box(42 + i * 50, 67, 44, 45, 2) +
            `<text x="${64 + i * 50}" y="94" text-anchor="middle" fill="${t.muted}" font-size="12">${40 + i}</text>`;
        labelY = 47;
        break;
      case "stream":
        shape = ln("M32 95h216m-12-8 12 8-12 8");
        for (let i = 0; i < 4; i++) shape += box(47 + i * 48, 82, 26, 26, 3);
        labelY = 48;
        break;
      case "batch":
        shape =
          box(40, 35, 190, 90) + box(50, 27, 190, 90) + box(60, 19, 190, 90);
        labelY = 64;
        break;
      case "document":
        shape = path("M80 20h95l25 25v90H80Z") + ln("M175 20v25h25");
        labelY = 80;
        break;
      case "decision":
        shape = path("M140 15 235 75 140 135 45 75Z");
        break;
      case "terminal":
        shape = box(55, 45, 170, 60, 30);
        break;
      case "gate":
        shape = path("M75 35h130l35 40-35 40H75L40 75Z");
        break;
      case "timer":
        shape =
          `<circle cx="88" cy="75" r="35" ${stroke}/>` + ln("M88 53v22l15 10");
        return shape + labelGroup(179, 75, label);
      case "fork":
        shape =
          ln(
            "M25 75h40M65 35v80M65 40h60m-7-5 7 5-7 5M65 110h60m-7-5 7 5-7 5M160 40h55M160 110h55M215 35v80M215 75h40m-7-5 7 5-7 5",
          ) +
          box(125, 25, 35, 30, 3) +
          box(125, 95, 35, 30, 3);
        return shape + small(66, 135, "fork") + small(215, 135, "join all");
      default:
        return pattern(kind);
    }
    return shape + labelGroup(140, labelY, label);
  }
  document.getElementById("shape-groups").innerHTML = groups
    .map(
      ([name, items], index) =>
        `<div class="shape-group"><h3 style="color:${t[categories[index]]}">${name}</h3><div class="shape-grid">${items.map(([kind, name, label, use, avoid]) => `<article class="shape-card"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 150" role="img" aria-label="${esc(name)}" font-family="ui-monospace,SFMono-Regular,Consolas,monospace">${glyph(kind, label, categories[index])}</svg><div class="shape-copy"><h4>${name}</h4><p>${use}</p><p class="avoid"><strong>Watch for:</strong> ${avoid}</p></div></article>`).join("")}</div></div>`,
    )
    .join("");
};
