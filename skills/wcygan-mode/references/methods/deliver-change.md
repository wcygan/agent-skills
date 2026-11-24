# Deliver a change

1. Identify the requested destination and the exact artifact. For a local
   handoff, present the artifact and evidence. When asked only to draft PR copy,
   use `prepare-pull-request` and return the local package. Opening a draft PR
   still counts as opening a PR. Only open a PR, commit,
   push, merge, deploy, publish a package, or post in the user's name with a
   go-ahead for that action. An approval to open a PR does not approve a push or
   merge. If a prerequisite needs another go-ahead, keep the package local and
   name the missing approval.
2. Inspect the final artifact and evidence. Confirm verification covers its current
   content and dependencies; rerun the affected checks when either changed, since
   earlier runs no longer describe it. Use `verify-behavior` for missing or stale proof.
3. Resolve blocking findings and disclose remaining limitations. Use
   `review-changes` when a review is required or a consequential concern remains.
   Seek independent verification for consequential landing decisions when available.
4. Present what changed, why, the verification evidence, and any operational steps.
   When publishing, follow the project's conventions and leave unrelated work
   untouched, so the user's other edits survive. Process dependent changes in
   order; stop at an unverified dependency and report it. For an approved PR
   opening, reuse or prepare the PR package. Confirm its head, base, evidence and
   requested draft state, then submit it through the available publication tool.
5. Read back external state after an action, because a successful submission
   only shows the request was accepted. Distinguish proposed, queued, published,
   merged, and deployed results. For a created PR, confirm title, body, head,
   base, draft state, and attachment access when assets are part of the package.
6. If watching completion was requested, bound the watch by the requested goal and
   duration. Polling and re-reading status are safe to repeat. Report a stalled
   or failed action with evidence rather than retrying the action itself or
   taking a step the go-ahead did not name.

Done when the approved action (handoff, commit, push, PR, merge, or deploy) is
confirmed by read-back, or a precise blocker explains why it was not reached. The handoff points to the actual result and its evidence.

Adapted from Lauren Tan’s Pstack. [opening-a-pr.md](https://github.com/cursor/plugins/tree/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/skills/poteto-mode/playbooks/opening-a-pr.md) · [shipping.md](https://github.com/cursor/plugins/tree/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/skills/poteto-mode/playbooks/shipping.md) · [babysit.md](https://github.com/cursor/plugins/tree/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/skills/poteto-mode/playbooks/babysit.md). [MIT license](../LICENSE.txt).
