---
name: wcygan-coordinate
description: "Plan dependent work, assign one owner per unit, run parallel workers where their writes are isolated, and verify integration. Use for multi-part work, a program of several changes, or any task that benefits from explicit coordination or subagent delegation."
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

Read the shared [principle index](../wcygan-mode/references/principles.md) at entry and reconsider it as the work changes. Report each principle that changed a decision, with the specific choice it shaped.

Read linked components only when their stated condition applies, so the context
stays small. Keep the task's scope and any checkpoint the user set.

1. Establish the final acceptance criteria and constraints with `clarify-task`
   when needed. Resolve risky shared interfaces before splitting implementation
   across them.
2. When units will become separate PRs, use `slice-changes` to establish
   reviewable intermediate states before assigning owners. Use `coordinate-work`
   to define units, owners, dependencies, isolated outputs, evidence requirements,
   and each worker's brief. A parallel worker is useful when its writes are
   isolated from every other worker's and its output is bounded, so the
   coordinator reads a summary rather than raw output; a worker starts cold and
   re-derives context, so a unit that needs the coordinator's context stays with
   the coordinator. A serial plan is valid when parallel work cannot be isolated.
3. For long work, maintain `decision-log`. On pickup, use `recover-context` and
   reconcile active owners before restarting anything, so two writers never
   share a workspace. Persist unfinished work at requested pause points.
4. Inspect every required result and use `verify-behavior` for the integrated
   acceptance criteria.
5. Report at each integration point, not only at the end: use `progress-report`
   to expose outcomes and blockers as units land. End with a recap that leads
   with the outcome, then what was verified, what was not, and what is next.

Done when all required units and the integrated result have evidenced dispositions.
Missing work remains visible. Committing, pushing, opening or merging a pull
request, or deploying needs an explicit go-ahead; scheduling future runs needs an
external trigger.

Adapted from pstack; [license and attribution](references/LICENSE.txt).
