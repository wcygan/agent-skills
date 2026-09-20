import { Schema } from "effect";

export const DemoId = Schema.Literals([
  "ranking",
  "evidence",
  "actions",
  "skills",
  "extraction",
]);

export type DemoId = typeof DemoId.Type;

export const DemoInput = Schema.Struct({
  demo: DemoId,
  scenario: Schema.String,
});

export type DemoInput = typeof DemoInput.Type;

export const demos = [
  {
    id: "tickets",
    title: "Ticket assessment",
    description:
      "Turn a support message into a category, urgency estimate, and queue.",
    pattern: "Choice + Noul",
    to: "/decisions/tickets",
  },
  {
    id: "ranking",
    title: "Ranking playground",
    description:
      "Assess five ideas once. Change your priorities and watch their order change.",
    pattern: "Score + composition",
    to: "/decisions/ranking",
  },
  {
    id: "evidence",
    title: "Evidence checker",
    description:
      "A quote can be real and still fail to support a claim. Check both.",
    pattern: "Exact checks + Choice",
    to: "/decisions/evidence",
  },
  {
    id: "actions",
    title: "Request → typed action",
    description:
      "Turn everyday language into a bounded action preview and typed arguments.",
    pattern: "Parallel questions",
    to: "/decisions/actions",
  },
  {
    id: "skills",
    title: "Skill finder",
    description:
      "Shortlist a small catalog, inspect the best candidates, and know when none fits.",
    pattern: "Two-stage selection",
    to: "/decisions/skills",
  },
  {
    id: "extraction",
    title: "Pick the right value",
    description:
      "Find amounts in an invoice, select the intended one, and copy it exactly.",
    pattern: "Source selection",
    to: "/decisions/extraction",
  },
] as const;

export const scenarios: Record<
  DemoId,
  ReadonlyArray<{ id: string; title: string; text: string }>
> = {
  ranking: [
    {
      id: "roadmap",
      title: "A reading app roadmap",
      text: "Prioritize the next feature for a reading app focused on helping readers build a daily habit.",
    },
  ],
  evidence: [
    {
      id: "supported",
      title: "Supported",
      text: "Readers can export their notes.",
    },
    {
      id: "contradicted",
      title: "Real quote, wrong claim",
      text: "The app automatically shares private notes.",
    },
    {
      id: "unsupported",
      title: "Not enough evidence",
      text: "Exports include PDF files.",
    },
    {
      id: "missing",
      title: "Missing quote",
      text: "All exports are encrypted.",
    },
    {
      id: "uncertain",
      title: "Needs a closer look",
      text: "Every workspace member can export all notes.",
    },
  ],
  actions: [
    {
      id: "lights",
      title: "Dim the lights",
      text: "Dim the kitchen lights to 30 percent.",
    },
    {
      id: "temperature",
      title: "Cool the bedroom",
      text: "Set the bedroom thermostat to 19 degrees Celsius.",
    },
    {
      id: "ambiguous",
      title: "An unclear request",
      text: "Make it comfortable in here.",
    },
    {
      id: "unavailable",
      title: "No matching action",
      text: "Start the dishwasher.",
    },
  ],
  skills: [
    {
      id: "ci",
      title: "Fix failing CI",
      text: "Inspect my failing GitHub Actions checks and repair the cause.",
    },
    {
      id: "review",
      title: "Review a pull request",
      text: "Review this pull request against our repository standards.",
    },
    { id: "uncertain", title: "An uncertain match", text: "Take a look at this pull request and help improve it." },
    { id: "none", title: "No skill needed", text: "Hello! How are you?" },
    {
      id: "reject",
      title: "Reject the shortlist",
      text: "Help me negotiate the price of a house.",
    },
  ],
  extraction: [
    { id: "uncertain", title: "An unclear amount", text: "Which amount describes the adjustment to this bill?" },
    {
      id: "total",
      title: "Total due",
      text: "Which amount must the customer pay?",
    },
    {
      id: "credit",
      title: "Applied credit",
      text: "Which amount is the courtesy credit?",
    },
    {
      id: "absent",
      title: "Missing amount",
      text: "Which amount is the shipping fee?",
    },
  ],
};

export const features = [
  {
    id: "reminders",
    title: "Reading reminders",
    text: "An optional daily reminder brings readers back to their saved books. A small scheduling change.",
  },
  {
    id: "clubs",
    title: "Book clubs",
    text: "Shared discussions connect readers, but require a substantial moderation and collaboration system.",
  },
  {
    id: "export",
    title: "Export notes",
    text: "A small export feature helps a few advanced readers reuse notes in other tools.",
  },
  {
    id: "offline",
    title: "Offline reading",
    text: "Readers on unreliable connections can keep reading; synchronization requires substantial engineering.",
  },
  {
    id: "themes",
    title: "Color themes",
    text: "A quick visual customization for readers who want different colors; little effect on daily reading habits.",
  },
] as const;

export const source =
  "Readers can export their notes as Markdown. Private notes are never shared automatically. Workspace owners can restrict exports for members.";

export const invoice =
  "Invoice INV-2087 (USD)\nSubtotal: $1,200.00\nTax: $115.50\nTotal due: $1,315.50\nA $50.00 courtesy credit has already been applied.";

// Small, deliberate catalog snapshots; this demo does not load or execute installed skills.
export const skillCatalog = [
  {
    id: "gh-fix-ci",
    title: "Fix CI",
    description: "Diagnose and fix failing GitHub Actions checks.",
    detail:
      "Inspect failing checks, identify the cause, implement a repair, and verify it. Use for CI failures, not a general review.",
  },
  {
    id: "code-review",
    title: "Code review",
    description: "Review a pull request against repository standards.",
    detail:
      "Inspect a diff for correctness and regressions and report actionable findings. Use for review, not negotiating business terms.",
  },
  {
    id: "gh-address-comments",
    title: "Address comments",
    description: "Implement fixes requested in GitHub review comments.",
    detail:
      "Read existing reviewer feedback and address the selected comments. A request to perform a fresh review is different.",
  },
  {
    id: "diagnosing-bugs",
    title: "Diagnose bugs",
    description: "Debug reproducible software failures.",
    detail:
      "Establish a focused reproducer and fix the underlying software failure. Requires a concrete broken behavior.",
  },
  {
    id: "grilling",
    title: "Stress-test an idea",
    description: "Interview the user to challenge a plan or idea.",
    detail:
      "Ask probing questions to clarify assumptions. Does not negotiate a purchase or represent a buyer.",
  },
] as const;

const Item = Schema.Struct({
  id: Schema.String,
  title: Schema.String,
  detail: Schema.String,
  values: Schema.Record(Schema.String, Schema.Number),
});

const Step = Schema.Struct({
  title: Schema.String,
  input: Schema.String,
  judgments: Schema.String,
});

export const DemoResult = Schema.Struct({
  outcome: Schema.Literals(["ready", "review", "blocked", "missing", "ranked"]),
  selectedId: Schema.String,
  fields: Schema.Array(
    Schema.Struct({
      role: Schema.Literals(["handler", "room", "argument"]),
      label: Schema.String,
      value: Schema.String,
    }),
  ),
  heading: Schema.String,
  detail: Schema.String,
  mode: Schema.Literals(["mock", "live"]),
  requests: Schema.Number,
  items: Schema.Array(Item),
  steps: Schema.Array(Step),
  highlight: Schema.String,
});

export type DemoResult = typeof DemoResult.Type;

export function rankItems(
  items: DemoResult["items"],
  weights: Record<string, number>,
) {
  const total = Object.values(weights).reduce((sum, weight) => sum + weight, 0);

  return items
    .map((item) => ({
      ...item,
      score:
        total === 0
          ? 0
          : Object.entries(weights).reduce(
              (sum, [key, weight]) => sum + (item.values[key] ?? 0) * weight,
              0,
            ) / total,
    }))
    .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
}
