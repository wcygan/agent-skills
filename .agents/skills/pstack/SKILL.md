---
name: pstack
description: Explain how Lauren Tan's pstack shapes this catalog, the reasoning behind its skills, and where the official sources are; check upstream for changes and port them. Use when asked what pstack is, why a catalog skill is built the way it is, which local skill matches an upstream one, what is new upstream, or to port a pstack change.
---

# Pstack

Pstack is Lauren Tan's (poteto) MIT-licensed skill plugin at
`cursor/plugins`, under `pstack/`. Most of this catalog is a locally maintained
adaptation of it. This skill explains that relationship and how to keep it
current. It is project-local and not part of the published catalog.

## The reasoning behind pstack

Pstack exists to make an agent write less code of higher quality. Its claims:

- **Depth before speed.** An agent that investigates, reproduces, and verifies
  can be trusted alone, and only trusted agents can be run in parallel.
- **A goal and a check, not a script.** The user states the outcome and how
  they will know it is done. One mode skill picks a playbook and calls the
  other skills as its steps need them.
- **Evidence over self-report.** A claim counts when it was observed on the
  real artifact: a failing check before the fix, the feature run after it.
- **Principles are names for complete rules.** Each of the 24 is a skill the
  agent has already read, so a short phrase such as "subtract before you add"
  redirects work. A principle is cited only with the decision it changed.
- **Structure beats instructions.** For a repeated mistake, prefer a design
  that makes it impossible, then a type or lint, then a test, and a written
  rule last, because nothing fails when a rule is skipped.
- **Start small and make it yours.** Add a skill or a check when the same
  failure appears twice. The mode is one person's style, meant to be replaced.

## How this catalog uses it

The catalog keeps pstack's three layers under plain names:

| Layer | Upstream | Here |
| --- | --- | --- |
| Orchestrator | `poteto-mode` and its playbooks | `wcygan-mode` and `playbooks/` |
| Focused skills | `how`, `why`, `architect`, `arena`, `interrogate`, ... | components such as `explain-code`, `explain-history`, `design-options`, `compare-solutions`, `review-changes` |
| Principles | 24 `principle-*` skills | the same 24 names, plus a shared index in `wcygan-mode/references/principles.md` |

The seven `wcygan-*` procedures are local compositions of the adapted
components; upstream has no skill of that shape. Skills such as `uv-python`, `just`, `design-loop`, `mysql`, and
`postgres` do not come from pstack.

What the adaptation changes, and should keep changing when porting:

- Names describe the capability; upstream nicknames are not kept as aliases.
- Model names, harness APIs, fixed install paths, named agents, and
  `disable-model-invocation` are removed. The executing environment supplies
  tools, and a missing capability is reported.
- Nothing publishes on its own. Commits, pushes, pull requests, merges, and
  deploys each need a go-ahead, and a phase change keeps the one already given.
- Fixed counts of verification passes become acceptance evidence for the task.
- A second pass by the same agent is not called an independent review.

The engineering obligations stay: establish behavior before changing it,
compare plausible designs, isolate concurrent writes, inspect artifacts, and
separate verified results from assumptions.

## Find the local equivalent

Each adapted skill records its source in frontmatter (`upstream-revision`,
`upstream-path`), so the frontmatter is the current map:

```sh
grep -l "pstack/skills/<upstream-name>" skills/*/SKILL.md
grep -h "upstream-revision" skills/*/SKILL.md | sort | uniq -c
```

The second command lists the pins. The catalog has several: one for the
components and playbooks, a later one for the principles, and separate ones
for `statechart` and the formal-verification skill. Do not assume one pin.

Upstream skills deliberately left out: `setup-pstack`, `poteto-help`, `teach`,
`typescript-best-practices`, `make-bot-ui`, the Benny automation pack, and the
agent definitions. An upstream skill that the report below lists as unmapped
and that is not in this list has not been considered yet.

## Check upstream for changes

```sh
python3 -B .agents/skills/pstack/scripts/upstream_changes.py --days 14
```

Run it from the repository root; it needs an authenticated `gh` and changes
nothing. It prints the upstream skills no local skill names as a source, the
recent commits under `pstack/skills`, and each changed upstream skill beside
the local skills that name it, with added files called out.

Then read the commits that matter. Most upstream commits are text trims, model
routing, or harness changes that do not apply here. Report new skills, new
files, behavior changes, and script fixes; say which local skill each touches.

Upstream also commits a generated copy under `harness/pstack/`. Read and port
from `pstack/` only.

## Port a change

1. Get the user's choice of what to port. Checking upstream is not a go-ahead
   to change skills.
2. For scripts and tests kept close to upstream (`statechart`), diff upstream
   between the recorded pin and the target commit, and apply that diff to the
   local skill. Merge by hand where local wording differs, keeping the local
   change. For reworded skills, restate the upstream change in the local
   skill's own terms instead of copying text.
3. Apply the adaptation rules above to anything new.
4. Move the pin: `upstream-revision` in the skill's frontmatter and its entry
   in `vendor/LOCAL-ATTRIBUTIONS.md`, with the pstack version from upstream
   `pstack/plugin.json`. Record removals and retired ports in
   `docs/pstack-parity.md`.
5. Run the skill's own tests when it has scripts, then
   `uv tool run --from skills-ref agentskills validate ./skills/<name>`,
   `just catalog-snapshot`, and `just check`.
6. Follow `AGENTS.md` for ownership rules and
   `.agents/skills/really-fast-reinstall/SKILL.md` to install.

## References

Local records:

- `vendor/LOCAL-ATTRIBUTIONS.md`: provenance, pins, and what each adaptation
  changed. Kept current.
- `docs/pstack-parity.md`: script capabilities, playbook renames, and the
  principle catalog. Kept current.
- `docs/pstack-generic-port.md` and `docs/pstack-principles.md`: the decision
  record and full name mapping from 2026-10-14. Historical, not maintained;
  good for why a choice was made, not for current counts.

Official sources:

- Plugin: <https://github.com/cursor/plugins/tree/main/pstack>
- Guide, ten chapters from setup to recipes:
  <https://github.com/cursor/plugins/tree/main/pstack/docs/guide>
- Principles chapter:
  <https://github.com/cursor/plugins/blob/main/pstack/docs/guide/08-principles.md>
- Making it your own:
  <https://github.com/cursor/plugins/blob/main/pstack/docs/guide/09-make-it-yours.md>
- Claude Code adapter, mapping Cursor names to Claude Code:
  <https://github.com/cursor/plugins/blob/main/pstack/docs/harness/claude-code.md>
- Skills: <https://github.com/cursor/plugins/tree/main/pstack/skills>
- License: <https://github.com/cursor/plugins/blob/main/pstack/LICENSE>
