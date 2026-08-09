# Signal Model

Use this reference to distinguish the roles and proof limits of logs, metrics,
traces, audits, and runtime artifacts.

## Signal roles

| Signal | Best suited for | Does not prove by itself |
|---|---|---|
| log | detailed local event and error context | complete request path or aggregate health |
| metric | bounded aggregate rate, level, duration, or distribution | individual causality or detailed error context |
| trace | causal and temporal relationships across operations | unsampled population totals or durable business truth |
| audit | durable actor-action-target-result accountability | performance health or full internal execution |
| runtime history | scheduler, workflow, queue, or platform state transitions | application intent outside recorded operations |
| profile | aggregate resource use and hot paths | business outcome or individual request correctness |
| artifact | reproducible test output, report, dump, or evidence bundle | deployed runtime behavior unless captured there |

Use multiple signal types when the question genuinely spans detection,
localization, explanation, and accountability.

## Coverage ledger

Record:

| Field | Content |
|---|---|
| hop | code, service, boundary, or resource |
| question | diagnostic claim the signal must answer |
| signal | name and type |
| identity | operation, attempt, message, task, domain, actor, or resource key |
| producer | exact instrumentation location |
| pipeline | exporter, collector, store, filter, and sampling when relevant |
| consumer | query, dashboard, alert, runbook, or audit review |
| safety | redaction, access, retention, and cardinality |
| evidence | source, configuration, current sample, or test |
| class | observed, verified, declared, inferred, or unknown |

Keep pipeline stages separate. Instrumented code does not prove successful
export, storage, retention, queryability, or alert delivery.

## Logs

Inspect event name, severity, message stability, structured fields, error
identity, operation and attempt identifiers, timestamps, sampling, redaction,
and destination. Preserve the earliest error instead of logging only a final
generic wrapper.

Avoid duplicate logging at every layer. Prefer one authoritative error record
plus contextual propagation unless distinct ownership boundaries need their
own evidence.

## Metrics

Require a meaningful name, type, unit, aggregation, bounded labels, and
interpretation. Distinguish counters, gauges, histograms, and state sets.
Check whether resets, aggregation, or missing zeroes affect queries.

Metrics should support a detection or service-level claim. Per-user, per-request,
raw URL, exception message, or unbounded resource identifiers usually do not
belong in labels.

## Traces

Inspect span boundaries, parent-child relationships, links, attributes, events,
status, errors, resource identity, sampling, and propagation. A span should
represent useful work or a boundary, not every trivial function.

For messaging, links may represent causal relationships better than forcing a
single parent when batches, fan-out, or delayed processing are involved.

## Audit records

Establish actor, action, target, authorization context, result, reason,
timestamp, source, immutability expectation, retention, and access. Audit
records should represent security or business accountability, not duplicate
debug logs.

Separate attempted, authorized, committed, and later compensated actions.

## Evidence strength

Use:

- **observed** for a current safely obtained signal;
- **verified** for emission or propagation proven in executable code or config;
- **declared** for dashboards, alerts, schemas, and runbooks not runtime-tested;
- **inferred** for likely joins or coverage; and
- **unknown** when sampling, pipeline state, access, or retention prevents proof.

State the time window and environment for runtime evidence. An old sample does
not establish current coverage.
