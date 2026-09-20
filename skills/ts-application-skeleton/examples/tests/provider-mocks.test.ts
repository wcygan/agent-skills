import { runDemo } from "../src/server/decisions/demos";
import { DemoResult, rankItems, scenarios } from "../src/shared/decision-demos";
import { databaseLayer } from "../src/server/storage/database";
import { decisionScenarios } from "../src/shared/decision-scenarios";
import { afterAll, beforeAll, expect, test } from "bun:test";
import { ConfigProvider, Effect, Layer, ManagedRuntime, Result, Schema } from "effect";
import { ServicesLive } from "../src/server/layers";
import { AppConfig } from "../src/server/config";
import { AgentRunner } from "../src/server/adapters/pi";
import { assessTicket } from "../src/server/decisions/ticket";

// Explicitly empty environment proves default mock mode requires no real key.
const runtime = ManagedRuntime.make(
  ServicesLive.pipe(
    Layer.provide(databaseLayer(":memory:")),
    Layer.provide(
      Layer.succeed(ConfigProvider.ConfigProvider, ConfigProvider.fromEnv({ env: {} })),
    ),
  ),
);

beforeAll(() => runtime.context());

afterAll(() => runtime.dispose());

test("mock is the default without environment configuration", async () => {
  expect(await runtime.runPromise(Effect.map(AppConfig, (config) => config.mode))).toBe("mock");
});

test("real Pi session consumes an intercepted streaming provider response", async () => {
  const result = await runtime.runPromise(
    Effect.flatMap(AgentRunner, (agent) => agent.run("Explain dependency injection with coffee.")),
  );

  expect(result.model).toBe("openai/gpt-4.1-mini");
  expect(result.text).toContain("barista");
  expect(result.text).toContain("deterministic mock response");
});

test("real decisions adapter decodes intercepted JSON and routes urgent tickets", async () => {
  const result = await runtime.runPromise(assessTicket({ text: "Checkout is down. Help now!" }));
  expect(result.model).toBe("typesafe/jev-1.13");
  expect(result.category).toBe("technical");
  expect(result.action).toBe("Priority review");
});

test("invoice fixture stays in the standard billing queue", async () => {
  const result = await runtime.runPromise(
    assessTicket({ text: "Please send last month's invoice." }),
  );

  expect(result.category).toBe("billing");
  expect(result.action).toBe("Standard queue");
});

test("malformed provider JSON becomes a typed application failure", async () => {
  const result = await runtime.runPromise(
    assessTicket({ text: "[mock:invalid]" }).pipe(Effect.result),
  );

  expect(result._tag).toBe("Failure");

  if (Result.isFailure(result)) expect(result.failure.code).toBe("InvalidOutput");
});

test("provider rate limits fail both paths without live requests", async () => {
  const decision = await runtime.runPromise(
    assessTicket({ text: "[mock:rate-limit]" }).pipe(Effect.result),
  );

  const agent = await runtime.runPromise(
    Effect.flatMap(AgentRunner, (agent) => agent.run("[mock:rate-limit]")).pipe(Effect.result),
  );

  expect(decision._tag).toBe("Failure");
  expect(agent._tag).toBe("Failure");

  if (Result.isFailure(decision)) expect(decision.failure.code).toBe("RateLimited");

  if (Result.isFailure(agent)) expect(agent.failure.code).toBe("ProviderFailure");
});

test("unexpected external requests are blocked in mock mode", async () => {
  const response = await fetch("https://unexpected-provider.invalid/test");
  expect(response.status).toBe(503);
});

test("suggested decision scenarios produce distinct real adapter results", async () => {
  const results = await Promise.all(
    decisionScenarios.map((scenario) => runtime.runPromise(assessTicket({ text: scenario.text }))),
  );

  expect(results.map((result) => result.probabilities[result.category])).toEqual([
    0.99, 0.97, 0.95,
  ]);

  for (const result of results)
    expect(Object.values(result.probabilities).reduce((sum, value) => sum + value, 0)).toBeCloseTo(
      1,
    );
  expect(
    results.map((result) => ({
      category: result.category,
      action: result.action,
      urgency: result.urgency,
    })),
  ).toEqual([
    { category: "technical", action: "Priority review", urgency: 0.98 },
    { category: "billing", action: "Standard queue", urgency: 0.03 },
    { category: "general", action: "Standard queue", urgency: 0.07 },
  ]);
});

for (const demo of ["ranking", "evidence", "actions", "skills", "extraction"] as const) {
  for (const scenario of scenarios[demo]) {
    test(`${demo}/${scenario.id} crosses the real adapter and output schema`, async () => {
      const result = await runtime.runPromise(runDemo({ demo, scenario: scenario.id }));

      expect(() => Schema.decodeUnknownSync(DemoResult)(result)).not.toThrow();
      expect(result.mode).toBe("mock");
      expect(result.heading).not.toBe("");
    });
  }
}

test("ranking composes reusable Score answers with different weights", async () => {
  const result = await runtime.runPromise(runDemo({ demo: "ranking", scenario: "roadmap" }));

  expect(result.items).toHaveLength(5);
  expect(result.items[0].values.impact).toBeCloseTo(1.8);
  expect(rankItems(result.items, { impact: 100, fit: 0, ease: 0 })[0].id).toBe("offline");
  expect(rankItems(result.items, { impact: 0, fit: 0, ease: 100 })[0].id).toBe("themes");
  expect(rankItems(result.items, { impact: 0, fit: 0, ease: 0 }).every((item) => item.score === 0)).toBe(true);
});

test("citation policy separates exact checks, contradiction, and uncertain evidence", async () => {
  const missing = await runtime.runPromise(runDemo({ demo: "evidence", scenario: "missing" }));
  const contradicted = await runtime.runPromise(runDemo({ demo: "evidence", scenario: "contradicted" }));
  const uncertain = await runtime.runPromise(runDemo({ demo: "evidence", scenario: "uncertain" }));

  expect(missing.requests).toBe(0);
  expect(contradicted.heading).toBe("Contradicted by the source");
  expect(uncertain.heading).toBe("Human review suggested");
});

test("actions ignore uncertain unused arguments and abstain on unclear input", async () => {
  const lights = await runtime.runPromise(runDemo({ demo: "actions", scenario: "lights" }));
  const unclear = await runtime.runPromise(runDemo({ demo: "actions", scenario: "ambiguous" }));

  expect(JSON.parse(lights.items[0].detail)).toEqual({ handler: "lights", room: "kitchen", brightnessPercent: 30 });
  expect(unclear.items).toEqual([]);
});

test("skill selection skips or rejects while extraction only copies candidates", async () => {
  const casual = await runtime.runPromise(runDemo({ demo: "skills", scenario: "none" }));
  const rejected = await runtime.runPromise(runDemo({ demo: "skills", scenario: "reject" }));
  const total = await runtime.runPromise(runDemo({ demo: "extraction", scenario: "total" }));
  const absent = await runtime.runPromise(runDemo({ demo: "extraction", scenario: "absent" }));

  expect(casual.requests).toBe(1);
  expect(rejected.requests).toBe(2);
  expect(rejected.heading).toBe("No suitable skill");
  expect(total.highlight).toBe("$1,315.50");
  expect(total.items.find((item) => item.title === total.highlight)?.detail).toContain("131550 USD cents");
  expect(absent.highlight).toBe("");
});

test("unknown demo scenarios fail before making provider requests", async () => {
  const result = await runtime.runPromise(runDemo({ demo: "ranking", scenario: "unknown" }).pipe(Effect.result));

  expect(Result.isFailure(result)).toBe(true);

  if (Result.isFailure(result)) expect(result.failure.message).toContain("No demo fixture");
});

for (const demo of ["skills", "extraction"] as const) {
  test(`${demo} distinguishes uncertain judgments from confident no-match`, async () => {
    const uncertain = await runtime.runPromise(runDemo({ demo, scenario: "uncertain" }));

    const absent = await runtime.runPromise(runDemo({
      demo,
      scenario: demo === "skills" ? "reject" : "absent",
    }));

    expect(uncertain.outcome).toBe("review");
    expect(uncertain.selectedId).toBe("");
    expect(uncertain.highlight).toBe("");
    expect(uncertain.heading).toContain("Review");
    expect(absent.outcome).toBe("missing");
    expect(absent.selectedId).toBe("");
  });
}
