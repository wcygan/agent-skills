import { expect, test } from "bun:test"
import { CodeMode } from "@opencode/codemode"
import { Effect } from "effect"
import { orderLayer } from "./orders"
import { makeCodeMode, runCodeModeExample } from "./code-mode"

const run = (code: string, limits?: CodeMode.ExecutionLimits) =>
  Effect.runPromise(makeCodeMode(limits).execute(code).pipe(Effect.provide(orderLayer())))

test("Effect-native Bun code mode composes domain tools and copies their results", async () => {
  const result = await Effect.runPromise(runCodeModeExample())
  expect(result.value).toEqual([
    { orderId: "ORD-1", status: "shipped" },
    { orderId: "ORD-2", status: "delivered" },
  ])
  expect(result.toolCalls).toHaveLength(2)
  expect(makeCodeMode().catalog).toHaveLength(1)
})

test("code-mode discovery finds callable domain tools and counts the search", async () => {
  const result = await run('return search({ query: "lookup" })')
  expect(result.ok).toBe(true)
  expect(JSON.stringify(result)).toContain("orders.lookup")
  expect(result.toolCalls).toHaveLength(1)
})

test("code mode enforces admission limits without erasing earlier calls", async () => {
  const result = await run('await tools.orders.lookup({ orderId: "ORD-1" }); return await tools.orders.lookup({ orderId: "ORD-1" })', { maxToolCalls: 1, timeoutMs: 5_000 })
  expect(result.ok).toBe(false)
  if (!result.ok) expect(result.error.kind).toBe("ToolCallLimitExceeded")
  expect(result.toolCalls).toHaveLength(1)
})

test("code mode validates tool input before calling the application service", async () => {
  const result = await run('return await tools.orders.lookup({ orderId: 42 })')
  expect(result.ok).toBe(false)
  if (!result.ok) expect(result.error.kind).toBe("InvalidToolInput")
})
