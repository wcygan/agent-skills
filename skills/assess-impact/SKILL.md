---
name: assess-impact
description: "Trace what a change could break beyond its immediate diff. Use for compatibility, boundary changes, or uncertain downstream effects."
license: MIT
metadata:
  kind: component
  upstream-repository: https://github.com/cursor/plugins
  upstream-revision: 1e5c90a4b6f249917bd21fe361b3a2a7deb741b8
  upstream-path: pstack/skills/blast-radius
  upstream-author: Lauren Tan
  maintenance: local
---

# Assess impact

1. Read the change and identify the one or two assumptions its safety depends on.
2. Trace affected callers and less visible contracts: serialized data, stored state,
   external consumers, execution order, configuration, and pinned dependency behavior.
3. For each plausible failure, show a reachable path and its consequence. Separate
   demonstrated risks, cleared risks, and hypotheses still needing evidence.
4. Prove the crucial safety assumption with the smallest meaningful check against
   actual code or behavior. Inspect dependency implementations when their semantics
   determine the answer; function names and search results are insufficient.
5. Report the level reached: source evidence, traced impossibility, executable
   proof, or observation in the running system. Mark an unproven assumption as such.

Done when consequential risks have evidence and a disposition, and the safety
claim is proven to the stated level or remains explicitly unresolved.

Adapted from pstack; [license and attribution](references/LICENSE.txt).
