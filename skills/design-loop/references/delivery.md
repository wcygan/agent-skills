# Delivery and the next iteration

Read when handing off artifacts, opening a PR, deploying, or continuing from feedback.

## Match the authorized destination

- Artifact request: return the usable wireframe/prototype and its location.
- Implementation request: finish the change and required checks; summarize the diff.
- PR request: prepare a focused diff, commit/push as needed for that PR, and create
  the requested draft or reviewable PR using repository conventions.
- Deployment request: use the designated environment and established deployment
  workflow; verify the delivered version and primary task at its destination.

Carry explicit authorization through the loop. When an external action still
needs authorization, first finish the reviewable candidate, verification evidence,
and concrete action details. Ask only for the missing decision or action. Never
treat this skill's activation as blanket authorization to publish, merge, message,
or deploy.

Keep unrelated work intact and stage only task-owned changes. Inspect the final
diff and follow repository-required checks. Report failed delivery separately from
a verified implementation; a created PR does not imply deployment success.

## Make review easy

Lead the handoff or PR with the user problem and resulting behavior. Include:

- The primary task and what became easier, clearer, or more consistent.
- The recommended structure and any material tradeoff.
- Relevant reference evidence and adaptations when they explain a decision.
- Before/after screenshots at useful widths and interaction evidence where needed.
- Checks performed, results, and remaining verification or research gaps.
- Artifact, PR, preview, or deployment links as applicable.

Use established documentation locations. Keep exploratory notes in task state
unless a durable brief or rationale benefits maintainers. Avoid adding process
documents merely to demonstrate that phases ran.

## Close the loop deliberately

Stop once the agreed criteria pass and authorized delivery is complete. Record
future research questions without extending the task automatically.

When actual feedback or usage data is available, compare it with the original
success criteria. Distinguish one user's preference from a recurring task failure.
Choose the next bounded improvement by user impact and confidence in the evidence,
then return to investigation with a new or updated brief. Evaluate conventions
against the selected design mode and the current user goal.
