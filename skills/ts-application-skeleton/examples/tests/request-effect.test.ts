import { expect, test } from "bun:test";
import {
  Cause,
  Context,
  Deferred,
  Effect,
  Exit,
  Fiber,
  Layer,
  ManagedRuntime,
  Schema,
} from "effect";
import { TestClock } from "effect/testing";
import { Prompt } from "../src/shared/contracts";
import { AppError } from "../src/server/errors";
import { RequestContext } from "../src/server/request-context";
import { requestEffect } from "../src/server/request-effect";

const context = { requestId: "test-request", operation: "Test.request" };

test("native Standard Schema validates structure before trimming", async () => {
  const validator = Schema.toStandardSchemaV1(Prompt)["~standard"];
  expect(await validator.validate({ text: "  hello  " })).toEqual({ value: { text: "hello" } });

  for (const input of [null, {}, { text: 42 }, { text: "  " }, { text: "x".repeat(4001) }]) {
    expect((await validator.validate(input)).issues?.length).toBeGreaterThan(0);
  }
});

test("expected failures preserve their public code and request reference", async () => {
  const result = await Effect.runPromise(
    requestEffect(
      Effect.fail(new AppError({ code: "RateLimited", message: "Try again shortly." })),
      Schema.String,
      context,
    ),
  );

  expect(result).toEqual({
    ok: false,
    code: "RateLimited",
    message: "Try again shortly.",
    requestId: "test-request",
  });
});

test("defects and invalid output are sanitized and request resources close", async () => {
  for (const operation of [Effect.die("secret-provider-payload"), Effect.succeed(2)]) {
    let released = false;

    const program = Effect.gen(function* () {
      yield* Effect.acquireRelease(Effect.void, () =>
        Effect.sync(() => {
          released = true;
        }),
      );

      return yield* operation;
    });

    const result = await Effect.runPromise(
      requestEffect(
        program,
        Schema.Number.check(Schema.isBetween({ minimum: 0, maximum: 1 })),
        context,
      ),
    );

    expect(result).toEqual({
      ok: false,
      code: "InternalError",
      message: "Could not complete the request. Please try again.",
      requestId: "test-request",
    });
    expect(released).toBe(true);
    expect(JSON.stringify(result)).not.toContain("secret-provider-payload");
  }
});

test("success and expected failure both close their request scope", async () => {
  for (const operation of [
    Effect.succeed("done"),
    Effect.fail(new AppError({ code: "ProviderFailure", message: "Unavailable" })),
  ]) {
    let released = false;

    const program = Effect.gen(function* () {
      yield* Effect.acquireRelease(Effect.void, () =>
        Effect.sync(() => {
          released = true;
        }),
      );

      return yield* operation;
    });

    await Effect.runPromise(requestEffect(program, Schema.String, context));
    expect(released).toBe(true);
  }
});

test("deadline interrupts the work and waits for resource cleanup", async () => {
  let released = false;

  const result = await Effect.runPromise(
    Effect.gen(function* () {
      const ready = yield* Deferred.make<void>();

      const program = Effect.gen(function* () {
        yield* Effect.acquireRelease(Effect.void, () =>
          Effect.sync(() => {
            released = true;
          }),
        );
        yield* Deferred.succeed(ready, undefined);

        return yield* Effect.never;
      });

      const fiber = yield* requestEffect(program, Schema.String, context).pipe(Effect.forkChild);
      yield* Deferred.await(ready);
      yield* TestClock.adjust("60 seconds");

      return yield* Fiber.join(fiber);
    }).pipe(Effect.provide(TestClock.layer())),
  );

  expect(result).toMatchObject({ ok: false, code: "Timeout", requestId: "test-request" });
  expect(released).toBe(true);
});

test("AbortSignal interrupts the Effect and finalizes instead of returning an error envelope", async () => {
  const ready = Deferred.makeUnsafe<void>();
  const abort = new AbortController();
  let released = false;

  const program = Effect.gen(function* () {
    yield* Effect.acquireRelease(Effect.void, () =>
      Effect.sync(() => {
        released = true;
      }),
    );
    yield* Deferred.succeed(ready, undefined);

    return yield* Effect.never;
  });

  const pending = Effect.runPromiseExit(requestEffect(program, Schema.String, context), {
    signal: abort.signal,
  });

  await Effect.runPromise(Deferred.await(ready));
  abort.abort();
  const exit = await pending;
  expect(Exit.isFailure(exit)).toBe(true);

  if (Exit.isFailure(exit)) expect(Cause.hasInterruptsOnly(exit.cause)).toBe(true);
  expect(released).toBe(true);
});

class Shared extends Context.Service<Shared, { readonly value: string }>()("test/Shared") {}

test("concurrent requests share one application layer and isolate request context", async () => {
  let acquired = 0;
  let released = 0;

  const runtime = ManagedRuntime.make(
    Layer.effect(
      Shared,
      Effect.acquireRelease(
        Effect.sync(() => {
          acquired += 1;

          return Shared.of({ value: "shared" });
        }),
        () =>
          Effect.sync(() => {
            released += 1;
          }),
      ),
    ),
  );

  const ready = Deferred.makeUnsafe<void>();
  let entered = 0;

  const program = Effect.gen(function* () {
    const shared = yield* Shared;
    entered += 1;

    if (entered === 2) yield* Deferred.succeed(ready, undefined);
    yield* Deferred.await(ready);
    const request = yield* RequestContext;

    return `${shared.value}:${request.requestId}`;
  });

  try {
    const results = await Promise.all(
      ["first", "second"].map((requestId) =>
        runtime.runPromise(
          requestEffect(program, Schema.String, { requestId, operation: "Test.concurrent" }),
        ),
      ),
    );

    expect(results).toEqual([
      { ok: true, value: "shared:first", requestId: "first" },
      { ok: true, value: "shared:second", requestId: "second" },
    ]);
    expect(acquired).toBe(1);
    expect(released).toBe(0);
  } finally {
    await runtime.dispose();
  }

  expect(released).toBe(1);
});
