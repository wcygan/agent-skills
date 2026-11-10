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

Locate the active `justfile` and relevant repository instructions. Inspect the recipes and underlying commands that determine the requested behavior. `just --list`, `--summary`, `--show <recipe>`, `--dump`, `--version`, and `--fmt --check` only read the justfile, so run them freely and repeat them as needed. Use `--list` or `--summary` for discovery, `--show <recipe>` for a known target, `--dump` when the parsed configuration matters, and `--version` for version-sensitive syntax.

Inspect expressions before using `just --evaluate` or `--dry-run`, because evaluating a backtick or function expression runs its command even when recipe bodies do not. Keep secrets out of evaluated output for the same reason.

Complete this step when the command surface, tool version, underlying commands,
and possible side effects are known.

## Approvals and scope

- Continue the requested change once the cause is understood; stay read-only only when the request is explicitly review-only.
- Inspect an unfamiliar recipe before running it, because its body may deploy, delete, or reset state.
- Running a recipe that deploys, publishes, commits, pushes, or changes user state needs an explicit go-ahead; a go-ahead given with the request covers the action it names. Reads, tests, builds, linters, and reruns of those need none.
- Keep the underlying tool as the source of command behavior, so a recipe change never silently changes what the tool does.
- Keep secrets in process environment variables, because substitutions echo into logs and tracked files.

## Design the public command surface

1. Name recipes after stable project outcomes (`test`, `deploy`), not after the tool that happens to implement them.
2. Add one documentation comment before each public recipe; `--list` shows it as the recipe's help.
3. Choose a safe default recipe or list the available recipes, because a bare `just` runs the first recipe.
4. Use parameters for explicit user input.
5. Use environment variables for process configuration.
6. Use aliases only for established alternative names, so `--list` stays short and each outcome has one name.
7. Keep a recipe as a thin wrapper around one authoritative command; logic in the justfile is hard to test.

Complete this step when each public recipe has a clear name, input contract,
side-effect boundary, and completion result.

## Compose the recipe graph

- Use dependencies for required prior work.
- Pass dependency arguments explicitly; an omitted argument silently takes the dependency's default.
- Use subsequent dependencies only for required follow-up work.
- Run parallel dependencies only when they have no shared mutable state, because they race.
- Start with one `justfile`; split only when namespaces collide or a directory owns its own commands.
- Use imports when files must share one recipe namespace.
- Use modules when command groups need separate namespaces and settings.
- Invoke another directory's `justfile` when it owns an independent command surface.

Prefer a shallow graph. Move complex control flow into a tested script or
application command.

## Handle values safely

- Quote every substitution that can contain spaces or shell characters, because the shell splits and expands unquoted text.
- Use exported parameters or positional arguments for arbitrary values.
- Use a shebang recipe when commands must share shell state; each plain recipe line runs in its own shell.
- Use `cd <directory> && <command>` for one directory-bound command.
- Select a custom shell only when the project requires it, because every contributor must have it installed.
- Load environment files explicitly.
- Use required environment loading when missing configuration must stop execution.
- Keep secrets out of substitutions, command echoes, and tracked files.
- Select syntax supported by the project's minimum `just` version.
- Treat list support as unstable until the project accepts that risk; it sits behind an unstable flag and its syntax can change between releases.

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

Choose checks that establish the changed contract, following repository requirements and user constraints. Formatting can use `just --fmt --check`; parameter and command behavior can use `--usage`, inspected dry runs, or safe execution with representative inputs. For wrapper changes, cover argument forwarding and failure exit status where affected. Skip discovery commands or recipes that only repeat a check already done.

End with a recap that leads with the outcome: the installed version, changed
recipes, commands run, side effects, validation evidence, and remaining version
or environment assumptions.
