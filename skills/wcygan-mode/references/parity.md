# Upstream behavior and port decisions

Source: Lauren Tan's pstack 0.15.24 at
`1e5c90a4b6f249917bd21fe361b3a2a7deb741b8`, MIT licensed. The relevant upstream
root is `pstack/skills/poteto-mode/`. This is functional adaptation, not binary,
store-format, or exact JSON-schema compatibility with the upstream tools.

## Script capability matrix

| Upstream source / capability | Python location | Treatment |
| --- | --- | --- |
| `orch/orch.ts`: init, unit add/set/get/list/counts | `orchestrate.py`, `mode_tools/store.py` | Preserved, with the same command families and unit fields. |
| Ledger record/check/summary, keyed PR and SHA | Same | Preserved, including replacement of a matching key, timestamps, evidence, verifier, and upstream verdict names. Adds `behavior-verified` for non-UI runtime proof. Full SHAs are required. |
| Inbox push, peek, count, drain | Same | Preserved with durable recovery copies; drain is at-least-once after a crash, never silently destructive. |
| Gate park/list/resolve; standing instructions | Same | Preserved as JSON records; a parked default is never automatically applied. |
| Frontier resolution, generation, optional order pin | Same, `mode_tools/github.py` | Preserved for GitHub base chains ending at the current branch. Ambiguous chains fail; Origin CLI support is removed. |
| Derived status and full JSON output | `orchestrate.py` | Preserved fields; compact output is generalized to indented JSON. `status.md` remains derived. |
| Store serialization and validation | `mode_tools/store.py` | TSV units/ledger retained; inbox, gates, and standing records use JSON. No automatic migration from an upstream store. Malformed state fails explicitly. |
| Atomic writes, PID locks, stale recovery, `--force` | Same | Atomic replacement retained. Single-host OS locks replace PID ownership races. Live or uncertain locks cannot be stolen, even with `--force`. |
| Orchestration exit codes | `orchestrate.py` | Preserved: 0 success, 1 invalid request/failure, 2 missing record. Global options precede subcommands. |
| `watch-pr/cli.ts`: explicit context, current PR, stack, frozen queue | `watch_pr.py`, `mode_tools/github.py` | Preserved. GitHub repository context comes from explicit arguments or `gh`; branching stacks need an explicit queue. |
| Status-only observation | `watch_pr.py` | Preserved: one observation, no polling, exit 0 if queries succeed even when blockers are present. |
| Fast check lookup and GraphQL fallback | `mode_tools/github.py` | Preserved, including empty fast-path fallback and unavailable-evidence errors if both paths are empty. |
| Paginated checks, review threads, commits and PR discovery | Same | Preserved, with cursor advancement and page metadata validation. Unknown check types fail explicitly. |
| Review bot pass counts and review gate identification | Same | Generalized to optional bot/check-name lists; no required named bot. Raw findings remain available. |
| Head rollup and prior passing CI | `mode_tools/watcher.py` | Preserved, including a hidden failing head rollup overriding an apparently clean visible check list. |
| Conflict / thread / CI / gate priority across stacks | Same | Preserved as tier-major decisions. An upper conflict outranks lower pending checks. |
| Draft and requested-change gates | Same | Preserved. Required reviews also block; unknown mergeability or unsettled merge state waits rather than claiming readiness. |
| Pending attribution and queue frontier | Same | Preserved: ordinary waits name the actual pending PR; queued waits name the lowest unmerged member. |
| Whole-stack sweeps and interrupted reads | Same | Preserved: resume at a failed PR, publish a sweep only after all its observations succeed. |
| Queue advancement and completion | Same | Preserved: advance immediately after confirmed merge; a ready PR is never counted as merged. |
| Polling, deadline, error budget, exponential backoff | Same | Preserved defaults, with sleep capped by the remaining deadline. Each external command also has a 60-second timeout. |
| Wait deduplication, progress/terminal records, NDJSON | Same | Preserved event concepts, envelope fields and exit codes. Some nested payloads are simplified; queued completion lists PR numbers, and timeout uses a generic deadline reason. |
| Human rendering | `watch_pr.py` | Generalized to indented JSON from the same records, replacing the upstream Markdown renderer. |
| `check-plan.mjs`: Markdown recognition and verification gates | `check_plan.py` | Generalized to the documented plan contract: required sections and unit fields, dependencies, cycles, completion evidence, and correctly ignored fenced examples. |
| Exact prose, punctuation, ten lanes, mandatory performance boxes | Same | Removed. Performance criteria are task-specific; structure checks do not pretend to judge evidence quality. |
| `worktree-audit.sh`: size, age, merge, dirty, remote, PR state | `audit_worktrees.py` | Preserved observational intent, with robust path handling and explicit incomplete evidence. No deletion. |
| Default base and fetch | Same | Base SHA is reported; fetch is opt-in through `--fetch`, so default audit does not update refs. |
| Workspace transcript search | Same | Replaced with explicitly supplied activity/ownership JSON; no harness path assumptions. |
| Cleanup buckets | Same | Generalized conservatively. Untracked work, unknown ownership, closed PRs, or age do not imply safety; squash equivalence needs review. |
| `bootstrap.ts`, Bun launcher, package manifest and lock | Python uv project and `uv.lock` | Replaced with dependency-free uv execution and an external environment. No runtime installation into the skill directory. |
| TypeScript interfaces and compile-only assertions | Python validation boundaries and tests | Replaced with runtime input checks and behavioral tests. No TypeScript compiler dependency. |
| Upstream unit tests and fake clock/reader helpers | `scripts/tests/` | Adapted to standard-library unittest, controlled readers/clocks, subprocess locking checks, and temporary Git repositories. |

These tools do not spawn agents, create schedules, merge changes, or delete
worktrees. Those operations remain explicit steps in the appropriate playbook
using capabilities actually available to the executing environment.

## Playbook mapping

All 23 source playbooks have Markdown equivalents. Unlisted names are preserved.

| Upstream filename | Generic filename |
| --- | --- |
| `babysit.md` | `monitor-change.md` |
| `hillclimb.md` | `iterative-optimization.md` |
| `orchestrate.md` | `coordinate-program.md` |
| `autopilot-full.md` | `execute-independent-changes.md` |
| `autopilot-stack.md` | `prepare-dependent-changes.md` |
| `opening-a-pr.md` | `propose-change.md` |

Read-only diagnosis, planning-only requests, explicit pause, preparation for a
separate landing owner, and actual publication are distinct contracts. Fixed
model rosters, cloud-machine assumptions, blind hard resets, implicit external
messages, and automatic PR creation are removed. The existing procedures supply
reusable phase logic; playbooks supply task-specific order and completion gates.
