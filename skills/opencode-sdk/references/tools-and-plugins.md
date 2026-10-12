# Domain Tools And Plugins

Use this when adding custom tools, configuring a non-coding agent, or supplying
application dependencies to plugin execution. Read `../examples/orders.ts` and
`../examples/plugins.ts`, then the matching official plugin pages in the index.

## Resolve The Application Service First

`OrderLookup` is an application `Context.Service`; `orderLayer` supplies seeded
read-only data. Resolve that service while building the agent adapter, then
capture its interface in the plugin factory. A tool can call its Effect methods
without requiring OpenCode's private runtime to contain the caller's service tag.
Keep the application's owning scope alive for services with database connections,
subscriptions or other resources. The native Effect demo layers the host inside
that lifetime.

The native example exposes `OrderAgent.lookup` through its own service and
`agentLayer`, which provides `OpenCode.layer()` internally. Other application
modules need only the domain operation. Substitute OrderLookup layers for tool
behavior tests or OrderAgent layers when testing callers without the agent loop.

For the pinned Effect 4.0.1 example, schema-backed errors use `Schema.TaggedError`.
Some catalog references describe prerelease `TaggedErrorClass`; follow resolved
package declarations instead of forcing that spelling into this example.

## Tool Registration

Use the Effect entrypoint's `Plugin.define({ id, effect })` and register with the
host or its create options. The tool transform callback is synchronous. Inside it,
`editor.add` supplies a name, description, input/output schemas, options, and an
Effect-returning executor. The maintained demo imports the native `/effect`
plugin entrypoint and composes tool work directly.

For generated programs that compose these tools, read [code-mode.md](code-mode.md)
before changing direct/code-mode exposure.

The example registers `lookupOrder` with Effect Schema input/output, reports
progress, calls the captured service, and maps domain/decoding failures to the
SDK's `Tool.Error`. It uses `codemode: false` so the model can call this one tool
directly. Recheck effective names when adding namespaces. Validate real external
data with decoders rather than a type assertion; output schema validity does not
establish factual accuracy or authority.

Transforms replay against new registry state. Perform I/O before registration,
keep transforms repeatable, and reload after changing captured definitions.
Registrations belong to the plugin scope; disposal/unload removes them. Existing
model-request snapshots retain their selected executors, so hot reload changes
future work rather than retroactively replacing active tool calls.

## Exposure And Authority

The fixture config denies general actions, allows lookupOrder, and its context
hook removes all other model-facing tools. This demonstrates a domain agent with
one read-only application capability. The test also requests an unavailable write
tool and verifies failure; no filesystem write executor is exposed.

In 2.0.27, `options.permission` controls which action is considered when filtering
the tool snapshot. It does not automatically perform an approval request inside
a custom executor. A context hook removes model-facing definitions, not application
authority. Enforce user/tenant access and protected writes in the domain service;
for interactive approval, use an explicit permission request/reply integration
before the protected action. See `sessions-and-streams.md` for the admission
contract and location caveat.

## Synthetic Model And Provider Wiring

The test plugin contributes a provider/model definition and overrides its
`aisdk.hook("language", ...)` with a typed `LanguageModelV3`. The provider uses
an explicit `aisdk:@ai-sdk/openai-compatible` package reference. A native
`@opencode/ai/providers/openai-compatible` route bypasses that hook; using it
would accidentally test real HTTP transport rather than the synthetic model.
The synthetic driver implements the provider's required Promise-like/ReadableStream
callback contract and bridges readiness/cancellation into Deferred signals.
Application operations, tools and lifecycle compose native Effects.
The fixture's localhost endpoint and credential are inert placeholders, not live
provider configuration. All model responses come from the test double.

Provider package construction can run before the language hook. The pinned
installation contains the matching provider factory; do not assume inventing a
package name and overriding the language hook avoids factory initialization.
Provider-scoped hooks prevent changes to unrelated providers. Most applications
should configure a real supported provider, not reproduce this test-only bridge.
