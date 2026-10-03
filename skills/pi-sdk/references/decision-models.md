# Decision models and classifier routing

Use Pi classifier models for bounded decisions such as task complexity,
category selection, or scoring. This reference is source-derived from
**Pi v0.99.0**. Check the installed version using [reading.md](reading.md)
before adopting these APIs; the tag pins the implementation, not the remote
model behind an alias such as `jev-latest`.

## Request and result contract

The [classifier types](https://github.com/earendil-works/pi/blob/v0.99.0/packages/ai/src/types.ts#L633-L689)
define a context containing JSON-object `state` and `questions` keyed by ID.
Each question supplies `instructions` and type-specific `criteria`:

| Type | Criteria | Answer |
| --- | --- | --- |
| `choice` | Map of option keys to descriptions | `choice`, per-option `probabilities`, `confidence` |
| `score` | Ordered array of level descriptions | Numeric `score`, `confidence` |
| `bool` | Descriptions under `true` and `false` | `probability` of true |

`ClassifierResult.answers` uses the same question IDs. Inspect `stopReason`
(`stop`, `error`, or `aborted`) before consuming answers, then narrow each
answer by `type`. A boolean answer is a probability, so the application must
choose its threshold. Provider/model/API identity accompanies the result;
usage is optional.

## Calling Jev from an extension

This fragment assumes a version-matched `ExtensionContext` named `ctx`, a
`prompt` string, and an `AbortSignal` named `signal`. It produces a decision;
the caller remains responsible for selecting and running a coding model.

```ts
const jev = ctx.modelRegistry.findOfType("classifier", "typesafe", "jev-latest");
if (!jev) throw new Error("The Jev classifier is unavailable");

const result = await ctx.modelRegistry.classify(jev, {
  state: { prompt },
  questions: {
    complexity: {
      type: "choice",
      instructions: "Classify the engineering difficulty of the prompt.",
      criteria: {
        standard: "A routine, bounded change",
        complex: "A change requiring substantial design or investigation",
      },
    },
  },
}, { signal });

if (result.stopReason !== "stop") {
  throw new Error(result.errorMessage ?? `Classification ${result.stopReason}`);
}
const answer = result.answers.complexity;
if (answer?.type !== "choice") throw new Error("Missing complexity choice");
const needsStrongPlanner = (answer.probabilities.complex ?? 0) >= 0.5;
```

Keep `ctx.modelRegistry` scoped to extension APIs. For an embedded SDK
integration, locate the installed runtime's classifier surface rather than
assuming an `AgentSession` exposes this context. Resolve credentials through
the runtime; the pinned Jev example requires `TYPESAFE_API_KEY` and separate
OpenAI Codex authentication.

## Routing across planning and implementation

The [Jev router example](https://github.com/earendil-works/pi/blob/v0.99.0/packages/coding-agent/examples/extensions/jev-router.ts)
registers the virtual model `jev/auto` using `pi.registerVirtualModel()`:

- When initializing router state, it preserves an existing Sol/Terra route;
  otherwise it classifies the latest user text, limited to 16,000 characters.
- A complex probability of at least 0.5 selects GPT-5.6 Sol; otherwise it uses
  Terra, including when Jev is absent or returns an unsuccessful result.
- A successful `edit` or `write` result after the latest user message moves
  the next request to Luna. The implementation phase persists in branch
  state across compaction; it is not reset for each prompt.
- Direct requests, including compaction, use Luna. Routes carry the requested
  thinking level through to the selected model.

Treat these model IDs, threshold, fallback, and edit trigger as example policy.
Choose them for the application and handle cancellation explicitly; the
example's unsuccessful-result fallback also covers an aborted classification.
The [0.99.0 release notes](https://pi.dev/changelog/releases/0.99.0) identify
this router example.

## Provider behavior and evaluation

[TypeSafe's adapter](https://github.com/earendil-works/pi/blob/v0.99.0/packages/ai/src/api/typesafe-system-one.ts)
uses the System One protocol, mapping public `bool` questions to wire-level
`noul`. Keep that translation inside the adapter.

The [llama.cpp adapter](https://github.com/earendil-works/pi/blob/v0.99.0/packages/ai/src/api/llama-cpp-classify.ts)
supports ordinary chat models through the classifier interface. It reads
next-token label probabilities and normalizes them into decisions. It needs
llama-server's `/tokenize`, `/apply-template`, and `/completion` endpoints;
an OpenAI-compatible chat endpoint alone is insufficient. Labels must be
distinct single tokens; supported counts are 2–62 choices or 2–10 score
levels. Missing label probabilities trigger deeper readouts, then an error.
Scores are probability-weighted level indices and may be fractional.

This is a structured decision interface, not evidence of a capability that
LLMs fundamentally lack. Treat confidence as an adapter-produced signal,
not a calibrated guarantee of correctness. Measure decision quality,
latency, total cost, and downstream task success on representative work
before choosing Jev over a local classifier or another LLM-based approach.
Exercise unavailable models, failed/aborted classification, missing answers,
threshold boundaries, and phase persistence when validating a router.
