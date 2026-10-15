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

## Lessons from the blog iterations

These are communication precedents, not mandatory layouts or protocol guarantees.
Open each linked page to inspect its current states in both themes.

| Situation | Preferred treatment | Avoid / why |
| --- | --- | --- |
| [Overlapping index lessons](../examples/blog/the-big-database-at-work.html) | One four-level lookup with a visible hot edge; capacity math stays compact | Separate depth and locality animations repeat the same model and controls |
| [Hardware and query traffic](../examples/blog/the-big-database-at-work.html) | Resource icons, capacity bars, a moving chart cursor, compact reported statistics | Paragraphs on the canvas; aggregate CPU usage drawn as individual busy cores |
| [Distributed transactions](../examples/blog/distributed-transactions.html) | Accumulate arriving yes votes; retain replicas and local majority; finish after acknowledgements return | Empty state until the last vote; removing replicas; declaring completion before the response arrives |
| [Leader election](../examples/blog/leader-election.html) | Stable node colors, a gold leader star, candidate ballot icon, small term/vote metadata | Stripping all metadata makes roles and election decisions indistinguishable |
| [Gossip and failure detection](../examples/blog/gossip-protocols.html) / [timers](../examples/blog/failure-detectors.html) | Infection on payload arrival; red heartbeats; independent local timer state | Coloring recipients early implies receipt; shared timers suggest a global failure verdict |
| [Follower identity and timeout popup](../examples/blog/failure-detectors.html) | Distinct, stable node colors repeated in timers, connections, and the popup's node-ID badge; heartbeats remain red | One shared follower color obscures whose timer expired; a generic failure popup loses the connection to the node |
| [Replication](../examples/blog/replication.html) | Horizontal logs; each database owns its history; copied entries buffer before applying; the same pair shows lag and recovery | Oversized transport machinery crowds out the receiving/applying distinction |
| [Kafka partitioning](../examples/blog/kafka-partitioning.html) | Stable key colors, visible key-to-partition routing, compact partition-local logs | Fast decorative dots, off-path motion, or oversized empty logs hide the mapping |

Keep the initial view concise: short actor labels, visual state, and breathing room.
Use a disclosure for exact metadata, assumptions, and caveats that do not belong on
the canvas. Keep critical facts visible; fewer words must not erase causality.
For a demo gallery, use a title, a short description, and an abstract thumbnail
rather than a miniature screenshot of the full interface.

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

[Ten post pages](../examples/blog/index.html) reinterpret the complete diagram
inventory of ten wcygan.net posts. The earlier system-design pages remain
available through an archive link. These are original 2D renderings using the
shared tokens, with per-figure controls for causal animation and manual steps.
They open directly from disk without a build or external runtime.

| Post | Source figures | Coverage |
| --- | --- | --- |
| The Big Database at Work | 7 | Regions, hardware, traffic, recent-key locality, memory reads, working-set budget, tree depth |
| Distributed Transactions | 3 | One continuous prepare/decision demo, plus replicated shards |
| Gossip Protocols | 2 | Epidemic metaphor and peer membership dissemination |
| Replication | 3 | Database log, log replication, group replication lag |
| Leader Election | 1 | Election workbench and source scenarios |
| Failure Detectors | 1 | Heartbeats, independent deadlines, failure and network controls |
| Kafka Partitioning | 1 | Animated record routing and partition-local logs |
| N+1 Query Problem | 1 | Known-ID sequential lookups versus a batch; equal records, fewer round trips |
| Optimistic Locking | 1 | Shared read, successful guarded write, stale rejection, reread, and retry |
| Fanout | 3 | Service graph, causal request amplification, and redundant downstream traffic removed |

The three added posts were inspected on October 15, 2026 against their live pages
and local MDX/component sources. The N+1 example begins with known IDs (N calls
versus one batch); optimistic locking keeps the rejected row unchanged until a
fresh read and retry; fanout distinguishes illustrative traffic from reported facts.

Initial source inspection: October 14, 2026. Local MDX and component models were read
from the user's `wcygan.net` checkout at HEAD
`886952b6dfba627def184e436a6941bc46a0218c`. The checkout contains uncommitted work;
this is not a claim that all inspected content is in that revision. In particular,
`src/posts/the-big-database-at-work.mdx` was locally modified and its live URL was
unavailable during the initial inspection. Each page links its original article.
The source blog checkout is unchanged by this work.

Each page owns its rendering and teaching model in a same-named JavaScript file.
The `data-source-component` attribute maps each figure back to its source
component; merged renditions use `data-source-components` to retain each source
mapping. The source inventory includes 23 figures. Related lessons can share a rendered
diagram: transaction prepare and decision share one continuous demo, as do the
database index-depth and recent-read figures. `data-figure` provides a
stable identifier. Models distinguish article
observations, illustrative quantities, and protocol simplifications. Animation
starts automatically when a figure is visible. Pause and step preserve manual
control; offscreen and hidden figures suspend without catching up elapsed time.
Reduced-motion preferences start the models paused. Theme changes preserve state.
These reading demos have no SVG download controls. Animation uses browser-timed
motion or requestAnimationFrame with elapsed time; moving packets should update
stable elements instead of rebuilding a diagram each frame. Follow the display's
refresh rate without speeding up the teaching sequence. A 120 Hz display provides
about 8.33 ms per frame, but callback timing alone does not prove rendered frame rate.

Run `scripts/check-blog.mjs` with `PLAYWRIGHT_MODULE` and an external output path
as above. It checks the full source inventory, all ten pages in both themes,
manual steps and theme preservation, keyboard theme switching, narrow layout,
text bounds, and the absence of SVG download controls in both themes. Post-specific `check-blog-<slug>.mjs` checks, where provided,
exercise deeper model behavior. `check-blog-fanout.mjs` verifies arrival-derived
launches, concurrent payloads on distinct branches, route alignment, and final 1/3/6 counts. `check-blog-working-set-budget.mjs` checks the
integrated disk-scale map and animated occupancy, matching panel geometry, icons,
and used/free counters through every arrival and responsive redraw. Inspect screenshots separately for causal clarity,
route collisions, and legibility; automated coverage does not judge visual quality.


For phone acceptance, run `scripts/check-blog-mobile.mjs` with the same module
and external output arguments. It checks 360/390/430-pixel viewports in both
themes, primary-stage overflow, rendered SVG label sizes, control hit heights,
and native input text sizes, and saves 390-pixel figure screenshots. The gallery
uses compact diagram geometry below 600 pixels rather than scaled-down desktop
canvases. Post-specific checks cover model preservation through responsive redraws
and deeper touch/playback behavior. Inspect the phone screenshots for spacing,
reading order, route collisions, and useful abstraction as well as passing bounds.
