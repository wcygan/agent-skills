# AI Integration

Use this when embedding Pi agents, calling model providers, or implementing
structured AI decisions in an Effect application.

## Choose The Surface

| Need | Default |
| --- | --- |
| Agent sessions with conversation, tools, and workspace resources | Pi SDK behind an Effect service |
| Generation or structured extraction without an agent session | Effect `LanguageModel` with a provider layer |
| Classification, ordered ratings, or probabilities | Effect `Decision` definitions and `DecisionModel` |
| Agent process isolation or control from another language | Pi RPC behind an adapter |

Pi is the usual choice for agent behavior. Add Effect AI when the application
needs a separate model operation; keep ownership of each operation explicit.
Avoid running two agent loops for the same task.

## Source And Version Checks

- For Pi SDK work, apply the `pi-sdk` skill and its Effect integration branch.
  It owns package discovery, session APIs, tools, resources, and authentication
  details. If unavailable, consult the [official SDK docs](https://pi.dev/docs/latest/sdk)
  and installed declarations before implementation.
- Check resolved package versions and exports. Latest online Pi docs may differ
  from the installed SDK; use the installed package's docs and types.
- Keep separately published Effect provider packages at versions matching
  `effect`. Check stability annotations against the pinned version: unstable
  APIs may break in minor releases, experimental APIs in patch releases.
- Effect v4 AI imports use `effect/ai`, without an `unstable` path segment.
  `Decision` and `DecisionModel` remain unstable. Verify provider capability
  independently from model availability and credentials.

## Application Boundary

Expose domain operations such as `triageTicket` or `runReview` through
`Context.Service`, implemented by `Layer.effect` and named `Effect.fn` methods.
Keep sessions, provider clients, prompts, and raw event types in the adapter.
Use the conventions in `SERVICES_LAYERS.md` and `SCHEMA.md`.

Decode external input and validate generated output before business actions.
Schema validity establishes shape, not factual correctness or authorization.
Application code owns permissions, budgets, and authoritative writes; generated
text and tool arguments are inputs to those checks.

## Pi Session Lifecycle

Treat each session as mutable conversation state with one owner. Serialize
operations on a shared session, or acquire a separate session per independent
request. Choose persistence deliberately; use in-memory sessions for ephemeral
work.

Acquire sessions with scoped cleanup. Finalize subscriptions and dispose the
session when its owner ends. Bridge Effect interruption to Pi's supported abort
operation and observe completion before reusing a session: interrupting a
Promise wrapper alone does not cancel SDK work.

Bridge callbacks into domain events with `Queue` or `PubSub` and expose a
`Stream` when callers need progress. Keep callbacks non-blocking and specify
overflow behavior; a synchronous callback cannot automatically inherit stream
backpressure. Preserve terminal events and distinguish completion, cancellation,
provider failure, and tool failure. Rebind subscriptions after session replacement.

In Pi 0.99.1's installed SDK docs, `agent_end` ends one low-level run; recovery
or queued work may follow. Use `agent_settled` for no further automatic work,
and `message_end` for the completed message. Check these semantics against the
application's Pi version before selecting the terminal signal.

Choose tools and resource discovery explicitly for the workspace and task.
Inspection sessions use a read-only allowlist. Load extensions only when their
capabilities are required; SDK behavior must be checked separately from CLI
defaults.

## Effect Models And Providers

Use [LanguageModel](https://effect.website/docs/v4/api/effect/ai/LanguageModel)
for text, streaming, and schema-backed output. Read the operation's pinned
declarations before choosing options or assuming tool execution behavior.

Provider choices:

- [@effect/ai-openai](https://effect.website/docs/v4/api/ai-openai) exposes
  `OpenAiClient` and `OpenAiLanguageModel` for OpenAI calls.
- [@effect/ai-openrouter](https://effect.website/docs/v4/api/ai-openrouter)
  exposes `OpenRouterClient`, `OpenRouterLanguageModel`, and
  `OpenRouterDecisionModel`.

Compose the model layer with its client and required HTTP transport at startup.
Read configuration with `Config` and credentials with `Config.redacted`; keep
provider/model selection explicit. A language-model provider is not automatically
a `DecisionModel` provider. Do not invent an `OpenAiDecisionModel` from naming
symmetry or assume Pi authentication supplies Effect provider credentials.

## Structured Decisions

[Decision](https://effect.website/docs/v4/api/effect/ai/Decision) defines an input
schema and named questions through `Decision.make`:

- `Decision.classify`: choose among labelled criteria; supply at least two labels.
- `Decision.rate`: evaluate against an ordered criteria scale.
- `Decision.probability`: estimate a yes/no likelihood.

Define the criteria as application policy, with clear examples of each outcome.
Keep definitions alongside the domain operation that uses them.

[DecisionModel.decide](https://effect.website/docs/v4/api/effect/ai/DecisionModel)
answers those questions for one input and returns typed answers plus usage.
It encodes input as JSON and validates provider answers; encoding and invalid
output failures remain in the `AiError` channel. Use JSON-encodable input schemas
and verify encoding-service requirements for custom schemas.

The [OpenRouter decision adapter](https://effect.website/docs/v4/api/ai-openrouter/OpenRouterDecisionModel)
targets OpenRouter's alpha Decisions API. Verify endpoint and selected-model
support before adopting it; keep it replaceable behind the domain service.

Treat probabilities and confidence as model estimates. Choose thresholds using
labelled evaluation cases; route uncertain answers to an explicit fallback or
review outcome. Keep decision evaluation separate from executing its effects.

## Failure, Budget, And Evidence

Map failures into domain errors while preserving diagnostic causes and Effect
interruption. Separate configuration, provider, invalid-output, and tool failures.
Use bounded timeouts, concurrency, and retry policies. Retry only proven
idempotent boundaries: replaying an accepted agent prompt may repeat tool writes.

Record operation, provider/model, prompt or criteria revision, latency, usage,
and terminal outcome. Redact credentials and private prompt content. Enforce
application limits on calls, tokens, elapsed time, and tool work; a timeout alone
does not bound cost or undo completed actions. Provider fallback must respect
the user's model and data-handling constraints.

## Verification

Use test layers for application tests, with controlled answers, events, and typed
failures. Check cancellation, disposal, session isolation, malformed output,
retry bounds, and denied tool actions where relevant. Follow `TESTING.md` for
deterministic synchronization.

Maintain labelled evaluation cases for decision quality and threshold changes.
Keep live-provider smoke tests separate and explicitly configured. Typecheck
adapter wiring against the project's resolved packages and report version/docs
mismatches rather than claiming latest-online examples were runtime-verified.
