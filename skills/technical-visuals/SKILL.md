---
name: technical-visuals
description: "Create technical diagrams, charts, and interactive explanations with a consistent light/dark visual system. Use for architecture, data flow, before/after visuals, PR figures, or explicitly requested 3D explainers; default to 2D."
license: MIT
metadata:
  author: William Cygan
  kind: component
  maintenance: local
---

# Technical visuals

Explain one technical relationship or change with a visual the intended reader
can interpret at its delivery size. Preserve the facts and the user's requested
format. Product UI design belongs to an available UI design skill; this skill
owns explanatory figures, not a redesign of the surrounding application.

1. Establish the reader's question, source of truth, delivery surface, and supported
   themes. Distinguish observed behavior, conceptual models, and illustrative data.
   Read [input contracts](references/inputs.md) for the supplied modality.
   When recreating a post or series, inventory every source figure and its
   meaningful states first. Map each to an output; do not silently substitute
   a selected lesson for requested full coverage. Merge overlapping lessons into one
   coherent demo when the same model can teach both; retain every source mapping.
2. Read the [design system](references/design-system.md). Read the [shape vocabulary](references/shapes.md) when selecting component symbols.
   Start with a high-level view: fewer words, generous spacing, short actor labels,
   and visual state. Move detailed metadata into captions or optional disclosures.
   Keep the actors, boundaries, and intermediate states needed to understand the
   relationship; simplification must not hide what makes the system work.
   Use the [iteration examples](references/examples.md#lessons-from-the-blog-iterations)
   for density, motion, state, and chart decisions learned from the visual lab.
   Make phone readability a design goal for interactive HTML: reflow diagrams and
   controls into compact layouts with little or no horizontal scrolling. Preserve
   readable labels and essential state instead of shrinking a desktop canvas.
   Use 2D by default.
   Use 3D only on an explicit request, including isometric or spatial rendering.
3. Select the smallest useful output: Mermaid for simple relationships; SVG for
   precise styled figures; HTML/SVG for meaningful interaction; a charting tool for
   measured data; a real application screenshot for evidence of UI behavior.
   Generated raster illustration may support a metaphor, but cannot establish
   topology, exact text, measured data, or proof of an application state.
4. Follow the [2D playbooks](references/2d.md), or the
   [3D playbooks](references/3d.md) only when requested. Read the closest
   [example and counterexample](references/examples.md); adapt its teaching
   structure rather than copying unrelated domain assumptions.
5. Apply [delivery and verification](references/delivery.md). Inspect the rendered
   result and actual controls, retain editable source, and deliver the requested
   artifact with a short caption and an accurate verification statement.

Keep essentials in the figure, supporting facts in the caption, and deeper detail
in a link. Use [write-clearly](../write-clearly/SKILL.md) when labels or prose need
editing. A useful static figure is a complete outcome; do not build an application
when a diagram answers the question.

The fresh examples preserve useful topics and visual preferences from the retired
catalog, not its implementation. See [precedent](references/precedent.md).
