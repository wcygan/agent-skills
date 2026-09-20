import { createFileRoute } from "@tanstack/react-router";
import { examples } from "../app/examples";
import { FeatureCard } from "../app/feature-card";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return (
    <>
      <div className="mb-12 max-w-2xl">
        <p className="eyebrow mb-4">The application foundation</p>
        <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
          Small by design.
          <br />
          <span className="text-slate-400">Ready to build on.</span>
        </h1>
        <p className="mt-5 max-w-lg text-base leading-7 text-slate-500">
          One application, a few useful patterns. Explore a conversational agent, turn a message
          into a decision, or browse a collection of items.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {examples.map((example) => (
          <FeatureCard key={example.to} {...example} />
        ))}
      </div>
      <section className="mt-10 rounded-xl border border-dashed border-slate-300 p-6 sm:flex sm:items-center sm:justify-between sm:gap-8">
        <div>
          <h2 className="text-sm font-semibold">Make it yours</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Try the examples immediately with local mock responses. No API key needed.
            <br className="hidden sm:block" />
            To connect a real model, set <code>AI_MODE=live</code> and your key in <code>.env</code>
            , then restart.
          </p>
        </div>
        <span className="mt-4 inline-flex shrink-0 items-center gap-2 rounded-full bg-white px-3 py-2 text-xs text-slate-500 sm:mt-0">
          <span className="size-1.5 rounded-full bg-accent" />
          Local playground
        </span>
      </section>
    </>
  );
}
