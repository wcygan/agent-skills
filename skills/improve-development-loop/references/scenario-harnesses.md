# Scenario Harnesses

Use these patterns when integrated or end-to-end validation depends on manual
data, process orchestration, remote services, or uncertain readiness. Keep the
scenario bounded and exercise the application's public boundary.

## Contents

- [Deterministic fixtures](#deterministic-fixtures)
- [Reproducible scenario harness](#reproducible-scenario-harness)
- [External-dependency control](#external-dependency-control)
- [Readiness and status](#readiness-and-status)

## Deterministic fixtures

**Signal:** The loop requires manual data entry, copying identifiers, selecting
an arbitrary existing record, or restoring mutable shared state.

**Intervention:** Add a versioned fixture, factory, seed operation, or scenario
builder scoped to the behavior under test.

**Minimum contract:**

- Produce explicit and discoverable identifiers.
- Be deterministic or record the seed needed to reproduce the result.
- Be idempotent or create run-owned state.
- Avoid sensitive or production-derived data.
- Define ownership, teardown, and compatibility with concurrent runs.

**Acceptance evidence:** Create the same scenario twice, exercise the target
behavior, and prove cleanup or isolation without disturbing nearby state.

**Avoid when:** A smaller unit-level seam supplies equivalent confidence or the
fixture would encode unstable implementation details.

## Reproducible scenario harness

**Signal:** End-to-end validation requires manually starting processes,
creating data, copying identifiers, clicking through a workflow, gathering
evidence, and cleaning up afterward.

**Intervention:** Expose one scenario command that coordinates setup, startup,
readiness, deterministic fixtures, public-boundary exercise, assertions,
evidence capture, and cleanup.

**Minimum contract:**

- Name the scenario and allocate a visible run identifier.
- Pin or record randomness, time, fixture versions, and relevant tool versions.
- Exercise the application through the same public process or interface a real
  client uses.
- Use bounded startup, readiness, execution, and teardown phases.
- Preserve the earliest failure and retain the evidence needed to diagnose it.
- Print the exact command and inputs needed to replay the scenario.
- Clean only run-owned state, including after interruption.

**Acceptance evidence:** Run the scenario twice from a clean state, compare
results, inject one application failure and one dependency failure, replay the
captured failure, and prove cleanup preserves unrelated state.

**Avoid when:** A focused integration or unit seam provides equivalent
confidence, or the harness merely scripts UI clicks without controlling data,
state, and failure evidence.

## External-dependency control

**Signal:** The fast loop depends on remote APIs, changing third-party data,
network availability, quotas, credentials, or destructive shared sandboxes.

**Intervention:** Use a local emulator, deterministic fake, sanitized recording,
or contract fixture for the inner loop while retaining a separately named real
integration tier.

**Minimum contract:**

- Preserve the public contract and failure semantics relevant to the scenario.
- Version recordings and fixtures with the expected contract.
- Redact secrets, personal data, tokens, and unstable identifiers.
- Make offline versus real-integration modes explicit in commands and output.
- Detect stale fixtures or contract drift rather than silently accepting them.
- Keep real external writes separately authorized and bounded.

**Acceptance evidence:** Run offline twice, exercise representative success and
failure responses, verify fixture provenance, and compare against the real
integration tier when authorized and available.

**Avoid when:** The substitute cannot model the behavior under test or it would
be mistaken for proof that the live dependency currently works.

## Readiness and status

**Signal:** The loop uses blind sleeps, repeated polling, browser refreshes, or
log guessing to decide whether a service is usable.

**Intervention:** Expose a bounded readiness or status operation that reports
state and the earliest blocking cause.

**Minimum contract:**

- Distinguish process liveness from readiness for the selected behavior.
- Name blocking dependencies and relevant identifiers.
- Bound waiting with a timeout.
- Return stable success and failure exit statuses.
- Preserve the underlying cause instead of returning only a generic state.

**Acceptance evidence:** Exercise normal startup, delayed readiness, and one
dependency failure. Confirm no unbounded polling remains in the target loop.

**Avoid when:** A boolean health signal would claim readiness without checking
the dependencies required by the representative task.
