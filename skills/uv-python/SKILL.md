---
name: uv-python
description: "Develop and troubleshoot Python projects with uv: uv add, uv lock, uv sync, uv run, uvx, pyproject.toml, inline script metadata, Python version pinning, and migration from pip or Poetry. Use for uv workflows, dependency or lockfile problems, scripts, tools, or adopting uv."
license: MIT
compatibility: Requires uv. Verify version-sensitive flags against the installed command.
metadata:
  author: William Cygan
  version: "0.1.0"
---

# Use Python with uv

Choose the smallest uv surface that owns the work. Preserve existing project
conventions unless the user requests a migration.

## Establish current evidence

1. Read the nearest repository instructions before changing files.
2. Inspect `git status` so unrelated work stays untouched.
3. Inspect `pyproject.toml`, `uv.lock`, Python version files, and `uv.toml` when present.
4. Inspect other environment or lock files before assuming uv owns the project.
5. Run `uv --version`; run `uv help <command>` only for a flag you are unsure of.

Installed command help is the source for available flags, because flags change
between uv versions. Project files are the source for repository intent.

## Choose one primary surface

| Need | Surface | Reference |
|---|---|---|
| Find, install, pin, or select Python | `uv python` | `references/python.md` |
| Run or maintain one Python file | `uv run` and inline metadata | `references/scripts.md` |
| Run or install a Python command | `uvx` or `uv tool` | `references/tools.md` |
| Manage an application, library, or workspace | uv project commands | `references/projects.md` |
| Handle configuration, indexes, resolution, authentication, caching, build backends, or pip compatibility | uv concepts | `references/concepts.md` |

Read every reference that matches the task. Keep one surface primary when
several surfaces interact.

## Approvals and scope

- Continue the requested change: a request to fix, add, lock, sync, or migrate
  is a request to edit project files and run the commands that do it. Stay
  read-only only when the request is explicitly review-only.
- Package downloads into the project environment are normal project work. Use
  `--no-python-downloads` or `--offline` when the task prohibits downloads.
- Commands that change the user's machine outside the project (`uv python install`,
  `uv python upgrade`, `uv tool install`, `uv tool upgrade`, shell or user
  configuration edits) need an explicit go-ahead unless the request named that
  change, because they persist after the task.
- Keep credentials out of commands, output, tracked files, and inline metadata,
  because all of those are shared or logged.
- Replace an existing non-uv workflow (pip, Poetry, pipenv) only when migration
  is requested, because other contributors depend on it.

## Apply the workflow

1. State the requested outcome in one sentence.
2. Select the primary uv surface and read the matching reference files.
3. Identify files and user state that the command can change.
4. Choose the smallest command or file change that reaches the outcome and make it.
5. Run a check that exercises the changed surface.
6. Inspect final status and relevant diffs.

Use these defaults unless project evidence requires another choice:

- Use `uv run` for commands that need the project environment.
- Use `uvx` for a temporary tool that does not need the project.
- Use inline script metadata for a reusable standalone script with dependencies.
- Use a project for shared dependencies, multiple modules, tests, or packaging.
- Use `uv add` and `uv remove` for project dependency changes.
- Let uv write generated lockfiles; a hand edit is overwritten on the next resolve.
- Record broad dependency intent in project or script metadata and exact
  resolution in the matching lockfile.

## Handle drift and conflicts

Stop and report when the next step would change credentials or global state
without a go-ahead: a private index needs credentials that are not safely
configured, or the command would install or upgrade user-level Python, tools,
or shell configuration the request did not name.

Continue on the best-supported path and say so in the report when:

- the installed uv behavior differs from the requested workflow (follow the
  installed help and name the version gap);
- several package managers appear to own the same environment (keep the one the
  repository instructions or lockfiles name, and leave the other untouched);
- a migration would change dependency versions (pin the accepted versions first,
  then show the diff);
- project files are malformed or inconsistent (fix the smallest thing that
  unblocks the requested change and report what was wrong).

Prefer `uv help` and the official documentation over remembered flags. State
any version mismatch that affects the result.

## Verify completion

Match verification to the selected surface:

- Python: confirm the selected interpreter and its origin.
- Script: run the script with representative arguments.
- Tool: run the requested command and report its resolved version.
- Project: check the lock, run the relevant command, and run focused tests.
- Concepts: reproduce the original symptom after the configuration change.

End with a recap that leads with the outcome, then:

- the selected uv surface and installed uv version;
- commands run and files changed;
- downloads or user-state changes;
- verification evidence; and
- unresolved version, network, index, or environment assumptions.
