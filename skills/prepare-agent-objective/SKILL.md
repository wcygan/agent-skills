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

Turn a chosen outcome into a tested operating contract: the record of what the
work must achieve, what it may touch, and how success is checked. Reuse working
project infrastructure and set up what is missing within the requested scope. The
user supplies priorities and boundaries; discover commands and integration facts
from the project instead of asking the user to design the machinery.

Skip any step whose answer is already recorded in the project's task or
operational record. Run the pilot (step 6) before asking the user anything,
because the pilot answers most questions itself and shows which gaps are real.

1. Name the outcome, who benefits, the scope, the required target, the stretch
   target, and the invariants (facts that must stay true throughout). Read
   [the objective contract](references/objective-contract.md) and record it in
   the project's existing task or operational record. Scale its detail to the
   task; reuse a current contract rather than creating a duplicate.
2. Inspect the raw evidence and pin down what it describes: timestamps, which
   commit each release maps to, environment, configuration, workload, and which
   users or systems are in the population. Test access by retrieving one real
   signal. Tell apart missing data, a healthy zero result, and broken collection.
   Keep secrets out of the record.
3. Set up a reproducible environment, representative fixtures, real entry points,
   and the resources the agent owns and cleans up (scratch directories, test
   accounts, temporary branches). Locate an existing project verification skill.
   Use create-verification-skill or maintain-verification-skill when reusable
   guidance is needed; record exact commands directly if those skills are absent.
4. Set up a success check that does not depend on the agent's own narrative: a
   regression test that runs, a measured output, an independent observation, or
   an evaluation set kept apart from the data used while tuning. Capture the
   baseline and a negative control (a known failure the check must catch) and
   show that it is caught. Say which checks the implementation may not weaken to
   claim success.
5. Record the action boundary: what may be edited, submitted, merged, deployed,
   and rolled back, and which of those actions already have the user's go-ahead.
   Record a resource budget only when the user set one. Keep two lists:
   - What the agent sets up itself: fixtures, scripts, local environment,
     verification scripts, scratch resources. A missing item here is work, not a
     blocker.
   - What only the user can supply: credentials, external access, product
     decisions. This list alone blocks, because everything on the first list the
     agent can build. It blocks only the actions that depend on it; continue every
     other preparation and report the blocker when it stops you.
6. Pilot one complete path: retrieve a signal, identify the artifact, reproduce or
   measure it, exercise the proposed verification, keep the proof, and clean up
   owned resources. If changes are in scope and a suitable case exists, carry one
   through the delivery boundary the request allows. Do not fabricate a defect or
   deploy just to complete a pilot, because a faked pilot proves nothing about the
   real path. Label the stages and environments the pilot did not exercise.
7. For ongoing work, test that the work can checkpoint and restart, and identify
   the actual event source or scheduler, its execution environment, and how it
   will be stopped. Configure it within the user's requested scope. A skill file
   supplies no background runtime, so without an active trigger, report readiness
   for manual runs.

When the preparation is long, post a progress update at each step boundary. End
with a self-contained recap that leads with the readiness state (ready for the
tested scope, partially ready, or blocked) and then gives the contract, pilot
evidence, verified capabilities, and each gap with the action that resolves it and
who takes it.
