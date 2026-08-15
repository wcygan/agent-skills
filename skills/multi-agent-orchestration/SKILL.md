---
name: multi-agent-orchestration
description: Coordinate a bounded multi-agent software task from decomposition through verified integration. Use for concurrent workers, deliberate model routes, worktree choices, progress supervision, or semantic conflict resolution.
license: MIT
---

# multi-agent-orchestration

Coordinate one bounded software goal across multiple workers. The orchestrator
owns planning, dependency management, integration, and final verification.
Workers own narrow outcomes; they do not own the combined result.

The core invariant is semantic integration: a contribution is integrated only
when the final state preserves every accepted requirement from all valid
contributions. A clean merge without conflict markers is insufficient.

## Route the request

Use this skill for live multi-worker delivery from decomposition through
verified integration. Keep these neighboring workflows separate:

- Use `handoff` to compact one session for a successor.
- Use `code-review` to review a fixed-point diff against standards and a spec.
- Use `gh-stack` to manage dependent branches and pull requests.
- Use `hill-climbing` to run bounded numeric optimization experiments.
- Use `ideate-orchestrator-skill` for a read-only composition blueprint; it
  stops before live worker dispatch or integration.
- Use `resolving-merge-conflicts` for the mechanics of an already authorized
  in-progress Git merge or rebase. This skill retains dependency ordering,
  cross-worker requirement reconciliation, and combined-result acceptance.

This skill does not write the implementation assigned to workers or assume
authority to publish their work.

## Establish authority and ownership

1. Start with read-only inspection and planning. Treat an explicit request to
   dispatch workers or integrate locally as authorization only for that stated
   scope.
2. Assign exactly one orchestrator as the integration owner. Only that owner
   may decide integration order, apply contributions to the target checkout,
   reconcile shared contracts, and declare final acceptance.
3. Route model and reasoning choices through the model contract below.
4. Bound each worker's writable scope and authority. Tell every worker that
   other workers may change adjacent areas and that unrelated work must survive.
5. Keep commits, pushes, pull requests, deployments, external mutations, and
   worktree deletion outside scope until separately authorized.

Stop before mutation when authorization or ownership is uncertain.

## Route models deliberately

Invoke `route-agent-models` before dispatch when a worker can inherit, override,
or specialize its model route. Pass the outcome, risk, context, tools,
permissions, authority, and fallback constraints.

Require one `route_ready` or `inherited_route_ready` Route Record. Keep task
identity, agent role, model route, and context fork distinct. A blocked or
mismatched route is not dispatchable.

Keep the integration owner on a route that can perform contract decisions and
final acceptance. Route bounded worker tasks according to their own evidence
and risk.

## Run the protocol

Read `references/integration-ledger.md` before dispatch. Instantiate its graph,
brief, topology, ledger, and conflict templates in the task or in a
user-approved artifact. Keep them current through final verification.

### 1. Inspect the real starting state

Read repository instructions and relevant specifications. Record:

- repository and target checkout;
- branch and exact base revision;
- staged, unstaged, and untracked state;
- user-owned or unrelated changes that must be preserved;
- applicable acceptance sources and validation commands;
- available worker, checkout, worktree, and integration mechanisms; and
- authority boundaries, including external services and side effects.

Inspect rather than infer this state. If an overlapping dirty path has uncertain
ownership, stop and name it.

### 2. Define the combined goal

Write one bounded goal and assign stable requirement identifiers to every
explicit acceptance criterion, safety boundary, and compatibility obligation.
Open one acceptance-ledger row for each identifier before dispatch.

Define the integration target and what evidence would prove the combined goal.
Requirements that disagree are unresolved decisions, not invitations to choose
silently.

### 3. Build the dependency graph

Split work only where each task has an independently reviewable outcome and a
clear evidence boundary. For every task, record its dependencies, produced
contracts, consumers, and planned integration order.

An implementation task is dispatchable only when every prerequisite contract
it needs is available and exact enough to implement against. Read-only research
may proceed while a prerequisite is missing; downstream implementation may not.
A worker reported as done without its prerequisite is `waiting_dependency` or
`blocked`, never complete.

Prefer fewer workers when coordination cost, shared-state risk, or integration
ambiguity exceeds the expected parallelism benefit.

### 4. Choose the checkout topology

Record one decision before dispatch:

**Use a shared checkout** when all concurrent work is read-only, when workers
are reviewing one mutating owner's short change, or when a tightly coordinated
short edit has one mutating owner. Multiple concurrent writers are exceptional:
allow them only with explicit non-overlapping path ownership, no shared generated
or service state, and a coordination rule that the integration owner records as
safe.

**Use isolated worktrees** when two or more tasks mutate concurrently, overlap
is possible or uncertain, work is long-running, rollback is likely, or each
contribution needs independent tests. Also prefer worktrees for migrations,
generated artifacts, shared schemas, or fixtures that may collide semantically.

Worktrees isolate files and Git state, not services, credentials, ports,
databases, caches, or external side effects. Assign separate shared-resource
namespaces or serialize those operations.

If neither topology gives a safe ownership boundary, revise the decomposition
or serialize the work.

### 5. Brief every worker

Issue a worker brief before starting it. Include:

- task identifier, outcome, and mapped requirement identifiers;
- owned files or modules where known, plus explicit exclusions;
- prerequisite tasks and the exact input contract or base revision;
- authorized mutations and forbidden external actions;
- topology, shared-resource constraints, and coordination expectations;
- validation commands and required evidence;
- Route Record: requested and effective route, role, context fork, inheritance,
  compatibility evidence, and fallback or blocker;
- report fields: changed paths, diff or revision, tests and results, assumptions,
  contract changes, blockers, and residual risks; and
- stop conditions for overlap, missing contracts, ambiguous requirements,
  validation failure, or newly required authority.

Require the worker to preserve unrelated changes, avoid broad reset or cleanup,
and adapt to valid adjacent work rather than reverting it.

### 6. Supervise from evidence

Maintain task states such as `planned`, `waiting_dependency`, `active`,
`blocked`, `ready_for_integration`, `integrated`, and `accepted`. Do not use a
worker's completion label as evidence.

Mark a task `ready_for_integration` only after inspecting its reported diff or
revision, validation output, dependency evidence, changed contracts, and known
risks. Confirm the effective route and execution envelope against the Route
Record. Reclassify stale or contradictory reports. Give blocked workers the
exact missing contract, decision, or authority boundary.

### 7. Preflight every integration

Immediately before applying a contribution:

1. Reinspect the target checkout's branch, revision, and dirty state.
2. Reinspect the worker state, diff, base, validations, and dependencies.
3. Confirm the paths to be changed do not overwrite unrelated or uncertain work.
4. Choose a bounded transfer mechanism whose effects can be inspected and whose
   authority has been granted.
5. Record a recovery boundary for integration-owned changes.

Never broad-reset, broad-stage, clean, or overwrite the target to make
integration easier. Preserve an unexpected state and stop for ownership
clarification.

### 8. Integrate in dependency order

Integrate upstream contracts before their consumers. For each contribution,
deliberately reconcile:

- public and internal contracts;
- migrations, ordering, and schema state;
- generated artifacts and their sources;
- fixtures, snapshots, and test helpers;
- configuration and dependency changes;
- downstream consumers and error handling; and
- tests that prove the worker's requirements.

After an upstream integration is safe, refresh or rebase dependent workers using
the authorized strategy and give them the exact integrated contract. Until then,
keep them waiting or state the blocker; do not let them invent the prerequisite.
Re-resolve model availability after a refresh or rebase when the runtime can
change between dispatch and integration. Update the Route Record before work
resumes.

### 9. Resolve semantic conflicts

Use the semantic conflict checklist for textual conflicts and for cleanly
applied changes that touch the same behavior. Identify each side's valid intent,
mapped requirements, invariants, and consumers before editing the resolution.

Preserve compatible behavior from both sides. If preserving one requirement
necessarily violates another, stop and surface the product or authority decision
with concrete options and impact. Never choose one worker's side merely because
it applied later or produces cleaner syntax.

After resolution, prove both sets of accepted behavior. Search for conflict
markers and inconsistent consumers, but treat those as hygiene checks rather
than semantic proof.

### 10. Prove the integrated result

Update every acceptance-ledger row with integrated locations and evidence from
the final combined state. A worker-local test is provenance, not final proof.

Run combined targeted tests and every applicable repository gate for the changed
scope, including type checks, builds, migration or schema checks, generated-file
checks, diff-whitespace checks, and specification or backlog checks. Record exact
commands, exit results, and material failures. Confirm all evidence describes
the same final revision, working-tree state, and recorded model routes.

Accept the task only when every requirement row is `accepted`, explicitly
superseded by an authorized decision, or reported as an unresolved blocker.

## Stop conditions

Stop dispatch or integration and request direction when:

- a prerequisite contract is absent or contradictory;
- dirty-work ownership overlaps or cannot be established;
- valid requirements conflict and need a product decision;
- a worker needs authority beyond its brief;
- combined validation cannot establish correctness;
- the target changed underneath an integration;
- shared services or side effects cannot be isolated safely; or
- continuing would modify user-owned work outside scope.

Preserve diffs, reports, and ledger state when stopped. Do not delete worktrees
or other recoverable evidence without explicit authorization.

## Output contract

Produce and maintain:

1. a bounded decomposition and dependency graph;
2. worker briefs with ownership, dependencies, authority, validation, and stop
   conditions;
3. one Route Record for each worker configuration;
4. a shared-checkout or worktree decision with rationale;
5. a live worker-status, acceptance, and integration ledger; and
6. a final integration report listing integrated items, requirement coverage,
   exact validation commands and results, blockers, residual risks, and actions
   requiring approval.

If integration cannot finish, make the same report blocker-first and identify
the exact unmet ledger rows. Never describe a merely conflict-free tree as a
verified combined result.
