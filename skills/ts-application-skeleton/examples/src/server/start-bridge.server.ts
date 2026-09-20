import "@tanstack/react-start/server-only";
import { getRequest } from "@tanstack/react-start/server";
import { Cause, Effect, Exit, ManagedRuntime, Schema, Scope } from "effect";
import type { AppError } from "./errors";
import type { RequestContext } from "./request-context";
import { requestEffect } from "./request-effect";
import { runtime } from "./runtime";

// Keep createServerFn declarations visible to Start's compiler. Only execution lives here.
export async function runServerEffect<A>(
  operation: string,
  output: Schema.Codec<A>,
  program: Effect.Effect<
    A,
    AppError,
    ManagedRuntime.ManagedRuntime.Services<typeof runtime> | RequestContext | Scope.Scope
  >,
) {
  const request = getRequest();
  const context = { requestId: crypto.randomUUID(), operation };

  const exit = await runtime.runPromiseExit(requestEffect(program, output, context), {
    signal: request.signal,
  });

  if (Exit.isSuccess(exit)) return exit.value;

  if (Cause.hasInterrupts(exit.cause)) throw new DOMException("Request cancelled", "AbortError");

  // Startup/layer acquisition failures occur outside requestEffect's recovery boundary.
  console.error("Application runtime unavailable", context);

  return {
    ok: false as const,
    code: "InternalError" as const,
    message: "Could not complete the request. Please try again.",
    requestId: context.requestId,
  };
}
