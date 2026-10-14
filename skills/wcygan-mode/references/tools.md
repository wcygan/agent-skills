# Python tool usage

Requires uv and Python 3.11+ on macOS or Linux. Repository observation requires
Git; GitHub operations require an authenticated `gh`. All implementation is
Python with standard-library dependencies. No global package installation is needed.

## Run without changing the installed skill

Set `MODE_SCRIPTS` to this skill's absolute `scripts` directory. Keep the uv
project environment outside installed skills and disable Python bytecode writes:

```sh
export MODE_SCRIPTS=/absolute/path/to/wcygan-mode/scripts
export UV_PROJECT_ENVIRONMENT="${XDG_CACHE_HOME:-$HOME/.cache}/wcygan-mode/venv"
export PYTHONDONTWRITEBYTECODE=1
uv run --locked --project "$MODE_SCRIPTS" python -B "$MODE_SCRIPTS/orchestrate.py" --help
```

Use that same command prefix for the other entrypoints. uv owns its cache and the
external environment. Store data, activity evidence, and outputs belong in task
locations outside the installation. Never put credentials in arguments or records.
The Python entrypoints also disable bytecode before importing their local modules.

## Orchestration store

```sh
uv run --locked --project "$MODE_SCRIPTS" python -B "$MODE_SCRIPTS/orchestrate.py" --store /task/state init
uv run --locked --project "$MODE_SCRIPTS" python -B "$MODE_SCRIPTS/orchestrate.py" --store /task/state unit add export --track backend --brief /task/export.md
uv run --locked --project "$MODE_SCRIPTS" python -B "$MODE_SCRIPTS/orchestrate.py" --store /task/state --json status
```

`--store` also accepts `ORCH_STORE`. Put global options before the command.
The command families retain upstream operations:

- `unit add/set/get/list/counts`: bounded work and its state, branch, PR, SHA, brief.
- `ledger record/check/summary`: verdicts keyed by PR and full commit SHA, with
  evidence, verifier, and timestamp. Updating a key replaces its current verdict.
- `inbox push/drain/count`: completion pointers; `drain --peek` is observational.
- `gate park/list/resolve`: explicit decision gates. A default records a proposal;
  it is not automatic permission or an automatic resolution.
- `standing add/show`: durable instructions.
- `frontier set/show`: the PR base chain ending at the current repository branch.
  `set --repo DIR --prs 1,2` optionally checks an expected order; `ORCH_REPO` is supported.
- `status`: derive `status.md` from the current records.

Run each command with `--help` for arguments. `--json` returns full JSON;
otherwise output is indented JSON. Exit codes are 0 success, 1 invalid request,
invalid state, or operation failure, and 2 missing record.

Storage uses TSV units/ledger and JSON inbox/gates/standing/frontier, plus a
rendered Markdown status. This is a new store format; it does not import an
upstream store automatically. Back up old state before manual migration.

Stores are single-host. A persistent OS lock prevents concurrent writers and is
released automatically on process exit. Stale metadata from the same host is
harmless; foreign or malformed ownership is rejected. `--force` is retained for
argument compatibility but cannot steal a live or uncertain lock. Do not share
one store over a filesystem whose lock guarantees are unknown.

Draining validates all pending pointers, writes a durable copy under `drains/`,
then clears the inbox atomically. Recovery copies survive successful drains too.
After a crash, inspect the latest copies and deduplicate by the complete pointer
before replaying; a crash between copy and clear can deliver a pointer twice.
Consumers must reconcile artifact identity before applying results.

## Observe pull requests

```sh
uv run --locked --project "$MODE_SCRIPTS" python -B "$MODE_SCRIPTS/watch_pr.py" --owner OWNER --repo REPO --pr 123 --status-only
uv run --locked --project "$MODE_SCRIPTS" python -B "$MODE_SCRIPTS/watch_pr.py" --owner OWNER --repo REPO --queued-stack --stack-prs 123,124 --timeout 1800
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

## Validate a plan

```sh
uv run --locked --project "$MODE_SCRIPTS" python -B "$MODE_SCRIPTS/check_plan.py" /task/plan.md --json
```

Follow [plan format](plan-format.md). Returns 0 valid, 1 invalid, 2 unreadable file.
A valid plan still needs semantic review and actual verification evidence.

## Audit worktrees

```sh
uv run --locked --project "$MODE_SCRIPTS" python -B "$MODE_SCRIPTS/audit_worktrees.py" /repo --base main --json
```

`--fetch` explicitly refreshes origin; the default uses current refs and reports
the base SHA. `--activity FILE` accepts an object mapping absolute worktree paths
to `{"active": false, "last_activity": "2026-10-14T12:00:00Z"}` records.
Activity evidence is supplied by the caller; no agent transcript locations are searched.

The primary or locked worktree, local edits including untracked files, an open PR,
or active ownership prevent candidacy. Unknown ownership and unavailable PR data
remain review cases. Squash-merged PRs without ancestor proof require equivalence
review. Candidates are suggestions for owner review, never deletion authorization.
No simulator inspection or deletion is implemented by this tool.
