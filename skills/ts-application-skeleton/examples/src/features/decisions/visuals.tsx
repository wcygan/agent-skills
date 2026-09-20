import type { ReactNode } from "react";
import type { DemoId, DemoResult } from "../../shared/decision-demos";

export type Tone =
  | "blue"
  | "violet"
  | "teal"
  | "green"
  | "amber"
  | "red"
  | "neutral";

export const outcomes = {
  ready: { tone: "green", symbol: "✓", label: "Ready" },
  review: { tone: "amber", symbol: "?", label: "Needs review" },
  blocked: { tone: "red", symbol: "×", label: "Contradicted" },
  missing: { tone: "neutral", symbol: "—", label: "No match" },
  ranked: { tone: "blue", symbol: "≋", label: "Scored once" },
} as const;

export const fieldTones = {
  handler: "blue",
  room: "violet",
  argument: "teal",
} as const;

export const dimensions = [
  { id: "impact", title: "Customer impact", short: "Impact", tone: "blue" },
  { id: "fit", title: "Strategic fit", short: "Fit", tone: "violet" },
  { id: "ease", title: "Ease of delivery", short: "Ease", tone: "teal" },
] as const;

export function ColorKey({
  tone,
  children,
}: {
  tone: Tone;
  children: ReactNode;
}) {
  return (
    <span data-tone={tone} className="decision-chip">
      <span
        aria-hidden
        className="decision-fill size-2 shrink-0 rounded-full"
      />
      {children}
    </span>
  );
}

const legends: Record<DemoId, ReadonlyArray<{ tone: Tone; label: string }>> = {
  ranking: dimensions.map((dimension) => ({
    tone: dimension.tone,
    label: dimension.short,
  })),
  evidence: [
    { tone: "green", label: "✓ Supported" },
    { tone: "red", label: "× Contradicted" },
    { tone: "amber", label: "? Review" },
    { tone: "neutral", label: "— Not established" },
  ],
  actions: [
    { tone: "blue", label: "Action" },
    { tone: "violet", label: "Room" },
    { tone: "teal", label: "Value" },
  ],
  skills: [
    { tone: "blue", label: "Shortlist" },
    { tone: "amber", label: "? Review" },
    { tone: "green", label: "✓ Selected" },
    { tone: "neutral", label: "— Not selected" },
  ],
  extraction: [
    { tone: "neutral", label: "Source candidate" },
    { tone: "amber", label: "? Review" },
    { tone: "green", label: "✓ Selected value" },
  ],
};

export function DemoLegend({ demo }: { demo: DemoId }) {
  return (
    <div
      className="mb-6 flex flex-wrap items-center gap-2"
      aria-label="Color key"
    >
      <span className="mr-1 text-xs font-medium text-slate-600">
        Follow the colors
      </span>
      {legends[demo].map((item) => (
        <ColorKey key={item.label} tone={item.tone}>
          {item.label}
        </ColorKey>
      ))}
    </div>
  );
}

export function Outcome({ answer }: { answer: DemoResult }) {
  const outcome = outcomes[answer.outcome];

  return (
    <div
      data-tone={outcome.tone}
      className="decision-tint decision-card rounded-lg p-5"
      data-testid="outcome"
    >
      <p className="mb-2 text-xs font-semibold">
        <span aria-hidden>{outcome.symbol} </span>
        {outcome.label}
      </p>
      <h2 className="text-xl font-semibold">{answer.heading}</h2>
      <p className="mt-3 text-sm leading-6">{answer.detail}</p>
    </div>
  );
}

export function ActionFields({ answer }: { answer: DemoResult }) {
  return (
    <dl className="my-5 grid gap-2 sm:grid-cols-3" aria-label="Resolved action">
      {answer.fields.map((field) => (
        <div
          key={field.role}
          data-tone={fieldTones[field.role]}
          className="decision-tint decision-card rounded-lg p-3"
        >
          <dt className="text-xs font-medium">{field.label}</dt>
          <dd className="mt-2 text-sm font-semibold capitalize">
            {field.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function SkillStages({ answer }: { answer: DemoResult }) {
  return (
    <ol
      className="mt-5 grid gap-3 sm:grid-cols-2"
      aria-label="Selection stages"
    >
      <li data-tone="blue" className="decision-tint rounded-lg p-3">
        <p className="text-xs font-medium">1 / Screen the catalog</p>
        <p className="mt-2 text-sm font-semibold">
          {answer.items.length
            ? `${answer.items.length} candidates shortlisted`
            : "No specialist needed"}
        </p>
      </li>
      <li
        data-tone={outcomes[answer.outcome].tone}
        className="decision-tint rounded-lg p-3"
      >
        <p className="text-xs font-medium">2 / Check detailed scope</p>
        <p className="mt-2 text-sm font-semibold">
          {answer.requests < 2
            ? "Skipped"
            : answer.outcome === "review"
              ? "Review needed before selection"
              : answer.selectedId
              ? "One skill selected"
              : "All candidates declined"}
        </p>
      </li>
    </ol>
  );
}
