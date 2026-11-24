# Explain code

Build a working mental model of the relevant system, grounded in actual code.

## Procedure

1. Bound the question. A single pass is enough unless the subsystem spans several
   directories; only then split the investigation into slices such as entry
   points, state, boundaries, and failure handling, and combine their findings.
   A slice handed to a subagent starts cold and re-derives context, so it pays
   only for a bounded bulk read with one clear question; the brief carries the
   goal, the scope and files, the evidence to return, and the return format.
2. Follow behavior from input to outcome. Identify who owns each state change,
   which interfaces connect the pieces, and the assumptions they rely on.
3. Check callers, configuration, and tests against the explanation. Distinguish
   observed behavior from inferred intent, because code shows what happens, not
   why its author chose it.
4. Explain the concepts and runtime flow a maintainer needs. Cite concrete
   locations, show where responsibilities live, and highlight consequential
   edge cases. Resolve conflicting evidence or mark the uncertainty.

## Done when

The reader can trace the relevant behavior and locate its owners. Important
claims have evidence; remaining unknowns and unverified runtime behavior are
explicit. This investigation produces an explanation, not code changes, unless
the request also asked for a change; then the explanation comes first and the
change follows it.

Adapted from Lauren Tan’s Pstack. [how](https://github.com/cursor/plugins/tree/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/skills/how). [MIT license](../LICENSE.txt).
