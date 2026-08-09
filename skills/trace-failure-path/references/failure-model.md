# Failure Model

Use a failure ledger as the source of truth and derive the diagram from it.
Model state effects as carefully as error values.

## Contents

- Node vocabulary
- Edge vocabulary
- Ledger fields
- Outcome vocabulary
- Causality
- Diagram guidance

## Node vocabulary

| Node | Represents |
|---|---|
| operation | request, command, event, task, transaction, or user action |
| trigger | fault, invalid state, timeout, cancellation, or rejected input |
| detector | code or runtime that first recognizes the condition |
| handler | catch, result matcher, middleware, supervisor, or recovery policy |
| boundary | process, transport, queue, workflow, or storage transition |
| state | durable, external, cached, or in-memory state relevant to recovery |
| surface | response, log, metric, span, audit record, notification, or alert |
| terminal | success, degraded success, rejection, exhaustion, dead letter, or abandonment |
| unknown | unresolved causal or recovery segment |

Do not create a node for every stack frame. Preserve frames that change the
error, state, control flow, responsibility, or evidence.

## Edge vocabulary

Use precise failure behavior:

- detects or rejects;
- throws, returns, or signals;
- wraps, translates, or maps;
- propagates or cancels;
- logs, measures, traces, or alerts;
- suppresses or ignores;
- times out or loses lease;
- retries, reschedules, or redelivers;
- falls back or degrades;
- rolls back, compensates, or cleans up;
- acknowledges, rejects, or dead-letters; and
- exhausts, abandons, or terminates.

Label retry edges with owner, attempt limit, delay policy, and retry condition
when known.

## Ledger fields

| Field | Content |
|---|---|
| from | component and state before the hop |
| edge | failure, handling, recovery, or surface behavior |
| to | component and state after the hop |
| error | type, code, status, signal, or result |
| attempt | local and end-to-end attempt number or bound |
| side effects | committed, rolled back, pending, duplicated, or unknown work |
| evidence | source, config, test, trace, log, metric, or history |
| class | observed, verified, declared, inferred, or unknown |

Preserve an unmodified error identity when possible. If wrapping or translation
loses information, record what is dropped.

## Outcome vocabulary

Distinguish:

- **atomic failure:** no material effect committed;
- **rejected:** invalid or unauthorized work did not start;
- **ambiguous:** caller cannot tell whether the effect occurred;
- **partial:** some required effects completed;
- **degraded success:** contract intentionally allows a reduced result;
- **eventual recovery:** retry or compensation reaches a valid state;
- **exhausted:** bounded recovery stopped;
- **quarantined:** work moved to dead letter or manual review;
- **abandoned:** no owner or mechanism continues recovery; and
- **unknown:** terminal state cannot be established.

Avoid calling a returned 2xx, acknowledgment, or completed future “success”
without naming the contract it satisfies.

## Causality

Use temporal order plus a plausible mechanism. Correlation alone is not enough.
Keep these distinct:

- initiating cause;
- contributing condition;
- local detection;
- propagation symptom;
- recovery failure; and
- user or operator symptom.

When evidence supports several causes, create separate hypotheses and name the
observation that would discriminate among them.

## Diagram guidance

Use sequence diagrams for timing and ambiguity:

    caller -> service: request
    service -> store: write
    caller --x service: timeout
    caller -> service: retry

Use flowcharts for handling choices and terminal states. Use state diagrams for
durable retry, compensation, and quarantine lifecycles.

Put verbose evidence in the ledger. Mark observed, verified, declared,
inferred, and unknown edges with a legend when mixed evidence would otherwise
be mistaken for uniform proof.

Never join disconnected known segments with an unlabeled arrow. Insert an
unknown node or show competing branches.
