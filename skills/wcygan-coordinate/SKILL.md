---
name: wcygan-coordinate
description: "Plan dependent work, assign ownership, and verify integration. Use for multi-part work that benefits from explicit coordination."
license: MIT
metadata:
  kind: procedure
  upstream-repository: https://github.com/cursor/plugins
  upstream-revision: 1e5c90a4b6f249917bd21fe361b3a2a7deb741b8
  upstream-path: pstack/skills/swarm; pstack/skills/figure-it-out; pstack/skills/poteto-mode/playbooks/orchestrate.md
  upstream-author: Lauren Tan
  maintenance: local
---

# Coordinate

Read linked components only when their stated condition applies. Use available
tools and preserve the task's scope, prior authorization, and explicit checkpoints.
Read the shared [principle index](../wcygan-mode/references/principles.md)
and relevant leaves at entry; reconsider them as the work changes and report
each principle that changed a decision with the specific choice it shaped.


1. Establish the final acceptance criteria and constraints with
   [clarify-task](../clarify-task/SKILL.md) when needed. Resolve risky shared interfaces
   before splitting implementation across them.
2. When units will become separate PRs, use [slice-changes](../slice-changes/SKILL.md)
   to establish reviewable intermediate states before assigning owners.
   Use [coordinate-work](../coordinate-work/SKILL.md) to define units, owners,
   dependencies, isolated outputs, and evidence requirements. Use available execution
   capacity; a serial plan is valid when parallel work cannot be isolated.
3. For long work, maintain [decision-log](../decision-log/SKILL.md). On pickup, use
   [recover-context](../recover-context/SKILL.md) and reconcile active owners before
   restarting anything. Persist unfinished work at requested pause points.
4. Inspect every required result and use
   [verify-behavior](../verify-behavior/SKILL.md) for the integrated acceptance criteria.
5. Use [progress-report](../progress-report/SKILL.md) to expose outcomes and blockers.

Done when all required units and the integrated result have evidenced dispositions.
Missing work remains visible; scheduling and publication follow the user's scope.

Adapted from pstack; [license and attribution](references/LICENSE.txt).
