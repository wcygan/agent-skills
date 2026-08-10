# Cross-cutting uv concepts

Read this reference for configuration, package indexes, resolution,
authentication, caching, build backends, or pip-interface compatibility.

Start with the official concepts index:

- <https://docs.astral.sh/uv/concepts/>

Then read only the matching official concept page:

- Configuration files: <https://docs.astral.sh/uv/concepts/configuration-files/>
- Package indexes: <https://docs.astral.sh/uv/concepts/indexes/>
- Resolution: <https://docs.astral.sh/uv/concepts/resolution/>
- Build backend: <https://docs.astral.sh/uv/concepts/build-backend/>
- Authentication: <https://docs.astral.sh/uv/concepts/authentication/>
- Caching: <https://docs.astral.sh/uv/concepts/cache/>
- pip interface: <https://docs.astral.sh/uv/pip/>

Use installed `uv help` when a concept page describes behavior that depends on
the installed version.

## Configuration

Inspect discovered `pyproject.toml`, `uv.toml`, environment variables, and user
configuration before changing settings. Use `uv --no-config` only for an
intentional isolation test.

Keep project policy in project configuration. Change user configuration only
when the user requests a cross-project default.

State which configuration source produced the final behavior. Avoid copying a
setting into several configuration levels.

## Package indexes and authentication

Treat index selection and authentication as separate concerns. Record trusted
index locations in the supported configuration surface.

Keep tokens, passwords, and private URLs out of tracked files and command
output. Use the documented authentication mechanism for the selected index.

Inspect index strategy before adding multiple indexes. Confirm which packages
may resolve from each source.

## Resolution and locking

Separate direct dependency intent from exact resolution. Record intent in
`pyproject.toml` or inline script metadata. Let uv record exact versions in the
matching lockfile.

Use constraints when resolution must preserve accepted versions. Use platform
markers when requirements differ by platform.

Inspect the lock diff after every dependency or index change. Investigate
unexpected source, version, or transitive dependency movement.

## Build backends

Choose a backend that supports the project's source layout and build needs.
The uv build backend targets pure Python packages. Use another PEP 517 backend
when extension modules or custom build steps require it.

Run `uv build` and inspect the produced source and wheel archives after build
configuration changes.

## Caching

Use `--refresh` or `--refresh-package` before deleting cache entries. Prefer a
package-scoped clean over a full clean.

Use `uv cache prune` for periodic unused-entry cleanup. Never edit the uv cache
directory directly.

Treat cache clearing as diagnosis, not as proof of a dependency fix. Reproduce
the original command after the cache operation.

## pip-interface compatibility

Use the pip interface when the task explicitly owns a virtual environment or a
requirements-file workflow. Use the project interface for uv-managed projects.

Avoid mixing `uv pip install` with a uv project environment without a clear
compatibility reason. Such changes can create state outside project intent and
the project lock.

State which interface owns the environment before changing packages.

## Diagnose cross-cutting behavior

Use this sequence:

1. Capture the failing command and exact output.
2. Record the uv version and selected Python.
3. Identify the active project and configuration sources.
4. Identify package indexes and authentication boundaries.
5. Inspect lock and environment state.
6. Reproduce with the smallest relevant verbosity or isolation flag.
7. Change one configuration or state variable.
8. Re-run the original command.

Report the causal setting or state change. Do not describe a cache reset alone
as the root cause.
