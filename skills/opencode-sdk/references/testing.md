# Testing And Executable Evidence

Use this when validating examples or an application adapter. The example project
pins OpenCode SDK/client/plugin/codemode 2.0.27 and Effect 4.0.1 with a Bun lockfile.

## Run The Disposable Fixture

From the catalog checkout:

```sh
just opencode-sdk-integration-test
```

In an installed skill, run the same portable runner directly:

```sh
bun scripts/verify.ts
```

The runner copies `../examples` to a temporary app, performs a frozen install,
typechecks, runs Bun tests, and launches the native Effect agent and code-mode
demos on Bun. Dependencies,
SQLite/config/cache state and generated files stay outside distributable content.
It limits each child to two minutes and cleans up its owned directory after success
or failure. Each demo turn has a thirty-second budget; tests have a
twenty-second ceiling. No live provider key is used.
The OpenCode host entrypoint/integration tests require the runner's isolated
environment marker. The standalone code-mode demo has no user-state dependency.

## What Is Verified

- The native Effect host runs a tool-assisted turn to a completed answer on Bun.
- Standalone code mode composes domain tools, discovers their callable paths,
  rejects invalid input and enforces tool-call admission limits.
- The OrderLookup application service is replaced with a test layer.
- Sequential input IDs retrieve their own results; independent sessions keep
  separate conversations; progress is filtered and disposed after its owner ends.
- Invalid tool arguments, domain-tool failure, provider failure and unavailable
  write requests remain visible instead of becoming successful fallback answers.
- Native fiber interruption interrupts the session and cancels the returned
  model stream; plugin cleanup runs when the host closes.
- Pending permissions can be observed, listed and rejected in the default location.
- Explicit config roots and disabled project discovery exclude sentinel definitions.
- Subscribers can close and reconnect; a network client's synthetic SSE EOF ends
  its subscriber without automatic reconnection.

Use Deferred and scoped fibers for ordering. Timeout ceilings detect stuck work; they are not sleeps used to synchronize assertions.
Read the tests for the exact evidence rather than equating a typecheck with runtime
coverage. The synthetic model is a deterministic protocol double, not an LLM
quality evaluation or a guarantee that a real provider emits identical responses.

## What Still Needs Application-Specific Verification

Provider authentication in `authentication.md` and OpenAPI/MCP/extension branches
in `code-mode.md` remain source/documentation-checked. Real-provider
authentication, transport abort during model initialization, proxy
failures, restart recovery, cross-location permission routing, forms and background
subagents are outside the fixture's executed coverage. The associated references
identify their contracts and routes; add targeted integration cases when adopting
those capabilities. Bun bundling and a deployment runtime also require their own
checks; this fixture exercises TypeScript source execution.

## Testing Your App

Most caller tests should provide an OrderAgent-equivalent fake layer, controlling
answers, progress, typed failure and interruption without starting OpenCode. Tool
adapter tests should replace the backing domain service. Reserve real SDK tests
for host wiring, lifecycle, schemas and agent-loop semantics that a fake layer
cannot establish. Keep live provider smoke tests separately configured and bounded.

When changing dependencies, update the pinned manifests/lock, inspect declarations
and implementation, rerun the disposable suite, and revise version-specific claims.
Finish catalog edits with Agent Skills validation, snapshot refresh and the shared
publication dry run; those checks establish packaging, not agent correctness.
