# Refactor Strategies

Choose a transition strategy based on dependency direction, deployment
independence, state compatibility, and the ability to verify equivalence.

## Contents

- Move then change
- Parallel change
- Branch by abstraction
- Facade or adapter
- Expand and contract
- Strangler or routing migration
- Shadow execution and dual comparison
- Strategy selection
- Temporary architecture

## Move then change

Move code or ownership mechanically, prove behavior is unchanged, then improve
it in later slices.

Use when:

- the existing unit can move without changing its public contract;
- source and destination can compile together; and
- reviewers benefit from separating relocation from redesign.

Avoid when the old structure is so entangled that the move cannot form a valid
checkpoint. Preserve history when repository tooling supports it, but do not
optimize diff appearance at the expense of a verifiable state.

## Parallel change

Change providers and consumers through a sequence that keeps both sides
compatible:

1. add the new provider capability without removing the old;
2. migrate consumers;
3. verify no old consumers remain; and
4. remove the old capability.

Use for signatures, interfaces, schemas, and contracts with multiple callers.
Define the coexistence window and removal evidence.

## Branch by abstraction

Place old behavior behind a stable abstraction, add the new implementation,
switch selection, then remove the old implementation and temporary selector.

Use when:

- implementation replacement is large;
- callers can remain stable;
- old and new paths can coexist; and
- selection can be controlled safely.

Keep the abstraction shaped around the enduring responsibility, not the union
of old and new implementation details.

## Facade or adapter

Introduce a narrow compatibility boundary that presents one stable contract
while dependencies or representations change behind it.

Use for legacy APIs, vendor replacement, generated clients, data shapes, or
module ownership. Make translation, defaults, error mapping, lifecycle, and
performance behavior explicit.

An adapter is temporary only when it has an owner and removal signal.

## Expand and contract

Add a compatible new form, migrate reads and writes, verify convergence, then
remove the old form.

Use for persisted data, events, configuration, and independently deployed
producers or consumers. Account for:

- old readers and new writers;
- new readers and old data;
- dual-write failure and reconciliation;
- retained events, queues, and long-running work;
- backfill and replay;
- rollback after new state is written; and
- cache or projection rebuilds.

Do not use dual writes casually when atomicity or reconciliation is absent.

## Strangler or routing migration

Route one bounded behavior, tenant, endpoint, or traffic class to the target
implementation while the old implementation remains authoritative elsewhere.

Use when system boundaries prevent a local atomic replacement. Define routing
identity, fallback, state ownership, observability, and how partial migration
affects correctness.

Avoid indefinite split ownership. Each migrated slice needs a completion signal.

## Shadow execution and dual comparison

Run the new implementation without making it authoritative, compare stable
outputs or effects, then decide whether to cut over.

Use only when:

- duplicate execution has no external side effect or is safely isolated;
- outputs can be normalized without hiding meaningful differences;
- data access and privacy permit comparison; and
- cost and latency are bounded.

For stateful work, prefer replay into isolated state. Never shadow irreversible
external effects.

## Strategy selection

| Condition | Prefer |
|---|---|
| mechanical relocation with stable contract | move then change |
| many callers must adopt a new contract | parallel change |
| implementation swap behind stable callers | branch by abstraction |
| representation or vendor compatibility | facade or adapter |
| persisted or independently deployed forms | expand and contract |
| system boundary and incremental ownership move | strangler or routing |
| equivalence needs runtime evidence | safe shadow or dual comparison |

Select based on the hardest real boundary, not the fashionable pattern.

## Temporary architecture

For every flag, adapter, dual path, compatibility field, or routing rule,
record:

- purpose and owner;
- supported old and new states;
- source of truth;
- observability and validation;
- expiration or removal condition;
- behavior during rollback; and
- failure mode if it remains indefinitely.

Temporary architecture without explicit exit criteria becomes permanent
complexity.
