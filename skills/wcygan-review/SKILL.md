---
name: wcygan-review
description: "Review a change or design for correctness and tradeoffs, with evidence and independent scrutiny where available. Use for a requested code review, PR review, design review, or adversarial check of a change."
license: MIT
metadata:
  kind: procedure
  upstream-repository: https://github.com/cursor/plugins
  upstream-revision: 1e5c90a4b6f249917bd21fe361b3a2a7deb741b8
  upstream-path: pstack/skills/interrogate; pstack/skills/blast-radius
  upstream-author: Lauren Tan
  maintenance: local
---

# Review

Read the [principle index](../wcygan-mode/references/principles.md) first. Load a
component named below only when its condition applies.

1. Fix the review scope, intent, and artifact version. Use `explain-code` where
   surrounding behavior is unclear.
2. Use `review-changes` to challenge the work and judge findings. Seek independent
   scrutiny when available and state its absence accurately.
3. For uncertain downstream contracts, use `assess-impact`. Use `verify-behavior`
   for decisive checks within the review's scope; preserve unresolved hypotheses
   when checks cannot run.
4. Present prioritized findings, impact, evidence, disagreements, and limitations.
   Continue into corrections only when they were also requested; a review-only
   request wants findings, so edits would exceed it.

Done when material findings have a reasoned disposition and the verdict describes
what was actually inspected or exercised.

Adapted from pstack; [license and attribution](references/LICENSE.txt).
