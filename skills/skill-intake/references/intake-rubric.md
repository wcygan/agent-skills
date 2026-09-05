# Skill Intake Rubric

Use this rubric to decide what reusable artifact, if any, the user's notes
justify. Apply judgment; the criteria are evidence prompts, not a scoring game.

## Contents

- Skill-worthiness
- Create versus extend
- Split decisions
- Script and documentation alternatives
- One-off and defer
- Scope quality
- Resource selection
- Decision record
- Red flags

## Skill-worthiness

A skill is a strong fit when several of these are true:

- the job recurs across tasks, repositories, or sessions;
- activation can be described with recognizable requests or situations;
- completion has a concrete artifact, decision, or verified state;
- agent judgment, investigation, or adaptation materially helps;
- non-obvious procedural knowledge or guardrails improve reliability;
- inputs and side effects can be bounded;
- the workflow benefits from reusable references, scripts, or assets; and
- the skill can stop without becoming a permanent general assistant.

Weak repetition can still justify a skill when failure is expensive or the
required knowledge is easy to lose. High frequency alone does not justify a
skill when a deterministic command solves the entire problem.

Identify what the skill adds beyond ordinary model behavior. Generic encouragement
or an elaborate recipe alone does not establish reusable value.

Consider the models and environments that will consume the skill. Preserve proven
safeguards while removing instructions that add work without improving results.

## Create versus extend

Prefer `extend` when an existing skill already shares:

- the same user-visible trigger;
- the same job-to-be-done;
- the same authority boundary;
- the same primary output; and
- a workflow that can absorb the new variant without becoming conditional
  clutter.

Prefer `create` when the proposal has a distinct trigger or output, needs
materially different evidence or authority, or would force most users of the
existing skill to load irrelevant instructions.

Shared words, tools, or repositories do not prove overlap. Compare the
transformation performed.

## Split decisions

Split when the notes contain jobs that:

- can be invoked independently;
- have different stopping conditions;
- produce different artifact types;
- require different mutation or external authority;
- need unrelated references or scripts;
- would have competing trigger language; or
- are useful to different audiences.

Keep variants together when they share one trigger, outcome, and workflow but
select among a small number of patterns after activation.

For a split, recommend the smallest foundational skill first. Do not create a
suite merely because future variants are imaginable.

## Script and documentation alternatives

Choose `script` when:

- inputs and outputs are explicit;
- the same deterministic operation is repeatedly rewritten;
- judgment is minimal once arguments are supplied;
- failures can be represented by stable exit status and artifacts; and
- a task-runner recipe or existing command cannot already expose it.

A small skill may still wrap a script when the user needs judgment to select,
scope, or interpret the operation.

Choose `document` when the durable value is a stable contract, checklist,
runbook, or explanation that people and agents can follow without adaptive
reasoning. Prefer repository-native documentation when the knowledge belongs
to one project rather than every installation of the skill.

## One-off and defer

Choose `one-off` when the process is unlikely to recur, depends entirely on
current transient context, or costs less to perform than maintain as reusable
machinery.

Choose `defer` when a material unknown changes the job:

- the user has not chosen the desired output;
- necessary authority or side effects are unclear;
- the process itself cannot yet be reproduced or explained;
- catalog ownership cannot be determined;
- the proposal combines incompatible scopes; or
- required external contracts are unavailable.

State the smallest decision or evidence needed to resume.

## Scope quality

A well-bounded proposed skill can answer:

1. What user request or situation activates it?
2. What transformation does it own?
3. What nearby work does it exclude?
4. What evidence or inputs does it require?
5. What concrete output or state means done?
6. What authority does it have by default?
7. What causes it to stop or ask?
8. Which instructions are reusable rather than ordinary model knowledge?

If most answers are “anything,” “it depends,” or “better,” narrow the job.

## Resource selection

Use a reference when detailed content is useful only for a branch, domain, or
output variation. Keep shared constraints in `SKILL.md`. State when each reference should be read.

Use a script when deterministic reliability, stable parsing, or repeated code
justifies maintenance. Specify inputs, output, side effects, errors, timeout,
isolation, and test plan.

Use an asset when the skill copies or adapts a template, visual, schema, or
boilerplate into the final output. Assets are not hidden instruction files.

Use nothing extra when another intelligent agent can execute the core workflow
from a concise `SKILL.md` without rediscovering specialized facts.

## Decision record

Record:

```text
decision:
evidence of repetition or reusable value:
job and output:
nearest existing skill or alternative:
why selected:
important assumption:
cost or risk of being wrong:
next validation:
```

Use confidence labels such as high, medium, or low only with an explanation.

## Red flags

Reconsider a skill proposal when:

- the name is “assistant,” “best practices,” “everything,” or another
  unbounded role;
- the description would trigger on most software tasks;
- the workflow is only generic advice the model already knows;
- a new framework is proposed without demonstrated repetition;
- automation hides failures or broadens authority;
- the skill duplicates a task runner, script, or existing skill;
- resources are process history rather than runtime guidance;
- implementation and review are combined without a shared output;
- examples are invented but no real user scenario exists; or
- success cannot be distinguished from activity.
