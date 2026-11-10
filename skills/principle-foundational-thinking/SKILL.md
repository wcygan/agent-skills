---
name: principle-foundational-thinking
description: "Apply before writing logic: choosing core types and data structures, sequencing scaffold-vs-feature work, asking what concurrent actors share. Get the data structures right so downstream code becomes obvious."
license: MIT
metadata:
  kind: principle
  upstream-repository: https://github.com/cursor/plugins
  upstream-revision: afd51cf66a3100a95f878d6c4b93a01f6508e3b0
  upstream-path: pstack/skills/principle-foundational-thinking
  upstream-author: Lauren Tan
  maintenance: local
---

# Foundational Thinking

**Trigger:** you are about to write logic: a new feature, a module, a phase of a larger plan.

**Rule:** decide the core types and the scaffold before the logic. Sequence work so that what every later step depends on exists first.

**Why:** logic written against the wrong data shape is rewritten when the shape changes; logic written against the right shape is mostly obvious. Scaffold that lands late (tests, CI, shared types) is paid for by every feature that shipped without it.

**The sequencing decision:**
1. **Subtract first.** Remove dead code, redundant validators, and stub references, so the foundation is laid on a simpler base. This is subtract-before-you-add.
2. **Types and data structures next.** Define the core types early, trace every access pattern, and choose structures that match the dominant paths. How to pick them is model-the-domain: a state machine, typed model, or lookup table instead of scattered conditionals.
3. **Scaffold next.** Ask "does every subsequent phase benefit from this existing?" If yes, build it before the first feature: CI, linting, test infrastructure, shared types. If only one phase benefits, it is a feature, not scaffold, and it waits its turn.
4. **Then logic,** in small units that each end in a verifiable state. How to cut and order those units is sequence-verifiable-units.

**Concurrency check, before step 2 is final:** for any state that more than one actor (process, worker, agent, request) might touch, ask "what happens if another actor modifies this concurrently?" If the answer is not "nothing," isolate it. The rule for that is separate-before-serializing-shared-state: eliminate the sharing first; serialize only when one shared writer is a real invariant.

**Test:** when the types and scaffold are in place, does the next feature read as mostly obvious code? If it still needs special-case coordination spread across callers, the foundation is not done.

**Scope:** this principle governs the *sequence* of work. Experience-first governs the *target*; foundations exist to serve it. For an existing codebase, the foundation is often already there: follow its types and scaffold rather than laying new ones beside them.

Adapted from pstack; [license and attribution](references/LICENSE.txt).
