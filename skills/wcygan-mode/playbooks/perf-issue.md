# Perf issue

Diagnose and improve one measured performance problem.

1. Establish the user-visible slowdown, representative workload, and baseline.
2. Follow [experiment](../../wcygan-experiment/SKILL.md) and
   [measure-performance](../../measure-performance/SKILL.md). Profile separately
   from reported measurements and identify the limiting resource.
3. Change the cause of the bottleneck in a bounded unit; compare under equivalent
   conditions, including errors and correctness.
4. Verify the end-to-end improvement and check for shifted costs or regressions.

Complete with the metric, repetitions, variability, limiter, and user impact.
A noisy or untuned comparison remains inconclusive.
