---
name: slice-changes
description: "Plan small, coherent, independently verifiable pull requests. Use before a feature, refactor, migration, or mixed diff grows beyond one reviewer question, or when asked to split a change or stack."
license: MIT
metadata:
  author: William Cygan
  kind: component
  maintenance: local
---

# Slice changes

Make each proposed change answer one reviewer question and leave a valid system.
Optimize for understanding and safe delivery, not an arbitrary line count. A single
coherent PR is preferable to a stack whose fragments cannot be reviewed or verified.

1. Inspect the intended outcome, current diff or design, repository conventions,
   tests, and delivery constraints. Identify unrelated work without moving or
   discarding it. Do not turn a planning request into branch or commit mutations.
2. Group by observable behavior and ownership. Keep implementation, necessary tests,
   and relevant documentation together. Separate independent cleanup; do not split
   mechanically by file type, frontend/backend, or implementation/tests.
3. Identify dependencies and intermediate-state contracts. A preparatory refactor
   must preserve behavior. A migration must establish reader/writer compatibility
   and deployment order. Use [patterns](references/patterns.md) for these cases.
4. Produce a proportionate slice plan with purpose, reviewer question, predecessor,
   acceptance evidence, and rollback/compatibility concern where material. Name the
   final integrated outcome so a small PR does not hide incomplete work.
5. Check that every prefix can meet its stated checks and that the sequence reaches
   the original goal. Combine slices whose correctness cannot be understood apart.
   Continue implementation only when it is already requested, using available
   implementation and coordination skills rather than repeating their workflows.

Suggested compact output:

| Slice | Reviewer question | Depends on | Evidence | Intermediate state |
| --- | --- | --- | --- | --- |
| Name the behavior | One bounded question | Base or prior slice | Specific check | What remains valid |

For an already mixed diff, propose extraction boundaries and risks before rewriting
history. Do not silently rebase, force-push, discard work, or create many branches.
Preserve existing publication authority and explicit checkpoints.

Done when the sequence is understandable, its intermediate states are viable, and
verification covers each slice plus the integrated result. Report uncertainty where
compatibility or deployment behavior has not been established.
