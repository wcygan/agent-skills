---
name: new-plugin
description: "Create a skill in this repository or package it as an Agent Plugin. Use when adding a catalog skill, scaffolding a plugin, or checking skill metadata."
license: MIT
---

# Create a catalog skill or plugin

Produce a usable skill at `skills/<name>/SKILL.md`. Choose an existing skill to extend when its trigger, result, and authority already cover the requested capability. Use a router only when distinct branches need different owners.

## Scaffold

From the repository root:

```bash
python skills/new-plugin/scripts/new_plugin.py my-skill \
  --description "What it does and when to use it." \
  --author "Your Name"
```

The generator creates only `SKILL.md`. It rejects invalid names and an existing skill file. Names must match the directory, be 1–64 lowercase letters, digits, or hyphens, and have no leading, trailing, or consecutive hyphens.

Options retain the same interface: `--description`, `--author`, `--license` (default MIT), `--repo-root` (default the containing repository), and `--plugin` (also writes a root `plugin.json`). Use `--plugin` only when packaging is requested, and inspect any existing manifest before replacing it.

## Compose the skill

Use `writing-for-agents` when available for the authoring principles. The essentials for an independently installed copy are:

- Put the capability and distinguishing trigger early in `description`. Keep it within the Agent Skills limit of 1–1024 characters. Preserve explicit-invocation boundaries where needed.
- Explain the purpose, essential domain knowledge, and decisions that change the result. Avoid generic instructions the agent already follows.
- Define completion evidence and authority. A skill phase may end while already-authorized work continues; do not add routine approval stops.
- Specify ordering only where dependencies, correctness, or fragile operations require it.
- Keep shared constraints in `SKILL.md`; put substantial branch-specific detail in references with explicit reading conditions. Create resources only when they contain useful material, and use relative paths from the skill root.
- Treat companion skills as specialists, not automatic prerequisites. Preserve essential evidence or capability requirements when working without one.

Replace the scaffold prompts with actual guidance. Simple skills can be a few paragraphs; the scaffold headings are optional. Keep the entrypoint under about 500 lines without using length as a quality target.

## Completion and distribution

Deliver the completed skill and any resources it actually needs. Preserve supported frontmatter (`name`, `description`, and optional `license`, `compatibility`, `metadata`, `allowed-tools`). Follow the repository's validation and publication requirements; in this repository:

```bash
uv tool run --from skills-ref agentskills validate ./skills/my-skill
just check-full
```

Report checks performed or explicitly skipped under the user's constraints. Installation, commits, and publication follow the requested scope.

Consult the [Agent Skills specification](https://agentskills.io/specification) for uncertain format rules and the [plugin manifest reference](https://agent-plugins.org/plugin-authors/manifest) when packaging a plugin. Read the repository's distribution documentation when preparing an install or release.
