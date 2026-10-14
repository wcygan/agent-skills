---
name: prepare-agent-objective
description: "Make an ambitious outcome executable by proving input access, change authority, and verification paths. Use before autonomous or recurring project work when the operating contract or required capabilities are uncertain."
license: MIT
metadata:
  author: William Cygan
  kind: component
  maintenance: local
---

# Prepare an agent objective

Turn a chosen outcome into a tested operating contract. Reuse working project
infrastructure and establish missing capabilities within the authorized scope.
The user supplies priorities and boundaries; discover commands and integration
facts from the project instead of asking the user to design the machinery.

1. Identify the outcome, beneficiaries, scope, required target, stretch target,
   and invariants. Read [the objective contract](references/objective-contract.md)
   and record it in the project's existing task or operational record. Scale its
   detail to the task; reuse a current contract rather than creating a duplicate.
2. Inspect the raw evidence and establish identity: timestamps, release-to-commit
   mapping, environment, configuration, workload, and relevant population. Test
   access by retrieving a real representative signal. Distinguish missing data,
   healthy zero results, and broken collection. Keep secrets out of the record.
3. Establish a reproducible environment, representative fixtures, real entry points,
   and owned resources. Locate an existing project verification skill. Use available
   create-verification-skill or maintain-verification-skill capabilities when reusable
   guidance is needed; record exact commands directly if those skills are absent.
4. Establish an external success check: executable regression, measured output,
   independent observation, or held-out evaluation. The agent's narrative is not
   proof. Capture the baseline and negative control; show that a known failure is
   detectable. Define which checks the implementation may not weaken to claim success.
5. Verify the action boundary and resource budget. Record what may be edited,
   submitted, merged, deployed, and rolled back under existing authorization. Resolve
   missing product decisions with the user; continue independent preparation.
   Missing access blocks dependent actions, not all useful investigation.
6. Pilot one complete path: retrieve a signal, identify the artifact, reproduce or
   measure it, exercise the proposed verification, retain proof, and clean up owned
   resources. If changes are authorized and a suitable case exists, carry one through
   the permitted delivery boundary. Do not fabricate a defect or deploy merely to
   complete a pilot. Label unexercised stages and environments explicitly.
7. For ongoing work, test durable checkpoint/restart behavior and identify the actual
   event source or scheduler, its execution environment, and how it will be stopped.
   Configure it only within the user's requested scope. A skill file supplies no
   background runtime. Without an active trigger, report readiness for manual runs.

Return the contract, pilot evidence, verified capabilities, and gaps with their next
resolving action. State ready for the tested scope, partially ready, or blocked.
Readiness is specific to an artifact, environment, and action boundary; it is not a
claim that the outcome has already been achieved or can be guaranteed indefinitely.
