# Python versions

Read this reference for Python discovery, installation, pinning, selection, or
upgrade work.

Official sources:

- <https://docs.astral.sh/uv/guides/install-python/>
- <https://docs.astral.sh/uv/concepts/python-versions/>

## Distinguish installation types

uv calls versions that it installs **managed Python**. It treats every other
installation as **system Python**, including versions managed by other tools.

Use the default discovery policy when the project has no stricter rule. Use
`--managed-python` when only uv-managed installations are acceptable. Use
`--no-managed-python` when only existing system installations are acceptable.

uv can download a missing interpreter automatically. Use
`--no-python-downloads` when the task requires an existing interpreter.

## Select the command

| Outcome | Command shape |
|---|---|
| List available and installed versions | `uv python list` |
| Find the interpreter for a request | `uv python find <request>` |
| Install one or more versions | `uv python install <request>...` |
| Pin the current directory | `uv python pin <request>` |
| Show the managed installation directory | `uv python dir` |
| Add the executable directory to `PATH` | `uv python update-shell` |

Run the matching `uv help python <command>` before using less common options.

## Choose a version request

Prefer a minor version such as `3.12` for a portable project default. Use an
exact patch only when the project proves that exact patch is required.

Use `requires-python` in `pyproject.toml` for the supported Python range. Use
`.python-version` for the repository's default interpreter request.

Use `.python-versions` only when repository work must install or test several
interpreters. Confirm its current behavior with installed help.

Use `--python <request>` for a bounded command that needs an explicit
interpreter. Keep the repository default unchanged unless the task requires a
new default.

## Manage installation state

`uv python install` changes user state and can add versioned executables to the
user executable directory. Inspect `uv python dir --bin` when path behavior
matters.

The `--default` install option can add `python` and `python3` executables. Treat
that option as an explicit shell behavior change.

`uv python upgrade` changes uv-managed patch versions. Current uv documentation
marks this command as preview. Inspect help and state the preview status before
using it.

Keep minor-version upgrades separate from patch upgrades. Re-resolve and test
project dependencies after an intentional minor-version change.

## Verify the interpreter

Run commands that show both selection and runtime behavior:

```bash
uv python find <request>
uv run --python <request> python -c 'import platform, sys; print(sys.executable); print(platform.python_version())'
```

Report whether uv selected a managed or system installation. Report any
automatic download or path change.
