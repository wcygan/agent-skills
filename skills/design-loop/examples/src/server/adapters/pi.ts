import { Context, Effect, Layer, Redacted } from "effect";
import {
  createAgentSession,
  DefaultResourceLoader,
  ModelRuntime,
  SessionManager,
  SettingsManager,
} from "@earendil-works/pi-coding-agent";
import { InMemoryCredentialStore } from "@earendil-works/pi-ai";
import { AppConfig } from "../config";
import { AppError } from "../errors";
import type { AgentAnswer } from "../../shared/contracts";

export class AgentRunner extends Context.Service<
  AgentRunner,
  {
    run: (text: string) => Effect.Effect<AgentAnswer, AppError>;
  }
>()("app/AgentRunner") {}

export const PiLive = Layer.effect(
  AgentRunner,
  Effect.gen(function* () {
    const config = yield* AppConfig;

    return AgentRunner.of({
      run: Effect.fn("Pi.run")(function* (text: string) {
        if (!Redacted.value(config.key).trim()) {
          return yield* new AppError({
            code: "Configuration",
            message: "Add OPENROUTER_API_KEY to .env and restart the app.",
          });
        }

        return yield* Effect.scoped(
          Effect.gen(function* () {
            const session = yield* Effect.acquireRelease(
              Effect.tryPromise({
                try: async (signal) => {
                  const modelRuntime = await ModelRuntime.create({
                    credentials: new InMemoryCredentialStore(),
                    modelsPath: null,
                    refreshOnCreate: false,
                    allowModelNetwork: false,
                    signal,
                  });

                  await modelRuntime.setRuntimeApiKey("openrouter", Redacted.value(config.key), {
                    signal,
                  });
                  const model = modelRuntime.getModel("openrouter", config.model);

                  if (!model) throw new Error("Configured model unavailable in Pi catalog");

                  const settingsManager = SettingsManager.inMemory({
                    compaction: { enabled: false },
                    retry: { enabled: false },
                  });

                  const loader = new DefaultResourceLoader({
                    cwd: process.cwd(),
                    agentDir: process.cwd(),
                    settingsManager,
                    noExtensions: true,
                    noSkills: true,
                    noPromptTemplates: true,
                    noThemes: true,
                    noContextFiles: true,
                    systemPrompt:
                      "You are a concise, helpful assistant. Use concise Markdown when it helps, including fenced code blocks for code. You have no filesystem or shell tools.",
                  });

                  await loader.reload();

                  const created = await createAgentSession({
                    modelRuntime,
                    model,
                    tools: [],
                    resourceLoader: loader,
                    sessionManager: SessionManager.inMemory(),
                    settingsManager,
                  });

                  if (signal.aborted) {
                    created.session.dispose();
                    throw new Error("Aborted");
                  }

                  return created.session;
                },
                catch: () =>
                  new AppError({
                    code: "Configuration",
                    message: "Could not initialize Pi. Check the configured OpenRouter model.",
                  }),
              }),
              (session) =>
                Effect.promise(async () => {
                  try {
                    await session.abort();
                  } finally {
                    session.dispose();
                  }
                }),
            );

            yield* Effect.tryPromise({
              try: (signal) => {
                const abort = () => {
                  void session.abort();
                };

                signal.addEventListener("abort", abort, { once: true });

                return session
                  .prompt(text)
                  .finally(() => signal.removeEventListener("abort", abort));
              },
              catch: () =>
                new AppError({
                  code: "ProviderFailure",
                  message:
                    "The agent request failed. Check your key, model, and OpenRouter availability.",
                }),
            });
            const answer = session.messages.findLast((message) => message.role === "assistant");

            if (
              !answer ||
              answer.role !== "assistant" ||
              answer.stopReason === "error" ||
              answer.stopReason === "aborted"
            ) {
              return yield* new AppError({
                code: "ProviderFailure",
                message:
                  "The model did not complete its answer. Check your OpenRouter key and credits.",
              });
            }

            const response = answer.content
              .filter((part) => part.type === "text")
              .map((part) => part.text)
              .join("\n");

            if (!response.trim())
              return yield* new AppError({
                code: "InvalidOutput",
                message: "The model returned no text. Try another prompt.",
              });

            return { text: response, model: config.model };
          }),
        );
      }),
    });
  }),
);
