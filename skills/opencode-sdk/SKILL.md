---
name: opencode-sdk
description: Build or debug OpenCode 2 TypeScript integrations in Bun apps. Use for embedded agent hosts, provider OAuth, sessions, tools and plugins, code mode, streaming events, network clients, and native Effect v4 services and layers.
license: MIT
compatibility: OpenCode 2 SDK; the native Effect API requires a compatible Effect v4 version.
---

# OpenCode SDK

Use OpenCode as an embedded agent runtime or control a separate OpenCode service.
Ground imports, options, errors, and completion semantics in the application's
resolved package versions. OpenCode owns the agent loop; the application owns
business policy, permissions, budgets, and authoritative writes.

## Start With The Documentation Index

**Read [documentation-index.md](references/documentation-index.md) on every
activation.** It is the navigation map for the official documentation, API
contracts, schemas, and package source. Select the branches for the task and
follow their cross-links until every required operation is supported by a
matching declaration or documented contract. The index is a starting map, not
an exhaustive substitute for those sources. Retrieve relevant pages before
using their APIs; do not rely on remembered examples or an announcement.

## Integration Branches

Read the references that match the implementation before editing:

- Prompt delivery, final results, progress, interruption, permissions or forms:
  [sessions-and-streams.md](references/sessions-and-streams.md).
- Domain tools, plugin lifecycle, application-service dependencies or synthetic
  models: [tools-and-plugins.md](references/tools-and-plugins.md).
- OpenAI OAuth, OpenRouter PKCE, login attempts, account selection or refresh:
  [authentication.md](references/authentication.md).
- Code-mode scripts, tool discovery/composition, MCP/OpenAPI or interpreter limits:
  [code-mode.md](references/code-mode.md).
- Host configuration, credentials, persistence, workspace discovery or isolation:
  [configuration.md](references/configuration.md).
- Native Effect services, layers and host scopes:
  [effect-integration.md](references/effect-integration.md).
- Bun examples, verification, test doubles or coverage limits:
  [testing.md](references/testing.md).

The verified Bun domain-agent demo is [effect.ts](examples/effect.ts). Keep all
maintained demos native to Effect v4: use the SDK/client/plugin `/effect`
entrypoints, Config, services/layers, scoped Streams and interruption. Read the
demo's shared helpers for acceptance, completed results and resource cleanup. Run
[scripts/verify.ts](scripts/verify.ts) for an isolated typecheck and integration
suite with synthetic model responses. The standalone native Effect interpreter
demo is [code-mode.ts](examples/code-mode.ts); it requires no model credentials.
Runtime-specific claims are version-labelled.

## Workflow

1. Read [reading.md](references/reading.md) to establish the Bun, OpenCode, and
   Effect versions and identify authoritative package declarations.
2. Choose the surface and read [patterns.md](references/patterns.md):
   - `@opencode/sdk/effect`: embed a native Effect host in the Bun process.
   - `@opencode/client/effect`: control a separate server with Effects/Streams.
   - Consult the index for vanilla APIs when maintaining an existing integration.
   - CLI: use when the requested task only needs shell automation.
3. For Effect v4 apps, read
   [effect-integration.md](references/effect-integration.md). Apply `effect-ts`
   when available for application services, schemas, config, and tests.
4. Use the index to retrieve task-specific session, plugin, tool, permission,
   provider, MCP, RPC, or deployment documentation. Check the declared input,
   output, error, location, cancellation, and terminal contracts before coding.
5. Implement the smallest integration that fits existing application conventions.
   Preserve authorization through setup, implementation, and verification;
   do not stop at a documentation phase when implementation was requested.
6. Run the narrowest meaningful Bun typecheck/test or isolated smoke check.
   Report resolved versions, sources inspected, and unverified assumptions.

## Essential Boundaries

- The embedded SDK routes requests in memory; it does not require a local daemon.
  A network client needs a reachable server and appropriate authentication.
- OpenCode 2 uses `@opencode/sdk`, `@opencode/client`, and `@opencode/plugin`.
  Legacy `@opencode-ai/sdk` examples, including its `/v2` export, are not evidence
  for the new embedded SDK API. Follow migration docs for existing integrations.
- A host owns services and resources; a session owns mutable conversation state.
  Give both explicit lifetimes and serialize conflicting session operations.
- Prompt acceptance is distinct from run completion. Inspect wait, inbox, form,
  permission, event, and context contracts before returning a final result.
- Configure workspace/resource discovery, tools, permissions, model, credentials,
  and persistence deliberately. Inspection work should expose read-only tools;
  permission policies and domain-tool checks must enforce actual authority.
- Keep credentials, service registration passwords, private transcripts, and
  provider headers out of logs and committed examples. Resolve model availability,
  authentication, and endpoint reachability separately; preserve provider choice.
- Documentation questions do not authorize starting services, installing packages,
  changing global settings, or invoking agents with write tools.
- Retry only proven idempotent operations. Replaying an accepted prompt can
  repeat tool side effects. Cancelling a subscriber or request does not by itself
  establish that session execution stopped.

## Completion Evidence

- Package versions and entrypoints match the implementation.
- Required operations were traced through the documentation index to their
  declarations/contracts; any source or version mismatch is explicit.
- Host cleanup, session completion, cancellation, stream ownership, and tool
  authority are defined and checked where relevant.
- Typechecks/tests passed, or the exact validation limitation is reported.
