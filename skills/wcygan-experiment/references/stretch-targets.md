# Stretch-target experiments

Use an aggressive target to widen the search for effective mechanisms. Difficulty
is a reason to investigate assumptions; confidence is not measurement evidence.

1. Separate the baseline, required target, and stretch target. Preserve a target
   supplied by the user; label any agent-proposed target as a hypothesis. Agree on
   the stopping condition within existing authority: meeting the requirement may
   finish the task, or an authorized exploration may continue within its budget.
2. Pin correctness and representative conditions before optimizing. Specify the
   end-to-end measurement boundary, data sizes, hardware, concurrency, cache state,
   freshness, completeness, and resource/error limits. Use the same judge for all
   candidates and retain held-out cases where benchmark tuning could overfit.
3. Establish where the time or cost actually goes. Name the measured limiter and
   estimate what eliminating it could buy. Do not dismiss a goal based only on
   current architecture; distinguish physical or contractual limits from removable
   work and untested assumptions.
4. Explore structurally different hypotheses when incremental tuning cannot close
   the gap: remove work, move it out of the critical path when semantics permit,
   change representation, reduce coordination, batch, or precompute. Draw on
   relevant methods from other disciplines and name the actual instrument used.
   An expert persona alone supplies no evidence.
5. Run the smallest experiment that can distinguish the candidates. Validate outputs
   and collateral costs as well as the target metric. A faster response with stale,
   incomplete, or incorrect results does not meet an unchanged contract. Simulations
   and microbenchmarks guide exploration; confirm the real user path separately.
6. Preserve the best verified candidate and record failed hypotheses. If changing
   the judge is necessary, explain the defect, check the revised method independently
   where possible, and rerun baseline and candidates. Never lower the bar or hide
   failures merely to make the target achievable.
7. Finish at the authorized budget or stopping condition. Report baseline, final
   result, variability, both targets, tradeoffs, evidence, remaining limiter, and
   the cheapest next experiment. A missed stretch target can still yield a valuable
   verified improvement. Budget repeatability checks before the deadline; if timing
   evidence is insufficient when time expires, preserve the candidate but report
   attainment as inconclusive. Do not claim a fundamental limit from one failed approach.

Example: opening a project takes ten seconds, the requirement is two seconds, and
exploration aims for 200 milliseconds. If a candidate takes 1.4 seconds on the same
workload with correct results, report the requirement met and the stretch target
unmet. Continue only if the exploration budget and stopping rule allow it. A
200-millisecond cache-only result does not establish cold-start performance.
