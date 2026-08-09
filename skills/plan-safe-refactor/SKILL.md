---
name: plan-safe-refactor
description: Plan a staged, behavior-preserving refactor with explicit invariants, dependency seams, compatibility states, checkpoints, validation, rollback, and cleanup. Use when restructuring modules, extracting components, replacing implementations, moving ownership, decomposing a monolith, removing duplication, or changing architecture without intentionally changing externally visible behavior; separate mechanical and behavioral changes, keep each slice independently verifiable, and implement only when explicitly requested.
license: MIT
metadata:
  author: William Cygan
  version: "0.1.0"
---

# Plan a Safe Refactor

Design a sequence of small, independently verifiable transformations that
changes structure while preserving explicitly named behavior.

## Preserve the authority boundary

Treat requests to assess, plan, outline, or review a refactor as read-only. Do
not edit source, generated files, schemas, configuration, or tests unless the
user asks for implementation. Inspect repository instructions and dirty state
first, and preserve unrelated work.

Refactoring authority does not imply permission to update dependencies, change
public behavior, migrate production data, deploy mixed versions, commit, push,
or remove compatibility code. Identify those as separate decisions or phases.
Do not smuggle feature work or cleanup into a behavior-preserving request.

## Define the transformation

State:

- **Current structure:** ownership, responsibilities, dependencies, and
  operational boundary being changed.
- **Target structure:** desired ownership, interfaces, dependency direction,
  and lifecycle.
- **Reason:** demonstrated maintenance, testability, reliability, performance,
  or ownership problem.
- **Preserved behavior:** external and internal invariants that must remain
  stable.
- **Intentional changes:** any behavior that is allowed to differ.
- **Non-goals:** adjacent cleanup or redesign explicitly excluded.
- **Scope:** repositories, deployment units, contracts, persisted state, and
  environments.

If current and target states are vague, stop at an evidence-backed architecture
description and decision options. A refactor plan without a concrete target
usually becomes open-ended cleanup.

## Establish the baseline

1. Read repository instructions and identify authoritative source versus
   generated, vendored, or derived output.
2. Locate entrypoints, callers, implementations, runtime registration,
   contracts, state, tests, and operational surfaces affected by the move.
3. Reconstruct current behavior from executable evidence.
4. Identify weakly specified behavior that needs characterization before it
   moves.
5. Record current validation commands, representative scenarios, and known
   failures.
6. Label findings as observed, verified, declared, inferred, or unknown.

Use an existing change-impact analysis when available, but verify its scope and
current state. Do not equate direct text references with the complete blast
radius.

## Define invariants

Name the properties every intermediate state must preserve:

- inputs, outputs, errors, and side effects;
- ordering, idempotency, transactions, and concurrency behavior;
- API, event, file, and persisted-data compatibility;
- authentication, authorization, and trust boundaries;
- resource ownership, lifecycle, and cleanup;
- performance or capacity budgets that are part of the contract;
- deployment, startup, recovery, and rollback behavior; and
- observable signals relied on by users or operators.

Separate steady-state invariants from temporary compatibility obligations.
Read `references/invariants-and-checkpoints.md` for invariant categories,
baseline evidence, slice contracts, and rollback gates.

## Find a stable seam

Choose a boundary that allows old and new structures to coexist or be compared:

- existing interface, adapter, facade, or repository;
- function, module, service, process, or transport boundary;
- schema or contract that can be expanded compatibly;
- dependency-injection or registration point;
- routing or feature-selection boundary;
- test harness or characterization boundary; or
- new narrow seam introduced without changing behavior.

Prefer a seam already aligned with responsibility and runtime ownership. Avoid
creating a generic abstraction only to make the diagram symmetrical.

## Choose a transition strategy

Select the smallest strategy that fits the dependency and deployment shape:

- move then change;
- parallel change;
- branch by abstraction;
- facade or adapter;
- expand and contract;
- strangler or routing migration;
- shadow execution or dual comparison; or
- data or event compatibility transition.

Read `references/refactor-strategies.md` for selection criteria, transient
states, risks, and completion signals. Combine strategies only when different
boundaries require them.

## Build independently safe slices

Each slice must have this contract:

```text
Starting state:
Structural change:
Preserved invariants:
Temporary compatibility:
Validation:
Operational evidence:
Rollback:
Stop conditions:
Resulting state:
```

Order slices so each resulting state is buildable, testable, reviewable, and
safe to leave in place. Prefer:

1. strengthen characterization and observability;
2. introduce or expose the seam;
3. redirect one bounded behavior through the seam;
4. add the target implementation behind the unchanged contract;
5. migrate callers or ownership incrementally;
6. prove equivalence at the appropriate boundary;
7. make the target path authoritative;
8. remove old paths and temporary compatibility; and
9. verify final architecture and cleanup.

Not every refactor needs every step. Omit phases that add no safety.

## Separate mechanical and behavioral work

Keep moves, renames, formatting, generated updates, and dependency rewiring
separate from semantic changes when practical. A mechanical slice should make
review easy through stable behavior and narrow diffs.

When behavior must change, name it as a separate change with its own acceptance
criteria. Do not describe a rewrite as behavior-preserving when it changes
defaults, errors, ordering, performance guarantees, data shape, or operational
ownership.

## Account for mixed states

If components deploy or migrate independently, analyze:

- old callers with new implementation;
- new callers with old implementation;
- old and new data or event representations;
- queued work and long-running executions;
- rollback after the new form has written state;
- partial routing or dual execution;
- cache, projection, and generated-artifact drift; and
- ownership of temporary compatibility.

Do not require mixed-version machinery for an atomic local refactor. Do not
assume atomic rollout when repositories, processes, or persisted state change
independently.

## Validate the plan

Walk the plan forward and backward:

- every slice starts from the previous slice's supported state;
- each invariant has a named proof at the earliest relevant tier;
- the rollback path can interpret state created by the slice;
- compatibility code has a removal signal and owner;
- irreversible steps are isolated and explicit;
- generated and source-of-truth changes occur in the right order;
- the target removes rather than duplicates obsolete responsibility; and
- no phase depends on unimplemented future cleanup for correctness.

Reject a plan that is only a list of files to edit or a large final-state diff.

## Implement only when requested

When implementation is requested:

1. Execute one planned slice at a time.
2. Reinspect dirty state and current evidence before each slice.
3. Keep unrelated changes untouched.
4. Run the slice's focused validation and relevant broader guard.
5. Stop on invariant failure, scope drift, ambiguous state, or invalid rollback.
6. Report the resulting supported state before beginning the next slice.
7. Remove temporary scaffolding only after its exit criteria are proven.

Do not combine all slices merely because they fit in one coding session. A safe
checkpoint is valuable only when it can be independently understood and
verified.

## Report

Lead with the recommended seam and transition strategy. Then provide:

1. **Current and target structure:** responsibilities and dependency direction.
2. **Invariants and non-goals:** preserved, intentionally changed, and unknown.
3. **Impact and compatibility:** callers, contracts, state, deployments, and
   mixed-version obligations.
4. **Slice plan:** starting state, change, proof, rollback, stop condition, and
   resulting state for each slice.
5. **Temporary architecture:** adapters, flags, dual paths, or compatibility
   code with owners and removal signals.
6. **Final cleanup:** deletions, documentation, generated output, and
   architecture verification.
7. **Risks and unresolved decisions:** evidence or authority needed next.

## Examples

- Extract a subsystem behind its existing public contract, migrate callers,
  and remove the old implementation without a flag day.
- Replace an internal persistence adapter while preserving transaction,
  ordering, and error behavior.
- Move responsibility across services with compatible events and an explicit
  mixed-version window.
