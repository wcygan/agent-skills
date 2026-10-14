---
name: wcygan-design
description: "Compare structures and define interfaces for a requested design. Use when architecture or ownership needs deliberate exploration."
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

Read linked components only when their stated condition applies. Use available
tools and preserve the task's scope, prior authorization, and explicit checkpoints.
Read the shared [principle index](../wcygan-mode/references/principles.md)
and relevant leaves at entry; reconsider them as the work changes and report
each principle that changed a decision with the specific choice it shaped.


1. Establish behavior and integration constraints with
   [explain-code](../explain-code/SKILL.md); use
   [explain-history](../explain-history/SKILL.md) when changing established ownership.
   Reuse current evidence and skip irrelevant existing-system research for greenfield work.
2. Use [design-options](../design-options/SKILL.md) to derive caller sketches and
   structurally different alternatives. For separate candidate artifacts, use
   [compare-solutions](../compare-solutions/SKILL.md) as that comparison step; reuse
   its candidates rather than generating a second set.
3. For contested or consequential choices, use
   [review-changes](../review-changes/SKILL.md) to challenge the selected structure.
4. Use [technical-visuals](../technical-visuals/SKILL.md) when a diagram clarifies
   the chosen boundaries or behavior. Default to 2D; 3D requires an explicit request.
   Record the chosen interfaces, ownership, tradeoffs, and acceptance criteria.
   Honor an explicit design checkpoint; otherwise continue implementation when it
   was already requested.

Done when the design provides a coherent contract and explains the alternatives.
A design-only request ends with that contract.

Adapted from pstack; [license and attribution](references/LICENSE.txt).
