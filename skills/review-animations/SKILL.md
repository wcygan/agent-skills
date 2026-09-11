---
name: review-animations
description: "Review existing UI animation code or a motion diff for usability, feel, performance, and accessibility. Use for focused motion critique."
license: MIT
metadata:
  maintenance: "local"
  upstream-repository: "https://github.com/emilkowalski/skills.git"
  upstream-skill: "skills/review-animations"
  upstream-revision: "9075d1724a831411ab5cf138dd9b5cd406ffc2e2"
  upstream-license: "MIT"
---

# Review motion for usability and craft

Review the supplied component or motion diff. Assess purpose, interaction frequency, responsiveness, origin, interruption, rendering cost, accessibility, and consistency with the product. Use `STANDARDS.md` when a finding needs a technique, timing example, or gesture detail.

## Decision criteria

- Motion should communicate feedback, state, spatial continuity, or explanation. Repeated actions should feel immediate.
- Easing and duration should suit the interaction. Brief ease-out transitions are useful defaults for responsive controls; deliberate gestures and larger transitions may need different timing.
- Trigger-anchored surfaces should move from their trigger; centered modals keep a centered origin.
- Rapid toggles and gestures should retarget without jumps. Check interruption rather than rejecting an implementation solely because it uses keyframes or a particular library.
- Prefer transform and opacity where they express the effect. Investigate layout, paint, inherited-variable updates, or main-thread scheduling when performance evidence supports a concern.
- Honor reduced motion, preserve keyboard and focus behavior, and gate hover motion for appropriate pointers.
- Match existing tokens and product conventions. Reference values are starting points; a documented or observed tradeoff can justify a different choice.

Look for concrete consequences, not violations of taste alone. A pure fade can be intentional; a long duration can serve explanation. If source inspection cannot establish feel or performance, state the risk and the visual check needed.

## Findings and completion

Report material findings with file/line locations, their effect on users, evidence, and a concrete remedy. Order by impact. Use a table for comparable snippets when useful, and omit empty categories. State whether any blocking issues remain and what could not be assessed.

Choose the smallest remedy that addresses the problem: removing unnecessary motion, shortening it, adjusting easing or origin, preserving interruption, or changing the rendering approach. Accessibility is a core requirement, not a final polish step.

For review-only work, finish with the findings. If fixes are also requested, continue into the authorized changes and relevant checks, using `animate` or another specialist when helpful. General code review belongs to the appropriate review workflow and need not be declined or deferred to another task.
