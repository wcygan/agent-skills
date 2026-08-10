---
name: pr-guidelines
description: Evaluate one pull request for concise description structure, testing evidence, naming consistency, reviewability, code-quality signals, CI state, stack context, and whether its scope should be split. Use when preparing, checking, or improving an individual PR, including stacked or AI-generated changes.
license: MIT
---

# PR Guidelines

Evaluate one pull request as a review artifact. Keep the result high-level and actionable. This skill owns PR presentation, evidence quality, reviewability, and split signals; use `code-review` for deep Standards and Spec correctness.

Default to observation. Do not edit the title, body, commits, branch, labels, reviewers, or code unless the user separately authorizes that change.

## Repository conventions win

First inspect the repository's contribution guide, pull-request template, `AGENTS.md`, CI policy, and established naming configuration. Apply explicit repository rules before the defaults below.

If no title convention is configured, report `title convention: not configured`. Do not invent a convention from a small sample of historical PRs.

If no branch convention is configured, prefer `<topic>/<concern>` for stack layers, where the topic stays stable and the concern changes by layer.

## Required description shape

The default body contains exactly these non-empty H2 sections, once each and in this order:

```markdown
## Problem & Solution Overview

Briefly state the user or engineering problem, the chosen approach, and the important boundary or tradeoff.

## Testing Done

List concrete commands, checks, or manual scenarios and their outcomes. If testing was not run, say so and explain why.
```

Descriptions should be brief, high-level, and descriptive. Prefer the smallest explanation that lets a reviewer understand why the change exists, what changed conceptually, and how confidence was established. Do not turn the body into a file-by-file changelog.

## Preferred presentation

Strongly prefer ASD-STE100 Simplified Technical English for PR descriptions:

- Use active voice, simple verb forms, approved words, and consistent terms.
- Write one topic in each paragraph.
- Limit descriptive sentences to 25 words.
- Limit instructions to 20 words.
- Keep noun groups to three words when possible.

Use structured content and progressive disclosure when they improve scanability:

- Prefer Markdown tables for repeated or comparable facts.
- Use tables for test commands, outcomes, environments, and evidence links.
- Use short headers and one fact type in each column.
- Use `<details>` blocks for optional logs, screenshots, failure context, or implementation notes.
- Write a descriptive `<summary>` line for each `<details>` block.
- Put the problem, solution, important tradeoff, test outcomes, and known gaps outside collapsed content.
- Put a visible result summary before its supporting `<details>` block.

Treat these formats as strong defaults, not rigid requirements. Clear prose is acceptable when a table or collapsed section would add friction.

### Stacked PRs

When a PR belongs to a stack, get the authoritative order from `gh stack view --json`. Do not infer order from PR numbers.

Under `Problem & Solution Overview`, strongly prefer a `### Stack` table in every stack layer:

| Order | PR | Purpose | Main change areas |
|---|---|---|---|
| 1, merges first | PR link | Foundation purpose | Modules or directories |
| 2, current | **Current PR link** | Current purpose | Modules or directories |
| 3, merges last | PR link | Final purpose | Modules or directories |

- List the stack from bottom to top in merge order.
- Link each created PR and mark the current layer.
- Include one clear purpose for each layer.
- Name change areas at the module or directory level.
- Include verified state only. Omit status when nobody will maintain it.
- Keep the same stack table in each PR and update it after order or link changes.

For a broad current layer, add a `### Change map` table after the stack table:

| Area | Paths | Change | Review focus |
|---|---|---|---|
| Concern | Main modules or directories | Conceptual change | Risk or decision to inspect |

- Cover the current PR only.
- Group rows by review concern, not by file type.
- Put exact file lists or extended notes in a supporting `<details>` block.
- Keep generated files and mechanical changes separate from semantic changes.

Recommend a stack table when missing context makes navigation difficult. Recommend a change map when broad changes obscure review ownership.

Flag:

- missing, duplicated, reordered, or empty required sections;
- placeholder text or claims unsupported by named evidence;
- vague testing such as “tests pass” without the relevant command or scenario;
- dishonest omission when tests were not run;
- implementation detail that obscures the problem and solution.

## Review procedure

### 1. Check presentation

Inspect title, branch, body headings, body length, linked context, draft state, and stack position. Report repository-rule violations separately from personal defaults.

Recommend structured formatting when dense prose obscures comparable facts or optional detail obscures the summary. Do not lower the verdict for clear prose alone.

### 2. Check testing evidence

Distinguish:

- **reported evidence:** what the PR body claims;
- **observed CI:** checks GitHub currently reports;
- **unverified claims:** evidence named but not independently observed;
- **known gaps:** tests not run, skipped coverage, or unavailable checks.

A green CI run does not prove that the body accurately explains testing, and a good body does not prove CI is green.

### 3. Check review state

Summarize requested reviewers, approvals, changes requested, unresolved active threads, outdated threads, comments, and required versus optional checks. Treat active unresolved threads as attention unless repository rules make them blocking.

### 4. Assess scope and cohesion

Use [references/reviewability-rubric.md](references/reviewability-rubric.md). Lines changed are a warning signal, never an automatic split verdict. Downweight generated files, lockfiles, snapshots, vendored code, and mechanical renames.

Recommend splitting only when at least two separable concerns can be named and each can form a coherent, testable layer. When recommending a split, propose a bottom-to-top stack with each layer's purpose and verification boundary.

### 5. Apply the AI-generated path only with evidence

Use [references/ai-generated-code.md](references/ai-generated-code.md) only when the user says the change is AI-generated, the PR explicitly declares it, or an authoritative workflow field says so. Never infer AI authorship from code style.

## Verdicts

Use one presentation verdict:

- `CLEAR`: body, naming, testing evidence, and scope are reviewable.
- `NEEDS POLISH`: presentation or evidence can be improved without restructuring the work.
- `CONSIDER SPLIT`: at least two separable, ordered concerns are identified.
- `UNKNOWN`: the diff, description, or repository rules could not be inspected.

Keep readiness separate from presentation. A well-written PR can still be blocked by CI, review, or stack health.

## Output

Return a compact record:

```text
PR #143  NEEDS POLISH
  Body      Testing section is vague; name the command and result.
  Naming    Title convention not configured; branch follows topic/concern.
  Scope     Cohesive despite 820 changed lines; 610 are generated.
  Review    1 active thread; required checks passing.
  Next      Replace “tests pass” with the exact targeted and integration checks.
```

Do not rewrite the body unless requested. If asked, preserve truth: never manufacture test results or claim review/CI evidence that was not observed.
