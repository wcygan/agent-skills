---
name: wcygan-investigate
description: "Understand current behavior and historical constraints. Use for subsystem investigation or preparing evidence for a change."
license: MIT
metadata:
  kind: procedure
  upstream-repository: https://github.com/cursor/plugins
  upstream-revision: 1e5c90a4b6f249917bd21fe361b3a2a7deb741b8
  upstream-path: pstack/skills/how; pstack/skills/why; pstack/skills/recall
  upstream-author: Lauren Tan
  maintenance: local
---

# Investigate

Read linked components only when their stated condition applies. Use available
tools and preserve the task's scope, prior authorization, and explicit checkpoints.


1. Bound the question and scope; use [clarify-task](../clarify-task/SKILL.md) when
   the requested outcome is ambiguous.
2. For resumed work, use [recover-context](../recover-context/SKILL.md) to establish
   current state before repeating prior investigation.
3. Use [explain-code](../explain-code/SKILL.md) for behavior and ownership. When
   rationale, regressions, or prior attempts matter, also use
   [explain-history](../explain-history/SKILL.md).
4. Combine the evidence into current behavior, constraints, uncertainties, and the
   next useful action. Use [assess-impact](../assess-impact/SKILL.md) when evaluating
   a proposed change's downstream consequences.

Done when the question has a supported answer or explicit evidence gaps. Continue
already-authorized work from those findings; investigation alone does not authorize edits.

Adapted from pstack; [license and attribution](references/LICENSE.txt).
