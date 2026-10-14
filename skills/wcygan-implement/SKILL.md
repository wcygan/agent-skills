---
name: wcygan-implement
description: "Carry an agreed change through small implementation steps and evidence. Use for features, fixes, refactors, or migrations."
license: MIT
metadata:
  kind: procedure
  upstream-repository: https://github.com/cursor/plugins
  upstream-revision: 1e5c90a4b6f249917bd21fe361b3a2a7deb741b8
  upstream-path: pstack/skills/poteto-mode/playbooks/feature.md; pstack/skills/poteto-mode/playbooks/refactoring.md; pstack/skills/tdd
  upstream-author: Lauren Tan
  maintenance: local
---

# Implement

Read linked components only when their stated condition applies. Use available
tools and preserve the task's scope, prior authorization, and explicit checkpoints.


1. State the behavior contract and scope. Use
   [explain-code](../explain-code/SKILL.md) where current behavior is uncertain and
   [design-options](../design-options/SKILL.md) where the structure remains unsettled.
2. For a bug, use [reproduce-bug](../reproduce-bug/SKILL.md) before changing the
   implementation. For a refactor, retain a baseline equivalence check.
3. Use [implement-change](../implement-change/SKILL.md) for each coherent unit.
   When several owners are useful, use [coordinate-work](../coordinate-work/SKILL.md)
   to establish boundaries and integration order.
4. Use [verify-behavior](../verify-behavior/SKILL.md) on the integrated result.
   For demonstrated recurring errors, apply
   [prevent-recurrence](../prevent-recurrence/SKILL.md) within the requested scope.
5. Report the result, evidence, and gaps. Proceed to publication only when it is
   part of the task; preserve requested checkpoints and already-granted authorization.

Done when requested behavior is implemented and verified, with incomplete outcomes
reported honestly rather than hidden behind successful builds.

Adapted from pstack; [license and attribution](references/LICENSE.txt).
