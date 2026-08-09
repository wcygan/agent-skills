# Nondeterminism Controls

Control only dimensions supported by the symptom or hypotheses. Added control
mechanisms can hide the bug, so compare them against the original boundary.

## Contents

- State and lifecycle
- Time
- Randomness and identity
- Concurrency and ordering
- Resources and environment
- Network and external systems
- User interfaces and artifacts
- Safe test seams
- False reproductions

## State and lifecycle

Make initial state explicit:

- fresh, migrated, cached, partially completed, or recovered;
- database rows, files, queue entries, workflow history, and cache contents;
- process and worker start order;
- retained sessions, connections, subscriptions, and handles; and
- cleanup or retry state from a prior attempt.

Prefer a unique run-owned namespace, directory, database, or identifier.
Snapshot or generate the minimum fixture instead of copying production state.
Verify reset completion rather than assuming teardown succeeded.

## Time

Record or control:

- wall clock, monotonic time, timezone, locale, and daylight transitions;
- expiry, lease, timeout, debounce, schedule, and retry timers;
- event time versus processing time; and
- clock skew across components.

Prefer virtual or injectable time when the repository already supports it.
Advancing a fake clock must also advance the scheduler or runtime that consumes
it. A shorter production timeout can create a different failure rather than
accelerate the original.

## Randomness and identity

Capture seeds, generated IDs, randomized order, sampling decisions, and
property-test counterexamples. Confirm that the seeded generator is the one
used by the failing component, not only the test wrapper.

Avoid replacing uniqueness-sensitive identifiers with a constant if collisions
are part of the behavior being investigated.

## Concurrency and ordering

Use barriers, latches, controllable executors, hooks, paused consumers, virtual
schedulers, or test transports to expose a specific ordering. Record:

- actors and operations;
- synchronization point;
- release order;
- retry or delivery attempt; and
- durable state before and after each step.

Prefer a deterministic schedule over a blind sleep. Stress runs are useful for
discovery and confidence, but failure absence under stress does not prove
correctness.

## Resources and environment

Record relevant CPU, memory, disk, descriptors, ports, process limits,
architecture, operating system, runtime, locale, and filesystem behavior.
Use explicit bounded limits when pressure is the hypothesis.

Distinguish resource exhaustion from a test harness that cannot start. Avoid
starving a developer machine or shared runner to mimic production capacity.

Pin or record dependency and tool versions, generated files, build mode,
feature flags, configuration sources, and environment precedence. A clean
rebuild can diagnose stale artifacts but may erase evidence of the original
condition.

## Network and external systems

Control latency, timeout, response, disconnect, duplication, and ordering at an
existing client, transport, emulator, or fixture seam. Preserve the contract
shape and error semantics of the real boundary.

Do not call a live external service repeatedly to seek a rare response. Use
captured redacted contracts or a bounded local fake when fidelity is adequate.
Record which provider behaviors remain unverified.

## User interfaces and artifacts

Control viewport, input sequence, focus, animation state, fonts, assets,
locale, and rendering completion. Prefer semantic state and stable screenshots
over fragile coordinate timing.

For generated files or snapshots, normalize only irrelevant fields. Excessive
normalization can erase the bug signature.

## Safe test seams

A useful seam:

- exposes one hidden input or scheduling decision;
- exists below the public behavior under test;
- preserves production defaults;
- is explicit and deterministic;
- has no production side effects when unused; and
- can be removed or retained without coupling tests to internals.

Reuse clocks, clients, schedulers, fixture factories, dependency injection, or
runtime hooks already present. Do not introduce a broad abstraction solely to
control one test.

## False reproductions

Reject a reproducer when:

- setup failure happens to match a generic error string;
- a mock returns behavior the real boundary cannot produce;
- reduced input violates a different validation rule;
- instrumentation changes timing enough to create or remove the race;
- cleanup from one attempt contaminates the next;
- retry or timeout bounds differ materially from the report;
- only a downstream symptom matches while the state path differs; or
- the oracle passes on timeout, missing output, or skipped execution.

Use a nearby negative control and compare state transitions, not only final
text, to catch these errors.
