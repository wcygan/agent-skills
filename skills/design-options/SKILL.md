---
name: design-options
description: "Compare designs and sketch interfaces before implementation. Use for nontrivial architecture, ownership, or module-boundary decisions."
license: MIT
metadata:
  kind: component
  upstream-repository: https://github.com/cursor/plugins
  upstream-revision: 1e5c90a4b6f249917bd21fe361b3a2a7deb741b8
  upstream-path: pstack/skills/architect
  upstream-author: Lauren Tan
  maintenance: local
---

# Design options

Choose a structure that makes correct changes easy for the next maintainer.

## Procedure

1. Ground the design in current behavior, integration boundaries, and constraints.
   When changing ownership, establish the existing rationale from evidence.
   Skip existing-system investigation only for genuinely isolated greenfield work.
2. Write representative caller usage first. Derive types, signatures, ownership,
   and module boundaries from it; use sketches rather than full implementations.
3. Produce at least two structurally different designs under the same requirements.
   Compare how much complexity each hides behind its public interface, how state
   and invariants are owned, and what a future change must touch.
4. Reject shapes that expose internals, require callers to coordinate hidden
   stages, duplicate mutable state, or maintain the same list in several places.
   Prefer enforceable boundaries and one coherent way to perform an operation.
5. Select a design and record its tradeoffs and rejected alternatives. Hand back
   the sketch and acceptance criteria for implementation; honor any requested
   checkpoint before continuing the larger task.
6. During implementation, treat deviations as evidence. Repeated workarounds,
   type escape hatches, or two independent deviations with the same cause warrant
   re-grounding and new alternatives. Replace the flawed structure rather than
   accumulating patches; preserve unrelated work.

## Done when

The caller sketch, interfaces, ownership, and rationale form a coherent contract.
When revisiting an implementation, explain meaningful changes to that contract.

Adapted from pstack; [license and attribution](references/LICENSE.txt).
