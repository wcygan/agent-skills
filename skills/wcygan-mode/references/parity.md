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

## Principle catalog

The 24 standalone `principle-*` skills preserve Lauren Tan's Pstack names,
descriptions, and rules at revision `afd51cf66a3100a95f878d6c4b93a01f6508e3b0`.
This later source applies to the principles only; the playbooks and tools retain
their original revision. Each leaf records its own source and MIT notice.

Seventeen bodies are unchanged apart from the attribution footer. Seven have
only the following targeted adaptations:

| Principle | Local adaptation |
| --- | --- |
| Build the Lever | Delegation and commits preserve the executing environment's authorization; retain the lever even when committing is outside scope. |
| Explain the Number | Replace the unavailable benchmark-checklist dependency with inline matched-workload, repeated-run, raw-result, and actual-work checks. |
| Guard the Context Window | Make the routing rule explicit in the body; allow bounded local reads when delegation is unavailable or unauthorized. |
| Never Block on the Human | Proceed within authorized scope; preserve prior authorization and checkpoints rather than demanding repeated confirmation. |
| Prove It Works | Replace show-me-your-work with an inline decision log and evidence pointers; preserve commit authority. |
| Sequence Work into Verifiable Units | Use a known starting revision and preserve unrelated edits; do not implicitly rebase onto trunk. |
| Type System Discipline | Replace the unavailable TypeScript specialist dependency with language idioms; retain all original examples and type-design rules. |

All leaves use portable Agent Skills frontmatter with source metadata, omitting
Pstack's host-specific `disable-model-invocation` field. No aliases or synchronization
lock entries are added. Individual principles are usable without invoking a workflow;
cross-principle links supply optional context rather than missing implementation steps.

The [shared index](principles.md) is read by wcygan-mode and all nine procedural
entrypoints. It selects relevant leaves, preserves project contracts, and requires
each applied principle to be named together with the specific decision it changed.
The existing playbooks and components supply methods without duplicating the rules.
