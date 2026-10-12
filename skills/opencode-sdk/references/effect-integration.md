# Native Effect v4 Integration

Use this for embedding with `@opencode/sdk/effect` or composing an OpenCode
adapter into application services. For network control, select
`@opencode/client/effect` and read its transport requirements separately.

## Executable Layer Recipe

Read `../examples/effect.ts` and its imports. The fixture uses this dependency graph:

```text
OrderLookup application layer
  → plugin factory captures the resolved lookup interface
    → OpenCode.layer(host options + plugin)
      → OrderAgent layer exposes lookup(orderId)
        → create session, submit, await completion, retrieve answer
```

`OrderAgent` is the public application boundary. Its implementation uses named
`Effect.fn` operations and maps typed SDK/transport failures into `AgentRunError`,
without converting Effect interruption to success. Consumers provide the layer;
raw session/provider state stays inside the adapter. Replace OrderAgent in caller
tests and OrderLookup in tool integration tests.

`OpenCode.create()` requires Scope in 2.0.27. Use `Effect.scoped` for bounded work
or `OpenCode.layer()` for an application-owned host. Layer finalization closes
the router, services and registrations. Keep the host alive through the completed
operation; prompt acceptance is not a valid point to close it. A short handler
scope should not own a job intended to survive the request.

## Compose Native Values

Native operations return Effects and event endpoints return Streams. Compose them
directly; put `runPromise` only at an explicit Promise/process boundary. The example
uses `Location.Ref.make` and `AbsolutePath.make` for trusted construction and
schema decoders for external values. Follow resolved declarations before choosing
constructors or error class names; the pinned stable Effect release differs from
some prerelease catalog examples. In 4.0.1, the demo uses `Config.String` and
`Schema.TaggedError`.

A plugin's runtime does not implicitly inherit application services. The resolved
OrderLookup interface is captured before registration, so its executor requires no
hidden service environment. Resourceful services must retain their owning scope.
See `tools-and-plugins.md` for schemas, authority and registration lifecycle.

## Lifecycle And Failures

Read `sessions-and-streams.md` for the exact submit/wait/context/event flow and
cancellation bridge. Fork progress consumers with `Effect.forkScoped`; complete
readiness/failure signals when the subscriber exits, and drain required terminal
progress before releasing it. Use bounded buffering for slow consumers and caller
budgets/timeouts for long operations.

Use Config/redacted values for application configuration, supplying resolved values
through supported host/provider APIs. Follow `configuration.md` for isolation and
persistence. Keep provider calls outside authoritative SQL transactions and retry
only proven idempotent boundaries; replaying a prompt can repeat tool actions.

Use `testing.md` for deterministic synchronization, executable evidence and gaps.
Native Effect typing does not establish cancellation of every provider operation,
authorization of writes, or durable Workflow replay.
