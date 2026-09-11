---
name: skill-intake
description: "Assess a rough skill idea, choose whether to create or extend a skill, and prepare an implementation handoff."
license: MIT
metadata:
  author: William Cygan
  version: "0.1.0"
---

# Skill Intake

Turn rough observations into a decision about reusable automation and, when a
skill is warranted, an implementation-ready handoff for `new-plugin`.

## Intake scope

Treat intake as a read-only planning task. Preserve the user's notes and current worktree.
The deliverable is a decision, a structured brief, and a self-contained handoff.

Stop after the handoff when the request covers intake only. If the user also
requests implementation, continue with the handoff within the existing authorization.

## Accept unstructured input

Do not require the user to rewrite their thoughts as requirements. Extract
signal from fragments, examples, complaints, repeated steps, desired outcomes,
and half-formed automation ideas.

Preserve:

- the user's motivation and language;
- concrete examples of the manual or repeated process;
- current commands, tools, artifacts, or workarounds;
- where judgment, context, or iteration is required;
- failure, risk, or frustration that makes the process costly; and
- explicit preferences about scope, technology independence, authority, or
  output.

Separate user-stated facts from assumptions. Do not invent repetition,
authority, or pain merely to justify a skill.

## Reconstruct the actual job

Describe the observed process as:

```text
trigger -> inputs and context -> repeated actions and decisions
-> evidence or result -> cleanup or next state
```

Identify:

- who or what initiates the process;
- how often or under what conditions it recurs;
- inputs, prerequisites, and evidence sources;
- deterministic steps versus judgment-heavy decisions;
- manual context switches, fragile knowledge, and failure modes;
- outputs and the condition that makes the work complete;
- side effects, external systems, secrets, or authority transitions; and
- parts already automated or owned by an existing tool.

If the notes contain several jobs with different triggers or outputs, keep them
separate until the split decision is made.

## Decide the right destination

Choose exactly one primary intake decision:

- **create:** add a new skill with a distinct recurring job;
- **extend:** add the workflow to an existing skill that already owns it;
- **split:** create or extend multiple independently triggered skills;
- **script:** add deterministic repository automation without a new skill;
- **document:** capture a stable checklist, contract, or runbook;
- **one-off:** handle the current task without creating reusable machinery; or
- **defer:** wait for a material scope, evidence, or authority decision.

Read `references/intake-rubric.md` before deciding. Explain why the selected
destination is better than the nearest alternative. Do not default to
`create` simply because the user called the idea a skill.

## Inspect catalog overlap

When the target skill catalog is accessible:

1. Read repository instructions and current dirty state.
2. Search immediate `skills/*/SKILL.md` descriptions for matching triggers and
   outcomes.
3. Read the bodies and only the relevant references of nearby candidates.
4. Compare ownership, workflow, output, authority, and stopping condition.
5. Decide whether the idea is new, an extension, or should be split.

Do not treat a shared keyword as overlap when the jobs differ. Do not create a
second skill merely because the existing one uses a different example.

If the catalog is unavailable, report the overlap uncertainty and use available descriptions to continue the brief. Pause authoring only when unresolved ownership would materially change which skill should be created or extended.

## Define one bounded skill job

For each proposed skill, formalize:

- **name:** lowercase, hyphenated, concise, and preferably verb-led;
- **job:** one sentence describing the transformation it performs;
- **trigger:** requests and situations that should activate it;
- **non-trigger:** nearby work it deliberately does not own;
- **inputs:** required artifacts, context, repositories, or user choices;
- **workflow:** outcomes and decision criteria, with ordered steps where required;
- **output:** concrete artifact, report, change, or verified state;
- **authority:** read-only behavior and conditions that permit implementation;
- **completion:** required result and the evidence that proves it;
- **pause conditions:** specific missing decisions, permissions, or external dependencies;
- **edge cases:** variants that materially change the workflow; and
- **relationship:** overlap or composition with existing skills.

Prefer one primary job with a clear stopping condition. Split an idea when
parts activate independently, require different authority, produce different
outputs, or need unrelated reference material.

## Draft activation metadata

Write a short `description` that states the capability and the task that needs it.
Put the distinguishing trigger early so shortened descriptions retain the boundary.
Keep procedures, resource lists, and detailed outputs in the body or references.
Add exclusions only when they prevent likely selection errors.

Do not put essential activation rules only in the future skill body. Avoid
marketing language, vague claims such as “improve code,” and descriptions that
trigger on nearly every software task.

Provide representative trigger prompts and plausible nearby non-triggers that expose the selection boundary. Preserve strong examples from the user's notes.

## Select reusable resources

Propose only resources that reduce repeated work or context:

- use `references/` for detailed decision frameworks, domain contracts,
  patterns, schemas, or examples loaded on demand;
- use `scripts/` for deterministic operations that otherwise require
  repeatedly rewritten code or fragile command sequences;
- use `assets/` for templates or files copied into final outputs; and
- use no extra resources when the core workflow fits clearly in `SKILL.md`.

Name each proposed file and state why it is needed.
For each reference, state when to read it. Keep shared constraints in the entrypoint.
Use a minimal router only when substantial workflows need separate guidance.
Do not add a script merely to rename an existing command. Do not add README, changelog, installation, or
process-history files inside the skill.

## Ask only discriminating questions

Make reasonable, labeled assumptions from the notes. Ask the user a question
only when its answer can change:

- the primary intake decision;
- whether one or several skills are needed;
- the authority or external side effects;
- the target output or completion condition; or
- a fundamental technology-independent versus technology-specific boundary.

Ask at most three short questions at once. Do not ask the user to restate
information already present or fill every field in a template.

If progress is possible without an answer, produce the intake with assumptions
and place unresolved decisions in the handoff.

## Produce the intake brief

Report the primary decision and why it fits better than the nearest alternative. Preserve the source motivation, overlap findings, proposed job and trigger, authority, completion evidence, conditional resources, and material open decisions. Include representative trigger and nearby non-trigger examples; choose enough to expose the actual boundary rather than filling a quota.

When the brief will travel to another session, use `references/handoff-template.md` to make it self-contained. When implementation continues in this session, use the brief directly without restating it as a second full prompt. Intake-only work ends with the decision and handoff; already-requested implementation proceeds within existing authority.
