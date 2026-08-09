# Correlation and Gaps

Use this reference to inspect identity propagation and prioritize
observability gaps across boundaries.

## Contents

- Identity layers
- Synchronous propagation
- Asynchronous propagation
- Common gaps
- Sampling and reliability
- Privacy and cardinality
- Alerts and operational consumption
- Gap-priority test

## Identity layers

Keep different identities distinct:

- **operation:** one end-to-end user or business intent;
- **attempt:** one execution or retry of an operation;
- **request:** one transport exchange;
- **message:** one published or delivered envelope;
- **task:** one scheduled or worker execution;
- **workflow:** one durable orchestration instance;
- **domain:** order, account, document, or another business entity;
- **actor:** user, service identity, administrator, or automation; and
- **resource:** deployment, host, process, queue, database, or region.

One identifier rarely serves every purpose safely. Record mappings explicitly.

## Synchronous propagation

Inspect injection, transport format, extraction, validation, context creation,
downstream injection, and response logging. Check gateways, proxies,
middleware, generated clients, and trust boundaries that may replace or reject
incoming identifiers.

Do not trust arbitrary caller-provided correlation identifiers for security
decisions. Preserve a trusted internal identity and record external identifiers
as separate context when needed.

## Asynchronous propagation

Inspect message attributes or payload fields, publish context, subscription,
consumer extraction, batch behavior, retry delivery, dead letters, and
republishing. Preserve operation identity across retries while assigning a
distinct attempt or delivery identity.

For fan-out and fan-in, record causation links. For batches, do not choose one
arbitrary parent if several operations contribute.

## Common gaps

Look for:

- a new identifier generated at every service;
- context dropped by a queue, scheduler, workflow, or background thread;
- logs that omit operation and attempt identity;
- traces that end at enqueue and never link to processing;
- retries indistinguishable from independent operations;
- only success metrics or only error logs;
- error translation that discards the earliest cause;
- missing terminal outcomes for abandoned or dead-lettered work;
- dashboards with signals but no path to individual evidence;
- alerts without owner, query, or runbook;
- instrumentation present but filtered, sampled, or not exported;
- inconsistent clocks or timestamps without event-time semantics; and
- retention shorter than the incident-detection delay.

Tie each gap to a diagnostic question rather than listing it generically.

## Sampling and reliability

Check head versus tail sampling, error and latency bias, parent-based decisions,
unsampled log correlation, collector buffering, backpressure, exporter failure,
and dropped-signal metrics. Important audits may require a durable record rather
than probabilistic tracing.

Do not infer absence of execution from absence of a sampled trace.

## Privacy and cardinality

Classify attributes before recommending them:

- safe bounded dimensions;
- sensitive but permitted structured context;
- secrets or credentials that must never be recorded;
- personal or tenant data requiring redaction and access controls; and
- unbounded identifiers suitable for logs or traces but not metric labels.

Specify redaction at the earliest practical boundary and account for exception
messages, URLs, SQL, headers, payloads, and baggage that may leak values.

## Alerts and operational consumption

For each alert, establish signal, query, threshold, evaluation window,
deduplication, severity, owner, notification route, runbook, diagnostic links,
and resolution condition. Verify whether the alert detects a user or business
outcome rather than only a local component symptom.

Do not treat a dashboard as an alert or a runbook as proof that required
signals exist.

## Gap-priority test

Prioritize a proposed change when it:

1. answers a named high-value diagnostic question;
2. covers a material boundary or terminal outcome;
3. reduces manual correlation or guesswork;
4. preserves useful cause and attempt identity;
5. has bounded volume, cardinality, and privacy risk;
6. fits existing telemetry conventions; and
7. can be validated with a representative safe scenario.

Prefer repairing context propagation over adding more disconnected log lines.
