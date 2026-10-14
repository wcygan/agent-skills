# Engineering principles

Read this index at the start of substantive work, including direct procedure
invocations. Read each selected leaf skill in full before applying it; load only
the rules triggered by the task. Reconsider the selection when the phase or evidence
changes. When the user names a principle, read that leaf and use it to steer the work.
Each leaf is also directly invokable as `$principle-<name>`.

Principles guide decisions within the requested scope, project contracts, resource
budget, prior authorization, and explicit checkpoints. They do not grant permission
to publish, rebase, delete, message others, or delegate. Use available capabilities;
keep sequential work possible without calling it independent review.

In your final reply, name each principle that shaped a decision and the specific
choice it changed. Integrate this into concise prose or bullets; no fixed heading
is required. A principle name without a changed decision is not evidence of use.
Do not report rules merely read or considered.

## Core

| Principle | Apply when / decision |
| --- | --- |
| [Laziness Protocol](../../principle-laziness-protocol/SKILL.md) | Refactoring or adding layers: prefer deletion and the smallest sufficient change. |
| [Foundational Thinking](../../principle-foundational-thinking/SKILL.md) | Before logic: choose data structures, core types, shared state, and useful scaffold. |
| [Redesign from First Principles](../../principle-redesign-from-first-principles/SKILL.md) | Integrating a requirement: design as though it had been foundational from the start. |
| [Attack the Premise](../../principle-attack-the-premise/SKILL.md) | Two fixes sharing a premise fail the same gate: write the premise and measure which actors hold the imbalance. |
| [Subtract Before You Add](../../principle-subtract-before-you-add/SKILL.md) | Sequencing an addition or rewrite: remove dead weight before construction. |
| [Minimize Reader Load](../../principle-minimize-reader-load/SKILL.md) | Code is hard to trace: cut indirection and hidden state a reader must remember. |
| [Outcome-Oriented Execution](../../principle-outcome-oriented-execution/SKILL.md) | Planned migrations with declared phase boundaries: converge on the target design. |
| [Experience First](../../principle-experience-first/SKILL.md) | Product or interface tradeoffs: optimize the experience of users and maintainers. |
| [Exhaust the Design Space](../../principle-exhaust-the-design-space/SKILL.md) | A novel interaction or architecture lacks precedent: compare two or three prototypes. |
| [Build the Lever](../../principle-build-the-lever/SKILL.md) | Nontrivial work: build the smallest rerunnable tool that does or proves it. |

## Architecture

| Principle | Apply when / decision |
| --- | --- |
| [Model the Domain](../../principle-model-the-domain/SKILL.md) | Stateful logic or repeated branches: encode the domain in a fitting structure. |
| [Boundary Discipline](../../principle-boundary-discipline/SKILL.md) | Validation or adapters: validate at boundaries and keep business logic pure. |
| [Type System Discipline](../../principle-type-system-discipline/SKILL.md) | Types and signatures: exclude illegal states and handle variants exhaustively. |
| [Make Operations Idempotent](../../principle-make-operations-idempotent/SKILL.md) | Retryable operations: reconcile partial runs and converge on the same end state. |
| [Migrate Callers Then Delete Legacy APIs](../../principle-migrate-callers-then-delete-legacy-apis/SKILL.md) | Replacing an internal API: migrate callers and remove legacy paths together. |
| [Separate Before Serializing Shared State](../../principle-separate-before-serializing-shared-state/SKILL.md) | Concurrent writers: eliminate sharing before introducing structural serialization. |

## Verification

| Principle | Apply when / decision |
| --- | --- |
| [Prove It Works](../../principle-prove-it-works/SKILL.md) | Before claiming completion: check the real artifact and retain rerunnable evidence. |
| [Fix Root Causes](../../principle-fix-root-causes/SKILL.md) | Debugging: reproduce, trace the cause, instrument rather than guess. |
| [Sequence Work into Verifiable Units](../../principle-sequence-verifiable-units/SKILL.md) | Multi-step work and delivery order: check each coherent unit before advancing. |
| [Test Behavior, Not Implementation](../../principle-test-behavior-not-implementation/SKILL.md) | Writing or retaining tests: exercise the subject and assert the actual result. |
| [Explain the Number](../../principle-explain-the-number/SKILL.md) | Before trusting a measurement: identify its limiter and eliminate alternative explanations. |

## Delegation

| Principle | Apply when / decision |
| --- | --- |
| [Guard the Context Window](../../principle-guard-the-context-window/SKILL.md) | Context pressure: bound reads and retain findings rather than raw payloads. |
| [Never Block on the Human](../../principle-never-block-on-the-human/SKILL.md) | Reversible execution choices: proceed within authority and present the result. |

## Meta

| Principle | Apply when / decision |
| --- | --- |
| [Encode Lessons in Structure](../../principle-encode-lessons-in-structure/SKILL.md) | A recurring correction: encode it in a check or structure rather than repeated advice. |

These leaves retain Pstack's names and rules. The index selects principles;
playbooks and procedures supply the methods. Principles do not require every
method on every task. For source fidelity and local exceptions, see the
[parity matrix](parity.md#principle-catalog).
