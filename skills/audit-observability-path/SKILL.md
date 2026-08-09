---
name: audit-observability-path
description: Audit whether one request, event, job, or state change can be followed across an application or distributed system using logs, metrics, traces, correlation identifiers, audit records, and operational artifacts. Use when investigating observability blind spots, broken trace propagation, weak log context, missing service-level signals, noisy alerts, unmeasurable failure paths, or incidents that cannot be reconstructed; produce an evidence-backed signal map, gap analysis, and prioritized instrumentation plan.
license: MIT
metadata:
  author: William Cygan
  version: "0.1.0"
---

# Audit an Observability Path

Audit whether one concrete scenario can be detected, followed, explained, and
reconstructed across its relevant code and system boundaries.

## Preserve the authority boundary

Treat requests to audit, assess, inspect, map, or recommend as read-only. Do not
add instrumentation, change sampling or retention, edit dashboards or alerts,
or deploy collectors unless the user asks for implementation. Inspect
repository instructions and dirty state before running commands.

Prefer source, configuration, existing local runs, and authorized read-only
telemetry. Logs, traces, metrics, and audit records can contain sensitive data;
query the smallest scope, avoid copying values unnecessarily, and redact
secrets, tokens, personal data, and private endpoints from outputs.

Do not generate production traffic, trigger failures, widen telemetry access,
or raise ingestion cost merely to prove coverage. State the missing runtime
proof and the smallest safe validation that would obtain it.

## Define one diagnostic scenario

Specify:

- **Trigger:** request, event, command, job, timer, deployment, or state change.
- **Expected path:** the minimum set of services, asynchronous hops, and
  resources required to answer the question.
- **Outcome:** success, failure, latency, state transition, or user-visible
  result that must be observable.
- **Diagnostic questions:** for example where time was spent, why work failed,
  whether it retried, which tenant or record was affected, or who changed
  state.
- **Environment and time window:** only when runtime evidence is in scope.
- **Constraints:** privacy, cardinality, sampling, cost, access, and retention.

If no path is supplied, reconstruct the narrow scenario path from source and
configuration. Do not turn the task into a whole-platform observability audit.

## Establish the expected path

1. Read repository instructions and locate the scenario entrypoint.
2. Identify process, transport, asynchronous, and state boundaries.
3. Record the identifiers available before and after each boundary.
4. Identify success, failure, retry, and terminal outcomes important to the
   diagnostic questions.
5. Treat this expected path as the coverage baseline, not as observed runtime.

For a deep execution analysis, a separate codepath trace may be useful, but
keep this audit focused on the signals that prove and explain the selected
path.

## Inventory signal production

For every material hop, inspect:

- logs and structured fields;
- metrics, labels, units, and aggregation;
- spans, events, attributes, status, and links;
- trace, request, event, job, workflow, tenant, and domain identifiers;
- audit records and actor, action, target, result, and timestamp;
- runtime histories, dead-letter metadata, profiles, or evidence artifacts;
- dashboards, alerts, queries, and runbooks that consume those signals; and
- sampling, filtering, redaction, routing, retention, and access controls.

Record where a signal is created, enriched, propagated, exported, stored, and
consumed. Configuration proves intent; current telemetry proves emission and
availability.

Classify every claim as:

- **observed:** demonstrated in current telemetry or a controlled run;
- **verified:** directly established in source or executable configuration;
- **declared:** stated by a schema, dashboard, alert, runbook, or docs;
- **inferred:** supported indirectly but not proven; or
- **unknown:** unavailable, ambiguous, sampled away, or hidden behind a
  boundary.

Read `references/signal-model.md` for signal roles, evidence fields, and what
each telemetry type can and cannot prove.

## Trace correlation across boundaries

At each hop, determine:

1. which identifier represents the end-to-end operation;
2. which identifiers represent attempts, messages, tasks, records, and users;
3. how context is injected, serialized, extracted, and validated;
4. whether fan-out creates child relationships or only shared labels;
5. whether asynchronous work uses parent-child, span links, or explicit
   causation fields;
6. whether retries reuse operation identity while creating distinct attempts;
7. whether logs, metrics, traces, and audits can be joined safely; and
8. where correlation is lost, ambiguous, or high-cardinality.

Do not assume matching timestamps or string values prove causality. Do not use
domain identifiers as metric labels when their cardinality is unbounded.

Read `references/correlation-and-gaps.md` for propagation, async handoffs,
sampling, privacy, cardinality, alerts, and common blind spots.

## Evaluate diagnostic quality

Test the inventory against the selected questions:

- **Detection:** can an operator know the outcome is unhealthy?
- **Localization:** can evidence identify the failing or slow hop?
- **Causality:** can related work be joined without guesswork?
- **Explanation:** do signals preserve the earliest error and relevant state?
- **Outcome:** can evidence establish user result and durable side effects?
- **Recovery:** can retries, cancellation, fallback, dead letter, and
  compensation be reconstructed?
- **Ownership:** do alerts and runbooks lead to the responsible component?
- **Safety:** are sensitive fields redacted and access appropriately bounded?
- **Reliability:** can sampling, buffering, clock skew, exporter failure, or
  retention erase required evidence?

Presence is not usefulness. A log line without stable context, a span without
status, a metric without units, or an alert without an actionable owner may not
answer the diagnostic question.

## Rank gaps

For each gap, record:

- diagnostic question that cannot be answered;
- exact missing or ambiguous signal;
- affected hop or boundary;
- current workaround and its cost;
- incident or operational consequence;
- proposed smallest signal or propagation change;
- privacy, cardinality, volume, and maintenance cost;
- validation method; and
- evidence class.

Prioritize gaps that block detection of severe outcomes, break end-to-end
correlation, hide the earliest cause, or make recovery unverifiable. Discount
generic telemetry additions that do not answer a named question.

## Recommend instrumentation

When recommendations are requested, prefer:

1. preserve and propagate an existing stable operation identifier;
2. add structured context at the boundary where it is first known;
3. retain the earliest error and terminal outcome;
4. add one bounded metric for detection or an SLO claim;
5. add spans or links at missing causal boundaries;
6. make retries and attempts distinguishable;
7. connect alerts to ownership and a diagnostic query; and
8. document a short reconstruction path.

Specify signal name, location, attributes, units, cardinality bounds, sampling,
redaction, retention, consumer, and proof. Do not recommend logging entire
payloads or adding identifiers with unbounded metric cardinality.

Implement instrumentation only when asked. Reuse the repository's existing
telemetry libraries, naming, context propagation, and test utilities.

## Verify the audit

Walk the expected path and confirm:

- every material boundary has a correlation mechanism or a visible gap;
- success and relevant failure outcomes have distinguishable evidence;
- retries and fan-out do not collapse into one misleading operation;
- signal production, export, storage, query, dashboard, and alert stages are
  not conflated;
- current-runtime claims use current evidence rather than source alone; and
- every recommendation answers a named diagnostic question.

When safe fixtures or local integrated scenarios exist, use the smallest one
that exercises the relevant boundary. Do not call local exporter output proof
of production retention, sampling, or alert delivery.

## Report

Lead with which diagnostic questions can and cannot be answered. Then provide:

1. **Scenario and expected path:** trigger, outcome, boundaries, environment,
   and constraints.
2. **Signal map:** flowchart or sequence view of signal and context propagation.
3. **Coverage ledger:** hop, diagnostic need, signal, identifier, producer,
   consumer, evidence, and evidence class.
4. **Correlation assessment:** operation, attempt, message, task, domain, and
   actor identities across boundaries.
5. **Gap backlog:** ranked by operational consequence and diagnostic value.
6. **Instrumentation contracts:** smallest proposed additions with safety and
   cost bounds.
7. **Validation and unknowns:** what was proven, what remains configuration-only,
   and the next safe runtime evidence.

## Examples

- Determine whether one API request can be followed through a queue, worker,
  database write, and notification.
- Audit why retry attempts appear as separate incidents and cannot be joined to
  the initiating request.
- Assess whether operators can detect and explain a stalled scheduled job
  without querying application state manually.
