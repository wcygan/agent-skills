import { access } from "node:fs/promises";
import { constants } from "node:fs";
import { dirname, resolve } from "node:path";
import { Config, Effect, Match } from "effect";

const checks: Array<{ name: string; ok: boolean; detail: string }> = [];

for (const tool of ["bun", "node", "just", "portless"]) {
  const path = Bun.which(tool);
  checks.push({ name: tool, ok: Boolean(path), detail: path ? "available" : "missing from PATH" });
}

const directory = await Effect.runPromise(
  Config.String("APP_DATA_DIR").pipe(Config.withDefault(".data"), Effect.map(resolve)),
);

let writable = false;

try {
  await access(directory, constants.W_OK);
  writable = true;
} catch {
  try {
    await access(dirname(directory), constants.W_OK);
    writable = true;
  } catch {
    /* Report an actionable failure without printing environment values. */
  }
}

checks.push({
  name: "data directory",
  ok: writable,
  detail: writable ? directory : "Choose a writable APP_DATA_DIR with an existing parent.",
});

const mode = await Effect.runPromise(Config.String("AI_MODE").pipe(Config.withDefault("mock")));

checks.push({
  name: "AI mode",
  ok: mode === "mock" || mode === "live",
  detail: Match.value(mode).pipe(
    Match.when("live", () => "live (provider charges apply)"),
    Match.when("mock", () => "mock (no provider calls)"),
    Match.orElse(() => "Use mock or live."),
  ),
});

if (mode === "live") {
  const configured = await Effect.runPromise(
    Config.String("OPENROUTER_API_KEY").pipe(
      Config.withDefault(""),
      Effect.map((key) => key.trim().length > 0),
    ),
  );

  checks.push({
    name: "provider credential",
    ok: configured,
    detail: configured ? "configured (hidden)" : "Set OPENROUTER_API_KEY or use AI_MODE=mock.",
  });
}

for (const check of checks)
  console.log(`${check.ok ? "OK" : "FAIL"} ${check.name}: ${check.detail}`);

process.exitCode = checks.every((check) => check.ok) ? 0 : 1;
