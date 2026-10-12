import { CodeMode, Namespace, Tool } from "@opencode/codemode"
import { Effect, Schema } from "effect"
import { LookupInput, Order, OrderLookup, orderLayer } from "./orders"

const lookup = Tool.make({
  description: "Read an order's delivery status",
  input: LookupInput,
  output: Order,
  execute: Effect.fn("OrderCodeMode.lookup")(function* ({ orderId }: LookupInput) {
    const orders = yield* OrderLookup
    return yield* orders.get(orderId)
  }),
})

export const makeCodeMode = (limits: CodeMode.ExecutionLimits = {
  timeoutMs: 5_000, maxToolCalls: 8, maxOutputBytes: 8_192,
}) => CodeMode.make({
  tools: { orders: Namespace.make({ description: "Read-only order information", tools: { lookup } }) },
  limits,
})

// This string is guest JavaScript in the interpreter. The Bun host and its tools use Effect.
export const program = `
  const orders = await Promise.all(["ORD-1", "ORD-2"].map(orderId =>
    tools.orders.lookup({ orderId })
  ))
  return orders.map(order => ({ orderId: order.orderId, status: order.status }))
`

export class CodeModeProgramError extends Schema.TaggedError<CodeModeProgramError>()(
  "CodeModeProgramError", { diagnostic: CodeMode.Diagnostic },
) {}

export const runCodeModeExample = Effect.fn("OrderCodeMode.demo")(function* () {
  const result = yield* makeCodeMode().execute(program)
  // Program diagnostics are result data, so success in the Effect channel is insufficient.
  if (!result.ok) return yield* Effect.fail(new CodeModeProgramError({ diagnostic: result.error }))
  return result
}, Effect.provide(orderLayer([
  { orderId: "ORD-1", status: "shipped" },
  { orderId: "ORD-2", status: "delivered" },
])))

if (import.meta.main) console.log(await Effect.runPromise(runCodeModeExample()))
