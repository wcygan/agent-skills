---
name: measure-performance
description: "Measure a performance claim fairly and repeatably. Use for benchmarks, latency or throughput regressions, profiling, optimization, and comparing implementation costs."
license: MIT
metadata:
  kind: component
  upstream-repository: https://github.com/cursor/plugins
  upstream-revision: 1e5c90a4b6f249917bd21fe361b3a2a7deb741b8
  upstream-path: pstack/skills/benchmark-checklist; pstack/skills/poteto-mode/playbooks/hillclimb.md
  upstream-author: Lauren Tan
  maintenance: local
---

# Measure performance

1. State the claim, workload, metric, and selection rule before running. Identify
   the revisions, environment, and what one sample measures.
2. Inspect the measurement path. Prove the intended work occurs inside the timed
   region, outputs are correct, and errors, retries, and timeouts are counted.
3. Tune each side for realistic use with comparable data, build modes, and warmup.
   Identify the bottleneck (the resource that bounds throughput) using a separate
   profiling run. Check plausible resource limits and whether the load generator
   itself is the bottleneck.
4. Repeat each side at least five times, alternating order to reduce drift. Five
   is a floor rather than a target: run enough to see the run-to-run spread, and
   more when the spread is wide. Report median and range. A gap within run-to-run
   noise is no measurable difference. A requested rough estimate may use one run,
   clearly labeled; a single run cannot show the spread, so it cannot select a
   winner. Benchmarks are long, so post a short progress update after each side
   is measured.
5. Connect microbenchmarks to an end-to-end user cost. Keep the harness fixed while
   comparing candidates; if the method changes, remeasure all affected baselines
   because results from different harnesses are not comparable.

Done when the verdict is faster, slower, no measurable difference, or inconclusive,
with units, sample counts, variability, bottleneck, errors, and evidence. An
untuned side loses for reasons unrelated to the claim, so untuned comparisons or
unverified work cannot support a winner.

Adapted from pstack; [license and attribution](references/LICENSE.txt).
