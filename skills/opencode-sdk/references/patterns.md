# Choosing The Integration Surface

Use the smallest surface matching the requested deployment. Retrieve the official
pages through `documentation-index.md` and use `reading.md` to establish versions.

| Need | Surface | Local implementation reference |
| --- | --- | --- |
| Agent inside a Bun process with an Effect service layer | `@opencode/sdk/effect` | `effect-integration.md` and `../examples/effect.ts` |
| Separate server or shared local daemon | `@opencode/client/effect` | Official client branches in the index |
| One shell automation | CLI | Official CLI branch in the index |
| Cloudflare/workerd | Dedicated SDK exports and drivers | Cloudflare branch in the index |

## Embedded Ownership

The host assembles services and an in-memory HTTP router without opening a
listener. Promise ownership uses `await using` or `try/finally` with `close()`;
Effect ownership uses Scope or `OpenCode.layer()`. Sessions are mutable conversations
inside that host; independent callers need separate sessions or serialization.
An in-memory router does not establish an ephemeral database or isolated tools.

Read `sessions-and-streams.md` for acceptance, completion, answer correlation,
stream readiness and interruption. Read `configuration.md` before assuming the
host ignores user/project resources or choosing persistence. Read
`tools-and-plugins.md` for domain capabilities and application-service wiring.

## Network And Local Service Ownership

`OpenCode.make()` from `@opencode/client` targets a base URL. Configure authentication,
location and request options using the resolved client contract; Effect client
requirements differ from Promise request options. Read the actual declaration
rather than copying headers or cancellation parameters between entrypoints.

`@opencode/client/service` provides discover/ensure/stop helpers. Discovery checks
registered state; ensure can start a process. Starting or stopping a shared service
belongs to the requested workflow, not the lifetime of an arbitrary application
request. Keep registration credentials private and leave global settings unchanged
when the task only needs an embedded host.

Network event subscribers are live-only. Read `sessions-and-streams.md` for loss
and reconciliation; typed transport success is not completed agent execution.
The local fixture covers embedded hosts plus synthetic network subscription EOF,
not remote service provisioning or real authentication. Maintained demos use native Effect v4 and run on Bun.
