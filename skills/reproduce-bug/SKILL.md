---
name: reproduce-bug
description: Turn an intermittent or poorly understood symptom into the smallest reliable, bounded reproduction with an explicit failure signature, controlled variables, captured evidence, and a regression oracle. Use when a bug is flaky, environment-dependent, timing-sensitive, data-dependent, difficult to trigger, or reported only through logs, screenshots, traces, or incidents; distinguish reproduction from diagnosis, test competing hypotheses, control time, randomness, concurrency, state, resources, and external dependencies, and automate a deterministic reproducer when implementation is requested.
license: MIT
metadata:
  author: William Cygan
  version: "0.1.0"
---

# Reproduce a Bug

Turn a symptom into a bounded scenario that fails for the same reason,
reliably enough to support diagnosis and regression prevention.

## Preserve the authority boundary

Treat requests to investigate, isolate, or reproduce as read-only on tracked
files unless the user asks for a harness, regression test, or other
implementation. Normal local diagnostics may create ignored build, test, log,
or temporary artifacts when safe. Inspect repository instructions and dirty
state first, and preserve unrelated work.

Do not generate production traffic, replay real messages, mutate shared data,
disable safeguards, install dependencies, or collect sensitive records merely
to trigger a symptom. Prefer isolated local state, synthetic or redacted
fixtures, existing test environments, and read-only evidence. Define side
effects, bounds, stop conditions, and cleanup before any experiment that can
affect external or persistent state.

## Define the failure signature

Translate the report into an observable contract:

- **Operation:** action, request, event, job, build, or workflow that should
  succeed.
- **Preconditions:** required state, input class, environment, and timing.
- **Failure signature:** exact output, exception, status, state transition,
  invariant violation, visual result, timeout, or resource symptom.
- **Exclusions:** similar symptoms that would not count as this bug.
- **Observation point:** where and how the signature is measured.
- **Frequency:** observed attempts, successes, failures, and confidence in the
  estimate.
- **Known boundary:** last known good and first known bad revision,
  configuration, data shape, or environment when available.

Use the narrowest signature that identifies the behavior without depending on
incidental log wording, timestamps, random identifiers, or unrelated output.
If the symptom is ambiguous, preserve separate candidate signatures rather
than quietly selecting one.

## Preserve original evidence

Capture available evidence before changing the scenario:

- report and exact user-visible behavior;
- relevant inputs in safely redacted form;
- command, environment, revision, configuration, and dependency versions;
- logs, traces, screenshots, state snapshots, or crash artifacts;
- temporal ordering and concurrent activity; and
- what the reporter already tried.

Label evidence as observed, repository-derived, user-reported, or inferred.
Do not treat a screenshot, final exception, or copied log excerpt as proof of
the initiating cause.

## Reproduce at the reported boundary

Start as close as safely possible to the original public boundary. Confirm that
the environment can first produce the expected success path or another known
baseline. Then attempt the reported scenario with bounded repetitions.

Record each attempt:

```text
attempt | controlled inputs | changed variable | outcome | signature match | artifacts
```

Do not change several uncontrolled dimensions between attempts. When the bug is
rare, report the attempt count and observed rate rather than saying it “cannot
be reproduced.”

Read `references/reproduction-method.md` for the reproduction ladder,
hypothesis ledger, minimization rules, and evidence capsule.

## Build competing hypotheses

Form hypotheses that predict a discriminating observation. Prefer categories
supported by the symptom:

- input or persisted-state shape;
- lifecycle or ordering;
- time, timezone, expiry, or clock behavior;
- randomness or generated identity;
- concurrency or duplicate execution;
- resource pressure or capacity boundary;
- environment, platform, configuration, or dependency difference;
- network or external-service behavior; and
- stale, cached, or generated artifacts.

For each hypothesis, record:

```text
hypothesis | supporting evidence | contradicting evidence | controlled change | predicted result | actual result
```

Run the cheapest high-discrimination check first. A failed prediction should
lower confidence in the hypothesis; do not keep adding conditions until it
becomes unfalsifiable.

## Control nondeterminism

Make hidden inputs explicit without changing the behavior under investigation.
Control or record:

- time and scheduling;
- random seeds and generated identifiers;
- concurrency, ordering, and synchronization points;
- process, thread, worker, or event lifecycle;
- filesystem, database, cache, and queue state;
- ports, resource limits, locale, and platform;
- environment and configuration precedence;
- dependency versions and generated artifacts; and
- network and external responses.

Read `references/nondeterminism-controls.md` for control techniques and
false-reproduction risks. Use seams already present in the repository before
adding hooks or simulators.

## Reduce without changing the bug

Once the original signature is repeatable, reduce the scenario in small steps:

1. Remove unrelated actions, data, services, or inputs.
2. Re-run the positive reproduction after each reduction.
3. Run a nearby negative control that should not fail.
4. Preserve the same failure signature and relevant causal mechanism.
5. Stop shrinking when the next reduction changes the boundary, timing,
   state transition, or failure class under investigation.

Prefer a small public-boundary reproducer over an artificial unit test that
bypasses the failing integration. A minimal reproducer is the smallest faithful
scenario, not necessarily the fewest lines of code.

## Create a reliable oracle

Define success and failure mechanically:

- exact state or invariant;
- structured result, error type, or status;
- bounded timing or resource threshold with justified tolerance;
- expected sequence or terminal state;
- visual or artifact comparison with stable normalization; or
- absence of a prohibited side effect.

Avoid blind sleeps, log substring checks when structured evidence exists,
unbounded polling, and assertions that pass after either success or timeout.
Preserve the earliest causal failure when cleanup or secondary errors occur.

## Verify reproducibility

Demonstrate:

- repeated signature matches under fixed conditions;
- a negative control that does not produce the signature;
- removal or alteration of at least one necessary condition suppresses the
  failure;
- the reproducer fails on a known-bad state and, when available, does not fail
  on a known-good state;
- reruns begin from a known state; and
- retained artifacts are sufficient to investigate a failed attempt.

Do not claim root cause merely because toggling one condition changes the
outcome. State whether the reproducer proves correlation, necessity,
sufficiency, regression range, or causal mechanism.

## Implement only when requested

When the user requests a reusable reproducer:

1. Reuse the repository's test runner, fixtures, task runner, and artifact
   conventions.
2. Add the smallest seam needed to control a demonstrated hidden input.
3. Keep the scenario non-interactive, bounded, isolated, and safe to rerun.
4. Make failure output preserve the signature, controlled inputs, seed or
   schedule, and artifact location.
5. Add cleanup that targets only run-owned state.
6. Prove the harness fails for the known-bad behavior before using a fix to
   make it pass.
7. Keep stress or probabilistic runs supplementary to a deterministic
   regression when a deterministic seam is feasible.

Do not fix the bug while constructing the reproducer unless explicitly asked.
Separating the failing proof from the repair prevents a test that only ever
observed the fixed behavior.

## Report

Lead with reproduction status: reliable, probabilistic, environment-specific,
not reproduced, or blocked. Then provide:

1. **Failure signature:** operation, preconditions, observation, and exclusions.
2. **Reproduction command or steps:** exact boundary, inputs, and setup.
3. **Evidence:** attempt ledger, rate, artifacts, and evidence classes.
4. **Necessary controls:** state, time, schedule, environment, or external
   behavior required.
5. **Minimized scenario:** what was removed and why fidelity remains.
6. **Oracle:** mechanical pass and fail contract.
7. **What this proves:** reproduction versus cause, scope, and confidence.
8. **Remaining hypotheses and next evidence:** smallest discriminating checks.

## Examples

- Turn a once-per-day timeout into a virtual-time scenario with a stable
  terminal-state assertion.
- Reduce a user-reported stale UI to one cache transition while preserving the
  public request and rendered result.
- Reproduce duplicate event handling with controlled delivery and
  acknowledgment order rather than an unbounded stress loop.
