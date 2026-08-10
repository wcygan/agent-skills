---
name: sloppy-commit-push
description: Stages all repository changes, creates a concise Conventional Commit, and pushes the current branch. Use only when you explicitly want to commit and push the entire working tree.
license: MIT
---

# sloppy-commit-push

Run this skill only after the user explicitly invokes it. The invocation authorizes one commit that contains all current non-ignored changes and a push of the current branch to its configured upstream.

Keep the operation bounded:

- Use the current repository and current branch.
- Preserve normal Git hooks and server checks.
- Use one normal commit.
- Use `git push` without force options.
- Leave merge, rebase, cherry-pick, revert, bisect, detached-HEAD, and missing-upstream states for the user.

## Procedure

### 1. Check the repository

Run these commands from the repository root:

```bash
git rev-parse --show-toplevel
git status --short --branch
git branch --show-current
git remote -v
git rev-parse --abbrev-ref --symbolic-full-name '@{u}'
```

Proceed only when all of these conditions hold:

- The command target is a Git worktree.
- The branch name is non-empty.
- The branch has a configured upstream.
- No merge, rebase, cherry-pick, revert, or bisect is in progress.

Check operation state with `git status`. Stop and report the state when any condition fails.

Review the current changes before staging them:

```bash
git status --short
git diff --stat
git diff --cached --stat
```

If the worktree has no changes, report a no-op and stop. Do not create an empty commit.

### 2. Stage the complete change set

Stage all non-ignored changes from the repository root:

```bash
git add -A
git diff --cached --name-status
git diff --cached --stat
```

Treat the staged name-status output as the commit scope. Git does not stage ignored files. If the staged set is empty, report a no-op and stop.

### 3. Write the commit message

Read the staged diff with `git diff --cached`. Choose the type that best describes the dominant change:

| Type | Use for |
| --- | --- |
| `feat` | A new user-facing capability |
| `fix` | A bug correction |
| `docs` | Documentation only |
| `refactor` | Behavior-preserving code restructuring |
| `test` | Tests only |
| `build` | Build or dependency changes |
| `ci` | Continuous-integration changes |
| `chore` | Maintenance without a better specific type |

Use this Conventional Commits format:

```text
<type>[optional scope]: <short imperative summary>

<optional overview of the important changes>
```

Keep the subject specific, lower-case after the colon, and shorter than 72 characters when possible. Add `!` after the type or scope when the staged changes introduce a breaking change. Add a `BREAKING CHANGE: ...` footer when the breaking behavior needs detail.

Prefer one subject that summarizes the whole staged set. Use a short body when the subject alone does not explain the important changes.

Examples:

```text
feat(auth): add passkey sign-in

Store passkey credentials and expose the sign-in flow in the account screen.
```

```text
chore: refresh repository skills

Add the new skill and update the catalog entry.
```

### 4. Commit and push

Create the commit with the subject and body:

```bash
git commit -m "<subject>" -m "<overview>"
```

Capture the new commit SHA:

```bash
git rev-parse --short HEAD
```

Push the current branch to its configured upstream:

```bash
git push
```

Verify the result:

```bash
git status --short --branch
git log -1 --oneline
```

## Failure handling

- A failed preflight leaves the worktree unchanged.
- A failed hook leaves the changes staged. Report the hook output and stop.
- A failed push leaves the new commit local. Report its SHA and stop.
- Never amend, reset, force-push, retry a failed push blindly, or change remotes.

## Completion report

Report the commit SHA, complete commit subject, branch, upstream, push result, and final status. State the exact failure and next action when the operation stops early.
