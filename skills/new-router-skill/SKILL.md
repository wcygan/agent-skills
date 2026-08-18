---
name: new-router-skill
description: >-
  Scaffold and compose a router-style skill in .agents/skills — validate the
  name, generate the SKILL.md plus references/ and scripts/ tree with a
  UV-runnable Python script, and write the body to the writing-for-agents
  discipline. Use when creating a skill whose job is to route among other
  skills, or to standardize a small skill with reference files and Python
  scripts.
license: MIT
compatibility: Requires uv for the scaffold script; manual tree creation works without it.
metadata:
  author: William Cygan
  version: 0.1.0
---

# new-router-skill

Stand up a router-style skill that is **composed, not just scaffolded**: the
script builds the standardized tree, and the body and references are written to
the disciplines they encode. The tree ships with a valid name, pointer-strong
description, and a router-shaped body skeleton.

## Gate first — is it really a router?

A router earns its shape when classification is the hard part and one
specialist should own the work. Check the request against the composition bar
before scaffolding:

- **Recognizable trigger** — one family of closely related triggers.
- **Integrated output** — a selected skill plus evidence, or a working tree no
  existing skill produces.
- **Routing decision** — genuinely distinct branches, each with an owner.

If the idea is still half-formed, send it through `ideate-orchestrator-skill`
for the read-only composition brief and return with the blueprint. If the skill
is a generic (non-router) addition to this repo's catalog, use `new-plugin`
instead. Only a router proceeds past the gate — the gate's answer is one
sentence of justification written before any file appears.

## The flow

1. **Gate** — decide router vs not; record one justification sentence.
2. **Map the routes** — build the routing map: every branch, its predicate, its
   one owner. The craft lives in `references/routing.md`.
3. **Scaffold** — run the script to build the tree and validate the name.
4. **Compose** — write the body and any scripts to the disciplines in
   `references/writing-for-agents.md` and `references/scripting.md`.

### Step completion criteria

- **Gate done** — one sentence justifies the router shape, or the request was
  routed away with the reason stated.
- **Map done** — every branch has exactly one predicate and one named owner; no
  two branches overlap; no branch routes nowhere.
- **Scaffold done** — the script exits 0, the name passes Agent Skills
  validation, and the tree holds `SKILL.md` plus `references/` and `scripts/`
  (each seeded so it survives git).
- **Compose done** — the description reads as a context pointer (what + when);
  the body has no no-op lines; every rule is phrased positively; detail lives
  behind pointers in `references/` (see `references/writing-for-agents.md`).

## Scaffold

```bash
uv run skills/new-router-skill/scripts/new_router.py my-router \
  --description "Picks the right database skill. Use when a request touches Postgres or MySQL."
```

The default target is `~/.agents/skills` (the installed router-skill home).
Pass `--target skills` to scaffold inside this repo's catalog instead. The
script refuses invalid or already-existing names before writing anything; the
full flag list and script conventions are in `references/scripting.md`.

## Authority

- May create files under the scaffold target only.
- The scaffolded tree is a start, not a finished skill: the body is composed
  in this pass, never shipped as the raw template.
- Never install, publish, or register the new skill — that is the user's next
  step, or the repo's distribution flow.

## References

- `references/routing.md` — how to shape the routing map and the router body.
- `references/scripting.md` — how the UV Python scripts are written.
- `references/writing-for-agents.md` — how the body is composed.
