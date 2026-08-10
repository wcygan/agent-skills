# Patterns and worked examples

Use these examples as structural precedents, not as mandatory skill proposals.
Each example shows which layer owns the decision, how companion artifacts move,
and where the workflow stops.

## Pattern comparison

| Pattern | Owns | Select when | Output | Stop |
|---|---|---|---|---|
| Orchestrator | An end-to-end result | Several specialists must contribute | Reconciled integrated artifact | The integrated acceptance condition is met |
| Router | Classification and dispatch | Exactly one specialist should proceed | Route, rationale, and required context | The route is unambiguous |
| Decision framework | A repeatable decision | Evidence must be evaluated against stable criteria | Decision record and recommended next action | The decision is justified |

An orchestrator may route conditionally, and a decision framework may recommend
another skill. Name the pattern by the output it owns.

## Example: `shape-safe-change`

**Pattern:** Orchestrator.

**Job:** Turn a consequential proposed change into one reviewable Change Design
Pack before implementation.

**Companions:**

| Skill | Selection | Receives | Returns |
|---|---|---|---|
| `codebase-design` | Required | Problem framing and current seams | Proposed ownership and interface design |
| `map-change-impact` | Required | Proposed design | Blast-radius and compatibility map |
| `design-verification-strategy` | Required | Design plus impact map | Evidence and acceptance strategy |
| `domain-modeling` | Conditional when terminology, entity boundaries, or business invariants are unclear | Ambiguous concepts and evidence | Vocabulary or decision proposals |
| `plan-safe-refactor` | Conditional when the change is primarily behavior-preserving restructuring | Accepted design and impact map | Staged transition plan |

**Structure:**

```text
frame change
  -> clarify domain only when ambiguous
  -> design ownership and interfaces
  -> map impact and compatibility obligations
  -> add staged refactor plan only when applicable
  -> design verification
  -> reconcile into Change Design Pack
  -> stop before implementation
```

The parent owns cross-document consistency. If the impact map reveals a new
consumer, the design and verification sections must both be revised. A
read-only invocation must not let `domain-modeling` write glossary or ADR files.

## Example: `diagnose-difficult-bug`

**Pattern:** Orchestrator.

**Job:** Turn a flaky or poorly understood symptom into an evidence-backed
Diagnosis Dossier and a bounded next action.

**Companions:**

| Skill | Selection | Receives | Returns |
|---|---|---|---|
| `reproduce-bug` | Required | Symptom and constraints | Minimal reproduction and failure signature |
| `trace-failure-path` | Required after a concrete failure exists | Reproduction evidence | Origin, propagation, translation, and surfacing trace |
| `model-concurrency` | Conditional when correctness depends on timing, ordering, cancellation, or duplicate work | Actors, operations, and observed schedule | Invariants and counterexample schedule |
| `audit-observability-path` | Conditional when the failure cannot be reconstructed or distinguished operationally | Scenario and trace gaps | Observability gap map |

**Structure:**

```text
bound the symptom
  -> establish a reliable failure signature
  -> trace the observed failure
  -> model concurrency only when a timing predicate is met
  -> audit observability only when evidence is insufficient
  -> reconcile competing hypotheses
  -> emit Diagnosis Dossier
  -> stop before fixing
```

`tdd` and `code-review` are downstream implementation and verification seams,
not diagnosis phases. Recommend them after the root-cause claim is supported;
do not silently expand a diagnostic request into code changes.

## Example: `map-production-scenario`

**Pattern:** Orchestrator.

**Job:** Explain one production scenario across execution, data, and operational
evidence as a Production Scenario Dossier.

**Companions:**

| Skill | Selection | Receives | Returns |
|---|---|---|---|
| `trace-codepath` | Required | Scenario entrypoint and sink | Scenario-specific execution path |
| `trace-data-lineage` | Required | Selected records or fields | Origin, transformation, persistence, and exposure lineage |
| `audit-observability-path` | Required | Scenario and known boundaries | Detectability and correlation audit |
| `trace-failure-path` | Conditional for a broken or degraded variant | Concrete failure signature | Failure propagation and recovery trace |

**Structure:**

```text
select one production scenario
  -> trace execution path
  -> trace the scenario's critical data
  -> audit operational evidence against both traces
  -> add failure-path overlay only for a concrete broken variant
  -> reconcile identifiers, boundaries, and unknowns
  -> emit Production Scenario Dossier
```

The dossier should share one scenario identifier and boundary vocabulary across
all views. It is not four independent reports pasted together.

## Example: tighten the development loop

**Pattern:** Existing workflow with a conditional handoff, not necessarily a new
composite skill.

Start with `improve-development-loop` to identify the repeated path, dominant
bottleneck, and trustworthy feedback gap. Recommend `hill-climbing` only when
all of these hold:

- one bounded numeric metric represents the target;
- the loop can be repeated mechanically;
- noise tolerance and behavioral guards are defined;
- the user explicitly invokes the optimization loop.

The first skill owns diagnosis and workflow redesign. The second owns guarded
experimentation. Keeping the seam explicit preserves `hill-climbing`'s stronger
invocation and mutation contract.

## Example: create a new skill

**Pattern:** Decision framework followed by a separate implementation workflow.

```text
suspect an existing capability
  -> use `find-skills` for read-only ecosystem discovery
describe a recurring workflow problem
  -> use `skill-intake` to decide create, extend, split, script, document,
     one-off, or defer
accepted create/extend decision
  -> use `new-plugin` to scaffold and validate repository structure
author or revise agent-facing instructions
  -> use `writing-for-agents`
```

This seam is already coherent. A new wrapper adds value only if it owns an
integrated artifact and preserves the read-only stop after intake. Otherwise it
is a playlist. Do not let intake create files, and do not let discovery install
skills without separate authority.

## Example: diagnose agent weirdness

**Pattern:** Extend or route through an existing orchestrator.

`evaluate-agent-workflow` already owns end-to-end diagnosis across instructions,
context, model selection, tool schemas, calls, orchestration, persisted events,
projections, and visible output. Treat it as the parent rather than creating a
near-duplicate sibling.

Route to tracing skills only for a precise evidence gap:

| Gap | Companion |
|---|---|
| Unknown execution route through agent infrastructure | `trace-codepath` |
| Unknown provenance or transformation of a field or event | `trace-data-lineage` |
| Unknown error translation, retry, suppression, or recovery | `trace-failure-path` |
| Cannot correlate one run across operational artifacts | `audit-observability-path` |
| Need an evidence-backed regression proof | `design-verification-strategy` |

The integrated output remains the agent workflow evaluation. Companion traces
are evidence sections, not competing top-level reports.

## Router example: engineering investigation router

**Pattern:** Router.

| Dominant question | Route |
|---|---|
| How does this scenario execute? | `trace-codepath` |
| Where did this field, event, or record come from? | `trace-data-lineage` |
| How did this concrete error propagate and surface? | `trace-failure-path` |
| Can operators detect and reconstruct this scenario? | `audit-observability-path` |
| Can this intermittent symptom be made reliable? | `reproduce-bug` |
| Which schedule violates the concurrent-system invariant? | `model-concurrency` |

The output is one selected route, its rationale, and the minimum context to pass
forward. If two questions are independently required for one integrated result,
the proposal has crossed from routing into orchestration.

## Decision-framework example: skill intake

**Pattern:** Decision framework.

`skill-intake` evaluates recurrence, judgment, determinism, overlap, authority,
and maintenance ownership. It returns a create, extend, split, script,
documentation, one-off, or defer decision plus a brief or handoff. It stops
before implementation. The durable value is the quality of the decision, not
automatic chaining.

## Existing compositions worth studying

- `improve-codebase-architecture` combines discovery, visual reporting, and a
  focused design interview into one architecture-improvement outcome.
- `improve-animations` combines source survey, prioritization, and
  self-contained implementation planning while remaining read-only.
- `grill-with-docs` combines a decision interview with durable ADR and glossary
  artifacts; its mutation authority is part of its defining contract.

Study these for ownership and stopping conditions. Do not assume every
multi-phase skill should call other named skills.

## Counterexamples

Reject or reshape a proposal when:

- the parent only says "run A, then B, then C";
- two companions own the same phase and no precedence rule exists;
- optional branches use vague predicates such as "if useful";
- the final artifact is a concatenation without reconciliation;
- a read-only parent can accidentally trigger writes through a child;
- a missing companion silently produces an incomplete result;
- the design depends on a sibling skill's filesystem path;
- one installed skill already owns the same trigger and output;
- the composition exists only to save a few prompt words.
