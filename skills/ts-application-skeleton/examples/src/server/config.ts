import { Config, Context, Effect, Layer, Redacted, Schema } from "effect";

export class AppConfig extends Context.Service<
  AppConfig,
  {
    key: Redacted.Redacted<string>;
    model: string;
    decisionModel: string;
    mode: "mock" | "live";
  }
>()("app/Config") {}

export const ConfigLive = Layer.effect(
  AppConfig,
  Effect.gen(function* () {
    const mode = yield* Config.schema(Schema.Literals(["mock", "live"]), "AI_MODE").pipe(
      Config.withDefault("mock"),
    );

    const configuredKey = yield* Config.Redacted("OPENROUTER_API_KEY").pipe(
      Config.withDefault(Redacted.make("")),
    );

    const model = yield* Config.String("OPENROUTER_MODEL").pipe(
      Config.withDefault("openai/gpt-4.1-mini"),
    );

    const decisionModel = yield* Config.String("OPENROUTER_DECISION_MODEL").pipe(
      Config.withDefault("typesafe/jev-1.13"),
    );

    const key = mode === "mock" ? Redacted.make("mock-key-not-a-secret") : configuredKey;

    return AppConfig.of({ key, model, decisionModel, mode });
  }),
);
