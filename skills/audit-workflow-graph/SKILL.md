---
name: audit-workflow-graph
description: Audit a workflow graph for reachability, guards, terminal paths, cycles, retries, state, fanout, agent routes, authority, observability, and proof. Use when a graph can stall, duplicate work, use a wrong child route, lose state, evade policy, or lack evidence. Produce a read-only ranked report.
license: MIT
metadata:
  author: William Cygan
  version: "0.1.0"
---

# Audit a Workflow Graph

Audit one existing graph specification or implementation and return one
evidence-backed **Graph Audit Report**. Establish what the graph demonstrably
does, what it only declares, and what remains unknown; do not redesign it.

## Authority and audit boundary

This workflow is read-only. Inspect repository instructions, graph definitions,
state schemas, node code, guards, tests, runtime histories, logs, metrics,
traces, and authorized operational artifacts. Do not edit a graph, replay an
action, create state, trigger external effects, change a policy, add tests, or
alter observability.

Scope the audit to one workflow identity, version, scenario, environment, and
time window when runtime evidence is involved. If the graph, state owner, or
policy boundary cannot be identified, return an `evidence-blocked` report with
the smallest safe evidence needed. Do not infer runtime semantics from a
diagram, source branch, or test name alone.

Use these terms consistently: **state** is data carried or persisted across a
transition; **progress** is a measurable reduction in remaining work or named
acceptance condition; a **terminal state** has no normal outgoing edge; an
**authority gate** is deterministic policy or named human approval before a
side effect; **evidence** is `observed`, `verified`, `declared`, `inferred`, or
`unknown`.

## Establish the audit model

### 1. Create the graph inventory

Record every node, edge, state field, terminal status, side effect, authority
gate, agent Route Record, identity, and artifact relevant to the selected
scenario. For each item, state its source and evidence class. Build a
transition ledger:

```text
source node | typed guard | destination node | state read/write | effect
authority gate | retry/cancellation behavior | evidence | class
```

Separate declared graph structure from verified execution and observed runtime
behavior. A missing runtime sample is an unknown, not a clean run.

### 2. Test structural reachability and guards

From every permitted entry state, determine which nodes and terminal states are
reachable. Identify dead nodes, edges with unsatisfied predicates, paths that
can never reach a terminal state, and terminal states entered without required
preconditions.

For every branching node, check guards for completeness, overlap, precedence,
and decidability. A guard is ambiguous when the same valid state selects more
than one edge without declared precedence. A guard is incomplete when a valid
state selects none and no explicit failure path exists. Record a concrete state
assignment or missing predicate for each finding.

### 3. Audit finite progress and recovery

For each cycle, retry, or resume edge, find the progress measure, re-entry
condition, bound, deadline, and terminal escape. Flag unbounded or no-progress
cycles, retries that replay completed effects, and cancellation paths that
leave no resumable or terminal state.

Audit replay, idempotency, and ordering at each side-effect boundary:

- distinct operation, attempt, child, and external-effect identities;
- durable checkpoint and commit/acknowledgment order;
- duplicate, timeout, ambiguous acknowledgment, crash, and resume behavior;
- side effects duplicated, omitted, or reordered across retry and fanin; and
- orphaned state, abandoned children, and incompatible state versions.

Only claim a guarantee when runtime/store semantics or a discriminating test
supports it.

### 4. Audit dynamic work and authority

For dynamic fanout, inspect the source, eligibility, cardinality cap, quota,
child identity, backpressure, timeout, child failure, partial result, and merge
semantics. Flag unbounded spawning, join conditions that cannot settle,
duplicate children, nondeterministic merge where order matters, and child work
that can outlive the parent without an owner.

For model or agent children, compare requested, resolved, and effective routes.
Inspect roles, context forks, inherited fields, backend compatibility, tools,
permissions, fallback, and child-spawn policy. Flag silent substitution,
incompatible overrides, undeclared tools, and unbounded descendants.

For human and policy gates, trace the exact pre-action path. Flag effects that
can bypass, race, reuse a stale decision, or interpret model/agent output as an
authorization. Assess excessive or misplaced agency: classification, drafting,
or bounded selection may be model/agent work; policy enforcement, approval,
eligibility, spending, data release, and safety decisions require deterministic
logic or named human authority.

### 5. Audit observability and proof

Check whether operation, workflow, attempt, node, parent/child, actor, and
external-effect identities survive every material transition. Confirm Route
Record identity also survives agent dispatch and result transport. Verify that
success, failure, retry, cancellation, resume, fanin, and terminal outcomes
have distinguishable evidence. Keep source configuration, runtime telemetry,
and rendered projections separate.

Map each material claim to its proof: structural validation, focused test,
integration scenario, durable state, operational history, or user-visible
acceptance. Flag missing negative, cancellation, replay, fanout, failure, or
terminal-state cases. A broad pass does not prove a graph-specific invariant
unless its oracle observes that invariant.

## Rank findings and bounded next steps

For each finding, report:

```text
ID and severity: critical | high | medium | low
Claim and affected graph contract:
Evidence, class, and confidence:
Concrete counterexample state or schedule:
Consequence and affected terminal outcome:
Smallest next evidence or owning handoff:
```

Rank by authority bypass, irreversible or duplicated effects, loss/corruption
of authoritative state, inability to terminate or recover, and then
observability or proof gaps. Do not turn a finding into a redesigned graph or
code patch.

Use exact installed skill names for a bounded handoff only after reporting the
finding: `design-workflow-graph` for an accepted redesign, `model-concurrency`
for a specific overlapping schedule, `audit-observability-path` for one named
signal gap, `design-verification-strategy` for proof design, or
`route-agent-models` for one unsupported or mismatched child route, or
`choose-workflow-control-model` when the core control-model choice is itself
unsupported. State the required input, missing evidence, and separate
authority for each handoff; do not invoke it or reproduce its method here.

## Report and stop

Lead with `audited`, `partially audited`, or `evidence-blocked`, and the
highest-severity supported finding. Then report:

1. **Scope and Evidence Boundary** — graph identity, scenario, sources,
   assumptions, and unknown runtime semantics.
2. **Graph and State Inventory** — nodes, edges, state owners, effects, gates,
   identities, terminals, and evidence classes.
3. **Verified Behavior versus Declared Design** — each material difference and
   unknown.
4. **Ranked Findings** — reachability, guards, terminal paths, cycles, replay,
   side effects, state, fanout, agent routes, authority, observability, and
   proof.
5. **Coverage Assessment** — invariant-to-oracle map and missing cases.
6. **Bounded Next Evidence and Handoffs** — smallest safe discriminating step,
   no redesign or implementation.

Stop after the report. The audit does not authorize graph changes, tests,
replays, instrumentation, remediation, or operational action.

## Examples and counterexamples

**Example finding:** `critical` — a timeout edge returns from “send payment” to
“ready” without a durable external-effect identity. A retry can submit twice
after an ambiguous acknowledgment. The report labels current provider behavior
unknown and hands a narrowly stated schedule to `model-concurrency`.

**Example finding:** `high` — dynamic children are merged only when all
expected children succeed, but the graph has no child deadline or failed-child
terminal edge. A parent can remain nonterminal forever.

**Counterexample:** A documented retry loop is not a finding merely because it
is cyclic when source and runtime evidence show a decreasing attempt budget,
idempotent effect key, defined failure terminal, and a discriminating test.
