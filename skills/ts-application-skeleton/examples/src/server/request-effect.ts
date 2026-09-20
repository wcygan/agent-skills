import { Cause, Clock, Duration, Effect, Exit, Schema, Scope } from "effect";
import type { AppError } from "./errors";
import { RequestContext } from "./request-context";
import type { Result } from "../shared/contracts";

// Framework-independent ingress policy. A fresh scope belongs to each invocation.
export function requestEffect<A, R>(
  program: Effect.Effect<A, AppError, R | RequestContext | Scope.Scope>,
  output: Schema.Codec<A>,
  context: RequestContext["Service"],
  timeout: Duration.Input = "60 seconds",
) {
  return Effect.gen(function* () {
    const started = yield* Clock.currentTimeMillis;

    return yield* program.pipe(
      Effect.flatMap((value) => Schema.encodeEffect(output)(value).pipe(Effect.orDie)),
      Effect.scoped,
      Effect.timeout(timeout),
      Effect.map((value): Result<A> => ({ ok: true, value, requestId: context.requestId })),
      Effect.catchTag("AppError", (error) =>
        Effect.succeed<Result<A>>({
          ok: false,
          code: error.code,
          message: error.message,
          requestId: context.requestId,
        }),
      ),
      Effect.catchTag("TimeoutError", () =>
        Effect.succeed<Result<A>>({
          ok: false,
          code: "Timeout",
          message: "This request took too long. Please try again.",
          requestId: context.requestId,
        }),
      ),
      Effect.catchCause((cause) => {
        if (Cause.hasInterrupts(cause)) return Effect.failCause(cause);

        // Do not log prompts, credentials, or arbitrary provider/defect payloads.
        return Effect.logError("Unexpected request failure").pipe(
          Effect.as<Result<A>>({
            ok: false,
            code: "InternalError",
            message: "Could not complete the request. Please try again.",
            requestId: context.requestId,
          }),
        );
      }),
      Effect.onExit((exit) =>
        Effect.gen(function* () {
          const finished = yield* Clock.currentTimeMillis;

          const outcome = Exit.match(exit, {
            onFailure: () => "interrupted",
            onSuccess: (result) => (result.ok ? "success" : result.code),
          });

          yield* Effect.logInfo("Request completed").pipe(
            Effect.annotateLogs({ outcome, durationMs: finished - started }),
          );
        }),
      ),
      Effect.provideService(RequestContext, context),
      Effect.annotateLogs(context),
      Effect.withSpan(context.operation, { attributes: { requestId: context.requestId } }),
    );
  });
}
