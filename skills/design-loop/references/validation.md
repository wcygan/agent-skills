# Validate the user task

Read before evaluating wireframes, prototypes, or implemented UI.

## Build an evidence matrix

For each acceptance criterion record the baseline, check, result, and evidence
location. Use criteria grounded in the brief, for example:

| Claim | Appropriate evidence |
|---|---|
| Primary task completes | Exercise the path with representative data and verify resulting state |
| An unnecessary step is removed | Compare baseline and candidate paths while preserving required decisions |
| Controls remain reachable on mobile | Inspect and exercise a narrow viewport with realistic content |
| Keyboard users can complete the task | Traverse controls, activate actions, and check focus after transitions |
| Failed submissions preserve work | Trigger the relevant failure and verify input plus recovery |
| Interface follows the selected design system | Compare tokens, components, labels, states, and navigation across in-scope screens; use existing screens as the reference only in improve mode |

## Inspect the rendered artifact

Open the candidate at representative wide and narrow widths and at content-driven
breakpoints. Check reading order, wrapping, overflow, alignment, content density,
action visibility, long content, and zoom. Capture useful evidence after fixes.

Exercise implemented controls and transitions. Check form labels, semantic
structure, visible focus, keyboard order, accessible names, and dialog focus
handling where relevant. Check contrast when applying actual visual styles.
Automated accessibility checks supplement manual interaction.

For a wireframe, validate structure and implemented click paths; record behavior
deferred to implementation. For a prototype, distinguish simulation from backend
integration. For production code, verify actual state changes and run the project's
required checks. Add behavioral regression tests where the changed interaction
warrants them; choose direct visual inspection for simple spacing changes.

## Evaluate friction and comprehension

Can a user identify the next action, understand its consequence, recover from a
mistake, and tell when the task is complete? Check competing actions, unexplained
terms, repeated input, unnecessary confirmation, hidden essential controls, and
context lost between screens. Rank findings by impact on the primary task.

Fix task blockers first, then meaningful consistency and readability problems.
Revise the structure when cosmetic changes cannot address the failure. Follow the
corrective-pass budget in SKILL.md; end each pass with a criterion-level result.

## Respect evidence limits

Agent inspection supports functional and heuristic findings. It does not prove
real-user comprehension, satisfaction, task speed, or conversion. Report those
claims only with appropriate user-study or usage evidence. When research is in
scope, use a representative task with participants and record observations;
obtain any required outreach authorization before recruiting or messaging.

When a required environment or tool is unavailable, report the exact unverified
criterion and finish checks that remain possible. Preserve failures and uncertainty
in the handoff instead of silently replacing required evidence with a screenshot.
