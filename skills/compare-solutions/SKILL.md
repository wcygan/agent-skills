---
name: compare-solutions
description: "Compare competing solutions and verify a coherent synthesis. Use when a consequential artifact or design benefits from multiple attempts."
license: MIT
metadata:
  kind: component
  upstream-repository: https://github.com/cursor/plugins
  upstream-revision: 1e5c90a4b6f249917bd21fe361b3a2a7deb741b8
  upstream-path: pstack/skills/arena
  upstream-author: Lauren Tan
  maintenance: local
---

# Compare solutions

Explore alternatives before committing to one shape.

## Procedure

1. Define the artifact, constraints, and three to six concrete success criteria
   before generating candidates. Keep selection criteria separate from candidate
   briefs; give every candidate the same requirements and starting evidence.
2. Produce at least two candidates with separate output locations and rationales.
   Use independent execution when available; otherwise explore sequentially and
   state that limitation. Keep concurrent writers isolated. Record missing outputs.
3. Once candidates stop changing, read each complete artifact. When an independent
   reviewer is available, have them score the same artifacts against the criteria
   without seeing your preferred answer. A separate pass is not independent review.
4. Score criterion by criterion and resolve disagreements using evidence. Select
   the base that best meets the requirements and remains easiest to modify without
   breaking invariants; prefer a smaller interface when otherwise tied.
5. Integrate only worthwhile parts of other candidates, adapting them to the
   chosen structure. Record their origins. Convergence can justify no integration;
   incompatible assumptions require reframing rather than averaging solutions.
6. Verify the synthesized artifact against the original requirements using actual
   outputs or behavior. If it fails, revisit the framing or integration decision.

## Done when

One coherent artifact is accompanied by the comparison, selection rationale,
incorporated and rejected ideas, dropouts, review limitations, and verification
result. Candidate agreement is supporting evidence, not proof of correctness.

Adapted from pstack; [license and attribution](references/LICENSE.txt).
