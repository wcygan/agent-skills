# Plan Template

Use the applicable sections to make a plan usable without the original conversation. Include the target, essential constraints, design decisions, and completion evidence. Combine repeated fields and omit irrelevant sections.

```markdown
# NNN — <Short imperative title>

- **Status**: TODO
- **Commit**: <output of `git rev-parse --short HEAD` when this plan was written>
- **Severity**: HIGH | MEDIUM | LOW
- **Category**: <audit category>
- **Estimated scope**: <n files, rough size>

## Problem

What is wrong, where, and why it matters to how the product feels. Cite every
relevant location as `path/to/file.tsx:123`. Include a short current snippet when it explains the defect:

​```css
/* src/components/dropdown.css:14 — current */
.dropdown { transition: all 400ms ease-in; }
​```

## Target

Specify the target behavior, necessary timing or curve decisions, and accessibility requirements. Use existing tokens where suitable; include code when it makes the intended change precise:

​```css
/* target */
.dropdown {
  transition: transform 200ms var(--ease-out), opacity 200ms var(--ease-out);
  transform-origin: var(--transform-origin);
}
​```

## Repo conventions to follow

How this codebase already does it, with one exemplar the executor should
imitate (token names, file placement, prop patterns):

- Easing tokens live in `src/styles/tokens.css`; add new curves there, e.g. `--ease-out: cubic-bezier(0.23, 1, 0.32, 1);`
- <exemplar file:line that already does this correctly>

## Steps

1. <Required dependency or coordinated change, with its purpose and target.>
2. …

## Boundaries

- Do NOT touch <files/components out of scope>.
- Do NOT change markup/structure — motion properties only (unless a step says otherwise).
- Do NOT add new dependencies.
- If code has changed since the plan was written, inspect the drift and adapt routine details while preserving the intended behavior. Ask only when the drift changes scope, authority, or a consequential design decision.

## Verification

- **Mechanical**: <checks appropriate to the changed behavior, with expected outcome>.
- **Feel check**: run the UI, trigger <interaction>, and confirm:
  - <observable check, e.g. "the dropdown scales from its trigger, not from center">
  - <e.g. "spamming the toggle never restarts the animation from zero">
  - Where timing is uncertain, use slow playback to inspect <detail>.
  - Toggle `prefers-reduced-motion` and confirm unnecessary movement is removed while the state change remains understandable.
- **Done when**: <machine- or eye-checkable completion criteria>.
```

## Notes for the plan author

- One plan per finding. If two findings share every file and the same fix pattern (e.g. the same easing token swap across components), they may merge into one plan.
- Prefer existing project tokens. Use [AUDIT.md](AUDIT.md) for starting values when needed, adapting them to the interaction.
- The feel check is not optional. Motion can be mechanically correct and still feel wrong; give the executor (or the human reviewing the executor's diff) concrete things to watch for in slow motion.
- After writing plans, create or update `plans/README.md` with: a table of plans (number, title, severity, status), the recommended execution order, and any dependencies between plans.
