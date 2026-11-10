---
name: wcygan-investigate
description: "Understand how a subsystem behaves now and why it was built that way, from code and history. Use to investigate a subsystem, explain code, trace a bug's cause, or gather evidence before a change."
license: MIT
metadata:
  kind: procedure
  upstream-repository: https://github.com/cursor/plugins
  upstream-revision: 1e5c90a4b6f249917bd21fe361b3a2a7deb741b8
  upstream-path: pstack/skills/how; pstack/skills/why; pstack/skills/recall
  upstream-author: Lauren Tan
  maintenance: local
---

# Investigate

Read the shared [principle index](../wcygan-mode/references/principles.md) at entry and reconsider it as the work changes. Report each principle that changed a decision, with the specific choice it shaped.

Read linked components only when their stated condition applies, so the context
stays small. Keep the task's scope and any checkpoint the user set.

1. Bound the question and scope; use `clarify-task` when the requested outcome
   is ambiguous.
2. For resumed work, use `recover-context` to establish current state before
   repeating prior investigation.
3. Use `explain-code` for behavior and ownership. When rationale, regressions, or
   prior attempts matter, also use `explain-history`.
4. Combine the evidence into current behavior, constraints, uncertainties, and the
   next useful action. Use `assess-impact` when evaluating a proposed change's
   downstream consequences.

Done when the question has a supported answer or explicit evidence gaps. Continue
into already-requested work from those findings without asking again. When the
request was for an answer only, stop there, because the user asked for an answer,
not a change.

Adapted from pstack; [license and attribution](references/LICENSE.txt).
