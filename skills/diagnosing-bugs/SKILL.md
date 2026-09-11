---
name: diagnosing-bugs
description: "Debug a reproducible failure or performance regression with a focused feedback loop. Use when investigating broken behavior or implementing a bug fix."
license: MIT
metadata:
  maintenance: "local"
  upstream-repository: "https://github.com/mattpocock/skills.git"
  upstream-skill: "skills/engineering/diagnosing-bugs"
  upstream-revision: "84fdeffd12f2ee307994d1eb6feb48173b6e0502"
  upstream-license: "MIT"
---

# Diagnose with a useful feedback loop

Connect the reported symptom to an observable failure, test causal explanations, and repair it when requested. Read project context or ADRs when they explain the affected module or an important design constraint.

## Evidence and authority

A diagnosis-only request stays read-only apart from authorized, isolated diagnostic artifacts. A request to fix the bug authorizes the corresponding local repair and relevant checks. Follow the user's constraints on execution. Production instrumentation, real-traffic replay, shared-state changes, and unbounded stress require their own authority and operational bounds.

Redact credentials and sensitive records from commands, outputs, and captured artifacts. Keep secrets in environment variables. Quote only the signal-bearing portion of traces; missing evidence should remain visible.

## Establish and sharpen feedback

Choose a signal that catches the user's actual symptom, rather than a nearby error. Useful options include a failing test at the affected seam, an HTTP or CLI fixture, browser automation, a sanitized trace replay, a small isolated harness, bisection between known states, or differential comparison. Use a bounded property or stress loop only when it helps expose the failure. Read `scripts/hitl-loop.template.sh` when an essential manual action must be part of the reproducer.

Prefer the least expensive faithful reproduction. Record the command or procedure, starting conditions, exact failure signature, and captured result. For intermittent failures, record attempts and observed frequency; bound duration, concurrency, and cleanup rather than prescribing a fixed repetition count.

Reduce the reproduction while it still exercises the relevant path. Stop minimizing when further reduction would cost more than it helps diagnosis. Speed and determinism are useful, but a slow or probabilistic faithful reproducer is evidence too.

When reproduction is unavailable, continue safe source inspection and analysis of existing artifacts. Keep hypotheses distinct from established causes and explain what evidence would distinguish them. Ask only for an essential missing artifact, access, or decision; do not claim a verified fix without suitable evidence.

## Test explanations

Maintain plausible competing hypotheses when the cause is uncertain. Each should predict an observable difference. Share consequential findings as they emerge, then run discriminating checks within the requested scope.

Choose debugger inspection, targeted logs, or tracing according to the boundary that separates explanations. Change one causal variable at a time when comparing outcomes. Tag temporary instrumentation so it can be removed reliably. For performance regressions, use an appropriate timing harness, profiler, or query plan and compare equivalent conditions.

## Repair and completion

When repair is requested, fix the supported mechanism. Preserve a regression test when a meaningful seam can exercise the actual bug pattern. Test-first repair is useful for proving that the test catches the bug; use the `tdd` method when requested. If no faithful seam exists, report that gap instead of adding a shallow test that gives false confidence.

Check the repaired behavior against the original symptom and relevant regression risks. Reuse current results; repeat checks when later edits or failures invalidate them. Remove temporary instrumentation and account for diagnostic artifacts.

Report the cause or remaining hypotheses, change, reproduction and verification evidence, and any limits. Record architecture concerns as follow-up work unless their repair is already in scope. A diagnosis phase can flow directly into an authorized fix; committing or publishing is governed by the user's request.
