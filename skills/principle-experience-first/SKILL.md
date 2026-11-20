---
name: principle-experience-first
description: "Apply when product, UX, or feature-scope tradeoffs come up. Choose user delight over implementation convenience; ship fewer polished features over more rough ones."
license: MIT
metadata:
  kind: principle
  upstream-repository: https://github.com/cursor/plugins
  upstream-revision: afd51cf66a3100a95f878d6c4b93a01f6508e3b0
  upstream-path: pstack/skills/principle-experience-first
  upstream-author: Lauren Tan
  maintenance: local
---

# Experience First

When implementation convenience conflicts with the user's experience, choose the experience. Ship fewer features, finished, over more features, rough.

The user is whoever consumes the work: the end user of a UI, the colleague who imports a library, the engineer who maintains the code next.

- Justify every feature, control, and option by the central workflow, or cut it.
- Get the details right: transitions, alignment, spacing, feedback, error states, and the recovery path.
- Tighten the core loop: what the user does most takes the fewest steps and the least waiting.
- Propose a scope cut; do not drop a feature silently. Polish decisions inside the agreed scope are yours.

The test: would the user notice this cut? If not, cut it. If they would notice a rough edge, it is not done.

Adapted from pstack; [license and attribution](references/LICENSE.txt).
