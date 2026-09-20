# TanStack Start

Read for React routes, server functions, SSR, or the Effect handoff.

Start owns routing, serialization, same-origin protection, and the React shell.
Effect owns backend operations and resources. Serve both in one Bun process;
do not add a second HTTP listener to connect the frontend to Effect.

## Native handoff

Keep explicit `createServerFn(...).validator(...).handler(...)` declarations so
Start's compiler can replace them with browser RPC stubs. Put the reusable
integration inside the handler, rather than wrapping `createServerFn` in a
custom endpoint factory.

Use `Schema.toStandardSchemaV1(Input)` directly as `.validator(...)`. Normalize
strings in the Effect schema, after structural validation. Do not access input
properties before decoding. Start rejects invalid input before the handler;
validation, CSRF, and network failures are transport errors, not application
result envelopes.

Each handler calls the bundled `runServerEffect(operation, OutputSchema,
program)`. The bridge reads `getRequest().signal`, creates a server-generated
request ID, and executes through the shared `ManagedRuntime`. The independent
`requestEffect` policy supplies `RequestContext`, a fresh resource scope, a
60-second deadline, log annotations, and an operation span. Output schemas
validate and encode browser-safe DTOs before returning them.

Expected `AppError` failures become serializable error codes/messages with a
request ID. Timeouts have their own code. Unexpected defects and runtime
initialization failures return a sanitized internal error; logs contain the
operation and reference, without raw provider payloads. Interruption propagates
instead of becoming a successful error envelope. Pass cancellation into SDK
and HTTP adapters; test the actual deployment's disconnect behavior separately.

The example exposes no authentication. For authenticated features, verify the
session server-side and provide an immutable request service containing the
verified identity. Do not trust client-supplied identity or mutate a shared
runtime service for each request.

## Ownership and lifecycle

Keep Start imports in server-function and bridge modules. Application workflows
and adapters return Effects and never call `runPromise` themselves. The runtime
owns long-lived layers; each request owns temporary resources. Nitro startup
initializes the runtime and shutdown disposes it. The example shares it through
a process-global slot because Nitro and Start can bundle separate module copies.
Development hot reload also disposes the old runtime.

Use Start's server-only import protection for the bridge and runtime. A directory
called `server` is not enforcement. Shared modules contain browser-safe schemas
and DTOs, never credentials or live layers. Loaders can execute in the browser;
call server functions from them rather than accessing services directly.

The example uses Start's default CSRF protection. If adding `src/start.ts`,
explicitly install `createCsrfMiddleware` for server functions; defining that
file replaces the framework's default configuration.

Represent pending, success, application failure, and transport failure in the
UI. Add streaming only when required. Verify SSR, client navigation, a server
function, and browser bundle separation in a production Bun build. Test scope
cleanup, concurrency isolation, typed failures, malformed input/output, deadline,
and interruption at the Effect boundary.

Sources: [server functions](https://tanstack.com/start/latest/docs/framework/react/guide/server-functions),
[middleware](https://tanstack.com/start/latest/docs/framework/react/guide/middleware),
[hosting](https://tanstack.com/start/latest/docs/framework/react/guide/hosting).
