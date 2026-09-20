import { Effect, Layer, Match, Redacted, Schema } from "effect";
import { AiError, DecisionModel } from "effect/unstable/ai";
import { AppConfig } from "../config";

import {
  ClassifyAnswer,
  ProbabilityAnswer,
  RateAnswer,
} from "./decision-answer";

const Probability = Schema.Number.check(
  Schema.isBetween({ minimum: 0, maximum: 1 }),
);

const Answer = Schema.Union([
  Schema.Struct({
    type: Schema.Literal("choice"),
    choice: Schema.String,
    probabilities: Schema.Record(Schema.String, Probability),
    confidence: Probability,
  }),
  Schema.Struct({ type: Schema.Literal("noul"), noul: Probability }),
  Schema.Struct({
    type: Schema.Literal("score"),
    score: Schema.Number,
    legend: Schema.Record(Schema.String, Schema.String),
    probabilities: Schema.Record(Schema.String, Probability),
    confidence: Probability,
  }),
]);

const Output = Schema.Struct({
  model: Schema.String,
  answers: Schema.Record(Schema.String, Answer),
  usage: Schema.Struct({
    input_tokens: Schema.Number,
    output_tokens: Schema.Number,
  }),
});

const providerFailure = (status: number) =>
  AiError.make({
    module: "OpenRouterDecisionModel",
    method: "decide",
    reason:
      status === 429
        ? new AiError.RateLimitError({})
        : status === 401 || status === 403
          ? new AiError.AuthenticationError({ kind: "Unknown" })
          : new AiError.InternalProviderError({
              description: "OpenRouter request failed.",
            }),
  });

const failure = (description: string) =>
  AiError.make({
    module: "OpenRouterDecisionModel",
    method: "decide",
    reason: new AiError.InvalidOutputError({ description }),
  });

// Translate Effect Classify/Probability into TypeSafe Choice/Noul via OpenRouter System One.
export const OpenRouterDecisionsLive = Layer.effect(
  DecisionModel.DecisionModel,
  Effect.gen(function* () {
    const config = yield* AppConfig;

    return yield* DecisionModel.make({
      decide: Effect.fn("OpenRouter.decide")(function* (options) {
        if (!Redacted.value(config.key).trim())
          return yield* Effect.fail(
            providerFailure(401),
          );

        const response = yield* Effect.tryPromise({
          try: async (signal) => {
            const response = await fetch(
              "https://openrouter.ai/api/v1/systemone",
              {
                method: "POST",
                signal,
                headers: {
                  Authorization: `Bearer ${Redacted.value(config.key)}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  model: config.decisionModel,
                  state: options.state,
                  questions: Object.fromEntries(
                    Object.entries(options.decisions).map(([id, decision]) => [
                      id,
                      Match.value(decision).pipe(
                        Match.tag("Classify", (question) => ({
                          type: "choice",
                          instructions: question.instructions,
                          criteria: question.criteria,
                        })),
                        Match.tag("Probability", (question) => ({
                          type: "noul",
                          instructions: question.instructions,
                          criteria: question.criteria,
                        })),
                        Match.tag("Rate", (question) => ({
                          type: "score",
                          instructions: question.instructions,
                          criteria: question.criteria,
                        })),
                        Match.exhaustive,
                      ),
                    ]),
                  ),
                }),
              },
            );

            if (!response.ok) {
              await response.body?.cancel();

              return { ok: false, status: response.status, body: "" };
            }

            return {
              ok: true,
              status: response.status,
              body: await response.text(),
            };
          },
          catch: () => providerFailure(0),
        });

        if (!response.ok) {
          return yield* Effect.fail(providerFailure(response.status));
        }

        const body = response.body;

        const output = yield* Schema.decodeUnknownEffect(
          Schema.fromJsonString(Output),
        )(body).pipe(
          Effect.mapError(() =>
            failure("Jev returned an invalid System One response."),
          ),
        );

        return {
          answers: Object.fromEntries(
            Object.entries(output.answers).map(([id, answer]) => [
              id,
              Match.value(answer).pipe(
                Match.when({ type: "choice" }, (value) =>
                  ClassifyAnswer.make({
                    label: value.choice,
                    probabilities: value.probabilities,
                    confidence: value.confidence,
                  }),
                ),
                Match.when({ type: "noul" }, (value) =>
                  ProbabilityAnswer.make({ probability: value.noul }),
                ),
                Match.when({ type: "score" }, (value) =>
                  RateAnswer.make({
                    rating: value.score,
                    probabilities: Object.fromEntries(
                      Object.entries(value.probabilities).map(
                        ([level, probability]) => [
                          value.legend[level] ?? level,
                          probability,
                        ],
                      ),
                    ),
                    confidence: value.confidence,
                  }),
                ),
                Match.exhaustive,
              ),
            ]),
          ),
          usage: {
            inputTokens: output.usage.input_tokens,
            outputTokens: output.usage.output_tokens,
          },
        };
      }),
    });
  }),
);
