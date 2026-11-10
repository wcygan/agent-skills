---
name: wcygan-implement
description: "Carry an agreed change through small implementation steps with verification evidence at each one. Use for building a feature, fixing a bug, a refactor, or a migration once the intended behavior is known."
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

Read the shared [principle index](../wcygan-mode/references/principles.md) at entry and reconsider it as the work changes. Report each principle that changed a decision, with the specific choice it shaped.

Read linked components only when their stated condition applies, so the context
stays small. Keep the task's scope and any checkpoint the user set.

1. State the behavior contract and scope. Use `explain-code` where current
   behavior is uncertain and `design-options` where the structure remains unsettled.
2. For a bug, use `reproduce-bug` before changing the implementation, so the fix
   has a failing-before check. For a refactor, retain a baseline equivalence check.
3. When the work spans several reviewer questions, use `slice-changes` before
   implementation grows. Keep a single coherent change together when splitting
   would weaken its verification. Use `implement-change` for each coherent unit.
   When several owners are useful, use `coordinate-work` to establish boundaries
   and integration order.
4. Use `verify-behavior` on the integrated result. For demonstrated recurring
   errors, apply `prevent-recurrence` within the requested scope.
5. Post a short progress update at each step boundary and report the result,
   evidence, and gaps. Running tests, builds, and linters never needs a go-ahead;
   committing, pushing, opening or merging a pull request, and deploying each
   need an explicit one. Continue into those steps when the task includes them
   and the go-ahead was given; stop at a checkpoint the user set.

Done when requested behavior is implemented and verified, with incomplete outcomes
reported honestly rather than hidden behind successful builds.

Adapted from pstack; [license and attribution](references/LICENSE.txt).
