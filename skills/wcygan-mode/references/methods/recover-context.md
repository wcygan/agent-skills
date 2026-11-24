# Recover context

1. Bound the project, topic, and time window. Use a supplied state summary first;
   inspect only relevant history and records accessible within that scope.
2. Recover the goal, constraints, decisions, previous attempts, outstanding work,
   and artifact locations. Note which actions the user already approved by name
   (such as a commit or a push) and which checkpoints they set, so the resumed
   work neither re-asks for a go-ahead it has nor skips a stop the user wanted.
3. Check current files, revisions, published results, and active work against the
   historical claims. Treat the live state as authoritative about what exists now,
   because records describe the past.
4. Read detailed execution records when the question is what actually ran or was
   inspected, because a summary records what its writer believed, not what ran.
   State any unavailable evidence.
5. Return a compact brief with current status, confirmed decisions, known failures,
   unresolved questions, and the next concrete action.

Done when work can resume without repeating settled decisions or relying on stale
claims. Resume an already-requested task; a recall-only request ends with the brief.

Adapted from Lauren Tan’s Pstack. [recall](https://github.com/cursor/plugins/tree/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/skills/recall) · [session-pickup.md](https://github.com/cursor/plugins/tree/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/skills/poteto-mode/playbooks/session-pickup.md). [MIT license](../LICENSE.txt).
