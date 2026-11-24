# Progress report

1. Establish the reporting window from the requested checkpoint or the user's
   previous message. Gather relevant changes and verify current status where
   possible: run read-only commands (`git status`, `git log`, `git diff`, reading
   CI results) and test reruns rather than reporting from memory.
2. Lead with what changed for the user. Distinguish completed, running, failed,
   and unchecked work; include older decisions still waiting on the user.
3. Separate actions only the user can take from work you can continue. Give each
   actual decision enough context, a recommendation, and its consequence.
4. Keep the update short and use familiar names. Include technical identifiers
   only when needed to act or follow evidence. Use existing visuals when they help;
   distinguish diagrams from observed screenshots and measured results.

The report must stand alone away from the transcript: a reader who sees nothing
else knows the current outcome, remaining work, and any decision needed from them.

Done when the user knows the current outcome, remaining work, and any decision
needed from them. Reporting starts no jobs, edits no code, and publishes nothing,
because the user asked for status, not action. A status request does not cancel
a task already under way; keep it running and report its state.

Adapted from Lauren Tan’s Pstack. [ketchup](https://github.com/cursor/plugins/tree/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/skills/ketchup) · [bro](https://github.com/cursor/plugins/tree/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/skills/bro). [MIT license](../LICENSE.txt).
