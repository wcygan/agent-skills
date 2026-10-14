---
name: decision-log
description: "Keep an auditable record of consequential choices and evidence. Use for long-running work, handoffs, or decisions reviewers must reconstruct."
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
   unrelated private history out of the record. If using a spreadsheet-readable
   format, escape delimiters and formula-leading characters in untrusted cells.
4. Correct mistakes with superseding entries so prior reasoning remains visible.
5. Before handoff, resolve evidence pointers and compare this run's claims with
   available execution records. Mark missing records as audit limitations. Seek
   an independent audit when warranted and available; label self-review accurately.

Done when another reader can reconstruct important choices and their outcomes,
including abandoned approaches and uncertainty. Preserve the log through cleanup;
commit or publish it only within the task's authorized scope.

Adapted from pstack; [license and attribution](references/LICENSE.txt).
