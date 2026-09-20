import { OpenRouterDecisionsLive } from "../src/server/adapters/openrouter-decisions";
import { runDemo } from "../src/server/decisions/demos";
import { describe, expect, spyOn, test } from "bun:test";
import { Effect, Layer, Redacted, Result, Schema } from "effect";
import { DecisionModel } from "effect/unstable/ai";
import { assessTicket, routeTicket, TicketAssessment } from "../src/server/decisions/ticket";
import { AppConfig } from "../src/server/config";
import { Prompt } from "../src/shared/contracts";
import { ClassifyAnswer, ProbabilityAnswer } from "../src/server/adapters/decision-answer";
import { AgentRunner, PiLive } from "../src/server/adapters/pi";

const config = Layer.succeed(AppConfig, {
  key: Redacted.make("test-key"),
  model: "test-model",
  decisionModel: "typesafe/jev-1.13",
  mode: "live",
});

const decisionLayer = (urgency: number, billing = 0.1) =>
  Layer.effect(
    DecisionModel.DecisionModel,
    DecisionModel.make({
      decide: () =>
        Effect.succeed({
          answers: {
            category: ClassifyAnswer.make({
              label: "technical",
              probabilities: { billing, technical: 0.8, general: 0.1 },
            }),
            urgency: ProbabilityAnswer.make({ probability: urgency }),
          },
          usage: { inputTokens: undefined, outputTokens: undefined },
        }),
    }),
  );

describe("ticket assessment", () => {
  test("typed answers drive application policy", async () => {
    const answer = await Effect.runPromise(
      assessTicket({ text: "Checkout is down" }).pipe(
        Effect.provide(Layer.merge(config, decisionLayer(0.9))),
      ),
    );

    expect(answer).toEqual({
      category: "technical",
      probabilities: { billing: 0.1, technical: 0.8, general: 0.1 },
      urgency: 0.9,
      action: "Priority review",
      model: "typesafe/jev-1.13",
    });
  });
  test("priority threshold is inclusive", () => {
    expect(routeTicket(0.6999)).toBe("Standard queue");
    expect(routeTicket(0.7)).toBe("Priority review");
  });
  test("framework rejects invalid distributions instead of displaying them", async () => {
    const result = await Effect.runPromise(
      DecisionModel.decide(TicketAssessment, { input: { text: "Help" } }).pipe(
        Effect.provide(decisionLayer(0.8, 0.5)),
        Effect.result,
      ),
    );

    expect(result._tag).toBe("Failure");
  });
  test("framework rejects urgency outside its valid range", async () => {
    const result = await Effect.runPromise(
      DecisionModel.decide(TicketAssessment, { input: { text: "Help" } }).pipe(
        Effect.provide(decisionLayer(1.2)),
        Effect.result,
      ),
    );

    expect(result._tag).toBe("Failure");
  });
});

test("request schema rejects empty and oversized prompts", () => {
  expect(() => Schema.decodeUnknownSync(Prompt)({ text: "" })).toThrow();
  expect(() => Schema.decodeUnknownSync(Prompt)({ text: "x".repeat(4001) })).toThrow();
});

test("Pi fails clearly without credentials and makes no provider request", async () => {
  const result = await Effect.runPromise(
    Effect.flatMap(AgentRunner, (agent) => agent.run("Hello")).pipe(
      Effect.provide(
        PiLive.pipe(
          Layer.provide(
            Layer.succeed(AppConfig, {
              key: Redacted.make(""),
              model: "test-model",
              decisionModel: "typesafe/jev-1.13",
              mode: "live",
            }),
          ),
        ),
      ),
      Effect.result,
    ),
  );

  expect(result._tag).toBe("Failure");

  if (Result.isFailure(result)) expect(result.failure.message).toContain("OPENROUTER_API_KEY");
});

test("decision demos report missing credentials without making an HTTP request", async () => {
  const fetchSpy = spyOn(globalThis, "fetch").mockImplementation(Object.assign(() => {
    throw new Error("Unexpected HTTP request");
  }, { preconnect: globalThis.fetch.preconnect }));

  try {
    const emptyConfig = Layer.succeed(AppConfig, {
      key: Redacted.make(""),
      model: "test-model",
      decisionModel: "typesafe/jev-1.13",
      mode: "live",
    });

    const result = await Effect.runPromise(
      runDemo({ demo: "ranking", scenario: "roadmap" }).pipe(
        Effect.provide(OpenRouterDecisionsLive.pipe(Layer.provideMerge(emptyConfig))),
        Effect.result,
      ),
    );

    expect(Result.isFailure(result)).toBe(true);

    if (Result.isFailure(result)) {
      expect(result.failure.code).toBe("Configuration");
      expect(result.failure.message).toContain("OPENROUTER_API_KEY");
    }

    expect(fetchSpy).not.toHaveBeenCalled();
  } finally {
    fetchSpy.mockRestore();
  }
});
