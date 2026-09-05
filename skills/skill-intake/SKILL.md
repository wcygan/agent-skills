---
name: skill-intake
description: Assess a rough skill idea, choose whether to create or extend a skill, and prepare an implementation handoff.
license: MIT
metadata:
  author: William Cygan
  version: "0.1.0"
---

# Skill Intake

Turn rough observations into a decision about reusable automation and, when a
skill is warranted, an implementation-ready handoff for `skills/new-plugin`.

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

If the catalog is unavailable, state that overlap review remains an explicit
implementation-session gate.

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

Provide at least three representative trigger prompts and two plausible
non-trigger prompts. Preserve strong examples from the user's notes.

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

Use this structure:

```markdown
## Intake decision

Decision:
Confidence:
Why:
Nearest alternative:

## Source notes

Motivation:
Observed repeated process:
Concrete examples:
User constraints:
Assumptions:

## Proposed skill contract

Name:
Job:
Description:
Triggers:
Non-triggers:
Inputs:
Workflow:
Output:
Authority:
Completion evidence:
Pause conditions:
Edge cases:
Existing-skill relationship:

## Resource plan

SKILL.md:
References:
Scripts:
Assets:

## Open decisions

...
```

For `extend`, name the existing skill and describe the narrow addition. For
`split`, provide one compact contract per skill and recommend an implementation
order. For `script`, `document`, `one-off`, or `defer`, omit fictional skill
metadata and explain the recommended next action.

## Generate the paste-ready handoff

Read `references/handoff-template.md` and produce a fenced prompt after the
brief.

For `create`, `extend`, or `split`, direct the implementation session to work
in the agent-skills repository and use `skills/new-plugin`. Replace every
template marker with intake-derived content. A `split` decision needs one
self-contained handoff per proposed skill unless a shared ordering constraint
requires one staged prompt.

For a non-skill decision, produce a self-contained next-step prompt for the
recommended script, documentation, one-off task, or missing decision. State
explicitly that `skills/new-plugin` should not be invoked.

The handoff must include:

- goal and condensed user context;
- exact proposed name and description;
- owned and excluded behavior;
- workflow, authority, output, and edge cases;
- resource files with purpose;
- representative triggers and non-triggers;
- repository-preservation rules;
- acceptance criteria;
- validation commands; and
- unresolved assumptions that the implementation session must verify.

Do not write “as discussed above,” “use the prior context,” or otherwise depend
on this conversation.

## Verify handoff readiness

Before reporting, confirm:

- the decision is explicit and justified;
- the proposed name and description match the job;
- instructions add useful knowledge beyond ordinary model behavior;
- triggers and non-triggers separate nearby skills;
- completion includes required verification and correction, with separate pause conditions;
- authority preserves existing permission without adding routine approval stops;
- every proposed resource has a purpose;
- the handoff contains no unresolved placeholders;
- paths are repository-relative rather than machine-specific;
- validation covers reference compliance and actual installer discovery; and
- the implementation session can proceed without the original conversation.

If a blocking decision prevents a valid handoff, produce the strongest partial
brief, state the blocker, and ask only the necessary question.

## Examples

- Turn “I keep manually chasing a request across services and drawing it for
  people” into a create decision for a scenario-specific tracing skill.
- Turn “add another database checklist” into an extend decision when an
  existing database skill already owns that engine and workflow.
- Turn “I want a skill that scaffolds files and also reviews architecture” into
  a split decision because generation and review have different triggers and
  outputs.
- Turn “run these three fixed formatting commands” into a script decision
  rather than a judgment-free skill.
