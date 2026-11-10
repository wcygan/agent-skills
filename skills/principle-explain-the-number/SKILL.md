---
name: principle-explain-the-number
description: "Apply before you trust, report, or act on a number you measured: a speedup, a regression, a throughput, a latency, or an eval result. Find what limits it, and rule out that it measured something other than the work you think."
license: MIT
metadata:
  kind: principle
  upstream-repository: https://github.com/cursor/plugins
  upstream-revision: afd51cf66a3100a95f878d6c4b93a01f6508e3b0
  upstream-path: pstack/skills/principle-explain-the-number
  upstream-author: Lauren Tan
  maintenance: local
---

# Explain the Number

**Trigger:** you are about to trust, report, or act on a number you measured: a speedup, a regression, a throughput, a latency, or an eval result.

**Rule:** before you use the number, name what limits it and rule out that it measured something other than the work you think it measured.

**Why:** a number without a limiter or a ruled-out alternative is a number you cannot defend. Acting on it means optimizing or shipping against a measurement that may describe noise, caching, or a different code path entirely.

**Pattern:**
- **Ask "why not double?"** Name the resource or code path that bounds the result: a core, a lock, the disk, the network, or the measurement harness itself (the client that issues the requests can be the bottleneck). Get it from a profile or from system counters taken during a run, then map it to source. A guess from reading the code is not a limiter. If you cannot say why the number is not twice as good, you do not know what you measured.
- **List what else the number could be measuring, and rule out each one with evidence.** The usual suspects: errors counted as successes, skipped or cached work, code that never ran, one configuration left on defaults while the other was tuned, noise, and a piece too small to matter end to end. For an eval result, add: the judge or grader is wrong (it scores a wrong answer as right, or scores format instead of substance), and the prompt or fixture leaks the answer.
- **Keep the evidence with the number.** Put the run count, the spread, and the limiter in the notes or a linked artifact, so the next reader does not have to re-measure to believe it.

For a performance number, compare repeated runs under matched workloads and environments, retain raw results, and check that the measured work actually occurred. For an eval result, ask the same of the trials: did every run do the task, does the gap hold across trials and models, does the grader agree with a human on a sample, and does the scenario matter.

**You skipped this when** the evidence behind a number has no run count, no spread, or no named limiter, or when the claimed time saved is larger than the time the changed piece took in total.

**Scope:** a number used only to decide what to look at next needs none of this; a number that will be reported, compared, or acted on needs all of it.

Distinct from prove-it-works, which checks that an output is real; this principle checks that a measurement means what you say it means.

Adapted from pstack; [license and attribution](references/LICENSE.txt).
