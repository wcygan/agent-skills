# Technical visual design system

## Purpose and reading order

Give the reader a correct high-level model before exposing implementation detail.
Each visual answers one question. Name that question in the title or caption;
show the main relationship first, then the exception or changed behavior.

For a high-level explanation, use one short label per actor and let geometry,
record chips, queues, and state symbols carry the relationship. Leave space between
actors and routes. Avoid repeating the same state in a node, a table, a legend,
and a caption. Put exact offsets, transaction IDs, row values, and per-request
timers in optional details when the reader does not need them for the main lesson.
Review the first view with details collapsed; a correct model can still be too dense.
For an index or gallery card, use a short title, one-sentence description, and an
abstract diagram of the post's central relationship. Keep it readable as a thumbnail;
reserve protocol controls and detailed metadata for the destination.

Merge related explanations when one scene can show their combined insight. For
example, index depth and recent-read locality belong in one lookup animation.
Retain distinct lessons when combining them would crowd the canvas or obscure
meaning. Source coverage counts source concepts, not the number of separate demos.

Preserve essential topology and causal state while removing words. A replica,
an arriving vote, or a held lock may be the explanation itself; use a compact
shape, pip, or icon rather than hiding it with optional metadata.

Use 2D unless the user explicitly asks for 3D, isometric, or spatial rendering.
Do not infer a 3D request from words such as architecture, layers, or topology.
A request for 3D still needs a readable initial view and a useful static export.

The priority is meaning → hierarchy → geometry → style → interaction. If a
visual needs a paragraph explaining its arrows, repair the visual before adding
more decoration. Simplification may omit irrelevant parts, but must not invent
causality, ordering, guarantees, measured values, or evidence.

## Phone layouts

Design interactive explanations to read comfortably on a phone as well as a desktop.
Prefer stacked groups, portrait routes, and compact charts to sideways panning.
Use the same facts and state in each layout; rearrange actors rather than hiding
essential replicas, votes, locks, or outcomes. Do not squeeze a wide desktop SVG
into the screen until its labels become tiny. Leave breathing room around routes,
labels, and controls in the compact layout too.

For the bundled gallery, check 360, 390, and 430 CSS-pixel viewports. Aim for main
diagram labels at least 12 CSS pixels after SVG scaling, 44-pixel touch targets,
and 16-pixel native input text. Wrap controls without clipping their labels; keep
pause and step easy to reach. Dense optional detail can scroll independently when
its structure requires it, but the primary explanation should fit the viewport.

Derive connectors and payload positions from the same responsive geometry.
Orientation changes must preserve the model, in-flight progress, theme, and the
reader's pause intent. Do not restart an election or transaction merely to relayout.

## Tokens and themes

Use existing product tokens for product screenshots or in-product visuals. For
standalone technical explanations, use the paired theme below. The canonical
machine-readable values live in [tokens.js](../examples/tokens.js); the
example renderer and exporter consume them. Copy only the required tokens when
adapting an example; do not introduce a runtime dependency on the skill folder.

| Role | Light | Dark | Meaning |
| --- | --- | --- | --- |
| Canvas | `#f7f7f5` | `#1c1e22` | Quiet surrounding space |
| Surface | `#ffffff` | `#24262a` | Nodes and local groups |
| Raised surface | `#ecece8` | `#303236` | Secondary planes, slots |
| Text | `#202020` | `#f4f4f5` | Main labels |
| Muted text | `#595954` | `#c4c6ca` | Captions and metadata |
| Border | `#777770` | `#a5a9b0` | Meaningful outlines and neutral routes |
| Subtle border | `#d6d6ce` | `#60646c` | Decorative separators only |
| Focus | `#b43d08` | `#ffb27c` | The teaching point or selected route |
| Success | `#187636` | `#7bd99a` | Accepted or completed |
| Warning | `#866100` | `#e8cd83` | Waiting, pressure, caution |
| Failure | `#c12e46` | `#ff9aa6` | Failed or rejected |
| Information | `#076fa8` | `#8ac8f2` | Context or informational state |

Dark mode uses a low-chroma charcoal foundation, inspired by PlanetScale's
engineering explainers. Surface elevation supplies structure; color supplies
identity and state. Keep large node bodies gently tinted and lighter than the
stage. Reserve stronger color for outlines, payloads, progress, and state icons.
Use neutral text for ordinary labels and colored text for identity or state.
Do not increase every fill's saturation to make the diagram more colorful.

| Family | Dark outline / identity | Dark interior |
| --- | --- | --- |
| Processing | `#c4b5fd` | `#44414e` |
| Storage | `#8ac8f2` | `#394650` |
| Flow | `#7dd3ba` | `#394a45` |
| Control | `#f0a9ca` | `#4c4048` |
| Waiting | `#e8cd83` | `#4b4638` |

These are adaptations of PlanetScale's color hierarchy, not an exact brand palette.
Keep neutral surfaces nearly achromatic, with a slight cool bias. All node families
use comparable interior lightness so no family dominates merely through area.
Keep solid record fills paired with dark ink, as in Kafka, rather than white text.
Colored interiors must be lighter than the stage; the 1.3:1 fill/stage budget is
an internal hierarchy check, not a WCAG threshold. Meaningful boundaries need
3:1 and ordinary text 4.5:1. Inspect adjacent nodes, moving records, and buffered
versus applied entries at phone size. Do not enforce minimum fill saturation or
RGB distance: those checks encouraged competing colored surfaces in earlier passes.
Retain IDs, symbols, and borders so color is never the only encoding.
Light mode remains its own palette.

Measured sources and the adaptation rationale are recorded in
[dark palette precedent](dark-palette.md).

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
Give nodes stable, distinct identity colors within a scene. Carry each node's color
into its timer, connecting routes, and any popup that identifies it. In a popup,
pair the node ID with a matching colored badge so the reader can connect the event
to the node without rereading the diagram. Keep the same identity across resets,
layout changes, and role changes; use corresponding theme colors in light and dark
mode. Keep IDs visible so color is never the only identifier.

Keep identity separate from state: name the current role and show waiting,
committed, failed, or completed with text and symbols. A timeout must not recolor
all nodes as failures and erase their identities. Payloads with an established
semantic color retain it: heartbeat hearts stay red even on differently colored
node connections. Use the node identity for messages and records when they do not
have a conflicting semantic encoding.
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
Sample each moving payload's center from the connector's actual path; do not tune
separate coordinates by eye. For comparable deliveries, use distance-based travel
time so a longer route takes longer at the same speed. At bends, interpolate by
cumulative path length. While a payload is inside a node, show node activity instead
of drawing it over the label. Keep attached highlights on the shape boundary.
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

For an animated reading demo, autoplay while visible with Pause, Step, and Replay
available immediately. Replay restores the initial model and resumes, including
after a manual pause; reduced-motion preferences start and remain paused. Suspend
offscreen or hidden work without catching up missed wall time. Theme and layout
changes retain simulation state and the reader's pause intent. Keep static figures
static when motion adds no explanation. Camera and simulation controls are independent.

Keep routes visible between messages and update recipient state only on arrival.
Give payloads enough travel time to follow; separate display refresh rate from
simulation speed and the interval between messages. Use elapsed-time browser motion
and stable SVG elements rather than rebuilding the scene every frame. Follow the
display refresh rate; a 120 Hz target is not a measured result without paint/display
evidence. Put optional scenario experiments in a disclosure. Reading demos do not
need download controls; provide exports only when the delivery calls for them.

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
