---
name: emil-design-eng
description: "Apply Emil Kowalski's design principles to UI polish and motion. Use when building or reviewing component interactions, animation feel, and fine visual details."
license: MIT
metadata:
  maintenance: "local"
  upstream-repository: "https://github.com/emilkowalski/skills.git"
  upstream-skill: "skills/emil-design-eng"
  upstream-revision: "9075d1724a831411ab5cf138dd9b5cd406ffc2e2"
  upstream-license: "MIT"
---

# Design Engineering

Use Emil Kowalski's principles to make component behavior feel coherent, responsive, and carefully considered. Unseen details compound: optical alignment, trigger-aware movement, predictable gestures, and good defaults should support the user's task.

## Design decisions

- Give motion a purpose: feedback, spatial continuity, state explanation, or a less jarring transition. Keep frequent keyboard actions immediate and avoid decoration that delays work.
- Match timing and easing to the interaction. Brief ease-out transitions often suit entering controls; movement across the screen, continuous motion, and deliberate gestures have different needs.
- Preserve continuity when input interrupts motion. Choose transitions or springs according to retargeting and gesture behavior.
- Let popovers move from their trigger and keep centered modals centered. Use subtle scale and opacity for ordinary entrances rather than making controls emerge from nothing.
- Prefer coherent defaults over unnecessary options. Preserve existing component conventions when they fit the product.
- Use the project's installed libraries and browser targets. Example timings and APIs in the references are starting points, not requirements to add dependencies or rewrite unrelated UI.

## Accessibility

### prefers-reduced-motion

Animations can cause motion sickness. Honor reduced-motion preferences. Remove nonessential movement and position animation; use immediate state changes or restrained opacity and color feedback when they aid comprehension.

```css
@media (prefers-reduced-motion: reduce) {
  .element {
    animation: fade 0.2s ease;
    /* No transform-based motion */
  }
}
```

```jsx
const shouldReduceMotion = useReducedMotion();
const closedX = shouldReduceMotion ? 0 : '-100%';
```

### Touch device hover states

```css
@media (hover: hover) and (pointer: fine) {
  .element:hover {
    transform: scale(1.05);
  }
}
```

Touch devices trigger hover on tap, causing false positives. Gate hover animations behind this media query.

## Conditional references

- Read `references/component-patterns.md` for buttons, popovers, tooltips, toasts, and component API details.
- Read `references/motion-techniques.md` for easing, timing, springs, transforms, clipping, and staged reveals; select the sections relevant to the effect.
- Read `references/gestures.md` for dragging, momentum, damping, pointer capture, and touch behavior.
- Read `references/performance.md` when choosing an animation implementation under load or investigating rendering cost.
- Read `references/debugging.md` when visual inspection reveals timing, continuity, or device-specific problems.

## Completion

For a review, report the material findings with locations, the effect on users, and concrete recommendations. A before/after table is useful for comparable snippets but is not required.

For implementation, finish the requested interactions and inspect the affected behavior, including interruption, keyboard use, and reduced motion when relevant and available. Report any unverified behavior. Do not stop at suggestions when the user asked for the changes.
