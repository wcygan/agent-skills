# Git Finalization

Load this reference only when the execution contract sets `commit_on_pass`.
It authorizes one local commit after terminal verification. It does not
authorize a push, pull request, merge, tag, release, deployment, or publication.

## Confirm the commit boundary

Before staging, confirm all conditions:

```text
terminal verification passed
current branch is the intended branch
HEAD matches the expected execution state
loop-owned paths are known
pre-existing changes remain identified
no unresolved overlap exists
```

Stop with `scope_conflict` when the branch or `HEAD` changed unexpectedly.
Reconcile only when the new state remains within the user's authority.

Treat a file with both user-owned and loop-owned edits as overlapping work.
Stop before staging when those edits cannot be separated with confidence. Ask
for direction instead of committing the complete file.

## Audit the candidate

Inspect the complete unstaged and staged state. Confirm that each loop-owned
change supports the deliverable or its proof. Preserve unrelated paths and
changes in place.

Run the final verification commands against the exact candidate that will be
committed. Record their commands, exit status, and relevant output.

## Stage exact scope

Stage only complete loop-owned paths whose contents contain no user-owned
changes. Use explicit paths rather than broad patterns. Then inspect:

```text
staged name-status
staged diff
remaining unstaged changes
untracked paths
```

Remove a path from the index when it exceeds the authorized scope. Leave its
working-tree contents unchanged. Stop when the staged candidate cannot be made
exact without changing user-owned work.

An empty staged set means `verified_no_change`. Do not create an empty commit.

## Create one local commit

Follow the repository's commit conventions. Prefer one concise conventional
commit for the verified deliverable. The subject must describe the behavior,
not the execution process.

Create one commit. Capture its SHA, complete subject, and committed path list.
Inspect the committed diff and confirm that it matches the staged candidate.

## Handle commit hooks and failures

A failed hook can supply verification evidence or change the candidate. Inspect
the index and worktree after every failed commit.

- Count a hook-reported candidate defect as a recovery failure.
- Treat an unavailable tool or external service as a Git finalization blocker.
- Re-run affected verification when a hook changes candidate content.
- Reinspect the staged diff before a commit retry.

Use the remaining execution recovery budget for candidate defects. Return
`retry_exhausted` when that budget ends. Return `commit_failed` when the
verified candidate remains valid but Git cannot create the authorized commit.

Do not bypass required hooks. Do not amend, create an extra commit, or rewrite
history unless the user grants that separate authority.

## Report final Git evidence

Return:

```text
commit SHA
complete commit subject
committed paths
final verification evidence
remaining user-owned worktree changes
push status: not attempted
```

Use `verified_committed` only after the commit exists and contains the verified
candidate. Report remaining unrelated work without including it in the commit.
