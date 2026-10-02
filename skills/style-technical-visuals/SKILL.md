---
name: style-technical-visuals
description: "Build and style technical diagrams, charts, and interactive visualizations in 2D or 3D. Use when creating a technical visual or improving its color, typography, layout, connection geometry, motion, or camera interaction."
license: MIT
metadata:
  author: William Cygan
  inspiration-url: https://planetscale.com/blog
  version: "0.1.0"
---

# Style Technical Visuals

Route technical diagramming and visualization through the standalone examples.
They provide the current visual language and working implementation patterns.

## Select the dimension

Use the dimension the user requested. If the request leaves 2D versus 3D
unspecified, ask the user to choose before building; do this on every
unspecified request. Explain the tradeoff briefly: 2D favors direct reading,
while 3D offers spatial structure and camera exploration.

| Selected dimension | Load | Primary examples |
| --- | --- | --- |
| 2D diagrams, charts, or interactive explainers | [2D guide](references/2d.md) | `references/standalone/` |
| 3D, isometric, projected, or orbitable visuals | [3D guide](references/3d.md) | `references/standalone-3d/` |

Read the selected guide and the closest working example before implementation.
When both dimensions are requested, load both guides. Match examples by the
structure or interaction being taught, even when the topic differs.

Selection is complete when the dimension and starting example are identified.

## Establish the visual contract

Resolve the audience, delivery format, supported viewports, themes, and teaching
focus from the request and existing context. Preserve product tokens and brand
rules where present. Otherwise use the standalone examples' shared dark palette,
mono-forward typography, restrained surfaces, and semantic state colors.

Adapt example geometry and interactions to the requested meaning. The source
skill or project owns domain facts, system behavior, and output requirements;
this skill owns their presentation. Preserve source and license comments when
reusing technology marks or other attributed assets.

## Consult history conditionally

Read the [archive index](references/archive/README.md) only for an explicit
historical request, provenance questions, or a useful pattern absent from the
active examples. Then load only the relevant historical resource.

Archived galleries, article studies, and design patterns explain earlier work.
The active branch guides govern new artifacts. If borrowing an archived pattern,
adapt it to the standalone foundation and current acceptance criteria.

## Complete the visual

Follow the selected guide through implementation and verification. Deliver the
requested artifact once its supported views, controls, motion, and geometry
have been checked. Summarize the meaningful presentation choices and any
unverified behavior. Continue all other work authorized by the user's request.
