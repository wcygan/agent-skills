---
name: implement-change
description: "Implement a bounded feature, fix, or refactor in small verifiable steps: contract, baseline, change, callers, verification, diff inspection. Use when the intended behavior and scope are already established."
license: MIT
metadata:
  kind: component
  upstream-repository: https://github.com/cursor/plugins
  upstream-revision: 1e5c90a4b6f249917bd21fe361b3a2a7deb741b8
  upstream-path: pstack/skills/poteto-mode/playbooks/feature.md; pstack/skills/poteto-mode/playbooks/refactoring.md
  upstream-author: Lauren Tan
  maintenance: local
---

# Implement a change

1. Establish the behavior contract, affected callers, and state ownership before
   editing. Resolve consequential design uncertainty before committing to a shape.
2. Capture the relevant baseline. For refactoring, pin existing behavior with an
   executable characterization or equivalence check before moving structure, so
   a behavior change shows up as a failure.
3. Make the smallest coherent unit of change. Keep one owner for mutable state;
   isolate independent writers and serialize edits that share a target.
4. Update callers with changed interfaces. Remove obsolete internal paths when
   migration is complete; keep a compatibility path only for a concrete consumer
   that still needs it.
5. Verify each meaningful unit against its contract, then check the integrated
   result. Investigate repeated workarounds as a possible design error.
6. Inspect the final diff for unrelated edits, temporary scaffolding, and remaining
   obsolete paths. Explain any intentional behavior change separately from cleanup,
   and list every behavior change, including small ones, because a summary that
   names only the large changes hides the rest from the reviewer.

Inside the task's scope, treat the code as yours: merge duplication you touch,
fix the cause rather than adding beside it, and make the related fixes the change
needs. Outside that scope the code is the user's: report what you found, with
locations, and leave it unchanged so the user's other edits survive.

Done when the requested behavior works with evidence, existing contracts hold,
and remaining limitations are explicit. Tests, builds, and linters need no
go-ahead; committing and publishing each need an explicit one.

Adapted from pstack; [license and attribution](references/LICENSE.txt).
