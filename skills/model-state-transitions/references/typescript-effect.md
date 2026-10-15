# TypeScript and Effect v4

Use this reference for a TypeScript implementation with Effect v4. Check the
project's installed version before copying APIs: v3 examples may use different
Schema and error-handling names. This example is verified with the exact
stable release `effect@4.0.4`; it is a reproducibility pin, not a recommendation
to change dependencies.

## Choose the representation

Use a discriminated union when each phase owns different data:

```ts
type Result = { readonly id: string; readonly title: string };
type Failure = { readonly kind: "Transport" | "InvalidResponse"; readonly message: string };
type Search =
  | { status: "idle" }
  | { status: "loading"; requestId: bigint; query: string }
  | { status: "success"; results: ReadonlyArray<Result> }
  | { status: "failure"; error: Failure };
```

Narrow the union before reading phase-specific fields. Do not put optional
`results`, `error`, and `requestId` on every phase and assert they exist later.
A pure transition function owns legal changes. Exhaustive `switch` statements
ending in a `never` check make newly added events or states require a decision.
TypeScript types disappear at runtime: unknown network values still need decoding.

React can call this kind of transition function through `useReducer`; a statechart
runtime is unnecessary for a flat lifecycle. Consider a statechart when nested
behavior, coordinated parallel regions, or operation lifetimes make the reducer
harder to understand. XState context is available across states, so a chart's
state name does not itself establish a TypeScript relationship to context fields.

## Keep operations outside transitions

The runnable [search example](search.ts) separates three responsibilities:

1. `transition` computes the next union value without starting work.
2. `load` adapts a promise through `Effect.tryPromise`, decodes its unknown result
   with `Schema.decodeUnknownEffect`, and exposes a typed `Failure` channel.
3. `createSearch` owns request identities and turns operation outcomes into events.

`Effect.match` handles expected typed failures. Defects and interruption are
different from business failures; do not classify every cause as a retryable
transport error. In a real HTTP adapter, reject unsuccessful HTTP status codes
explicitly because `fetch` resolves for HTTP error responses. Add refinements
only for actual domain requirements; this schema checks result field types.

The controller generates increasing `bigint` identities without numeric wraparound.
A result can change state only when its identity matches the currently loading
request. Searching again starts a
replacement; cancelling enters idle; stale success and failure events are ignored.
Retry is another search and gets a fresh identity. No identity is accepted from
untrusted input.

Cancellation here is **logical cancellation**: the request can continue consuming
resources, but cannot change the current state. The transport receives Effect's
`AbortSignal`; this example does not interrupt the running effect on cancel. If
physical cancellation matters, give the controller ownership of a scoped fiber
or run cancellation signal and interrupt/abort it on replacement, cancel, and
unmount. Pass the signal through to `fetch`. Keep identity checks because an
operation may ignore cancellation; aborting also cannot undo a server-side write.

The assertions use controlled promises, so out-of-order completion needs no sleeps
or live network. They verify stale success both before and after replacement
completion, cancellation followed by stale failure, malformed response, transport
failure, and retry.

## Reproduce verification

From the repository root, install dependencies into a disposable directory. The
repository receives no package manifest, lockfile, or `node_modules`:

```sh
example_dir="$(mktemp -d)"
cp skills/model-state-transitions/references/search.ts "$example_dir/search.ts"
npm install --prefix "$example_dir" --save-exact \
  effect@4.0.4 typescript@5.9.3 tsx@4.20.6 @types/node@22.18.6
cd "$example_dir"
./node_modules/.bin/tsc --noEmit --strict --noUncheckedIndexedAccess \
  --target ES2022 --lib ESNext,DOM --types node \
  --module NodeNext --moduleResolution NodeNext search.ts
./node_modules/.bin/tsx search.ts
```

Expected output: `search lifecycle: 6 traces passed`. The `ESNext` library includes
the disposable types required by this Effect version. The assertions check
selected transition/controller histories, not React rendering, actual HTTP handling,
fiber cleanup, or persisted workflow durability. Add integration checks where
those behaviors are part of the requested change.

## Primary sources

- [Effect v4 Effect API](https://effect.website/docs/v4/api/effect/Effect):
  `tryPromise`, `flatMap`, `mapError`, `match`, and `runPromise`.
- [Effect v4 Schema API](https://effect.website/docs/v4/api/effect/Schema):
  `Struct`, `Array`, and `decodeUnknownEffect`.
- [TypeScript narrowing and exhaustiveness](https://www.typescriptlang.org/docs/handbook/2/narrowing.html):
  discriminated unions and `never` checks.
- [React reducers](https://react.dev/learn/extracting-state-logic-into-a-reducer):
  pure state updates in response to actions.
- [XState context](https://stately.ai/docs/context): context shared across states.
