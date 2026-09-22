# Orchestration and dataflow

Use when the main difficulty is how responsibilities collaborate: sequencing,
intermediate values, loops, cancellation, or partial completion.

This reference is engineering synthesis. Its separation of execution and
responsibility applies the distinction discussed by
[Parnas](https://www.cs.lafayette.edu/~gexia/cs301/resources/parnas.html).

## Select the simplest coordination shape that fits

| Shape | Useful when | Cost to inspect |
|---|---|---|
| Direct calls | A short operation has a clear lifetime | Nested detail and cleanup ownership |
| Pipeline | Values pass through meaningful transformations | Error propagation and intermediate volume |
| Loop with explicit state | Work is incremental or input dependent | Termination, progress, cancellation |
| State machine | Resume/retry depends on persisted lifecycle state | Transition validity and recovery |

Choose based on the behavior rather than the availability of a workflow library.
An ordinary function can coordinate several domain operations. Introduce durable
coordination only when the requested lifetime and recovery require it.

## Document each edge

For each handoff, identify the value and what is now known about it. For example:

```text
bytes -> DecodedRow -> CandidateRecord -> ValidRecord -> StoredRecord
```

These names are useful only if they express real guarantees. A renamed dictionary
that every stage mutates still carries implicit shared state. If provenance is
needed for errors, carry a source location alongside the domain value rather than
reintroducing access to the whole parser context.

Also identify ownership: who closes the input, who commits the transaction, who
decides to stop, and which outcomes remain observable after cancellation.

## Example: partial document import

Assume independently committed rows, preserved input order, and a stable source
identity for retries. Pseudocode:

```text
open source within a managed lifetime
for each source record:
    interpret it, retaining its source identity
    validate the candidate
    if rejected: record rejection and continue
    outcome = store.putIfAbsent(sourceIdentity, validRecord)
    record the established outcome
return summary
```

The coordinator knows the policy to continue after a validation rejection. It
does not know delimiter escaping or how storage enforces identity uniqueness.
If storage becomes unavailable, the import must report the established prefix
and any uncertain write, or provide durable progress that can be queried. A final
in-memory counter alone is insufficient for crash recovery.

Now change the requirement to whole-file atomicity. The loop cannot commit each
row independently. Staging or a transaction changes resource use and failure
semantics. This is a behavior decision that can reshape the decomposition, not a
local substitution of `save` with another helper.

## Failure accounting

For each meaningful failure, write:

```text
Failure point:
Already completed effects:
Uncertain effects:
Owner of cleanup/retry:
Outcome visible to the caller:
```

Use this only for failures relevant to the target. Do not invent compensation or
retry machinery when a clean failure return satisfies the request.

## Completion check

Read the coordinator without expanding its callees. It should explain the use
case, ordering, and outcome. Then inspect one collaborator: it should own a real
rule, algorithm, or effect rather than merely forwarding the coordinator's call.

For a full example and a concrete alternative, read
[Document import](example-document-import.md).
