import { Model, Provider, Plugin } from "@opencode/plugin/effect"
import { Tool } from "@opencode/sdk/effect"
import { Effect, Schema } from "effect"
import { LookupInput, Order, type OrderLookupInterface } from "./orders"
import type { SyntheticModel } from "./model"

const providerID = Provider.ID.make("fixture")
const definition = {
  info: { ...Provider.Info.empty(providerID), activation: "enabled" as const,
    package: "aisdk:@ai-sdk/openai-compatible", settings: { baseURL: "http://127.0.0.1:1", apiKey: "synthetic" } },
  models: [Model.Info.default(providerID, Model.ID.make("orders"))],
}
const executeLookup = Effect.fn("OrderTool.lookup")((orders: OrderLookupInterface, input: Schema.Schema.Type<typeof LookupInput>) =>
  orders.get(input.orderId).pipe(
    Effect.flatMap(Schema.decodeUnknownEffect(Order)),
    Effect.map((output) => ({ output })),
    Effect.mapError((error) => new Tool.Error({ message: String(error) })),
  ))

// Capture the resolved application service. Tool executors require no hidden app environment.
export const effectPlugin = (orders: OrderLookupInterface, fixture: SyntheticModel) =>
  Plugin.define({ id: "orders", effect: (ctx) => Effect.gen(function* () {
    yield* ctx.provider.transform((editor) => editor.add(definition))
    yield* ctx.aisdk.hook("language", (event) => Effect.sync(() => { event.language = fixture.model }), { providerID: "fixture" })
    yield* ctx.session.hook("title", (event) => Effect.sync(() => { event.result = "Order lookup" }))
    yield* ctx.session.hook("context", (event) => Effect.sync(() => {
      for (const name of Object.keys(event.tools)) if (name !== "lookupOrder") delete event.tools[name]
    }))
    yield* ctx.tool.transform((editor) => editor.add({
      name: "lookupOrder", description: "Read an order's delivery status", input: LookupInput, output: Order,
      options: { codemode: false },
      execute: (input, context) => Effect.gen(function* () {
        yield* context.progress({ orderId: input.orderId })
        return yield* executeLookup(orders, input)
      }),
    }))
  }) })
