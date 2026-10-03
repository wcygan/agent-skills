# SQL Persistence

Use this when implementing Effect SQL queries, transactions, migrations, row decoding, or Bun SQLite persistence.

Prefer `SqlClient`, parameterized statements, `SqlSchema`, and migrations as the application foundation. Add repositories or request batching only when their behavior fits the domain.

## Version And Driver Selection

Check the project's pinned `effect` and SQL driver versions before choosing imports or copying examples. Use a Bun SQLite driver release compatible with Effect v4; a v3 driver is not interchangeable.

Current upstream v4 exposes shared modules under `effect/sql/*` and the Bun driver through `@effect/sql-sqlite-bun`. Earlier v4 versions may use `effect/unstable/sql/*`; follow the installed package exports. The linked API reference marks SQL APIs as unstable.

For Bun with local SQLite, provide `SqliteClient.layer(...)` or `SqliteClient.layerConfig(...)` from the Bun driver. It uses `bun:sqlite` and supplies both the driver-specific service and generic `SqlClient`. Read filename and other runtime settings through `Config` at layer construction. Let the layer own database acquisition and cleanup.

Application services should depend on generic `SqlClient` unless they need driver-specific capabilities such as database export or extension loading.

## Module Selection

| Module | Use when |
| --- | --- |
| `SqlClient` | Executing queries and grouping effects into database transactions. This is the ordinary application entry point. |
| `Statement` | Building parameterized SQL and composable fragments. Usually use the SQL template tag and helpers exposed by `SqlClient`. |
| `SqlSchema` | Encoding query inputs and decoding returned rows with runtime schemas. Prefer it at persistence boundaries. |
| `Migrator` | Tracking applied migrations and running pending database schema changes. |
| `SqlError` | Handling typed SQL failures and classified database error reasons. |
| `SqlModel` | Creating schema-backed CRUD repositories when insert, update, find-by-ID, delete, and optional soft deletion fit the domain. |
| `SqlResolver` | Batching and deduplicating requests when repeated lookups can become a real bulk query. |
| `SqlConnection` | Implementing a driver or specialized connection acquisition. Ordinary services use `SqlClient`. |
| `SqlStream` | Adapting callback producers with pause/resume backpressure in driver implementations. It does not supply streaming support to the Bun SQLite driver. |

## Query And Row Boundaries

- Put queries in adapter services or repositories; expose domain operations through named effects such as `Effect.fn("Users.findById")`.
- Use the client's tagged SQL template for bound values. Use identifier and fragment helpers for dynamic SQL structure; allowlist user-selected columns and sort directions.
- Reserve raw/unsafe SQL for controlled statements whose structure cannot be expressed with the ordinary helpers. Never concatenate untrusted values into SQL text.
- Use `SqlSchema.findAll` when zero or more rows are valid, `findOneOption` for an optional first row, `findOne` for a required first row, and `findNonEmpty` for a required non-empty result array. The first-row helpers do not enforce uniqueness; express that requirement in the query or database constraints. Check the installed signatures and error types.
- Decode persisted rows at runtime. A TypeScript result generic describes an expected shape; it does not validate database values.
- Define explicit storage representations for booleans, timestamps, JSON, and nullable fields. Make schemas and SQL agree on those representations.
- Map SQL and decoding failures to domain errors where the domain has a meaningful interpretation, retaining the underlying cause for diagnosis.

## Transactions And SQLite Behavior

Use `sql.withTransaction(effect)` for operations that must commit or roll back together. Keep all participating queries inside that effect and preserve the transaction context. Keep provider and network calls outside authoritative transactions.

The current Bun driver serializes database access, enables WAL unless disabled, and defaults to a five-second busy timeout. `bun:sqlite` is synchronous, so queries and busy waits can block the event loop. Tune the supported `busyTimeout` option to the application's latency needs; adding Effect concurrency does not make the driver asynchronous.

Explicit transactions on writable connections use `BEGIN IMMEDIATE`, taking the write lock even for a transaction that only reads. Keep transactions short and avoid wrapping independent reads in transactions without a consistency requirement. Clients opened with `readonly: true` are unaffected by this writable-transaction behavior.

Handle `SqlError` using its typed reasons when the installed version supports them. The shared module includes SQLite error classification; application code normally receives errors already classified by the driver. Retry only identified transient failures with a bounded policy and proven operation idempotency. Constraint failures need a domain response, not a blanket retry.

## Migrations

Use the Bun driver's `SqliteMigrator.run(...)` or `SqliteMigrator.layer(...)` with an appropriate shared migration loader. The shared migrator tracks applied migrations and runs pending migrations transactionally; the Bun wrapper does not add schema dump support.

- Give migrations stable, ordered IDs and descriptive names. Keep already-applied migrations immutable; add a new migration for subsequent changes.
- Ensure successful migration completion precedes services accepting queries against the new schema. Make that ordering explicit in startup or layer dependencies.
- Keep migration failures visible so startup cannot silently continue against an incompatible schema.
- Choose a loader that works with the deployment artifact. File-system discovery requires packaged migration files and the loader's platform services; bundled deployments may need an explicit loader.
- For persistence changes, verify migrations against a fresh database and a representative previous schema, then exercise decoding and rollback behavior relevant to the change.

## Optional Abstractions And Streaming

Use `SqlModel` when conventional CRUD removes repetition without hiding domain rules. Keep custom queries and business invariants in application services when repository conventions do not fit.

Use `SqlResolver` for a demonstrated repeated-lookup pattern backed by a bulk query, preserving the association between requested keys and returned rows. Ordinary queries need no request resolver.

The current Bun SQLite driver does not implement `executeStream`; calling it produces a defect. `updateValues` is also unsupported. For large result sets, use bounded queries and pagination, preferably keyset pagination with a stable ordering. Wrapping an already-materialized result array in `Stream` does not reduce query memory usage.

## Sources

Consult these when the pinned package does not answer a question:

- [Effect v4 SQL API](https://effect.website/docs/v4/api/effect/sql/SqlClient), with sibling pages for the modules above.
- [Bun SQLite driver source](https://github.com/Effect-TS/effect/blob/main/packages/sql/sqlite-bun/src/SqliteClient.ts) for concrete runtime behavior and supported options.
- [Bun SQLite migrator source](https://github.com/Effect-TS/effect/blob/main/packages/sql/sqlite-bun/src/SqliteMigrator.ts) for migration wiring and capabilities.
