# Lineage Model

Use a lineage ledger as the authoritative representation. Derive diagrams and
summaries from it.

## Contents

- Node vocabulary
- Edge vocabulary
- Ledger fields
- Transformation properties
- Identity rules
- Diagram guidance

## Node vocabulary

| Node | Represents |
|---|---|
| source | user input, device, upstream API, generated value, or imported data |
| contract | request, response, event, file, schema, or serialization shape |
| transform | validation, mapping, enrichment, filtering, join, or aggregation |
| transport | API, queue, stream, workflow, replication, or file transfer |
| authoritative store | system that owns the durable fact |
| derived store | cache, index, projection, snapshot, replica, or warehouse |
| exposure | UI, API, export, report, log, metric, model, or external consumer |
| deletion sink | expiry, purge, tombstone, anonymization, or archival boundary |
| unknown | unresolved or unavailable lineage segment |

Use separate nodes when representations or ownership change. Collapse
pass-through functions that preserve the selected data exactly and add no
meaningful control.

## Edge vocabulary

Label edges with the operation:

- validates or rejects;
- defaults or coerces;
- renames or retypes;
- serializes or parses;
- enriches or joins;
- filters or redacts;
- hashes or encrypts;
- aggregates, windows, samples, or deduplicates;
- publishes, transfers, or replicates;
- writes, reads, caches, or indexes;
- exposes, exports, logs, or measures; and
- deletes, expires, tombstones, or archives.

“Flows to” is acceptable only when the precise transformation is genuinely
unknown.

## Ledger fields

Record:

| Field | Content |
|---|---|
| from | representation, owner, and source location |
| operation | transformation or movement |
| to | resulting representation, owner, and location |
| identity | key or rule that connects input and output |
| semantics | type, units, nullability, time meaning, and invariants |
| lifecycle | freshness, retention, mutability, and deletion behavior |
| evidence | source, schema, query, config, catalog, or runtime observation |
| class | observed, verified, declared, inferred, or unknown |

For joins, list every material input. For splits, create one edge per output.
For aggregates, include grouping keys, window, filters, and late-data behavior
when relevant.

## Transformation properties

Describe important transformations along these axes:

- **Loss:** lossless or lossy.
- **Reversibility:** reversible, conditionally reversible, or irreversible.
- **Determinism:** deterministic or dependent on time, state, randomness, or an
  external service.
- **Cardinality:** one-to-one, one-to-many, many-to-one, or many-to-many.
- **Timing:** synchronous, asynchronous, streaming, batch, or scheduled.
- **Materialization:** transient, durable, cached, indexed, or exported.
- **Compatibility:** versioned, tolerant-reader, defaulted, or breaking.

Do not add properties that do not affect the selected question.

## Identity rules

Track identity explicitly when names or shapes change. Common rules include:

- stable primary or domain identifier;
- composite key including tenant or version;
- event correlation or causation identifier;
- foreign-key or join relationship;
- deterministic derivation;
- lookup-table or mapping-table translation; and
- probabilistic or heuristic matching.

Label heuristic matching as inferred. Two fields with the same name are not
necessarily the same concept; two fields with different names may be the same
concept only when a mapping proves it.

## Diagram guidance

Use a left-to-right flowchart for most lineage:

    origin -> contract -> transform -> authoritative store
           -> event -> projection -> exposure

Group nodes by ownership boundary or lifecycle tier. Mark authoritative stores
and derived copies distinctly. Put detailed types and evidence in the ledger,
not in crowded node labels.

Use a sequence diagram only when temporal order, streaming checkpoints,
replays, or delayed materialization are central. Use a separate lifecycle
diagram when deletion, retention, or backfill is the primary question.

Never draw a continuous arrow across an unknown boundary. Insert an unknown
node and state what evidence is missing.
