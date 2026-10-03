import * as BunCrypto from "@effect/platform-bun/BunCrypto"
import { SqliteClient } from "@effect/sql-sqlite-bun"
import { Effect, Exit, Layer, ManagedRuntime, Option, Schema } from "effect"
import { ClusterWorkflowEngine, SingleRunner } from "effect/unstable/cluster"
import { SqlClient } from "effect/unstable/sql"
import { Activity, DurableClock, DurableDeferred, Workflow } from "effect/unstable/workflow"

const filename = process.env.WORKFLOW_DB
if (!filename) throw new Error("WORKFLOW_DB must name a persistent SQLite file")

const Payload = Schema.Struct({ id: Schema.String.check(Schema.isPattern(/^[a-z0-9-]{1,64}$/)) })
const Approval = DurableDeferred.make("Approval", { success: Schema.String })
const Review = Workflow.make("Review", {
  payload: Payload,
  success: Schema.Struct({ id: Schema.String, prepared: Schema.String, approvedBy: Schema.String }),
  idempotencyKey: ({ id }) => id,
})

const Database = SqliteClient.layer({ filename, busyTimeout: "1 second" })
const Runner = SingleRunner.layer({
  shardingConfig: {
    shardsPerGroup: 1,
    shardLockExpiration: "1 second",
    shardLockRefreshInterval: "200 millis",
    entityMessagePollInterval: "50 millis",
    entityReplyPollInterval: "50 millis",
    refreshAssignmentsInterval: "100 millis",
  },
}).pipe(Layer.provide(Database), Layer.provide(BunCrypto.layer))
const Engine = ClusterWorkflowEngine.layer.pipe(Layer.provide(Runner))

// Intentionally append every invocation: duplicate execution remains observable.
// This audit is evidence of activity replay behavior, not a deduplicating adapter.
const record = (id: string, step: string) => Effect.gen(function* () {
  const sql = yield* SqlClient.SqlClient
  const value = crypto.randomUUID()
  yield* sql`INSERT INTO audit (run_id, step, value) VALUES (${id}, ${step}, ${value})`
  return value
}).pipe(Effect.orDie)

const Handler = Review.toLayer(({ id }) => Effect.gen(function* () {
  const prepared = yield* Activity.make({
    name: "Prepare", success: Schema.String, execute: record(id, "prepare"),
  })
  const approvedBy = yield* DurableDeferred.await(Approval)
  yield* DurableClock.sleep({ name: "Settlement", duration: "1500 millis", inMemoryThreshold: 0 })
  yield* Activity.make({ name: "Finish", success: Schema.String, execute: record(id, "finish") })
  return { id, prepared, approvedBy }
})).pipe(Layer.provide(Database), Layer.provide(Engine))
const runtime = ManagedRuntime.make(Layer.mergeAll(Database, Engine, Handler))

await runtime.runPromise(Effect.gen(function* () {
  const sql = yield* SqlClient.SqlClient
  yield* sql`CREATE TABLE IF NOT EXISTS audit (
    run_id TEXT NOT NULL, step TEXT NOT NULL, value TEXT NOT NULL
  )`
}))

const status = (id: string) => Effect.gen(function* () {
  const executionId = yield* Review.executionId({ id })
  const result = yield* Review.poll(executionId)
  const sql = yield* SqlClient.SqlClient
  const audit = yield* sql<{ step: string; value: string }>`SELECT step, value FROM audit WHERE run_id = ${id} ORDER BY rowid`
  if (Option.isNone(result)) return { state: "pending", executionId, audit }
  if (result.value._tag === "Suspended") return { state: "suspended", executionId, audit }
  if (Exit.isFailure(result.value.exit)) {
    console.error(result.value.exit.cause)
    return { state: "failed", executionId, audit }
  }
  return { state: "complete", executionId, audit, result: result.value.exit.value }
})

const server = Bun.serve({
  hostname: "127.0.0.1", port: Number(process.env.PORT ?? 0),
  async fetch(request) {
    try {
      const path = new URL(request.url).pathname
      if (request.method === "GET" && path === "/health") return Response.json({ ready: true })
      if (request.method === "POST" && path === "/runs") {
        const decoded = await runtime.runPromiseExit(Schema.decodeUnknownEffect(Payload)(await request.json()))
        if (Exit.isFailure(decoded)) return Response.json({ error: "Invalid run ID" }, { status: 400 })
        const executionId = await runtime.runPromise(Review.execute(decoded.value, { discard: true }))
        return Response.json({ executionId }, { status: 202 })
      }
      const match = /^\/runs\/([a-z0-9-]{1,64})(\/approve)?$/.exec(path)
      if (!match) return Response.json({ error: "Not found" }, { status: 404 })
      const id = match[1]
      if (request.method === "GET" && !match[2]) return Response.json(await runtime.runPromise(status(id)))
      if (request.method === "POST" && match[2]) {
        const decoded = await runtime.runPromiseExit(Schema.decodeUnknownEffect(
          Schema.Struct({ approvedBy: Schema.String.check(Schema.isMinLength(1)) }),
        )(await request.json()))
        if (Exit.isFailure(decoded)) return Response.json({ error: "Invalid approval" }, { status: 400 })
        await runtime.runPromise(Effect.gen(function* () {
          const token = yield* DurableDeferred.tokenFromPayload(Approval, { workflow: Review, payload: { id } })
          yield* DurableDeferred.succeed(Approval, { token, value: decoded.value.approvedBy })
        }))
        return Response.json({ accepted: true }, { status: 202 })
      }
      return Response.json({ error: "Not found" }, { status: 404 })
    } catch (error) {
      if (error instanceof SyntaxError) return Response.json({ error: "Invalid JSON" }, { status: 400 })
      console.error(error)
      return Response.json({ error: "Internal error" }, { status: 500 })
    }
  },
})
console.log(JSON.stringify({ url: server.url.origin }))

let closing = false
async function shutdown() {
  if (closing) return
  closing = true
  await server.stop(true)
  await runtime.dispose()
  process.exit(0)
}
process.on("SIGTERM", shutdown)
process.on("SIGINT", shutdown)
