---
name: deliver-change
description: "Present or publish a verified result: local handoff, commit, push, pull request, merge, or deploy, taking exactly the action the user approved. Use for handoff, release preparation, opening a PR, or landing an approved change."
license: MIT
metadata:
  kind: component
  upstream-repository: https://github.com/cursor/plugins
  upstream-revision: 1e5c90a4b6f249917bd21fe361b3a2a7deb741b8
  upstream-path: pstack/skills/poteto-mode/playbooks/opening-a-pr.md; pstack/skills/poteto-mode/playbooks/shipping.md; pstack/skills/poteto-mode/playbooks/babysit.md
  upstream-author: Lauren Tan
  maintenance: local
---

# Deliver a change

1. A go-ahead covers the action it names (commit, push, open PR, merge, deploy).
   Take that action without asking again; ask before any other.
2. Inspect the final artifact and evidence. Confirm verification covers its current
   content and dependencies; rerun the affected checks when either changed, since
   earlier runs no longer describe it.
3. Resolve blocking findings and disclose remaining limitations. For consequential
   landing decisions, seek independent verification when available and state gaps.
4. Present what changed, why, the verification evidence, and any operational steps.
   When publishing, follow the project's conventions and leave unrelated work
   untouched, so the user's other edits survive. Process dependent changes in
   order; stop at an unverified dependency and report it.
5. Read back external state after an action, because a successful submission
   only shows the request was accepted. Distinguish proposed, queued, published,
   merged, and deployed results.
6. If watching completion was requested, bound the watch by the requested goal and
   duration. Polling and re-reading status are safe to repeat. Report a stalled
   or failed action with evidence rather than retrying the action itself or
   taking a step the go-ahead did not name.

Done when the approved action (handoff, commit, push, PR, merge, or deploy) is
confirmed by read-back, or a precise blocker explains why it was not reached. The handoff points to the actual result and its evidence.

Adapted from pstack; [license and attribution](references/LICENSE.txt).
