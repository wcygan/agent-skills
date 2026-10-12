# Documentation Index

Read this index first, then retrieve only branches relevant to the task. URLs
are discovery roots: follow their navigation, operation links, schemas, and
source references rather than treating this list as complete API coverage.

## Retrieval Procedure

1. Establish resolved versions using `reading.md`. Prefer installed declarations
   and the corresponding upstream revision over latest web examples.
2. Choose an entry below. Retrieve its page and follow cross-links for required
   concepts; large API/plugin pages should be searched by operation or domain.
3. For each used operation, record its input/output schemas, errors, ownership,
   location, and completion/cancellation behavior. Follow referenced schema
   definitions and implementation when the public page leaves a question open.
4. If a URL moves, use the current [Build navigation](https://opencode.ai/v2/docs/build/)
   or [Docs navigation](https://opencode.ai/v2/docs/) to locate its replacement.
   If retrieval fails, use version-matched package/source evidence and report
   the gap; do not invent a missing API.

## Local Recipes And Executable Sources

Use these before choosing the corresponding official-doc branch:

| Task | Recipe | Executable evidence |
| --- | --- | --- |
| Submit, wait, correlate an answer, stream or cancel | [Sessions and streams](sessions-and-streams.md) | `../examples/results.ts`, native Effect entrypoint |
| Custom tools and application dependencies | [Tools and plugins](tools-and-plugins.md) | `../examples/orders.ts`, `../examples/plugins.ts` |
| OpenAI OAuth, OpenRouter PKCE or saved accounts | [Authentication](authentication.md) | Published provider source; live authentication is not fixture-tested |
| Code-mode composition, discovery or interpreter limits | [Code mode](code-mode.md) | `../examples/code-mode.ts`, `../examples/code-mode.test.ts` |
| Configuration, storage, resources and credentials | [Configuration](configuration.md) | `../examples/settings.ts`, isolated runner |
| Native Effect domain service and Layer | [Effect integration](effect-integration.md) | `../examples/effect.ts` |
| Bun setup, tests and executed coverage | [Testing](testing.md) | `../examples/integration.test.ts`, `../scripts/verify.ts` |

Recipes explain the non-obvious contracts verified against 2.0.27. Follow the
external pages and installed source when adopting another version or a capability
outside the fixture. A passing fixture does not establish every indexed feature.

## Embedding And Transports

| Need | Official starting point | Follow for |
| --- | --- | --- |
| Embedded Bun/TypeScript host | [SDK](https://opencode.ai/v2/docs/build/sdk/) | Creation, disposal, sessions/events aliases, plugins, worktrees |
| Native Effect v4 host | [Effect SDK](https://opencode.ai/v2/docs/build/sdk/effect/) | Scope, typed operations, Streams, Service and Layer |
| Separate HTTP server | [JavaScript client](https://opencode.ai/v2/docs/build/client/) | Headers, request options, live subscriptions, service discovery |
| HTTP from Effect | [Effect client](https://opencode.ai/v2/docs/build/client/effect/) | Client layer requirements, schemas, transport errors |
| Durable Objects | [Cloudflare SDK](https://opencode.ai/v2/docs/build/sdk/cloudflare/) | Runtime profile, storage, workspace/environment drivers |
| Shell interface | [CLI](https://opencode.ai/v2/docs/cli/) | Supported commands and process/service behavior |

## Customization

| Need | Official starting point | Search/follow for |
| --- | --- | --- |
| Promise plugins | [Plugins](https://opencode.ai/v2/docs/build/plugins/) | setup/cleanup, transforms, hooks, storage, registration disposal |
| Effect plugins/tools | [Effect plugins](https://opencode.ai/v2/docs/build/plugins/effect/) | effect, ctx.tool, schemas, execution environment, hooks |
| Shared typed RPC | [Plugin RPC](https://opencode.ai/v2/docs/build/plugins/rpc/) | Contract definition, registration, location and event envelopes |
| Effect RPC | [Effect RPC](https://opencode.ai/v2/docs/build/plugins/effect/rpc/) | Effect Schema, declared errors, service requirements |
| Standalone interpreter and tool composition | [Code-mode README](https://github.com/anomalyco/opencode/blob/dev/packages/codemode/README.md), [language support](https://github.com/anomalyco/opencode/blob/dev/packages/codemode/interpreter-support.md) | Native Effect runtime, tools, search, OpenAPI, extensions, budgets; compare dev APIs with installed exports |
| Terminal UI | [CLI plugins](https://opencode.ai/v2/docs/build/plugins/cli/) | TUI-specific APIs; separate from server plugins |
| Existing V1 plugin | [Plugin migration](https://opencode.ai/v2/docs/build/plugins/migrate-v1/) | Changed lifecycle and registration APIs |

## API And Schema Traversal

Start at the [HTTP API reference](https://opencode.ai/v2/docs/api/). Use its
resource navigation and **OpenAPI JSON** link to retrieve the current contract;
follow named schemas for field types, defaults, discriminators, and errors.
Do not construct endpoint paths from operation names.

- `session`: create/get/list, prompt/inbox delivery, wait, messages/context,
  interrupt, forms, fork/import/export, compaction, model/agent switching.
- `event`: subscription envelopes, discriminators, location/session filtering.
- `agent`, `model`, `provider`, `integration`, `credential`: definitions,
  availability, model selection, authentication and connection lifecycle.
- `permission`, `form`: pending requests, decisions, replies and cancellation.
- `mcp`, `skill`, `reference`, `command`, `rpc`: integrations and resources.
- `location`, `project`, `worktree`, `vcs`, `filesystem`, `config`: workspace
  identity, persistence, configuration and filesystem operations.
- `shell`, `pty`, `persistentPty`: execution, progress and background resources.
- `server`, `plugin`, `debug`, `migration`, `generate`, `websearch`: lifecycle,
  diagnostics and specialized operations.

Confirm exact operation names in the selected release. Follow generated client
method types into `@opencode/protocol` and `@opencode/schema`, then implementation
in `@opencode/core` or `@opencode/server` when semantics remain unclear.

## Configuration And Agent Behavior

Use [Docs navigation](https://opencode.ai/v2/docs/) for newly added sections.

| Topic | Documentation |
| --- | --- |
| Configuration and loading precedence | [Config](https://opencode.ai/v2/docs/config/) |
| Agent definitions and prompts | [Agents](https://opencode.ai/v2/docs/agents/) |
| Models and provider configuration | [Models](https://opencode.ai/v2/docs/models/), [Providers](https://opencode.ai/v2/docs/providers/) |
| Provider sign-in and accounts | [Provider accounts](https://opencode.ai/v2/docs/cli/providers), [OpenRouter OAuth](https://openrouter.ai/docs/guides/overview/auth/oauth) |
| Tool exposure and authority | [Tools](https://opencode.ai/v2/docs/tools/), [Permissions](https://opencode.ai/v2/docs/permissions/), [Policies](https://opencode.ai/v2/docs/policies/) |
| MCP connections and code-mode tools | [MCP servers](https://opencode.ai/v2/docs/mcp-servers/), tool sections of the plugin docs |
| Workspace instructions and resources | [Instructions](https://opencode.ai/v2/docs/instructions/), [Skills](https://opencode.ai/v2/docs/skills/), [References](https://opencode.ai/v2/docs/references/) |
| Commands and prompt inputs | [Commands](https://opencode.ai/v2/docs/commands/), [Attachments](https://opencode.ai/v2/docs/attachments/) |
| Context and working state | [Compaction](https://opencode.ai/v2/docs/compaction/), [Snapshots](https://opencode.ai/v2/docs/snapshots/), [Warming](https://opencode.ai/v2/docs/warming/) |
| Connectivity and diagnosis | [Network](https://opencode.ai/v2/docs/network/), [Troubleshooting](https://opencode.ai/v2/docs/troubleshooting/) |
| Other application features | [Web search](https://opencode.ai/v2/docs/websearch/), [Sharing](https://opencode.ai/v2/docs/sharing/), [Formatters](https://opencode.ai/v2/docs/formatters/), [Themes](https://opencode.ai/v2/docs/themes/) |
| V1 application migration | [Migration](https://opencode.ai/v2/docs/migrate-v1/) |

## Package And Source Evidence

- [Upstream repository](https://github.com/anomalyco/opencode): find the revision
  matching the installed release; inspect `packages/sdk`, `packages/client`,
  `packages/plugin`, `packages/schema`, `packages/protocol`, `packages/core`,
  `packages/server`, and `packages/codemode` as needed.
- Published package metadata:
  [SDK](https://registry.npmjs.org/@opencode%2Fsdk),
  [client](https://registry.npmjs.org/@opencode%2Fclient),
  [plugin](https://registry.npmjs.org/@opencode%2Fplugin),
  [code mode](https://registry.npmjs.org/@opencode%2Fcodemode),
  [core/provider source](https://registry.npmjs.org/@opencode%2Fcore).
  Select the resolved version, inspect exports/dependencies, and retrieve its
  tarball declarations if local sources are absent; this requires no installation.
- [Effect v4 API](https://effect.website/docs/v4/api/): consult the modules used
  by the adapter against the project's resolved Effect version.

Discovery reviewed 2026-10-12 against published OpenCode 2.0.27 declarations
and implementation. The Bun fixture verifies the subset listed in `testing.md`.
These links track current docs, not a frozen specification. Recheck versions
and navigation on use; an announcement is background, not API authority.
