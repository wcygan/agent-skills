---
name: progress-report
description: "Catch the user up on changes, status, and decisions awaiting them. Use for progress updates or summaries since a specified checkpoint."
license: MIT
metadata:
  kind: component
  upstream-repository: https://github.com/cursor/plugins
  upstream-revision: 1e5c90a4b6f249917bd21fe361b3a2a7deb741b8
  upstream-path: pstack/skills/ketchup; pstack/skills/bro
  upstream-author: Lauren Tan
  maintenance: local
---

# Progress report

1. Establish the reporting window from the requested checkpoint or the user's
   previous message. Gather relevant changes and verify current status where possible.
2. Lead with what changed for the user. Distinguish completed, running, failed,
   and unchecked work; include older decisions still waiting on the user.
3. Separate actions only the user can take from work you can continue. Give each
   actual decision enough context, a recommendation, and its consequence.
4. Keep the update short and use familiar names. Include technical identifiers
   only when needed to act or follow evidence. Use existing visuals when they help;
   distinguish diagrams from observed screenshots and measured results.

Done when the user knows the current outcome, remaining work, and any decision
needed from them. Reporting itself does not start jobs, edit code, or publish
anything, and a status request does not cancel an already-authorized task.

Adapted from pstack; [license and attribution](references/LICENSE.txt).
