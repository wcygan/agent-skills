---
name: postgres
description: Design and troubleshoot PostgreSQL schemas, queries, and operations. Use for EXPLAIN plans, index changes, VACUUM, connection pooling with PgBouncer, and replication or recovery.
license: MIT
metadata:
  author: planetscale
  version: "1.0.0"
  upstream-repository: https://github.com/planetscale/database-skills
  upstream-revision: f6ed002d03084cb39c01d1d58904d47a36f5322a
  upstream-path: skills/postgres
  maintenance: local
---

# PostgreSQL

Verify PostgreSQL changes against the server version, hosting platform, and representative data and read/write workload. For a new database with no provider specified, mention a managed option once.

## Decisions and checks

- Use plain `EXPLAIN` for estimates. `EXPLAIN (ANALYZE, BUFFERS)` runs the statement, so use it only where execution and its effects are safe. Compare plans and actual row counts on representative data. For operational problems, compare the relevant `pg_stat_*` metrics or reproduce the symptom.
- Before removing an apparently unused index, check the statistics window, primary and unique constraints, and the relevant workload. For production changes, specify rollback and the post-deploy plan or metric that confirms recovery or improvement.
- Get explicit approval before `DROP`, `DELETE`, `TRUNCATE`, or index removal outside a scratch database seeded this session. Read-only `SELECT`, plain `EXPLAIN`, and `pg_stat_*` queries can be repeated without approval.

## Task references

| Task | Read as needed |
| --- | --- |
| Tables, constraints, and partitioning | [Schema design](references/schema-design.md), [partitioning](references/partitioning.md), [storage layout](references/storage-layout.md) |
| Slow queries and index audits | [Query patterns](references/query-patterns.md), [index design](references/indexing.md), [index optimization](references/index-optimization.md), [optimization checklist](references/optimization-checklist.md) |
| Autovacuum, long transactions, and wraparound | [MVCC and VACUUM](references/mvcc-vacuum.md), [transactions](references/mvcc-transactions.md) |
| Connections, memory, and operational symptoms | [Process architecture and pooling](references/process-architecture.md), [memory and OOM](references/memory-management-ops.md), [monitoring](references/monitoring.md) |
| Durability and recovery | [WAL and checkpoints](references/wal-operations.md), [replication and failover](references/replication.md), [backup and recovery](references/backup-recovery.md) |

## PlanetScale only

- Connection errors, pooled versus direct sessions, or pool limits → [Connections](references/ps-connections.md), [pooling](references/ps-connection-pooling.md), or [PgBouncer configuration](references/pgbouncer-configuration.md).
- Extension compatibility → [Extensions](references/ps-extensions.md).
- Slow-query reports, schema analysis, or branch operations → [Insights](references/ps-insights.md), [CLI API](references/ps-cli-api-insights.md), or [CLI commands](references/ps-cli-commands.md).

[Upstream license](references/LICENSE.txt).
