# Engineering principles

Read this index at the start of substantive work. Open only the rule references
whose triggers fit the task, and revisit your selection when the phase or
evidence changes. If the user names a principle, open and apply that rule.
Both a title such as **Type System Discipline** and its former skill name
`$principle-type-system-discipline` refer to the same reference below.

Apply the rules within the requested scope, project contracts, budget, and
explicit checkpoints. Follow the approval requirements in
[wcygan-mode](../SKILL.md). When a rule changes your approach, name it and
describe the choice it changed in the final reply.

## Core

| Principle | Apply when / decision |
| --- | --- |
| [Laziness Protocol](principles/principle-laziness-protocol.md) | Refactoring or adding layers: prefer deletion and the smallest sufficient change. |
| [Foundational Thinking](principles/principle-foundational-thinking.md) | Before logic: choose data structures, core types, shared state, and useful scaffold. |
| [Redesign from First Principles](principles/principle-redesign-from-first-principles.md) | Integrating a requirement: design as though it had been foundational from the start. |
| [Attack the Premise](principles/principle-attack-the-premise.md) | Two fixes sharing a premise fail the same gate: write the premise and count, per component or caller, how often each holds the failing condition. |
| [Subtract Before You Add](principles/principle-subtract-before-you-add.md) | Sequencing an addition or rewrite: remove dead weight before construction. |
| [Minimize Reader Load](principles/principle-minimize-reader-load.md) | Code is hard to trace: cut indirection and hidden state a reader must remember. |
| [Outcome-Oriented Execution](principles/principle-outcome-oriented-execution.md) | Planned migrations with declared phase boundaries: converge on the target design. |
| [Experience First](principles/principle-experience-first.md) | Product or interface tradeoffs: optimize the experience of users and maintainers. |
| [Exhaust the Design Space](principles/principle-exhaust-the-design-space.md) | A novel interaction or architecture lacks precedent: compare two or three prototypes. |
| [Build the Lever](principles/principle-build-the-lever.md) | Nontrivial work: build the smallest rerunnable tool that does or proves it. |

## Architecture

| Principle | Apply when / decision |
| --- | --- |
| [Model the Domain](principles/principle-model-the-domain.md) | Stateful logic or repeated branches: encode the domain in a fitting structure. |
| [Boundary Discipline](principles/principle-boundary-discipline.md) | Validation or adapters: validate at boundaries and keep business logic pure. |
| [Type System Discipline](principles/principle-type-system-discipline.md) | Types and signatures: exclude illegal states and handle variants exhaustively. |
| [Make Operations Idempotent](principles/principle-make-operations-idempotent.md) | Retryable operations: reconcile partial runs and converge on the same end state. |
| [Migrate Callers Then Delete Legacy APIs](principles/principle-migrate-callers-then-delete-legacy-apis.md) | Replacing an internal API: migrate callers and remove legacy paths together. |
| [Separate Before Serializing Shared State](principles/principle-separate-before-serializing-shared-state.md) | Concurrent writers: eliminate sharing before introducing structural serialization. |

## Verification

| Principle | Apply when / decision |
| --- | --- |
| [Prove It Works](principles/principle-prove-it-works.md) | Before claiming completion: check the real artifact and retain rerunnable evidence. |
| [Fix Root Causes](principles/principle-fix-root-causes.md) | Debugging: reproduce, trace the cause, instrument rather than guess. |
| [Sequence Work into Verifiable Units](principles/principle-sequence-verifiable-units.md) | Multi-step work and delivery order: check each coherent unit before advancing. |
| [Test Behavior, Not Implementation](principles/principle-test-behavior-not-implementation.md) | Writing or retaining tests: exercise the subject and assert the actual result. |
| [Explain the Number](principles/principle-explain-the-number.md) | Before trusting a measurement: name what bounds it and rule out alternative explanations. |

## Delegation

| Principle | Apply when / decision |
| --- | --- |
| [Guard the Context Window](principles/principle-guard-the-context-window.md) | Context pressure: bound reads and retain findings rather than raw payloads. |
| [Never Block on the Human](principles/principle-never-block-on-the-human.md) | Reversible execution choices and ordinary obstacles: proceed, work through them, and present the result. |

## Meta

| Principle | Apply when / decision |
| --- | --- |
| [Encode Lessons in Structure](principles/principle-encode-lessons-in-structure.md) | A recurring correction: encode it in a check or structure rather than repeated advice. |

Each rule preserves its Pstack name and source attribution. Playbooks supply
the methods for applying the rules to a task.
