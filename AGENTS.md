# AGENTS.md

## Purpose of this repository

This public Agent Skills catalog is distributed through GitHub CLI. Public
entrypoints live at `skills/<name>/SKILL.md`. Read [Distribution](#distribution)
before installing.

## Procedures and approvals

- Follow the documented procedure, and read the owning project skill before
  publishing, pinning, or installing. Keep installed copies under the supported
  installer.
- Diagnose routine failures and retry a documented step when it is safe to
  repeat. If a safety guard refuses an operation, stop that operation, report
  its exact output, and leave the guard in place. Continue independent work
  that stays within scope.
- Make reversible decisions within scope. Ask before proceeding when resolving
  a conflict or ambiguity would change the scope or require authorization.
  Get explicit approval for commits, pushes, PR and publication actions, and
  other actions covered by the user's or repository's approval rules.

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

## Authoring and ownership

Use [author-agent-instructions](.agents/skills/author-agent-instructions/SKILL.md)
when writing or reviewing skill instructions, `AGENTS.md` files, or task prompts.
Preserve authorization for the rest of the requested work across phase boundaries.

Use [wcygan-mode](skills/wcygan-mode/SKILL.md) for substantive engineering work
on this catalog. Its playbooks route to workflow methods under
`references/methods/` and to the [engineering principle index](skills/wcygan-mode/references/principles.md).
When the user names a method or principle, open the matching reference for
steering. Former `$principle-*` mentions identify those references within
wcygan-mode. Keep an independently useful public entrypoint in `skills/` and
put conditional guidance with the skill that owns it.

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

For a method that moves under another skill, retain its pinned source and
license at the new location. Update its route and attribution entry, then
document the replacement for callers that use the old name.

## Validation before merging/committing skills

Run `just validate-skills` for public skill format. The shared `just check`
includes it, and `just check-full` adds the publication check before pushing.
For a changed project-local skill, see the
[authoring check](.agents/skills/author-agent-instructions/SKILL.md#check-the-edit).

## Distribution

### This machine: `just install`

Use [really-fast-reinstall](.agents/skills/really-fast-reinstall/SKILL.md) for
`just install`. Inspect `git status --short` and get the user's go-ahead
before running it. It stages the entire provider checkout, changes the global
skills, commits the dotfiles pin, and pushes both repositories. It also uses
changes left by other sessions, so disclose those when requesting approval.
For confirmed publication, use `just install --wait`. To restore the version
already pinned in dotfiles, use its approved `./bootstrap.sh agent-skills`
workflow. Audit either installation with `./bootstrap.sh agent-skills --check`
in dotfiles.

## Other machines: GitHub CLI

Machines without the dotfiles pin (other users or CI) install directly with
GitHub CLI.

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
