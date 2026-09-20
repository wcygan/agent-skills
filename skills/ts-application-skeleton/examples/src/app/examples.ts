// Presentation metadata only: keep feature implementations out of the shared shell.
export const examples = [
  {
    to: "/pi-agent",
    iconLabel: "↗",
    iconClassName: "bg-blue-50 text-accent",
    eyebrow: "01 / Conversation",
    title: "Meet your Pi agent",
    description: "Ask a question, explore an idea, or get a fresh perspective. A focused conversation with a clear answer.",
    cta: "Open agent",
    label: "Pi agent",
  },
  {
    to: "/decisions",
    iconLabel: "≋",
    iconClassName: "bg-indigo-50 text-indigo-600",
    eyebrow: "02 / Decisions",
    title: "Put judgments to work",
    description: "Explore ranking, evidence checks, typed actions, skill selection, extraction, and ticket routing.",
    cta: "Explore decisions",
    label: "Decisions",
  },
  {
    to: "/collections",
    iconLabel: "▤",
    iconClassName: "bg-amber-50 text-amber-700",
    eyebrow: "03 / Collection",
    title: "Collections",
    description: "A stable set of items with owners, status, and detail pages — served straight from a typed Effect layer.",
    cta: "Browse collections",
    label: "Collections",
  },
] as const;
