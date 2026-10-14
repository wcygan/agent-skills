---
name: deliver-change
description: "Present or publish a verified result within authorized scope. Use for handoff, release preparation, or landing an approved change."
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

1. Establish the requested destination: local handoff, proposed change, merge, or
   release. Preserve existing authorization without assuming a broader destination.
2. Inspect the final artifact and evidence. Confirm verification covers its current
   content and dependencies; changes to either require affected checks to be rerun.
3. Resolve blocking findings and disclose remaining limitations. For consequential
   landing decisions, seek independent verification when available and state gaps.
4. Present what changed, why, the verification evidence, and any operational steps.
   For authorized publication, follow the project's conventions and protect unrelated
   work. Process dependent changes in order; stop at an unverified dependency.
5. Read back external state after an action. Distinguish proposed, queued, published,
   merged, and deployed results. A successful submission is not proof of completion.
6. If watching completion was requested, bound the watch by the requested goal and
   duration. Report a stalled or failed action with evidence rather than expanding
   authority or retrying indefinitely.

Done when the requested destination is confirmed, or a precise blocker explains
why it was not reached. The handoff points to the actual result and its evidence.

Adapted from pstack; [license and attribution](references/LICENSE.txt).
