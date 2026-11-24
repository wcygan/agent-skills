# Perf issue

Diagnose and improve one measured performance problem.

1. Establish the user-visible slowdown, representative workload, and baseline.
2. Use `wcygan-experiment` for the baseline, comparable measurements, and
   stopping rule. Profile separately from reported measurements and identify
   the limiting resource.
   A baseline-only request ends with the measurements, workload, errors, sample
   count, spread, and rerun command.
3. For an improvement request, change the cause of the bottleneck in a bounded unit; compare under equivalent
   conditions, including errors and correctness.
4. Verify the end-to-end improvement and check for shifted costs or regressions.

Complete with the metric, repetitions, variability, limiter, and user impact.
A noisy or untuned comparison remains inconclusive.
