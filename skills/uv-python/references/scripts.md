# Python scripts

Read this reference for standalone Python files, inline dependencies, script
locks, shebangs, or project-context behavior.

Official source:

- <https://docs.astral.sh/uv/guides/scripts/>

## Choose the script form

| Script need | Preferred form |
|---|---|
| No third-party dependencies | `uv run script.py` |
| One temporary dependency experiment | `uv run --with <package> script.py` |
| Reusable standalone script | PEP 723 inline metadata |
| Script that imports the current project | Project `uv run script.py` |
| Independent script inside a project | `uv run --no-project script.py` |

Use a project when the code gains shared dependencies, several modules, tests,
packaging, or coordinated commands.

## Account for project context

Without inline metadata, `uv run` discovers the current project and prepares
its environment. Place uv options before the script path.

Use `uv run --no-project script.py` when a plain script must ignore the current
project.

A script with inline metadata uses its own isolated environment. It ignores
project dependencies without needing `--no-project`.

## Create inline metadata

Initialize a new standalone script with:

```bash
uv init --script script.py --python 3.12
```

Add declared dependencies with:

```bash
uv add --script script.py 'requests<3' rich
```

The metadata must include a `dependencies` field. Use an empty list when the
script only needs a Python version requirement.

Prefer metadata over repeated `--with` options for a reusable script. Keep
temporary `--with` usage local to experiments and diagnostics.

## Make a script executable

Use this shebang when the operating system supports `env -S`:

```python
#!/usr/bin/env -S uv run --script
```

Keep inline metadata below the shebang. Set the executable bit only when direct
execution is part of the requested interface.

## Lock when reproducibility requires it

Lock a PEP 723 script explicitly:

```bash
uv lock --script script.py
```

uv writes the script lock beside the script. Track that lock when the script
needs repeatable dependency resolution across machines or time.

Use version constraints and `exclude-newer` only when the reproducibility goal
requires them. Document the reason for a time cutoff.

## Handle indexes safely

Route alternative indexes and authentication through
`references/concepts.md`. Store index location separately from credentials.

Never place index credentials in inline script metadata or committed command
examples.

## Verify the script

Run the script through its supported entry point. Include representative
arguments and verify its output or artifact.

When the script has inline metadata, verify that it remains independent from
the surrounding project. Inspect the adjacent lock when locking was requested.
