---
name: wcygan-deliver
description: "Hand off or publish a verified result: present it locally, commit, push, open a pull request, merge, or deploy, each with its own go-ahead. Use for task completion, release preparation, PR creation, or landing an approved change."
license: MIT
metadata:
  kind: procedure
  upstream-repository: https://github.com/cursor/plugins
  upstream-revision: 1e5c90a4b6f249917bd21fe361b3a2a7deb741b8
  upstream-path: pstack/skills/poteto-mode/playbooks/opening-a-pr.md; pstack/skills/poteto-mode/playbooks/shipping.md
  upstream-author: Lauren Tan
  maintenance: local
---

# Deliver

Read the [principle index](../wcygan-mode/references/principles.md) first. Load a
component named below only when its condition applies.

1. Establish the destination (local handoff, commit, pull request, merge, or
   deploy) and the current artifact. Reuse existing evidence only while it covers
   that artifact and its integration context, because a changed base or patch
   invalidates earlier runs.
2. Use `verify-behavior` for missing or stale proof, and `review-changes` for
   required review or unresolved consequential concerns. Resolve blockers before
   proceeding; report a blocker you cannot clear.
3. For a pull request, use `prepare-pull-request` to assemble the concise
   explanation, useful visual, and current evidence. Reuse that package rather
   than drafting a second description. Use `deliver-change` to present or
   publish: take exactly the action the go-ahead names, then confirm the
   destination's resulting state.
4. Use `write-clearly` for the handoff and `progress-report` when the user needs
   a status update. Include evidence, operational steps, and remaining limitations.

Done when the requested destination is confirmed or the precise blocking condition
is reported.

Adapted from pstack; [license and attribution](references/LICENSE.txt).
