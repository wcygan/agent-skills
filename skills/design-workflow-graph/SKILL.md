---
name: design-workflow-graph
description: "Design a workflow graph after choosing a graph control model. Use when state, transitions, recovery, and execution contracts need an implementation-ready design."
license: MIT
metadata:
  author: William Cygan
  version: "0.1.0"
---

# Design a Workflow Graph

Turn one approved graph-shaped workflow into one reconciled, evidence-backed
**Graph Design Pack**. The pack is an implementation handoff, not an
implementation request.

## Authority, entry, and companions

Keep graph design read-only. Inspect relevant source, contracts, state stores, tests, workflow histories, and authorized operational evidence. If implementation is also requested, continue into that work after the graph contract and required decisions are settled; designing a graph alone does not authorize dispatch or external effects.

Start from an evidence-backed control-model decision selecting a DAG, cyclic state graph, or dynamic graph. Use a supplied decision or `choose-workflow-control-model` when available; make the selection directly if necessary. If the evidence favors deterministic code or an agent loop, report that decision and continue any authorized work with the appropriate model instead of forcing a graph.

Prefer these companions when useful. Their contracts identify necessary evidence, not installation prerequisites:

| Companion | Predicate | Evidence needed |
| --- | --- | --- |
| `model-concurrency` | Nodes, retries, fanout, cancellation, or resume can overlap on state or effects. | Bounded concurrency model and violating schedules. |
| `route-agent-models` | A model or agent node can inherit or specialize its route. | Route Record for each selectable route. |
| `design-verification-strategy` | Candidate states, transitions, risks, and terminal outcomes are known. | Proof Matrix and acceptance gates. |
| `audit-observability-path` | Identity, terminal outcome, or reconstruction claims lack support. | Signal map or explicit evidence gap. |

If a companion is unavailable, analyze directly when tools and evidence suffice. Stop only the claims that depend on an essential missing capability or evidence source, and continue independent design work.

Use these terms consistently: **state** is data persisted or carried across a
transition; **progress** is a named measurable reduction in remaining work or
acceptance condition; a **terminal state** permits no normal outgoing edge; an
**authority gate** is deterministic policy or named human approval before a
side effect; **evidence** is classified `observed`, `verified`, `declared`,
`inferred`, or `unknown`.

## Build the Graph Design Pack

### 1. State scenario and boundaries

Define one scenario, entry condition, expected outcome, exclusions, external
systems, authority boundary, and required terminal states. Carry forward every
CMDR invariant and rejected alternative. State why a graph is required now,
not merely convenient.

The scenario section is complete when every node and edge can be checked
against the same outcome and authority boundary.

### 2. Own the state schema

For each state field, record:

```text
Field and meaning:
Authoritative owner and storage/durability expectation:
Writer nodes and validation:
Reader nodes and privacy boundary:
Identity, version, attempt, and causation fields:
Lifecycle and retention:
```

Separate workflow state from derived display state, transient execution data,
and external-system state. No node may silently own a field. Record how resume
loads a checkpoint and how stale or incompatible state fails safely.

### 3. Specify nodes and typed edges

Give every node a stable identifier and contract:

```text
Node:
Purpose and kind: deterministic | model | agent | human | external-action
Reads and writes:
Preconditions and validation:
Output type and failure result:
Side effect, idempotency key, and authority gate:
Observability events and identities:
Route Record and child-spawn policy, for model or agent nodes:
```

Place deterministic policy and authority gates in deterministic or human nodes.
Models and agents may classify, extract, draft, or propose bounded outputs;
they cannot authorize a protected external action.

Give every edge a source node, destination node, input/output types, and one
typed predicate over named state. Predicates must be mutually understood: state
the precedence where guards overlap and name the default failure edge. Do not
use edges such as "when appropriate" or "if successful" without a defined
field, validator, or status that makes the predicate decidable.

### 4. Bound dynamic fanout and fanin

When runtime inputs create child work, define:

- fanout source, eligibility predicate, maximum cardinality, quota, and
  backpressure behavior;
- child identity, parent/child causation, isolated state, and retry scope;
- child Route Record, role, context fork, tool boundary, and `leaf` or bounded
  descendant policy;
- fanin eligibility, expected-child accounting, timeout, partial-result,
  duplicate-child, and failed-child behavior; and
- deterministic merge order or an associative/commutative merge proof.

If these contracts cannot be named, remove dynamic fanout or return the pack
`decision-blocked`.

### 5. Make cycles, retries, and recovery finite

For an acyclic DAG, record cycle and revisit contracts as `not applicable` and
state why every path reaches a terminal state without revisiting a decision.
For each cycle or retry edge, record the re-entry state, progress measure,
maximum attempts or deadline, backoff/fairness assumption, repeated-input
fingerprint, and exit edges. A retry that produces no new evidence, state, or
remaining-work reduction is not progress.

Specify terminal success, terminal failure, cancellation, compensation, and
manual-escalation states. State what cancellation stops, what in-flight work
may finish, and how resume creates a distinct attempt without duplicating an
external effect. Use the routed concurrency model where overlap matters.

### 6. Bind effects, authority, and observability

For every external action, name the pre-action authority gate, action owner,
idempotency boundary, commit/acknowledgment order, retry/replay behavior, and
postcondition evidence. Do not claim exactly-once behavior without a supported
end-to-end boundary.

Define operation, workflow, attempt, node, parent/child, external-effect, and
actor identities. At each transition specify the durable event or audit record,
terminal outcome signal, and correlation fields. Keep unknown runtime
semantics visible rather than converting a design intent into proof.

### 7. Reconcile proof and produce the handoff

Invoke `design-verification-strategy` with the candidate graph and reconcile
its Proof Matrix with node contracts, edge predicates, cycles, fanout, failure
paths, and authority gates. Include discriminating positive, negative,
cancellation, replay, route mismatch, partial-child, and terminal-state cases as
required by the risk.

Before reporting, verify that:

- every state field has an owner and lifecycle;
- every nonterminal node has typed, precedence-defined outgoing behavior;
- every terminal state has no normal outgoing edge and emits evidence;
- cycles have finite progress and exit conditions;
- fanout has bounds and fanin has a merge contract;
- each selectable agent route has a compatible Route Record and fallback;
- effects have authority, idempotency, and recovery contracts; and
- proof, identities, and terminal outcomes describe the same graph.

Reconcile artifacts into one pack. Do not concatenate the CMDR, concurrency
model, observability audit, and verification strategy; revise linked sections
when one contract changes.

## Report and continue within scope

Lead with `ready for implementation`, `decision-blocked`, or
`evidence-blocked`. Cover these areas without repeating evidence across sections:

1. **Scenario and Graph Boundary** — entry, outcome, invariants, exclusions,
   and CMDR decision.
2. **State Schema and Ownership** — fields, owners, durability, lifecycle,
   identities, and resume semantics.
3. **Node and Edge Contracts** — kinds, typed inputs/outputs, predicates,
   placement, precedence, route records, and failure edges.
4. **Fanout, Cycles, and Terminals** — bounds, merge, progress, retry,
   cancellation, recovery, and terminal paths.
5. **Authority and Side Effects** — gates, action owners, idempotency, and
   replay behavior.
6. **Observability and Proof** — identities, evidence, Proof Matrix, and
   acceptance gates.
7. **Implementation Handoff** — ordered build slices, required owners,
   unresolved decisions, and no implied mutation authority.

For design-only requests, the pack completes the task. If implementation is already authorized, use the handoff to continue it without another routine approval stop. Dispatch and operational changes remain subject to their own authorization.

## Examples and counterexamples

**Example:** A document-processing workflow creates one bounded child per
validated page, merges page results in ascending page order, asks a human to
approve release, then records a terminal release outcome. The pack names the
fanout cap, failed-page policy, approval state, action idempotency key, and
resume behavior.

**Counterexample — deterministic code:** A fixed local validation has one
input, one deterministic transformation, and one terminal result. Return it to
`choose-workflow-control-model`; a graph would add no required control.

**Counterexample — no graph:** An analyst explores an unknown dataset and
chooses the next question from novel findings. No stable state transition or
terminal predicate exists yet, so stop before graph design.
