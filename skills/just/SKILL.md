---
name: just
description: |
  Design, inspect, debug, and maintain justfile command workflows.
  Use when adding or changing just recipes, parameters, dependencies, modules, environment loading, shells, working directories, or project command entrypoints.
license: MIT
compatibility: Requires just. Verify version-sensitive syntax against the installed command.
metadata:
  author: William Cygan
  version: "0.1.0"
---

# Use just effectively

Treat the `justfile` as the public command surface for a project. Keep each
recipe focused on one project outcome.

Read `references/manual.md` when exact syntax, version requirements, shell
behavior, argument passing, environment rules, or multi-file composition
affect the task.

## Establish current evidence

Locate the active `justfile` and relevant repository instructions. Inspect the recipes and underlying commands that determine the requested behavior. Use `just --list` or `--summary` for discovery, `--show <recipe>` for a known target, and `--dump` when the parsed configuration matters. Check `just --version` for version-sensitive syntax.

Inspect expressions before using `just --evaluate` or `--dry-run`: evaluating variables can execute commands even when recipe bodies do not run. Avoid exposing secrets through evaluated output.

Complete this step when the command surface, tool version, underlying commands,
and possible side effects are known.

## Preserve authority

- Keep explanation, review, and diagnosis work read-only.
- For combined diagnosis and implementation requests, continue the authorized changes once the cause is understood.
- Inspect unfamiliar recipes before execution.
- Use existing authorization for deploy, publish, cleanup, reset, or user-state changes; ask only if the requested operation is not covered.
- Preserve the underlying tool as the source of command behavior.
- Keep secrets in process environment variables.

## Design the public command surface

1. Name recipes after stable project outcomes.
2. Add one documentation comment before each public recipe.
3. Choose a safe default recipe or list the available recipes.
4. Use parameters for explicit user input.
5. Use environment variables for process configuration.
6. Use aliases only for established alternative names.
7. Keep a recipe as a thin wrapper around one authoritative command.

Complete this step when each public recipe has a clear name, input contract,
side-effect boundary, and completion result.

## Compose the recipe graph

- Use dependencies for required prior work.
- Pass dependency arguments explicitly.
- Use subsequent dependencies only for required follow-up work.
- Run parallel dependencies only when they have no shared mutable state.
- Start with one `justfile`.
- Use imports when files must share one recipe namespace.
- Use modules when command groups need separate namespaces and settings.
- Invoke another directory's `justfile` when it owns an independent command surface.

Prefer a shallow graph. Move complex control flow into a tested script or
application command.

## Handle values safely

- Quote every substitution that can contain spaces or shell characters.
- Use exported parameters or positional arguments for arbitrary values.
- Use a shebang recipe when commands must share shell state.
- Use `cd <directory> && <command>` for one directory-bound command.
- Select a custom shell only when the project requires it.
- Load environment files explicitly.
- Use required environment loading when missing configuration must stop execution.
- Keep secrets out of substitutions, command echoes, and tracked files.
- Select syntax supported by the project's minimum `just` version.
- Treat list support as unstable until the project accepts that compatibility risk.

## Reusable patterns

### Safe discovery default

```just
# List supported project commands.
default:
    @just --list
```

### Local quality gate

```just
# Run all local validation.
check: format-check lint test

# Check justfile formatting.
format-check:
    just --fmt --check

# Check source quality.
lint:
    ./scripts/lint

# Run the test suite.
test:
    ./scripts/test
```

### Safe parameter forwarding

```just
# Build one named target.
build $TARGET:
    ./scripts/build "$TARGET"
```

### Stateful multi-step recipe

```just
# Check one prepared artifact.
artifact-check:
    #!/usr/bin/env bash
    set -euo pipefail
    cd dist
    ../scripts/check-artifact
```

### Monorepo namespaces

```just
# API commands.
mod api

# Web application commands.
mod web

# Check all workspaces.
check: api::check web::check
```

### Independent parallel checks

```just
# Run independent checks concurrently.
[parallel]
check: lint test
```

## Verify completion

Choose checks that establish the changed contract, following repository requirements and user constraints. Formatting can use `just --fmt --check`; parameter and command behavior can use `--usage`, inspected dry runs, or safe execution with representative inputs. For wrapper changes, cover argument forwarding and failure exit status where affected. Avoid running overlapping discovery commands or recipes merely to complete a checklist.

Report the installed version, changed recipes, commands run, side effects,
validation evidence, and remaining version or environment assumptions.
