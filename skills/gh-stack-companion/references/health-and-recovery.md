# Stack Health and Recovery

Use this guide after stack membership has been detected authoritatively. Confirm every proposed command against installed `gh stack <command> --help` before execution.

## Health states

| State | Meaning | Default response |
|---|---|---|
| `healthy` | Local and remote topology agree; no stale or conflicted layer | Report frontier and next review/merge action |
| `needs sync` | Stack is structurally sound but remote/base updates must be incorporated | Suggest `gh stack sync` with side effects |
| `needs upstack rebase` | A lower-layer edit must propagate through descendants | Checkout owning layer; suggest `gh stack rebase --upstack`, then push |
| `rebase in progress` | A prior sync/rebase stopped at conflicts | Resolve, stage, and continue; offer abort path |
| `divergent` | Local and remote topology disagree | Show both views; require intent before mutation |
| `remote-only` | GitHub knows the stack; local gh-stack does not | Inspect remotely; avoid local recovery claims |
| `local-only` | Local stack exists but has not been submitted or linked remotely | Report local topology and submission boundary |
| `unknown` | Authentication, command, or API evidence is missing | State the missing evidence |

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

## Merge frontier

Walk from position 1 upward. A layer extends the frontier only if it is already merged or currently ready. Stop at the first draft, wait, blocker, or unknown. Layers above the stop point are dependent even if independently green.

Merge bottom-up. Re-check after each merge because bases, checks, and mergeability may change. Official documentation has conflicting language about grouped merge atomicity; assume partial progress is possible and verify actual state.

