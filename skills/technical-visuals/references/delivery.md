# Deliver and verify a technical visual

## Match the destination

| Destination | Preferred artifact | Keep with it |
| --- | --- | --- |
| Simple Markdown or PR relationship | Mermaid block | Short caption and source facts |
| Precisely styled static explanation | SVG plus PNG fallback when needed | Editable SVG or generator |
| Interactive explanation | Portable HTML/SVG | Static preview and instructions for essential controls |
| UI regression evidence | Actual application screenshot | Route, state, viewport, and relevant revision |
| Measured chart | SVG/PNG/PDF from a plotting tool | Data or reproducible query and plotting source |

Respect the requested format. Native Mermaid rendering depends on the host; inspect
it at the destination when possible. For image delivery, verify that the target can
render the chosen format. A local filesystem path cannot serve as a remote PR asset.
Keep references repository-relative where supported, or use an authorized durable
asset destination. Check the final URL and reader access after publication.

Do not add generated media to a product bundle or commit screenshots merely because
they were created. Follow repository conventions and the requested artifact location.
Do not upload private data to an image or hosting service without task authorization.

## Render checks

1. Compare all depicted relationships or data against the named source revision.
2. Render at the actual embedded size, plus a compact viewport for responsive HTML.
   Check text, clipping, connectors, reading order, and visible state labels.
   For interactive HTML, inspect phone-sized screenshots in both themes. Measure
   overflow inside each primary stage, not only the document. Check actual label
   size after SVG scaling and touch targets; removing a min-width is not proof of
   readability. Exercise controls by touch, and resize during a paused/in-flight
   state to confirm geometry changes preserve model and playback state.
3. Check each supported theme. Inspect the actual rendered output; source review alone
   cannot establish layout correctness. Color contrast checks do not establish readability
   by themselves. Use a text alternative/caption and accessible SVG title/description.
   For node diagrams, verify that identities remain distinct and stable across
   reset, role changes, and responsive layouts. Match each timer, connection, and
   identifying popup badge to its node in both themes; keep semantic payload colors
   such as red heartbeat hearts intact.
4. Exercise every essential control and named state. For motion, check pause/step/reset,
   reduced motion, and hidden-tab behavior. If there is no motion, do not invent that gate.
5. When export is part of the deliverable, use an explicit theme, background,
   viewport, and selected state. Inspect the export separately; a browser screenshot
   does not prove SVG/PNG export works. Do not add export UI to reading demos merely
   to satisfy a verification step.
6. Report exact checks and gaps. Distinguish render inspection, automated assertions,
   domain validation, and actual reader feedback.

For animated paths, sample intermediate frames as well as endpoints: assert that
payload centers lie on connectors, recipients change on arrival, and completed
progress persists. Test the end of the exchange, including required acknowledgements.
For capacity bars, compare rendered proportions with source values. Keep communication
judgment separate: these assertions cannot detect an over-wordy or unhelpful model.
Use existing post-specific checks in [example review](examples.md) for these invariants;
extend the relevant check when repairing a repeated geometry or causality failure.

## Bundled examples

The examples need no build or network runtime. Open [index.html](../examples/index.html)
from a local file, or serve the examples directory on a loopback interface. Copy it to
an output/work directory before modifying an installed skill; installed assets remain
immutable. SVG/PNG export resolves theme tokens into the standalone image and exports
the current state. The source page includes explanations outside the figure; keep the
short exported caption with the image.

For repeatable browser checks, see [example review](examples.md). The reference check
script accepts an externally installed Playwright module and writes evidence outside
the skill tree; no package installation is required inside the catalog.
