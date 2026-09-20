import { DemoProviderRequest, demoProviderResponse } from "./decisions";
import { Effect, Layer, Match, Option, Schema } from "effect";
import { http, HttpResponse, passthrough } from "msw";
import { setupServer } from "msw/node";
import { Prompt } from "../../shared/contracts";
import { AppConfig } from "../config";

const ChatRequest = Schema.Struct({
  model: Schema.String,
  stream: Schema.optional(Schema.Boolean),
  response_format: Schema.optional(Schema.Struct({ type: Schema.String })),
  messages: Schema.Array(
    Schema.Struct({
      role: Schema.String,
      content: Schema.Union([
        Schema.String,
        Schema.Array(Schema.Struct({ type: Schema.String, text: Schema.optional(Schema.String) })),
      ]),
    }),
  ),
});

function agentText(text: string) {
  if (/typescript|function with an explanation/i.test(text)) {
    return '## A small, useful function\n\nTurn a name into a friendly greeting:\n\n```typescript\nfunction greet(name: string): string {\n  return `Hello, ${name.trim()}!`;\n}\n```\n\n- **Input:** a name as a string.\n- **Output:** a greeting with extra spaces removed.\n- **Try it:** `greet("  Ada  ")` returns `Hello, Ada!`.\n\n> Keep the function small enough to explain in one sentence.\n\nThis is a deterministic mock response, served through the real Pi session.';
  }

  if (/coffee|dependency injection/i.test(text)) {
    return "Think of a coffee shop. The barista needs beans and a coffee machine, but does not build either. The shop supplies them.\n\nDependency injection works the same way: a service declares what it needs, and the application supplies those dependencies. Effect Layers do that wiring. In tests, you can supply a pretend coffee machine.\n\nThis is a deterministic mock response, served through the real Pi session.";
  }

  if (/reading|features/i.test(text)) {
    return "Three small features for a reading app:\n\n1. A reading queue — save a title and why it caught your eye.\n2. A daily note — capture one memorable idea from today’s reading.\n3. A weekly recap — revisit what you finished and what you learned.\n\nStart with the queue, then add one feature at a time.\n\nThis is a deterministic mock response, served through the real Pi session.";
  }

  return `Mock Pi response\n\nYou asked: ${text}\n\nTry breaking the idea into a small input, one useful operation, and a clear result. The real Pi session handled this request; the provider response was intercepted locally.`;
}

function assessment(text: string) {
  const billing = /invoice|billing|refund|subscription/i.test(text);
  const technical = /down|outage|error|broken|checkout|cannot/i.test(text);
  const category = technical ? "technical" : billing ? "billing" : "general";
  const urgent = /down|outage|urgent|now|blocked|cannot/i.test(text);

  // Deliberately clear demo fixtures, not measured model confidence.
  const probabilities = technical
    ? { billing: 0.01, technical: 0.99, general: 0 }
    : billing
      ? { billing: 0.97, technical: 0.02, general: 0.01 }
      : { billing: 0.02, technical: 0.03, general: 0.95 };

  return {
    answers: {
      category: {
        type: "choice",
        choice: category,
        confidence: probabilities[category],
        probabilities,
      },
      urgency: { type: "noul", noul: urgent ? 0.98 : billing ? 0.03 : 0.07 },
    },
  };
}

export function createProviderMock() {
  return setupServer(
    http.post("https://openrouter.ai/api/v1/systemone", async ({ request }) => {
      const body = await request.json();
      const demo = Schema.decodeUnknownOption(DemoProviderRequest)(body);

      if (Option.isSome(demo)) return HttpResponse.json(demoProviderResponse(demo.value));

      const input = Schema.decodeUnknownSync(
        Schema.Struct({
          model: Schema.Literal("typesafe/jev-1.13"),
          state: Prompt,
          questions: Schema.Struct({
            category: Schema.Struct({
              type: Schema.Literal("choice"),
              instructions: Schema.String,
              criteria: Schema.Struct({
                billing: Schema.String,
                technical: Schema.String,
                general: Schema.String,
              }),
            }),
            urgency: Schema.Struct({
              type: Schema.Literal("noul"),
              instructions: Schema.String,
              criteria: Schema.Struct({ true: Schema.String, false: Schema.String }),
            }),
          }),
        }),
      )(body);

      if (input.state.text.includes("[mock:rate-limit]"))
        return HttpResponse.json({ error: { message: "Mock rate limit" } }, { status: 429 });

      if (input.state.text.includes("[mock:invalid]")) return HttpResponse.json({ answers: {} });

      return HttpResponse.json({
        model: input.model,
        ...assessment(input.state.text),
        usage: { input_tokens: 10, output_tokens: 20 },
      });
    }),
    http.post("https://openrouter.ai/api/v1/chat/completions", async ({ request }) => {
      const input = Schema.decodeUnknownSync(ChatRequest)(await request.json());
      const message = input.messages.findLast((message) => message.role === "user");
      const content = message?.content;

      const text = Match.value(content ?? "").pipe(
        Match.when(Match.string, (text) => text),
        Match.orElse((parts) => parts.map((part) => part.text ?? "").join("\n")),
      );

      if (text.includes("[mock:rate-limit]")) {
        return HttpResponse.json(
          { error: { message: "Mock rate limit", code: 429 } },
          { status: 429 },
        );
      }

      const answer = agentText(text);

      const base = { id: "mock-completion", created: 0, model: input.model };

      if (!input.stream) {
        return HttpResponse.json({
          ...base,
          object: "chat.completion",
          choices: [
            { index: 0, message: { role: "assistant", content: answer }, finish_reason: "stop" },
          ],
          usage: { prompt_tokens: 10, completion_tokens: 20, total_tokens: 30 },
        });
      }

      // Pi consumes the normal OpenAI-compatible SSE protocol, including its end marker.
      const chunks = [
        {
          ...base,
          object: "chat.completion.chunk",
          choices: [
            { index: 0, delta: { role: "assistant", content: answer }, finish_reason: null },
          ],
        },
        {
          ...base,
          object: "chat.completion.chunk",
          choices: [{ index: 0, delta: {}, finish_reason: "stop" }],
          usage: { prompt_tokens: 10, completion_tokens: 20, total_tokens: 30 },
        },
      ];

      return new HttpResponse(
        chunks.map((chunk) => `data: ${JSON.stringify(chunk)}\n\n`).join("") + "data: [DONE]\n\n",
        {
          headers: { "Content-Type": "text/event-stream" },
        },
      );
    }),
    // Development routing may use local fetches. All other unmatched HTTP is blocked.
    http.all("*", ({ request }) => {
      const hostname = new URL(request.url).hostname;

      if (["localhost", "127.0.0.1", "[::1]"].includes(hostname)) return passthrough();

      return HttpResponse.json(
        { error: "Unexpected external request blocked in mock mode" },
        { status: 503 },
      );
    }),
  );
}

export const ProviderMocksLive = Layer.effectDiscard(
  Effect.gen(function* () {
    const config = yield* AppConfig;

    if (config.mode === "mock") {
      yield* Effect.acquireRelease(
        Effect.sync(() => {
          const server = createProviderMock();
          server.listen({ onUnhandledRequest: "error" });

          return server;
        }),
        (server) => Effect.sync(() => server.close()),
      );
    }
  }),
);
