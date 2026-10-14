---
name: explain-code
description: "Explain subsystem behavior and ownership from evidence. Use for code walkthroughs, how something works, or where responsibility belongs."
license: MIT
metadata:
  kind: component
  upstream-repository: https://github.com/cursor/plugins
  upstream-revision: 1e5c90a4b6f249917bd21fe361b3a2a7deb741b8
  upstream-path: pstack/skills/how
  upstream-author: Lauren Tan
  maintenance: local
---

# Explain code

Build a working mental model of the relevant system, grounded in actual code.

## Procedure

1. Bound the question. For a narrow question, trace the relevant path directly.
   For a subsystem, investigate distinct slices such as entry points, state,
   boundaries, and failure handling; combine their findings.
2. Follow behavior from input to outcome. Identify who owns each state change,
   which interfaces connect the pieces, and the assumptions they rely on.
3. Check callers, configuration, and tests against the explanation. Distinguish
   observed behavior from inferred intent; code alone does not establish why a
   design was chosen.
4. Explain the concepts and runtime flow a maintainer needs. Cite concrete
   locations, show where responsibilities live, and highlight consequential
   edge cases. Resolve conflicting evidence or mark the uncertainty.

## Done when

The reader can trace the relevant behavior and locate its owners. Important
claims have evidence; remaining unknowns and unverified runtime behavior are
explicit. This investigation produces an explanation, not code changes.

Adapted from pstack; [license and attribution](references/LICENSE.txt).
