import { expect, test } from "bun:test"
import { Database } from "bun:sqlite"
import { mkdtemp, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { Schema } from "effect"

const RunStatus = Schema.Struct({
  state: Schema.Literals(["pending", "suspended", "complete", "failed"]),
  executionId: Schema.String,
  audit: Schema.Array(Schema.Struct({ step: Schema.String, value: Schema.String })),
  result: Schema.optional(Schema.Struct({ id: Schema.String, prepared: Schema.String, approvedBy: Schema.String })),
})
const Started = Schema.Struct({ executionId: Schema.String })

async function start(filename: string) {
  const child = Bun.spawn([process.execPath, process.env.WORKFLOW_SERVER ?? "server.ts"], {
    cwd: import.meta.dir,
    env: { ...process.env, WORKFLOW_DB: filename, PORT: "0" },
    stdout: "pipe", stderr: "pipe",
  })
  let log = ""
  let url: string | undefined
  async function capture(stream: ReadableStream<Uint8Array>, readiness: boolean) {
    const reader = stream.getReader()
    const decoder = new TextDecoder()
    let pending = ""
    while (true) {
      const { value, done } = await reader.read()
      if (done) return
      const text = decoder.decode(value, { stream: true })
      log = (log + text).slice(-24_000)
      pending += text
      const lines = pending.split("\n")
      pending = lines.pop() ?? ""
      if (readiness) for (const line of lines) {
        try {
          url = Schema.decodeUnknownSync(Schema.Struct({ url: Schema.String }))(JSON.parse(line)).url
        } catch { /* Effect diagnostics are not readiness messages. */ }
      }
    }
  }
  const output = Promise.all([capture(child.stdout, true), capture(child.stderr, false)])
  async function stop(signal: "SIGTERM" | "SIGKILL" = "SIGTERM") {
    const running = child.exitCode === null
    if (running) child.kill(signal)
    const deadline = setTimeout(() => child.kill("SIGKILL"), 3000)
    try {
      const code = await child.exited
      await output
      if (running && signal === "SIGTERM" && code !== 0) throw new Error(`Shutdown failed (${code}): ${log}`)
    } finally { clearTimeout(deadline) }
  }
  try {
    await until(async () => {
      if (child.exitCode !== null) throw new Error(`Server exited: ${log}`)
      return url
    }, "server readiness", 10_000)
  } catch (error) {
    await stop()
    throw new Error(`${error}\n${log}`)
  }
  if (!url) throw new Error("Server did not publish its URL")
  const origin = url
  return {
    stop,
    log: () => log,
    async request(path: string, body?: unknown) {
      return fetch(`${origin}${path}`, {
        method: body === undefined ? "GET" : "POST",
        headers: { "content-type": "application/json" },
        body: body === undefined ? undefined : JSON.stringify(body),
        signal: AbortSignal.timeout(3000),
      })
    },
    async status(id: string) {
      const response = await this.request(`/runs/${id}`)
      if (response.status !== 200) throw new Error(`Status ${response.status}: ${await response.text()}\n${log}`)
      return Schema.decodeUnknownSync(RunStatus)(await response.json())
    },
  }
}

// Real process/storage observations require bounded polling, not a simulated clock.
async function until<A>(read: () => Promise<A | undefined>, label: string, timeout = 10_000): Promise<A> {
  const deadline = Date.now() + timeout
  while (Date.now() < deadline) {
    const value = await read()
    if (value !== undefined) return value
    await Bun.sleep(25)
  }
  throw new Error(`Timed out waiting for ${label}`)
}

test("HTTP workflow survives crashes at approval and timer waits without repeating completed activities", async () => {
  const directory = await mkdtemp(join(tmpdir(), "workflow-sqlite-"))
  const filename = join(directory, "workflow.sqlite")
  let server: Awaited<ReturnType<typeof start>> | undefined
  const logs: string[] = []
  const active = () => {
    if (!server) throw new Error("Server is not running")
    return server
  }
  try {
    server = await start(filename)
    expect((await server.request("/runs", { id: 42 })).status).toBe(400)
    expect((await server.request("/missing")).status).toBe(404)
    const response = await server.request("/runs", { id: "review-1" })
    expect(response.status).toBe(202)
    const { executionId } = Schema.decodeUnknownSync(Started)(await response.json())
    const waiting = await until(async () => {
      const status = await active().status("review-1")
      if (status.state === "failed") throw new Error(active().log())
      return status.state === "suspended" && status.audit.length === 1 ? status : undefined
    }, "approval suspension")
    const prepared = waiting.audit[0].value
    expect(waiting.audit.map((event) => event.step)).toEqual(["prepare"])

    // Abrupt termination proves persistence rather than graceful finalizer behavior.
    await server.stop("SIGKILL")
    logs.push(server.log())
    server = await start(filename)
    const restored = await server.status("review-1")
    expect(restored.executionId).toBe(executionId)
    expect(restored.state).toBe("suspended")
    expect(restored.audit).toEqual(waiting.audit)
    const duplicate = Schema.decodeUnknownSync(Started)(await (await server.request("/runs", { id: "review-1" })).json())
    expect(duplicate.executionId).toBe(executionId)
    expect((await server.request("/runs/review-1/approve", { approvedBy: "" })).status).toBe(400)
    expect((await server.request("/runs/review-1/approve", { approvedBy: "Ada" })).status).toBe(202)

    // Inspect the real engine mailbox to prove the timer was persisted before crashing.
    const db = new Database(filename, { readonly: true })
    let clock: { payload: string }
    try {
      clock = await until(async () => db.query<{ payload: string }, []>(
        "SELECT payload FROM cluster_messages WHERE entity_type = 'Workflow/-/DurableClock' AND tag = 'run' LIMIT 1",
      ).get() ?? undefined, "persisted timer")
      expect(db.query<{ count: number }, []>("SELECT COUNT(*) AS count FROM cluster_replies").get()?.count).toBeGreaterThan(0)
    } finally { db.close() }
    const wakeUp = Schema.decodeUnknownSync(Schema.Struct({ wakeUp: Schema.Number }))(JSON.parse(clock.payload)).wakeUp
    await server.stop("SIGKILL")
    logs.push(server.log())
    // Let the persisted deadline pass while no server exists.
    await until(async () => Date.now() > wakeUp + 50 ? true : undefined, "deadline while offline", 5000)
    server = await start(filename)
    const complete = await until(async () => {
      const status = await active().status("review-1")
      if (status.state === "failed") throw new Error(active().log())
      return status.state === "complete" ? status : undefined
    }, "completion after overdue timer recovery")
    expect(complete.result).toEqual({ id: "review-1", prepared, approvedBy: "Ada" })
    expect(complete.audit.map((event) => event.step)).toEqual(["prepare", "finish"])
    const finished = Schema.decodeUnknownSync(Started)(await (await server.request("/runs", { id: "review-1" })).json())
    expect(finished.executionId).toBe(executionId)
    expect((await server.status("review-1")).audit).toEqual(complete.audit)

    // Graceful reopen preserves the completed result too.
    await server.stop()
    logs.push(server.log())
    server = await start(filename)
    expect(await server.status("review-1")).toEqual(complete)
    const distinct = Schema.decodeUnknownSync(Started)(await (await server.request("/runs", { id: "review-2" })).json())
    expect(distinct.executionId).not.toBe(executionId)
    await until(async () => (await active().status("review-2")).state === "suspended" ? true : undefined, "independent run")
  } catch (error) {
    throw new Error(`${error}\n${[...logs, server?.log() ?? ""].join("\n")}`)
  } finally {
    try { await server?.stop() } finally {
      await rm(directory, { recursive: true, force: true })
    }
  }
}, 45_000)
