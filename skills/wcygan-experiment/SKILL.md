---
name: wcygan-experiment
description: "Measure a performance claim or compare alternatives with a fair, repeatable experiment. Use for benchmarks, latency and throughput checks, profiling, optimization, stretch targets, or an uncertain engineering choice that evidence can settle."
license: MIT
metadata:
  kind: procedure
  upstream-repository: https://github.com/cursor/plugins
  upstream-revision: 1e5c90a4b6f249917bd21fe361b3a2a7deb741b8
  upstream-path: pstack/skills/benchmark-checklist; pstack/skills/arena; pstack/skills/figure-it-out; pstack/skills/poteto-mode/playbooks/hillclimb.md
  upstream-author: Lauren Tan
  maintenance: local
---

# Experiment

For a baseline, profile, or verdict on a performance claim, use
[performance measurement](references/measurement.md). A measurement-only request
ends with the result and its uncertainty.

For a design choice or optimization, set the hypothesis, baseline, decision
criteria, budget, and stopping condition. Use the same brief and judge for
competing implementations. For a performance comparison, apply the measurement
reference to the baseline and each candidate. Change one variable where possible
and remeasure affected results if the method changes.

Record each hypothesis, result, and decision in a multi-iteration experiment.
Revert only the experiment's unsuccessful changes. For an aggressive target or
plateau, use [stretch targets](references/stretch-targets.md) to explore a
different mechanism. Track required and stretch targets separately.

Verify the selected result on the real user path, including correctness. When
the agreed condition or budget is reached, report the verified improvement,
comparison verdict, or reason the evidence is inconclusive. Include the method
and limits needed to reproduce the result.

Adapted from Pstack. [License and attribution](references/LICENSE.txt)
