import assert from "node:assert/strict";
import { Effect, Schema } from "effect";

const Results = Schema.Array(Schema.Struct({ id: Schema.String, title: Schema.String }));
type Results = typeof Results.Type;
type Failure = { readonly kind: "Transport" | "InvalidResponse"; readonly message: string };
type State =
  | { readonly status: "idle" }
  | { readonly status: "loading"; readonly requestId: bigint; readonly query: string }
  | { readonly status: "success"; readonly results: Results }
  | { readonly status: "failure"; readonly error: Failure };
type Event =
  | { readonly type: "search"; readonly requestId: bigint; readonly query: string }
  | { readonly type: "cancel" }
  | { readonly type: "resolved"; readonly requestId: bigint; readonly results: Results }
  | { readonly type: "rejected"; readonly requestId: bigint; readonly error: Failure };

function unreachable(value: never): never {
  throw new Error(`Unhandled variant: ${JSON.stringify(value)}`);
}

function activeRequest(state: State): bigint | undefined {
  switch (state.status) {
    case "loading": return state.requestId;
    case "idle": case "success": case "failure": return undefined;
    default: return unreachable(state);
  }
}

function transition(state: State, event: Event): State {
  switch (event.type) {
    case "search":
      return { status: "loading", requestId: event.requestId, query: event.query };
    case "cancel": return { status: "idle" };
    case "resolved":
      return activeRequest(state) === event.requestId
        ? { status: "success", results: event.results } : state;
    case "rejected":
      return activeRequest(state) === event.requestId
        ? { status: "failure", error: event.error } : state;
    default: return unreachable(event);
  }
}

type Transport = (query: string, signal: AbortSignal) => Promise<unknown>;

function load(query: string, transport: Transport): Effect.Effect<Results, Failure> {
  return Effect.tryPromise({
    try: (signal) => transport(query, signal),
    catch: (error): Failure => ({ kind: "Transport", message: String(error) }),
  }).pipe(
    Effect.flatMap(Schema.decodeUnknownEffect(Results)),
    Effect.mapError((error): Failure => "kind" in error ? error : {
      kind: "InvalidResponse", message: String(error),
    }),
  );
}

function createSearch(transport: Transport) {
  let state: State = { status: "idle" };
  let sequence = 0n;
  const send = (event: Event) => { state = transition(state, event); };
  return {
    snapshot: (): State => state,
    cancel: () => send({ type: "cancel" }),
    search: (query: string): Promise<void> => {
      const requestId = ++sequence;
      send({ type: "search", query, requestId });
      return Effect.runPromise(load(query, transport).pipe(
        Effect.match({
          onSuccess: (results) => send({ type: "resolved", requestId, results }),
          onFailure: (error) => send({ type: "rejected", requestId, error }),
        }),
      ));
    },
  };
}

async function verify() {
  const pending: Array<{ resolve: (value: unknown) => void; reject: (error: unknown) => void }> = [];
  const search = createSearch(() => new Promise((resolve, reject) => {
    pending.push({ resolve, reject });
  }));
  const request = (index: number) => {
    const value = pending[index];
    assert.ok(value, `Missing test request ${index}`);
    return value;
  };
  const old = search.search("old");
  const current = search.search("current");
  request(1).resolve([{ id: "2", title: "Current" }]);
  await current;
  request(0).resolve([{ id: "1", title: "Obsolete" }]);
  await old;
  assert.deepEqual(search.snapshot(), {
    status: "success", results: [{ id: "2", title: "Current" }],
  });

  const cancelled = search.search("cancelled");
  search.cancel();
  request(2).reject(new Error("late failure"));
  await cancelled;
  assert.deepEqual(search.snapshot(), { status: "idle" });

  const malformed = search.search("malformed");
  request(3).resolve([{ id: 4, title: "Wrong type" }]);
  await malformed;
  const invalid = search.snapshot();
  assert.equal(invalid.status, "failure");
  if (invalid.status === "failure") assert.equal(invalid.error.kind, "InvalidResponse");

  const failed = search.search("offline");
  request(4).reject(new Error("offline"));
  await failed;
  const offline = search.snapshot();
  assert.equal(offline.status, "failure");
  if (offline.status === "failure") assert.equal(offline.error.kind, "Transport");

  const retry = search.search("retry");
  request(5).resolve([]);
  await retry;
  assert.deepEqual(search.snapshot(), { status: "success", results: [] });

  const obsolete = search.search("obsolete");
  const replacement = search.search("replacement");
  request(6).resolve([{ id: "old", title: "Obsolete" }]);
  await obsolete;
  assert.deepEqual(search.snapshot(), {
    status: "loading", requestId: 8n, query: "replacement",
  });
  request(7).resolve([{ id: "new", title: "Replacement" }]);
  await replacement;
  assert.deepEqual(search.snapshot(), {
    status: "success", results: [{ id: "new", title: "Replacement" }],
  });
  console.log("search lifecycle: 6 traces passed");
}

verify().catch((error) => { console.error(error); process.exitCode = 1; });
