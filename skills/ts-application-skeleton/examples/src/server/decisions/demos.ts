import { Effect, Match, Schema } from "effect";
import { Decision, DecisionModel } from "effect/unstable/ai";
import { AppConfig } from "../config";
import { AppError } from "../errors";
import {
  DemoId,
  type DemoInput,
  type DemoResult,
  features,
  invoice,
  scenarios,
  skillCatalog,
  source,
} from "../../shared/decision-demos";

export const DemoState = Schema.Struct({
  demo: DemoId,
  scenario: Schema.String,
  text: Schema.String,
  context: Schema.String,
  candidates: Schema.Record(Schema.String, Schema.String),
});

const yesNo = {
  true: "The condition is satisfied by the supplied evidence.",
  false: "The condition is not satisfied by the supplied evidence.",
};

const evidenceDecision = Decision.make({
  input: DemoState,
  decisions: {
    relation: Decision.classify({
      instructions:
        "Does `context` support the claim in `text`? Judge the full context, including restrictions.",
      criteria: {
        supports: "The source supports the claim.",
        contradicts: "The source contradicts the claim.",
        unsupported: "The source does not establish the claim.",
      },
    }),
  },
});

const actionDecision = Decision.make({
  input: DemoState,
  decisions: {
    handler: Decision.classify({
      instructions:
        "Which available action matches `text`? Select none if the request is unclear or unsupported.",
      criteria: {
        lights: "Set lighting brightness.",
        temperature: "Set a thermostat temperature.",
        none: "No clear supported action.",
      },
    }),
    room: Decision.classify({
      instructions: "Which room is explicitly named in `text`?",
      criteria: {
        kitchen: "Kitchen.",
        bedroom: "Bedroom.",
        none: "Neither room is specified.",
      },
    }),
    brightness: Decision.classify({
      instructions:
        "Assuming this is a lighting request, which supported brightness is explicitly requested in `text`?",
      criteria: {
        "30": "30 percent.",
        "70": "70 percent.",
        none: "Neither brightness is explicitly requested.",
      },
    }),
    temperature: Decision.classify({
      instructions:
        "Assuming this is a thermostat request, which supported Celsius temperature is explicitly requested in `text`?",
      criteria: {
        "19": "19 degrees Celsius.",
        "22": "22 degrees Celsius.",
        none: "Neither temperature is explicitly requested.",
      },
    }),
  },
});

export const runDemo = Effect.fn("Decisions.demo")(function* (
  input: DemoInput,
): Effect.fn.Return<
  DemoResult,
  AppError,
  AppConfig | DecisionModel.DecisionModel
> {
  const config = yield* AppConfig;

  const scenario = scenarios[input.demo].find(
    (entry) => entry.id === input.scenario,
  );

  if (!scenario)
    return yield* new AppError({
      code: "InvalidOutput",
      message:
        "No demo fixture exists for this scenario. Choose one of the listed examples.",
    });

  const state = { ...input, text: scenario.text, context: "", candidates: {} };

  const base: DemoResult = {
    outcome: "missing",
    selectedId: "",
    fields: [],
    heading: "",
    detail: "",
    mode: config.mode,
    requests: 0,
    items: [],
    steps: [],
    highlight: "",
  };

  const evaluate = <D extends Record<string, Decision.Any>>(
    definition: Decision.Definition<typeof DemoState, D>,
    current: typeof DemoState.Type,
  ) =>
    DecisionModel.decide(definition, { input: current }).pipe(
      Effect.mapError((error) =>
        Match.value(error.reason).pipe(
          Match.tag(
            "RateLimitError",
            () =>
              new AppError({
                code: "RateLimited",
                message:
                  "The provider is rate limiting requests. Try again shortly.",
              }),
          ),
          Match.tag(
            "AuthenticationError",
            () =>
              new AppError({
                code: "Configuration",
                message: "Set OPENROUTER_API_KEY in .env, check its permissions, and restart the app.",
              }),
          ),
          Match.tag(
            "InvalidOutputError",
            "StructuredOutputError",
            () =>
              new AppError({
                code: "InvalidOutput",
                message:
                  "The provider returned invalid judgments. Try this scenario again.",
              }),
          ),
          Match.orElse(
            () =>
              new AppError({
                code: "ProviderFailure",
                message:
                  "Could not evaluate this demo. Check the provider configuration and try again.",
              }),
          ),
        ),
      ),
    );

  if (input.demo === "ranking") {
    const decisions = Object.fromEntries(
      features.flatMap<[string, Decision.Rate<string>]>((feature) => [
        [
          `${feature.id}_impact`,
          Decision.rate({
            instructions: `How much does the feature \`${feature.id}\` in candidates improve readers' experience?`,
            criteria: [
              "Helps a small niche with a cosmetic preference.",
              "Improves a recurring task for some readers.",
              "Removes a frequent obstacle for many readers.",
            ],
          }),
        ],
        [
          `${feature.id}_fit`,
          Decision.rate({
            instructions: `How directly does the feature \`${feature.id}\` in candidates support the daily reading habit described in text?`,
            criteria: [
              "Unrelated to building a daily reading habit.",
              "Indirectly supports a reading habit.",
              "Directly helps readers read every day.",
            ],
          }),
        ],
        [
          `${feature.id}_ease`,
          Decision.rate({
            instructions: `How easy is the feature \`${feature.id}\` in candidates to deliver based on the described scope?`,
            criteria: [
              "Requires substantial new systems.",
              "Requires a moderate extension to existing behavior.",
              "A small change with few moving parts.",
            ],
          }),
        ],
      ]),
    );

    const current = {
      ...state,
      candidates: Object.fromEntries(
        features.map((feature) => [feature.id, feature.text]),
      ),
    };

    const result = yield* evaluate(
      Decision.make({ input: DemoState, decisions }),
      current,
    );

    return {
      ...base,
      outcome: "ranked" as const,
      heading: "One assessment. Your priorities.",
      detail:
        "Adjust the weights to recombine the same judgments. Scores range from 0 to 2; higher ease means less work.",
      requests: 1,
      items: features.map((feature) => ({
        id: feature.id,
        title: feature.title,
        detail: feature.text,
        values: {
          impact: result.answers[`${feature.id}_impact`].rating,
          fit: result.answers[`${feature.id}_fit`].rating,
          ease: result.answers[`${feature.id}_ease`].rating,
        },
      })),
      steps: [
        {
          title: "15 independent Score questions in one request",
          input: JSON.stringify(current, null, 2),
          judgments: JSON.stringify(result.answers, null, 2),
        },
      ],
    };
  }

  if (input.demo === "evidence") {
    const quote = Match.value(input.scenario).pipe(
      Match.when("missing", () => "All exports are encrypted."),
      Match.when(
        "contradicted",
        () => "Private notes are never shared automatically.",
      ),
      Match.orElse(() => "Readers can export their notes as Markdown."),
    );

    if (!source.includes(quote))
      return {
        ...base,
        heading: "Quote not found",
        detail:
          "The exact quote is absent from this source. Code stopped before asking the model.",
        steps: [
          {
            title: "Exact quote check",
            input: source,
            judgments: JSON.stringify({ quote, found: false }, null, 2),
          },
        ],
      };

    const current = { ...state, context: source };
    const result = yield* evaluate(evidenceDecision, current);
    const answer = result.answers.relation;
    const review = (answer.confidence ?? 0) < 0.8;

    const headings = {
      supports: "Supported by the source",
      contradicts: "Contradicted by the source",
      unsupported: "Not established by the source",
    };

    return {
      ...base,
      outcome: review
        ? ("review" as const)
        : (
            {
              supports: "ready",
              contradicts: "blocked",
              unsupported: "missing",
            } as const
          )[answer.label],
      heading: review ? "Human review suggested" : headings[answer.label],
      detail: `Judgment: ${answer.label}. Confidence: ${Math.round((answer.confidence ?? 0) * 100)}%. The demo routes confidence below 80% to review; this is an illustrative policy.`,
      requests: 1,
      highlight: quote,
      steps: [
        {
          title: "Quote found; judge the surrounding evidence",
          input: JSON.stringify(current, null, 2),
          judgments: JSON.stringify(result.answers, null, 2),
        },
      ],
    };
  }

  if (input.demo === "actions") {
    const result = yield* evaluate(actionDecision, state);
    const { handler, room, brightness, temperature } = result.answers;
    const argument = handler.label === "lights" ? brightness : temperature;

    const ready =
      handler.label !== "none" &&
      room.label !== "none" &&
      argument.label !== "none" &&
      [handler, room, argument].every(
        (answer) => (answer.confidence ?? 0) >= 0.8,
      );

    const action = ready
      ? {
          handler: handler.label,
          room: room.label,
          [handler.label === "lights" ? "brightnessPercent" : "celsius"]:
            Number(argument.label),
        }
      : null;

    return {
      ...base,
      outcome: ready ? ("ready" as const) : ("review" as const),
      fields: action
        ? [
            {
              role: "handler" as const,
              label: "Action",
              value:
                handler.label === "lights"
                  ? "Set brightness"
                  : "Set temperature",
            },
            { role: "room" as const, label: "Room", value: room.label },
            {
              role: "argument" as const,
              label: "Value",
              value: `${argument.label}${handler.label === "lights" ? "%" : "°C"}`,
            },
          ]
        : [],
      heading: ready ? "Action ready to preview" : "Clarification needed",
      detail: ready
        ? "Only the selected handler’s argument is consumed. This preview does not control a device."
        : "The request does not specify a supported action and its required arguments clearly enough. No action is prepared.",
      requests: 1,
      items: action
        ? [
            {
              id: "action",
              title: "Typed action",
              detail: JSON.stringify(action, null, 2),
              values: {},
            },
          ]
        : [],
      steps: [
        {
          title: "Four independent questions; consume the applicable branch",
          input: JSON.stringify(state, null, 2),
          judgments: JSON.stringify(result.answers, null, 2),
        },
      ],
    };
  }

  if (input.demo === "skills") {
    const current = {
      ...state,
      candidates: Object.fromEntries(
        skillCatalog.map((skill) => [skill.id, skill.description]),
      ),
    };

    const shortlistDefinition = Decision.make({
      input: DemoState,
      decisions: {
        skill: Decision.classify({
          instructions:
            "Which skill in candidates is most relevant to text? This first pass will shortlist candidates for closer inspection.",
          criteria: current.candidates,
        }),
        needed: Decision.probability({
          instructions:
            "Does text ask for a task that could benefit from a specialist skill, rather than casual conversation?",
          criteria: yesNo,
        }),
      },
    });

    const first = yield* evaluate(shortlistDefinition, current);

    const firstStep = {
      title: "Stage 1: shortlist from brief descriptions",
      input: JSON.stringify(current, null, 2),
      judgments: JSON.stringify(first.answers, null, 2),
    };

    if (first.answers.needed.probability < 0.7)
      return {
        ...base,
        heading: "No skill needed",
        detail:
          "The request can be handled without loading a specialist skill. The second request was skipped.",
        requests: 1,
        steps: [firstStep],
      };

    const ids = Object.entries(first.answers.skill.probabilities)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([id]) => id);

    const shortlisted = skillCatalog.filter((skill) => ids.includes(skill.id));

    const secondState = {
      ...current,
      context:
        "Read the detailed skill scope before choosing. It is valid to reject every candidate.",
      candidates: Object.fromEntries(
        shortlisted.map((skill) => [skill.id, skill.detail]),
      ),
    };

    const second = yield* evaluate(
      Decision.make({
        input: DemoState,
        decisions: {
          selected: Decision.classify({
            instructions:
              "Which candidate's detailed scope actually fulfills text? Select none when no candidate fits.",
            criteria: {
              ...secondState.candidates,
              none: "None of the shortlisted skills fulfills this request.",
            },
          }),
        },
      }),
      secondState,
    );

    const selected = second.answers.selected;

    const review = (selected.confidence ?? 0) < 0.8;
    const accepted = selected.label !== "none" && !review;

    return {
      ...base,
      outcome: review ? ("review" as const) : accepted ? ("ready" as const) : ("missing" as const),
      selectedId: accepted ? selected.label : "",
      heading: review ? "Review the skill match" : accepted ? `Suggested: ${selected.label}` : "No suitable skill",
      detail: review
        ? "The second-stage judgment is uncertain. Review the shortlisted skills before selecting one."
        : "The second stage reads fuller descriptions and may reject the entire shortlist. This demo suggests a skill; it does not execute it.",
      requests: 2,
      items: shortlisted.map((skill) => ({
        id: skill.id,
        title: skill.id,
        detail: skill.detail,
        values: {},
      })),
      steps: [
        firstStep,
        {
          title: "Stage 2: verify against detailed scope",
          input: JSON.stringify(secondState, null, 2),
          judgments: JSON.stringify(second.answers, null, 2),
        },
      ],
    };
  }

  const amounts = [...new Set(invoice.match(/\$[\d,]+\.\d{2}/g) ?? [])];

  const candidates = Object.fromEntries(
    amounts.map((amount, index) => [`amount_${index}`, amount]),
  );

  const current = { ...state, context: invoice, candidates };

  const result = yield* evaluate(
    Decision.make({
      input: DemoState,
      decisions: {
        amount: Decision.classify({
          instructions:
            "Select the candidate amount in context that answers text. Choose none if the requested amount is absent.",
          criteria: {
            ...candidates,
            none: "None of the candidate amounts answers the question.",
          },
        }),
      },
    }),
    current,
  );

  const selected = result.answers.amount;

  const value =
    selected.label === "none" ? undefined : candidates[selected.label];

  const review = (selected.confidence ?? 0) < 0.8;
  const accepted = value !== undefined && !review;

  return {
    ...base,
    outcome: review ? ("review" as const) : accepted ? ("ready" as const) : ("missing" as const),
    selectedId: accepted ? selected.label : "",
    heading: review ? "Review the amount" : accepted ? `Selected ${value}` : "No value selected",
    detail: review
      ? "The amount judgment is uncertain. Review the source candidates before copying a value."
      : accepted
      ? "Code copies the selected source span and normalizes it to integer cents. The model never generates an amount."
      : "The requested value is absent or uncertain. No amount is invented.",
    requests: 1,
    highlight: accepted ? value : "",
    items: amounts.map((amount, index) => ({
      id: `amount_${index}`,
      title: amount,
      detail:
        accepted && value === amount
          ? `Selected · ${Number(amount.replace(/[$,.]/g, ""))} USD cents`
          : "Source candidate",
      values: {},
    })),
    steps: [
      {
        title: "Find candidates in code, then select by meaning",
        input: JSON.stringify(current, null, 2),
        judgments: JSON.stringify(result.answers, null, 2),
      },
    ],
  };
});
