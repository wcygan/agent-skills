# Contracts and interfaces

Use when a caller must inspect implementation code to discover how to use a part
correctly. The goal is a truthful agreement that permits independent reasoning.

## Source basis

[Ousterhout's lecture notes](https://web.stanford.edu/~ouster/cgi-bin/cs190-spring15/lecture.php?topic=complexity)
include behavioral knowledge in the interface, beyond declarations.
[Cornell's notes](https://www.cs.cornell.edu/courses/cs3110/2009fa/Lectures/lec08.html)
connect specifications with reasoning about callers and implementations separately.
The contract worksheet below is an application of those ideas.

## Specify the consequential dimensions

| Dimension | Questions that can change a caller |
|---|---|
| Inputs | Which units, identities, ranges, ownership, and validity conditions? |
| Results | What does success establish, and is order meaningful? |
| Failures | Rejection, absence, conflict, or infrastructure failure? |
| Effects | What can change, and what may already have happened on failure? |
| Lifetime | Who owns returned resources and when are they valid? |
| Ordering | Is initialization required? Can operations overlap? |
| Retry | Can the same request be repeated, and with which identity? |
| Cost | Does use require knowing materialization, latency, or size limits? |

Document dimensions that matter to the actual operation. A private arithmetic
helper rarely needs a full contract table. A database command with ambiguous
failure outcomes often does.

## Example: creating a document

An underspecified signature:

```text
save(document) -> boolean
```

A more useful conceptual contract:

```text
createDocument(requestId, validatedDocument)
    -> Created(documentId)
     | Existing(documentId)
     | RequestConflict
     | Unavailable(outcome: NotCommitted | Unknown)
```

Assumptions for this example: the caller is authorized; document validity has
already been established; the store durably associates request identity, payload
identity, and result with the write. Repeating the same request and payload
returns the established document ID. Reusing the request ID for a different
payload produces `RequestConflict`. The retention period for request identities
must be explicit if it is finite.

`Unknown` communicates that failure to receive a reply is insufficient to infer
the absence of a write. The caller can retry using the same ID or query the
established result. This design requires supporting storage behavior; adding an
enum without implementing its semantics does not provide the guarantee.

## Preserve useful information

Translate provider failures into outcomes the caller can act on, retaining causes
for diagnosis. Collapsing all errors into `false` hides distinctions the caller
needs. Exposing every vendor-specific code can force callers to know too much.
Choose the translation based on the caller's actual recovery decisions.

Similarly, returning an immutable snapshot, borrowed view, or stream are different
contracts. State which one applies. A stream that can fail after yielding some
data needs a different consumption policy from an all-or-nothing value.

## Check substitutability with behavior

If replacing the implementation, compare observable results, effects, failures,
and ordering. A fake that silently accepts duplicate identities does not satisfy
the example contract even if it implements the same method signature. Conversely,
two implementations need not use the same data structure or helper calls.

Use contract tests where multiple implementations or boundary-sensitive behavior
justify them. Keep integration checks for guarantees provided by the actual
database or remote system. Document material performance differences when callers
must accommodate them.

## Review outcome

Complete the contract when a caller can explain a success, a relevant failure,
and any supported retry without reading private code. Keep implementation choices
private unless their consequences are necessary for correct use.
