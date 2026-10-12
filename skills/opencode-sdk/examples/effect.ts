import { AbsolutePath, Location, OpenCode, type Session } from "@opencode/sdk/effect"
import { Config, Context, Deferred, Effect, Exit, Layer, Schema, Stream } from "effect"
import { OrderLookup, orderLayer } from "./orders"
import { effectPlugin } from "./plugins"
import { syntheticModel, type SyntheticModel } from "./model"
import { settings } from "./settings"
import { completedAnswer } from "./results"

export const runTurn = Effect.fn("OpenCode.runTurn")((host: OpenCode.Interface, session: Session.Info, text: string,
  onProgress: (delta: string) => void = () => {}) => Effect.scoped(Effect.gen(function* () {
  const ready = yield* Deferred.make<void, unknown>()
  const finished = yield* Deferred.make<void, unknown>()
  yield* host.events.subscribe().pipe(
    Stream.buffer({ capacity: 64, strategy: "suspend" }),
    Stream.runForEach((event) => {
      if (event.type === "server.connected") return Deferred.succeed(ready, undefined)
      if (event.type === "session.text.delta" && event.data.sessionID === session.id &&
        event.location?.directory === session.location.directory) return Effect.sync(() => onProgress(event.data.delta))
      if ((event.type === "session.execution.succeeded" || event.type === "session.execution.failed" || event.type === "session.execution.interrupted") && event.data.sessionID === session.id) return Deferred.succeed(finished, undefined)
      return Effect.void
    }),
    Effect.onExit((exit) => {
      const cause = Exit.isFailure(exit) ? exit.cause : undefined
      return cause ? Deferred.failCause(ready, cause).pipe(Effect.andThen(Deferred.failCause(finished, cause))) : Deferred.fail(ready, new Error("Progress stream ended before readiness")).pipe(Effect.andThen(Deferred.fail(finished, new Error("Progress stream ended before execution event"))))
    }),
    Effect.forkScoped,
  )
  yield* Deferred.await(ready)
  const input = yield* host.sessions.prompt({ sessionID: session.id, text, delivery: "queue" })
  yield* host.sessions.wait({ sessionID: session.id })
  yield* Deferred.await(finished)
  const messages = yield* host.sessions.context({ sessionID: session.id })
  return yield* Effect.try(() => ({ inputID: input.id, text: completedAnswer(messages, input.id) }))
})).pipe(
  Effect.onInterrupt(() => host.sessions.interrupt({ sessionID: session.id }).pipe(
    Effect.andThen(host.sessions.wait({ sessionID: session.id })), Effect.orDie,
  )),
  Effect.timeout("30 seconds"),
))

export class AgentRunError extends Schema.TaggedError<AgentRunError>()(
  "AgentRunError", { message: Schema.String },
) {}
export interface OrderAgentInterface {
  readonly lookup: (orderId: string) => Effect.Effect<{ inputID: string; text: string }, AgentRunError>
}
export class OrderAgent extends Context.Service<OrderAgent, OrderAgentInterface>()("@example/OrderAgent") {}

export const agentLayer = (root: string, fixture: SyntheticModel = syntheticModel()) => Layer.unwrap(Effect.gen(function* () {
  const orders = yield* OrderLookup
  const domain = Layer.effect(OrderAgent, Effect.gen(function* () {
    const host = yield* OpenCode.Service
    return OrderAgent.of({ lookup: Effect.fn("OrderAgent.lookup")((orderId: string) => Effect.gen(function* () {
      const session = yield* host.sessions.create({ location: Location.Ref.make({ directory: AbsolutePath.make(root) }) })
      return yield* runTurn(host, session, `Look up ${orderId}`)
    }).pipe(Effect.mapError((error) => new AgentRunError({ message: String(error) })))) })
  }))
  return domain.pipe(Layer.provide(OpenCode.layer({ ...settings(root), plugins: [effectPlugin(orders, fixture)] })))
}))

export const runEffectExample = Effect.fn("OrderAgent.runExample")((root: string, fixture: SyntheticModel = syntheticModel()) =>
  Effect.gen(function* () {
    const agent = yield* OrderAgent
    return yield* agent.lookup("ORD-1")
  }).pipe(Effect.provide(agentLayer(root, fixture).pipe(Layer.provide(orderLayer())))))

if (import.meta.main) {
  await Effect.runPromise(Effect.gen(function* () {
    const root = yield* Config.String("OPENCODE_EXAMPLE_ROOT")
    console.log(yield* runEffectExample(root))
  }))
}
