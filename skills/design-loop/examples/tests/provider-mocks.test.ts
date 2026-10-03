import { afterAll, beforeAll, expect, test } from "bun:test";
import { ConfigProvider, Effect, Layer, ManagedRuntime, Result } from "effect";
import { ServicesLive } from "../src/server/layers";
import { databaseLayer } from "../src/server/storage/database";
import { AppConfig } from "../src/server/config";
import { AgentRunner } from "../src/server/adapters/pi";

const runtime = ManagedRuntime.make(
  ServicesLive.pipe(
    Layer.provide(databaseLayer(":memory:")),
    Layer.provide(
      Layer.succeed(
        ConfigProvider.ConfigProvider,
        ConfigProvider.fromEnv({ env: {} }),
      ),
    ),
  ),
);

beforeAll(() => runtime.context());

afterAll(() => runtime.dispose());

test("mock mode defaults without environment credentials", async () => {
  expect(
    await runtime.runPromise(Effect.map(AppConfig, (config) => config.mode)),
  ).toBe("mock");
});

test("real Pi adapter consumes intercepted streaming responses", async () => {
  const result = await runtime.runPromise(
    Effect.flatMap(AgentRunner, (agent) =>
      agent.run("Explain dependency injection with coffee."),
    ),
  );

  expect(result.text).toContain("deterministic mock response");
});

test("provider failures are typed and unmatched external requests are blocked", async () => {
  const result = await runtime.runPromise(
    Effect.flatMap(AgentRunner, (agent) => agent.run("[mock:rate-limit]")).pipe(
      Effect.result,
    ),
  );

  expect(Result.isFailure(result)).toBe(true);

  const response = await fetch(
    "https://example.invalid/should-not-leave-the-process",
  );

  expect(response.status).toBe(503);
});
