# Integration ledger templates

Use these templates to keep decomposition, dispatch, integration, and acceptance
traceable. Keep identifiers stable throughout the task. Store the filled ledger
in task context unless the user approves a repository path.

## Dependency graph

Use before dispatch to prove tasks are independently reviewable, prerequisites
are available, and the planned integration order is valid.

```text
Combined goal:
Integration target:
Base revision:

Requirement sources:
- R-001: [acceptance criterion or safety boundary]

Tasks:
| Task | Outcome | Route Record | Requirements | Depends on | Consumes contract | Produces contract | Integration order |
|------|---------|-------------|--------------|------------|-------------------|-------------------|-------------------|
| T-01 |         |             | R-001        | none       | none              |                   | 1                 |

Edges:
T-01 -> T-02 because [exact prerequisite contract]

Dispatch gate:
- [task]: dispatchable | waiting_dependency | blocked — [evidence or missing input]
```

## Worker brief

Use once per worker before dispatch. It defines narrow ownership and the evidence
required before the contribution may enter integration.

```text
Worker / task:
Outcome:
Requirement IDs:

Ownership:
- Files or modules:
- Shared resources:
- Explicit exclusions:

Dependencies:
- Prerequisite tasks:
- Base revision:
- Exact input contract:

Authority:
- Authorized local mutations:
- External actions allowed:
- Actions requiring approval:

Topology and coordination:
- Checkout or worktree:
- Adjacent workers:
- Coordination rule:
- Preservation rule: preserve unrelated work; do not reset, clean, overwrite,
  or revert changes outside this brief.

Validation:
- Commands:
- Required evidence:

Route summary:
- Route Record ID:
- Status:
- Location or inline record:

Report:
- Changed paths and diff or revision
- Commands and results
- Effective route and execution envelope evidence
- Contract, migration, schema, fixture, or generated-artifact changes
- Assumptions, blockers, and residual risks

Stop when:
- ownership overlaps or changes unexpectedly;
- a prerequisite contract is missing or inconsistent;
- a requirement needs a product decision;
- validation cannot establish the outcome; or
- new authority is required.
```

## Checkout or worktree decision record

Use before mutating dispatch. It explains why the chosen topology safely bounds
file ownership and shared side effects.

```text
Decision: shared_checkout | isolated_worktrees | serialized
Tasks considered:
Mutating workers at the same time:
Known file overlap:
Possible semantic overlap:
Shared generated state:
Shared services / ports / databases / credentials / external effects:
Expected duration and rollback needs:
Independent validation needs:

Rationale:
Ownership boundaries:
Shared-resource isolation or serialization:
Transfer and integration mechanism:
Recovery boundary:
Revisit decision when:
```

Choose `shared_checkout` only for concurrent read-only work, one mutating owner,
or an explicitly justified non-overlapping exception. Choose
`isolated_worktrees` for concurrent mutation or uncertain overlap. Choose
`serialized` when neither topology isolates the real shared state.

## Acceptance and live integration ledger

Open the requirement table before dispatch and update it only from inspected
evidence. Use the task table to supervise dependencies and integration order.
Together they are the live status and integration ledger.

```text
Requirements:
| Req | Criterion / invariant | Owner task | Worker evidence | Integrated location | Combined validation | State / decision |
|-----|-----------------------|------------|-----------------|---------------------|---------------------|------------------|
| R-001 |                     | T-01       |                 |                     |                     | planned          |

Tasks:
| Task | State | Route Record | Dependency evidence | Diff / revision | Worker validation | Integration order | Integration evidence | Blocker / next action |
|------|-------|-------------|---------------------|-----------------|-------------------|-------------------|----------------------|-----------------------|
| T-01 | planned |             |                   |                 |                   | 1                 |                      |                       |

Allowed task states:
planned | waiting_dependency | active | blocked | ready_for_integration |
integrated | accepted

Authorized decisions:
| Decision | Conflicting requirements | Chosen behavior | Authority | Impact |
|----------|--------------------------|-----------------|-----------|--------|
```

A row reaches `accepted` only with evidence from the final combined state.
Record missing prerequisites as `waiting_dependency` or `blocked`, regardless of
the worker's completion label.

## Semantic conflict-resolution checklist

Use for every textual conflict and every semantic overlap involving shared
contracts, migrations, schemas, generated artifacts, fixtures, configuration,
or consumers.

```text
Conflict / overlap:
Contributions and base revisions:
Affected requirement IDs:

[ ] State side A's valid intended behavior and evidence.
[ ] State side B's valid intended behavior and evidence.
[ ] Identify shared contracts, invariants, safety boundaries, and consumers.
[ ] Identify ordering constraints for migrations, schemas, or generation.
[ ] Separate compatible behavior from genuinely conflicting requirements.
[ ] Preserve every compatible accepted behavior in the resolution.
[ ] Surface incompatible requirements for an authorized decision; record it.
[ ] Update dependent consumers, fixtures, generated outputs, and tests.
[ ] Run focused checks for each side's behavior on the integrated state.
[ ] Run applicable combined gates and conflict-marker / diff-whitespace checks.
[ ] Update requirement and task ledger rows with final evidence.

Resolution:
Preserved behavior from A:
Preserved behavior from B:
Authorized decision, if any:
Integrated validation:
Residual risk:
```

A syntactically clean resolution fails this checklist if it drops a valid
requirement, weakens a safety boundary, or leaves a consumer inconsistent.
