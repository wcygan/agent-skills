# Data Boundaries

Use this reference to inspect how data identity, meaning, ownership, and
lifecycle change at common system boundaries.

## Contents

- APIs and RPC
- Events, queues, and streams
- Transactional stores
- Caches and indexes
- Files and object storage
- Analytics and machine-learning systems
- Logs, metrics, traces, and audits
- External providers
- Lifecycle checklist

## APIs and RPC

Compare the producer-side domain model, serialized request or response,
contract schema, server validation, and consumer-side model. Check:

- omission versus explicit null;
- defaults applied on either side;
- type or unit conversion;
- version negotiation and tolerant-reader behavior;
- authentication and tenant scoping;
- pagination, truncation, and filtering; and
- generated-code inputs versus generated output.

An API contract proves the permitted shape, not that every field is populated
or consumed in the selected scenario.

## Events, queues, and streams

Identify event type and version, serialization, topic or queue, routing key,
partition key, producer, subscriptions, filters, consumer deserialization, and
dead-letter behavior.

Record whether payloads are full facts, deltas, references, or commands.
Establish event-time versus processing-time semantics, ordering, duplication,
replay, schema evolution, and how consumers correlate updates.

Do not infer a consumer from a similarly named handler without subscription or
registration evidence.

## Transactional stores

Inspect migrations or schema definitions, query builders or SQL, mappings,
constraints, triggers, generated columns, views, and transaction boundaries.
Distinguish logical fields from physical columns and durable commit from an
in-memory mutation.

For change-data capture, outbox, or polling, represent database write and later
publication as separate hops. Record checkpoint or cursor ownership.

## Caches and indexes

Treat caches and search indexes as derived unless evidence grants authority.
Record key construction, value shape, population, invalidation, TTL, refresh,
miss behavior, and stale-read behavior.

For indexes, record analyzers or normalization that change searchable meaning.
For materialized views, record refresh mechanism and freshness expectations.

## Files and object storage

Record path or key construction, format, compression, partitioning, manifest or
catalog registration, overwrite versus append behavior, encryption boundary,
retention, and consumers. A file write is not proof that a downstream catalog
or reader has discovered it.

## Analytics and machine-learning systems

Trace source extraction, filters, joins, windows, late data, deduplication,
feature generation, training or inference snapshots, and publication. Record
which timestamp drives each operation and whether historical recomputation can
change prior outputs.

Do not present a dashboard definition as proof of source correctness. Follow
the metric to its base facts and filters.

## Logs, metrics, traces, and audits

Treat telemetry as a secondary exposure of application data. Record fields,
labels, attributes, redaction, sampling, retention, and access scope when the
selected data may appear there.

Avoid copying actual sensitive values into the lineage artifact. Search by
field names, structural metadata, or safely redacted samples.

## External providers

Stop at the documented contract when provider internals are unavailable.
Record the operation, transmitted fields, regional or account boundary if
known, returned identifiers, webhook or callback path, retention promises that
are explicitly declared, and deletion interface.

Do not turn vendor documentation into observed runtime behavior. Keep it
declared unless current evidence proves the configured integration.

## Lifecycle checklist

For every materialized copy, ask:

1. Who owns correctness?
2. What creates and updates it?
3. How can it become stale?
4. How is it rebuilt or backfilled?
5. What corrects historical errors?
6. What deletes or expires it?
7. Does deletion propagate to replicas, backups, exports, and telemetry?
8. What contract allows consumers to interpret its version?

Mark missing answers explicitly when they affect the lineage question.
