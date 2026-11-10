---
name: decision-log
description: "Keep an auditable record of consequential choices and their evidence. Use for long-running work, handoffs, an audit trail, or decisions reviewers must reconstruct later."
license: MIT
metadata:
  kind: component
  upstream-repository: https://github.com/cursor/plugins
  upstream-revision: 1e5c90a4b6f249917bd21fe361b3a2a7deb741b8
  upstream-path: pstack/skills/show-me-your-work
  upstream-author: Lauren Tan
  maintenance: local
---

# Decision log

1. Choose one durable task-local log outside installed skills. Reuse an existing
   log for the same work; distinguish each run or author.
2. Append a row at decisions and checkpoints with time, run, phase, decision,
   reason, evidence pointer, and result. Skip routine actions that change no decision.
3. Link actual artifacts, checks, revisions, or observations. Keep secrets and
   unrelated private history out of the record, because the log outlives the task
   and may be shared. If using a spreadsheet-readable format, escape delimiters
   and formula-leading characters in untrusted cells, because spreadsheets run a
   cell that begins with a formula character such as `=` or `+`.
4. Correct mistakes with superseding entries so prior reasoning remains visible.
5. Before handoff, resolve evidence pointers and compare this run's claims with
   available execution records. Mark missing records as audit limitations. Seek
   an independent audit when the log hands off across people or makes claims
   about production, since those are the cases where an unchecked claim costs
   the most; label self-review accurately.

Done when another reader can reconstruct important choices and their outcomes,
including abandoned approaches and uncertainty. Preserve the log through cleanup.
Writing and editing the log locally needs no go-ahead; get an explicit go-ahead
before committing, pushing, or publishing it.

Adapted from pstack; [license and attribution](references/LICENSE.txt).
