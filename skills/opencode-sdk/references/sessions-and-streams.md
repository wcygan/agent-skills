# Sessions, Results, And Streams

Use this for prompt delivery, final answers, progress, cancellation, permissions,
forms, or recovery. The executable sources are `../examples/effect.ts` and
`../examples/results.ts`. They use native Effect v4 on Bun. Read them rather than
copying an abbreviated prompt example that closes its host too soon.

## Verified Turn Contract (2.0.27)

1. Acquire a host in an application-owned scope; create a session with an
   explicit location. Give each independent operation its own session, or
   serialize all writers to a shared session.
2. Start consuming `events.subscribe()` before dispatch. Its connection is lazy:
   constructing a Stream/iterator is insufficient. Await `server.connected`.
3. Submit `sessions.prompt({ sessionID, text, delivery: "queue" })`. Save the
   returned inbox item's `id`; this is the accepted input's message identity.
4. Await `sessions.wait({ sessionID })`. The implementation waits for the
   execution coordinator to become idle; it discards execution failures while
   waiting. A successful wait therefore does not establish task success.
5. Retrieve `sessions.context({ sessionID })`. Locate the accepted user message
   by its ID, inspect the following execution records, and retrieve the completed
   assistant text for that input. Reject failed/interrupted idle records and
   relevant assistant/tool errors according to application policy.
6. If the caller requires complete progress delivery, also await the matching
   `session.execution.succeeded`, `.failed`, or `.interrupted` event before
   unsubscribing. The event reader can lag behind the stored result and wait.
7. Finalize the subscriber and host within their owners' scopes.

The generated method is **`sessions.wait` / `session.wait`**. Its protocol
endpoint is `/api/experimental/session/:sessionID/wait`, with the OpenAPI
identifier `experimental.session.wait`. That explains the different names in
web documentation; the SDK aliases, protocol, and runtime were checked together.
Do not synthesize method names from the OpenAPI identifier.

## Correlating Results

Context is an ordered array of `SessionMessage.Info`, with `type` variants such
as `user`, `assistant`, and `idle`. Assistant content contains text, reasoning,
and tool parts. In the example, a successful final assistant has `finish: "stop"`
and a completed timestamp; `idle.outcome` also distinguishes failures and
interruption. Provider initialization can fail without creating an assistant.

The example reader starts at the accepted user ID and stops at the next user
message. This is valid for its serialized turns; it is not a general correlation
algorithm for overlapping steer/queue inputs. Steered prompts can share a turn.
For shared interactive sessions, inspect the release's inbox, execution and
message contracts and define how merged inputs map to application requests.
Never return the last assistant in the whole session without correlation.

The example treats every tool error in that turn as failure even if the model
later emits fallback text. Applications permitting recoverable tool errors
should define their success policy explicitly instead of copying that rule.
A finish caused by token limits or filtering is not the example's successful
completed answer.

Native Effect operations return decoded values, including branded IDs and
DateTime values. Check each boundary before sharing helpers with any encoded
transport representation. The maintained demo composes native Effects directly.

## Progress Ownership And Loss

`session.text.delta` carries `data.sessionID`, `assistantMessageID`, and `delta`.
Filter by session and the event's location when present. Keep consumer callbacks
short. In the pinned client source, each shared subscriber has a 4096-event queue;
overflow fails that subscriber rather than applying general backpressure to all
consumers. The native example adds a 64-event suspend buffer before handling
progress; a stalled consumer can still overflow the upstream queue. For slow
UI/network work, choose whether overflow drops/coalesces progress or fails the
subscription. Preserve terminal events and reconcile full text from
stored context; deltas alone cannot reconstruct missed output reliably.

The demo awaits connection readiness and drain through the execution terminal
event. They surface source failure rather than waiting indefinitely on a readiness
signal after a subscriber exits. The demo applies a thirty-second turn budget,
including progress draining; adjust it to the application's operating envelope. If progress is optional, recover a lost subscription
by checking stored state and resubscribing; surface degraded progress separately
from the agent result. A replacement subscriber has no past-event replay.

The test suite verifies subscriber disposal and client EOF without automatic
reconnect using a synthetic fetch response. It does not simulate a production
proxy or prove recovery across a server restart.

## Cancellation

Native fiber interruption stops the caller's work; it does not by itself establish
that the session stopped. The demo interrupts the session and waits for idle
before releasing the owning host. Keep cleanup alive while
handling caller cancellation; do not reuse a session while interruption is pending.
Cancelling one event subscriber ends that consumer, not the agent loop.

In 2.0.27's AI SDK bridge, `doStream(options)` is initialized without attaching
an Effect-generated AbortSignal. Once returned, its ReadableStream is consumed
with scoped cancellation. The fixture proves cancellation of that stream, not
cancellation of an indefinitely pending `doStream` initialization promise. Wrap
external SDK initialization in its own supported cancellation boundary and test
it separately; do not infer AbortSignal propagation from native Effect typing.

## Permissions And Forms

`permission.create` returns `{ id, effect }`. An `ask` result admits a pending
request and returns immediately. It is not approval, and a later reply does not
rewrite the original response. Inspect pending requests, correlate by session
and request ID, and resolve via `permission.reply({ ..., decision })`, where the
release supports `once`, `always`, or `reject`. Observe the reply/removal before
continuing the protected application action. Avoid persistent `always` approvals
in disposable examples.

The fixture verifies asking, listing, and rejecting within the host's default
location. Permission create/get/reply are location-bound in this release; unlike
list, they do not all infer the session location the same way. Check location
routing when the session differs from the client/server default. Cross-location
permission routing is not established by this fixture.

Forms likewise require an explicit application/UI responder, cancellation, or a
blocked outcome. Read the release's form create/get/reply schemas and pending
form state through the index. Headless code must not interpret waiting for input
as a successful answer. Form handling and background-subagent completion remain
documentation-checked branches, not fixture-tested behavior.
