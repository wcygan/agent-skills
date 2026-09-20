import { Schema } from "effect";
import { DemoState } from "../decisions/demos";
import { scenarios } from "../../shared/decision-demos";

const Question = Schema.Union([
  Schema.Struct({
    type: Schema.Literal("choice"),
    instructions: Schema.String,
    criteria: Schema.Record(Schema.String, Schema.String),
  }),
  Schema.Struct({
    type: Schema.Literal("noul"),
    instructions: Schema.String,
    criteria: Schema.Struct({ true: Schema.String, false: Schema.String }),
  }),
  Schema.Struct({
    type: Schema.Literal("score"),
    instructions: Schema.String,
    criteria: Schema.Array(Schema.String),
  }),
]);

export const DemoProviderRequest = Schema.Struct({
  model: Schema.Literal("typesafe/jev-1.13"),
  state: DemoState,
  questions: Schema.Record(Schema.String, Question),
});

// Deliberate scenario fixtures, not estimates of Jev's performance or calibration.
interface ChoiceFixtures {
  [scenario: string]: Record<string, string>;
}

const selections: ChoiceFixtures = {
  "evidence/supported": { relation: "supports" },
  "evidence/contradicted": { relation: "contradicts" },
  "evidence/unsupported": { relation: "unsupported" },
  "evidence/uncertain": { relation: "unsupported" },
  "actions/lights": {
    handler: "lights",
    room: "kitchen",
    brightness: "30",
    temperature: "none",
  },
  "actions/temperature": {
    handler: "temperature",
    room: "bedroom",
    brightness: "none",
    temperature: "19",
  },
  "actions/ambiguous": {
    handler: "none",
    room: "none",
    brightness: "none",
    temperature: "none",
  },
  "actions/unavailable": {
    handler: "none",
    room: "none",
    brightness: "none",
    temperature: "none",
  },
  "skills/ci": { skill: "gh-fix-ci", selected: "gh-fix-ci" },
  "skills/review": { skill: "code-review", selected: "code-review" },
  "skills/uncertain": { skill: "code-review", selected: "code-review" },
  "skills/none": { skill: "grilling", selected: "none" },
  "skills/reject": { skill: "grilling", selected: "none" },
  "extraction/total": { amount: "amount_2" },
  "extraction/credit": { amount: "amount_3" },
  "extraction/uncertain": { amount: "amount_3" },
  "extraction/absent": { amount: "none" },
};

interface RatingFixtures {
  [question: string]: number;
}

const ratings: RatingFixtures = {
  reminders_impact: 1.8,
  reminders_fit: 1.9,
  reminders_ease: 1.7,
  clubs_impact: 1.4,
  clubs_fit: 1.1,
  clubs_ease: 0.2,
  export_impact: 0.7,
  export_fit: 0.4,
  export_ease: 1.8,
  offline_impact: 1.95,
  offline_fit: 1.6,
  offline_ease: 0.3,
  themes_impact: 0.3,
  themes_fit: 0.1,
  themes_ease: 1.95,
};

export function demoProviderResponse(input: typeof DemoProviderRequest.Type) {
  const { demo, scenario } = input.state;

  if (!scenarios[demo].some((entry) => entry.id === scenario))
    throw new Error("No fixture for this scenario");

  const answers = Object.fromEntries(
    Object.entries(input.questions).map(([id, question]) => {
      if (question.type === "score") {
        const score = ratings[id];

        if (
          demo !== "ranking" ||
          score === undefined ||
          question.criteria.length !== 3
        )
          throw new Error("No Score fixture for this question");

        const low = Math.floor(score);
        const fraction = score - low;

        return [
          id,
          {
            type: "score",
            score,
            legend: Object.fromEntries(
              question.criteria.map((level, index) => [String(index), level]),
            ),
            probabilities: Object.fromEntries(
              question.criteria.map((_, index) => [
                String(index),
                index === low ? 1 - fraction : index === low + 1 ? fraction : 0,
              ]),
            ),
            confidence: 0.85,
          },
        ];
      }

      if (question.type === "noul") {
        if (demo !== "skills" || id !== "needed")
          throw new Error("No Noul fixture for this question");

        return [id, { type: "noul", noul: scenario === "none" ? 0.02 : 0.97 }];
      }

      const choice = selections[`${demo}/${scenario}`]?.[id];
      const labels = Object.keys(question.criteria);

      if (!choice || !labels.includes(choice))
        throw new Error("No Choice fixture for these candidates");

      const uncertain =
        scenario === "uncertain" ||
        scenario === "ambiguous" ||
        (demo === "actions" &&
          ["brightness", "temperature"].includes(id) &&
          choice === "none");

      const probability = uncertain ? 0.5 : 0.96;

      return [
        id,
        {
          type: "choice",
          choice,
          probabilities: Object.fromEntries(
            labels.map((label) => [
              label,
              label === choice
                ? probability
                : (1 - probability) / (labels.length - 1),
            ]),
          ),
          confidence: uncertain ? 0.25 : 0.91,
        },
      ];
    }),
  );

  return {
    model: input.model,
    answers,
    usage: { input_tokens: 100, output_tokens: 50 },
  };
}
