# Dark palette precedent

The dark visual system borrows PlanetScale's emphasis and color hierarchy while
retaining this lab's slate surfaces, shapes, layout, and independent light theme.

## Observed source palettes

Inspected on 2026-10-15:

- [Making 768 servers look like 1](https://planetscale.com/blog/making-768-servers-look-like-1)
  embeds the [architecture diagrams](https://planetscale.com/blog/many-servers-appear-as-one/iframe#popular-arch).
- [Massively parallel Postgres backups](https://planetscale.com/blog/massively-parallel-postgres-backups)
  embeds the [backup diagrams](https://planetscale.com/blog/massively-parallel-postgres-backups/iframe#sharded-database-s3-copy).
- [Concurrency vs. Throughput](https://planetscale.com/blog/concurrency-vs-throughput-vitess-mysql)
  uses the same newer color hierarchy.
- [Caching](https://planetscale.com/blog/caching) and
  [Processes and Threads](https://planetscale.com/blog/processes-and-threads)
  use older or asset-specific palettes; they are useful precedent, not one universal theme.

The newer diagrams expose `#111111` background, `#f4f4f5` labels, `#f35815`
orange traffic, `#0e73cc` blue, `#27b648` green, and `#818181` neutral routes.
Concurrency also uses `#ff455d` for failure. Color appears mainly in outlines,
payloads, and limited tinted interiors. Ordinary labels remain near-white.

The older cache diagram uses solid record colors including `#6fa8dc`,
`#7ccc9c`, `#b694e8`, and `#5cc6b6`. A data item keeps its color while stored,
in transit, and cached. Processes/threads artwork includes cyan `#42dcff`,
yellow `#fbda62`, green `#57ff51`, and red `#ff5d5d`; those are individual
artwork colors rather than the newer diagram theme.

## Neutral foundation, selective color

The previous iterations assumed brighter, more saturated node interiors would
make the whole diagram clearer. They passed contrast checks but competed with
payloads and state. The revised palette uses charcoal surfaces with a slight cool
bias, restrained tinted node interiors, and brighter identity outlines and records.
It follows PlanetScale's hierarchy rather than copying every hue from each article.

Additional guidance reviewed on 2026-10-15:

- [Material dark theme](https://m2.material.io/design/color/dark-theme.html):
  neutral large surfaces and limited color accents.
- [Atlassian elevation](https://atlassian.design/foundations/elevation/): lighter
  surfaces represent elevation in dark mode; avoid excessive raised surfaces.
- [Atlassian color](https://atlassian.design/foundations/color): use semantic
  theme tokens, not literal light-theme inversion.

Canvas, stage, and raised slots form a neutral lightness progression. Node bodies
remain lighter than the stage but use only a restrained tint. Blue, purple, teal,
rose, and amber identify nodes; orange emphasizes traffic, green completion, and
red failure. Labels remain neutral unless their color conveys identity or state.
Exact values live in `examples/tokens.js` and the design-system table.

## Verification

Run `scripts/check-examples.mjs` plus blog and mobile checks. Require ordinary
text contrast of 4.5:1 on its actual background and meaningful boundaries of 3:1.
The 1.3:1 interior/stage step is a visual hierarchy budget, not an accessibility
standard. Do not require minimum saturation or RGB distance between fills.
Identity outlines, labels, and symbols distinguish nodes; the entire interior
need not shout its category.

Inspect the actual diagrams at desktop and phone sizes. Numeric contrast cannot
establish aesthetic harmony. Check moving payloads, buffers, timers, state icons,
and popups. For dark-only changes, preserve the light token object exactly and
compare deterministic light screenshots, distinguishing rasterization noise from
content changes. Preserve established symbols such as the golden leader star.
