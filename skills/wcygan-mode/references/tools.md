# Python tool usage

Requires Python 3.11+ on macOS or Linux. Repository observation requires Git;
GitHub operations require an authenticated `gh`. The scripts use only the
standard library, so nothing is installed and no environment is created.

Set `MODE_SCRIPTS` to this skill's absolute `scripts` directory and run a script
with `python3 -B`, which writes no bytecode into the installed skill:

```sh
MODE_SCRIPTS=/absolute/path/to/wcygan-mode/scripts
python3 -B "$MODE_SCRIPTS/watch_pr.py" --help
```

Activity evidence and outputs belong in task locations outside the installation.
Keep credentials out of arguments, because they end up in shell history.

## Observe pull requests

```sh
python3 -B "$MODE_SCRIPTS/watch_pr.py" --owner OWNER --repo REPO --pr 123 --status-only
python3 -B "$MODE_SCRIPTS/watch_pr.py" --owner OWNER --repo REPO --queued-stack --stack-prs 123,124 --timeout 1800
```

Without an explicit repository, `gh` resolves the current checkout. `--stack`
resolves a connected linear open stack; ambiguous branches require an explicit
queued list. `--queued-stack` captures its order once and waits for actual merges.
It does not merge or enqueue changes. `--status-only` reads once and returns 0
when queries succeed, even when the returned rows contain blockers.

Defaults: poll every 60 seconds, sweep queued stacks every 300 seconds, stop after
five consecutive query errors. `--timeout 0` disables the deadline; use a positive
budget for unattended runs. Retry delay starts at max(interval, 60), doubles,
and caps at 300 seconds. Queued sweeps resume at the PR whose read failed.

NDJSON is the default, with schema version, sequence, timestamp, mode, terminal
flag, and verdict. `--pretty` indents the same records. Unchanged wait records are
suppressed; whole-stack sweeps remain explicit observations. Exit codes:

| Code | Meaning |
| --- | --- |
| 0 | Ready, complete, or successful status-only query |
| 2 | Merge conflict |
| 3 | Unresolved review threads |
| 4 | Failed checks or hidden failing head rollup |
| 5 | Deadline reached |
| 6 | Draft, required review, requested changes, or closed without merge |
| 7 | Query failure or unavailable evidence |
| 64 | Invalid CLI usage |
| 130 | Interrupted |

Unknown mergeability waits; unknown API enum values or missing pagination data
are query failures. Empty checks from both query paths are unavailable evidence.
Configured bot and gate annotations never override readiness requirements.

Optional `--config FILE` accepts JSON lists `review_bots`, `review_gate_checks`,
and `automation_check_tokens`. All default empty; no particular bot is required.

## Audit worktrees

```sh
python3 -B "$MODE_SCRIPTS/audit_worktrees.py" /repo --base main --json
```

`--fetch` explicitly refreshes origin; the default uses current refs and reports
the base SHA. `--activity FILE` accepts an object mapping absolute worktree paths
to `{"active": false, "last_activity": "2026-10-14T12:00:00Z"}` records.
Activity evidence is supplied by the caller; no agent transcript locations are searched.

The primary or locked worktree, local edits including untracked files, an open PR,
or active ownership prevent candidacy. Unknown ownership and unavailable PR data
remain review cases. Squash-merged PRs without ancestor proof require equivalence
review. Candidates are suggestions for owner review; deleting one needs the
owner's explicit go-ahead. The tool reads only, so rerunning it is safe; it
implements no simulator inspection or deletion.
