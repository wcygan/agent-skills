---
version: "1.0.0"
name: Foundation
description: >
  Design system for the Foundation example app (skills/ts-application-skeleton/examples).
  A plain, hairline-bordered light UI on Tailwind CSS v4: three custom theme
  tokens (paper, ink, accent) layered over Tailwind's stock palette, type
  scale, and radius scale. One scarce accent color, semantic color kept
  separate from the brand accent, depth from a 1px border rather than a
  shadow. This document describes what is actually implemented in
  src/styles/app.css and the route/component source — it is not aspirational.

colors:
  paper: "#fafafa"
  ink: "#18181b"
  accent: "#2563eb"
  accent-hover: "#1d4ed8"
  neutral-scale: "Tailwind slate 50/100/200/300/400/500/600/700/800"
  semantic-ok: "emerald-50 (bg) / emerald-500 (dot) / emerald-700 (text) / emerald-950 (heading)"
  semantic-alert: "red-50 (bg) / red-700 (text) / red-950 (heading)"
  semantic-warning: "amber-50 (bg) / amber-200 (border) / amber-700 (text) / amber-900 (text)"
  decorative-only:
    - "indigo-50 / indigo-600 — Decisions feature-card icon chip only"
    - "amber-50 / amber-700 — Collections feature-card icon chip only"

typography:
  font-family: "Inter, ui-sans-serif, system-ui, sans-serif (--font-sans)"
  scale:
    text-5xl: "48px — largest hero line, sm breakpoint only"
    text-4xl: "36px — home h1"
    text-3xl: "30px — subpage h1 (Decisions, Collections, item detail)"
    text-2xl: "24px — feature-card title"
    text-xl: "20px — chat empty-state heading, item detail section values"
    text-lg: "18px — section heading (panel h2)"
    text-base: "16px — lead paragraph"
    text-sm: "14px — default body and UI text"
    text-xs: "12px — captions, meta, eyebrow"
  weight:
    font-semibold: "600 — headings, emphasis, primary-button label"
    font-medium: "500 — pills, secondary buttons"
    default: "400 — body text (no explicit class)"
  eyebrow: "text-xs font-semibold uppercase tracking-[0.16em] text-accent (.eyebrow)"
  mono: "font-mono (Tailwind default stack) — model id, code blocks only, never headings or UI chrome"

rounded:
  md: "6px — small inline buttons"
  lg: "8px — buttons, form inputs, small stat tiles"
  xl: "12px — cards, icon chips, collection item cards"
  2xl: "16px — .panel (the default card), chat window, item-detail article"
  full: "9999px — status pills, dots, avatar/icon circles, notFound/back links"

spacing:
  base-unit: "4px — Tailwind's default scale, no custom tokens"
  page-gutter: "px-6 sm:px-10"
  page-vertical: "py-10 sm:py-14"
  panel-padding: "p-6 / p-7 / p-8, chosen per panel's density"
  grid-gap: "gap-3 (tight groups) / gap-5 / gap-6 (card grids)"

components:
  panel:
    definition: "src/styles/app.css @layer components .panel"
    style: "rounded-2xl border border-slate-200 bg-white — no shadow"
  primary-button:
    definition: "src/styles/app.css .primary-button"
    style: "rounded-lg bg-accent px-5 py-3 text-sm font-semibold text-white, hover:bg-blue-700, disabled:opacity-50"
  eyebrow:
    definition: "src/styles/app.css .eyebrow"
    style: "text-xs font-semibold uppercase tracking-[0.16em] text-accent"
  feature-card:
    definition: "src/app/feature-card.tsx"
    style: "panel + hover:border-blue-400, icon chip in a decorative or accent tint, eyebrow, title, description, accent CTA line"
  status-pill:
    definition: "src/features/collections/status-pill.tsx"
    style: "rounded-full px-2.5 py-1 text-xs font-medium, color keyed off CollectionItem[\"status\"] (Active=ok, Draft=accent, Archived=neutral)"
  action-tone:
    definition: "src/features/decisions/page.tsx (module-level actionTone map)"
    style: "keyed off Assessment[\"action\"] (\"Priority review\"=alert, \"Standard queue\"=ok) — never an inline ternary per call site"
---

## Overview

Foundation's UI is deliberately plain: a near-white canvas (`{colors.paper}`
`#fafafa`), near-black ink (`{colors.ink}` `#18181b`), and **one** scarce blue
accent (`{colors.accent}` `#2563eb`, Tailwind's stock `blue-600`) carrying
every link, active nav state, primary button, and focus affordance. Depth
comes from a single 1px `slate-200` hairline on `.panel` — there is no
`shadow-*` anywhere in the app. Everything else is Tailwind's default
palette, type scale, and radius scale used directly in JSX; the only custom
CSS lives in `src/styles/app.css`; three theme tokens (`paper`, `ink`,
`accent`) plus three small `@layer components` classes (`.panel`, `.eyebrow`,
`.primary-button`).

This system was arrived at by pulling the real `DESIGN.md` references for
Linear, Vercel, Coinbase, and Cursor (via `getdesign.md`) and keeping only
what all four shared: a near-white or near-black canvas with one scarce
accent, hairline borders instead of shadows, and a single type family. Nothing
was copied verbatim from any one of them — see the "Key characteristics"
sections of those tools' own `DESIGN.md` files if you want the sources, not
this one.

**Key characteristics:**

- One accent (`{colors.accent}`), used only for text, icons, borders, and the
  primary button — never as a full-surface fill.
- Semantic color (`{colors.semantic-ok}`, `{colors.semantic-alert}`,
  `{colors.semantic-warning}`) is a separate system from the brand accent.
  It answers "what is the state of this data" (a collection item's status, a
  ticket's routed action, a transport error), never "what is interactive."
- Hairline-only depth. `.panel` is a border, not a shadow.
- One font family (Inter) for everything; `font-mono` is reserved for two
  literal read-outs (a model id, a code block) and never appears in headings
  or navigation.
- Two icon-chip tints (indigo, amber) are purely decorative, scoped to a
  single feature card each — they carry no semantic meaning and must not
  spread to other UI.

## Colors

### Brand

- **Accent** (`{colors.accent}` `#2563eb`): active nav background/text,
  links, primary button fill, feature-card hover border, focus rings via
  `text-accent`/`bg-accent`/`border-accent` (all driven by the single
  `--color-accent` theme token in `app.css`).
- **Accent hover** (`{colors.accent-hover}` `#1d4ed8`, Tailwind `blue-700`):
  the only state accent gets — button/link hover.
- Supporting accent shades in JSX are Tailwind's stock `blue-50/100/200/300/400`
  for soft backgrounds, borders, and the status banner — never a new hex.

### Neutral

Tailwind's stock `slate` scale (`{colors.neutral-scale}`) for every border,
secondary/tertiary text, and neutral surface tint. No other gray scale is
used anywhere in the app.

### Semantic (separate from accent)

- **Ok / active** (`{colors.semantic-ok}`): `CollectionItem` status `Active`,
  `Assessment.action === "Standard queue"`. Green because it means
  "on track," not because it is the brand color.
- **Alert** (`{colors.semantic-alert}`): `Assessment.action === "Priority review"`.
  Red because it means "needs attention now."
- **Warning** (`{colors.semantic-warning}`): transport/provider error banners
  (`role="alert"` cards). Amber, distinct from both accent and alert red —
  reserved for recoverable, non-urgent problems.
- **Decorative-only** (`{colors.decorative-only}`): the Decisions and
  Collections home-page icon chips use indigo and amber purely as visual
  variety between the three feature cards. They are not semantic and must
  not be reused to mean "status" elsewhere.

## Typography

Single family (`{typography.font-family}`), no display/body split, no mono
headings. The scale (`{typography.scale}`) is used directly via Tailwind
utilities in JSX — there is no custom `text-*` scale in `app.css`.
`{typography.eyebrow}` is the one recurring custom pattern: a small
accent-colored uppercase label with wide tracking, used to introduce a
section or a numbered feature ("01 / Conversation").

**Principles**

- Headings are `font-semibold` (600); body text is the browser default
  (400); pills/buttons/secondary labels are `font-medium` (500). Nothing
  is bold (700+).
- `font-mono` (Tailwind's default monospace stack — no custom token) is
  reserved for two literal contexts: the model id under a Pi chat reply, and
  fenced code blocks rendered from markdown. It never appears in a heading,
  nav item, or button.

## Layout

- Base spacing unit is Tailwind's default 4px scale (`{spacing.base-unit}`)
  — there are no custom spacing tokens.
  Page gutters are `{spacing.page-gutter}`, vertical page rhythm is
  `{spacing.page-vertical}`.
- Panels take `{spacing.panel-padding}` depending on density (a compact chat
  input footer vs. a roomy empty-state panel).
  Card grids use `{spacing.grid-gap}`.
- Max content width is the root layout's `max-w-6xl`, centered.

## Elevation & Depth

| Level | Treatment | Use |
|---|---|---|
| Flat | No border, no shadow | Body text, footer, empty states |
| Hairline | 1px `border-slate-200` on `bg-white`, `rounded-2xl` (`.panel`) | Every card, chat window, form panel |
| Selected | `border-blue-400 bg-blue-50` replacing the hairline | A selected scenario/menu item |
| Focus | Browser default `outline` (not overridden) | Inputs, buttons, links |

There is exactly one depth level above flat. Do not add a `shadow-*` utility
anywhere — if something needs to stand out further, give it the accent
border treatment instead, the same way a selected Decisions scenario card
does.

## Shapes

`{rounded.md}`/`{rounded.lg}` for interactive controls (buttons, inputs),
`{rounded.xl}` for content cards and icon chips, `{rounded.2xl}` for the
top-level `.panel`, `{rounded.full}` for anything that is a status indicator,
dot, or circular icon button. There is no sharp-cornered (`rounded-none`)
surface anywhere in the app.

## Components

See the `components:` block above for each one's definition file. `FeatureCard`
owns overview card styling; `StatusPill` belongs to the collection feature.
`src/components/page-heading.tsx` shares the identical Decisions/Collections
heading treatment through eyebrow, title, and description children. The home
hero and collection detail heading retain their distinct layouts.

`src/app/app-shell.tsx` owns page gutters, header, and footer. Navigation and
the provider banner are supplied by the root route. Feature extraction must
preserve rendered elements and utility classes; component boundaries do not
introduce visual wrappers.

`action-tone` in `features/decisions/page.tsx` is the same idea without a component: a
module-level `Record<Assessment["action"], …>` lookup, because the tone
follows a two-value domain enum, not a reusable UI shape.

## Do's and Don'ts

### Do

- Reserve `{colors.accent}` for brand/interactive meaning: links, active
  nav, primary actions, focus, hover borders on clickable cards.
- Route any status- or outcome-driven color through a lookup table keyed on
  the real domain value (`CollectionItem["status"]`, `Assessment["action"]`),
  the way `StatusPill` and `actionTone` already do — never a boolean prop or
  a repeated inline ternary.
- Keep depth to the single hairline `.panel` treatment.
- Keep the one font family; use `font-mono` only for literal model/code
  output.

### Don't

- Don't introduce a second brand accent (no purple, teal, or gradient) —
  extend the semantic palette instead if a new *meaning* is needed.
- Don't add `shadow-*` anywhere, or a second border-radius scale.
- Don't spend the indigo/amber decorative icon tints on anything beyond
  their one existing feature card each.
- Don't hardcode a new status color inline in a route; add it to the
  relevant lookup table in `status-pill.tsx` or `features/decisions/page.tsx` instead.

## Decision demo controls

Decision colors have two purposes. Blue, violet, and teal identify categories or
fields; green, amber, red, and neutral describe outcomes. The brand accent remains
the navigation and interaction color. Keep every colored value paired with a
label, symbol, or number so color is never the only cue.

`features/decisions/visuals.tsx` owns the typed outcome lookup and shared keys.
The server returns an outcome, selected candidate ID, and structured action
fields; the UI never infers semantic state by parsing display text. The outcome
palette colors the result and matching evidence. Gray amounts are source
candidates; the selected amount and its result card share green. Skill selection
shows numbered stages, green for the chosen candidate, and neutral for the rest.
Ticket teams have a fixed categorical color, independent of urgency; the urgency
bar includes a labeled 70% threshold marker.

Ranking uses blue for impact, violet for fit, and teal for ease. The slider, score
label, and corresponding bar segment use the same family. Segments show weighted
contributions on a fixed 0–2 scale, not confidence. Controls sit beside the results
on desktop and above them on mobile. Range controls and inspector summaries have
44px minimum target height. Keep the existing hairline panel surfaces and avoid
adding page-load motion.

The palette is scoped through `data-tone` and `--tone-ink`, `--tone-fill`, and
`--tone-soft` in `src/styles/app.css`. No brand tokens or other features changed.
Chroma is 45%, 65%, and 40% of each hue's sRGB maximum at lightness 0.32, 0.50,
and 0.96 respectively; neutral uses 8%. Rounded values were checked in sRGB.

All changed color roles are listed below. Each After cell lists ink / fill / soft
surface in that order; values are OKLCH.

| Before | After |
| --- | --- |
| All category bars and sliders used the brand accent; new field and stage cues were neutral. | **Blue**: `oklch(0.32 0.041 250)` / `oklch(0.5 0.092 250)` / `oklch(0.96 0.008 250)` |
| Billing, strategic fit, and room values shared blue or neutral styling. | **Violet**: `oklch(0.32 0.077 300)` / `oklch(0.5 0.173 300)` / `oklch(0.96 0.009 300)` |
| General support, delivery ease, and action values shared blue or neutral styling. | **Teal**: `oklch(0.32 0.025 190)` / `oklch(0.5 0.056 190)` / `oklch(0.96 0.023 190)` |
| Ticket success used emerald-50/700/950; accepted results and selected values were neutral or blue. | **Green**: `oklch(0.32 0.04 150)` / `oklch(0.5 0.09 150)` / `oklch(0.96 0.026 150)` |
| Review outcomes had neutral text and white surfaces. | **Amber**: `oklch(0.32 0.03 80)` / `oklch(0.5 0.067 80)` / `oklch(0.96 0.015 80)` |
| Ticket priority used red-50/700/950; contradictory evidence used neutral text and blue highlighting. | **Red**: `oklch(0.32 0.058 25)` / `oklch(0.5 0.132 25)` / `oklch(0.96 0.008 25)` |
| No-match outcomes, unselected candidates, and their labels used slate text on white or slate surfaces. | **Neutral**: `oklch(0.32 0.007 250)` / `oklch(0.5 0.011 250)` / `oklch(0.96 0.002 250)` |

Validation: all seven ink/soft pairs measure APCA Lc 90.7–91.1 and WCAG contrast
11.2–11.59:1. Fill/soft contrast is 5.16–5.79:1. These are palette checks, not a
claim that the entire application meets an accessibility standard. Browser
checks cover every demo at 390px and 1280px, labels, source/result matching,
selected states, and horizontal overflow.
