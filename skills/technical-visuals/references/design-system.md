# Technical visual design system

## Purpose and reading order

Give the reader a correct high-level model before exposing implementation detail.
Each visual answers one question. Name that question in the title or caption;
show the main relationship first, then the exception or changed behavior.

Use 2D unless the user explicitly asks for 3D, isometric, or spatial rendering.
Do not infer a 3D request from words such as architecture, layers, or topology.
A request for 3D still needs a readable initial view and a useful static export.

The priority is meaning → hierarchy → geometry → style → interaction. If a
visual needs a paragraph explaining its arrows, repair the visual before adding
more decoration. Simplification may omit irrelevant parts, but must not invent
causality, ordering, guarantees, measured values, or evidence.

## Tokens and themes

Use existing product tokens for product screenshots or in-product visuals. For
standalone technical explanations, use the paired theme below. The canonical
machine-readable values live in [tokens.js](../examples/tokens.js); the
example renderer and exporter consume them. Copy only the required tokens when
adapting an example; do not introduce a runtime dependency on the skill folder.

| Role | Light | Dark | Meaning |
| --- | --- | --- | --- |
| Canvas | `#f7f7f5` | `#252b35` | Quiet surrounding space |
| Surface | `#ffffff` | `#2d3541` | Nodes and local groups |
| Raised surface | `#ecece8` | `#374151` | Secondary planes, slots |
| Text | `#202020` | `#f3f5f7` | Main labels |
| Muted text | `#595954` | `#c0c8d3` | Captions and metadata |
| Border | `#777770` | `#a3afbf` | Meaningful outlines and neutral routes |
| Subtle border | `#d6d6ce` | `#64748b` | Decorative separators only |
| Focus | `#b43d08` | `#ffae80` | The teaching point or selected route |
| Success | `#187636` | `#85e0a3` | Accepted or completed |
| Warning | `#866100` | `#f5d478` | Waiting, pressure, caution |
| Failure | `#c12e46` | `#ffa1b1` | Failed or rejected |
| Information | `#076fa8` | `#8ad4ff` | Context or informational state |

Orange remains the signature emphasis; its value changes by theme for contrast.
Do not use it as a generic fill on every node. These colors are semantic roles,
not six series colors: use labels, line patterns, and position for unrelated
series. Test text against its actual background. Target 4.5:1 for ordinary text
and 3:1 for meaningful graphical boundaries; subtle separators carry no meaning.
Avoid placing white text on an accent fill without checking that pair separately.

Both themes retain identical geometry, labels, and state. A theme switch must not
reset the scene. Export with an explicit opaque background so the artifact keeps
its intended contrast when embedded elsewhere. Support the system theme initially
and an explicit override in interactive artifacts where both themes are in scope.

## Typography, spacing, and shapes

Use system sans-serif for headings and explanatory text; system monospace for
node labels, identifiers, values, and compact controls. Avoid loading external
fonts for a portable artifact. Keep text horizontal in both 2D and 3D.

Start with an 8-unit spacing rhythm, 16–24 units of interior padding, 40–64 units
between connected nodes, a 6-unit radius, and 1.5–2-unit strokes. These are starting
points, not rigid requirements. At the intended embedded width, keep labels readable
without zoom. Reflow dense scenes rather than shrinking them until text disappears.

| Shape | Default meaning | Avoid |
| --- | --- | --- |
| Rounded rectangle | Service, process, owner | Different silhouettes for equivalent services |
| Cylinder | Persistent store | Using it for every technology |
| Outlined tray with slots | Bounded queue or buffer | Implying unbounded capacity |
| Small repeated rectangles | Records or units of work | Unlabeled decorative particles |
| Light enclosure with title | Boundary, region, ownership | Ambiguous overlapping groups |
| Arrow with verb label | Directed relationship | An arrow whose direction or semantics are unclear |
| Numbered steps / timeline | Order or progression | Using spatial position alone to assert time |

A dashed arrow may mean optional, failed, or asynchronous, but choose one meaning
per scene and label it. Do not assign all three meanings to the same style.
Show state with words or symbols as well as color. Distinguish selected, waiting,
successful, and failed; selected is not automatically successful.

The [2D shape library](shapes.md) defines infrastructure, data, decision, and
ownership symbols. Browse their rendered forms in the studio. Use a sun/moon button
for a binary theme switch. Keep dropdown chevrons inset from the border with a
reserved text gutter. Center node label groups geometrically on both axes, including
multi-line title/subtitle groups; do not position them with ad hoc baseline offsets.

## Geometry and density

Keep nodes and routes in one coordinate model. Derive ports from actual shape
bounds; share route points between strokes, arrowheads, and moving markers.
Route around unrelated labels and nodes. Use directional fanout only where the
relationship is genuinely shared. Put labels beside the route segment they name.

Use a dominant reading direction, usually left to right; sequences may use top
to bottom. Show a small coherent subgraph, with a clearly labeled boundary when
omitting the rest. Highlight the changed path and mute unchanged context without
making it illegible. Never hide a material exception just to reduce density.

## Interaction and motion

Default to a static explanation. Add a control only when it changes a meaningful
question: hit/miss, before/after, step, filter, or selected record. Pointer hover
is supplemental; information must also be reachable by focus or selection.
Support keyboard and touch for essential actions, with visible focus and native
controls where possible. Do not hijack page scrolling for a diagram.

A discrete stepper is often clearer than autoplay. If motion is needed, provide
pause, step, and reset; respect reduced motion; suspend hidden work; keep a static
explanation available. Camera controls and simulation playback are independent.
Do not animate healthy traffic merely to make the page look alive.

## Design review

A good artifact lets a newcomer name the actors, the relationship, and the key
change after a quick look. A bad artifact makes them decode the style first.
Compare the same underlying facts in the good/bad examples; do not make the bad
version factually wrong merely to make the good version win.

Review the artifact at its actual presentation size, in both supported themes,
with long labels and representative states. Rendering checks and communication
judgment are separate: a screenshot can prove clipping is absent, not that a real
reader understood the explanation.

## Component families

Use the canonical category and Fill pairs in `examples/tokens.js`: purple
processing, blue storage and data structures, teal flow/streaming, rose control.
Use tinted interiors and contrasting outlines with neutral readable text.
The gallery labels each family; shapes and component names remain meaningful
in monochrome. Orange remains selected focus. Success, warning, and failure
need explicit status labels and must not be inferred from a category hue.
Verify text at 4.5:1 and meaningful outlines at 3:1 against each actual surface,
including tinted interiors. The example check covers both themes and all pairs.
