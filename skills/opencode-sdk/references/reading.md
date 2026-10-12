# Versions And Source Discovery

Inspect the nearest AGENTS.md, package.json, Bun lockfile, TypeScript config,
and existing runtime adapter before changing dependencies. Use the project's
package scripts and `bun pm ls` to identify resolved OpenCode/Effect versions.
A globally installed CLI version does not establish the app's SDK version.

Search installed packages with `rg --files node_modules/@opencode` and inspect
package.json exports plus the declarations reachable from the chosen entrypoint.
Workspaces may hoist dependencies; resolve them from the consuming application's
location rather than assuming a node_modules path. Use `import.meta.resolve`
in Bun when direct filesystem discovery is ambiguous.

| Package | Relevant evidence |
| --- | --- |
| `@opencode/sdk` | Promise/effect host declarations, create options, aliases and lifecycle |
| `@opencode/client` | Generated method inputs/results/errors, subscriptions, service APIs |
| `@opencode/plugin` | Plugin context, transforms, hooks, tool and RPC definitions |
| `@opencode/schema`, `@opencode/protocol` | Branded identifiers, location refs, events, declared errors |
| `effect` | Resolved version and required module declarations |

Source preference:

1. Project-resolved package declarations and implementation.
2. Upstream checkout/release matching those package versions.
3. Current official docs selected through `documentation-index.md`.

Record a mismatch and prefer installed evidence; do not mix a V1 client, new
embedded host, and latest plugin example merely because all say OpenCode.
As a reference point, SDK/client/plugin 2.0.27 use Effect 4.0.1. Inspect the
current dependency/peer requirements and lock resolution; avoid multiple
incompatible Effect copies or forcing casts to make their services compose.

For Bun implementation work, add dependencies only to the intended project and
use its lockfile conventions. Native embeddings and service process management
have different runtime requirements; browser compatibility of the network client
does not imply browser compatibility of the embedded host. Verify required
filesystem, database and shell capabilities for the target deployment. A
Cloudflare build uses its documented runtime profile and drivers.

For a documentation-only task, fetch docs or published declarations without
installing packages or starting services. Report exact package versions and
whether conclusions are installed-version-matched or latest-online.
