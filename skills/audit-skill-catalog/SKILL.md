---
name: audit-skill-catalog
description: Audit a local project skill catalog for overlapping, fragmented, or poorly routed skills. Use when a workspace has folders such as `.agents/skills`, `.claude/skills`, `.codex/skills`, or `skills/`, users cannot find the right skill, or maintainers need safe merge candidates, umbrella skills, routers, or taxonomy improvements. Produce a read-only catalog rationalization report and semantic tree; do not modify skills.
license: MIT
metadata:
  author: William Cygan
  version: "0.1.0"
---

# Audit Skill Catalog

Audit one skill catalog. Return a rationalization report. Do not change the
catalog.

## Keep the audit read-only

- Inspect skill files, catalog metadata, and repository state.
- Do not create, edit, move, merge, delete, install, publish, commit, or push.
- Do not run a companion skill that changes files or external state.
- Stop when catalog access, evidence, or an authority decision is missing.

## Preserve the distribution contract

Agent Skills discovery is flat. A distributed skill must remain at
`skills/<name>/SKILL.md`.

Use a semantic tree, not nested distributable directories. A tree branch can
be one of these forms:

- **umbrella:** owns an integrated outcome from several specialists;
- **router:** selects one specialist and stops; or
- **documentation group:** helps discovery but invokes no workflow.

Do not call a documentation group a skill. Do not create an umbrella that only
lists its children.

Read `references/rationalization-rubric.md` before you classify candidates or
propose a tree.

## Define the audit boundary

Start with local workspace catalogs. Do not inspect a user-level catalog unless
the user names it.

1. Use an explicitly named catalog root when the user provides one.
2. Otherwise, search the working directory and its ancestors for the nearest
   `.agents/skills` directory.
3. When none exists, search the working directory for `.claude/skills`,
   `.codex/skills`, and `skills/` directories.
4. Select one catalog root. Ask the user to choose when several candidates have
   equal priority.
5. Record the selected root, discovery rule, and source files inspected.
6. Record the worktree state without changing it.
7. Record user goals, known confusion, and any compatibility constraints.
8. List constraints that limit confidence, such as unavailable usage evidence.

Stop and report the limitation when the catalog root or skill instructions are
unavailable.

## Inventory skill ownership

For every immediate catalog skill, inspect its frontmatter and relevant body.
Record these facts:

- trigger;
- job;
- primary output;
- authority;
- stop condition;
- named companions; and
- user-visible name and installation impact.

Read detailed references only when they can change the ownership comparison.
Do not infer duplication from a shared keyword, tool, or domain.

## Compare candidates

1. Group skills with related triggers or outcomes.
2. Compare each group against the rubric.
3. Classify each skill or group as **retain**, **merge**, **extend**,
   **umbrella**, **router**, **rename**, or **document**.
4. Give evidence for the classification and name its nearest alternative.
5. Reject a merger when inputs, authority, output, or stopping conditions differ.

Use `ideate-orchestrator-skill` only after this audit identifies a valid
umbrella candidate. Use `ask-matt` when the work is only request routing.

## Design the semantic tree

Propose the smallest tree that improves discovery. Every branch must state:

- its predicate;
- its form: umbrella, router, or documentation group;
- its owned output or routing result; and
- its child skills or groups.

Keep each leaf as one installable immediate child of `skills/`. A leaf can
appear in only one primary branch. Use cross-references instead of duplicate
placement.

## Report and stop

Return this report:

```markdown
## Catalog rationalization report

### Audit boundary

- Catalog:
- Discovery rule:
- Evidence sources:
- Constraints:

### Inventory summary

### Candidate decisions

| Skills | Decision | Evidence | Nearest alternative | Compatibility risk |
|---|---|---|---|---|

### Semantic tree

```text
branch node (documentation group, router, or umbrella)
  leaf skill
```

State each branch predicate and form below the tree.

### Rejected candidates

### Migration order

### Open decisions
```

For each merge, state whether old names need a compatibility router or a major
catalog change. For each umbrella, state the integrated output that makes it a
real skill. For each router, state the selection result and stopping condition.

Stop after the report. Hand approved implementation work to a separate session.

## Examples

Use this skill for requests such as:

- “Which skills should we merge under broader umbrellas?”
- “Audit this flat skill catalog and propose a hierarchy.”
- “Find duplicate skills and recommend routers or umbrella skills.”
- “Review the `.agents/skills` directory in this project.”

Do not use this skill for these requests:

- “Design an orchestrator for these three known skills.”
- “Which skill should I use for this request?”
- “Implement the approved catalog consolidation.”
- “Audit every skill I have installed globally.”
