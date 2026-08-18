# Stack Health and Recovery

Use this guide after stack membership has been detected authoritatively. Confirm every proposed command against installed `gh stack <command> --help` before execution.

## Health states

| State | Meaning | Default response |
|---|---|---|
| `healthy` | Local and remote topology agree; no stale or conflicted layer | Report frontier and next review/merge action |
| `needs sync` | Stack is structurally sound but remote/base updates must be incorporated | Suggest `gh stack sync` with side effects |
| `stale trunk` | Local or remote-tracking trunk differs from GitHub trunk | Report every revision; do not trust local rebase state |
| `needs upstack rebase` | A lower-layer edit must propagate through descendants | Checkout owning layer; suggest `gh stack rebase --upstack`, then push |
| `rebase in progress` | A prior sync/rebase stopped at conflicts | Resolve, stage, and continue; offer abort path |
| `divergent` | Local and remote topology disagree | Show both views; require intent before mutation |
| `remote-only` | GitHub knows the stack; local gh-stack does not | Inspect remotely; avoid local recovery claims |
| `local-only` | Local stack exists but has not been submitted or linked remotely | Report local topology and submission boundary |
| `unknown` | Authentication, command, or API evidence is missing | State the missing evidence |

## Authoritative remote snapshot

Use the GraphQL entry collection below. `PullRequest.stack` owns the stack, and `entries.nodes` owns its ordered members.

```graphql
pullRequest(number: $number) {
  stack {
    number
    size
    baseRefName
    entries(first: 100) {
      nodes {
        position
        pullRequest {
          number
          headRefName
          baseRefName
          state
          isDraft
        }
      }
    }
  }
  stackEntry { position }
}
```

Compare this snapshot with local stack metadata. Keep API failures as `unknown`; do not infer membership from PR descriptions.

## Recovery decision table

### A lower layer was edited

1. Identify the lowest layer that owns the correction.
2. Checkout that layer with the installed `gh stack checkout` syntax.
3. Recommend `gh stack rebase --upstack` to propagate the new ancestry.
4. Recommend the appropriate stack-aware push command.
5. Re-run `gh stack view --json` and remote GraphQL inspection.

Do not apply the correction independently to each descendant.

### Normal base drift or remote updates

Recommend `gh stack sync` only after describing that it may fetch, rebase, and push stack branches. Confirm the installed command's exact behavior and remote selection first.

### GitHub API works but Git transport stalls

Treat API access and Git transport as separate paths. A successful GraphQL read
does not prove that the configured fetch transport works.

1. Stop the stalled stack command within a declared timeout.
2. Confirm that no rebase, lock, branch, or remote-tracking ref changed.
3. Test the configured remote with a bounded `git ls-remote` call.
4. Test HTTPS only when SSH is the isolated failing path.
5. Apply any HTTPS rewrite and credential helper to one process only.
6. Re-run the stack command, then compare refs and stack metadata again.

Keep the repository remote and global Git configuration unchanged. Do not print
credential material. Use the authenticated GitHub CLI credential helper when it
is already available.

Example shape, not a copy-ready command:

```text
git -c url.<https-prefix>.insteadOf=<ssh-prefix> \
    -c credential.helper=<existing-authenticated-helper> \
    <stack command>
```

Label the retry with every side effect of the stack command. The temporary
transport override does not reduce its `HISTORY`, `REMOTE`, or `PR` effects.

### Local trunk evidence is stale

Compare three identities before publishing, syncing, or merging:

1. local trunk revision;
2. remote-tracking trunk revision; and
3. current GitHub trunk revision from the API.

A clean `gh stack view --json` result can coexist with stale local refs. Mark rebase health `unknown` or `stale trunk` until the identities are reconciled.

Recommend stack-aware sync only after approval. Label it `LOCAL`, `HISTORY`, and `REMOTE` when installed help confirms that it fetches, rebases, and pushes.

### Local stack metadata is stale but ancestry is exact

Use a metadata rebuild only when all tracked branches still exist and each
branch has the intended direct parent. Record every branch name and ref first.

1. Verify the worktree is clean and no rebase or stack process is active.
2. Record the trunk and ordered branch refs.
3. Run `gh stack unstack --local` after `--help` confirms local-only removal.
4. Run `gh stack init --base <trunk> <ordered-branches...>` with the exact chain.
5. Verify that branch refs and parent relationships did not change.
6. Verify that the rebuilt stack metadata records each current branch head.

Label this sequence `LOCAL`. It must not create branches, replay commits, push
refs, or contact GitHub. If `init` fails, keep the recorded refs and retry the
same exact chain. Do not edit the stack metadata file directly.

### Unpublished prerequisites sit below a local stack

Do not submit an implementation stack when its bottom branch includes prerequisite commits absent from GitHub trunk. The bottom PR would include those prerequisite diffs.

Use this bridge when the prerequisite commits form a reviewable linear chain:

1. Preserve the implementation branch refs and exact prerequisite boundaries.
2. Create one branch for each prerequisite layer after local branch authority is granted.
3. Use `gh stack link --base <trunk> --remote <remote> <branches...>` after remote and PR authority is granted.
4. Keep the prerequisite stack remote-only when local tracking already owns the implementation stack.
5. Merge the prerequisite stack before publishing the implementation stack.
6. Run an approved stack-aware sync afterward because squash merges replace the prerequisite commit identities.

`link` creates generated PR titles and bodies. Route presentation cleanup to `pr-guidelines` before review.

### A previous sync or rebase stopped at conflicts

1. Confirm a rebase is actually in progress.
2. Resolve one conflict at a time using the `resolving-merge-conflicts` skill when available.
3. Stage resolved files with `git add`.
4. Continue with the stack-aware rebase command shown by installed help.
5. If abandoning the attempt, use the stack-aware abort command; it should restore the stack operation rather than only one branch.

Never start a second routine rebase over an unresolved one.

### Local and remote topology diverge

Do not automatically sync or rebase. Present:

- local bottom-to-top branches and parents;
- remote PR numbers, positions, heads, and bases;
- the first mismatch;
- which evidence is newer when timestamps are available.

Ask the user which topology represents intent. Only then formulate a recovery plan.

### Multiple remotes

If more than one push-capable remote exists, require an explicit remote unless `remote.pushDefault` establishes the intended destination. Never assume `origin` in a mutating recommendation.

## Command safety labels

Attach one or more labels to every proposed mutation:

- `LOCAL`: changes checked-out branches or worktree state.
- `HISTORY`: rewrites commit ancestry.
- `REMOTE`: pushes or force-updates refs.
- `PR`: edits pull request metadata or state.
- `CI`: reruns or changes workflows.
- `MERGE`: merges one or more PRs.

Example:

```text
Suggested, not run [LOCAL, HISTORY, REMOTE]: gh stack sync ...
Why: the ultimate base advanced and all three layers must be rebased together.
Verify: gh stack view --json, then re-check remote stack entries and PR checks.
```

## CI topology

Stacked PRs can multiply CI because Actions may run for every PR. Observe before proposing optimization:

- which checks are required on every PR;
- whether an expensive suite is identical across positions;
- which workflows read stack number, size, position, base ref, or base SHA;
- whether repository policy permits a stack-wide or top-layer-only check.

Suggestions can include event-aware concurrency, caching, or running expensive validation once per stack. A health check must not edit `.github/workflows`.

## Atomic merge readiness

Read installed `gh stack merge --help` before each operational recommendation. Preview behavior can change.

For a direct grouped merge, declare eligibility only after checking:

- official stack number, size, positions, and selected merge set;
- every PR is open, not draft, and mergeable;
- required reviews and required checks are satisfied;
- the requested merge method is enabled;
- branch rules permit the operation; and
- the base branch does not route the stack through a merge queue.

When installed help promises all-or-nothing direct merge, atomicity applies to the selected PR set. Each PR can still produce its own merge or squash commit.

A merge queue changes the completion claim. The stack can enter the queue together and land in separate groups. Report `queued`, then verify every member independently.

Atomicity does not validate code. Report missing optional checks and unverified test claims even when GitHub permits the merge.

## Merge frontier

Walk from position 1 upward. A layer extends the frontier only if it is already merged or currently ready. Stop at the first draft, wait, blocker, or unknown. Layers above the stop point are dependent even if independently green.

For sequential merges, merge bottom-up and re-check after each layer. For an eligible atomic grouped merge, report the selected all-or-nothing set and verify every PR plus the final trunk revision afterward.
