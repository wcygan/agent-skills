# Feedback Loops

Use these patterns when edits wait on broad validation, developers manually
select checks, or a live application loop reloads unreliably. Preserve a
deterministic one-shot guard alongside faster feedback.

## Contents

- [Focused and full validation tiers](#focused-and-full-validation-tiers)
- [Change-aware validation](#change-aware-validation)
- [Live application loop](#live-application-loop)

## Focused and full validation tiers

**Signal:** Small changes require the full suite, or a fast check is routinely
reported as proof beyond the behavior it covers.

**Intervention:** Define focused, fast, and full validation paths with explicit
confidence boundaries.

**Minimum contract:**

- State the claim each tier can and cannot support.
- Reuse the same underlying tests or validators where possible.
- Allow explicit selection of a component, test, route, record, or scenario.
- Keep the broad guard discoverable and intact.
- Fail when the requested target is unknown rather than falling back silently.

**Acceptance evidence:** Measure the representative focused path, prove target
selection, and run the broader guard on the same source state.

**Avoid when:** The faster tier skips the behavior being changed, weakens
assertions, or depends on stale generated or cached results.

## Change-aware validation

**Signal:** Developers manually decide which checks cover a change, repeatedly
run unrelated suites, or omit necessary checks because impact is difficult to
trace.

**Intervention:** Map changed surfaces to focused checks while retaining a safe
fallback for unknown or cross-cutting impact.

**Minimum contract:**

- Derive impact from explicit dependency, ownership, or test metadata rather
  than filename guesses alone.
- Include generated artifacts, configuration, schemas, and shared contracts.
- Explain why each selected check applies.
- Fail closed to a broader guard when the impact is unknown.
- Provide an explicit way to run the full validation surface.

**Acceptance evidence:** Exercise localized, shared-contract, generated-file,
rename, deletion, and unknown-file changes. Compare the selected checks with the
authoritative full guard on representative cases.

**Avoid when:** The repository is too small for selection to save meaningful
time or the dependency model cannot conservatively represent impact.

## Live application loop

**Signal:** Each small edit repeats startup, compilation, browser navigation, or
test selection, or an existing watcher requires manual restart after ordinary
errors and configuration changes.

**Intervention:** Expose one long-lived development command that owns required
local startup, readiness, hot reload, visible status, and predictable shutdown,
with a clean one-shot equivalent for automation and final proof.

**Minimum contract:**

- Print the application URL, run identifier, readiness state, and artifact or
  log location.
- Define which source, asset, configuration, and dependency changes reload and
  which require an explicit restart.
- Handle additions, edits, renames, deletions, and invalid intermediate source
  without leaving stale output.
- Recover from expected compilation or runtime errors without manual process
  hunting.
- Surface stale-cache or invalidation failures.
- Isolate ports and mutable state when concurrent work is plausible.
- Shut down predictably and release only owned resources.
- Retain a deterministic one-shot command for automation and final evidence.

**Acceptance evidence:** Exercise source, asset, configuration, dependency,
rename, deletion, compile-error, recovery, and shutdown paths. Compare the live
result with the one-shot guard on the same source state.

**Avoid when:** Caching is not observable, invalidation is unreliable, or the
live process becomes the only way to reproduce a result.
