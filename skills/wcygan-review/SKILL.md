---
name: wcygan-review
description: "Review correctness and tradeoffs with evidence and independent scrutiny where available. Use for a requested code or design review."
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

Read linked components only when their stated condition applies. Use available
tools and preserve the task's scope, prior authorization, and explicit checkpoints.


1. Fix the review scope, intent, and artifact version. Use
   [explain-code](../explain-code/SKILL.md) only where surrounding behavior is unclear.
2. Use [review-changes](../review-changes/SKILL.md) to challenge the work and judge
   findings. Seek independent scrutiny when available and state its absence accurately.
3. For uncertain downstream contracts, use [assess-impact](../assess-impact/SKILL.md).
   Use [verify-behavior](../verify-behavior/SKILL.md) for decisive checks within the
   review's permitted scope; preserve unresolved hypotheses when checks cannot run.
4. Present prioritized findings, impact, evidence, disagreements, and limitations.
   Keep review-only work read-only; carry out corrections only when also requested.

Done when material findings have a reasoned disposition and the verdict describes
what was actually inspected or exercised, without treating consensus as proof.

Adapted from pstack; [license and attribution](references/LICENSE.txt).
