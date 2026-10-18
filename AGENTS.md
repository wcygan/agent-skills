# AGENTS.md

## Purpose of this repository

This is a **public GitHub repository that stores all of my agent skills** and
distributes them through the GitHub CLI. To install skills, read
[Distribution](#distribution) first; this machine uses a different path from
other machines.

Skills in this repository follow the **Agent Skills** specification, which is
the format `gh skill install` discovers, validates, and installs. Every skill
lives at `skills/<name>/SKILL.md` (with optional `scripts/`, `references/`,
and `assets/` directories).

This repo deliberately uses the layout that **Agent Plugins** also defines for
its `skills/` component, so the same tree can be packaged as an Agent Plugin
(optional `plugin.json`) for plugin-capable clients without restructuring.

## Follow these instructions exactly

- Follow the documented procedure for the task. Do not substitute an
  improvised alternative, such as `cp`, `ln`, `gh skill install --from-local`,
  or editing global skill directories, for a documented command.
- If a documented step fails or refuses, stop and report the exact output.
  Do not work around a guard; guards encode past mistakes.
- Before any task that publishes, pins, or installs, read the project-local
  skill that owns it (`.agents/skills/<name>/SKILL.md`) and follow it.
- If instructions conflict or do not cover the situation, ask the user rather
  than choosing for them.

## Core paths

- `skills/` contains the distributable skill catalog.
- `archive/<date>/` contains immutable historical bundles, never installable skill entrypoints.
- `vendor/skills-lock.json` defines the skills still managed by upstream synchronization.
- `vendor/LOCAL-ATTRIBUTIONS.md` preserves provenance for locally maintained adaptations.
- `justfile` defines the supported maintenance commands.
- Read `BOOTSTRAP.md` when creating a catalog from this template.
- Read `docs/catalog-inheritance.md` when adopting or upgrading an inherited catalog.
- `catalog-seed.json` and `catalog-projection.json` define inheritance inputs.
- `catalog-snapshot.json` records distributable content hashes.
- `.github/workflows/ci.yml` runs the shared validation gate.

### Rules every skill MUST follow

1. `skills/<name>/SKILL.md` must exist as a regular file. Only **immediate
   children** of `skills/` are discovered; no recursive search.
2. The `name` field in `SKILL.md` frontmatter **must exactly match the parent
   directory name**.
3. `name` constraints: 1–64 characters, lowercase `a-z0-9` and hyphens only;
   no leading/trailing hyphen; no consecutive hyphens (`--`).
4. `description` is required: 1–1024 characters, non-empty. Describe both
   *what the skill does* and *when to use it*, with searchable keywords.
5. Keep `SKILL.md` under ~500 lines; move detailed material to
   `references/` and use relative paths from the skill root (progressive
   disclosure — agents load instructions on activation and resources only
   when needed).
6. Optional frontmatter: `license`, `compatibility`, `metadata`, `allowed-tools`.
7. Use relative paths for all file references from `SKILL.md` (e.g.
   `references/REFERENCE.md`, `scripts/extract.py`), kept one level deep.

## Authoring and ownership

Keep the capability and distinguishing trigger early, retain essential knowledge
and decision criteria, and load branch-specific resources only when their stated
conditions apply. A phase
boundary must not discard authorization for the rest of the requested work.

Archive retired catalogs as compressed bundles with the date, source commit,
content hash, inventory and original attribution. Never leave an extracted
`SKILL.md` or nested `skills/` tree in the archive: GitHub CLI discovers nested
catalogs too. Restore only explicitly selected skills into the active catalog.

When revising a vendored skill, convert it to local maintenance: remove its
source mapping and `.vendored` marker, preserve upstream revision, original
path, attribution, and license in metadata and `vendor/LOCAL-ATTRIBUTIONS.md`,
and regenerate the remaining vendored listing from the lock. Do not fetch a
newer revision as part of that conversion. Include attribution resources in
`catalog-projection.json` and refresh the snapshot after distributable changes.

## Validation before merging/committing skills

Validate each changed skill with the Agent Skills reference library:

```bash
uv tool run --from skills-ref agentskills validate ./skills/<skill-name>
```

Run the shared repository and publication checks before pushing:

```bash
just check-full
```

## Distribution

### This machine: dotfiles pin only

Global skills on this machine come only from the dotfiles pin. Follow
`.agents/skills/reinstall-agent-skills/SKILL.md`; in short:

1. Land the reviewed change on `main`. The script refuses any other branch.
2. Run from **clean** checkouts of both repositories on `main`, side by side
   (for example fresh clones of `agent-skills` and `dotfiles` in one
   directory). `--apply` commits every uncommitted path with `git add .`, so a
   checkout with unrelated edits would publish them. Never stash, commit, or
   discard the user's edits to make a checkout clean.
3. `just reinstall` is a read-only dry run. Show the user its plan. It must
   report `0 uncommitted path(s)` unless publishing those paths was requested.
4. `just reinstall --apply` publishes the provider, advances and pushes the
   dotfiles pin, and installs into `~/.agents/skills`.
5. Claude Code reads `~/.claude/skills`, which no installer manages yet. Each
   entry there is a symlink to the pinned copy:
   `~/.claude/skills/<name> -> ~/.agents/skills/<name>`. After `--apply`, add a
   link for each added skill and remove the link for each retired one, then
   confirm both directories list the same catalog skills. Leave non-catalog
   entries (such as `synced`) alone.

Never copy skill content into `~/.agents/skills` or `~/.claude/skills`, and
never link to anything other than a pinned copy. `just reinstall --apply` and
the dotfiles check ignore hand copies, and the next pinned install can
collide with them. Afterwards, the user's own `main` checkouts are behind
`origin`; report that rather than pulling over their uncommitted edits.

### Other machines: GitHub CLI

Machines without the dotfiles pin (other users, CI, fresh hosts) install with
GitHub CLI. On this machine, use the dotfiles pin above instead.

- Installation: `gh skill install OWNER/agent-skills --agent <agent> --scope <scope>` (`--all` to install every skill; a trailing skill name selects one).
- Prefer the shared Agent Skills directory `~/.agents/skills` for user-level
  installations. When using `gh skill install`, pass `--dir ~/.agents/skills`
  explicitly; do not default to host-specific directories such as
  `~/.codex/skills`.
- Support each agent listed by `gh skill install --help`.
  For example, install all skills for Codex:

  ```bash
  gh skill install OWNER/agent-skills --agent codex --scope user --all --dir ~/.agents/skills
  ```

- `gh skill install . --from-local` opens an interactive picker and fails
  without a terminal; pass `--all` and a scratch `--dir` when testing locally.

- **Versioning:** Unpinned installs use the latest release, then default-branch
  HEAD. Pins accept a tag or commit SHA.
- gh injects source-tracking metadata into installed skill frontmatter,
  enabling `gh skill update`.

## Official documentation references

Consult these when the relevant format, installation, or packaging rule is
uncertain; they are not prerequisites for every skill edit.

- Agent Skills specification (format this repo follows):
  <https://agentskills.io/specification>
- `gh skill install` reference (our distribution path):
  <https://cli.github.com/manual/gh_skill_install>
- `gh skill update` reference:
  <https://cli.github.com/manual/gh_skill_update>
- Agent Plugins home (portable package format for skills + MCP servers):
  <https://agent-plugins.org/>
- Agent Plugins specification (v1.0.0, working draft):
  <https://agent-plugins.org/specification>
- Build an Agent Plugin (plugin-authors guide):
  <https://agent-plugins.org/plugin-authors>
- Plugin manifest reference (`plugin.json`):
  <https://agent-plugins.org/plugin-authors/manifest>
- Agent Plugins skills packaging:
  <https://agent-plugins.org/plugin-authors/skills>
- Canonical plugin manifest JSON schema:
  <https://agent-plugins.org/schemas/1.0.0/plugin.schema.json>
