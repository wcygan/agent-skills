import { ColorKey, type Tone } from "./visuals";
import { Link } from "@tanstack/react-router";
import { demos } from "../../shared/decision-demos";

const previewKeys: Record<
  (typeof demos)[number]["id"],
  ReadonlyArray<{ tone: Tone; label: string }>
> = {
  tickets: [
    { tone: "violet", label: "Billing" },
    { tone: "blue", label: "Technical" },
    { tone: "teal", label: "General" },
  ],
  ranking: [
    { tone: "blue", label: "Impact" },
    { tone: "violet", label: "Fit" },
    { tone: "teal", label: "Ease" },
  ],
  evidence: [
    { tone: "green", label: "✓ Supported" },
    { tone: "red", label: "× Contradicted" },
  ],
  actions: [
    { tone: "blue", label: "Action" },
    { tone: "violet", label: "Room" },
    { tone: "teal", label: "Value" },
  ],
  skills: [
    { tone: "blue", label: "Shortlist" },
    { tone: "green", label: "✓ Selected" },
  ],
  extraction: [
    { tone: "neutral", label: "Candidates" },
    { tone: "green", label: "✓ Selected" },
  ],
};

export function DecisionDirectory() {
  return (
    <>
      <div className="mb-9 max-w-2xl">
        <p className="eyebrow mb-3">02 / Decisions</p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Small judgments. Useful software.
        </h1>
        <p className="mt-4 text-base leading-7 text-slate-500">
          Explore how TypeSafe turns language into typed answers that code can
          select, combine, and verify. Choose a demo to try it.
        </p>
        <p className="mt-3 text-xs leading-5 text-slate-500">
          Mock mode uses simulated judgments. These examples demonstrate
          application behavior, not measured model performance.
        </p>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {demos.map((demo) => (
          <Link
            key={demo.id}
            to={demo.to}
            className="panel flex flex-col p-6 transition-colors hover:border-blue-400"
          >
            <p className="eyebrow mb-4">{demo.pattern}</p>
            <h2 className="text-xl font-semibold">{demo.title}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              {demo.description}
            </p>
            <div className="mb-6 mt-5 flex flex-wrap gap-2" aria-hidden>
              {previewKeys[demo.id].map((key) => (
                <ColorKey key={key.label} tone={key.tone}>
                  {key.label}
                </ColorKey>
              ))}
            </div>
            <p className="mt-auto text-sm font-medium text-accent">
              Explore demo →
            </p>
          </Link>
        ))}
      </div>
    </>
  );
}
