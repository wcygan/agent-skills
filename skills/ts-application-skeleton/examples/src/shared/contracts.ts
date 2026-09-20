import { Schema } from "effect";

export const Prompt = Schema.Struct({
  text: Schema.Trim.check(Schema.isMinLength(1), Schema.isMaxLength(4000)),
});

export interface Prompt extends Schema.Schema.Type<typeof Prompt> {}

export const AgentAnswer = Schema.Struct({ text: Schema.String, model: Schema.String });

export interface AgentAnswer extends Schema.Schema.Type<typeof AgentAnswer> {}

const Probability = Schema.Number.check(Schema.isBetween({ minimum: 0, maximum: 1 }));

export const Assessment = Schema.Struct({
  category: Schema.Literals(["billing", "technical", "general"]),
  probabilities: Schema.Struct({
    billing: Probability,
    technical: Probability,
    general: Probability,
  }),
  urgency: Probability,
  action: Schema.Literals(["Priority review", "Standard queue"]),
  model: Schema.String,
});

export interface Assessment extends Schema.Schema.Type<typeof Assessment> {}

export const ProviderMode = Schema.Literals(["mock", "live"]);

export const ApplicationErrorCode = Schema.Literals([
  "Conflict",
  "Storage",
  "Configuration",
  "ProviderFailure",
  "RateLimited",
  "InvalidOutput",
]);

export type Result<A> =
  | { ok: true; value: A; requestId: string }
  | {
      ok: false;
      code: typeof ApplicationErrorCode.Type | "Timeout" | "InternalError" | "TransportError";
      message: string;
      requestId?: string;
    };
