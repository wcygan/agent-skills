import {
  ActionFields,
  ColorKey,
  DemoLegend,
  Outcome,
  SkillStages,
  dimensions,
  outcomes,
  type Tone,
} from "./visuals";
import { PageHeading } from "../../components/page-heading";
import { useEffect, useRef, useState } from "react";
import { evaluateDemo } from "../../server/functions/ai";
import {
  demos,
  invoice,
  rankItems,
  scenarios,
  source,
  type DemoId,
  type DemoResult,
} from "../../shared/decision-demos";
import type { Result } from "../../shared/contracts";
import { PromptSuggestion } from "../../components/prompt-kit/prompt-suggestion";

function SourceText({
  text,
  highlight,
  tone,
  amounts,
}: {
  text: string;
  highlight: string;
  tone: Tone;
  amounts: boolean;
}) {
  const index = highlight ? text.indexOf(highlight) : -1;

  return (
    <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-600">
      {amounts ? (
        text.split(/(\$[\d,]+\.\d{2})/g).map((part, index) =>
          part.startsWith("$") ? (
            <mark
              key={index}
              data-tone={part === highlight ? "green" : "neutral"}
              className="decision-mark"
            >
              {part}
            </mark>
          ) : (
            part
          ),
        )
      ) : index < 0 ? (
        text
      ) : (
        <>
          {text.slice(0, index)}
          <mark data-tone={tone} className="decision-mark">
            {highlight}
          </mark>
          {text.slice(index + highlight.length)}
        </>
      )}
    </p>
  );
}

export function DecisionDemo({ demo }: { demo: DemoId }) {
  const metadata = demos.find((entry) => entry.id === demo);
  const [selected, setSelected] = useState("");
  const [result, setResult] = useState<Result<DemoResult> | null>(null);
  const [pending, setPending] = useState(false);

  const [weights, setWeights] = useState<Record<string, number>>({
    impact: 50,
    fit: 35,
    ease: 15,
  });

  const controller = useRef<AbortController | null>(null);

  useEffect(() => () => controller.current?.abort(), []);

  async function run(scenario: string) {
    controller.current?.abort();
    const request = new AbortController();
    controller.current = request;
    setSelected(scenario);
    setResult(null);
    setPending(true);

    try {
      const answer = await evaluateDemo({
        data: { demo, scenario },
        signal: request.signal,
      });

      if (controller.current === request) setResult(answer);
    } catch {
      if (controller.current === request)
        setResult({
          ok: false,
          code: "TransportError",
          message: "Could not run this scenario. Select it again to retry.",
        });
    } finally {
      if (controller.current === request) {
        controller.current = null;
        setPending(false);
      }
    }
  }

  const answer = result?.ok ? result.value : null;

  const sourceText = {
    evidence: source,
    extraction: invoice,
    ranking: "",
    actions: "",
    skills: "",
  }[demo];

  const ranked = rankItems(answer?.items ?? [], weights);
  const emptyWeights = Object.values(weights).every((weight) => weight === 0);

  return (
    <>
      <PageHeading
        eyebrow={metadata?.pattern ?? "Decisions"}
        title={metadata?.title ?? "Decision demo"}
      >
        {metadata?.description}
      </PageHeading>
      <DemoLegend demo={demo} />
      <div className="grid items-start gap-6 lg:grid-cols-2">
        <section className="panel p-6 sm:p-7" aria-label="Scenarios">
          {sourceText && (
            <div className="mb-6 border-b border-slate-100 pb-5">
              <h2 className="text-sm font-semibold">Source document</h2>
              <SourceText
                text={sourceText}
                highlight={answer?.highlight ?? ""}
                tone={answer ? outcomes[answer.outcome].tone : "neutral"}
                amounts={demo === "extraction"}
              />
              {answer && (
                <p className="mt-3 text-xs text-slate-600">
                  {answer.highlight
                    ? "The marked source text connects to the result. Read the surrounding context too."
                    : "No source text selected for this result."}
                </p>
              )}
            </div>
          )}
          <h2 className="text-sm font-semibold">Try a scenario</h2>
          <div className="mt-5 flex flex-col gap-3">
            {scenarios[demo].map((scenario) => (
              <PromptSuggestion
                key={scenario.id}
                aria-pressed={selected === scenario.id}
                onClick={() => void run(scenario.id)}
                className={
                  selected === scenario.id
                    ? "border-blue-400 bg-blue-50 px-4 py-4"
                    : "px-4 py-4"
                }
              >
                <span className="font-semibold text-ink">{scenario.title}</span>
                <span className="mt-2 block text-xs leading-6 text-slate-500">
                  {scenario.text}
                </span>
              </PromptSuggestion>
            ))}
          </div>
          {answer && demo === "ranking" && (
            <fieldset className="mt-6 space-y-4">
              <legend className="mb-3 text-sm font-semibold">
                Your priorities
              </legend>
              {dimensions.map((dimension) => (
                <label
                  key={dimension.id}
                  htmlFor={dimension.id}
                  data-tone={dimension.tone}
                  className="decision-tint block rounded-lg px-3 pt-3 text-sm"
                >
                  <span className="flex justify-between">
                    <span className="flex items-center gap-2">
                      <span
                        aria-hidden
                        className="decision-fill size-2 rounded-full"
                      />
                      {dimension.title}
                    </span>
                    <span>{weights[dimension.id]}</span>
                  </span>
                  <input
                    id={dimension.id}
                    aria-label={dimension.title}
                    className="decision-range mt-1 w-full"
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={weights[dimension.id]}
                    onChange={(event) =>
                      setWeights({
                        ...weights,
                        [dimension.id]: Number(event.target.value),
                      })
                    }
                  />
                </label>
              ))}
            </fieldset>
          )}
          <p className="mt-5 text-xs leading-5 text-slate-500">
            Mock mode returns deterministic fixtures through the provider
            adapter. Select a scenario again to rerun it.
          </p>
        </section>
        <section
          className="panel min-h-96 min-w-0 p-6 sm:p-7"
          aria-label="Demo result"
          aria-busy={pending}
        >
          <div aria-live="polite">
            {pending ? (
              <output className="block py-16 text-center text-sm text-slate-500">
                Evaluating this scenario…
              </output>
            ) : result && !result.ok ? (
              <div
                role="alert"
                className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"
              >
                {result.message}
                {result.requestId && (
                  <p className="mt-2 text-xs">Reference: {result.requestId}</p>
                )}
              </div>
            ) : answer ? (
              <>
                <p className="mb-4 text-xs text-slate-500">
                  {answer.mode === "mock"
                    ? "Simulated judgments"
                    : "Live model judgments"}{" "}
                  ·{" "}
                  <span data-testid="request-count">
                    {answer.requests} provider{" "}
                    {answer.requests === 1 ? "request" : "requests"}
                  </span>
                </p>
                <Outcome answer={answer} />
              </>
            ) : (
              <p className="py-16 text-center text-sm text-slate-500">
                Choose a scenario to explore its decisions.
              </p>
            )}
          </div>
          {answer && (
            <>
              {demo === "ranking" ? (
                <>
                  <p className="mt-4 text-xs leading-5 text-slate-500">
                    {emptyWeights
                      ? "All weights are zero: every feature ties. Increase a weight to rank them."
                      : "Each bar shows the weighted contribution of impact, fit, and ease on a 0–2 scale. Sliders change the mix without a new request."}
                  </p>
                  <ol className="mt-5 space-y-3" aria-label="Ranked features">
                    {ranked.map((item, index) => (
                      <li
                        key={item.id}
                        className="rounded-xl border border-slate-200 p-4"
                      >
                        <div className="flex justify-between gap-3">
                          <h3 className="text-sm font-semibold">
                            <span className="mr-2 text-slate-500">
                              {index + 1}.
                            </span>
                            {item.title}
                          </h3>
                          <span className="text-sm tabular-nums">
                            {item.score.toFixed(2)}
                          </span>
                        </div>
                        <p className="mt-2 text-xs leading-5 text-slate-500">
                          {item.detail}
                        </p>
                        <div
                          className="mt-3 flex h-3 overflow-hidden rounded-full bg-slate-100"
                          aria-hidden
                        >
                          {dimensions.map((dimension) => (
                            <span
                              key={dimension.id}
                              data-tone={dimension.tone}
                              className="decision-fill h-full"
                              style={{
                                width: `${emptyWeights ? 0 : ((item.values[dimension.id] * weights[dimension.id]) / Object.values(weights).reduce((sum, weight) => sum + weight, 0) / 2) * 100}%`,
                              }}
                            />
                          ))}
                        </div>
                        <div
                          className="mt-3 flex flex-wrap gap-2"
                          aria-label="Component scores"
                        >
                          {dimensions.map((dimension) => (
                            <ColorKey key={dimension.id} tone={dimension.tone}>
                              {dimension.short}{" "}
                              {item.values[dimension.id].toFixed(2)}
                            </ColorKey>
                          ))}
                        </div>
                      </li>
                    ))}
                  </ol>
                </>
              ) : (
                <div className="mt-6 space-y-3">
                  {demo === "actions" && answer.fields.length > 0 && (
                    <ActionFields answer={answer} />
                  )}
                  {demo === "skills" && <SkillStages answer={answer} />}
                  {answer.items.map((item) => (
                    <article
                      key={item.id}
                      data-tone={
                        item.id === answer.selectedId ? "green" : "neutral"
                      }
                      className="decision-tint decision-card rounded-lg p-4"
                    >
                      {demo !== "actions" && (
                        <span className="decision-chip mb-3">
                          {item.id === answer.selectedId
                            ? "✓ Selected"
                            : demo === "skills"
                              ? "— Not selected"
                              : "Source candidate"}
                        </span>
                      )}
                      <h3 className="text-sm font-semibold">{item.title}</h3>
                      {demo === "actions" ? (
                        <details>
                          <summary className="flex min-h-11 cursor-pointer items-center text-sm text-accent">
                            View typed action
                          </summary>
                          <pre className="mt-3 overflow-x-auto text-xs leading-6">
                            {item.detail}
                          </pre>
                        </details>
                      ) : (
                        (demo !== "extraction" ||
                          item.id === answer.selectedId) && (
                          <p className="mt-2 text-sm leading-6">
                            {item.detail}
                          </p>
                        )
                      )}
                    </article>
                  ))}
                </div>
              )}
              <details className="mt-6 border-t border-slate-100 pt-5">
                <summary className="min-h-11 cursor-pointer py-3 text-sm font-medium text-accent">
                  Inspect input and typed judgments
                </summary>
                {answer.steps.map((step) => (
                  <div key={step.title} className="mt-5">
                    <h3 className="text-sm font-semibold">{step.title}</h3>
                    <p className="mt-3 text-xs text-slate-500">Input</p>
                    <pre className="mt-2 max-h-72 overflow-auto rounded-lg bg-slate-50 p-3 text-xs leading-5">
                      {step.input}
                    </pre>
                    <p className="mt-3 text-xs text-slate-500">
                      Judgments / code checks
                    </p>
                    <pre className="mt-2 max-h-72 overflow-auto rounded-lg bg-slate-50 p-3 text-xs leading-5">
                      {step.judgments}
                    </pre>
                  </div>
                ))}
              </details>
              <p className="mt-5 text-xs leading-5 text-slate-500">
                {answer.mode === "mock"
                  ? "Fixture values illustrate the workflow; they do not measure model accuracy, calibration, or speed."
                  : "Typed outputs still need evaluation on your data. Review thresholds here are illustrative."}
              </p>
            </>
          )}
        </section>
      </div>
    </>
  );
}
