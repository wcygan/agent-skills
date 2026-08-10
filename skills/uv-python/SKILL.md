---
name: uv-python
description: |
  Guide Python work with uv across Python versions, PEP 723 scripts, uvx and uv tool commands, pyproject.toml projects, dependencies, uv.lock, configuration, indexes, resolution, and caching.
  Use when choosing or applying a uv workflow, maintaining uv-managed Python code, migrating an existing Python workflow to uv, or diagnosing uv behavior.
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
2. Inspect `git status` and preserve unrelated work.
3. Inspect `pyproject.toml`, `uv.lock`, Python version files, and `uv.toml` when present.
4. Inspect other environment or lock files before assuming uv owns the project.
5. Run `command -v uv` and `uv --version` before executing uv commands.
6. Run `uv help <command>` before using version-sensitive flags.
7. Use current official uv documentation when installed help is insufficient.

Treat installed command help as the source for available flags. Treat project
files as the source for repository intent.

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

## Preserve authority

- Treat explanation, review, and diagnosis requests as read-only.
- Make project file changes only when the user requests implementation.
- Treat package downloads as normal project work only when execution requires them.
- Require explicit authority for global Python or tool installation changes.
- Require explicit authority for shell configuration and user configuration changes.
- Keep credentials out of commands, output, tracked files, and inline metadata.
- Use `--no-python-downloads` or `--offline` when the task prohibits downloads.
- Stop before changing an existing non-uv workflow unless migration is requested.

Commands such as `uv python install`, `uv python upgrade`, `uv tool install`,
and `uv tool upgrade` change user state. Run them only when the requested
outcome needs that state.

## Apply the workflow

1. State the requested outcome in one sentence.
2. Select the primary uv surface.
3. Read the matching reference files.
4. Identify files and user state that the command can change.
5. Choose the smallest command or file change that reaches the outcome.
6. Execute only the authorized change.
7. Run a check that exercises the changed surface.
8. Inspect final status and relevant diffs.

Use these defaults unless project evidence requires another choice:

- Use `uv run` for commands that need the project environment.
- Use `uvx` for a temporary tool that does not need the project.
- Use inline script metadata for a reusable standalone script with dependencies.
- Use a project for shared dependencies, multiple modules, tests, or packaging.
- Use `uv add` and `uv remove` for project dependency changes.
- Let uv manage generated lockfiles.
- Record broad dependency intent in project or script metadata.
- Record exact resolution in the matching lockfile.

## Handle drift and conflicts

Stop and report the conflict when any condition applies:

- The installed uv behavior conflicts with the requested workflow.
- Multiple package managers appear to own the same environment.
- A migration could change dependency versions without an accepted comparison.
- A private index needs credentials that are not safely configured.
- The command would change unapproved user or global state.
- Required project files are malformed or internally inconsistent.

Prefer `uv help` and the official documentation over remembered flags. State
any version mismatch that affects the result.

## Verify completion

Match verification to the selected surface:

- Python: confirm the selected interpreter and its origin.
- Script: run the script with representative arguments.
- Tool: run the requested command and report its resolved version.
- Project: check the lock, run the relevant command, and run focused tests.
- Concepts: reproduce the original symptom after the configuration change.

Report:

- the selected uv surface;
- the installed uv version;
- commands run and files changed;
- downloads or user-state changes;
- verification evidence; and
- unresolved version, network, index, or environment assumptions.
