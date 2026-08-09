---
name: model-concurrency
description: Model concurrent or distributed behavior using actors, state, operations, invariants, happens-before relationships, and counterexample schedules. Use when analyzing races, lost updates, deadlocks, livelocks, ABA or TOCTOU bugs, duplicate work, ordering, cancellation, transactions, optimistic concurrency, locks, leases, fencing, queues, retries, or idempotency; distinguish safety from liveness, expose ambiguous interleavings, compare coordination strategies, and design deterministic tests without stress-testing production.
license: MIT
metadata:
  author: William Cygan
  version: "0.1.0"
---

# Model Concurrency

Model the actors, operations, state, ordering constraints, and invariants of one
concurrent scenario. Find concrete schedules that preserve or violate the
required properties.

## Preserve the authority boundary

Treat requests to analyze, model, explain, review, or identify concurrency
risks as read-only. Do not add locks, change transactions, inject faults,
modify retry policy, or run load against shared or production systems unless
the user explicitly requests implementation or an authorized experiment.
Inspect repository instructions and dirty state first.

Prefer source, configuration, existing histories, isolated tests, and
deterministic schedules. Stress tests may consume substantial resources or
mutate state; bound attempts, concurrency, time, artifacts, and cleanup before
running them. Never interpret lack of failure under stress as proof of
correctness.

## Define one concurrency question

Specify:

- **Scenario:** operation, request, event, task, transaction, or lifecycle in
  scope.
- **Actors:** threads, tasks, processes, workers, clients, replicas, schedulers,
  or external systems that can act independently.
- **Shared state:** memory, records, files, queues, workflow state, caches,
  leases, or external effects.
- **Property:** safety invariant, liveness goal, ordering guarantee, uniqueness,
  idempotency, or bounded progress requirement.
- **Trigger:** overlap, retry, cancellation, timeout, crash, failover, duplicate
  delivery, or another condition that creates concurrency.
- **Scope:** repositories, services, runtime, environment, and assumptions.

Avoid analyzing “all races.” Select one property and the smallest set of actors
that can affect it.

## Establish evidence

1. Read repository instructions and locate the public operation and state owner.
2. Trace runtime registration, dispatch, retries, transactions, callbacks,
   queues, and cleanup relevant to the scenario.
3. Identify actual atomic primitives and durable commit points rather than
   relying on method names.
4. Inspect tests, histories, logs, traces, or incident evidence that constrain
   ordering.
5. Record unknown runtime, storage, or transport semantics explicitly.

Classify material claims as observed, verified, declared, inferred, or unknown.
Documentation can declare a delivery or consistency guarantee; only executable
behavior or current observation can verify how the application uses it.

## Build the model

Represent:

- actors and their local state;
- shared resources and authoritative owners;
- operations decomposed into atomic or externally visible events;
- read and write sets;
- preconditions and guards;
- synchronization and happens-before edges;
- commits, acknowledgments, lease changes, and external side effects;
- retry, cancellation, and recovery transitions; and
- required safety and liveness properties.

Read `references/concurrency-model.md` for the event ledger, happens-before
notation, state machines, counterexample schedules, and diagram selection.

Do not assume a source-level statement is atomic across an await, callback,
transport, transaction, or process boundary. Do not assume a transaction
includes external effects.

## Decompose operations

Split each relevant operation at points where another actor can observe or
change state:

```text
read -> decide -> reserve -> write -> commit -> publish -> acknowledge
```

Include only steps that affect the selected property. Preserve:

- check-then-act gaps;
- read-modify-write sequences;
- optimistic version reads and compare-and-set;
- lock or lease acquisition, renewal, expiry, fencing, and release;
- transaction begin, commit, abort, and visibility;
- enqueue, delivery, acknowledgment, retry, and dead letter;
- cancellation request and cooperative observation; and
- process loss before or after durable effects.

Name ambiguous outcomes where an actor cannot know whether another component
committed.

## Establish ordering constraints

Record only supported happens-before edges:

- program order within one actor;
- successful synchronization;
- lock, lease, or transaction guarantees;
- message send and corresponding receive;
- commit and later visible read;
- durable acknowledgment semantics; and
- explicit causal or version relationships.

Wall-clock order, log timestamps, network send order, and “usually finishes
first” do not establish causality by themselves. State whether clocks,
delivery, reads, or replicas can reorder or lag.

## Explore critical schedules

Prioritize pairs of events that:

- access the same state with at least one write;
- make a decision from state that can become stale;
- acquire resources in different orders;
- cross a timeout, lease, retry, or cancellation boundary;
- combine a durable effect with an ambiguous acknowledgment;
- process duplicate or out-of-order messages; or
- publish or expose state before all required effects commit.

Construct the shortest schedule that can violate the property. Then construct a
nearby valid schedule to show the discriminating ordering.

Read `references/failure-patterns-and-tests.md` for common concurrency
failures, coordination mechanisms, and deterministic test seams.

## Distinguish safety and liveness

State properties precisely:

- **Safety:** prohibited state or event never occurs.
- **Liveness:** required progress eventually occurs under named fairness and
  availability assumptions.

A timeout can bound waiting without proving liveness. A lock can preserve
mutual exclusion while introducing deadlock or starvation. A retry can improve
eventual progress while violating uniqueness without idempotency.

Name fairness, failure, partition, resource, and scheduler assumptions. Do not
claim distributed liveness under an unbounded partition.

## Evaluate coordination mechanisms

For each candidate mitigation, determine:

- invariant it enforces;
- scope and authority of the coordinator;
- behavior on crash, timeout, cancellation, and failover;
- stale-owner or duplicate-attempt behavior;
- performance and contention cost;
- deployment or state compatibility;
- observability and recovery; and
- deterministic evidence that proves it.

Prefer the smallest mechanism aligned with the authoritative state. A local
mutex cannot protect work across processes. A lease without fencing cannot
prevent a paused stale owner from committing after expiry. An idempotency key
must cover the actual side effect and retention window.

## Design deterministic tests

Derive tests from counterexample schedules:

1. Establish isolated initial state.
2. Pause an actor immediately before the critical event.
3. Advance the competing actor to the discriminating state.
4. Release events in the modeled order.
5. Assert durable state, outputs, side effects, and terminal actor state.
6. Repeat with the nearby valid schedule.
7. Verify cleanup and rerun from a known state.

Prefer barriers, hooks, controllable schedulers, virtual time, fake transports,
or explicit fault seams over sleeps. Keep randomized or stress exploration as
supplementary discovery and record seeds and schedules.

Implement seams or tests only when requested. Preserve production defaults and
avoid adding a general abstraction for one controlled ordering.

## Verify the model

Check:

- every actor and shared resource has a named owner;
- atomicity and visibility claims match the actual runtime or datastore;
- all modeled ordering edges have evidence;
- retries and duplicate delivery create distinct attempts;
- lease expiry and cancellation do not imply work stopped;
- durable effects and acknowledgments are ordered explicitly;
- the counterexample actually violates the named property;
- the proposed mechanism eliminates that schedule without hiding another; and
- the test oracle observes the authoritative state.

Keep unresolved guarantees and unavailable implementations visible.

## Report

Lead with the property, shortest violating schedule, and recommended
coordination boundary. Then provide:

1. **Scenario and assumptions:** actors, state, trigger, scope, and guarantees.
2. **State and operation model:** atomic steps, read/write sets, guards, and
   commit points.
3. **Ordering graph:** supported happens-before edges and unconstrained pairs.
4. **Counterexample schedule:** numbered events with state after each step.
5. **Safety and liveness findings:** violated property, consequence, and
   assumptions.
6. **Coordination options:** invariant coverage, failure behavior, cost, and
   compatibility.
7. **Deterministic test plan:** seams, schedule, oracle, negative control, and
   cleanup.
8. **Unknowns:** missing semantics and the smallest evidence needed next.

## Examples

- Model two workers performing the same read-modify-write and produce the lost
  update schedule.
- Determine whether a renewable lease prevents stale commits after worker
  suspension and failover.
- Model queue acknowledgment, database commit, timeout, and redelivery to test
  duplicate side effects.
