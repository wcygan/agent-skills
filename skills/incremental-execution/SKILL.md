---
name: incremental-execution
description: Run an explicitly requested, bounded software delivery loop from deliverable framing through current-state inspection, vertical implementation slices, and evidence-backed verification. Use for one scoped local change that should progress autonomously, preserve unrelated work, recover from verifier evidence, and optionally create an explicitly authorized Git commit.
license: MIT
metadata:
  author: William Cygan
  version: "0.1.0"
---

# Incremental Execution

Deliver one bounded local change through an evidence-driven execution loop.
Own the result from request framing through implementation and verification.
Produce a Git commit only when the user explicitly authorizes that commit.

## Route the request

Use this skill when the user requests autonomous implementation of one scoped
deliverable. An orchestrator may also assign one bounded worker deliverable.

Keep these nearby workflows separate:

- Use `design-bounded-loop` to design or audit a loop without running it.
- Use `design-verification-strategy` when the user wants only a proof plan.
- Use `verify-and-revise` for an existing artifact with a fixed rubric.
- Use `hill-climbing` for numeric keep-or-discard optimization experiments.
- Use `multi-agent-orchestration` to dispatch workers and integrate their work.

This skill has no required companion skill. It can consume an accepted plan or
verification strategy, but it owns one integrated execution result.

## Establish the execution contract

Read the request, repository instructions, and relevant accepted artifacts.
Then record this contract in task state:

```text
Deliverable claim:
Acceptance criteria:
Authorized mutable scope:
Forbidden scope:
Starting branch and revision:
Existing worktree changes:
Authoritative evidence sources:
Final verification:
Recovery budget: 3
Plateau threshold: 2 matching failure fingerprints
State location: task_only | approved_path
Commit policy: prohibited | commit_on_pass
External effects:
```

State the deliverable as an observable claim. Each acceptance criterion must
name evidence that can distinguish pass from fail.

Infer low-risk implementation details from repository evidence. Stop for a
decision when an unknown changes the deliverable, authority, oracle, or an
external effect. Treat missing commit instructions as `prohibited`.

The execution request authorizes only the local mutations needed for the stated
deliverable. It does not authorize pushes, pull requests, deployments,
publication, messages, production access, secrets, or unrelated cleanup.

## Preserve the starting state

Inspect the current branch, revision, worktree, and relevant runtime state
before editing. Treat every pre-existing change as user-owned. Record overlaps
between those changes and the authorized mutable scope.

Use one writer for each mutable boundary. Stop with `scope_conflict` when a
user edit overlaps loop-owned work and safe separation is unclear. Never use a
broad reset, checkout, clean, stash, or rollback as loop recovery.

Keep the execution ledger in task state by default:

```text
contract | baseline | evidence matrix | slice plan | current slice
changed paths | recovery attempts | budget | decisions | final status
```

Write this ledger to disk only at a user-approved path. The ledger is evidence
for continuation, not a project artifact by default.

## Establish the baseline and proof

Inspect current behavior, code paths, tests, task runners, and validation
surfaces that bear on the claim. Run the smallest safe checks needed to
distinguish pre-existing failures from loop-introduced failures.

Build a requirement-to-evidence matrix before implementation:

```text
criterion | authoritative oracle | baseline | focused check | final check
```

Use direct evidence for each claim. A type check does not prove runtime
behavior. A unit test does not prove packaged or user-visible behavior. Label
an unavailable proof tier instead of substituting a weaker check silently.

Keep acceptance meaning stable during execution. Refine an oracle only when
new evidence shows that it cannot evaluate the original claim. Record the
reason and preserve or strengthen the original proof obligation.

## Plan vertical slices

Plan the smallest finite sequence of coherent slices that can deliver the
claim. Each slice must state:

```text
observable outcome | owned paths | preserved constraints | focused verifier
```

Prefer vertical slices that connect behavior with its evidence. Avoid separate
phases for all tests, all implementation, or unrelated cleanup. Order slices
by dependencies and risk. Mark a slice complete only after its verifier passes.

An accepted external plan may supply the slices. Reconcile it with the current
repository state before implementation. Update only the remaining plan when
new evidence invalidates an assumption.

## Execute one slice

For each slice:

1. Confirm that its scope still matches the execution contract.
2. Implement the smallest coherent change that produces its outcome.
3. Run the focused verifier against the changed candidate.
4. Record the changed paths, evidence, and decision.
5. Continue only after the slice has passing evidence.

Keep unrelated refactors and speculative improvements outside the slice. Add
or update tests when behavior changes. Follow the repository's established
interfaces, error handling, and validation commands.

## Recover from verifier evidence

A recovery cycle begins when a check expected to pass produces new failure
evidence. Intentional test-first red checks and known unrelated baseline
failures do not consume the recovery budget.

Record every recovery attempt:

```text
attempt | failed criterion | evidence fingerprint | failure class
hypothesis | smallest corrective action | result | remaining budget
```

Classify the failure before acting:

- `implementation_defect`: Correct the smallest supported implementation area.
- `plan_defect`: Replan only the unfinished slices.
- `baseline_conflict`: Separate existing failure evidence from the candidate.
- `oracle_defect`: Repair or replace only an equivalent faulty verifier.
- `authority_blocker`: Stop before expanding scope or side effects.
- `external_blocker`: Stop when local action cannot resolve the dependency.
- `scope_conflict`: Stop when ownership cannot be separated safely.
- `plateau`: Stop when evidence repeats without a new supported hypothesis.

After a correctable failure, re-observe only the affected state. Update the
current model and remaining plan with the new evidence. Then make one coherent
correction and verify again.

Use three recovery cycles for the complete invocation unless the user sets a
different finite budget. Stop earlier after two matching failure fingerprints,
loss of the oracle, new authority needs, overlap, or terminal failure.

Budget exhaustion means `retry_exhausted`, never success. Preserve the current
candidate and ledger. Report the smallest decision or evidence needed next.

## Verify the integrated deliverable

After all slices pass, verify the complete candidate against every acceptance
criterion. Run the required focused, repository-wide, integrated, packaged,
or user-visible checks named in the evidence matrix.

Inspect the final diff and confirm:

- every changed path belongs to the authorized scope;
- every change contributes to the deliverable or its proof;
- unrelated user work remains present and unstaged;
- no acceptance criterion lost its evidence; and
- residual failures are classified against the baseline.

Do not declare success when required proof is unavailable. Use `blocked` or
`verification_failed` and state the missing evidence.

## Finalize Git only when authorized

If the commit policy is `prohibited`, return `verified_uncommitted` after the
final checks pass. Return `verified_no_change` when the starting state already
satisfies the claim and no loop-owned change exists.

If the commit policy is `commit_on_pass`, read
`references/git-finalization.md` completely before staging. That reference
owns staged-scope inspection, commit-hook handling, and final Git evidence.

Commit failure does not erase verification evidence. Return `commit_failed`
with the verified candidate state and exact Git failure. A commit does not
authorize a push or any later publication action.

## Report the execution result

Return exactly one status:

```text
verified_committed | verified_uncommitted | verified_no_change
verification_failed | retry_exhausted | blocked | scope_conflict
commit_failed
```

Report:

```text
Status:
Deliverable and acceptance claim:
Starting branch and revision:
Authorized scope:
Baseline evidence:
Completed slices:
Changed paths:
Recovery ledger:
Final verification evidence:
Commit SHA and subject, if any:
Residual gaps:
Smallest next action:
```

On success, lead with the verified outcome. On any stop, distinguish incomplete
implementation from unavailable proof, exhausted recovery, and Git failure.

## Examples

```text
Use incremental-execution to implement the accepted endpoint plan. Commit only
after the focused tests and integration scenario pass.
```

```text
Complete this bounded worker assignment. Preserve unrelated work, do not
commit, and stop after three failed recovery cycles.
```

```text
Implement the configuration change and verify the packaged application. Return
the exact evidence for every acceptance criterion.
```

## Counterexamples

- “Plan how to verify this migration” is a verification-design request.
- “Improve latency until the metric plateaus” is numeric hill climbing.
- “Keep improving the whole project” has no bounded deliverable or terminal
  oracle; establish those before execution.
