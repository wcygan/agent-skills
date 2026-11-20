---
name: verify-behavior
description: "Check actual results against acceptance criteria on the real artifact and keep the evidence. Use to verify a completed change, confirm a fix works, or before claiming that a feature, refactor, or other artifact works; for a smoke test, QA pass, or end-to-end check of an application journey."
license: MIT
metadata:
  kind: procedure
  upstream-repository: https://github.com/cursor/plugins
  upstream-revision: 1e5c90a4b6f249917bd21fe361b3a2a7deb741b8
  upstream-path: pstack/skills/principle-prove-it-works; pstack/skills/figure-it-out; pstack/skills/create-verification-skill; pstack/skills/maintain-verification-skill
  upstream-author: Lauren Tan
  maintenance: local
---

# Verify behavior

Read the [principle index](../wcygan-mode/references/principles.md) first. Load a
component named below only when its condition applies.

Instance ownership means what this run started and may therefore stop: the
process, port, test data, or environment it launched. A shared instance that
someone else started is theirs; use it, but leave it running and its data in place.

1. List the acceptance criteria and identify the exact artifact or revision under
   test. Match each criterion to an observable result on the relevant surface.
2. Use the project's established checks and real entry points, including any
   project verification skill that covers the journey. When repeated work needs
   reusable guidance, use `create-verification-skill` if none exists and
   `maintain-verification-skill` if it is stale; a one-off check needs neither.
   When a property must hold for every case in a stated scope and formal
   verification is requested, use `create-formal-verification-skill`. Check
   prerequisites, instance ownership, and readiness before exercising behavior.
3. Exercise representative success and failure paths, including the consequential
   boundaries the change touches. Check resulting side effects as well as output.
4. Retain the actions, results, and artifact identity as evidence. Inspect artifacts
   directly, because a successful build, a healthy process, or another worker's
   summary shows that something ran, not that the user-visible behavior is right.
5. Report each criterion as verified, failed, or inconclusive. Identify simulated
   boundaries, unavailable environments, and missing coverage. A changed artifact
   needs renewed evidence for the affected criteria, because earlier evidence
   describes a different revision.
6. Clean up resources the run owns, including after failure, and leave shared
   resources alone since other work may depend on them. Confirm the proof
   artifacts survive cleanup.

Continue unless a criterion cannot be exercised at all; report that blocker (the
missing environment, prerequisite, or access) when it stops you. A verification
skill counts as proof only for the journeys run in this check.

Done when every acceptance criterion has an evidenced disposition.

Adapted from pstack; [license and attribution](references/LICENSE.txt).
