---
name: multi-agent-orchestration
description: Coordinate a bounded multi-agent software task from decomposition through verified integration. Use for concurrent workers, dependent tasks, or shared integration ownership.
license: MIT
---

# Multi-Agent Orchestration

Coordinate one bounded software goal across multiple workers. The orchestrator
owns decomposition, integration, and final verification.

Assign one primary worker to each task by default. Workers own narrow outcomes,
but the orchestrator owns the combined result.

## 1. Define the combined outcome

Inspect repository instructions, acceptance sources, the target revision, and
the worktree state. Preserve all unrelated changes.

Define one combined outcome and its final checks. Record each requirement that
must remain true after integration.

Split work only when each task has a reviewable outcome and independent proof.
Record task dependencies and the required integration order.

Prefer fewer tasks when coordination costs exceed useful parallel work.

## 2. Brief each primary worker

Use this compact brief for every task:

```text
Task:
Primary worker:
Replacement and reason: none
Outcome and dependencies:
Owned files or responsibility:
Permitted actions and boundaries:
Validation evidence:
Stop and report when:
Final report: changed paths, checks, assumptions, blockers, and risks
```

Give reviewers and researchers separate task identities. Reuse the primary
worker for revisions, follow-up work, and recovery.

Replace a primary worker only when unavailable. Record the replacement and
reason before work resumes.

Choose a specialized model route only when the task requires one. Otherwise,
inherit the orchestrator's route.

## 3. Dispatch ready tasks safely

Dispatch a task only when its required contracts and dependencies are ready.
Keep dependent implementation tasks waiting until their inputs are exact.

Use one shared checkout for read-only work or one mutating worker. Use isolated
worktrees for concurrent mutation or uncertain file overlap.

Serialize access when workers share services, ports, databases, caches,
generated state, credentials, or external side effects.

Tell each worker that other workers may change adjacent areas. Require the
worker to preserve unrelated work and stay inside its brief.

Treat commits, pushes, pull requests, deployments, external mutations, and
destructive cleanup as separate authority boundaries.

## 4. Review and integrate contributions

Inspect each contribution's diff, validation output, dependencies, contract
changes, assumptions, and risks. A completion label is not proof.

Return incomplete work to its primary worker. Mark work ready only when its
outcome and evidence satisfy the brief.

Reinspect the target revision and worktree before each integration. Preserve
unexpected changes until their ownership is clear.

Integrate upstream contracts before their consumers. Refresh dependent tasks
with the exact integrated contract before work continues.

Resolve textual and semantic conflicts by preserving every compatible accepted
requirement. Request an authorized decision when valid requirements conflict.

## 5. Verify the combined result

Run targeted checks for each contribution on the integrated state. Then run all
applicable repository checks against the same final state.

Accept the result only when every requirement has integrated evidence and all
combined checks pass. A clean merge is not sufficient.

Report the task graph, integrated contributions, checks, blockers, residual
risks, and actions that still require approval.

Stop and request direction when ownership overlaps, a dependency is
contradictory, shared state cannot be isolated, or final validation cannot prove
the combined outcome.
