import { Effect, Match, Redacted } from "effect";
import { Decision, DecisionModel } from "effect/unstable/ai";
import { Prompt, type Assessment } from "../../shared/contracts";
import { AppConfig } from "../config";
import { AppError } from "../errors";

export const TicketAssessment = Decision.make({
  input: Prompt,
  decisions: {
    category: Decision.classify({
      instructions: "Which team should handle this support ticket?",
      criteria: {
        billing: "Payments, invoices, subscriptions, or refunds.",
        technical: "Bugs, outages, errors, or broken functionality.",
        general: "General questions, how-to guidance, or feedback.",
      },
    }),
    urgency: Decision.probability({
      instructions: "Does this ticket need priority human review?",
      criteria: {
        false: "Routine request without immediate disruption.",
        true: "An active outage, blocked work, or time-sensitive impact.",
      },
    }),
  },
});

export const routeTicket = (urgency: number): Assessment["action"] =>
  urgency >= 0.7 ? "Priority review" : "Standard queue";

export const assessTicket = Effect.fn("Ticket.assess")(function* (input: Prompt) {
  const config = yield* AppConfig;

  if (!Redacted.value(config.key).trim())
    return yield* new AppError({
      code: "Configuration",
      message: "Add OPENROUTER_API_KEY to .env and restart the app.",
    });

  const result = yield* DecisionModel.decide(TicketAssessment, { input }).pipe(
    Effect.mapError((error) =>
      Match.value(error.reason).pipe(
        Match.tag(
          "RateLimitError",
          () =>
            new AppError({
              code: "RateLimited",
              message: "OpenRouter is rate limiting requests. Try again shortly.",
            }),
        ),
        Match.tag(
          "AuthenticationError",
          () =>
            new AppError({
              code: "Configuration",
              message: "Check your OpenRouter key and permissions.",
            }),
        ),
        Match.tag(
          "InvalidOutputError",
          "StructuredOutputError",
          () =>
            new AppError({
              code: "InvalidOutput",
              message: "The model returned invalid decision answers. Please try again.",
            }),
        ),
        Match.orElse(
          () =>
            new AppError({
              code: "ProviderFailure",
              message:
                "Decision evaluation failed. Check your provider configuration or try again shortly.",
            }),
        ),
      ),
    ),
  );

  return {
    category: result.answers.category.label,
    probabilities: { ...result.answers.category.probabilities },
    urgency: result.answers.urgency.probability,
    action: routeTicket(result.answers.urgency.probability),
    model: config.decisionModel,
  } satisfies Assessment;
});
