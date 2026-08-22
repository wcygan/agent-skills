# ELI5 HTML Style Guide

Use this guide when you create or restyle an ELI5 HTML explainer.

The page must feel like an illustrated lesson, not a dashboard or document.

## Visual contract

**Big pictures. Few words.**

- Give each panel one dominant visual.
- Add no more than one short sentence beside that visual.
- Put optional detail inside a disclosure.
- Give each interaction one clear learning goal.
- Split a tall demo into separate sections.
- Keep every desktop demo visible inside one 1440 by 900 viewport.

Use direct labels inside the diagram. Avoid paragraphs that repeat the visual.

## Layout contract

Use a narrow reading column on wide screens. Let diagrams use that full column.

| Part | Wide-screen target | Narrow-screen target |
| --- | --- | --- |
| Page width | `min(820px, 100% - 32px)` | `100% - 32px` |
| Hero padding | `42px 0 38px` | `32px 0 28px` |
| Section padding | `28px` | `20px` |
| Section radius | `28px` | `22px` |
| Section gap | `18px` | `14px` |
| Main title | Up to `4.65rem` | Fluid, readable size |
| Section title | Up to `3.1rem` | Fluid, readable size |
| Control height | At least `44px` | At least `44px` |

Use container queries for section layouts. Use the viewport only for page-level changes.

Keep related diagrams horizontal above `720px`. Stack them below that width.

## Design tokens

Start with these tokens. Add topic colors only when the visual needs them.

```css
:root {
  color-scheme: light;
  --ink: #14213d;
  --muted: #5d6473;
  --paper: #fbf7ef;
  --card: #fffdf8;
  --line: #d8d1c3;

  --blue: oklch(0.56 0.19 255);
  --blue-soft: #e9f2ff;
  --teal: #087f75;
  --teal-soft: #e2f5f1;
  --orange: #e16b2d;
  --orange-soft: #fff0e5;
  --yellow: #ffd166;

  --check: var(--blue);
  --check-soft: oklch(0.94 0.035 255);
  --no: oklch(0.5 0.16 25);
  --no-soft: oklch(0.94 0.045 25);
  --yes: oklch(0.43 0.11 153);
  --yes-soft: oklch(0.93 0.04 153);

  --ease-out: cubic-bezier(0.23, 1, 0.32, 1);
  --ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);
  --shadow: 0 18px 50px rgb(42 34 20 / 9%);
  --radius: 28px;
}
```

Use warm paper behind warm white cards. Use navy text instead of pure black.

Use state colors consistently:

- Blue means “checking now.”
- Red means “ruled out” or “stop.”
- Green means “chosen” or “returned.”
- Grey means “not visited.”

Do not use color as the only state signal. Add text, shape, or position.

## Starter shell

Use this shell before you add topic-specific diagram styles.

```css
*,
*::before,
*::after {
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  margin: 0;
  color: var(--ink);
  background:
    radial-gradient(circle at 8% 3%, rgb(255 209 102 / 20%), transparent 24rem),
    radial-gradient(circle at 92% 16%, rgb(8 127 117 / 10%), transparent 28rem),
    var(--paper);
  font-family: ui-rounded, "SF Pro Rounded", "Avenir Next", system-ui, sans-serif;
  line-height: 1.45;
}

.page {
  width: min(820px, calc(100% - 32px));
  margin-inline: auto;
}

main.page {
  container-type: inline-size;
}

.hero {
  padding-block: 42px 38px;
}

.hero h1 {
  max-width: none;
  margin: 0;
  font-size: clamp(2.6rem, 7vw, 4.65rem);
  line-height: 0.98;
  letter-spacing: -0.055em;
}

.hero p {
  max-width: 42rem;
  margin: 16px 0 0;
  color: var(--muted);
  font-size: clamp(1rem, 2vw, 1.2rem);
}

.lesson {
  position: relative;
  margin-block: 18px;
  padding: 28px;
  overflow: clip;
  background: var(--card);
  border: 1px solid rgb(216 209 195 / 75%);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
}

.lesson-number {
  display: grid;
  width: 36px;
  height: 36px;
  place-items: center;
  border-radius: 12px;
  color: white;
  background: var(--ink);
  font-size: 0.9rem;
  font-weight: 800;
}

.lesson h2 {
  margin: 12px 0 8px;
  font-size: clamp(2rem, 5.4vw, 3.1rem);
  line-height: 1;
  letter-spacing: -0.045em;
}

.lede {
  max-width: 46rem;
  margin: 0 0 20px;
  color: var(--muted);
}

.action {
  min-height: 44px;
  padding: 11px 18px;
  border: 0;
  border-radius: 15px;
  color: white;
  background: var(--blue);
  box-shadow: 0 5px 0 oklch(0.42 0.16 255);
  font: inherit;
  font-weight: 800;
  cursor: pointer;
  transition: transform 140ms var(--ease-out), box-shadow 140ms var(--ease-out);
}

.action:active {
  transform: translateY(4px) scale(0.96);
  box-shadow: 0 1px 0 oklch(0.42 0.16 255);
}

.status {
  min-height: 44px;
  padding: 10px 14px;
  color: var(--ink);
  background: var(--blue-soft);
  border-left: 5px solid var(--blue);
  border-radius: 10px;
}

:focus-visible {
  outline: 3px solid var(--yellow);
  outline-offset: 3px;
}

@container (max-width: 720px) {
  .hero {
    padding-block: 32px 28px;
  }

  .lesson {
    margin-block: 14px;
    padding: 20px;
    border-radius: 22px;
  }
}
```

## Diagram patterns

Reserve space for arrows and labels. Do not place connectors behind text.

Use these desktop proportions as starting points:

```css
.two-part-demo {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 58px minmax(0, 1fr);
  gap: 14px;
  align-items: center;
}

.range-demo {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 12px;
  align-items: stretch;
}

.balance-demo {
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(250px, 0.95fr);
  gap: 22px;
  align-items: center;
}

@container (max-width: 720px) {
  .two-part-demo,
  .range-demo,
  .balance-demo {
    grid-template-columns: 1fr;
  }
}
```

Keep repeated items compact. Reduce item size before you stack a meaningful sequence.

Split two independent ideas into two sections. Do not force both ideas into one tall card.

## Interaction and motion

Let the user repeat the main mechanism. Reset all states before each replay.

Show these states clearly:

1. The initial state shows the whole system.
2. The active state shows the current check.
3. The complete state shows the result.
4. The repeat action returns to the initial state.

Animate `transform`, `opacity`, and `filter` when possible. Name every transitioned property.

Do not use `transition: all`. Do not animate layout for decoration.

Update sliders during the same `input` event. Do not debounce visible feedback.

```js
slider.addEventListener("input", (event) => {
  updateBalance(Number(event.currentTarget.value));
});
```

Use continuous sliders for continuous tradeoffs. Avoid steps unless the model has discrete states.

Support reduced motion. Keep the complete state understandable without animation.

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    scroll-behavior: auto !important;
    animation-duration: 1ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 1ms !important;
  }

  .immediate-control {
    transition: none !important;
  }
}
```

## Source disclosures

Put evidence below the lesson. Use a disclosure when sources would interrupt the story.

Give dark source panels enough contrast:

```css
.sources {
  color: oklch(0.92 0.012 260);
  background: oklch(0.19 0.04 260);
  border: 1px solid oklch(1 0 0 / 20%);
  border-radius: 18px;
}

.sources summary {
  color: oklch(0.98 0.01 250);
  cursor: pointer;
  font-weight: 800;
}

.sources a {
  color: oklch(0.9 0.075 250);
  text-decoration-thickness: 2px;
  text-underline-offset: 3px;
}

.sources a:hover {
  color: oklch(0.96 0.04 250);
}
```

Name the official source. Link directly to the supporting page.

## Accessibility contract

- Add a skip link before the page content.
- Use headings in a logical order.
- Give each section an accessible name.
- Mark changing status text as a live region.
- Set `aria-busy` while a replay runs.
- Hide decorative dots and icons from assistive technology.
- Give every control a visible keyboard focus state.
- Keep each control at least 44 by 44 pixels.
- Keep text outside SVG when HTML provides better access.
- Prevent horizontal page overflow.

## Browser acceptance

Check the page at these viewport sizes:

- Wide: `1440 × 900`.
- Medium: `1024 × 900`.
- Mobile: `390 × 844`.

Complete these checks:

- Each wide-screen demo fits inside one viewport.
- Related wide-screen diagrams remain horizontal.
- Narrow diagrams stack without overlap.
- Labels stay inside their surfaces.
- Arrows remain visible and do not cross labels.
- Controls remain visible and usable.
- Continuous controls respond immediately.
- Replay works from initial through complete state.
- Replay works again without stale state.
- Reduced motion preserves the explanation.
- The browser console has no errors.

## Reference implementation

Open [mysql-index-example.html](mysql-index-example.html) for a tested implementation.

Reuse its proportions, interaction states, and responsive structure. Replace its topic-specific diagrams and words.
