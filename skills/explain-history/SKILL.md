---
name: explain-history
description: "Explain the evidence behind a design decision or past failure. Use for rationale, tradeoffs, regressions, and prior attempts."
license: MIT
metadata:
  kind: component
  upstream-repository: https://github.com/cursor/plugins
  upstream-revision: 1e5c90a4b6f249917bd21fe361b3a2a7deb741b8
  upstream-path: pstack/skills/why
  upstream-author: Lauren Tan
  maintenance: local
---

# Explain history

1. Anchor the question to code, a decision, or an observed failure. Trace earlier
   changes as well as the latest edit, including renames and reverted attempts.
2. Follow relevant evidence through change discussions, issues, design documents,
   incident records, and measurements that are available within the task's scope.
   Stop when the question is supported; expand the search when evidence conflicts.
3. Separate recorded facts, reasonable inferences, competing explanations, and
   unknowns. A plausible explanation of the code is not proof of its author's intent.
4. Cite the evidence for each consequential claim. Identify searched sources that
   returned nothing and relevant sources that were unavailable.
5. For a proposed change, translate the history into constraints: what to preserve,
   what can change, what previously failed, and what still needs checking.

Done when the rationale is supported or explicitly unknown, with the constraints
and remaining uncertainty clear enough to inform the next decision.

Adapted from pstack; [license and attribution](references/LICENSE.txt).
