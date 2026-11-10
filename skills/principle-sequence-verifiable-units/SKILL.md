---
name: principle-sequence-verifiable-units
description: "Apply to multi-step work (sweeps, migrations, runs of similar edits) and to how you stack commits and PRs. Break work into small units that each end in a verifiable state, check each before the next, and order delivery so the sequence proves itself to a reviewer."
license: MIT
metadata:
  kind: principle
  upstream-repository: https://github.com/cursor/plugins
  upstream-revision: afd51cf66a3100a95f878d6c4b93a01f6508e3b0
  upstream-path: pstack/skills/principle-sequence-verifiable-units
  upstream-author: Lauren Tan
  maintenance: local
---

# Sequence work into verifiable units

Order work as a sequence of small units, each ending in a state you can check, and advance only once the current one is green, because building on a broken base buries the break under later work. The exception: a failure that predates the change or lies outside the unit is recorded (what failed, where, and the baseline evidence) and work continues. Only failures the unit itself introduced hold the sequence.

**Why:** A break caught at the unit that caused it is cheap to localize. A break caught after a batch is buried, and you have already built further on a broken base. Sequencing those same units into a delivery a reviewer can replay turns "trust me" into "watch it go red, then green."

**Execution.** In a sweep, migration, or any run of similar edits, verify each change before starting the next. Each unit is a before/after bracket: known-good state, one change, run the check, then proceed. Establish the actual starting revision and preserve unrelated work so every check measures against a known baseline. Rebase only when the user asks for it, because rewriting history others may hold is hard to undo. When a lever does the edits, the per-unit check is nearly free. Run it anyway.

**Delivery.** Stack commits and PRs in the order that proves the work. The canonical shape is the failing test first, then the fix on top. Other story orders are a subtraction before the reshape, a baseline capture before the treatment, the scaffold before the feature. Each commit lands on its own and the sequence reads as an argument.

For a long sweep, post a progress update at each phase boundary and end with a self-contained recap that leads with the outcome: units done, units that failed, and failures recorded as pre-existing.

The sequencing complement to the **prove-it-works** principle skill, which keeps each check real, and the **build-the-lever** principle skill, which makes the per-unit check cheap.

Adapted from pstack; [license and attribution](references/LICENSE.txt).
