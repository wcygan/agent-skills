# Explain the Number

Apply before you measure, and before you trust, report, or act on a number you measured: a speedup, a regression, a throughput, a latency, or an eval result. Find what limits it, and rule out that it measured something other than the work you think.

A number used only to decide what to look at next needs none of this. A number you will report, compare, or act on needs all of it.

- **Write the decision before you run.** Name the result that would change it, and the noise floor. Stop when the run-to-run spread is larger than the effect.
- **Ask "why not double?"** Name the resource or code path that bounds the result, from a profile or counters taken during a run. A guess from reading the code is not a limiter.
- **List what else the number could be measuring** (errors, skipped or cached work, code that never ran, an untuned side, noise, a piece too small to matter) and rule out each one with evidence.
- **Keep the run count, the spread, and the limiter with the number.**

For a performance number, compare repeat runs under the same workload and conditions, and confirm each run completed the work you meant to measure. For an eval result, ask whether every run did the task, whether the gap holds across trials and models, whether the grader agrees with a human on a sample, and whether the scenario matters.

Adapted from Lauren Tan's [Pstack principle](https://github.com/cursor/plugins/tree/afd51cf66a3100a95f878d6c4b93a01f6508e3b0/pstack/skills/principle-explain-the-number). [MIT license](../LICENSE.txt).
