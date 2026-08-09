# Concurrency Model

Use this reference to create a small explicit model. The event ledger is
authoritative; diagrams and prose are projections of it.

## Contents

- Actors and state
- Operations and events
- Event ledger
- Happens-before
- Properties and assumptions
- Counterexample schedules
- Diagrams
- Model limits

## Actors and state

Define each actor by:

- identity and execution boundary;
- local state;
- operations it can initiate;
- shared resources it can access;
- retry, cancellation, and failure behavior; and
- authority to commit or expose state.

Define shared state by owner, initial value, version, visibility, durability,
and allowed transitions. Separate primary state, caches, projections, queues,
leases, and external side effects.

## Operations and events

Decompose operations into the smallest steps another actor can distinguish:

- read or observe;
- validate or decide;
- acquire, reserve, or compare;
- write or mutate;
- commit or make visible;
- publish or enqueue;
- acknowledge or respond;
- renew, release, cancel, or expire; and
- crash, restart, retry, or recover.

Assign stable event IDs such as `A1`, `A2`, `B1`. Record read and write sets.
Keep locally indivisible computation together unless memory visibility or
preemption within it affects the property.

## Event ledger

| Field | Content |
|---|---|
| event | stable actor-local identifier |
| actor | task, process, worker, client, or system |
| precondition | state required for the event |
| action | read, decide, write, commit, publish, acknowledge, or fail |
| reads | state and observed version or value |
| writes | state and resulting version or value |
| effect | external or irreversible effect |
| order | supported predecessors |
| evidence | source, configuration, history, trace, or test |
| class | observed, verified, declared, inferred, or unknown |

Use symbolic values when real data is sensitive or unnecessary.

## Happens-before

Write `X -> Y` only when evidence establishes that X happens before Y:

- actor-local program order;
- synchronization release and successful acquisition;
- message publish and that message's receipt;
- durable commit and a read guaranteed to observe it;
- transaction serialization rule;
- version or fencing comparison; or
- explicit causal link.

Concurrent or unordered events use `X || Y`. Potential conflict requires
overlapping state access with at least one write or a shared external effect.

Do not derive happens-before solely from timestamps, log order, physical
proximity in source, or intended architecture.

## Properties and assumptions

Express safety as a predicate over state or history:

```text
at most one committed charge per operation ID
published version never exceeds committed version
two owners never commit under the same lease epoch
```

Express liveness with assumptions:

```text
if one healthy worker retains connectivity and retries are bounded fairly,
accepted work eventually reaches a terminal state
```

Name assumptions about scheduler fairness, partitions, crashes, clocks,
storage, delivery, and resource availability.

## Counterexample schedules

Create the shortest numbered sequence that reaches a prohibited state:

| Step | Event | Observation or mutation | State after step |
|---|---|---|---|
| 1 | A1 | actor A reads version 4 | A sees 4 |
| 2 | B1 | actor B reads version 4 | B sees 4 |
| 3 | A2 | A writes version 5 | value A committed |
| 4 | B2 | B writes version 5 | A's update lost |

Then show a nearby valid schedule or added ordering edge. This demonstrates
which relationship is necessary rather than merely naming a race.

## Diagrams

Use:

- a sequence diagram for temporal interleavings;
- a state diagram for ownership or lifecycle transitions;
- a happens-before DAG for partial order;
- a resource-order graph for deadlock; and
- a table when state after each step matters most.

Do not draw a total timeline when many events are intentionally unordered.
Keep detailed state in the event ledger.

## Model limits

State what the model omits:

- actors or failure modes outside scope;
- memory-model details;
- storage isolation or consistency not verified;
- network duplication, delay, or partition assumptions;
- clock and lease precision;
- queue ordering and delivery guarantees; and
- fairness or resource bounds.

A useful model is intentionally small, but omitted behavior must not silently
invalidate the selected property.
