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
3. Check each supported theme. Inspect the actual rendered output; source review alone
   cannot establish layout correctness. Color contrast checks do not establish readability
   by themselves. Use a text alternative/caption and accessible SVG title/description.
4. Exercise every essential control and named state. For motion, check pause/step/reset,
   reduced motion, and hidden-tab behavior. If there is no motion, do not invent that gate.
5. Export with an explicit theme, background, viewport, and selected state. Inspect the
   export separately; a browser screenshot does not prove SVG/PNG export works.
6. Report exact checks and gaps. Distinguish render inspection, automated assertions,
   domain validation, and actual reader feedback.

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
