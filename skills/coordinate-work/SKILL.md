---
name: coordinate-work
description: "Assign independent units, control shared writes, and reconcile results. Use when work spans multiple owners or dependent workstreams."
license: MIT
metadata:
  kind: component
  upstream-repository: https://github.com/cursor/plugins
  upstream-revision: 1e5c90a4b6f249917bd21fe361b3a2a7deb741b8
  upstream-path: pstack/skills/swarm; pstack/skills/poteto-mode/playbooks/orchestrate.md
  upstream-author: Lauren Tan
  maintenance: local
---

# Coordinate work

1. Define the final result and choose partitioned coverage or competing attempts.
   For competition, declare the selection rule before execution.
2. Give each unit a self-contained brief: goal, scope, inputs, dependencies, writable
   locations, acceptance criteria, and required evidence. Name one owner per unit.
3. Complete blocking prerequisites first. Run independent units concurrently only
   when execution is available and useful; otherwise follow the same plan serially.
   Separate concurrent writes and serialize shared mutations.
4. Track each unit as pending, running, complete, or blocked with artifact pointers.
   Verify a prior writer has stopped before replacing it in the same workspace,
   or isolate the replacement and reject stale results.
5. Inspect returned artifacts and evidence, including exact revisions and methods
   for measurements. Request one correction for incomplete results, then record
   unresolved coverage rather than retrying indefinitely.
6. Integrate in dependency order and verify the combined result. Resolve overlapping
   assumptions explicitly; individually passing units do not prove integration.

Done when every required unit has an evidenced outcome and integration is checked.
Report missing units, stopped attempts, and unresolved ownership or dependency gaps.

Adapted from pstack; [license and attribution](references/LICENSE.txt).
