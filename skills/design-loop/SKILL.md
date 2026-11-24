---
name: design-loop
description: "Design or redesign a website or app around a specific user task. Use for wireframes, prototypes, UI improvements, restyling, and from-scratch interface builds."
license: MIT
metadata:
  author: William Cygan
  version: "0.4.0"
---

# Design Loop

Deliver a coherent interface that makes the user's task easier to complete and
recover from. Establish the primary task, existing friction, behavior to
preserve, and observable acceptance criteria. Work to the requested fidelity
and destination, from a wireframe through a live implementation.

- **Improve** a bounded part of an existing interface using conventions that
  already work. **Redesign** the in-scope layout, interaction, and visual system
  from the user's task while preserving required capabilities, content, data
  contracts, and brand constraints. **Build from scratch** around a clear task
  structure and a consistent visual system.
- Cut taglines, helper text, and secondary labels that compensate for layout.
  Use hierarchy, grouping, placement, and direct action names. Keep essential
  labels, units, constraints, consequences, status, and recovery guidance.
- Choose for users, maintainers, and agents together. Favor semantic controls
  with accessible names, observable states, shared components and tokens, and
  repeatable setup and checks. Compare layouts when a structural decision
  could materially change the task, using the same representative content.

## References

- Page structure, navigation, forms, responsive layouts, and recovery states →
  [Task structure](references/structure.md).
- Unfamiliar interactions → [Product patterns](references/product-patterns.md).
  For a working example of settings, feeds, records, approvals, or agent chat,
  use the bundled [Forma reference app](references/reference-app.md). Its guide
  covers mock data, local and Tailscale startup, and browser inspection.
- New or changed visual language → [Design system](references/design-system.md).
  Prove the direction in a representative slice before applying it across screens.
- Handoff, preview, PR, or deployment → [Delivery](references/delivery.md).

## Verify the result

Use [Validation](references/validation.md) to inspect the rendered interface at
representative wide and narrow sizes. When the user supplied a visual target,
compare it at the same viewport and UI state. Exercise the primary task, relevant
recovery states, and keyboard paths with representative content. Check the
resulting application state for implemented behavior and identify simulated or
deferred behavior for prototypes and wireframes. Fix observed failures, rerun
affected checks, and report any criterion still unverified.
