import type { LinkProps } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";

interface FeatureCardProps {
  to: LinkProps["to"];
  iconLabel: string;
  iconClassName: string;
  eyebrow: string;
  title: string;
  description: string;
  cta: string;
}

export function FeatureCard({
  to,
  iconLabel,
  iconClassName,
  eyebrow,
  title,
  description,
  cta,
}: FeatureCardProps) {
  return (
    <Link to={to} className="panel group flex flex-col p-7 transition-colors hover:border-blue-400">
      <span
        aria-hidden
        className={`mb-7 grid size-11 place-items-center rounded-xl font-mono text-xl ${iconClassName}`}
      >
        {iconLabel}
      </span>
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="mt-3 text-2xl font-semibold tracking-tight">{title}</h2>
      <p className="mt-3 max-w-sm flex-1 text-sm leading-6 text-slate-500">{description}</p>
      <span className="mt-8 inline-flex gap-3 text-sm font-semibold text-accent">
        {cta} <span aria-hidden>→</span>
      </span>
    </Link>
  );
}
