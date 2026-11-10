---
name: review-changes
description: "Challenge a change or design and synthesize evidence-backed findings into a verdict. Use for code review, adversarial review, a pull request critique, contested decisions, or suspected blind spots."
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
changes, because the requester asked for a judgment; apply fixes only when the
request also asked for implementation.

## Procedure

1. Identify the artifact or changeset and state its intended behavior and constraints.
   Include surrounding callers, types, and boundaries needed to judge it. Resolve
   ambiguity that would change the verdict before treating it as a defect.
2. Add a second, independent reviewer for contested, security-sensitive, or large
   changes, where one reviewer's blind spot is costly. A second reviewer, such as
   a subagent, starts cold and re-derives context, so give it a brief with the
   intent, the constraints, pointers to the evidence, and the files in scope, and
   ask for findings with evidence in a fixed format. Otherwise perform a separate
   critical pass and state the lack of independence. Review applicable
   correctness, security, ownership, failure recovery, verification, and
   complexity concerns.
3. Require each finding to name a concrete failure or maintenance cost, its evidence,
   and its impact on the stated goals. Trace reachable execution paths for suspected
   bugs. Distinguish a demonstrated problem from an untested hypothesis.
4. Merge duplicate findings and investigate disagreements. Independent agreement
   strengthens a finding without proving it, because reviewers given the same
   brief can share the same blind spot; a serious finding from one reviewer still
   deserves investigation. Check claims against the actual artifact.
5. Apply judgment rather than voting. Classify findings as:
   - **Act on:** substantiated issues that should block acceptance.
   - **Consider:** legitimate improvements whose benefit may not justify the cost.
   - **Noted:** valid context with no useful action now.
   - **Dismissed:** unsupported, incorrect, or preference-only claims, with reasons.
   Favor demonstrated issues over hypothetical cases and speculative abstractions.

Continue unless the artifact under review cannot be read; report that blocker
when it stops you.

## Done when

The verdict leads, then the findings to act on, then the rest: considered and
noted items, dismissals with reasons, disagreements, review limitations, and
unresolved checks. Each retained finding has a disposition and rationale.

Adapted from pstack; [license and attribution](references/LICENSE.txt).
