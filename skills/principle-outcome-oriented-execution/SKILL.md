---
name: principle-outcome-oriented-execution
description: "Apply during planned rewrites and migrations with explicit phase boundaries. Converge on the target architecture instead of preserving smooth intermediate states with throwaway compatibility code, because that code becomes long-lived debt."
license: MIT
metadata:
  kind: principle
  upstream-repository: https://github.com/cursor/plugins
  upstream-revision: afd51cf66a3100a95f878d6c4b93a01f6508e3b0
  upstream-path: pstack/skills/principle-outcome-oriented-execution
  upstream-author: Lauren Tan
  maintenance: local
---

# Outcome-Oriented Execution

Optimize for the intended, verifiable end state rather than preserving smooth intermediate states.

**Why:** Keeping every intermediate step fully stable often creates temporary compatibility code that becomes long-lived debt. Converge on the target architecture and prove correctness at explicit verification boundaries.

**Core rule:**
- Prioritize end-state integrity over transitional stability
- Intermediate breakage is acceptable when it is planned, scoped, and reversible

**Guardrails:**
- Use this for planned rewrites and migrations with explicit phase boundaries
- State where temporary breakage is acceptable in the plan, and repeat it in the progress update at each phase boundary, so the user can object before the break lands
- Keep high-signal checks for actively touched areas while migrating
- Require full static and runtime verification at plan completion

**How this fits with sequencing verifiable units:** the sequence-verifiable-units principle skill still applies. Per-unit checks run on every touched area at every step. The only thing allowed to break is a compatibility shim (throwaway code that keeps old callers working during the migration), because the shim is deleted at plan completion and its breakage is planned in advance.

For a multi-phase migration, post a progress update at each phase boundary and end with a self-contained recap that leads with the outcome: what converged, what is still broken by plan, and what verification ran.

Adapted from pstack; [license and attribution](references/LICENSE.txt).
