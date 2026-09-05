---
name: style-technical-visuals
description: Style technical diagrams, charts, interactive explainers, and dashboards with a consistent visual language. Use when creating or restyling technical visuals that need coherent color roles, typography, spacing, hierarchy, borders, or light and dark themes.
license: MIT
metadata:
  author: William Cygan
  inspiration-url: https://planetscale.com/blog
  version: "0.1.0"
---

# Style Technical Visuals

Apply one coherent visual language to technical artifacts. Use the PlanetScale
Engineering Blog as a directional reference: precise, restrained, technical,
and editorial.

Adapt the language to the target. Preserve existing product tokens and brand
rules when they exist. Use this skill as the fallback system.

## Start from the gallery

Before building any new artifact, do this:

1. Read `references/gallery/GALLERY.html` to see the quality bar and the
   shared token block.
2. Find the closest demo in `references/gallery/demos/` to the artifact you
   were asked to build (pipeline, topology, table sampler, curve, matrix).
3. Copy that demo's geometry, framing, and interaction patterns. Edit toward
   the new content. Do not rebuild from prose alone when a working example
   exists — the prose patterns in `references/design-patterns/` describe the
   gallery demos; they are weaker than the demos themselves.

Every demo in the gallery is a "good example": self-contained, zero-scroll,
fixed-coordinate stage, exact pixel wire alignment, native SVG packets.
Derivative artifacts must meet the same bar.

The curated nine-animation tour lives in
`references/gallery/GALLERY.html` (self-contained; dark theme only). Its header
documents the shared color palette and design tokens; every demo under
`references/gallery/demos/` must use that dark system.
Read `references/caching/planetscale-caching.html` for a perfect, self-contained replica of the
PlanetScale caching article's animations (the real bundle, inlined; opens offline in a browser).
Read `references/caching/index.html` for the clean-room pattern study of the same visuals.
To vendor a future PlanetScale post, follow `references/copy-strategy.md`.
Read `references/io-devices-and-latency/index.html` for the same perfect replica of the
IO devices and latency post.
Read `references/database-sharding/index.html` for the same perfect replica of the
database sharding post.
Read `references/btrees-and-database-indexes/index.html` for the same perfect replica of the
B-trees and database indexes post.
Read `references/concurrency-vs-throughput/index.html` for the same perfect replica of the
doing-more-with-less post (concurrency vs throughput, junction simulator, USL curve).
Read `references/what-is-a-data-topology/index.html` for the same perfect replica of the
data topology post (dual-theme Neki vector diagrams).
Read `references/history-of-postgres-sharding/index.html` for the same perfect replica of the
history of Postgres sharding post (timeline through Ultima Online, Skype, Vitess, Citus, Neki).
Read `references/making-768-servers-look-like-1/index.html` for the same perfect replica of the
many-servers-appear-as-one post (768-server matrix, USL curve, PgBouncer, shard topologies).
Read `references/kubernetes-feedback-loops/index.html` for the same perfect replica of the
feedback loops behind Kubernetes post (nine dual-theme control-loop and controller diagrams).

## Establish the visual contract

Before styling, identify:

- the artifact and its delivery format;
- the audience and reading distance;
- the supported viewport sizes;
- the required light and dark themes;
- the existing design tokens and brand rules; and
- the information that needs visual emphasis.

Resolve each item from available context. Ask one focused question only when a
missing answer changes the visual system.

## Define semantic tokens

Define roles before individual values. At minimum, define:

- canvas, surface, elevated surface, and divider;
- primary, secondary, muted, and inverse text;
- accent, focus, selection, and active path;
- success, warning, danger, and information;
- chart series, diagram groups, and data emphasis; and
- spacing, radius, border, and type scales.

Use semantic names in the artifact. Keep raw color values in one token block.

Start an unbranded fallback palette from these PlanetScale-inspired anchors:

| Role | Anchor | Use |
| --- | --- | --- |
| Ink | `#111111` | Dark canvas or light-theme text |
| Paper | `#fafafa` | Light canvas or dark-theme text |
| Signal | `#f35815` | Sparse emphasis and active state |

Use black and off-white for most surfaces. Use orange to guide attention, not
to decorate. Use `better-colors` when palette generation, gamut, or contrast
calculations require exact values.

For dark-theme artifacts — the default for gallery-style demos — use the
canonical shared system verbatim. Keep these values in one `:root` token
block and reference them only through their role names:

```css
:root {
  color-scheme: dark;
  /* Canvas & surfaces */
  --canvas: #111111;                    /* page background */
  --panel: #1c1c1c;                     /* demo panels, cards, table surfaces */
  --border: rgba(255,255,255,.14);      /* 1px dividers and outlines */
  --border-node: rgba(255,255,255,.22); /* emphasized node outlines */
  --track: rgba(255,255,255,.10);       /* empty tracks, cell wells */
  /* Text */
  --text: #fafafa;                      /* primary */
  --text-muted: rgba(250,250,250,.60);  /* captions, subheads */
  --text-dim: rgba(250,250,250,.40);    /* x-axes, footnotes */
  /* Accent (sparing: active state, focus, taught concept) */
  --accent: #f35815;                    /* the one orange */
  /* Series & states */
  --good: #30a46c;                      /* success, hits, caught-up */
  --warn: #d19f03;                      /* caution, wasted scans, mid lag */
  --bad: #ff455d;                       /* errors, stale reads, saturation */
  --info: #1e9de7;                      /* network, secondary series */
}
```

Usage rules for this system:

- Dark canvas only for gallery demos; do not invent new grays per artifact.
- `--accent` appears sparingly: one dominant accent per focal area, never as
  decoration or as a series color.
- Map each series/state color to one stable meaning and repeat the same
  mapping across nodes, edges, badges, and counters.
- Monospace is the default face: `font: 13px/1.5 ui-monospace,
  SFMono-Regular, Menlo, monospace`, with `font-variant-numeric:
  tabular-nums` on all counters, offsets, and axes.
- Demos never scroll: `body { overflow: hidden }`, natural-height content,
  max reading width `860px`, stage canvases with fixed pixel dimensions.
  The gallery header in `references/gallery/GALLERY.html` is authoritative
  if this block and it ever disagree.

## Set the typography

Use a clear sans serif for prose. Use a monospace face for code, labels,
measurements, controls, and diagram nodes.

Prefer Inter and Roboto Mono when they are available. Provide system fallbacks
for offline and portable artifacts.

Use regular, medium, and semibold weights. Create hierarchy with size, spacing,
and color before heavier weight.

Use tabular numbers for metrics, timelines, axes, and changing values.

Use a mono-forward treatment for editorial explainers. Keep long prose readable
with a comfortable measure and line height.

## Build the visual language

- Use flat surfaces, thin dividers, and one-pixel borders.
- Use small radii or square corners for technical structures.
- Reserve shadows for real layer separation.
- Keep the grid visible through alignment, spacing, and repeated dimensions.
- Use generous empty space around the main explanation.
- Keep dense controls compact and clearly grouped.
- Use one dominant accent per focal area.
- Match highlighted prose with the related visual element.
- Prefer direct labels over distant legends.
- Keep labels outside crowded marks and connection paths.

Each decorative element must support grouping, hierarchy, state, or reading
order.

## Style diagrams and charts

Map each color to one stable meaning within the artifact. Keep that mapping
consistent across text, nodes, edges, controls, and legends.

Show important meaning with two signals. Combine color with text, shape,
pattern, position, or line style.

Use neutral structure for the baseline. Apply stronger color to the current
path, changed state, selected series, or teaching focus.

Place controls next to the visual state they change. Show their effect without
requiring the reader to search elsewhere.

Use motion only when it explains sequence, transition, or causality. Provide a
reduced-motion state that preserves the explanation.

### Precise alignment and animation mechanics

- **Align wire endpoints to box geometric centers**: Calculate connection points at the exact center lines of card faces (e.g. `x = left + width / 2` for top/bottom connections, `y = top + height / 2` for left/right connections). Explicitly fix element heights and widths so layout changes cannot shift coordinates.
- **Animate traffic orbs inside native SVG space**: Avoid animating HTML `<div>` elements with CSS `offset-path` along SVG wires. HTML layout boxes introduce subpixel rounding, border-box offsets, and coordinate drift that cause orbs to ride off-center. Instead, animate native SVG `<circle>` elements with `<animateMotion>` or GSAP inside the same `<svg>` element as the wire paths. Native SVG elements share the vector coordinate system, keeping the center of the orb locked onto the path stroke.
- **Size badge containers for formatted text**: In SVG diagrams and tables, compute container rect widths generously from the longest text label plus horizontal padding. Avoid tight bounding boxes that clip or overflow compound labels (such as `in-tx • lock`).

Design light and dark themes as related systems. Preserve semantic roles,
hierarchy, and emphasis across both themes.

Avoid mechanical color inversion. Adjust surface separation, muted text, line
strength, and data colors for each canvas.

Keep the accent recognizable in both themes. Verify every foreground against
the surface where it appears.

## Design pattern references

Detailed mechanics, layout techniques, and implementation patterns extracted
from `references/gallery/GALLERY.html` live in `references/design-patterns/`:

- [`layout-and-framing.md`](references/design-patterns/layout-and-framing.md): Zero-scroll embedding, auto-fit message reporting, canvas boxes, and dual DOM+SVG layers.
- [`topology-diagrams.md`](references/design-patterns/topology-diagrams.md): Multi-tier architecture (apps, proxies, shards), rectilinear center-line wires, and trunk-rail routing.
- [`traffic-animation.md`](references/design-patterns/traffic-animation.md): Native SVG traffic orbs (`<circle>` + `<animateMotion>`), arrival pulse states, and latency simulation.
- [`tables-and-matrices.md`](references/design-patterns/tables-and-matrices.md): Relational table samplers, row lock overlays, dual index comparison boards, and canvas matrices.
- [`progress-and-queues.md`](references/design-patterns/progress-and-queues.md): SVG clip-path sliding progress reveal, stage state transitions, and connection pool exhaustion.
- [`interactive-controls.md`](references/design-patterns/interactive-controls.md): Adjacent direct-manipulation controls, chip toggles, continuous math sliders (USL), and verdict callouts.
- [`typography-and-badges.md`](references/design-patterns/typography-and-badges.md): Monospace type hierarchies, tabular numbers (`tabular-nums`), large metric readouts, and badge container padding.

## Respect ownership

- Use `show-me` to select the smallest useful visual format.
- Use `eli5` to structure a picture-first teaching story.
- Use `better-colors` for color conversion and palette calculations.
- Use `better-ui` for application interaction and interface polish.

This skill owns presentation rules. The source skill owns facts, structure,
interaction behavior, and output requirements.

## Verify the result

Inspect every supported theme and viewport. Verify all of these conditions:

- The reading order is clear without interaction.
- Text and essential marks meet the target contrast standard.
- Important meaning remains clear without color.
- Labels remain legible and avoid collisions.
- Repeated meanings use the same token.
- The accent identifies the intended focus.
- Controls expose their current state.
- Reduced motion preserves sequence and causality.
- Existing product tokens remain intact unless the user requested replacement.

Deliver the styled artifact. Summarize the token roles and any intentional
exceptions in a compact table.
