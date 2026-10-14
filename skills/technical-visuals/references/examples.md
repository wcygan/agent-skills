# Examples and counterexamples

Open [the reference studio](../examples/index.html). It is a new, dependency-free
HTML/SVG implementation of six useful teaching patterns. Scripts and tokens are
local files; no server or external font is needed. Start with 2D and switch state
with native buttons. Select 3D explicitly to see the replication model in depth.

| Pattern | Good choice | Counterexample | Transferable repair |
| --- | --- | --- | --- |
| Request routing | One selected route; available alternatives remain visible | All edges equally saturated | Highlight the reader's question, retain neutral context |
| Bounded queue | Finite slots; waiting and active work named separately | Staggered marks obscure capacity | Align repeated units and expose the bound |
| Cache paths | Stable geometry; numbered read path | Same emphasis on hit/miss branches | Change state, not the whole layout |
| Replication | Named ownership groups and a verb on the edge | Decorative rings or a 3D plane compete with the route | Remove marks that do not encode meaning |
| Ordered records | Offsets remain; next-read pointer advances | Every record competes for attention | Emphasize position without implying deletion |
| Checkpoint recovery | Named steps in one reading direction | A crowded loop suggests cyclic order | Use numbered sequence and name the recovery boundary |

The counterexamples intentionally contain poor presentation. They are not starter
assets. Read the diagnosis next to each before borrowing a pattern. Their domain
facts remain the same; visual emphasis, ordering, or occlusion makes interpretation
harder. The studio is a reference gallery, not a benchmark of reader comprehension.

## How to adapt

1. Choose the relationship being taught, not the example whose topic sounds closest.
2. Replace toy facts with verified task facts. Remove example assumptions such as
   queue rejection policy when they do not apply.
3. Preserve useful geometry and theme semantics, not the exact node count or labels.
4. Copy the minimum source needed into the requested output directory. The studio
   itself is not a required dependency for a standalone artifact.
5. Inspect every relevant state, theme, and exported result at its delivery size.

## Repeatable checks

The browser test uses a caller-supplied Playwright installation. Resolve these paths
from the loaded skill directory. It writes screenshots and exports to the specified
output directory, never to the installed skill. Use an existing environment or
install Playwright in a disposable tooling directory when authorized; do not add
packages or a lockfile to a target project merely to inspect a figure.

```sh
PLAYWRIGHT_MODULE=/absolute/path/to/playwright/index.mjs \
  node scripts/check-examples.mjs /absolute/path/to/review-output
```

Run that command with this skill as the working directory. The test opens local
files, checks all 2D states in both themes, bounded 3D views, keyboard controls,
compact-page overflow, theme contrast, and actual SVG/PNG downloads. It also saves
representative screenshots. Inspect those images separately; passing assertions
cannot judge whether a relationship is explained well. Browser availability is an
external prerequisite, not a promise made by the skill.

The 3D reference uses a bounded orthographic projection and input-driven redraws, with
no animation loop or free orbit. It does not demonstrate arbitrary scene occlusion,
real-time simulation, or a full 3D rendering engine. Use its bounded pattern only
when that limitation fits the requested artifact.

## System design interview architectures

Four portable pages apply the same tokens and 2D vocabulary to original,
illustrative designs. They are architecture explainers, not backend services.
Open them directly from disk or follow the links from the studio:

- [URL shortener](../examples/systems/shortener.html): unique codes, cache hits,
  misses, and bounded database fallback.
- [News feed](../examples/systems/feed.html): transactional outbox, deduplicated
  fanout, hybrid reads, and high-fanout authors.
- [Real-time analytics](../examples/systems/analytics.html): event-time windows,
  late data, versioned output, and checkpoint recovery.
- [Distributed job scheduler](../examples/systems/scheduler.html): durable runs,
  outbox dispatch, leases, fenced status, idempotent effects, and retry limits.

Each opens with user stories, API inputs and outcomes, core entities, and explicit
workload assumptions. It then presents the complete static architecture, scope, tradeoffs, three
bottlenecks with scaling responses, an illustrative capacity estimate, and an SVG
export. Architecture pages do not use step selectors or progressive highlighting.
The scheduler takes the user's linked interview problem as a prompt; its chosen
outbox/lease architecture is an original refinement, not a reproduction of the
article. Primary references support the outbox and Flink-specific semantics.

Run `scripts/check-systems.mjs` with the same `PLAYWRIGHT_MODULE` and external
output-directory arguments as the studio check. It exercises all four pages in
both themes, checks text bounds, architecture content, and theme controls, verifies compact layout,
and downloads and renders eight standalone SVG exports.

## Blog visual lab

[Eight post pages](../examples/blog/index.html) reinterpret the complete diagram
inventory of eight wcygan.net posts. The earlier system-design pages remain
available through an archive link. These are original 2D renderings using the
shared tokens, with per-figure controls for causal animation and manual steps.
They open directly from disk without a build or external runtime.

| Post | Source figures | Coverage |
| --- | --- | --- |
| The Big Database at Work | 7 | Regions, hardware, traffic, recent-key locality, memory reads, working-set budget, tree depth |
| Distributed Transactions | 3 | Prepare, durable decision, replicated shards |
| Gossip Protocols | 2 | Epidemic metaphor and peer membership dissemination |
| Replication | 3 | Database log, log replication, group replication lag |
| Leader Election | 1 | Election workbench and source scenarios |
| Failure Detectors | 1 | Heartbeats, independent deadlines, failure and network controls |
| Kafka Partitioning | 1 | Animated record routing and partition-local logs |
| Connection Pooling | 4 | Socket reuse, scaling curve, server resources, pool exhaustion |

Source inspection: October 14, 2026. Local MDX and component models were read
from the user's `wcygan.net` checkout at HEAD
`886952b6dfba627def184e436a6941bc46a0218c`. The checkout contains uncommitted work;
this is not a claim that all inspected content is in that revision. In particular,
`src/posts/the-big-database-at-work.mdx` was locally modified and its live URL was
unavailable during the initial inspection. Each page links its original article.
The source blog checkout is unchanged by this work.

Each page owns its rendering and teaching model in a same-named JavaScript file.
The `data-source-component` attribute maps each figure back to its source
component; `data-figure` provides a stable identifier. Models distinguish article
observations, illustrative quantities, and protocol simplifications. Animation
is optional: manual steps expose the same states, and theme changes preserve them.

Run `scripts/check-blog.mjs` with `PLAYWRIGHT_MODULE` and an external output path
as above. It checks the full source inventory, all eight pages in both themes,
manual steps and theme preservation, keyboard theme switching, narrow layout,
text bounds, and standalone SVG exports in both themes. Post-specific `check-blog-<slug>.mjs` checks, where provided,
exercise deeper model behavior. Inspect screenshots separately for causal clarity,
route collisions, and legibility; automated coverage does not judge visual quality.
