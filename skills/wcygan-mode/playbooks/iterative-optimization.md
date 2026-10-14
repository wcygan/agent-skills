# Iterative optimization

Improve a metric through bounded, repeatable experiments.

1. Define the metric, representative workload, correctness constraints, target,
   and iteration or time budget. Freeze a valid baseline and measurement method.
2. Follow [experiment](../../wcygan-experiment/SKILL.md). For each iteration, state
   a hypothesis, make one interpretable change, and measure all relevant outcomes.
3. Keep demonstrated improvements; revert only the experiment's unsuccessful changes.
   Log each decision through [decision-log](../../decision-log/SKILL.md).
4. If the method changes, remeasure the baseline and current candidate. Stop at the
   target, budget, explicit pause, or an unresolved prerequisite.

Complete with accepted changes, rejected hypotheses, final measurements, and the
next uncertainty. A plateau is evidence to reconsider the hypothesis, not to invent a win.
