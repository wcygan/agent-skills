# Code Mode

Use this for tool composition through generated programs, large tool catalogs,
MCP/OpenAPI integrations, or embedding the standalone interpreter in a Bun app.
Start with the [upstream README](https://github.com/anomalyco/opencode/blob/dev/packages/codemode/README.md)
and [language support matrix](https://github.com/anomalyco/opencode/blob/dev/packages/codemode/interpreter-support.md),
then check the resolved package. Both links track `dev` and can differ from a release.
The executable native Effect/Bun recipe is `../examples/code-mode.ts`.

## How It Works

A model can issue one program that discovers tools, calls one, transforms the
returned data, then invokes another. The host receives one execute request rather
than needing a model round trip between every tool call. Parallel calls are still
separate external operations, and a later failure does not roll back earlier work.

```text
model writes supported JavaScript
  → Acorn parses the source into an AST
    → interpreter evaluates its implemented language subset
      → tools namespace dispatches to host-owned Effect operations
        → decoded/copied results return to the program
          → host receives result, diagnostics and admitted-call history
```

This is possible because `@opencode/codemode` implements its own interpreter; it
does not run guest source as arbitrary Bun/Node JavaScript. The host is Bun
TypeScript with Effect. Guest code is a supported JavaScript subset with top-level
await/return, ordinary control flow and supported built-ins. It cannot import
Effect, Node modules or TypeScript types. Native process, filesystem, timers and
network APIs are absent unless the host deliberately exposes capabilities.

The support matrix describes current syntax and built-ins, not complete ECMAScript
compatibility. In particular, parsing with Acorn does not mean every parsed AST
node is supported. Retrieve the matrix and release implementation for unfamiliar
syntax; do not send TypeScript annotations to the interpreter.

## Standalone Effect-Native Runtime

The pinned 2.0.27 package exports `CodeMode`, `Tool`, `Namespace`, `Extension` and
`OpenAPI` from `@opencode/codemode`; its API is already Effect-native, with no
separate `/effect` import.

The demo defines a schema-backed order tool whose Effect requires OrderLookup.
`CodeMode.make` infers that environment from the supplied tool tree, so providing
the application layer to `runtime.execute(program)` resolves the tool's dependency.
The guest program awaits two lookups, then returns a projection of their results.
No agent session, model credential or OpenCode server is needed to execute this
known program. Choosing/generated source still belongs to an agent or the app.

| Operation | Pinned 2.0.27 contract |
| --- | --- |
| `Tool.make` | Declares description, input/output schemas and an Effect executor |
| `Namespace.make` | Adds a namespace description around a nested tool record |
| `CodeMode.make(options)` | Prepares a reusable runtime from explicit capabilities and limits |
| `runtime.catalog` | Read-only descriptor array: path, description and signature |
| `runtime.execute(source)` | Returns an Effect whose success value is `CodeMode.Result` |
| `CodeMode.execute({ code, ...options })` | Runs a single program without retaining a runtime |

**Version mismatch:** the linked `dev` README currently shows `runtime.catalog()`.
The published 2.0.27 declarations and executed demo use the `runtime.catalog`
property. Follow the installed declaration instead of copying that call verbatim.

Use Effect Schema for runtime input/output decoding. Plain JSON Schema documents
shape signatures but do not validate values in this package. Output values are
copied across the interpreter boundary; omitted output schemas expose a void
result. Schema validity does not establish permission or factual correctness.

## Discovery And Tool Paths

The guest's synchronous `search(...)` built-in supports discovery, browsing and
pagination. Its exact options and callable paths come from the package's
`searchSignature`, catalog descriptors and `CodeMode.toolExpression(path)`.
Search consumes tool-call budget. Namespace descriptions contribute search terms.
Use returned callable paths rather than guessing names; punctuation may require
bracket notation and dotted keys can create nested namespaces.

The host decides what discovery/catalog context to give the model. Loading a
runtime does not automatically register an execute tool with a separate agent.
Do not assume code mode itself supplies a model, conversation state or agent loop.

## OpenCode SDK Integration

OpenCode's tool snapshot separates tools marked `codemode: false` (direct model
tools) from code-mode tools. Code mode is the default for tools without that
explicit false setting, including MCP tools unless disabled for their server.
`options.pinned` can promote eligible code-mode tools into the model's direct
view; inspect its release-specific semantics before using it.

The host constructs an `execute` tool over the allowed code-mode inventory. Tool
hooks still surround dispatch into each underlying executor. Permissions must
permit the execute capability and the underlying tool inventory; code mode does
not replace domain authority checks or provide a transaction around the script.

The existing SDK order-agent demo deliberately uses a direct lookup tool, denies
unrelated actions, and filters its model-facing context. Converting it to code
mode therefore requires changing the tool option, allowing `execute`, and keeping
that tool in the context hook. Simply removing `codemode: false` is insufficient.
The separate code-mode demo exercises the interpreter directly; it does not claim
a tested model-generated execute turn through the SDK.

## MCP, OpenAPI And Extensions

OpenCode's MCP host handles connections and contributes tools to the inventory;
that is distinct from a standalone CodeMode runtime. The standalone 2.0.27 exports
have no general MCP-connection factory. Connect MCP through the SDK or your own
adapter, then expose deliberate host tools instead of inventing `CodeMode.fromMCP`.

`OpenAPI.fromSpec` converts supported OpenAPI 3.x operations into tools and returns
`{ tools, skipped }`. Inspect skipped operations rather than treating every spec
operation as executable. Generated tools require Effect HttpClient. The host auth
resolver supplies credentials at call time, outside the model-visible signature.
JSON Schema `readOnly`/`writeOnly` adjustments affect rendered signatures; they do
not strip runtime bodies or responses. Add decoding/redaction at your boundary.
SSE, WebSocket, binary responses and unsupported encodings need separate adapters.

Extensions add host functions as guest globals. They are not catalog tools and
do not consume `maxToolCalls`; exposing fetch/process-like capability changes the
runtime's authority and budget model. Audit extensions separately. A tool.before
or extension.before hook can refuse a call; after hooks observe success, failure
or interruption. Refusal is catchable by guest code, so the protected action must
remain denied inside its actual service/executor.

## Limits And Result Handling

The standalone package has **no default limits**. Set timeoutMs, maxToolCalls and
maxOutputBytes explicitly. The demo uses five seconds, eight calls and 8192 output
bytes per execution. These are example budgets, not provider or SDK defaults.
Invalid limit configuration throws RangeError during runtime creation; validate
configuration before acquiring the runtime. Tool concurrency is unrestricted by
the call-count limit; use application-level
concurrency controls if the downstream service needs them.

`Result.ok` distinguishes program success from a diagnostic even though the
Effect error channel is never for program diagnostics. Inspect warnings, logs,
truncated and toolCalls as well. In 2.0.27, toolCalls records admitted names, not
a full input/output audit journal; record redacted evidence through hooks if the
application needs it. The demo maps a failed result into a typed domain
error when its caller requires success. Diagnostic categories cover parsing,
unsupported syntax, unavailable tools, invalid inputs/outputs/data, call limits,
timeouts, tool failure and execution failure.

Truncation can replace an oversized result with marked text without making ok
false. Cleanup can interrupt unfinished tool/async work; early success can carry
a timeout warning. Await work whose completion matters. A timeout or interruption
cannot undo side effects that already happened. Cooperative interpreter budgets
also do not establish preemption of every host operation; verify cancellation in
external adapters and inspect the release's built-in execution limits.

## Evidence

The Bun suite executes tool composition, discovery, schema rejection and call
limits against `@opencode/codemode` 2.0.27 / Effect 4.0.1. OpenAPI, MCP adapters,
extensions, output truncation and generated execute turns are source/documentation
branches, not executed fixture coverage. See `testing.md` for the runner and the
[published package](https://registry.npmjs.org/@opencode%2Fcodemode/2.0.27) for exact
exports, dependencies and tarball source.
