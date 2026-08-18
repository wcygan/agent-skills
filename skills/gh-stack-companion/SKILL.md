---
name: gh-stack-companion
description: Assess and explain local and remote gh-stack health, topology, trunk freshness, atomic merge readiness, synchronization, rebase needs, recovery, CI shape, and safe next commands. Use when a stacked pull request may be stale, divergent, conflicted, misordered, ready to merge, or difficult to navigate.
license: MIT
---

# gh-stack Companion

Make stacked pull requests easy to understand and recover without duplicating the `gh-stack` command manual. Use `gh-stack` as the source of truth for installed command behavior. This skill owns the personal policy layer: topology, reconciliation, health, merge frontier, and safe recovery advice.

Default to read-only observation. A health check does not authorize fetch, rebase, force-push, PR edits, CI changes, auto-merge, or merge.

## Inputs

Accept either a normalized snapshot from `check-my-prs` or collect:

- local topology from `gh stack view --json`;
- remote topology from GitHub GraphQL `PullRequest.stack` and `stackEntry`;
- local, remote-tracking, and GitHub trunk revisions when publishing, syncing, or merging;
- each PR's base/head, state, mergeability, review decision, and checks;
- repository merge methods, branch rules, and merge queue state before a merge;
- repository remotes and `remote.pushDefault` when commands may later be proposed;
- installed help for every proposed `gh stack` command.

Do not infer official GH Stack membership from naming or linked PR descriptions.

## Health model

Classify membership as `tracked`, `remote-only`, `local-only / unsubmitted`, `divergent`, or `unstacked`. Then evaluate:

1. **Topology:** layers are linear, positions and parents agree, and the ultimate base is correct.
2. **Trunk freshness:** local, remote-tracking, and GitHub trunk revisions are compared explicitly.
3. **Local synchronization:** local branches and recorded stack metadata agree.
4. **Remote synchronization:** remote entries, bases, heads, and positions agree with local intent.
5. **Rebase health:** no layer is behind or conflicted in a way that invalidates descendants.
6. **Review and CI health:** the bottommost unmet requirement is explicit.
7. **Merge frontier:** the highest contiguous layer from the bottom that is merged or ready.

A green upper PR is not actionable when a lower layer blocks it. Always prioritize the lowest unhealthy layer.

Load [references/health-and-recovery.md](references/health-and-recovery.md) whenever trunk freshness, a rebase, conflict, divergence, remote ambiguity, CI topology, merge eligibility, or a merge sequence is involved.

## Procedure

### 1. Observe without mutation

Run read-only commands first. If the CLI is missing, unauthenticated, or lacks stack commands, report `UNKNOWN` instead of inventing topology.

Before suggesting an exact command, run:

```bash
gh stack <command> --help
```

Preview command flags can drift. Installed help outranks remembered flags.

### 2. Reconcile local and remote truth

Compare stable identities rather than display text:

- repository owner/name;
- PR number;
- head branch;
- base branch;
- stack position and size;
- local trunk revision;
- remote-tracking trunk revision; and
- current GitHub trunk revision.

If stack topology disagrees, report `stack divergence`. If only trunk identities differ, report `stale trunk`. Explain both views before recommending recovery.

Treat `needsRebase=false` as local evidence only. It does not prove that the local or remote-tracking trunk is current.

### 3. Locate the first unhealthy layer

Walk bottom to top. For each layer, report:

- its parent and position;
- merge/rebase state;
- required CI state;
- review state;
- whether descendants inherit its problem.

Compute the merge frontier only across contiguous ready or merged layers. Keep merge eligibility separate from review readiness.

### 4. Assess the merge mode

For a grouped merge, inspect installed `merge` help, official stack membership, every PR gate, repository merge methods, branch rules, and merge queue state.

When installed help defines direct grouped merge as all-or-nothing, report that transactional guarantee for the selected PR set. Atomicity concerns the set, not the number of resulting commits. A merge queue can accept the stack together while landing members separately.

Missing optional checks are an evidence gap, not a tool-enforced blocker. Never describe atomic merge as proof that validation passed.

### 5. Recommend the narrow recovery path

Use the decision table in the recovery reference. Prefer stack-aware operations to routine plain `git rebase`, because the stack tool owns descendant propagation and metadata.

Every command recommendation must include:

- why it applies;
- the branch or stack it targets;
- whether it fetches, rebases, pushes, force-updates, edits PR metadata, or merges;
- that it has not been run;
- the verification command to run afterward.

### 6. Explain CI shape

GitHub evaluates stacked PRs relative to the ultimate base while Actions may run once per PR. Call out redundant work, but never edit workflows during a health check. Suggestions may include using stack event metadata to run expensive suites once per stack or only at selected positions, subject to repository policy.

## Output

Return a compact section suitable for a parent terminal report:

```text
STACK  tracked · 3 layers · frontier #142 (2/3)
  1  #141 READY    schema foundation
  2  #142 READY    service integration
  3  #143 BLOCKED  UI · required check failing

HEALTH  topology ✓  sync ✓  rebase ✓  CI !
MERGE   direct atomic · squash · 2/3 eligible
NEXT    Fix required check on #143.
```

When unhealthy, include one recovery plan and its side effects. When evidence is incomplete, say what could not be established.
