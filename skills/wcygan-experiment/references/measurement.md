# Performance measurement

Use this workflow to check a performance claim, establish a baseline, diagnose
a bottleneck, or measure candidates in an experiment.

## Set up the measurement

1. State the claim or question, workload, and metric before running.
   Record the revision, hardware, build mode, data size, concurrency, cache
   state, warmup, and what one sample measures.
2. Inspect the measurement path. Confirm that the intended work occurs inside
   the timed region, outputs are correct, and errors, retries, and timeouts are
   counted.
3. In a separate profiling run, identify the resource that bounds latency or
   throughput. Check plausible resource limits and whether the load generator
   limits the measured result. Connect microbenchmarks to an end-to-end user
   cost.

## Measure the current revision

Run the same workload under the same conditions on the current revision at
least five times. Repeat when the spread is wide. Report the median and range,
or label a single run as an estimate if the user requested a rough figure.
For a measurement-only request, finish with the measured baseline, profile,
or verdict against the stated target. If the evidence is inconclusive, say why.

## Compare candidates

1. Define the selection rule before running. Set each side up for realistic
   use with comparable data, build modes, and warmup. Use a single harness.
   If the method changes, remeasure every affected baseline and candidate.
2. Run at least five samples per side, alternating the order to reduce drift.
   Repeat beyond five when the spread is wide. Report the median and range
   for each side. In a long benchmark, post a short progress update after
   each side is measured.
3. Give the comparison verdict as faster, slower, no measurable difference,
   or inconclusive. Treat a gap within run-to-run noise as no measurable
   difference. A winner needs repeated evidence and each side must reflect
   realistic use and perform the intended work correctly.

Include units, sample counts, variability, the measured bottleneck, errors,
and evidence that allows a rerun.

Adapted from Lauren Tan's Pstack [benchmark-checklist](https://github.com/cursor/plugins/tree/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/skills/benchmark-checklist) and [hillclimb playbook](https://github.com/cursor/plugins/blob/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/skills/poteto-mode/playbooks/hillclimb.md). [MIT license](LICENSE.txt).
