import { SessionMessage } from "@opencode/sdk/effect"

// The caller serializes one submitted input per session. Context is ordered;
// stop at the next user input so a later turn cannot be mistaken for this one.
export function completedAnswer(messages: ReadonlyArray<SessionMessage.Info>, inputID: string) {
  const index = messages.findIndex((message) => message.id === inputID && message.type === "user")
  if (index < 0) throw new Error("Accepted input is absent from session context")
  const turn: SessionMessage.Info[] = []
  for (const message of messages.slice(index + 1)) {
    if (message.type === "user") break
    turn.push(message)
  }
  for (const message of turn) {
    if (message.type === "idle" && message.outcome === "failed") throw new Error(message.error?.message ?? "Agent execution failed")
    if (message.type === "idle" && message.outcome === "interrupted") throw new Error("Agent execution interrupted")
  }
  const assistants = turn.filter((message) => message.type === "assistant")
  for (const assistant of assistants) {
    if (assistant.error) throw new Error(assistant.error.message)
    for (const part of assistant.content) if (part.type === "tool" && part.state.status === "error") throw new Error(part.state.error.message)
  }
  const final = assistants.findLast((message) => message.finish === "stop" && message.time.completed !== undefined)
  if (!final) throw new Error("No completed answer for accepted input")
  return final.content.filter((part) => part.type === "text").map((part) => part.text).join("")
}
