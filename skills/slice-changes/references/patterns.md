# Slicing patterns and failure cases

## Feature with preparatory refactoring

Request: add cancellation to a worker whose dispatch logic is difficult to change.

Good, if the refactor is useful and behavior-preserving on its own:

| Slice | Question | Evidence |
| --- | --- | --- |
| Extract dispatch boundary | Does existing dispatch behave the same? | Existing behavior tests plus boundary coverage |
| Add cancellation | Does cancellation stop the intended work and preserve completed results? | Race, cancellation, and normal completion checks |

Bad: PR 1 adds cancellation code without tests; PR 2 adds tests; PR 3 repairs callers.
Every intermediate review lacks the evidence or integration needed to establish
correctness. Keep tests and callers with the behavior they support.

Do not invent a preparatory refactor for a small feature that fits the current
structure. One well-scoped PR is often the best slice plan.

## Data/schema migration

Good: expand compatibility → move readers/writers with rollback support → remove
old representation after evidence that no required consumers use it. Identify which
steps are code changes, deployments, backfills, and later cleanup. Merged code alone
does not establish a completed rollout. Retain compatibility tests at each boundary.

Bad: schema rename first, caller changes later, without compatibility. Splitting
lines into small diffs does not make broken intermediate deployments acceptable.
If the platform cannot support a compatible rollout, present the required atomic
change or coordinated downtime constraint instead of promising independent slices.

## Mixed cleanup and bug fix

Good: one bug fix with a failing-before/passing-after regression check; unrelated
renaming is separate only if requested. If a tiny rename is necessary to explain the
fix, it may stay in the same PR.

Bad: large formatting changes obscure the two changed conditions, or a cleanup PR
is created merely because the agent noticed adjacent imperfections.

## Already implemented changes

First map hunks to behaviors and dependencies. Preserve an exact recoverable copy
through the project's supported workflow before an authorized extraction. Verify
that the reconstructed integrated tree retains the intended changes. Do not use
file size or staged status as a proxy for ownership.

A plan may say “keep this together.” A narrow security fix, atomic interface change,
or generated update can exceed a preferred size while remaining one coherent review.
Explain the exception instead of splitting away the proof.
