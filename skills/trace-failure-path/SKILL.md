---
name: trace-failure-path
description: Trace how a concrete failure originates, propagates, is translated, retried, suppressed, recovered, recorded, and surfaced across code and system boundaries. Use when diagnosing error handling, retry storms, duplicate work, timeouts, fallbacks, circuit breakers, dead letters, partial failures, user-visible errors, or missing alerts in synchronous or asynchronous flows; produce an evidence-backed failure graph with source locations, state effects, terminal outcomes, and explicit unknowns.
license: MIT
metadata:
  author: William Cygan
  version: "0.1.0"
---

# Trace a Failure Path

Trace one concrete failure from initiating condition through propagation,
state effects, recovery machinery, operator evidence, and terminal outcome.
Separate the earliest supported cause from downstream symptoms.

## Preserve the authority boundary

Treat requests to trace, diagnose, explain, map, or audit as read-only. Do not
modify error handling, retry policy, timeouts, instrumentation, alerts, or
state unless the user asks for a fix. Inspect repository instructions and dirty
state before running commands.

Do not inject faults into production or shared systems, replay messages, force
retries, delete state, or call external dependencies to prove a path without
explicit authority. Prefer existing failures, focused local tests, fixtures,
and static evidence. If an experiment is needed, define its isolation,
side effects, stop conditions, and cleanup before proposing it.

## Define one failure scenario

Specify:

- **Operation:** the request, event, job, transaction, or user action in scope.
- **Failure trigger:** exception, invalid input, timeout, cancellation,
  dependency response, resource exhaustion, process loss, or another concrete
  condition.
- **Variant:** attempt number, lifecycle state, feature flag, deployment mode,
  or concurrency condition.
- **Expected contract:** what success and failure are supposed to mean at the
  initiating boundary.
- **Terminal question:** user result, durable state, retry exhaustion, dead
  letter, compensation, alert, or another stopping condition.

If the symptom is known but the trigger is not, start at the symptom and trace
backward until reaching the earliest supported cause. Keep competing causes
separate until evidence discriminates among them.

## Establish evidence

1. Read repository instructions and locate the operation's entrypoint.
2. Find the earliest error, return value, timeout, cancellation, or invalid
   state relevant to the scenario.
3. Inspect error types, catch and recovery blocks, middleware, transport
   mapping, task runners, retry configuration, transaction boundaries, and
   failure tests.
4. Use existing logs, traces, metrics, workflow histories, dead-letter
   metadata, or incident artifacts when authorized and available.
5. Record each failure hop while investigating, including state before and
   after the hop.

Classify every material claim as:

- **observed:** demonstrated by current runtime evidence;
- **verified:** directly established in source or executable configuration;
- **declared:** stated by a contract, policy, manifest, or documentation;
- **inferred:** supported indirectly but not proven; or
- **unknown:** ambiguous or hidden behind an unavailable boundary.

Preserve the earliest causal evidence. Repeated SDK, framework, or transport
errors may all be consequences of one earlier failure.

## Trace the failure chain

Follow these stages when present:

    trigger -> detection -> local handling -> translation -> propagation
    -> state effect -> retry or recovery -> operator/user surface -> terminal outcome

For each stage, record:

- component and source location;
- input state and triggering condition;
- error type, status, result, or signal;
- whether the failure is thrown, returned, logged, suppressed, wrapped,
  translated, retried, or converted to data;
- durable and external side effects already completed;
- cleanup, rollback, compensation, or cancellation;
- retry owner, attempt policy, and idempotency mechanism;
- visible log, metric, span, audit, alert, or user response; and
- next state and possible continuation.

Trace asynchronous delivery, acknowledgment, retry, and dead-letter operations
as distinct hops. A successful enqueue is not proof of successful processing.

## Analyze boundaries and partial outcomes

At each process, transport, or state boundary, determine:

1. which side detects the failure;
2. which side owns timeout and cancellation;
3. how errors are serialized or translated;
4. whether the caller knows the remote outcome;
5. what was committed before the failure;
6. whether retry can duplicate completed work;
7. whether fallback changes correctness or only availability; and
8. what terminal condition stops recovery.

Read `references/resilience-patterns.md` for timeouts, retries, circuit
breakers, transactions, outboxes, sagas, dead letters, leases, and
cancellation.

For fan-out, track every branch whose state can diverge. Distinguish all-or-none
failure, tolerated partial success, orphaned work, and delayed convergence.

## Build the failure graph

Use a sequence diagram when temporal order, timeouts, or retries dominate. Use
a flowchart when translation, branching, fallback, or terminal outcomes
dominate. Use a state diagram when durable recovery states are central.

Read `references/failure-model.md` for failure nodes, edges, outcome states,
evidence annotations, and diagram guidance.

Show:

- the normal path only as much as needed to understand divergence;
- the initiating fault or earliest known symptom;
- every error translation and retry boundary;
- commits and irreversible side effects;
- retry loops with explicit limits;
- fallback, compensation, dead-letter, or abandonment; and
- user and operator surfaces.

Never draw a retry loop without its owner and stop condition.

## Evaluate correctness

Check for:

- retries at multiple layers multiplying attempts;
- a timeout shorter than the work it governs;
- non-idempotent work retried after an ambiguous outcome;
- swallowed errors or success responses after failed side effects;
- state committed before a later mandatory action;
- failed cleanup masking the original cause;
- cancellation that does not reach child work;
- fallbacks that silently return stale or incomplete data;
- dead-letter or terminal states with no recovery owner;
- high-cardinality or secret-bearing error telemetry; and
- user-visible messages that lose the actionable cause or leak internals.

Do not label a pattern defective solely because it exists. Tie concerns to the
selected scenario, contract, and supported state transitions.

## Verify the trace

Walk forward from the trigger and backward from the terminal outcome. Confirm:

- every catch, translation, retry, and suppression edge used by the scenario;
- attempt counts across nested retry layers;
- commit, acknowledgment, and cancellation ordering;
- final durable state for every material component;
- observability claims against actual emitted signals; and
- explicit labels on inferred and unknown segments.

When safe local failure tests exist, use the narrowest test that proves the
branch. Do not call a simulated unit failure proof of distributed recovery.

## Report

Lead with the earliest supported cause, terminal outcome, and highest-risk
state effect. Then provide:

1. **Scenario:** operation, trigger or symptom, variant, expected contract, and
   scope.
2. **Failure visualization:** Mermaid or compact text graph.
3. **Failure ledger:** from state, failure or handling edge, to state, evidence,
   evidence class, attempt, and side effect.
4. **Recovery semantics:** timeout, cancellation, retry, backoff, fallback,
   rollback, compensation, dead letter, and ownership.
5. **Surfaces:** user response, logs, metrics, traces, audits, and alerts.
6. **Risks:** ambiguity, duplication, partial state, missing terminal handling,
   or hidden causes.
7. **Unknowns and next evidence:** smallest safe proof needed for each gap.

If the user asked only for diagnosis, stop after the evidence-backed report.
Implement a fix only when requested.

## Examples

- Trace a request timeout through client retry, server continuation, duplicate
  writes, and the final user response.
- Explain how a consumer exception becomes a retry, then a dead-letter item,
  and whether operators are alerted.
- Trace partial failure across parallel downstream calls and determine which
  results or state survive.
