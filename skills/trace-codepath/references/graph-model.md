# Graph Model

Use this reference to normalize a codepath trace and choose a readable
visualization. Keep the edge ledger authoritative; treat the diagram as a
projection of that ledger.

## Contents

- Node vocabulary
- Edge vocabulary
- Evidence annotations
- Choose a view
- Mermaid conventions

## Node vocabulary

Use the most specific useful node type:

| Node | Represents |
|---|---|
| actor | person, system, scheduler, or external initiator |
| entrypoint | route, command, handler, consumer, hook, or task entry |
| code | function, method, module, component, or generated adapter |
| decision | condition, policy, feature flag, or dispatch choice |
| service | independently deployed process or managed API |
| transport | HTTP, RPC, socket, event bus, queue, or workflow runtime |
| state | database, cache, index, object store, file, or durable workflow state |
| effect | response, notification, external mutation, or other terminal result |
| opaque | boundary whose implementation is unavailable or unresolved |

Do not create separate nodes for trivial wrappers. Preserve a wrapper when it
changes arguments, error behavior, retries, transactions, authorization, or
destination selection.

## Edge vocabulary

Label arrows with behavior, not vague connectivity:

| Edge | Meaning |
|---|---|
| calls | direct in-process invocation |
| dispatches | selects and invokes a handler or implementation |
| requests | synchronous or request-response transport |
| publishes | writes an event or message for later delivery |
| consumes | receives an event, message, or work item |
| schedules | creates delayed or durable work |
| awaits | waits for completion or a join condition |
| reads | obtains state without intending to mutate it |
| writes | creates, updates, or deletes state |
| invalidates | expires or removes cached or derived state |
| emits | produces a response, signal, or externally visible effect |
| retries | repeats an operation after a failure or timeout |
| compensates | applies a semantic rollback or corrective action |

Add the contract, condition, and delivery semantics when relevant:

    publishes OrderCreated v2 [after commit, at least once]

Avoid generic labels such as “uses,” “talks to,” or “depends on” when a more
precise relationship is available.

## Evidence annotations

Store evidence on ledger entries using these fields:

| Field | Content |
|---|---|
| from | stable node name and source location |
| edge | relationship and relevant condition |
| to | stable node name and source location or external identity |
| evidence | file, symbol, configuration, trace, log, or test |
| class | observed, verified, declared, inferred, or unknown |
| notes | sync/async, cardinality, ordering, timeout, retry, or state effect |

If the diagram needs confidence labels, use a compact suffix:

- `[O]` observed
- `[V]` verified
- `[D]` declared
- `[I]` inferred
- `[?]` unknown

Define the legend in the diagram. Do not imply numeric precision that the
evidence does not support.

## Choose a view

### Call tree

Use for a short in-process route where symbol nesting is the central question.
Show runtime-selected implementations and omit unrelated possible callees.

### Flowchart

Use for service topology, conditional branches, fan-out, storage, and terminal
effects. Group nodes by process or ownership boundary when that reduces
ambiguity.

### Sequence diagram

Use for ordering, request-response pairs, callbacks, concurrent work,
acknowledgments, retries, or work that continues after the initiating request
returns. Use activation and notes sparingly.

### State diagram

Use when the question is primarily about durable states and transitions. Put
the handler or event on the transition label and keep code-level calls in the
edge ledger.

## Mermaid conventions

- Use stable, short node identifiers and human-readable labels.
- Put source locations in labels only when they remain readable.
- Use subgraphs or participants for process and ownership boundaries.
- Label asynchronous edges explicitly.
- Represent datastores distinctly from code nodes.
- Show important alternate and failure branches; omit exhaustive defensive
  branches unless requested.
- Avoid styling that is required to understand the graph.
- Validate syntax when a Mermaid renderer or repository check is available.

For a dense path, produce a high-level graph plus a ledger rather than a
wall-sized diagram. Never hide unknown hops by drawing a direct unqualified
arrow between the last and next known nodes.
