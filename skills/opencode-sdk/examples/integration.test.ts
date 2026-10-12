import { expect, test } from "bun:test"
import { mkdtemp, mkdir, writeFile } from "node:fs/promises"
import { join } from "node:path"
import { AbsolutePath, Location, OpenCode } from "@opencode/sdk/effect"
import { Plugin } from "@opencode/plugin/effect"
import { Config, Deferred, Effect, Fiber, Stream } from "effect"
import { OrderLookup, orderLayer } from "./orders"
import { effectPlugin } from "./plugins"
import { syntheticModel, type Scenario } from "./model"
import { settings } from "./settings"
import { runEffectExample, runTurn } from "./effect"
import { completedAnswer } from "./results"

const base = Effect.runSync(Config.String("OPENCODE_EXAMPLE_ROOT"))
const directory = () => mkdtemp(join(base, "case-"))
const location = (root: string) => Location.Ref.make({ directory: AbsolutePath.make(root) })

async function failure(scenario: Scenario, prompt = "Look up ORD-1") {
  const root = await directory()
  const fixture = syntheticModel(scenario)
  return Effect.runPromise(Effect.scoped(Effect.gen(function* () {
    const orders = yield* OrderLookup
    const host = yield* OpenCode.create({ ...settings(root), plugins: [effectPlugin(orders, fixture)] })
    const session = yield* host.sessions.create({ location: location(root) })
    const input = yield* host.sessions.prompt({ sessionID: session.id, text: prompt })
    yield* host.sessions.wait({ sessionID: session.id })
    const messages = yield* host.sessions.context({ sessionID: session.id })
    expect(() => completedAnswer(messages, input.id)).toThrow()
    return { fixture, messages }
  })).pipe(Effect.provide(orderLayer())))
}

test("native Effect demo obtains a completed tool-assisted answer on Bun", async () => {
  const result = await Effect.runPromise(runEffectExample(await directory()))
  expect(result.text).toBe("ORD-1: shipped")
})

test("replacement app service, sequential correlation, progress filtering, and session isolation", async () => {
  const root = await directory()
  const fixture = syntheticModel()
  await Effect.runPromise(Effect.scoped(Effect.gen(function* () {
    const orders = yield* OrderLookup
    const host = yield* OpenCode.create({ ...settings(root), plugins: [effectPlugin(orders, fixture)] })
    const a = yield* host.sessions.create({ location: location(root) })
    const b = yield* host.sessions.create({ location: location(root) })
    const deltas: string[] = []
    const aRun = yield* runTurn(host, a, "Look up ORD-1", (delta) => deltas.push(delta)).pipe(Effect.forkScoped)
    const second = yield* runTurn(host, b, "Look up ORD-2")
    const first = yield* Fiber.join(aRun)
    expect(first.text).toContain("test-layer")
    expect(first.text).not.toContain("delivered")
    expect(second.text).toContain("delivered")
    expect(deltas.join("")).toBe(first.text)
    const later = yield* runTurn(host, a, "Look up ORD-2")
    expect(later.inputID).not.toBe(first.inputID)
    const context = yield* host.sessions.context({ sessionID: a.id })
    expect(completedAnswer(context, first.inputID)).toBe(first.text)
    expect(completedAnswer(context, later.inputID)).toBe(later.text)
    expect(deltas.join("")).toBe(first.text) // first run's subscription has ended
    expect(fixture.requests.every((request) => request.tools?.every((tool) => tool.name === "lookupOrder"))).toBe(true)
  })).pipe(Effect.provide(orderLayer([
    { orderId: "ORD-1", status: "test-layer" }, { orderId: "ORD-2", status: "delivered" },
  ]))))
})

test("malformed tool input stays a tool failure", async () => {
  const { messages } = await failure("malformed")
  expect(JSON.stringify(messages)).toContain("error")
})
test("domain failure stays visible even if the model emits fallback text", async () => {
  const { messages } = await failure("success", "Look up ORD-MISSING")
  expect(JSON.stringify(messages)).toContain("OrderNotFound")
})
test("provider failure is visible after wait resolves", async () => {
  const { messages } = await failure("provider-error")
  expect(JSON.stringify(messages)).toContain("Synthetic provider failure")
})
test("a requested write tool cannot execute", async () => {
  const { fixture, messages } = await failure("forbidden")
  expect(fixture.requests[0]?.tools?.map((tool) => tool.name)).toEqual(["lookupOrder"])
  expect(JSON.stringify(messages)).toContain('No tool named')
})

test("caller interruption aborts model I/O, disposes plugins, and releases host resources", async () => {
  const root = await directory()
  const fixture = syntheticModel("blocked")
  let cleaned = 0
  await Effect.runPromise(Effect.scoped(Effect.gen(function* () {
    const pending = yield* Effect.scoped(Effect.gen(function* () {
      const orders = yield* OrderLookup
      const cleanup = Plugin.define({ id: "cleanup-observer", effect: () => Effect.addFinalizer(() => Effect.sync(() => { cleaned++ })) })
      const host = yield* OpenCode.create({ ...settings(root), plugins: [effectPlugin(orders, fixture), cleanup] })
      const session = yield* host.sessions.create({ location: location(root) })
      return yield* runTurn(host, session, "Look up ORD-1")
    })).pipe(Effect.provide(orderLayer()), Effect.forkScoped)
    yield* fixture.started
    yield* Fiber.interrupt(pending)
    yield* fixture.aborted
    expect(cleaned).toBeGreaterThan(0)
  })))
})

test("pending permission is observable and explicitly rejected", async () => {
  const root = await directory()
  await Effect.runPromise(Effect.scoped(Effect.gen(function* () {
    const host = yield* OpenCode.create(settings(root))
    const session = yield* host.sessions.create({ location: location(process.cwd()), permissions: [{ action: "order.read", resource: "*", effect: "ask" }] })
    const ready = yield* Deferred.make<void>()
    const asked = yield* Deferred.make<void>()
    yield* host.events.subscribe().pipe(Stream.runForEach((event) => {
      if (event.type === "server.connected") return Deferred.succeed(ready, undefined)
      if (event.type === "permission.asked" && event.data.sessionID === session.id) return Deferred.succeed(asked, undefined)
      return Effect.void
    }), Effect.forkScoped)
    yield* Deferred.await(ready)
    const request = yield* host.permission.create({ sessionID: session.id, action: "order.read", resources: ["ORD-1"] }).pipe(Effect.forkScoped)
    yield* Deferred.await(asked)
    const pending = yield* host.permission.list({ sessionID: session.id })
    const permission = pending[0]
    if (!permission) throw new Error("Expected a pending permission")
    yield* host.permission.reply({ sessionID: session.id, requestID: permission.id, decision: "reject" })
    const result = yield* Fiber.join(request)
    expect(result.effect).toBe("ask") // create admits a request; reply does not rewrite that response
    expect(yield* host.permission.list({ sessionID: session.id })).toEqual([])
  })))
})

test("explicit config directory and project:false exclude unwanted config", async () => {
  const root = await directory()
  const ambient = join(Effect.runSync(Config.String("XDG_CONFIG_HOME")), "opencode")
  await mkdir(ambient, { recursive: true })
  await writeFile(join(ambient, "opencode.json"), JSON.stringify({ agents: { ambientMustNotLoad: { description: "sentinel" } } }))
  await writeFile(join(root, "opencode.json"), JSON.stringify({ agents: { projectMustNotLoad: { description: "sentinel" } } }))
  await Effect.runPromise(Effect.scoped(Effect.gen(function* () {
    const orders = yield* OrderLookup
    const host = yield* OpenCode.create({ ...settings(root), plugins: [effectPlugin(orders, syntheticModel())] })
    const session = yield* host.sessions.create({ location: location(root) })
    const agents = yield* host.agent.list({ location: location(root) })
    expect(JSON.stringify(agents)).not.toContain("MustNotLoad")
    const answer = yield* runTurn(host, session, "Look up ORD-1")
    expect(answer.text).toContain("shipped")
  })).pipe(Effect.provide(orderLayer())))
})

test("event subscriber disposal permits a fresh live subscription", async () => {
  const root = await directory()
  await Effect.runPromise(Effect.scoped(Effect.gen(function* () {
    const host = yield* OpenCode.create(settings(root))
    for (let index = 0; index < 2; index++) {
      const events = yield* host.events.subscribe().pipe(Stream.take(1), Stream.runCollect)
      expect(events[0]?.type).toBe("server.connected")
    }
  })))
})

test("native Effect network client requires resubscription after event loss", async () => {
  const { OpenCode: Client } = await import("@opencode/client/effect")
  const { FetchHttpClient } = await import("effect/http")
  let attempts = 0
  // A platform transport double is the SDK boundary; application flow stays in Effect.
  const transport = Object.assign(async () => {
    attempts++
    const event = { id: "evt_fixture", type: "server.connected", created: Date.now(), data: {} }
    return new Response(`data: ${JSON.stringify(event)}\n\n`, { headers: { "content-type": "text/event-stream" } })
  }, { preconnect() {} })
  await Effect.runPromise(Effect.gen(function* () {
    const client = yield* Client.make({ baseUrl: "http://fixture.invalid" })
    for (let index = 0; index < 2; index++) {
      const events = yield* client.event.subscribe().pipe(Stream.runCollect)
      expect(events.map((event) => event.type)).toEqual(["server.connected"])
      expect(attempts).toBe(index + 1) // no automatic reconnect on EOF
    }
  }).pipe(Effect.provide(FetchHttpClient.layer), Effect.provideService(FetchHttpClient.Fetch, transport)))
})
