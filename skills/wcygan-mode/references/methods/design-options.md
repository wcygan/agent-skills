# Design options

Choose a structure that makes correct changes easy for the next maintainer.

## Procedure

1. Ground the design in current behavior, integration boundaries, and constraints.
   Use [explain-code](explain-code.md) for unfamiliar behavior and [explain-history](explain-history.md) when changing
   established ownership.
   Skip existing-system investigation only for genuinely isolated greenfield work,
   because anything that touches existing code inherits its constraints.
2. Write representative caller usage first. Derive types, signatures, ownership,
   and module boundaries from it; use sketches rather than full implementations.
3. Produce at least two structurally different designs under the same requirements.
   When separate working artifacts are needed, use [compare-solutions](compare-solutions.md) for this
   comparison and reuse its candidates. Compare how much complexity each
   hides behind its public interface, how state
   and invariants are owned, and what a future change must touch.
4. Reject shapes that expose internals, require callers to coordinate hidden
   stages, duplicate mutable state, or maintain the same list in several places.
   Prefer enforceable boundaries and one coherent way to perform an operation.
5. Use `review-changes` to challenge a consequential or contested choice. Add a
   diagram when it clarifies the boundaries. Select a design and record its
   tradeoffs and rejected alternatives. Hand back
   the sketch and acceptance criteria for implementation. Stop at a checkpoint the
   user requested. Without one, return the sketch and a recommendation; continue
   into implementation only if the request asked for it.
6. During implementation, treat deviations as evidence. Repeated workarounds,
   type escape hatches, or two independent deviations with the same cause warrant
   re-grounding and new alternatives. Replace the flawed structure rather than
   accumulating patches; preserve unrelated work.

## Done when

The caller sketch, interfaces, ownership, and rationale form a coherent contract.
When revisiting an implementation, explain meaningful changes to that contract.

Adapted from Lauren Tan’s Pstack. [architect](https://github.com/cursor/plugins/tree/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/skills/architect). [MIT license](../LICENSE.txt).
