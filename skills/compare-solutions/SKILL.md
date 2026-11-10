---
name: compare-solutions
description: "Compare competing solutions built as separate candidates and verify a coherent synthesis. Use when a consequential artifact or design benefits from multiple attempts, such as a bake-off between alternative implementations or prototypes."
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
   Each candidate is a full attempt, so this costs as much as building the thing
   several times; it pays only for a novel shape or a high cost of reversal.
   Otherwise build one candidate and use design-options to compare sketches.
   A candidate built by a subagent starts cold and re-derives context, so its
   brief must carry the goal, the scope and files, the evidence to return, and
   the return format. Keep concurrent writers isolated so they cannot overwrite
   each other. Record candidates that produced no output.
3. Each candidate's report arrives when it finishes; compare when all have
   reported. Read each complete artifact. When an independent reviewer is
   available, have them score the same artifacts against the criteria without
   seeing your preferred answer. A second pass by the same reviewer shares the
   first pass's preferences, so state that limitation.
4. Score criterion by criterion and resolve disagreements using evidence. Select
   the base that best meets the requirements and remains easiest to modify without
   breaking invariants; prefer a smaller interface when otherwise tied.
5. Integrate only worthwhile parts of other candidates, adapting them to the
   chosen structure. Record their origins. Convergence can justify no integration;
   incompatible assumptions require reframing rather than averaging solutions.
6. Verify the synthesized artifact against the original requirements using actual
   outputs or behavior. If it fails, revisit the framing or integration decision.

Post a short progress update when the candidates are briefed, when all have
reported, and when the synthesis is verified.

## Done when

One coherent artifact is accompanied by the comparison, selection rationale,
incorporated and rejected ideas, candidates that produced no output, review
limitations, and verification result. Treat candidate agreement as supporting
evidence rather than proof, because candidates given the same brief can share
the same mistake.

Adapted from pstack; [license and attribution](references/LICENSE.txt).
