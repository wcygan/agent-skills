---
name: uv-python
description: "Develop and troubleshoot Python with uv. Use for uv add, uv lock, uv sync, uv run, uvx, pyproject.toml, PEP 723 scripts, Python version pinning, private indexes, or migration from pip or Poetry."
license: MIT
compatibility: Requires uv. Verify version-sensitive flags against the installed command.
metadata:
  author: William Cygan
  version: "0.1.0"
---

# Python with uv

Use repository configuration and lockfiles to identify which workflow owns the
environment. Preserve that workflow unless the user requests a migration. Use
installed `uv help` for version-sensitive flags.

| Task | Use | Completion evidence |
| --- | --- | --- |
| Find, pin, or install an interpreter | [`uv python`](references/python.md) | Runtime version and interpreter path |
| Maintain a standalone Python file | [`uv run` and PEP 723 metadata](references/scripts.md) | Script output with representative arguments |
| Run or install a Python CLI | [`uvx` or `uv tool`](references/tools.md) | Resolved version and a successful invocation |
| Manage project dependencies, locks, builds, or workspaces | [uv project commands](references/projects.md) | Current lock and the relevant project command or test |
| Diagnose configuration, indexes, resolution, caching, or pip compatibility | [uv concepts](references/concepts.md) | The original command now behaves as intended |

Follow the reference that matches the task. Use `uv run` for tools that need the
project environment, and `uvx` for temporary isolated tools. Change project
dependencies with `uv add` or `uv remove`, let uv write the lock, and review any
change in resolved versions or sources.

Keep index credentials out of commands, output, and project files. Check whether
uv will download an interpreter and use `--no-python-downloads` when the task
requires an existing installation. Persistent user-level installs, upgrades,
and shell or user configuration changes require explicit authorization.
