# Local operation and maintenance

Default to one Bun process listening on loopback. Development uses Portless
and Vite hot reload; normal local operation uses a production build. Docker,
Kubernetes, public deployment, authentication providers, and external queues
are optional decisions driven by an actual requirement.

## Command contract

- just setup: install the committed lockfile.
- just doctor: check tool availability, data-directory writability, and provider
  configuration without printing credentials. It does not prove certificate
  trust, model availability, or database integrity.
- just dev: development with hot reload. Restart after environment changes.
- just build / just start: build and run the production app.
- just seed / backup / restore: explicit data operations; see local-persistence.md.
- just check / just test-browser: application and browser verification.

The startup log identifies the resolved data directory. Correlate failed requests
using the reference shown in the UI. Logs should identify operation, request ID,
duration, and outcome; never include credentials, raw prompts, SQL parameter
values, or arbitrary exception payloads. Keep log verbosity configurable.
Runtime acquisition must finish before serving application operations. Scope
resources to the shared runtime, and dispose it on shutdown and dev replacement.

## External calls

Every provider operation needs an explicit deadline and AbortSignal propagation.
The request bridge currently uses a 60-second deadline. Bound concurrency at the
service boundary when introducing parallel calls; a semaphore/concurrency limit
and a request-rate quota solve different problems.

Do not automatically retry mutations, agent tool executions, or paid requests
without understanding duplicate effects. Safe retries require proven idempotency,
a bounded Schedule, retryable error classification, and an overall deadline.
Respect provider rate-limit guidance where available. Cancellation must stop
local work and finalize resources; remote cancellation still depends on the SDK
and provider.

AI request counts are not token or money budgets. For budget controls, record
usage and cost assumptions, define per-run limits, and decide how unknown usage
is handled after interruption. Do not claim exact spending enforcement from a
token bucket.

## Optional extensions

- Background jobs: start scoped workers without blocking layer acquisition.
  Define progress, cancellation, concurrency, and restart semantics. In-memory
  queues lose pending jobs on exit; durable jobs need persisted state and
  idempotent/resumable steps. Keep jobs in the same process initially.
- Streaming: use an Effect Stream behind a streaming HTTP boundary when actual
  incremental results are needed. Specify backpressure, cancellation, and
  terminal errors. The current Pi example returns a complete response.
- Files: store files under a configured owned directory, constrain paths and
  size, use generated identifiers, and define database/file cleanup and backup.
  Do not accept arbitrary local paths from browser input.
- Authentication: local-only is a deployment assumption, not authentication.
  Preserve loopback binding, CSRF protection, and server-only secrets. Reassess
  origin, authentication, and authorization before LAN/public exposure.

## Foundation upgrades

Generated foundation.json records the template version, not the user's app
version. Generated apps are independent copies. Compare migration notes and
apply changes deliberately; never replace a customized app with a new template.

For dependency upgrades, preserve the lockfile, inspect compatibility between
Effect and its SQL adapter, run all checks, test database upgrade/reopen and
backup restoration, and exercise the built app. Back up real data before applying
a new schema migration. A rollback of application code may not undo a migration.

Version 0.2.0 introduces SQLite collections, explicit seeding, CRUD/version
conflicts, database maintenance commands, and browser tests. Earlier examples
used in-memory fixtures: no stored records require conversion. Existing apps
adopting this revision must choose APP_DATA_DIR, add the initial migration, and
opt into demo seeding if wanted.
