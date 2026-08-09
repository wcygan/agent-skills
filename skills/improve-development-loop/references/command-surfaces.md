# Command Surfaces

Use these patterns for repeated commands, bootstrap friction, maintenance
scripts, or drift between local and hosted validation. Reuse repository-native
tools and keep substantial logic shared across entry points.

## Contents

- [Canonical task entry point](#canonical-task-entry-point)
- [Hermetic maintenance script](#hermetic-maintenance-script)
- [Bootstrap and doctor command](#bootstrap-and-doctor-command)
- [Local and CI convergence](#local-and-ci-convergence)

## Canonical task entry point

**Signal:** A developer repeatedly copies a command sequence, coordinates
several terminals, or reconstructs a workflow from CI configuration and prose.

**Intervention:** Compose existing primitives behind one repository-native task
or thin script.

**Minimum contract:**

- Accept explicit scope or target inputs.
- Be non-interactive by default.
- Preserve the earliest causal failure and return a nonzero exit status.
- Expose prerequisites and supported inputs through the repository's normal
  help surface.
- Avoid hidden setup, cleanup, network access, or credential use.

For a repository with a central task runner, prefer a coherent lifecycle
surface. Use these roles as concepts rather than mandatory names:

```text
setup
dev
test <target>
e2e <scenario>
check
doctor
reset <run-id>
```

A `justfile` is a strong implementation when `just` is already used or chosen
by the project. Keep substantial logic in shared scripts so local commands and
CI compose the same implementation rather than diverging.

**Acceptance evidence:** Run the representative workflow from its documented
starting state, demonstrate the same or stronger validation, and inject one
expected failure to verify the error path.

**Avoid when:** The wrapper only renames one discoverable command or conceals
important phases that developers need to invoke separately.

## Hermetic maintenance script

**Signal:** Shell orchestration has grown to include parsing, structured state,
concurrency, retries, or platform-dependent branching, or developers repeatedly
recreate the same disposable utility.

**Intervention:** Add a small script using a runtime and dependency mechanism
already supported by the repository. When Python and `uv` are present, prefer
`uv run` with locked project dependencies or declared inline script
dependencies over a global Python environment.

**Minimum contract:**

- Expose typed, documented inputs and reject unknown arguments.
- Pin or lock runtime dependencies and avoid global installation.
- Resolve working, cache, and artifact paths explicitly.
- Be non-interactive by default and support dry-run for consequential changes.
- Preserve useful stderr, stable exit statuses, and optional structured output.
- Test meaningful success, invalid-input, failure, and interruption behavior.

**Acceptance evidence:** Run from a fresh or isolated environment, exercise a
missing dependency or invalid argument, and prove repeated output is stable for
the same inputs. Verify nested invocations inherit required isolated cache and
environment settings.

**Avoid when:** An existing command already supplies the behavior or the logic
is simple enough to remain a readable task-runner recipe.

Prefer implementation layers in this order:

1. Reuse an existing command directly.
2. Compose simple orchestration in the repository's task runner.
3. Use a small dependency-pinned script for parsing, state, or concurrency.
4. Introduce a long-running helper service only when persistent state requires
   it.

## Bootstrap and doctor command

**Signal:** Contributors discover missing tools, configuration, ports, or local
services only after a long build or runtime failure.

**Intervention:** Add a read-only diagnostic command that checks prerequisites
and explains the first useful remediation.

**Minimum contract:**

- Separate detection from repair.
- Check only prerequisites required by the selected loop.
- Report each failed check with the observed value and expected condition.
- Distinguish missing, unreachable, incompatible, and unhealthy states.
- Return success only when the stated loop can begin.

**Acceptance evidence:** Exercise a healthy environment and at least one
missing or incompatible prerequisite. Confirm the command does not install,
start, stop, or rewrite anything.

**Avoid when:** The check merely duplicates an existing tool's clear preflight
or silently repairs the machine.

## Local and CI convergence

**Signal:** Local checks pass while CI fails because the two paths use different
commands, generated artifacts, tool versions, environment defaults, or setup
logic.

**Intervention:** Make local lifecycle commands and CI compose the same
underlying scripts and pinned validation contracts.

**Minimum contract:**

- Define one authoritative local preflight and the claims it covers.
- Pin or check required tool and dependency versions.
- Keep CI-specific orchestration thin and document unavoidable environment
  differences.
- Detect generated-code, lockfile, fixture, or schema drift explicitly.
- Preserve focused local checks while requiring the authoritative guard before
  completion.
- Emit comparable evidence and exit semantics locally and in CI.

**Acceptance evidence:** Run the local preflight from a clean state, compare its
steps with CI configuration, and inject representative drift or version
mismatch. Confirm both paths fail for the same underlying reason.

**Avoid when:** Convergence would force slow hosted-only infrastructure into
every local edit; keep those checks as a separately named proof tier instead.
