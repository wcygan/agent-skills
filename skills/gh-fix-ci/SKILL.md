---
name: "gh-fix-ci"
description: "Diagnose or fix failing GitHub Actions checks on a PR. Use when investigating CI failures or implementing their repair."
license: Apache-2.0
metadata:
  maintenance: "local"
  upstream-repository: "https://github.com/openai/skills.git"
  upstream-skill: "skills/.curated/gh-fix-ci"
  upstream-revision: "49f948faa9258a0c61caceaf225e179651397431"
  upstream-license: "Apache-2.0"
---


# Diagnose and fix GitHub Actions checks

## Overview

Use gh to locate failing PR checks and retrieve actionable GitHub Actions logs. For a diagnosis-only request, report the cause and proposed repair. A request to fix CI authorizes the corresponding local changes; continue from diagnosis through repair without another routine approval step.

Prereq: authenticate with the standard GitHub CLI once (for example, run `gh auth login`), then confirm with `gh auth status` (repo + workflow scopes are typically required).

## Inputs

- `repo`: path inside the repo (default `.`)
- `pr`: PR number or URL (optional; defaults to current branch PR)
- `gh` authentication for the repo host

## Quick start

- `python "<path-to-skill>/scripts/inspect_pr_checks.py" --repo "." --pr "<number-or-url>"`
- Add `--json` if you want machine-friendly output for summarization.

## Workflow

1. Verify gh authentication.
   - Run `gh auth status` in the repo.
   - If unauthenticated, ask the user to run `gh auth login` (ensuring repo + workflow scopes) before proceeding.
2. Resolve the PR.
   - Prefer the current branch PR: `gh pr view --json number,url`.
   - If the user provides a PR number or URL, use that directly.
3. Inspect failing checks (GitHub Actions only).
   - Preferred: run the bundled script (handles gh field drift and job-log fallbacks):
     - `python "<path-to-skill>/scripts/inspect_pr_checks.py" --repo "." --pr "<number-or-url>"`
     - Add `--json` for machine-friendly output.
   - Manual fallback:
     - `gh pr checks <pr> --json name,state,bucket,link,startedAt,completedAt,workflow`
       - If a field is rejected, rerun with the available fields reported by `gh`.
     - For each failing check, extract the run id from `detailsUrl` and run:
       - `gh run view <run_id> --json name,workflowName,conclusion,status,url,event,headBranch,headSha`
       - `gh run view <run_id> --log`
     - If the run log says it is still in progress, fetch job logs directly:
       - `gh api "/repos/<owner>/<repo>/actions/jobs/<job_id>/logs" > "<path>"`
4. Scope non-GitHub Actions checks.
   - If `detailsUrl` is not a GitHub Actions run, label it as external and only report the URL.
   - Do not attempt Buildkite or other providers; keep the workflow lean.
5. Summarize failures for the user.
   - Provide the failing check name, run URL (if any), and a concise log snippet.
   - Call out missing logs explicitly.
6. Repair within the requested scope.
   - Identify the cause before editing. Implement the relevant fix when authorized; ask only about missing decisions or actions beyond that scope. A separate planning skill is optional.
7. Verify and report.
   - Run focused checks appropriate to the repair, respecting the user's testing constraints. Inspect remote check status when useful, and distinguish local evidence from a new CI run: an unchanged remote run cannot validate a local fix.
   - Report the cause, changes, checks performed, and remaining failures or unavailable evidence. Pushes, remote reruns, and PR creation follow the user's authorization.

## Bundled Resources

### scripts/inspect_pr_checks.py

Fetch failing PR checks, pull GitHub Actions logs, and extract a failure snippet. Exits non-zero when failures remain so it can be used in automation.

Usage examples:
- `python "<path-to-skill>/scripts/inspect_pr_checks.py" --repo "." --pr "123"`
- `python "<path-to-skill>/scripts/inspect_pr_checks.py" --repo "." --pr "https://github.com/org/repo/pull/123" --json`
- `python "<path-to-skill>/scripts/inspect_pr_checks.py" --repo "." --max-lines 200 --context 40`
