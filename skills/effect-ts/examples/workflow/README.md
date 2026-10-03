# Bun + SQLite workflow integration fixture

A single Bun API process owns one Effect ManagedRuntime, a SingleRunner,
ClusterWorkflowEngine, and a SQLite database. The workflow prepares a value,
waits for approval, waits for a durable timer, then finishes. Each activity
appends an audit row so repeated execution is visible rather than hidden by
application deduplication.

## Run the integration check

From the catalog repository:

```sh
just workflow-integration-test
```

From an installed skill, use the distributable runner:

```sh
bun /path/to/effect-ts/scripts/test-workflow.ts
```

The runner copies this fixture into a temporary directory, installs frozen
locked dependencies there, typechecks, runs the HTTP integration test, builds
`server.ts` for Bun, and repeats the test against the bundle. Test processes
bind loopback on OS-assigned ports and use disposable SQLite files. Cleanup
removes dependencies, bundles, and databases without writing them into the
skill catalog. Requires Bun (verified with 1.4.0) and package registry access.

The test proves:

1. Start through HTTP and observe preparation plus approval suspension.
2. Kill the process with SIGKILL, reopen the same database, and verify the
   execution ID and prepared value survive. Starting the same ID again reuses
   its execution.
3. Approve through HTTP and observe the actual engine timer message in SQLite.
4. Kill again, let the recorded deadline pass while offline, and restart.
   The approval survives and the overdue timer resumes the workflow.
5. Verify the final result and exactly one audit row per activity; this fixture
   does not deduplicate audit writes.
6. Reopen after graceful shutdown and read the same completed result. A different
   business ID starts a distinct execution. Invalid payloads return HTTP 400.

This demonstrates recovery at recorded wait boundaries, not exactly-once
external side effects or recovery from every possible crash window. Production
adapters still need idempotency. It exercises Workflow, Activity,
DurableDeferred, DurableClock, and a persistent engine; queues, compensation,
proxies, and multiple replicas are outside this fixture's assertions.

## Run the API manually

Copy this directory outside the catalog before installing dependencies:

```sh
cp -R /path/to/effect-ts/examples/workflow /tmp/workflow-demo
cd /tmp/workflow-demo
bun install --frozen-lockfile
mkdir -p .data
WORKFLOW_DB="$PWD/.data/workflow.sqlite" PORT=4200 bun server.ts
```

Use these endpoints; path IDs are business IDs, while responses also expose the
engine's derived execution ID:

```sh
curl -X POST http://127.0.0.1:4200/runs \
  -H 'content-type: application/json' -d '{"id":"review-1"}'
curl http://127.0.0.1:4200/runs/review-1
curl -X POST http://127.0.0.1:4200/runs/review-1/approve \
  -H 'content-type: application/json' -d '{"approvedBy":"Ada"}'
curl http://127.0.0.1:4200/runs/review-1
```

`GET /health` checks readiness. Status is `pending`, `suspended`, `complete`, or
`failed`, with audit rows and the completed result when available. Approval and
timer waits both appear as suspended. Unknown execution IDs report pending.
The API is an unauthenticated loopback test fixture; production endpoints need
application identity, authorization, and explicit not-found semantics.

## Version and storage choices

Effect, platform-bun, and sql-sqlite-bun are pinned to `4.0.0-rc.116`, matching
the ts-application-skeleton foundation. The platform-node-shared override keeps
its transitive dependency on that same prerelease; a caret range can otherwise
resolve to the incompatible stable release. This version imports cluster,
workflow, and SQL modules through `effect/unstable/...`.

The SQL storage layers initialize their cluster schemas. The fixture creates
only its separate audit table. SQLite WAL and a one-second busy timeout follow
the skeleton's defaults. Both SQL runner storage and message storage persist.
Short shard-lock/poll intervals and a 1.5-second durable timer make crash tests
bounded; these timings are test choices, not production defaults. The runner
uses one shard and one active application process.
