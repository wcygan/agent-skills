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

**Trigger:** a product, UX, or feature-scope tradeoff: what to build, what to cut, how polished to make it.

**Rule:** when implementation convenience conflicts with the user's experience, choose the experience. Ship fewer features, finished, over more features, rough.

**Why:** the user pays for every rough edge on every use; the implementer pays for convenience once. A polished experience with three features is used; a rough one with ten is worked around.

**Who the user is:** whoever consumes the work. For a UI, the end user. For a library or an internal API, the colleague who imports it. The engineer who maintains the code next is a user too. Weigh their experience the same way, and explain impact from their perspective.

**Pattern:**
- Every feature, control, and option must be justified by the central workflow. One that does not serve it gets out of the way or gets cut.
- Get the details right: transitions, alignment, spacing, feedback, error states, and the recovery path when something fails.
- Tighten the core loop. The thing the user does most should take the fewest steps and the least waiting.

**Decision test:** "Would the user notice this cut?" If they would not notice a feature's absence, cut it and spend the time on what they will notice. If they would notice a rough edge, it is not done.

**Who decides scope cuts:** propose dropping a feature; do not drop it silently. State what you would cut, why the user would not miss it, and what the time buys instead, then let the user decide. A cut the user did not agree to is a missing feature, not a scope decision. Within scope the user already set, polish decisions (spacing, wording, error copy) are yours to make.

**Scope:** this principle governs the *target*: what good looks like for the person using the result. The foundational-thinking principle governs the *sequence* of work; foundations exist to serve the experience, not the other way round. For choosing between designs by building them, see exhaust-the-design-space.

Adapted from pstack; [license and attribution](references/LICENSE.txt).
