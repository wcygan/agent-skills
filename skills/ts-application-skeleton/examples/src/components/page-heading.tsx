import type { ReactNode } from "react";

export function PageHeading({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="mb-9 max-w-2xl">
      <p className="eyebrow mb-3">{eyebrow}</p>
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
      <p className="mt-4 text-base leading-7 text-slate-500">{children}</p>
    </div>
  );
}
