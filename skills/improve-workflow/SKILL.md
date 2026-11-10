---
name: improve-workflow
description: "Find evidence-backed improvements to an engineering process from a run's records. Use for a retrospective, postmortem, repeated friction, wasted effort, or instructions that did not work."
license: MIT
metadata:
  kind: component
  upstream-repository: https://github.com/cursor/plugins
  upstream-revision: 1e5c90a4b6f249917bd21fe361b3a2a7deb741b8
  upstream-path: pstack/skills/reflect
  upstream-author: Lauren Tan
  maintenance: local
---

# Improve a workflow

1. Review the relevant run's goals, decisions, results, and available execution
   records. Distinguish a process failure from missing capability or unclear scope.
2. Examine judgment, tooling, and plausible alternative approaches. Independent
   perspectives can help when available; label the evidence actually used.
3. For each proposed improvement, cite the observed failure or wasted effort,
   explain the causal link, and name the smallest change that would help.
4. Prefer structural enforcement for repeatable mistakes. Reserve instructions
   for judgment that cannot be encoded reliably. Add a rule only for an observed
   failure, because a rule for a speculative one costs every future reader.
5. Classify proposals as adopt, reject, or defer with reasons. Apply and verify
   changes already requested; a retrospective-only request returns proposals.

Done when useful improvements have evidence, a disposition, and a way to evaluate
whether they worked. Opening an issue or posting in the user's name needs an
explicit go-ahead; change unrelated workflows only when the task asks for it.

Adapted from pstack; [license and attribution](references/LICENSE.txt).
