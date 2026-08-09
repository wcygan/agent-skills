---
name: trace-data-lineage
description: Trace a selected field, record, event, or dataset from origin through validation, transformation, transport, persistence, projection, and exposure. Use when determining where data comes from, who owns it, how its meaning or shape changes, where it is copied, which consumers depend on it, or where sensitive data can flow across modules, services, queues, databases, caches, files, analytics systems, and external APIs; produce evidence-backed lineage with source locations and explicit gaps.
license: MIT
metadata:
  author: William Cygan
  version: "0.1.0"
---

# Trace Data Lineage

Trace one selected data concept through its lifecycle. Preserve identity,
meaning, ownership, transformations, and copies across code and system
boundaries.

## Preserve the authority boundary

Treat requests to trace, map, explain, audit, or identify lineage as read-only.
Do not change schemas, migrations, instrumentation, retention, access policy,
or documentation unless the user asks for implementation. Inspect repository
instructions and dirty state before running commands.

Prefer schema, source, configuration, and existing read-only evidence. Do not
query production records, export customer data, replay events, or inspect
secret values merely to prove lineage. Work from structure and redacted
metadata whenever possible. If runtime values are necessary, state the minimum
safe query or sample and obtain the required authority separately.

## Define the lineage question

Select one lineage unit:

- a field or nested property;
- a domain entity or record;
- an event or message attribute;
- a file, object, dataset, or materialized result; or
- a derived metric or aggregate.

Then define:

- **Origin:** where the value first enters or is created.
- **Sink:** the consumer, store, API, report, decision, or deletion point of
  interest.
- **Direction:** backward to origin, forward to consumers, or end to end.
- **Identity rule:** how the data is matched across names, schemas, keys, and
  formats.
- **Variant:** tenant, version, feature flag, lifecycle state, or deployment
  mode that changes the path.
- **Question:** provenance, ownership, correctness, privacy, migration impact,
  staleness, or another concrete concern.

If the request names only a field, first identify its semantic meaning and
scope. Do not merge unrelated fields merely because their names match.

## Establish evidence

1. Read repository instructions and identify authoritative schemas,
   generated-code inputs, migrations, and deployment configuration.
2. Locate the selected data in contracts, models, validation, serializers,
   queries, mappings, and tests.
3. Trace both backward toward its source and forward toward its consumers.
4. Inspect runtime registration, routing, connectors, jobs, and infrastructure
   when they determine where data actually moves.
5. Use existing catalog, query-plan, trace, or sample metadata when safe and
   available.
6. Record lineage edges as they are discovered.

Classify each material claim as:

- **observed:** demonstrated by current runtime or data-plane evidence;
- **verified:** directly established in source or executable configuration;
- **declared:** stated by a schema, contract, catalog, manifest, or docs;
- **inferred:** supported indirectly but not proven; or
- **unknown:** ambiguous or hidden behind an unavailable boundary.

Treat matching names as search leads, not lineage proof. Generated models can
establish shape while their generator inputs remain the authority.

## Trace identity and meaning

At every hop, record:

- logical name and physical name;
- type, nullability, units, encoding, and cardinality;
- identifiers used to correlate records;
- domain meaning and invariants;
- producer and authoritative owner;
- freshness or event-time semantics;
- version and compatibility behavior; and
- sensitivity or access classification when evident.

Flag semantic drift even when types remain compatible. Examples include a
timestamp changing from event time to processing time, money changing units,
an absent value becoming an empty value, or an identifier becoming
tenant-scoped.

Read `references/lineage-model.md` for the node, edge, transformation, and
diagram vocabulary.

## Follow transformations and copies

For each hop, determine whether it:

- validates, rejects, defaults, or coerces;
- renames, retypes, parses, serializes, or encodes;
- normalizes, enriches, joins, filters, redacts, or hashes;
- aggregates, deduplicates, samples, or windows;
- splits one concept into several or combines several concepts;
- persists an authoritative copy;
- materializes a cache, index, projection, snapshot, or analytical copy; or
- exposes data through an API, event, export, log, metric, or user interface.

Record the responsible code, query, mapping, or configuration. State whether
the transformation is lossless, lossy, reversible, deterministic, and
versioned when those properties matter.

Distinguish movement of the selected value from movement of a containing
object. Do not claim a field crosses a boundary merely because the broader
record type can contain it.

## Resolve boundaries and ownership

At a service or resource boundary, establish:

1. the producer-side representation;
2. the contract or serialization that crosses the boundary;
3. routing and destination selection;
4. the consumer-side representation;
5. validation, defaulting, and compatibility behavior;
6. authoritative versus derived ownership; and
7. retention, deletion, or replication behavior relevant to the question.

Read `references/data-boundaries.md` when tracing APIs, events, databases,
caches, search indexes, object storage, analytics systems, logs, metrics, or
external providers.

If another repository or managed system is unavailable, stop at the contract
and label the continuation unknown. Do not infer undocumented internals.

## Check lifecycle and control

For material stores and exposures, determine:

- how data is created, corrected, superseded, and deleted;
- whether updates are mutable, append-only, or event-derived;
- how backfills, replays, and schema migrations affect old values;
- whether caches and projections can become stale;
- whether deletion propagates to copies;
- whether logs, traces, metrics, and backups create secondary retention; and
- which system is authoritative for access control and uniqueness.

Do not present a cache, index, warehouse, or search projection as the source of
truth unless repository evidence explicitly grants it that role.

## Verify the lineage

Walk the result in both directions:

- every sink must have a supported upstream source;
- every source-side transformation must lead to a named output or rejection;
- joins and aggregates must name all material inputs;
- aliases must preserve a documented identity rule;
- authoritative and derived copies must be distinguishable;
- diagram arrows must match the lineage ledger; and
- important gaps must remain visible.

Avoid proving lineage solely from one layer such as model definitions. Check
the executable mappings that cross the relevant boundaries.

## Report

Lead with the origin, authoritative owner, principal transformations, and
requested sink. Then provide:

1. **Scope:** selected data unit, identity rule, direction, variants, and
   exclusions.
2. **Lineage visualization:** a Mermaid flowchart or compact dataflow graph.
3. **Lineage ledger:** from, transformation, to, evidence, evidence class,
   owner, and relevant lifecycle semantics.
4. **Semantic changes:** types, units, defaults, lossiness, aggregation, or
   redaction.
5. **Copies and exposures:** authoritative stores, derived stores, APIs,
   events, exports, logs, and external consumers.
6. **Risks and gaps:** stale projections, incompatible versions, deletion
   leaks, ambiguous ownership, and unresolved boundaries.
7. **Next evidence:** the smallest safe inspection or experiment that resolves
   each important unknown.

Never include real secrets or sensitive record values in the report. Use field
names, shapes, classifications, and redacted examples.

## Examples

- Trace a user email from an HTTP request through validation, storage, emitted
  events, a search index, notifications, logs, and deletion.
- Determine which source fields and transformations produce one dashboard
  metric.
- Trace an identifier renamed across API versions, queue messages, and a
  warehouse projection before a migration.
