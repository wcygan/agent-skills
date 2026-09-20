# Effect backend

Read for all backend service, dependency, error, or resource-boundary work.
Target Effect v4; inspect the pinned package when signatures are uncertain.

## Dependency direction

- Domain schemas and pure rules do not depend on transport or provider SDKs.
- Application services express use cases as `Effect.Effect<Success, Error,
  Requirements>`. Use `Effect.gen` for composition and named `Effect.fn`
  operations for useful traces.
- Define capability contracts with `Context.Service`. Build implementations
  with `Layer.effect`; keep a small feature's contract and implementation
  together until separation improves an actual dependency boundary.
- Adapters implement capabilities for HTTP, Pi, files, or storage. Translate
  SDK promise rejection with `Effect.tryPromise` at this boundary. Pass through
  cancellation where supported; wrapping a promise alone does not cancel it.
- The composition root supplies adapter layers to application layers with
  explicit dependency wiring. Merge independent layers; merging alone does
  not satisfy one layer's dependencies with another's output.

## Runtime and request boundary

Own a shared `ManagedRuntime` at the server composition root, with its layer
graph built once per production process. Keep execution (`runPromise` or the
version-matched equivalent) at server/SDK callback entrypoints, never nested
inside application services. Dispose the runtime through server shutdown.

Decode incoming data with Effect Schema, establish request-specific identity
and authorization, call the use case, and encode a browser-safe result. Keep
identity out of mutable process-global services. Map expected typed failures
to deliberate browser-safe result codes; preserve interruption and log defects
without leaking internals. The Start-specific handoff is described in
[tanstack-start.md](tanstack-start.md).

Use the pinned version’s schema-backed tagged error constructor for expected
application failures (`Schema.TaggedError` in `4.0.0-rc.116`). Read config
through `Config` in layers and secrets through redacted config. Give acquired
resources scoped finalizers; keep background fibers owned by the application
scope. Apply bounded timeouts and retry schedules only where replay is safe.

## Verification

Supply fake capability layers for service tests. Check a meaningful success
case and expected failure; test boundary decoding and cancellation for the
integrations that own resources. Avoid module mocking as a substitute for
service boundaries. Keep live provider calls out of the default test suite.

Source: [Effect v4 onboarding](https://effect.website/docs/v4/onboarding).
For signatures, use the installed Effect v4 types and matching API reference.
