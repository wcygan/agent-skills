# Durable Workflows

Use this when implementing processes that must preserve progress across restarts,
wait for external signals, delegate work to persisted workers, or expose durable
workflow operations over HTTP/RPC. Read the queue and proxy sections only when
those integrations are needed.

## Choose The Surface

| Need | Default |
| --- | --- |
| Request-scoped composition | `Effect.gen` and application services |
| Retry, polling, pacing, or repeat without persisted progress | `Schedule`; see `SCHEDULING.md` |
| Persisted process identity and resumable steps | `Workflow` + `Activity` + a persistent `WorkflowEngine` |
| Named workflow delay | `DurableClock` |
| Wait for approval or callback | `DurableDeferred` |
| Delegate a step to persisted background workers and await its result | `DurableQueue` |
| Derive remote execution contracts | `WorkflowProxy` + `WorkflowProxyServer` |

Select durable workflows when losing progress matters. Several sequential
operations alone do not justify introducing an engine.

## Source And Version Checks

- Check the project's resolved `effect` version and declarations before adapting
  examples. These v4 modules are unstable.
- Current v4 imports use `effect/workflow`, without an `unstable` path segment.
- Check the chosen engine's storage, restart, and deployment requirements.
  Durability comes from its implementation and backing storage, not from names
  such as `Workflow` or `DurableDeferred` alone.

## Define, Register, Execute

1. Define `Workflow.make(tag, { payload, success, error, idempotencyKey })`.
   Choose a stable business operation key; the tag and key derive its execution
   ID. Specify schemas for values that cross the persistence boundary.
2. Put external operations in named `Activity.make({ name, success, error,
   execute })` steps. Keep ordinary pure composition in the workflow handler.
3. Register the handler with the definition's `toLayer(handler)`. Supply its
   application service dependencies and the shared engine through layers.
4. Call `execute(payload)` to await the typed result, or
   `execute(payload, { discard: true })` to return the execution ID without
   waiting for completion. `discard` does not delete the execution.
5. Use `poll(executionId)` for status, `resume(executionId)` for a suspended run,
   and `interrupt(executionId)` for interruption. Poll returns an `Option` of
   `Complete` (containing an `Exit`) or `Suspended`; handle all cases.

Minimal local composition, using an activity with no external side effects:

```ts
import { Effect, Layer, Schema } from "effect"
import { Activity, Workflow, WorkflowEngine } from "effect/workflow"

const Greeting = Workflow.make("Greeting", {
  payload: { requestId: Schema.String, name: Schema.String },
  success: Schema.String,
  idempotencyKey: ({ requestId }) => requestId,
})

const GreetingHandler = Greeting.toLayer((payload) =>
  Effect.gen(function* () {
    return yield* Activity.make({
      name: "BuildGreeting",
      success: Schema.String,
      execute: Effect.succeed(`Hello, ${payload.name}`),
    })
  }),
)

// Share one engine between handler registration and callers.
const Engine = WorkflowEngine.layerMemory
const Registered = GreetingHandler.pipe(Layer.provide(Engine))
const Runtime = Layer.merge(Engine, Registered)

const program = Greeting.execute({ requestId: "greeting-1", name: "Ada" }).pipe(
  Effect.provide(Runtime),
)
```

`layerMemory` is for local development and tests. It loses state when its runtime
is torn down. Production restart durability requires a persistent engine;
`ClusterWorkflowEngine` integrates cluster sharding and message storage. Verify
its storage layers and runner lifecycle against the installed version before
constructing production wiring.

## Single-Process Bun + SQLite Pattern

For a Bun application that needs restart recovery, prefer one process-owned
runtime with `SingleRunner` and `ClusterWorkflowEngine` backed by local SQLite.
`SingleRunner` is designed for embedded and single-node durable workflows;
the cluster APIs do not require a separate worker process or distributed deployment.
Use this pattern when durable execution is required, while retaining the
application's existing single-process architecture.

```text
One Bun process
  TanStack Start routes/server functions -> application services
  Shared Effect ManagedRuntime
    workflow handler registrations + application services
    ClusterWorkflowEngine -> SingleRunner -> SQLite
```

- In a `ts-application-skeleton` app, compose the database, single runner,
  engine, and handler registrations in `src/server/layers.ts`. Own the shared
  runtime in `src/server/runtime.ts` and dispose it on process shutdown.
- `SingleRunner.layer` supplies sharding, runners, and SQL-backed message
  storage. `ClusterWorkflowEngine.layer` consumes sharding/message storage and
  registers durable clock wakeups. Supply their SQL, crypto, and configuration
  dependencies explicitly according to the pinned declarations.
- Prefer the app's existing `@effect/sql-sqlite-bun` client and persistent data
  directory when compatible. Verify the pinned cluster SQL storage's SQLite
  support, schema initialization, and migration requirements before wiring it.
  Domain tables alone do not persist workflow execution state.
- Build this layer graph once per production process. Request handlers call
  application services through the shared runtime; they do not construct a
  fresh engine or runner for each request.
- For long work, start with `execute(payload, { discard: true })`, return the
  execution ID, and expose authorized status/callback endpoints. Keep durable
  work owned by the process runtime rather than the initiating HTTP request's
  deadline or cancellation scope; verify disconnect behavior at that boundary.
- Activities and optional persisted queue workers can run in the same process.
  Add `DurableQueue` only for actual persisted delegation requirements. Start
  server functions can call services directly; proxies are optional.
- Keep SQLite transactions short and provider/model calls outside them. Bound
  concurrency and move CPU-heavy work off the request-serving thread when needed.
- State survives only when backing storage survives. Work pauses while Bun is
  stopped; restarting must re-register handlers and recover pending executions.
  Verify owner replacement, recorded results, callbacks, and overdue timers
  against the actual SQLite-backed runtime before claiming restart recovery.
- Use `SingleRunner` for one active process. Its no-op runner communication and
  health services do not provide coordination for multiple application replicas.

Check the generated app's pinned Effect and SQL adapter versions before using
current imports such as `effect/cluster`. Older v4 prereleases can differ from
the current API pages; resolve compatibility before copying layer wiring.

Source: [SingleRunner](https://effect.website/docs/v4/api/effect/cluster/SingleRunner)
and [ClusterWorkflowEngine](https://effect.website/docs/v4/api/effect/cluster/ClusterWorkflowEngine).

### Executable Integration Evidence

Use the bundled [Bun API fixture](../examples/workflow/README.md) as the verified
single-process wiring example. It pins Effect and the Bun adapters to
`4.0.0-rc.116`, including the platform-node-shared transitive override. Its
`effect/unstable/...` imports match that prerelease; adapt them only after
checking the destination app's resolved version.

Run `just workflow-integration-test` from this repository, or
`bun /path/to/effect-ts/scripts/test-workflow.ts` from an installed skill.
The runner installs dependencies in a disposable copy, typechecks, tests through
HTTP, builds a Bun bundle, and repeats the test against that bundle.

The test kills the API process while awaiting approval, reopens the same SQLite
database, approves the run, kills it again after its durable timer is persisted,
and restarts after the deadline. It verifies the original activity value and
approval survive, the overdue timer completes, completed activities have not
rerun, and duplicate starts reuse the execution ID. It also verifies completed
results after graceful reopen. This establishes recovery at those wait
boundaries; external side-effect crash windows still require idempotency.

## Replay And Idempotency

- Treat the handler as replayable orchestration. Put side effects and values
  whose original outcome matters, such as provider responses or generated IDs,
  behind recorded activity results.
- Only completed activity results are memoized. An activity that suspends while
  awaiting a child workflow or clock runs again on replay; effects preceding
  that suspension can repeat. Prefer separate completed activities around waits.
- A crash can occur after an external operation succeeds and before its result
  is recorded. Use the provider's idempotency facility or application-level
  deduplication; an activity is not an exactly-once side-effect guarantee.
- Use `Activity.idempotencyKey(name)` for a deterministic provider key within
  an execution. Include the retry attempt only when each attempt intentionally
  represents a distinct operation; retries of the same charge need the same key.
- `Activity.retry` updates `CurrentAttempt` while retrying. Apply bounded policies
  to classified transient failures; see `SCHEDULING.md` for policy design.
- Keep tags, step names, keys, and persisted schemas compatible with existing
  executions. For repeated steps, choose distinct stable names based on item
  identity. Plan versioning/migration before changing replayed behavior.
- Use `Activity.raceAll` or `DurableDeferred.raceAll` when the winning result must
  be recorded for replay. A race winner does not undo losing external effects.

## Durable Waits

### Timers

Use `DurableClock.sleep({ name, duration, inMemoryThreshold? })` inside a workflow.
Zero durations are skipped; durations at or below the threshold use an in-memory
activity, while longer waits are scheduled by the engine and await a durable
wake-up signal. Choose the threshold deliberately and verify its default in the
pinned source; short sleeps do not have the same persisted timer behavior.

### External Signals

Define `DurableDeferred.make` with a stable name and result schemas. Obtain its
completion token with the pinned API's `token`/`tokenFromPayload` helpers, arrange
for the callback to receive it, then use `DurableDeferred.await` in the workflow.
An absent result suspends the execution until completion is recorded.

External code uses `succeed`, `fail`, or `done` with the token to record the typed
result through the engine. Tokens identify workflow name, execution ID, and wait
point; they are routing identifiers. Authenticate callbacks and authorize the
business operation before completing the deferred.

For approval deadlines, compose the signal and durable timer with a durable race.
Specify what a late callback means and verify duplicate completion semantics
against the selected engine. Keep signal publication replay-safe too.

## Failure, Compensation, And Cleanup

- Distinguish typed failures, defects, suspension, and terminal interruption.
  Suspension is a parked execution, not success or an ordinary completed failure.
- Use `withCompensation` on a top-level workflow step to register a compensating
  action when that step succeeds and the overall workflow later fails.
  Compensation does not register inside nested activities. Make compensation
  replay-safe and handle its own failures truthfully; it is not a database rollback.
- Use `Workflow.addFinalizer` for terminal-state work that must observe deposited
  workflow interrupts. Body-level `Effect.onExit` cannot observe those interrupts.
  Finalizers are skipped when a cluster owner abandons an attempt for replay;
  distinguish terminal cleanup from owner-local resource cleanup.
- Consult `Workflow.provideScope` for scope-dependent work. The workflow scope
  closes on full completion; avoid retaining scarce resources across long waits.
- Enable `SuspendOnFailure` only with a defined repair/resume path and visible
  parked-run status. Check `CaptureDefects` and failure annotation behavior in the
  pinned version rather than silently changing failure policy.

## Persisted Workers (When Delegating Steps)

`DurableQueue.make` defines payload/result schemas and an idempotency key.
`DurableQueue.process(queue, payload)` offers an item to a named `PersistedQueue`,
attaches a deferred token, and suspends until a worker records the handler's exit.
Use `worker` for a worker layer or `makeWorker` for explicit lifecycle wiring.
Supply the persistence dependencies and bounded concurrency required by the
installed API.

- Delivery is at least once: handler success followed by a crash before
  acknowledgement can redeliver the item. Make workers idempotent.
- Exhausted queue attempts dead-letter the item and leave its deferred unresolved.
  The workflow stays parked until the item is requeued out of band; ID-based
  deduplication prevents workflow replay from resurrecting it.
- Define alerting and requeue ownership for dead letters. An unresolved deferred
  needs operational recovery, not an unconditional workflow retry.
- Run `PersistedQueue.layerCleanup` in one instance to prune completed items.
- Use an ordinary `Queue` for process-local coordination; durable queues add
  persistence and recovery requirements.

## HTTP/RPC Exposure (When Remote Callers Need It)

Derive contracts with `WorkflowProxy.toHttpApiGroup(name, workflows)` or
`toRpcGroup(workflows, { prefix? })`. Implement them with
`WorkflowProxyServer.layerHttpApi` or `layerRpcHandlers`, then wire the HTTP/RPC
server, handler registrations, schema services, and engine on the server side.

Generated operations are execute, discard, and resume. Polling, interruption,
callback completion, authentication, and business authorization require their
own application wiring. Use discard for callers that need an execution ID
without holding the request open; provide an explicit status interface when
clients need completion tracking.

## Verification

Use the project's Effect test setup; see `TESTING.md`. Prove the selected branches:

- Same execution identity reuses completed activity results; distinct business
  operations receive distinct identities.
- Signals suspend and resume with typed values/errors; exercise timeout and late
  callback behavior when deadlines exist.
- External retries and worker redelivery do not duplicate business side effects.
- Compensation executes after a later terminal failure at the intended boundary.
- Queue exhaustion produces visible parked runs and the requeue procedure works.
- Remote contracts match the generated operations and application authorization.

Memory-engine tests establish local behavior only. For a durability claim, restart
or replace the owner against the real persistent backend and verify recorded
results, signals, and timer wakeups survive. Typecheck examples against the
project's pinned version before copying them into production code.

## Official References

- [Workflow](https://effect.website/docs/v4/api/effect/workflow/Workflow)
- [Activity](https://effect.website/docs/v4/api/effect/workflow/Activity)
- [WorkflowEngine](https://effect.website/docs/v4/api/effect/workflow/WorkflowEngine)
- [DurableClock](https://effect.website/docs/v4/api/effect/workflow/DurableClock)
- [DurableDeferred](https://effect.website/docs/v4/api/effect/workflow/DurableDeferred)
- [DurableQueue](https://effect.website/docs/v4/api/effect/workflow/DurableQueue)
- [WorkflowProxy](https://effect.website/docs/v4/api/effect/workflow/WorkflowProxy)
- [WorkflowProxyServer](https://effect.website/docs/v4/api/effect/workflow/WorkflowProxyServer)
- [ClusterWorkflowEngine](https://effect.website/docs/v4/api/effect/cluster/ClusterWorkflowEngine)
