# Public website

A separate public-facing Forma concept: explain the product, help a visitor compare
plans, and let them try a sample workspace. Open `index.html` directly; no build,
external assets, network service, or account is required. It shares the neutral
palette and typography of the app demos but uses public navigation and a landing
page layout rather than an application sidebar.

## Inspected inspiration (2026-10-03)

- [Linear features](https://linear.app/features): explain product capabilities by
  the work they support, with a clear route to getting started.
- [Linear pricing](https://linear.app/pricing): compare plan inclusions in one place.
- [Vercel pricing](https://vercel.com/pricing): distinguish plans and billing units.

The layout, product copy, plan prices, and preview are original illustrative content,
not replicas, current vendor pricing, or vendor endorsements. No third-party logos,
customer claims, testimonials, or invented usage metrics are used.

## Structure and behavior

- Public navigation reaches Product, Why Forma, Pricing, and Questions.
- The hero explains the audience, value, and next action beside a real HTML product
  preview. Feature explanations follow the find → decide → move task sequence.
- The trust section states verifiable demo behavior: local data, reversible sample
  changes, visible limits, and no payment or account creation.
- Free and Team are fictional example plans. Every CTA uses the same local workspace
  flow with its selected plan shown. Concept features are distinguished from the
  three interactions actually implemented in the demo.
- Try the demo opens a native dialog. Name validation prevents empty/whitespace-only
  names. Opening a workspace displays three tasks; clicking one toggles its state.
- Rename, Cancel, Close, and Escape work. Dialog closure restores focus to the CTA;
  task changes retain focus. The FAQ uses keyboard-accessible native disclosures.
- Workspace name, selected plan, and task state persist under
  `design-loop:public-website:v1`, independently of the other examples.
- Storage failure preserves session state, explains the limitation, and exposes
  Retry saving. Name entry is rendered as text and never interpolated as HTML.

## Review modes

- `?view=wireframe`: grayscale structural mode with the same content and interactions.
- `?state=error`: first save fails; retry succeeds unless storage itself is unavailable.
- Mobile keeps all navigation visible, stacks the hero, features, and plans, and
  preserves the primary action. No build tooling, remote fonts, or decorative imagery.

Real products need truthful claims, actual features and billing semantics, accessible
signup/authentication, service persistence, and relevant legal content. The demo is
not a functioning paid service and does not establish real-user conversion evidence.
