# Python command-line tools

Read this reference for temporary tool execution, persistent tool installation,
tool versions, plugins, or project-aware commands.

Official sources:

- <https://docs.astral.sh/uv/guides/tools/>
- <https://docs.astral.sh/uv/concepts/tools/>

## Choose temporary or persistent use

Use `uvx <command>` for a temporary, isolated tool execution. `uvx` is an alias
for `uv tool run`.

Use `uv tool install <package>` when the user wants persistent executables on
their path. Persistent installs change user state.

| Need | Command shape |
|---|---|
| Run a command from a same-name package | `uvx <command>` |
| Run a command from another package | `uvx --from <package> <command>` |
| Select an exact temporary version | `uvx <command>@<version>` |
| Add a temporary plugin or extra package | `uvx --with <package> <command>` |
| Install persistent executables | `uv tool install <package>` |
| List persistent tools | `uv tool list` |
| Upgrade a persistent tool | `uv tool upgrade <package>` |
| Remove a persistent tool | `uv tool uninstall <package>` |

Run `uv help tool <command>` before using alternative sources, extras, or
version ranges.

## Preserve project visibility

An `uvx` tool runs outside the project environment. Use `uv run` when the tool
must import, inspect, test, or type-check the current project.

Prefer a declared development dependency for a recurring project tool:

```bash
uv add --dev pytest
uv run pytest
```

Use an ephemeral project overlay for a bounded experiment:

```bash
uv run --with pytest pytest
```

Do not install a persistent user tool merely to satisfy one project command.

## Select package sources carefully

Use `--from` when the command name and distribution name differ. Use an exact
version or immutable revision when automation requires reproducibility.

Treat Git URLs and private indexes as package execution sources. Use only
sources that the user or project already trusts.

Keep credentials outside commands and tracked files. Read
`references/concepts.md` for index and authentication guidance.

## Manage user state

These operations change user state:

- `uv tool install`;
- `uv tool upgrade`;
- `uv tool uninstall`; and
- `uv tool update-shell`.

Run them only when the requested outcome needs persistent state. Report the
installed package, executables, selected Python, and path changes.

## Verify the tool

Run the requested command with a harmless version or help flag when available.
Then run the smallest real operation that proves project visibility.

Report whether uv used a temporary environment, a project environment, or a
persistent tool environment.
