import { APICallError } from "@ai-sdk/provider"
import type { LanguageModelV3, LanguageModelV3CallOptions, LanguageModelV3StreamPart } from "@ai-sdk/provider"

import { Deferred, Effect, Schema } from "effect"
import { Order } from "./orders"

export type Scenario = "success" | "malformed" | "provider-error" | "blocked" | "forbidden"
export function syntheticModel(scenario: Scenario = "success") {
  const started = Deferred.makeUnsafe<void>()
  const aborted = Deferred.makeUnsafe<void>()
  const requests: LanguageModelV3CallOptions[] = []
  const usage = {
    inputTokens: { total: 1, noCache: 1, cacheRead: 0, cacheWrite: 0 },
    outputTokens: { total: 1, text: 1, reasoning: 0 },
  }
  const model: LanguageModelV3 = {
    specificationVersion: "v3", provider: "fixture", modelId: "orders", supportedUrls: {},
    async doGenerate() { throw new Error("Unexpected non-streaming model call") },
    async doStream(options) {
      requests.push(options)
      if (scenario !== "blocked") Effect.runSync(Deferred.succeed(started, undefined))
      if (scenario === "provider-error") throw new APICallError({ message: "Synthetic provider failure", url: "http://fixture.invalid", requestBodyValues: {}, statusCode: 400, isRetryable: false })
      if (scenario === "blocked") return {
        stream: new ReadableStream<LanguageModelV3StreamPart>({
          start(controller) { controller.enqueue({ type: "stream-start", warnings: [] }) },
          pull() { Effect.runSync(Deferred.succeed(started, undefined)) },
          cancel() { Effect.runSync(Deferred.succeed(aborted, undefined)) },
        }),
      }
      const lastUser = options.prompt.findLastIndex((message) => message.role === "user")
      const user = options.prompt[lastUser]
      const text = user?.role === "user" ? user.content.filter((part) => part.type === "text").map((part) => part.text).join(" ") : ""
      const result = options.prompt.slice(lastUser + 1).find((message) => message.role === "tool")
      const parts: LanguageModelV3StreamPart[] = [{ type: "stream-start", warnings: [] }]
      if (!result) {
        parts.push({ type: "tool-call", toolCallId: crypto.randomUUID(), toolName: scenario === "forbidden" ? "write" : "lookupOrder",
          input: JSON.stringify(scenario === "malformed" ? { orderId: 42 } : { orderId: text.match(/ORD-[A-Z0-9]+/)?.[0] ?? "ORD-1" }) })
      } else {
        let answer = "The lookup failed."
        const tool = result.content.find((part) => part.type === "tool-result")
        if (tool?.output.type === "text") {
          try {
            const order = Schema.decodeUnknownSync(Order)(JSON.parse(tool.output.value))
            answer = `${order.orderId}: ${order.status}`
          } catch { answer = "The lookup returned invalid data." }
        }
        parts.push({ type: "text-start", id: "answer" }, { type: "text-delta", id: "answer", delta: answer }, { type: "text-end", id: "answer" })
      }
      parts.push({ type: "finish", usage, finishReason: { unified: result ? "stop" : "tool-calls", raw: result ? "stop" : "tool_calls" } })
      return { stream: new ReadableStream({ start(controller) { for (const part of parts) controller.enqueue(part); controller.close() } }) }
    },
  }
  return { model, requests, started: Deferred.await(started), aborted: Deferred.await(aborted) }
}
export type SyntheticModel = ReturnType<typeof syntheticModel>
