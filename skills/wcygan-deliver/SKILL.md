---
name: wcygan-deliver
description: "Hand off or publish the verified result to the requested destination. Use for completion, release preparation, or authorized landing."
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

Read linked components only when their stated condition applies. Use available
tools and preserve the task's scope, prior authorization, and explicit checkpoints.


1. Establish the requested destination and current artifact. Reuse existing evidence
   only while it covers that artifact and its integration context.
2. Use [verify-behavior](../verify-behavior/SKILL.md) for missing or stale proof, and
   [review-changes](../review-changes/SKILL.md) for required review or unresolved
   consequential concerns. Resolve blockers before proceeding.
3. Use [deliver-change](../deliver-change/SKILL.md) to present or publish within
   authorized scope and confirm the destination's resulting state.
4. Use [write-clearly](../write-clearly/SKILL.md) for the handoff and
   [progress-report](../progress-report/SKILL.md) when the user needs a status update.
   Include evidence, operational steps, and remaining limitations.

Done when the requested destination is confirmed or the precise blocking condition
is reported. A proposal, queued operation, and completed publication are distinct outcomes.

Adapted from pstack; [license and attribution](references/LICENSE.txt).
