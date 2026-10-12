import type { OpenCode } from "@opencode/sdk/effect"
import { join } from "node:path"

export function settings(root: string) {
  return {
    database: { path: join(root, "session.sqlite") },
    config: { directory: join(root, "config"), project: false, content: JSON.stringify({
      model: "fixture/orders", snapshots: false, warming: false,
      permissions: [{ action: "*", resource: "*", effect: "deny" }, { action: "lookupOrder", resource: "*", effect: "allow" }, { action: "order.read", resource: "*", effect: "ask" }],
    }) },
    models: { fetch: false, snapshot: false, file: join(root, "models.json") },
    fs: { filewatcher: false, fff: false },
    pty: { root: join(root, "pty") },
  } satisfies OpenCode.CreateOptions
}
