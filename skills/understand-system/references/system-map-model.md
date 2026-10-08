# System map model

Use this model when boundaries, async execution, derived state, evidence
differences, or diagram scale need more precision. Retain one ledger behind
all views rather than independently inventing each diagram.

## Separate topology from code organization

Classify nodes by what they represent: actor, runtime component, module inside
a runtime, authoritative store, derived store, transport/queue, external system,
or opaque boundary. Use deployment groups only when executable configuration
or existing runtime evidence supports them.

A package can be unused, optional, or one part of a process. Multiple modules
may run in one process; one implementation may run in several instances.
Represent those distinctions only when they answer the reader's question.
Consult existing domain vocabulary without inventing glossary changes.

For each material node retain:

```text
stable ID | domain name | role and purpose | scope/group | runtime selection
state/ownership | relevant entrypoint | source anchor | evidence class | gap
```

For each material edge retain:

```text
from/to IDs | call/read/write/publish/consume/derive relationship | contract
sync/async | variant/condition | state/effect semantics | source | evidence class
```

## Preserve identity across views

Use the same component names and IDs in overview, journey, and data views.
Distinguish an operation from an attempt, message, job, or domain record when
they have different lifecycles. Link shared identities through evidence;
matching names, values, or timestamps alone do not prove correspondence.

For asynchronous work, keep acceptance, durable handoff, consumption,
acknowledgment, retry, and terminal effects distinct where material. Separate
authoritative state from caches, projections, and copied representations.
An unknown external implementation stays opaque rather than acquiring
speculative internal nodes.

## Select coordinated 2D views

| Reader question | Suitable view |
|---|---|
| What does the system support, and which parts own it? | Purpose plus component/context overview. |
| What happens during the important operation? | Flow or sequence with selected branches and boundaries. |
| Where is truth, and how do copies change? | Data ownership and transformation view. |
| What state or recovery rule explains behavior? | State transition view scoped to that question. |

Start with the fewest views that answer the request. Share names and visual
roles; let selection or an adjacent detail panel connect views when it helps.
Split an unreadable overview by a meaningful boundary, not by arbitrary layout.
Keep the overview understandable without opening every detail.

## Carry evidence into presentation

Make observed, source-verified, declared, inferred, and unknown relationships
distinguishable through direct labels, badges, or line patterns. Category and
runtime-state colors must retain separate explained roles under the parent
visual contract. Treat missing evidence as uncertainty, not a failure status.

Use source anchors near claims or in a directly reachable details panel.
Choose a link form valid for the delivery environment; keep file and symbol
locations available when a link cannot resolve outside the originating checkout.
Avoid exposing sensitive values or private operational endpoints.

## Acceptance examples

- An API, worker, and store share a ledger; the overview shows ownership and
  the journey distinguishes enqueue success from processing completion.
- Two packages running in one process appear as modules within that runtime,
  not invented services with network arrows.
- An inferred external dependency is labeled and uses a generic icon, while
  verified technology marks retain visible names and attribution.
- A reader can identify where a record becomes authoritative and navigate to
  the relevant source without interpreting colors alone.
- A single handler question routes to `trace-codepath`; a structural redesign
  request routes to the relevant design workflow.
