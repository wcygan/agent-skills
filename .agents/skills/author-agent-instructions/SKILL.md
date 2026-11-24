---
name: author-agent-instructions
description: Write, simplify, or review SKILL.md files, AGENTS.md files, and task prompts. Use when deciding where guidance belongs, consolidating overlapping skills, or checking that a rewrite preserves behavior.
---

# Author agent instructions

Start with a request someone would actually make. What should the agent deliver,
who will use it, and what observation would show it worked? Keep instructions
that change a decision, a permission, or the evidence the reader needs. For a
handoff, ask for the result and enough evidence for someone who missed the work.

## Where the guidance belongs

- **One task:** Specify the deliverable, inputs, and stopping point. For visual
  work, give a reference or name the design detail. Specify the viewing size
  or interaction to check.
  Leave reversible choices to the agent. Name any action that needs approval and
  what can proceed while waiting. For an unattended run, define the result to
  verify, including the outcome of any background work it depends on.
- **A standing convention:** Put it in the narrowest applicable `AGENTS.md`.
  Include preferences, approvals, and project workflows the agent cannot infer
  from code or tests. Give a rule its scope and reason. Link to the workflow
  that owns the details.
- **A recurring task:** Look for a skill that already owns it. In `SKILL.md`,
  describe the trigger in the requester’s words. Keep shared decisions in the
  entrypoint and use relative links to specialized commands or examples where
  they first apply. Maintainer-only skills live in `.agents/skills/`. Reserve
  a public entrypoint in `skills/` for a task someone would ask for on its own.

This catalog went from 76 public skills to 15 by keeping `wcygan-mode` as the
engineering entrypoint and moving shared methods and optional outputs to the
skills that use them. When adding, merging, or retiring a skill, use the
[catalog consolidation examples](references/catalog-consolidation.md).

When the task spans apps, identify the records that can settle a decision before
a write. For example, a support ticket may describe a request while the current
policy determines eligibility. Label pasted or retrieved text as source material.
The user’s request determines which actions an agent may take on it.

## Check the edit

When revising an older prompt, identify the behavior each workaround was meant
to correct. Try removing stale cautions, rigid style limits, or blanket
delegation rules. If delegation helps, name the work that can run independently.
When changing models, test reasoning effort on the same task and compare result
quality, latency, and cost. The same setting can behave differently across models.

For a consequential edit, try both versions on the same pair of requests with
different boundaries. For example, “draft a PR” should produce local copy,
while “open a PR” should reach the authorized remote action.
Compare the chosen route, delivered artifact, and stopping point. For a changed
skill, also follow its links and validate its format. Run `just validate-skills`
for the public catalog. For a project-local skill, run
`uv tool run --from skills-ref==0.1.1 agentskills validate <skill-directory>`.

For model-specific guidance, consult OpenAI’s [Codex prompting guide](https://learn.chatgpt.com/guides/prompting-gpt-6-2-astra#keep-your-agentsmd-lean),
[GPT-6.2 model guide](https://developers.openai.com/api/docs/guides/latest-model?model=gpt-6.2-astra#prompting-best-practices),
and Anthropic’s guides for [Claude Fable 5.2](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-fable-5-2)
and [Claude Opus 5.5](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-5-5).
