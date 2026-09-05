# Handoff Template

Use this reference to produce a prompt another session can execute without
access to the intake conversation. Replace every angle-bracket marker and
remove instructions that do not apply.

## Contents

- Create handoff
- Extend handoff
- Non-skill handoff
- Acceptance criteria
- Validation contract
- Readiness checklist

## Create handoff

```markdown
Work in the agent-skills repository that contains `skills/new-plugin`. Read and
follow the repository's `AGENTS.md` before making changes.

Use `skills/new-plugin` to create `<skill-name>`.

## Goal

<One concrete job-to-be-done and why it is reusable.>

## User context

<Condensed motivation, current manual process, representative examples, and
constraints. Preserve important user terminology.>

## Proposed description

<Complete frontmatter description containing what the skill does and when to
use it.>

## The skill owns

- <Owned trigger, decisions, workflow, and output.>

## The skill does not own

- <Nearby work and non-triggers.>

## Workflow criteria

- <Required outcomes and decisions; specify order only where dependencies or risk require it.>

## Authority and safety

- <Existing authorization, permitted recovery, external actions, and specific conditions requiring user input.>

## Output contract

- <Required result, verification evidence, and correction needed before completion.>

## Resources

- `SKILL.md`: <core workflow responsibility>
- `references/<file>.md`: <why detailed guidance is needed>
- `scripts/<file>`: <deterministic contract and test requirement>
- `assets/<file>`: <how the output uses it>
- <State explicitly when a resource category is unnecessary.>

## Representative triggers

- “<Natural user request>”

## Non-triggers

- “<Plausible nearby request owned elsewhere>”

## Edge cases and assumptions

- <Material variant, unresolved evidence, or assumption to verify.>

## Implementation requirements

1. Inspect current catalog descriptions and relevant nearby skill bodies for
   overlap before scaffolding.
2. Preserve existing dirty-worktree changes and avoid unrelated refactors.
3. Scaffold with `skills/new-plugin/scripts/new_plugin.py` and valid matching
   frontmatter.
4. Keep `SKILL.md` concise and imperative; move only justified detail into
   one-level `references/`, `scripts/`, or `assets/` paths.
5. Do not add client-specific metadata or an Agent Plugins manifest unless the
   user explicitly requests it.
6. Update the root README skill index.
7. Do not commit, push, publish, deploy, or change external systems.

## Acceptance criteria

- <Behavior-specific criteria derived from the intake.>
- `skills/<skill-name>/SKILL.md` exists and its name matches the directory.
- Description includes both capability and trigger contexts.
- Every referenced resource exists and has a stated purpose.
- The skill has a concrete output and stopping condition.
- No placeholders, process-history files, or unjustified resources remain.

## Validation

- Run `uv tool run --from skills-ref agentskills validate ./skills/<skill-name>`.
- Run `gh skill publish --dry-run`.
- Install from the local checkout into a unique scratch directory with
  `gh skill install . --from-local --all --dir <scratch-directory>`.
- Verify the installed `SKILL.md` and every referenced file explicitly.
- Run `git diff --check` and report pre-existing warnings separately.

Complete the implementation and required checks. Fix failures caused by the change and rerun affected checks within the authorized scope.

Report the files created, validation evidence, assumptions, and residual gaps.
```

Use repository-relative paths. Replace `<scratch-directory>` with a safely
created unique path in the implementation session rather than leaving it as a
literal placeholder in the final generated prompt.

## Extend handoff

Use the create template with these changes:

- say “Use `skills/new-plugin` conventions to update `skills/<existing>/`”;
- identify the exact existing workflow and why it owns the addition;
- state which `SKILL.md` section or reference responsibility changes;
- prohibit scaffolding a new sibling skill;
- require backward-compatible trigger and output review;
- require validation of the updated skill and full installer discovery; and
- preserve unrelated content and vendored markers.

The generated prompt must contain the existing skill name and exact proposed
addition, not generic extension instructions.

## Non-skill handoff

For `script`, `document`, `one-off`, or `defer`, generate:

```markdown
Do not invoke `skills/new-plugin` for this task. The skill intake concluded
`<decision>` because <evidence-backed reason>.

Work in <repository or scope> and follow its repository instructions.

Goal:
<recommended action>

Context:
self-contained source notes and constraints

Required work:
ordered, bounded steps

Authority and side effects:
explicit limits

Acceptance criteria:
observable completion

Validation:
safe, relevant checks

Do not commit, push, deploy, or mutate external systems unless explicitly
requested.
```

For `defer`, replace required work with the exact decision or evidence needed
before implementation.

## Acceptance criteria

Add behavior-specific criteria before repository-format criteria. Include:

- trigger and non-trigger separation;
- authority and mutation boundary;
- expected output;
- stop conditions;
- resource justification;
- relevant edge cases;
- catalog overlap resolution; and
- validation proportional to the skill's risk.

Keep descriptions short, with the distinguishing task condition early. State when
each reference applies. Preserve mandatory checks without adding repeated tests
that have no new change, failure, or unresolved concern to investigate.

Do not use “works correctly,” “comprehensive,” or “production ready” without
observable evidence.

## Validation contract

The handoff should request:

1. reference-library validation of the target skill;
2. repository-wide publication dry run;
3. actual local installer discovery into a unique scratch directory;
4. explicit installed-file checks without error-masking wildcards;
5. placeholder and broken-reference search;
6. diff whitespace validation; and
7. a final report that separates new failures from pre-existing warnings.

Add runtime or forward tests only when the skill contains scripts, fragile
automation, or judgment that needs representative validation. Keep any such
test isolated and bounded.

## Readiness checklist

Before emitting the handoff, confirm:

- another session can understand the motivation without prior chat;
- every path, name, and command is concrete;
- all template markers were replaced;
- create versus extend versus non-skill action is unambiguous;
- the prompt does not authorize implementation beyond intake scope;
- repository preservation and no-commit rules are explicit;
- acceptance criteria test the actual job;
- validation includes the distribution path; and
- unresolved decisions are labeled rather than silently assumed.
