---
name: functional-decomposition
description: "Decompose software behavior into maintainable implementation responsibilities. Use when designing a component's internal structure, untangling algorithms and state, or evaluating whether functions and modules have useful boundaries."
license: MIT
metadata:
  author: William Cygan
  version: "0.1.0"
---

# Functional Decomposition

Turn required behavior into responsibilities that can be understood, changed,
and verified with limited knowledge of the surrounding system. Apply this to
functions, stateful components, and cooperating modules within the requested
scope. Functional decomposition here concerns what software does; it does not
require a functional programming language.

The central decision is what belongs together: behavior, state, implementation
knowledge, and the rules that keep them consistent. A useful boundary reduces
what a caller or maintainer must know while preserving the required behavior.

## Choose the requested result

- **Explain:** use a representative example and distinguish source claims from
  engineering synthesis. Repository inspection is optional unless requested.
- **Design or assess:** ground responsibilities and alternatives in requirements
  or actual code. Produce a concrete proposal or supported findings.
- **Implement:** carry the design through authorized edits and relevant checks.
  Completing the design phase does not remove authorization to implement it.

For existing code, read repository instructions and inspect the working state
before editing. Preserve unrelated changes. Match analysis depth to the target;
a private helper does not require a system-wide architecture exercise.

Nearby skills, when available, can help with narrower concerns: `codebase-design`
for interface depth and reusable module APIs; `simplify-code` for bounded cleanup;
`plan-safe-refactor` for staged compatibility changes; `model-concurrency` for
concurrent schedules. They are optional specialists, not prerequisites. Retain
the user's requested outcome when using their guidance.

## 1. Establish the behavior and constraints

Identify the entrypoint, intended result, callers, inputs, outputs, and observable
failures. For existing code, trace representative success and failure paths and
inspect relevant tests. Distinguish intended behavior from incidental structure.

Record constraints that can change the decomposition: compatibility, ordering,
state lifetime, concurrency, persistence, latency, memory, or external effects.
Ask only when a missing decision would materially change the requested result;
otherwise state a narrow assumption and proceed.

This step is complete when there is a concrete behavior example, a scoped target,
and a way to recognize a correct outcome. For implementation, identify the
existing oracle or the behavior-based checks needed to establish one.

## 2. Map execution and ownership separately

Sketch how work happens, then identify who should own each decision and mutable
resource. A processing step need not become a module. One module may participate
in several steps because it owns information those steps need.

Use a compact account where useful:

| Responsibility | Inputs/results | Private decisions | State/invariants | Dependencies |
|---|---|---|---|---|
| Interpret records | Bytes to source records | Format and encoding | Parser state | Byte source |
| Accept a record | Candidate to accepted/rejected | Domain rules | Validity conditions | Explicit facts |
| Store accepted records | Records to outcome | Persistence strategy | Identity uniqueness | Database |

Follow data transformations as well as calls. Inspect mutable aliases, shared
contexts, callbacks, initialization order, and exceptional exits when present.
Complete the map when the important decisions and state transitions have named
owners; mark any unresolved ownership rather than hiding it in a generic manager.

## 3. Refine behavior and choose boundaries

Refine unclear operations and their data until an implementation can be described.
Keep conceptual subtasks private unless a separate interface provides a concrete
benefit. Choose boundaries using these criteria together:

- **Hidden decisions:** callers can work without knowing a representation,
  algorithm, format, or policy that the component owns.
- **Cohesion:** the responsibility has a coherent purpose, rule set, or state
  lifecycle. Shared syntax alone is weak evidence for combining behavior.
- **Local reasoning:** preconditions, outcomes, and invariants are clear enough
  to examine the component without reconstructing the system.
- **Useful contracts:** inputs, failures, effects, ordering, and retry behavior
  expose the information callers actually need.
- **Total complexity:** the gain exceeds added interfaces, navigation, data
  conversion, configuration, and coordination.

Use ordinary functions, local data types, and existing project conventions where
they suffice. Logical boundaries do not by themselves justify new processes,
services, plugin systems, or a framework. Retaining or combining code is a valid
outcome when extraction has no demonstrated benefit.

## 4. Challenge the proposed structure

Where a consequential boundary is uncertain, compare meaningfully different
alternatives, including the current structure. Exercise them against actual or
credible changes and relevant failures. Explain which responsibilities change,
what knowledge crosses boundaries, and where correctness is enforced.

Use maintenance history when available, but distinguish a conceptual dependency
from files changed together for formatting, generated code, or mechanical edits.
Treat code size and coupling metrics as supporting evidence, not acceptance rules.

For stateful or concurrent operations, identify the complete transition that must
remain consistent. Separating calculation from mutation must preserve the needed
isolation or version check. Individually safe calls do not make a sequence atomic.

Select an alternative when its benefit and cost are specific to this target.
Record remaining uncertainty and a focused way to resolve it; do not fabricate
confidence scores or universal size limits.

## 5. Implement and verify when requested

Make coherent changes that preserve the established contract. For larger moves,
choose intermediate states that still run correctly and define how temporary
compatibility code will be removed. Separate any authorized behavior change from
the restructuring so its evidence remains visible.

Verify the behavior at useful boundaries and the important collaborations across
them. Include effects, failure paths, and concurrent schedules when the change
touches them. Prefer existing checks; add tests when they establish missing
behavioral evidence. A file move or helper extraction does not automatically need
a new test, and a changed call graph does not justify rewriting assertions to
match new internals.

Completion requires the requested edits, relevant checks, and an inspected diff.
If evidence is unavailable, report the exact gap and its effect on confidence.

## 6. Report the result

Scale the report to the task. Explain the resulting responsibilities, important
contracts, and why the boundaries help. Include a concrete change or failure
scenario that demonstrates the benefit. For implementation, report changed paths,
verification results, and remaining problems. For explanation or design, clearly
identify illustrative examples and assumptions.

Stop when the requested outcome is supported. A defensible decision to keep the
current structure is complete work; further decomposition is not a success metric.

## Read the relevant references

Load only the documents that answer the current design question. Each contains
guidance or an example; the examples are illustrative, not production libraries.

| Question or condition | Reference |
|---|---|
| Terminology or conceptual orientation | [Foundations](references/foundations.md) |
| Source rationale, evidence strength, or further research | [Research and evidence](references/research-and-evidence.md) |
| Requirements need an implementable algorithm and data model | [Stepwise refinement](references/stepwise-refinement.md) |
| Deciding which knowledge a module should own | [Information hiding](references/information-hiding.md) |
| Responsibilities are scattered or dependencies are tangled | [Cohesion and coupling](references/cohesion-and-coupling.md) |
| Mutable state, lifecycle, atomicity, or concurrent transitions | [State and invariants](references/state-and-invariants.md) |
| Callers need ordering, failure, or representation knowledge | [Contracts and interfaces](references/contracts-and-interfaces.md) |
| Decisions are mixed with databases, networks, time, or randomness | [Decisions and effects](references/decisions-and-effects.md) |
| Sequencing, intermediate values, or partial failure dominates | [Orchestration and dataflow](references/orchestration-and-dataflow.md) |
| Choosing whether to split, combine, extract, or inline | [Abstraction and granularity](references/abstraction-and-granularity.md) |
| Several plausible structures need comparison | [Comparing decompositions](references/comparing-decompositions.md) |
| Existing behavior must survive a change in ownership | [Evolving existing code](references/evolving-existing-code.md) |
| Selecting evidence for behavior and composition | [Verification](references/verification.md) |
| Worked example of interpreting, validating, and storing data | [Document import](references/example-document-import.md) |
| Worked example of shared state and concurrent operations | [Stateful component](references/example-stateful-component.md) |
| Worked example where merging code improves the design | [Overdecomposition](references/example-overdecomposition.md) |
