# Python projects

Read this reference for applications, libraries, dependencies, environments,
lockfiles, workspaces, builds, or migrations.

Official sources:

- <https://docs.astral.sh/uv/guides/projects/>
- <https://docs.astral.sh/uv/concepts/projects/>

## Inspect before initialization

Search for existing project metadata, lockfiles, environment tools, and task
commands. Preserve the current package manager unless the user requests uv
adoption or migration.

Run `uv help init` before creating a project. Select the project kind from the
requested distribution and runtime behavior:

- Use an application for a service, script collection, or private command.
- Use a library for code intended for distribution and reuse.
- Use a packaged application for a distributable command-line interface.
- Use a standalone script when one file remains the correct boundary.

Inspect parent directories before initialization. uv can add a new project to
an existing parent workspace.

## Preserve file ownership

Treat these files and directories differently:

- `pyproject.toml` records project metadata, dependency intent, and uv settings.
- `.python-version` records the default interpreter request.
- `uv.lock` records the exact cross-platform resolution.
- `.venv` contains generated project environment state.

Track `uv.lock` for an application or library that needs repeatable installs.
Let uv write the lockfile. Keep `.venv` out of version control.

## Manage dependencies

Prefer uv commands that update project intent and derived state together:

```bash
uv add <requirement>
uv add --dev <requirement>
uv remove <package>
uv lock
uv sync
```

Use the project's existing dependency groups. Avoid adding a parallel group for
the same purpose.

Use `uv lock --upgrade-package <package>` for a bounded dependency upgrade.
Reserve broad upgrades for an explicitly requested update.

## Run project commands

Use `uv run <command>` for commands that need project code or dependencies. uv
checks project resolution and prepares the environment before execution.

Use `--locked` when the command must prove that `uv.lock` is current. Use
`--frozen` only when the existing lockfile must remain the sole source.

Prefer `uv run` over manual environment activation for repository commands.
Support direct activation only when an external program requires it.

## Migrate deliberately

Treat migration as a separate requested change. Inventory these inputs before
changing them:

- dependency and constraint files;
- development and optional dependency groups;
- editable, path, Git, URL, and index sources;
- supported Python versions and platform markers;
- lockfiles and accepted current versions; and
- build, test, release, and continuous integration commands.

Preserve accepted versions with constraints during the first uv resolution.
Compare old and new direct dependencies before removing the prior workflow.

Keep rollback possible until the uv lock, environment, and required commands
pass on every supported platform.

## Build and workspace work

Inspect the selected build backend before changing build configuration. Read
`references/concepts.md` for build-backend constraints.

For workspaces, identify the root, every member, shared constraints, and the
command's target package. Use current project concept documentation for exact
workspace behavior.

## Verify the project

Run checks that match the change:

```bash
uv lock --check
uv run <focused-test-or-command>
```

Run `uv sync` when the task requires a materialized environment. Inspect the
lock diff after dependency changes.

Report project files changed, dependency movement, environment creation, and
the exact command that proved the requested behavior.
