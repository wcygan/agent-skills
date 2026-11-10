---
name: wcygan-experiment
description: "Compare alternatives with a fair, repeatable experiment: hypothesis, baseline, one variable at a time, and measured results. Use for performance work, benchmarks, optimization, stretch targets, or an uncertain engineering choice that evidence can settle."
license: MIT
metadata:
  kind: procedure
  upstream-repository: https://github.com/cursor/plugins
  upstream-revision: 1e5c90a4b6f249917bd21fe361b3a2a7deb741b8
  upstream-path: pstack/skills/benchmark-checklist; pstack/skills/arena; pstack/skills/figure-it-out
  upstream-author: Lauren Tan
  maintenance: local
---

# Experiment

Read the shared [principle index](../wcygan-mode/references/principles.md) at entry and reconsider it as the work changes. Report each principle that changed a decision, with the specific choice it shaped.

Read linked components only when their stated condition applies, so the context
stays small. Keep the task's scope and any checkpoint the user set.

1. State the hypothesis, baseline, success criteria, resource budget, and stopping
   rule. Distinguish the required outcome from an exploration target, and establish
   whether to continue after the required outcome is met. For aggressive targets
   or a plateau, read [stretch targets](references/stretch-targets.md).
   Use `clarify-task` if the decision is underspecified.
2. For competing artifacts, use `compare-solutions`. For performance claims, use
   `measure-performance` as the measurement method for every candidate, including
   the baseline, so the numbers are comparable.
3. Change one relevant variable at a time where possible, so a result has one
   cause. Keep comparison conditions consistent; remeasure affected candidates
   when the method changes. When local tuning plateaus, test a different structure
   or eliminate unnecessary work instead of repeating small variations of a failed
   assumption.
4. Use `decision-log` for multiple iterations. Keep changes supported by evidence,
   preserve failed attempts in the record, and revert only the experiment's own
   unsuccessful changes, so the user's unrelated edits survive.
5. Verify the selected result against the actual user outcome. Continue until the
   agreed budget or completion condition; report inconclusive results without
   choosing a winner, since the evidence picks none. Report required-target and
   stretch-target attainment separately, preserving useful improvements even when
   the exploration target remains unmet.

Done when the evidence supports a decision or explains why none can be justified,
with the method and limitations available for reproduction.

Adapted from pstack; [license and attribution](references/LICENSE.txt).
