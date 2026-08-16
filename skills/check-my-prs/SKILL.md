---
name: check-my-prs
description: Inspect the current GitHub pull request or stacked pull request as a read-only terminal dashboard, combining review threads, comments, CI, stack health, merge order, naming, visual proof, description quality, testing evidence, and split signals. Use when asked to check PR state, stack health, readiness, or what needs attention.
license: MIT
---

# Check My PRs

Produce one consistent, high-level health report for the current pull request or its entire stack. Default to the current checkout and read-only observation. Never change a branch, PR, review, check, workflow, or merge state merely to complete a check.

## Scope

Unless the user names another target, inspect the PR associated with the current branch. If that PR belongs to a stack, expand to the entire stack. Do not scan every PR in an account by default.

Use these specialist skills when available:

- `gh-stack` for installed CLI semantics and any explicitly authorized stack operation.
- `gh-stack-companion` for stack detection, topology, health, merge order, and recovery advice.
- `pr-guidelines` once per PR for presentation, testing evidence, reviewability, and split signals.
- `github-pr-media-proof` for visual-proof review, attachment handling, and authorized PR-body updates.
- `code-review` only when the user asks for a deep Standards and Spec review or passes equivalent intent such as `--deep`.
- `gh-address-comments` after the user asks to inspect or implement selected review feedback.
- `gh-fix-ci` after the user asks to diagnose failing GitHub Actions checks; require a separate approval before code changes.
- `monitor-until` only when the user explicitly asks to watch a state until a terminal condition.

If a named optional skill is unavailable, keep the inspection read-only and tell the user which follow-up capability is unavailable.

Treat this skill as the read-only router for PR follow-up work. Report the
smallest useful next action and name the specialist that owns it:

- Active review threads route to `gh-address-comments`.
- Failed GitHub Actions checks route to `gh-fix-ci`.
- Pending checks route to `monitor-until` only when the user asks to watch.
- Stack propagation or merge-order issues route to `gh-stack-companion`.
- Missing or weak visual proof routes to `github-pr-media-proof`.

Do not invoke a specialist's mutation path automatically. Preserve the
specialist's authority gate and ask the user to select comments or approve
implementation after diagnosis.

When the user authorizes new visual proof, route the work to `github-pr-media-proof`. That skill uses `playwright-cli` for browser capture.

## Workflow

### 1. Establish the target and evidence boundary

Resolve the repository, current branch, and current or explicitly named PR. Confirm GitHub authentication before interpreting missing data. Record partial failures instead of silently treating missing evidence as healthy.

Prefer the terminal inspector:

```bash
uv run scripts/check_my_prs.py
```

Useful modes:

```bash
uv run scripts/check_my_prs.py --pr 123
uv run scripts/check_my_prs.py --repo OWNER/REPO --pr 123
uv run scripts/check_my_prs.py --plain
uv run scripts/check_my_prs.py --json
uv run scripts/check_my_prs.py --deep
uv run scripts/check_my_prs.py --ai-generated
```

The script installs its pinned Python dependency into the normal `uv` cache. It does not modify the repository or GitHub state.

### 2. Detect stack membership from authoritative sources

Query GitHub GraphQL `PullRequest.stack` and `PullRequest.stackEntry`. Also run `gh stack view --json` when the installed CLI supports it.

Classify the result exactly:

| Remote GraphQL | Local gh-stack | Classification |
|---|---|---|
| present | present and matching | `tracked stack` |
| present | absent | `remote-only stack` |
| absent | present | `local-only / unsubmitted stack` |
| present | present but different | `stack divergence` |
| absent | absent | `unstacked PR` |

Do not infer a stack from branch names, PR body links, or a base branch that happens to be another feature branch.

### 3. Collect a normalized snapshot

For every PR in scope, collect:

- stack position, base, head, draft/open/merged state, mergeability, and review decision;
- unresolved and outdated review threads, review requests, issue comments, and review comments;
- all CI checks plus the required-check subset when GitHub exposes it;
- title, description, changed files, additions, deletions, and commits;
- description-guideline findings, naming findings, testing evidence, visual-proof status, and split signals;
- evidence gaps, pagination/truncation, unavailable fields, and command failures.

Treat unresolved active threads as attention unless repository rules prove they are a merge blocker. Never count outdated threads as active.

### 4. Delegate analysis, then integrate once

Run `pr-guidelines` against each PR snapshot. For observable behavior, apply the visual-proof standard and route missing evidence to `github-pr-media-proof`. In stack mode, run `gh-stack-companion` against local and remote topology. Do not ask specialists to produce competing final reports.

The parent report owns:

- the overall status;
- the bottom-to-top stack order;
- the merge frontier;
- the highest-priority next action;
- evidence gaps and unknowns.

Use the fixed report schema in [references/report-contract.md](references/report-contract.md). Load [references/official-github-docs.md](references/official-github-docs.md) when interpreting preview behavior, API fields, merge semantics, CI metadata, or command drift.

### 5. Gate each PR conservatively

Use one gate label:

- `MERGED`: already merged.
- `READY`: open, not draft, mergeable, required checks pass, and review requirements are satisfied.
- `WAITING`: no known failure, but required checks or reviews are pending.
- `BLOCKED`: changes requested, required checks failed/cancelled, merge conflict or rebase need, or a lower stack layer blocks it.
- `DRAFT`: draft PR.
- `UNKNOWN`: evidence is incomplete enough that readiness cannot be proven.

Queued checks are `WAITING`, not `BLOCKED`. Optional failing checks are warnings unless repository policy makes them required. A PR above an unready lower layer cannot be in the merge frontier even when its own checks are green.

### 6. Make AI-generated stacks easy to review

When AI generation is explicit, pass `--ai-generated` to the inspector and apply the AI path in `pr-guidelines`. Check that the stack was designed before generation, built bottom-up, and divided into coherent layers with their own proof boundaries. A correction belongs in the lowest layer that owns it; use `gh-stack-companion` to plan propagation upstack.

Keep this path practical: identify the first layer whose intent or evidence is unclear, name the exact human review needed, and avoid treating AI authorship itself as a defect. The canonical GitHub tutorials and their current merge caveat are indexed in [references/official-github-docs.md](references/official-github-docs.md).

### 7. Recommend; mutate only with a new authority gate

End with the smallest useful next action, prioritizing the bottommost stack blocker. Suggestions may include exact commands, but label their side effects and say they were not run.

If the user asks to act, restate the selected mutation and invoke the owning specialist. Do not treat the original health-check request as authorization to rebase, push, edit descriptions, resolve threads, rerun workflows, enable auto-merge, or merge.

## Completion criteria

A check is complete only when it reports:

1. the target and stack classification;
2. one normalized gate per PR;
3. active review attention and CI state;
4. stack health and merge frontier when stacked;
5. guideline and split findings;
6. the prioritized next action;
7. visual-proof status and every material evidence gap.
