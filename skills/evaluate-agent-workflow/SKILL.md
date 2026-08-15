---
name: evaluate-agent-workflow
description: Evaluate and diagnose one agent workflow across instructions, context, route selection, tools, orchestration, durable events, and user output. Use for surprising results, wrong child routes, tool misuse, model migrations, or state disagreements. Produce an evidence-backed layer classification and bounded evaluation plan.
license: MIT
metadata:
  author: William Cygan
  version: "0.1.0"
---

# Evaluate an Agent Workflow

Evaluate one concrete agent behavior across the complete execution path. Find
the earliest layer where observed behavior diverges from the intended contract,
then design the smallest evaluation that will detect the regression reliably.

## Preserve the authority boundary

Treat requests to evaluate, diagnose, inspect, compare, or recommend as
read-only. Do not change prompts, instructions, model configuration, tool
schemas, persistence, projections, provider settings, or production data unless
the user explicitly requests implementation.

Inspect repository instructions and dirty state before running commands.
Prefer saved requests, responses, transcripts, events, schemas, tests, and
isolated fixtures over new external calls. Do not replay tools that send
messages, create records, submit forms, spend money, expose private data, or
otherwise produce external effects merely to reproduce an agent result.

Redact credentials, tokens, private prompts, personal data, and sensitive tool
outputs. Record that redaction occurred when it limits the diagnosis.

## Define one evaluation question

Specify:

- **Scenario:** the user request and relevant starting state.
- **Expected behavior:** observable outcome or contract, not a preferred chain
  of thought.
- **Observed behavior:** exact output, tool action, state change, or omission.
- **Environment:** application version, parent and child routes, tool catalog,
  configuration, and time when relevant.
- **Evaluation question:** the single uncertainty to resolve.
- **Scope:** one turn, session, workflow, projection, or user journey.

Do not start with “the model failed.” A useful question is “At which layer did
the requested filter disappear?” or “Was the tool unavailable, unselected,
called incorrectly, rejected, lost from durable state, or rendered incorrectly?”

## Capture the execution envelope

Collect the smallest complete envelope needed to reproduce the behavior:

1. effective instructions and application-supplied context;
2. normalized user input and attachments;
3. requested, resolved, and effective model routes, parameters, feature flags,
   multi-agent backend, agent roles, and context-fork modes;
4. advertised tools, exact schemas, tool-choice controls, and availability;
5. model response items and tool-call arguments;
6. tool execution inputs, outputs, errors, timing, and side effects;
7. orchestration decisions, parent/child identities, retries, cancellations,
   result transport, and turn boundaries;
8. persisted events or workflow history;
9. projections, caches, API envelopes, and rendered output; and
10. the evaluator, expected result, and acceptance threshold already in use.

Record exact artifacts and source locations. If an artifact is unavailable,
mark the layer unknown rather than inferring it from a later representation.

Read `references/agent-evidence-model.md` for layer definitions, evidence
classes, and the divergence ledger.

When the scenario includes delegated work, invoke `route-agent-models` with the
observed task contract. Require its Route Record before comparing requested and
effective child behavior. Keep unavailable route evidence `unknown`.

## Reconstruct the artifact chain

Follow the scenario in causal order:

```text
input -> request envelope -> route request -> route resolution -> child run
      -> model response -> tool call -> tool result -> orchestration event
      -> durable event -> projection -> rendered result
```

Include only layers present in the system. Preserve raw artifacts where safe;
normalization, serialization, truncation, caching, and presentation can each
change meaning.

For every transition, record:

- producer and consumer;
- input and output representation;
- validation or filtering;
- identity, sequence, and attempt fields;
- persistence and retry semantics;
- relevant timestamps without treating timestamp order as causality; and
- whether the evidence is observed, verified, declared, inferred, or unknown.

## Find the earliest divergence

Compare the expected contract with evidence at each layer. Distinguish these
failure classes:

- **Input:** requested information was omitted, transformed, or truncated.
- **Capability:** a tool, schema, resource, or permission was absent or stale.
- **Routing:** provider, model, effort, role, context fork, backend, or fallback
  resolved differently from the task contract.
- **Selection:** the model did not choose an available appropriate action.
- **Argument:** the model emitted invalid, unsupported, or semantically wrong
  arguments.
- **Execution:** the tool or downstream dependency failed or returned the
  wrong result.
- **Orchestration:** routing, retries, cancellation, ordering, or state assembly
  changed the outcome.
- **Retention:** the correct event was not persisted or was read from stale
  state.
- **Projection:** a durable result was incorrectly reduced, joined, or cached.
- **Presentation:** the correct projected result was hidden, mislabeled, or
  rendered incorrectly.
- **Evaluation:** the oracle, fixture, grader, or threshold measured the wrong
  property.

The earliest supported divergence is the primary diagnosis. Later defects may
be consequences or independent findings; keep them separate.

## Test competing hypotheses

Maintain a short hypothesis ledger:

```text
hypothesis | supporting evidence | contradicting evidence | discriminating check | status
```

Change one variable at a time. Prefer deterministic replay below the model
boundary when testing orchestration, persistence, projections, or rendering.
Prefer recorded tool results when network freshness is not the question.

For model behavior, compare equivalent execution envelopes. Do not attribute a
difference to a model version when instructions, context, tool ordering,
schemas, provider settings, or application code also changed. Use repeated runs
only when stochastic stability is part of the claim, and record seeds or
sampling settings when supported.

For delegated behavior, hold task identity, role, context fork, tools,
permissions, parent state, and child-spawn policy constant. Separate route
resolution from the child's later decisions.

## Design a focused evaluation

Turn the diagnosed behavior into an evaluation contract:

- target behavior and prohibited behavior;
- frozen inputs and controlled dependencies;
- layer at which the assertion is made;
- authoritative oracle;
- positive, negative, boundary, and competing-action cases;
- deterministic checks and any repeated-run component;
- pass threshold and tolerated variance;
- captured artifacts for failure diagnosis; and
- requested, resolved, and effective route receipts when delegation matters;
- runtime, cost, data, and authority bounds.

Use the lowest layer that proves the defect and at least one higher-level case
that proves the user-visible contract when the change crosses layers. Do not
use exact prose matching for behavior whose semantics can be checked directly.

Read `references/evaluation-design.md` when selecting eval cases, oracles,
metrics, fixtures, and model-versus-system assertions.

## Implement only when requested

When the user asks to fix the workflow or add an eval:

1. repair the earliest defective layer;
2. preserve strict contracts and explicit failure handling;
3. add the focused regression evaluation first or with the fix;
4. avoid prompt changes that merely mask a schema or orchestration defect;
5. keep recorded fixtures scrubbed, minimal, and versioned deliberately;
6. run the narrow evaluation, then the relevant integrated path; and
7. report residual nondeterminism and unverified environments.

Do not weaken a tool schema, evaluator, or held-out oracle simply to make the
case pass.

## Verify the conclusion

Confirm that:

- the effective request and capability catalog match the tested claim;
- the requested, resolved, and effective child routes match or have an
  authorized fallback;
- tool availability, selection, argument validity, and execution are distinct;
- persisted state is inspected separately from API and UI projections;
- the earliest divergence has direct evidence;
- the proposed eval fails on the defective behavior and passes on the intended
  behavior, or the missing proof is stated;
- repeated runs are used only for a named stochastic property; and
- the conclusion does not depend on hidden reasoning or unavailable private
  model internals.

## Report

Lead with the earliest divergent layer and user-visible consequence. Then
provide:

1. **Scenario and contract:** input, expected behavior, observed behavior, and
   environment.
2. **Artifact timeline:** causal chain across model, tool, orchestration,
   durable state, projection, and UI.
3. **Divergence ledger:** expected versus observed at each relevant layer.
4. **Diagnosis:** primary failure class, supporting evidence, competing
   hypotheses, and confidence.
5. **Evaluation contract:** fixtures, cases, oracle, threshold, and artifacts.
6. **Recommended change:** smallest responsible layer and validation sequence.
7. **Unknowns:** missing evidence and the safest next discriminating check.

## Examples

- Determine why an agent repeatedly calls one provider even though several
  tools appear in the UI.
- Diagnose whether an unsupported search field came from the model, a permissive
  schema, or a server that silently discarded unknown keys.
- Compare behavior before and after a model migration while holding prompts,
  tool schemas, fixtures, and orchestration constant.
- Explain why a successful tool result exists in workflow history but is absent
  from the transcript or rendered answer.
- Explain why a child inherited the parent route when the dispatch requested a
  different model, role, or reasoning effort.
