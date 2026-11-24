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

Adapted from Lauren Tan’s Pstack. [show-me-your-work](https://github.com/cursor/plugins/tree/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/skills/show-me-your-work). [MIT license](../LICENSE.txt).
