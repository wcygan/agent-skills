# Decision framework

Read when a workflow needs a typed model assessment whose answer drives
application policy, rather than a stateful agent session.

## Intended boundary

```text
validated input → Decision definition → DecisionModel implementation
                                             ↓
                                  validated typed assessment
                                             ↓
                                deterministic application policy
```

Keep assessment definitions in `src/server/decisions`. Application services
consume assessments and own thresholds, state transitions, and side effects.
Use ordinary deterministic code when the answer can be computed directly.
A model answer is input to policy, not authorization to execute an action.

Supply the evaluator through an Effect layer. Keep provider details out of the
assessment definition. Validate both inputs and outputs, preserve useful model
metadata, and model invalid output and provider failure explicitly. Tests should
supply fixed assessments and verify policy independently of model calls.

## Version and provider check

The requested API references are under Effect's unstable AI namespace. Before
writing executable examples, verify that the selected Effect release exports
`Decision` and `DecisionModel`, then read their exact constructors, schemas,
service methods, and provider requirements. Pin compatible versions.

The bundled example verifies these APIs against Effect `4.0.0-rc.116`:
`Decision.make` defines input and named decisions; `Decision.classify`,
`Decision.probability`, and `Decision.rate` describe the assessments; `DecisionModel.make` supplies
a provider implementation; `DecisionModel.decide` validates its answers. The
example adapter supports classification, probability, and rating. Check the
installed types before upgrading because these APIs are unstable.

OpenRouter chat compatibility and Pi integration do not establish DecisionModel
support. Verify an actual implementation before connecting it. If a different
provider is required, make that dependency and its configuration explicit;
leave a clearly identified fake layer for scaffold tests until resolved.

Sources: [DecisionModel](https://effect.website/docs/v4/api/effect/unstable/ai/DecisionModel),
[Decision](https://effect.website/docs/v4/api/effect/unstable/ai/Decision).

## Bundled Jev integration

The example uses `typesafe/jev-1.13` via OpenRouter's
`POST https://openrouter.ai/api/v1/systemone`, with `OPENROUTER_API_KEY`.
`OPENROUTER_DECISION_MODEL` controls this independently from the Pi chat model
in `OPENROUTER_MODEL`. Send `model`, `state`, and `questions`, not chat messages.
Map Effect Classify to TypeSafe Choice, Probability to Noul, and Rate to Score; ask the
independent category and urgency questions together. Decode TypeSafe `choice`,
`probabilities`, and `noul` fields into Effect answers before applying policy.
For Score, map numeric level keys through the returned legend to the rubric
labels expected by Effect and retain the weighted score. Preserve Choice and
Score confidence for review policies; unused speculative answers do not gate
the selected branch.
The mock intercepts that same endpoint and validates the question shapes and
pinned Jev model. Mock results verify the contract, not live model quality.

Sources checked 2026-09-20:
[OpenRouter TypeSafe integration](https://openrouter.ai/docs/guides/community/typesafe-sdk),
[TypeSafe HTTP API](https://docs.typesafe.ai/api),
[Choice](https://docs.typesafe.ai/primitives/choice),
[Noul](https://docs.typesafe.ai/primitives/noul).
