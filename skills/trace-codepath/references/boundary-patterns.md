# Boundary Patterns

Read this reference when a trace crosses processes, transports, asynchronous
runtimes, or durable resources. A boundary is proven only when both sides and
the connecting contract are accounted for.

## Contents

- Request-response boundaries
- Event and queue boundaries
- Workflow and scheduler boundaries
- Storage boundaries
- External and managed resources
- Dispatch and indirection
- Fan-out and join
- Boundary completion checklist

## Request-response boundaries

For HTTP, RPC, sockets, and similar transports, establish:

1. the caller and client construction;
2. destination resolution, including environment or service discovery;
3. method, route, procedure, or operation name;
4. request and response contracts and versioning;
5. middleware, authentication, serialization, timeout, and retry behavior;
6. server registration and receiving handler; and
7. how transport failures are translated on each side.

A client method name is not proof of the server implementation. A route
definition is not proof that the deployed caller targets that route.

## Event and queue boundaries

Separate these hops:

    producer -> serialization -> publish -> broker or runtime
    broker or runtime -> subscription -> deserialize -> consumer
    consumer -> acknowledgment or rejection -> retry or dead letter

Record topic or queue identity, event type and version, partition or ordering
key, delivery guarantee, acknowledgment point, retry ownership, and deduplication
mechanism when relevant. Do not draw producer-to-consumer as a direct call.

If routing is configured outside source code, inspect manifests, infrastructure
configuration, subscription filters, workflow registration, or deployment
values. Label deployed topology as declared unless current runtime evidence
proves it.

## Workflow and scheduler boundaries

Distinguish workflow definition, workflow execution, task scheduling, worker
registration, activity execution, timers, signals, and persisted workflow
state. A scheduler creating work is not the same as a worker accepting it.

Record:

- the durable identifier and idempotency policy;
- task queue or worker selection;
- timeout and retry ownership;
- cancellation and compensation behavior; and
- whether completion is durable, eventual, or only locally acknowledged.

## Storage boundaries

For a read or write, establish:

- logical repository or adapter call;
- runtime-selected driver or client;
- table, collection, keyspace, bucket, index, or file identity;
- transaction and commit point;
- authoritative versus cached or derived status;
- later triggers such as change streams, polling, or outbox publication; and
- consistency or visibility assumptions important to the scenario.

Do not treat an object mapper method as proof of the physical schema without
checking mappings or migrations. Do not merge a primary store, cache, search
index, and analytics projection into one generic “database” node.

## External and managed resources

Stop at the public contract when internals are unavailable. Record the client,
operation, documented contract, identity boundary, timeout, and visible result.
Use an opaque node for undocumented internal processing.

Do not expose secrets, credentials, private endpoints, sensitive payloads, or
customer values in the graph. Redact instance-specific identifiers unless they
are necessary and safe.

## Dispatch and indirection

Inspect these patterns before selecting a callee:

- dependency injection and runtime registries;
- plugins, hooks, interceptors, and middleware;
- generated clients and code generation inputs;
- reflection, dynamic loading, and convention-based discovery;
- feature flags, tenant policies, and environment switches;
- aliases, facades, decorators, and proxy layers; and
- test replacements or local emulators.

List competing implementations only when selection remains unresolved. Do not
expand every implementer of an interface as though every implementation runs.

## Fan-out and join

Represent parallel work as separate branches. Record whether the initiator:

- waits for all, any, or none;
- has a concurrency limit;
- preserves ordering;
- tolerates partial results;
- cancels remaining work after a failure; or
- retries the entire group versus one branch.

Show the join or aggregation point explicitly. If one branch writes durable
state while another fails, preserve that partial outcome in the path.

## Boundary completion checklist

Before calling a boundary verified, answer:

1. What exact operation leaves the source?
2. How is the destination selected?
3. What contract crosses the boundary?
4. What receives it?
5. Is the hop synchronous, asynchronous, durable, or best effort?
6. Where are success and failure acknowledged?
7. Which side owns timeout, retry, and deduplication?
8. What evidence supports each answer?

Mark unresolved answers as unknown rather than filling them with conventional
architecture assumptions.
