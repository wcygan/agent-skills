# Local persistence

Use pinned, compatible Effect and @effect/sql-sqlite-bun versions. The example
uses 4.0.0-rc.116 for both. The Bun adapter provides Effect SQL over bun:sqlite;
keep database access inside application services and layer composition.

## Ownership and startup

APP_DATA_DIR defaults to .data relative to the application's working directory.
The directory contains app.sqlite and SQLite sidecar files. It survives builds
and process restarts. Keep it outside build output, version control, and the
installed skill. The generator excludes .data and SQLite files. If overriding
the location, never place user data inside the distributed template.

DatabaseLive creates the directory, opens a scoped client, and runs statically
bundled versioned migrations before dependent services become available. Never
edit a released migration; add the next migration. Test upgrading an existing
database as well as creating an empty one. SQL client acquisition and migration
failures prevent normal startup; fix the path, permissions, or migration rather
than silently switching to a fresh database.

The adapter enables WAL by default. The example bounds its busy timeout to one
second because Bun SQLite waits synchronously. Keep transactions short, and keep
network/model calls outside them. Close the runtime on shutdown so the database
client is finalized.

## Application records

Use tables for authoritative records. Collections stores an integer version.
An update or delete compares the submitted version inside a transaction and
rejects stale requests with Conflict. A create submits version zero and a stable
client-generated ID. This prevents duplicate insertion when the same create is
repeated; it does not promise replay of a previous successful response.

Decode rows with Schema, including JSON columns. Do not trust TypeScript query
generics as runtime validation. Keep input schemas browser-safe; SQL and database
configuration remain server-only.

## Seed and recovery

New apps start empty. Run just seed only to add missing demonstration items.
Seeding must not overwrite edits and must not run on every process startup.

just backup destination creates a new file using the client's export operation.
Do not copy only a live app.sqlite file: committed content may reside in WAL.
Treat backups as sensitive user data and keep them outside the repository.

Restore into a new, existing directory with:
just restore backup.sqlite /path/to/new-directory/app.sqlite
The command refuses existing destinations and checks SQLite integrity. Stop the
application, set APP_DATA_DIR to the restored directory, and restart. Keep the
original directory until the restored app has been verified. Restoration tests
must prove actual saved records survive, not merely that a file exists.

## Optional storage capabilities

Read the installed effect/unstable/persistence source before implementation.

- KeyValueStore: small settings/preferences, namespaced keys, and schema-aware
  values. Its SQL layer can share the app's SqlClient. Keep relational records
  in feature tables; do not turn every record into opaque key/value JSON.
- Persistence: stores schema-encoded results of Persistable requests, including
  Exit values, with optional TTL. It is a result store, not a domain repository.
- PersistedCache: combines a process cache with Persistence. Use for expensive,
  reproducible lookups. Keys must include all result-affecting inputs and schema,
  prompt/model, or algorithm versions. Specify expiry, invalidation on source
  writes, capacity, and failure caching. Do not retain transient failures by
  accident, or treat cached model output as authoritative user data.
- RateLimiter: memory and Redis stores exist in this pinned version. Use memory
  for one local process when limiting outgoing traffic; do not add Redis merely
  for this capability. Restart resets memory quotas. Durable spending limits
  require their own authoritative accounting and cannot be inferred from rate
  limiting.

Do not eagerly wire unused settings, caches, or rate limiters into AppLive.

Sources: https://github.com/Effect-TS/effect/tree/main/packages/sql/sqlite-bun
and https://effect.website/docs/v4/api/effect/unstable/persistence/KeyValueStore
