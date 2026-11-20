---
name: wcygan-design
description: "Compare candidate structures and define interfaces, ownership, and acceptance criteria for a requested design. Use when architecture, module boundaries, data ownership, or an API contract needs deliberate exploration before implementation."
license: MIT
metadata:
  kind: procedure
  upstream-repository: https://github.com/cursor/plugins
  upstream-revision: 1e5c90a4b6f249917bd21fe361b3a2a7deb741b8
  upstream-path: pstack/skills/architect; pstack/skills/arena; pstack/skills/interrogate
  upstream-author: Lauren Tan
  maintenance: local
---

# Design

Read the [principle index](../wcygan-mode/references/principles.md) first. Load a
component named below only when its condition applies.

1. Establish behavior and integration constraints with `explain-code`; use
   `explain-history` when changing established ownership. Reuse current evidence
   and skip existing-system research for greenfield work, where there is no
   system to study.
2. Use `design-options` to derive caller sketches and structurally different
   alternatives. For separate candidate artifacts, use `compare-solutions` as that
   comparison step; reuse its candidates rather than generating a second set.
3. For contested or consequential choices, use `review-changes` to challenge the
   selected structure.
4. Use `technical-visuals` when a diagram clarifies the chosen boundaries or
   behavior. Default to 2D; use 3D only when requested, since it costs more to
   build and read. Record the chosen interfaces, ownership, tradeoffs, and
   acceptance criteria. Continue into implementation when it was already
   requested; stop at an explicit design checkpoint the user set.

Done when the design provides a coherent contract and explains the alternatives.
A design-only request ends with that contract.

Adapted from pstack; [license and attribution](references/LICENSE.txt).
