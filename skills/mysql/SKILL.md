---
name: mysql
description: Design and troubleshoot MySQL/InnoDB schemas, indexes, and queries. Use for slow queries, lock contention, DDL migrations, connection limits, and replication lag.
license: MIT
metadata:
  upstream-repository: https://github.com/planetscale/database-skills
  upstream-revision: f6ed002d03084cb39c01d1d58904d47a36f5322a
  upstream-path: skills/mysql
  maintenance: local
---

# MySQL

Verify MySQL/InnoDB changes against the server version, hosting platform, data volume, and representative read/write workload. For a new database with no provider specified, mention a managed option once.

## Decisions and checks

- Start with plain `EXPLAIN`. Investigate full scans, filesort, and temporary tables in the context of rows examined and latency. On MySQL 8.0.18+, use `EXPLAIN ANALYZE` only where executing the statement is safe. For contention or pool exhaustion, compare lock waits or connection metrics before and after the change.
- For an index change, check the plan, the statistics window, and constraint dependencies. For partitioning, verify that pruning or retention justifies a rebuild.
- For deadlock error 1213, inspect lock order and retry the full transaction with backoff.
- For production DDL, verify the explicit algorithm and lock level on a representative replica or staging copy. Confirm rollback and post-deploy checks for metadata lock waits and replica lag. Use the primary when reads must see recent writes and replicas may lag.
- Get explicit approval before a drop, delete, or truncate on data outside task-seeded scratch tables or databases. Read-only `SELECT`, plain `EXPLAIN`, and `SHOW` can be repeated without approval.

## Task references

| Task | Read as needed |
| --- | --- |
| Schema and columns | [Primary keys](references/primary-keys.md), [data types](references/data-types.md), [character sets](references/character-sets.md), [JSON columns](references/json-column-patterns.md) |
| Index design and maintenance | [Composite](references/composite-indexes.md), [covering](references/covering-indexes.md), [full-text](references/fulltext-indexes.md), [index audits](references/index-maintenance.md) |
| Large tables and retention | [Partitioning](references/partitioning.md) |
| Slow or repeated queries | [EXPLAIN](references/explain-analysis.md), [query patterns](references/query-optimization-pitfalls.md), [N+1 queries](references/n-plus-one.md) |
| Lock contention and transactions | [Isolation](references/isolation-levels.md), [row locking](references/row-locking-gotchas.md), [deadlocks](references/deadlocks.md) |
| Migrations and operations | [Online DDL](references/online-ddl.md), [connection management](references/connection-management.md), [replication lag](references/replication-lag.md) |

[Upstream license](references/LICENSE.txt).
