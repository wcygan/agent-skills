---
name: trace-codepath
description: Trace and visualize one scenario-specific execution path from an entrypoint to a requested sink across functions, modules, services, transports, queues, workflows, datastores, and external dependencies. Use when explaining how a request, event, command, job, or data change flows through a codebase or distributed system, including calls, branches, asynchronous hops, reads, writes, retries, and trust boundaries; produce an evidence-backed call graph, flowchart, sequence diagram, or state diagram with source locations, confidence labels, and explicit unknowns.
license: MIT
metadata:
  author: William Cygan
  version: "0.1.0"
---

# Trace a Codepath

Trace one concrete scenario through code and system boundaries. Build a graph
that distinguishes proven execution from merely possible relationships.

## Preserve the authority boundary

Treat requests to trace, explain, map, visualize, or investigate as read-only.
Do not modify source, configuration, instrumentation, or documentation unless
the user asks for changes. Inspect repository instructions and dirty state
before running commands, and preserve unrelated work.

Prefer static inspection and existing local tests or traces. Do not send
requests to production, publish messages, mutate shared data, install
dependencies, or enable instrumentation merely to complete a trace. If runtime
proof would require mutation or external access, explain the missing proof and
the smallest safe experiment that could obtain it.

## Define one scenario

Convert the request into a bounded trace:

- **Trigger:** the request, event, command, job, timer, or state change that
  starts the path.
- **Entry anchor:** the first concrete route, handler, symbol, consumer, task,
  or configuration entrypoint in scope.
- **Question:** the behavior the trace must explain.
- **Sink:** the response, side effect, state transition, external call, or
  opaque boundary where the trace stops.
- **Variant:** relevant input class, feature flag, authorization state, error
  condition, or deployment mode.
- **Scope:** repositories, services, environments, and generated artifacts that
  may be inspected.

If the user gives only a symbol or endpoint, infer the most representative
scenario from repository evidence and state the assumption. Do not attempt a
repository-wide call graph.

## Establish evidence

1. Read repository instructions and identify the build, generated-code, and
   source-of-truth conventions.
2. Locate the entry anchor in executable code or configuration.
3. Search callers and callees with repository-native tools before introducing a
   language-specific analyzer.
4. Inspect route registration, dependency construction, clients, schemas,
   deployment configuration, workflow definitions, and storage adapters when
   they can change the selected path.
5. Use existing runtime traces, logs, or focused tests when available and safe.
6. Record each hop in an edge ledger while investigating; do not reconstruct
   evidence from memory at the end.

Label every material node and edge as:

- **observed:** demonstrated by current runtime evidence;
- **verified:** directly established in source or executable configuration;
- **declared:** stated by a contract, schema, manifest, or documentation;
- **inferred:** supported indirectly but not proven; or
- **unknown:** hidden behind an unavailable or ambiguous boundary.

Prefer exact file and symbol locations. Treat generated files, runtime
registration, reflection, dependency injection, feature flags, and deployment
configuration as potential sources of divergence from a simple text search.

## Traverse the selected path

Follow the path from the entry anchor toward the sink:

1. Resolve dispatch and routing before descending into implementation.
2. Record calls that affect control flow, state, authorization, or externally
   visible behavior.
3. Record conditions that select or suppress a branch.
4. At each boundary, establish the caller, protocol or mechanism, contract,
   destination resolution, and receiving entrypoint.
5. For asynchronous work, record enqueue or publish, durable handoff,
   consumer selection, acknowledgment, retry, and eventual side effect as
   separate hops.
6. For storage, distinguish reads, writes, transactions, caches, indexes, and
   later consumers of persisted state.
7. Track fan-out and join behavior when it affects ordering, partial success,
   latency, or correctness.
8. Stop when the requested sink is proven, the path becomes irrelevant to the
   question, or an opaque boundary is reached.

Collapse framework plumbing that does not affect the scenario. Preserve
middleware, interceptors, generated clients, adapters, and hooks when they
change authentication, retries, transactions, serialization, routing, or
failure semantics.

Read `references/boundary-patterns.md` when the path crosses a process,
transport, asynchronous runtime, datastore, or externally managed resource.

## Build the graph

Use the smallest view that answers the question:

- use a **call tree** for a mostly in-process symbol path;
- use a **flowchart** for topology, branches, fan-out, and resources;
- use a **sequence diagram** for temporal ordering and synchronous or
  asynchronous handoffs; and
- use a **state diagram** when durable state transitions are the central fact.

Create more than one view only when each answers a materially different
question. Keep node labels readable and put detailed evidence in the ledger
rather than crowding the diagram.

Read `references/graph-model.md` for node and edge vocabulary, confidence
annotations, Mermaid conventions, and diagram selection.

## Verify the trace

Check the completed path from both directions:

- walk forward from the trigger and confirm every outgoing edge used;
- walk backward from the sink and confirm what can actually reach it;
- distinguish runtime-selected implementations from interface possibilities;
- distinguish request completion from asynchronous or durable completion;
- check that retry, fallback, authorization, and transaction boundaries are not
  hidden;
- confirm that diagram arrows match the edge ledger; and
- ensure every inferred or unknown edge is visibly labeled.

Do not claim that a static call is executed for the selected scenario. Do not
claim that a configured dependency is healthy or reachable. Do not invent
internals beyond an opaque service, library, or managed-resource boundary.

## Report

Lead with the behavior the trace establishes. Then provide:

1. **Scenario and scope:** trigger, variant, entry anchor, sink, and exclusions.
2. **Visualization:** Mermaid or a compact text graph appropriate to the path.
3. **Edge ledger:** from, relationship, to, evidence location, evidence class,
   and relevant condition.
4. **Boundary semantics:** transport, contract, sync or async behavior,
   ownership, state effects, retries, timeouts, and authentication where
   relevant.
5. **Unknowns:** ambiguous dispatch, unavailable repositories, runtime-only
   wiring, or missing observations.
6. **Next evidence:** the smallest discriminating search, test, trace, or probe
   for each important unknown.

For large graphs, present the scenario-critical path first and place secondary
branches afterward. Keep source citations adjacent to the claims they support.

## Examples

- Trace an HTTP request from route registration through authorization, a
  service call, a transaction, an emitted event, and a worker side effect.
- Trace a scheduled workflow through task dispatch, retries, and a final object
  store write.
- Explain which implementation of an interface handles one command when
  runtime registration and feature flags select among several candidates.
