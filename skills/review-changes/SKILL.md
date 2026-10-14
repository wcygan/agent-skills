---
name: review-changes
description: "Challenge a change or design and synthesize evidence-backed findings. Use for adversarial review, contested decisions, or suspected blind spots."
license: MIT
metadata:
  kind: component
  upstream-repository: https://github.com/cursor/plugins
  upstream-revision: 1e5c90a4b6f249917bd21fe361b3a2a7deb741b8
  upstream-path: pstack/skills/interrogate
  upstream-author: Lauren Tan
  maintenance: local
---

# Review changes

Challenge the work against its actual intent. Produce a verdict without applying
changes.

## Procedure

1. Identify the artifact or changeset and state its intended behavior and constraints.
   Include surrounding callers, types, and boundaries needed to judge it. Resolve
   ambiguity that would change the verdict before treating it as a defect.
2. Seek independent reviews when available, each using the same brief and evidence.
   Otherwise perform a separate critical pass and state the lack of independence.
   Review applicable correctness, security, ownership, failure recovery,
   verification, and complexity concerns.
3. Require each finding to name a concrete failure or maintenance cost, its evidence,
   and its impact on the stated goals. Trace reachable execution paths for suspected
   bugs. Distinguish a demonstrated problem from an untested hypothesis.
4. Merge duplicate findings and investigate disagreements. Independent agreement
   strengthens a finding but does not prove it; a serious finding from one reviewer
   still deserves investigation. Check claims against the actual artifact.
5. Apply judgment rather than voting. Classify findings as:
   - **Act on:** substantiated issues that should block acceptance.
   - **Consider:** legitimate improvements whose benefit may not justify the cost.
   - **Noted:** valid context with no useful action now.
   - **Dismissed:** unsupported, incorrect, or preference-only claims, with reasons.
   Favor demonstrated issues over hypothetical cases and speculative abstractions.

## Done when

The verdict states intent, evidence, impact, disagreements, review limitations,
and unresolved checks. Each retained finding has a disposition and rationale;
review suggestions remain proposals unless implementation was also requested.

Adapted from pstack; [license and attribution](references/LICENSE.txt).
