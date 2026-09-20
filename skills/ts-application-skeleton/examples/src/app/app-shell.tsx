import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

export function AppShell({
  navigation,
  banner,
  children,
}: {
  navigation: ReactNode;
  banner?: ReactNode;
  children: ReactNode;
}) {
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only">
        Skip to content
      </a>
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-5 px-6 py-5 sm:px-10">
          <Link to="/" className="flex items-center gap-3 font-semibold tracking-tight">
            <span
              aria-hidden
              className="grid size-9 place-items-center rounded-xl bg-accent text-lg text-white"
            >
              f.
            </span>
            Foundation
            <span className="hidden text-xs font-normal text-slate-400 sm:inline">
              / playground
            </span>
          </Link>
          {navigation}
        </div>
      </header>
      {banner}
      <main
        id="main"
        className="mx-auto min-h-[calc(100vh-170px)] max-w-6xl px-6 py-10 sm:px-10 sm:py-14"
      >
        {children}
      </main>
      <footer className="mx-auto flex max-w-6xl flex-wrap justify-between gap-3 px-6 py-6 text-xs text-slate-400 sm:px-10">
        <span>A small foundation for thoughtful applications.</span>
        <span>Bun · Effect · TanStack Start</span>
      </footer>
    </>
  );
}
