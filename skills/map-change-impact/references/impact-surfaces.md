# Impact Surfaces

Use this reference to route the search according to the proposed change. Apply
only the relevant sections.

## Contents

- Symbol or implementation change
- API, RPC, CLI, or webhook change
- Event, queue, or workflow change
- Database or data-model change
- Configuration or feature-flag change
- Dependency or runtime upgrade
- Infrastructure or resource change
- Removal or deletion

## Symbol or implementation change

Inspect:

- imports, calls, references, overrides, and implementations;
- dependency injection, registries, reflection, plugins, and hooks;
- generated interfaces, adapters, mocks, and fixtures;
- concurrency, transaction, and lifecycle assumptions;
- public errors, return values, side effects, and performance expectations; and
- tests that encode behavior rather than only names.

A private rename can still affect reflection, serialization, configuration, or
generated code. A public interface can remain source-compatible while changing
behavior incompatibly.

## API, RPC, CLI, or webhook change

Inspect:

- route or procedure registration and generated clients;
- request, response, error, pagination, and authentication contracts;
- default, optional, null, and unknown-field semantics;
- version negotiation and deprecation behavior;
- SDKs, examples, fixtures, mocks, and contract tests;
- proxies, gateways, policy, caching, and rate limits; and
- internal and external consumers.

Search for wire names as well as language-level names.

## Event, queue, or workflow change

Inspect:

- producers, schemas, topics, routing keys, and partition keys;
- subscriptions, filters, deserializers, handlers, and dead letters;
- retained events, delayed messages, retries, and replay;
- workflow histories, long-running executions, timers, and worker versions;
- ordering, duplication, idempotency, and acknowledgment assumptions; and
- backfills, projections, and downstream analytics.

Deployment completion does not remove old queued or retained payloads.

## Database or data-model change

Inspect:

- schemas, migrations, constraints, indexes, triggers, views, and generated
  columns;
- queries, object mappings, bulk paths, exports, and admin tools;
- replicas, change-data capture, outboxes, caches, search, and warehouses;
- nullability, defaults, units, precision, collation, and identifier scope;
- backfill cost, locking, compatibility, and rollback; and
- retention, deletion, backups, and historical snapshots.

Treat schema migration, data migration, and application rollout as separate
phases unless atomicity is proven.

## Configuration or feature-flag change

Inspect:

- definitions, loaders, defaults, validation, aliases, and precedence;
- templates, deployment values, secrets references, and environment overrides;
- runtime refresh versus startup-only behavior;
- callers and branches protected by the value;
- dashboards, alerts, runbooks, and rollback procedures; and
- cleanup of stale values after rollout.

Removing the code branch before removing old deployed configuration may be
safe; removing parsing first may break startup. Establish ordering.

## Dependency or runtime upgrade

Inspect:

- public and transitive APIs used by the repository;
- changed defaults, serialization, errors, timeouts, and performance;
- lockfiles, build images, generators, compilers, and runtime constraints;
- native or platform compatibility;
- licenses, security advisories, and operational requirements;
- test doubles and integration fixtures; and
- deployment coexistence and rollback compatibility.

Do not infer compatibility from a successful dependency resolution alone.

## Infrastructure or resource change

Inspect:

- consumers of endpoints, names, identities, ports, DNS, certificates, and
  credentials;
- capacity, quotas, consistency, durability, retention, and regional behavior;
- deployment dependencies, health checks, autoscaling, and disruption budgets;
- state migration, replication, backups, and restore;
- monitoring, alerting, runbooks, and ownership; and
- rollback feasibility after data or traffic moves.

Configuration that names a resource is declared dependency evidence, not proof
of current runtime traffic.

## Removal or deletion

Search beyond direct references:

- dynamic names and registries;
- serialized strings and persisted payloads;
- documentation, examples, scripts, and support tooling;
- old migrations, snapshots, fixtures, and replay data;
- metrics, dashboards, alerts, and logs;
- external clients and scheduled jobs; and
- fallback and rollback paths.

Require positive evidence for deletion safety. “No local references” is not
proof that no external or historical consumer exists.
