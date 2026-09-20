import { Schema } from "effect";

export const ClassifyAnswer = Schema.TaggedStruct("Classify", {
  label: Schema.String,
  confidence: Schema.optional(Schema.Number),
  probabilities: Schema.Record(Schema.String, Schema.Number),
});

export const ProbabilityAnswer = Schema.TaggedStruct("Probability", {
  probability: Schema.Number,
});

export const RateAnswer = Schema.TaggedStruct("Rate", {
  rating: Schema.Number,
  probabilities: Schema.Record(Schema.String, Schema.Number),
  confidence: Schema.optional(Schema.Number),
});

export const ProviderAnswer = Schema.Union([
  ClassifyAnswer,
  ProbabilityAnswer,
  RateAnswer,
]);
