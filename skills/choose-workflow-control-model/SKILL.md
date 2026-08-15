---
name: choose-workflow-control-model
description: "Choose a control model for one bounded workflow: deterministic code, DAG, cyclic state graph, dynamic graph, simple agent loop, or multi-agent workflow. Use when orchestration, retries, state, approvals, agent discretion, fanout, recovery, or coordination make the workflow shape uncertain; produce a read-only Control Model Decision Record with evidence, rejected alternatives, and explicit authority boundaries."
license: MIT
metadata:
  author: William Cygan
  version: "0.1.0"
---

# Choose a Workflow Control Model

Choose the smallest control model that can enforce the workflow's required
behavior. Produce one evidence-backed **Control Model Decision Record** (CMDR),
then stop before design or implementation.

## Authority and boundary

This is a read-only decision workflow. Inspect instructions, source, contracts,
existing runtime history, tests, configuration, and authorized operational
artifacts. Do not alter code, prompts, tools, schedules, workflow definitions,
state, policies, or external systems.

Select one bounded scenario: a request, job, business process, recurring task,
or state transition. If the scenario, policy owner, or authority boundary is
unclear, record the decision needed and return a `decision-blocked` CMDR. Do
not select a model by diagram preference, framework familiarity, or a generic
desire to use agents.

Classify material claims as `observed`, `verified`, `declared`, `inferred`, or
`unknown`. A declared design is not proof of runtime behavior.

## Model set and decision rule

Compare only these models. A candidate is viable only if it can enforce every
required invariant, policy gate, state transition, and recovery behavior under
the stated runtime assumptions.

| Model | Choose it when | Its boundary |
| --- | --- | --- |
| **Deterministic code** | Inputs, policy, steps, and failure handling are known; a fixed procedure can enforce them. | No graph or agent discretion is needed. |
| **DAG** | Independent bounded steps have a known acyclic dependency order and terminal join. | No state-dependent revisit is required. |
| **Cyclic state graph** | Named durable state and explicit guarded revisits are necessary to reach a bounded terminal state. | Every cycle needs a progress measure and terminal escape. |
| **Dynamic graph** | Runtime data legitimately determines a bounded set of nodes or joins. | Fanout cardinality and merge semantics must be explicit. |
| **Simple agent loop** | A bounded model judgment is needed repeatedly, while one owner can evaluate progress and enforce policy. | The loop cannot turn discretion into authority. |
| **Multi-agent workflow** | Distinct actors need independently reviewable responsibilities, coordination, and integration. | Ownership, shared state, and final acceptance must be explicit. |

Prefer deterministic code when a rule can be stated and evaluated without
judgment. Prefer a DAG over a cyclic graph when state never needs to revisit a
decision. Add dynamic fanout only when a fixed graph cannot represent a known
bounded runtime cardinality. A graph is a control model, not a visual aid.

Explicitly reject graph overengineering for open-ended investigation,
brainstorming, drafting, or one-off work whose next useful action is discovered
from new evidence rather than a stable transition contract. In those cases,
state the human or simple bounded process that should choose the next action.

Explicitly reject agent discretion where deterministic policy, eligibility,
authorization, spending, data release, approval, or safety gates are required.
Place those gates in deterministic code or a named human authority; an agent
may prepare evidence but cannot decide the gate.

Model diversity, model price, or model availability alone does not justify a
multi-agent workflow. Require distinct responsibilities, context boundaries, or
independent evidence that one bounded agent loop cannot provide.

## Build the decision record

### 1. Establish the workflow contract

Record the scenario in this form:

```text
Scenario and outcome:
Entry conditions and inputs:
Required terminal states:
Invariants and prohibited outcomes:
Policy and approval gates with authoritative owner:
State and durability requirements:
External effects and idempotency boundary:
Runtime variability and expected cardinality:
Failure, cancellation, and recovery requirements:
Observability identities and required evidence:
Cost and latency constraints:
Agent-route, context, tool, and privacy constraints:
Non-goals and authority boundary:
```

The contract is complete when a candidate model can be disproven against it.
Use stable terms: **state** is information carried between transitions;
**progress** is a measurable reduction in remaining work or satisfaction of a
named acceptance condition; a **terminal state** permits no further normal
transition; an **authority gate** is a deterministic or human decision that
must precede a side effect.

### 2. Identify the control pressure

For each requirement, explain which pressure it creates:

- fixed sequence, dependency order, or parallel join;
- state-dependent revisit, retry, or compensation;
- runtime fanout and fanin;
- uncertain classification, drafting, or selection;
- deterministic policy or human approval;
- durable checkpoint, resume, cancellation, or replay;
- independently acting owners; or
- route capability, latency, cost, privacy, or observability constraints.

Do not promote an implementation detail to a control pressure. A queue,
function, model call, or diagram alone does not justify a graph.

### 3. Evaluate candidates

For every plausible model, record:

```text
Candidate:
Fit to the workflow contract:
Required assumptions and runtime semantics:
How policy and authority gates are enforced:
State, durability, retry, cancellation, and recovery behavior:
Observability and identity consequences:
Cost and latency consequences:
Decision: selected | rejected | unresolved
Reason and evidence:
```

Reject a candidate at the first unmet required property. Do not claim a graph
solves durability, idempotency, observability, or authorization merely because
it can name nodes.

### 4. Select and bound the model

Choose one selected model and state its minimal control contract:

- deterministic code: procedure, inputs, error handling, and named authority
  gates;
- DAG: nodes, dependencies, join, failure boundary, and terminal outputs;
- cyclic state graph: state owner, guarded edges, progress measure, retry and
  cancellation limits, and terminal states;
- dynamic graph: fanout source, maximum cardinality, child identity, merge
  rule, backpressure, and partial-failure policy;
- simple agent loop: judgment input/output contract, deterministic evaluator,
  bounded iterations, progress rule, and escalation gate; or
- multi-agent workflow: actor ownership, shared-resource boundary, dependency
  contract, integration owner, route policy, child-spawn bound, and acceptance
  evidence.

If selection needs a product or policy decision, retain the viable options and
return `decision-blocked`; do not invent a default.

## Report the CMDR and stop

Lead with `selected`, `decision-blocked`, or `evidence-blocked`. Then report:

1. **Workflow Contract** — scenario, terminal outcomes, invariants, authority,
   state, recovery, observability, and constraints.
2. **Control Pressures** — each requirement and the model capability it needs.
3. **Candidate Comparison** — viable and rejected models with evidence.
4. **Selected Control Model** — minimal control contract and assumptions.
5. **Rejected Alternatives** — including any graph-overengineering or
   agent-authority rejection.
6. **Design Boundary** — the next artifact required and unresolved decisions.

Stop before creating nodes, edges, schemas, implementation tasks, or tests.
If the selected model is a graph, hand off the CMDR to
`design-workflow-graph`. If it is not a graph, name the appropriate owner or
workflow without recreating another skill's procedure. Route an accepted
multi-agent workflow to `multi-agent-orchestration`, with `route-agent-models`
for each selectable agent route.

## Examples and counterexamples

**Example — cyclic state graph:** A durable intake must validate a record,
request a human exception when policy denies it, retry a transient enrichment,
and resume after restart. The record chooses a cyclic state graph because the
named state, bounded retry, human gate, and terminal outcomes are all required.

**Counterexample — deterministic code:** A nightly report has fixed inputs,
three ordered transformations, and one authorization check. Deterministic code
with explicit error handling is the selected model; a DAG or agent adds no
required control.

**Counterexample — open-ended work:** Investigating why a user journey feels
slow has no stable transition set or known terminal evidence. Do not force a
graph; use a bounded diagnostic process and revisit the decision when the
workflow contract becomes known.
