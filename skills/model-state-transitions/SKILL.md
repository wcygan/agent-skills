---
name: model-state-transitions
description: Model and verify lifecycle rules as explicit states, events, and transitions. Use when scattered flags, asynchronous responses, retries, cancellation, or lifecycle checks make legal behavior unclear.
license: MIT
metadata:
  kind: component
  maintenance: local
---

# Model state transitions

Read [modeling](references/modeling.md) first to select the smallest useful model.
Then load only the references relevant to the task:

| Task | Reference |
| --- | --- |
| Define states, invariants, ownership, and legal transitions; choose a reducer, typestate, or statechart | [Modeling](references/modeling.md) |
| Understand sums, products, cardinality, and what an ideal domain representation preserves | [Algebra of domain types](references/type-algebra.md) |
| Understand transition systems, reachability, invariant preservation, and abstraction | [Theory of state and behavior](references/transition-theory.md) |
| Compare refinements, typestate, ownership, session types, and effect types | [Types as guarantees](references/type-guarantees.md) |
| Coordinate effects, cancellation, concurrent writers, retries, or persisted state | [Execution boundaries](references/execution-boundaries.md) |
| Implement in TypeScript with Effect v4 and Schema | [TypeScript + Effect](references/typescript-effect.md) |
| Implement enums, exhaustive transitions, or ownership-based typestate in Rust | [Rust](references/rust.md) |
| Implement sealed variants, records, and exhaustive transitions in Java | [Java](references/java.md) |
| Verify a model or implementation, or evaluate this skill | [Verification](references/verification.md) |

Before reporting a completed implementation, read the verification reference.
