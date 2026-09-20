import { ColorKey } from "./visuals";
import { PageHeading } from "../../components/page-heading";
import { useEffect, useRef, useState } from "react";
import { PromptSuggestion } from "../../components/prompt-kit/prompt-suggestion";
import { evaluateTicket } from "../../server/functions/ai";
import { decisionScenarios } from "../../shared/decision-scenarios";
import type { Assessment, Result } from "../../shared/contracts";

const actionTone = {
  "Priority review": "red",
  "Standard queue": "green",
} as const;

const categoryTone = {
  billing: "violet",
  technical: "blue",
  general: "teal",
} as const;

const categories = ["billing", "technical", "general"] as const;

export function DecisionsPage() {
  const [selected, setSelected] = useState("");
  const [result, setResult] = useState<Result<Assessment> | null>(null);
  const [pending, setPending] = useState(false);
  const controller = useRef<AbortController | null>(null);

  useEffect(
    () => () => {
      controller.current?.abort();
      controller.current = null;
    },
    [],
  );

  async function assess(id: string, text: string) {
    controller.current?.abort();
    const request = new AbortController();
    controller.current = request;
    setSelected(id);
    setResult(null);
    setPending(true);

    try {
      const answer = await evaluateTicket({
        data: { text },
        signal: request.signal,
      });

      if (controller.current === request) setResult(answer);
    } catch {
      if (controller.current === request)
        setResult({
          ok: false,
          code: "TransportError",
          message: "Could not assess this scenario. Select it again to retry.",
        });
    } finally {
      if (controller.current === request) {
        controller.current = null;
        setPending(false);
      }
    }
  }

  return (
    <>
      <PageHeading
        eyebrow="02 / Assessment"
        title="A different message. A different next step."
      >
        Choose a scenario to see how TypeSafe Jev turns a support request into a
        category, an urgency estimate, and a suggested queue.
      </PageHeading>
      <div
        className="mb-6 flex flex-wrap items-center gap-2"
        aria-label="Color key"
      >
        <span className="mr-1 text-xs font-medium text-slate-600">
          Support teams
        </span>
        {categories.map((category) => (
          <ColorKey key={category} tone={categoryTone[category]}>
            <span className="capitalize">{category}</span>
          </ColorKey>
        ))}
      </div>
      <div className="grid items-start gap-6 lg:grid-cols-2">
        <section className="panel p-6 sm:p-7" aria-label="Scenarios">
          <h2 className="text-sm font-semibold">Try a scenario</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Select any card to run an assessment. Compare the results.
          </p>
          <div className="mt-6 flex flex-col gap-3">
            {decisionScenarios.map((scenario) => (
              <PromptSuggestion
                key={scenario.id}
                aria-pressed={selected === scenario.id}
                onClick={() => void assess(scenario.id, scenario.text)}
                className={
                  selected === scenario.id
                    ? "border-blue-400 bg-blue-50 px-4 py-4"
                    : "px-4 py-4"
                }
              >
                <span className="flex items-center justify-between gap-3">
                  <span className="font-semibold text-ink">
                    {scenario.title}
                  </span>
                  <span aria-hidden className="text-accent">
                    {selected === scenario.id ? "✓" : "↗"}
                  </span>
                </span>
                <span className="mt-2 block text-xs leading-6 text-slate-500">
                  {scenario.text}
                </span>
                {selected === scenario.id && result?.ok && (
                  <span className="mt-3 block">
                    <ColorKey tone={categoryTone[result.value.category]}>
                      {result.value.category} support
                    </ColorKey>
                  </span>
                )}
              </PromptSuggestion>
            ))}
          </div>
          <p className="mt-5 text-xs leading-5 text-slate-400">
            Mock mode gives repeatable results. Live mode evaluates the same
            scenarios with your configured model.
          </p>
        </section>
        <section
          className="panel min-h-96 p-6 sm:p-7"
          aria-label="Assessment result"
          aria-live="polite"
          aria-busy={pending}
        >
          <div className="mb-6 flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold">Assessment</h2>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] text-slate-500">
              {pending
                ? "Assessing…"
                : result
                  ? result.ok
                    ? "Complete"
                    : "Needs attention"
                  : "Choose a scenario"}
            </span>
          </div>
          {pending ? (
            <output className="block py-16 text-center text-sm text-slate-500">
              Evaluating this scenario…
            </output>
          ) : result ? (
            result.ok ? (
              <>
                <div
                  data-tone={actionTone[result.value.action]}
                  className="decision-tint decision-card rounded-lg p-5"
                >
                  <p className="text-xs font-medium">
                    {result.value.action === "Priority review"
                      ? "! Priority threshold reached"
                      : "✓ Below the priority threshold"}
                  </p>
                  <h3 className="mt-2 text-xl font-semibold">
                    {result.value.action}
                  </h3>
                  <div className="mt-3">
                    <ColorKey tone={categoryTone[result.value.category]}>
                      {result.value.category} support
                    </ColorKey>
                  </div>
                </div>
                <div className="mt-7">
                  <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Which team fits?
                  </h3>
                  {categories.map((label) => (
                    <div
                      key={label}
                      data-tone={categoryTone[label]}
                      className="mb-4"
                    >
                      <div className="mb-2 flex justify-between text-sm">
                        <span className="decision-ink font-medium capitalize">
                          {label}
                          {label === result.value.category && " · selected"}
                        </span>
                        <span className="tabular-nums text-slate-600">
                          {Math.round(result.value.probabilities[label] * 100)}%
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="decision-fill h-full rounded-full"
                          style={{
                            width: `${result.value.probabilities[label] * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div
                  data-tone={actionTone[result.value.action]}
                  className="mt-6 border-t border-slate-100 pt-5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">
                      Urgency estimate
                    </span>
                    <span className="decision-ink text-lg font-semibold tabular-nums">
                      {Math.round(result.value.urgency * 100)}%
                    </span>
                  </div>
                  <div
                    className="relative mt-3 h-2 rounded-full bg-slate-100"
                    aria-hidden
                  >
                    <div
                      className="decision-fill h-full rounded-full"
                      style={{ width: `${result.value.urgency * 100}%` }}
                    />
                    <span className="absolute -top-1 left-[70%] h-4 border-l-2 border-slate-700" />
                  </div>
                  <p className="mt-3 text-xs leading-5 text-slate-600">
                    The marker is 70%: at or above it, route to priority review.
                  </p>
                </div>
                <p className="mt-5 font-mono text-xs text-slate-400">
                  {result.value.model}
                </p>
              </>
            ) : (
              <div
                role="alert"
                className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900"
              >
                {result.message}
                {result.requestId && (
                  <p className="mt-2 text-xs">Reference: {result.requestId}</p>
                )}
              </div>
            )
          ) : (
            <div className="px-6 py-16 text-center">
              <span aria-hidden className="text-3xl text-slate-300">
                ≋
              </span>
              <p className="mx-auto mt-5 max-w-xs text-sm leading-6 text-slate-400">
                Every request has a different next step. Pick a scenario to
                explore its assessment.
              </p>
            </div>
          )}
          <p className="mt-6 text-xs leading-5 text-slate-400">
            Mock estimates are simulated fixtures, not measured model
            performance. This demo takes no external action.
          </p>
        </section>
      </div>
    </>
  );
}
