# Model valid states and valid histories

Use this procedure when lifecycle rules are scattered or ambiguous. Preserve the
requested scope, existing behavior unless a change is authorized, and project
conventions. A model is useful when it eliminates contradictory data, duplicated
rules, or unclear ownership. Keep a simple synchronous toggle as a boolean when
it already expresses the domain correctly.

For the theory behind these choices, read [type algebra](type-algebra.md) for
representation, [transition theory](transition-theory.md) for behavior, or
[type guarantees](type-guarantees.md) for stronger mechanisms and their limits.
When learning from first principles, read those three in that order; for an
implementation task, load only the theory needed to resolve a modeling decision.

## Establish the contract

Identify the entity or process being modeled and who may commit its next state.
Describe observable outcomes and distinguish existing rules from proposed ones.
Write a few invariants in domain language before choosing a framework:

- A successful search contains results.
- Only the current request may replace the visible search result.
- Cancelling an attempt prevents its later completion from changing this view.

Separate four kinds of guarantees:

| Guarantee | Mechanism | Limit |
| --- | --- | --- |
| Valid snapshot | Sum type with state-specific payloads; validated construction | Does not constrain the path that produced it |
| Legal transition | Controlled transition function or state-specific API | Callers must not bypass the owner |
| Safe execution | Identity checks, atomic writes, effect protocol | Local serialization alone does not coordinate external writers |
| Progress | Explicit completion, failure, timeout, or recovery rules | Depends on stated scheduling and dependency assumptions |

“Invalid states are impossible” must name the invalid condition and enforcement
boundary. A type assertion, unchecked deserialization, public mutable field, or
second writer can defeat a local guarantee.

## Choose states and data

Use variants for mutually exclusive lifecycle modes and attach the data each mode
requires. Prefer `Succeeded(result)` over `done: boolean` plus optional `result`.
Derive redundant flags such as `isLoading` from the authoritative state.

Keep request IDs, timestamps, result lists, and progress values as payloads; do
not create a state for every value. Refine or validate values when the domain
requires constraints such as a positive quantity. A sum type alone does not prove
an arbitrary numeric relationship.

Preserve real product behavior. If old results remain visible during refresh,
model that explicitly; do not adopt an example that erases them merely because
its lifecycle is simpler. Keep independent concerns separate. Combining two
independent machines into one list of every possible pair obscures ownership.

## Describe transitions before effects

Use a compact table or equivalent executable definition:

| From | Event | Guard | To | Effect |
| --- | --- | --- | --- | --- |
| Idle / success / failure | Search | Input accepted | Loading(new ID) | Start request |
| Loading | Search | Input accepted | Loading(new ID) | Replace request |
| Loading | Completed / failed | ID matches active request | Success / failure | None |
| Any | Completion for obsolete ID | — | Unchanged | None |
| Loading | Cancel | — | Idle | Request cancellation |

Name the initial state and any terminal states. Define what unsupported, duplicate,
stale, and late events mean: reject, ignore, defer, or handle idempotently. These
are domain decisions, not a universal rule to silently ignore every invalid event.
Unknown external event shapes need boundary validation even when known events
are deliberately ignored in some states.

Keep decisions deterministic where practical: accept time, IDs, and external
outcomes as inputs. Dispatch events to the owner; avoid exporting arbitrary state
setters. Exhaustive matching exposes newly added variants, but a handled branch
can still implement the wrong rule.

## Select the smallest representation

| Need | Starting point |
| --- | --- |
| Small, flat lifecycle | Enum/discriminated union and pure reducer |
| Operations legal only in particular resource phases | Typestate API with controlled construction |
| Shared behavior across substates | Hierarchical statechart |
| Independent, concurrently active concerns | Separate owners or parallel statechart regions |
| Operation lifetime belongs to a state | Owned task/actor with explicit completion and cancellation |
| Recovery across crashes and long waits | Existing persistence or durable workflow facilities |

Hierarchy can consolidate shared transitions. Parallel regions compress the
description of combinations; they do not eliminate their interactions or imply
execution on separate threads. Typestate can constrain call order, but language
aliasing and ownership rules determine whether old handles remain usable.

A reducer is a mechanism for transitions, not proof that the chosen states or
events are correct. A statechart runtime does not automatically correlate every
context field with the active state at the type level. Do not introduce a library,
generic machine framework, event log, or workflow engine solely to express a few
branches clearly.

## Produce a reviewable result

Keep one authoritative implementation of transition rules. A diagram or table is
useful when it aids review; avoid maintaining a second specification that silently
drifts from code. Report the owner, invariants, relevant event policies, and
evidence from meaningful histories. For effects or persistence, continue with
[execution boundaries](execution-boundaries.md). For completion evidence, use
[verification](verification.md).

## Sources

- [React: choosing state structure](https://react.dev/learn/choosing-the-state-structure)
- [TypeScript: narrowing and exhaustiveness](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)
- [Rust: typestate](https://doc.rust-lang.org/stable/embedded-book/static-guarantees/typestate-programming.html)
- [W3C SCXML semantics](https://www.w3.org/TR/scxml/) when detailed statechart semantics matter
