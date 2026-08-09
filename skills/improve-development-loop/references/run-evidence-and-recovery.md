# Run Evidence and Recovery

Use these patterns when concurrent work collides, proof is scattered, failures
cannot be replayed, or retries require unsafe cleanup. Bind mutable state and
evidence to an explicit run owner.

## Contents

- [Run-owned isolation](#run-owned-isolation)
- [Evidence bundle](#evidence-bundle)
- [Failure replay capsule](#failure-replay-capsule)
- [Safe reset and cleanup](#safe-reset-and-cleanup)

## Run-owned isolation

**Signal:** Concurrent developers or agents collide on ports, process names,
directories, databases, queues, caches, or fixture identifiers.

**Intervention:** Allocate explicit per-run identifiers and derive mutable
resources from them.

**Minimum contract:**

- Surface the run identifier and all derived resource locations.
- Avoid implicit global defaults when concurrency is plausible.
- Validate ownership before mutation or cleanup.
- Make the same identifier usable for status, logs, and teardown.
- Bound identifier length and reject unsafe values.

**Acceptance evidence:** Run two representative loops concurrently and show
that status, evidence, and cleanup remain isolated.

**Avoid when:** Randomization hides resource locations or makes failures
impossible to reproduce.

## Evidence bundle

**Signal:** Validation requires manually collecting logs, screenshots, test
output, generated files, or identifiers from several tools.

**Intervention:** Produce a bounded run-owned evidence bundle or summary at a
stable location.

**Minimum contract:**

- Record the source revision, command, target, timestamps, and run identifier.
- Preserve original failures and exit statuses.
- Bound artifact size and retention.
- Redact secrets and sensitive data.
- Separate observed evidence from inferred conclusions.

**Acceptance evidence:** Inspect bundles from one successful and one failing
run, then confirm they support the exact acceptance claim without external
context.

**Avoid when:** Bundling duplicates already-clear command output or introduces
a second source of truth for runtime state.

## Failure replay capsule

**Signal:** A failing test or runtime scenario cannot be reproduced without
reconstructing its source state, inputs, environment, and ephemeral identifiers
from several places.

**Intervention:** Emit a small manifest that binds failure evidence to an exact
replay command and immutable or fingerprinted inputs.

**Minimum contract:**

- Record source revision and dirty-state fingerprint without copying unrelated
  source files.
- Record the command, target, scenario, seed, fixture digest, run identifier,
  and relevant tool or dependency versions.
- Include only allowlisted, sanitized environment fields.
- Link to bounded logs, screenshots, traces, and generated artifacts.
- State which external conditions cannot be captured or replayed.
- Keep replay read-only toward external systems unless separately authorized.

**Acceptance evidence:** Capture a known failure in one run-owned environment,
replay it in another, and confirm that missing or incompatible inputs fail with
an actionable explanation rather than silently changing the scenario.

**Avoid when:** The failure is already deterministic from one stable command or
the capsule would retain secrets, personal data, or large mutable environments.

## Safe reset and cleanup

**Signal:** Retrying requires manual deletion, process hunting, broad cleanup,
or knowledge of which resources belong to a previous run.

**Intervention:** Add an idempotent, target-specific reset or teardown path.

**Minimum contract:**

- Require or resolve one explicit target.
- Verify ownership before deletion or termination.
- Show the target set before destructive work when ambiguity is possible.
- Treat already-absent owned state as a successful terminal condition.
- Preserve unknown and unrelated resources.

**Acceptance evidence:** Clean a completed run, repeat cleanup, exercise a
partially created run, and prove that neighboring foreign state survives.

**Avoid when:** The target depends on a broad glob, unresolved environment
variable, shared root, or unverified process match.
