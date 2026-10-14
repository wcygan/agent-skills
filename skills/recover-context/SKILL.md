---
name: recover-context
description: "Reconstruct the current state of prior work from scoped records and live artifacts. Use when resuming a task or preparing a handoff."
license: MIT
metadata:
  kind: component
  upstream-repository: https://github.com/cursor/plugins
  upstream-revision: 1e5c90a4b6f249917bd21fe361b3a2a7deb741b8
  upstream-path: pstack/skills/recall; pstack/skills/poteto-mode/playbooks/session-pickup.md
  upstream-author: Lauren Tan
  maintenance: local
---

# Recover context

1. Bound the project, topic, and time window. Use a supplied state summary first;
   inspect only relevant history and records accessible within that scope.
2. Recover the goal, constraints, decisions, previous attempts, outstanding work,
   and artifact locations. Preserve prior authorization and explicit checkpoints.
3. Check current files, revisions, published results, and active work against the
   historical claims. Treat the live state as authoritative about what exists now.
4. Read detailed execution records when the question is what actually ran or was
   inspected. Summaries alone cannot prove that; state any unavailable evidence.
5. Return a compact brief with current status, confirmed decisions, known failures,
   unresolved questions, and the next concrete action.

Done when work can resume without repeating settled decisions or relying on stale
claims. Resume an already-requested task; a recall-only request ends with the brief.

Adapted from pstack; [license and attribution](references/LICENSE.txt).
