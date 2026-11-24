---
name: verification-skill
description: "Create or repair a project verification skill. Use for reusable smoke and end-to-end instructions, to reconcile existing checks with live behavior, or to formally verify a property such as a race, retry, parser invariant, or all-input guarantee with a repeatable model check or proof."
license: MIT
metadata:
  kind: component
  upstream-repository: https://github.com/cursor/plugins
  upstream-revision: 1e5c90a4b6f249917bd21fe361b3a2a7deb741b8
  upstream-path: pstack/skills/create-verification-skill; pstack/skills/maintain-verification-skill
  upstream-author: Lauren Tan
  maintenance: local
---

# Verification skill

Create or repair reusable instructions for checking a project's real user
journeys. For a model check, proof, or reusable formal check, follow
[formal verification](references/formal.md).

## Create journey checks

Use the project's skill conventions and maintain a linked index of its main
journeys. Record exact launch, readiness, interaction, evidence, and cleanup
instructions based on the running project. Map each journey's prerequisites,
entry point, actions, and observable result. Use helpers when they make a check
more repeatable.

Validate the skill format and follow the written instructions through at least
one complete journey. Keep evidence after teardown and report which journeys and
environments were exercised. If no journey can run, mark the skill as a draft
and record what prevented verification.

## Repair journey checks

For a repair to a named journey, trace the stale instruction to current source,
correct it, and run the journey as written. If you change a shared setup or
harness step, exercise the other journeys affected by that change.

For a full audit, reconcile every index entry with current source, look for
missing user surfaces, and exercise every mapped journey live. Include
journeys whose source appears unchanged.

Rerun corrected checks and report product regressions against the existing
expectations. For each journey in scope, report the source and runtime
evidence. If one is unreachable, record the attempted route and missing
prerequisite, then continue with the others. A full audit with missing runtime
coverage remains incomplete. When no project skill exists, report that creation
is needed.

## Evidence and instance ownership

Check user-visible outcomes and side effects, including what a dry run changes.
Identify simulated boundaries and missing prerequisites as limits on coverage.
Use isolated sessions or one driver per shared instance. Check readiness before
testing and recheck health after unexpected failures. Clean up only resources
the run created, including after failure. Get approval before seeding shared
data or writing outside the skill directory.

Adapted from Pstack. [License and attribution](references/LICENSE.txt)
