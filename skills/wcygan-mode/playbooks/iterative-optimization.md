# Iterative optimization

Improve a metric through bounded, repeatable experiments.

1. Define the metric, representative workload, and correctness constraints.
2. Use `wcygan-experiment` for the baseline, targets, budget, stopping rule,
   and comparable measurements. Make one interpretable change per iteration.
3. Keep the experiments and dispositions in a [decision-log](../references/methods/decision-log.md) so a later run can
   resume without repeating rejected hypotheses.

Complete with accepted changes, rejected hypotheses, final measurements, and the
next uncertainty. A plateau is evidence to reconsider the hypothesis, not to invent a win.
