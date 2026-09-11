---
name: new-router-skill
description: "Create a skill that selects among distinct specialist workflows. Use when authoring a router with clear branch conditions and owners."
license: MIT
compatibility: Requires uv for the scaffold script; manual tree creation works without it.
metadata:
  author: William Cygan
  version: 0.1.0
---

# Create a router skill

A router is useful when classification is the hard part and one specialist owns each selected branch. If several specialists must produce a combined result, design an orchestrator instead. If an existing skill already covers the trigger and result, extend it.

Use `ideate-orchestrator-skill` when composition needs exploration; a clear request can proceed directly. Read `references/routing.md` when defining branches, tie-breaking conditions, and owners.

## Scaffold

For this repository's catalog:

```bash
uv run skills/new-router-skill/scripts/new_router.py my-router \
  --target skills \
  --description "Selects database guidance. Use when a task needs either PostgreSQL or MySQL expertise."
```

The default target remains `~/.agents/skills`; use it only when authoring an installed skill is requested. `--target` and `--author` retain their existing behavior. The script rejects invalid names and existing skill files, and creates only `SKILL.md`. Add references and scripts when there is real content for them.

## Compose and complete

Write observable branch conditions and a clear owner for each route. Define how to resolve overlap and what to do when no branch matches. Keep essential selection criteria in the entrypoint so routing does not require loading every specialist.

Use `writing-for-agents` when available. Read `references/writing-for-agents.md` for the self-contained authoring essentials, and `references/scripting.md` only when adding or changing a helper script.

The finished skill should state its purpose, selection criteria, essential knowledge, completion evidence, and authority. A missing companion alone should not block work that can be completed with available capabilities and evidence. Identify what remains unsupported and pause only the dependent work when an essential requirement is missing.

Deliver a composed skill with working relative resource pointers, not the raw scaffold. Follow applicable repository validation requirements and report skipped checks. Continue any installation or packaging already requested; otherwise creating the skill does not imply installing or publishing it.
