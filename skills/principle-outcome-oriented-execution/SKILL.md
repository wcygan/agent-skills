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

In a planned rewrite or migration with explicit phase boundaries, optimize for the intended, verifiable end state instead of keeping every intermediate state smooth. Compatibility code written to keep intermediate steps stable becomes long-lived debt.

- Intermediate breakage is acceptable when it is planned, scoped, and reversible. State where it is acceptable in the plan and at each phase boundary, so the user can object before the break lands.
- Keep high-signal checks on the areas being touched while migrating.
- Require full static and runtime verification at plan completion.

Adapted from pstack; [license and attribution](references/LICENSE.txt).
