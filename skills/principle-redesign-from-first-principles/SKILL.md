---
name: principle-redesign-from-first-principles
description: "Redesign the affected code as if a new requirement had been there from the start, instead of bolting it onto the existing design. Apply when integrating a new requirement, feature, or constraint into an existing design, refactoring around a change, or deciding how far a change should propagate."
license: MIT
metadata:
  kind: principle
  upstream-repository: https://github.com/cursor/plugins
  upstream-revision: afd51cf66a3100a95f878d6c4b93a01f6508e3b0
  upstream-path: pstack/skills/principle-redesign-from-first-principles
  upstream-author: Lauren Tan
  maintenance: local
---

# Redesign From First Principles

When integrating a change, redesign as if the requirement had been a foundational assumption from the start. Bolting it onto the existing design leaves a shape nobody would have chosen.

- Read the affected files and understand the current design. The redesign thinking is unbounded: follow the requirement wherever it leads before deciding what to deliver.
- Ask: "if we were writing this from scratch with this new requirement, what would we build?"
- Propagate the change through every reference inside the requested change: types, docs, examples, rationale sections. Delivery stays inside the requested change.
- When the redesign reaches beyond the requested change, that expansion is a product decision. Surface it in the plan or recap with what it would touch, and keep going on the requested change rather than blocking on the answer.
- Think about the whole redesign, then deliver it incrementally.

Adapted from pstack; [license and attribution](references/LICENSE.txt).
