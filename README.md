# agent-skills

A public collection of reusable **agent skills** installable with the GitHub CLI:

```bash
gh skill install wcygan/agent-skills --agent codex --scope user --all
```

> Creating your own catalog? Point your agent to [BOOTSTRAP.md](BOOTSTRAP.md)
> for the complete template workflow.

Skills follow the [Agent Skills](https://agentskills.io/specification) format
(`skills/<name>/SKILL.md`), which is what `gh skill install` discovers and
installs natively. The layout is also compatible with
[Agent Plugins](https://agent-plugins.org/) packaging, so the same tree can be
loaded as a plugin by plugin-capable clients.

> `gh skill` is a GitHub CLI preview feature and may change.
> Use a GitHub CLI build that provides `gh skill`: `gh skill --help`.

## Skills

Browse the complete [skills directory](https://github.com/wcygan/agent-skills/tree/main/skills).

- [`prompt-kit`](skills/prompt-kit/SKILL.md) — evidence-backed PromptKit component, block, and primitive integration.

Use [`audit-skill-catalog`](skills/audit-skill-catalog/SKILL.md) to review a
flat catalog and propose safe semantic grouping or consolidation.

## PR and stack health

From a repository checkout, the `check-my-prs` terminal inspector checks the current PR and expands an official GitHub PR stack when detected:

```bash
uv run skills/check-my-prs/scripts/check_my_prs.py
```

Use `--pr 123`, `--repo OWNER/REPO`, `--plain`, or `--json` to change the target or presentation. The inspector is read-only; exit `0` means healthy, `1` means action is needed, `2` means evidence is incomplete, and `3` means the environment or input prevented inspection.

## Installation

### Requirements

- [GitHub CLI](https://cli.github.com/) with the `gh skill` commands
  (`gh skill --help`).
- [uv](https://docs.astral.sh/uv/) for maintenance commands and the optional
  PR inspector.
- [just](https://just.systems/) for the shared local and CI command interface.
- A Git URL or local path for parent catalog adoption.

### Install all skills for one agent

```bash
# Global (user scope) for Codex
gh skill install wcygan/agent-skills --agent codex --scope user --all

# Project scope (inside a git repo) for Claude Code
gh skill install wcygan/agent-skills --agent claude-code --scope project --all
```

- `--agent` values include `github-copilot`, `claude-code`, `cursor`, `codex`,
  `gemini-cli`, `opencode`, `warp`, and more. Run `gh skill install --help` for
  the full list.
- `--scope` is `project` (current git repo, default) or `user` (your home
  directory, available everywhere). At project scope several agents share
  `.agents/skills`, so a skill is installed only once.
- Skip `--all` to choose interactively, or pass a skill name to install just one:

```bash
gh skill install wcygan/agent-skills new-plugin --agent codex --scope user
```

### Pin a specific version

```bash
# Tags or commit SHAs; semver tags recommended
gh skill install wcygan/agent-skills --agent codex --scope user --all --pin v1.0.0
# or per skill: gh skill install wcygan/agent-skills new-plugin@v1.0.0 ...
```

### Install from a local checkout (for testing)

```bash
gh skill install . --from-local --all --dir /tmp/skill-check
```

### Create a derived catalog

Fork, copy, or create a repository from this template.
The source owner must first enable GitHub's **Template repository** setting.
Downloaded archives and new Git histories are also supported.

Adopt the default parent and run the shared check:

```bash
just catalog-adopt
just check
```

Adoption stores one exact parent commit in `catalog.lock.json`.
Tags and branches only select commits for adoption or upgrade.

Read [the catalog inheritance guide](docs/catalog-inheritance.md) for every
arrival route, local skills, upgrades, rollback, recursive catalogs, and CI.

## Updating

Use `gh skill update` to update skills installed into an agent:

```bash
# Update all installed skills
gh skill update --all

# Update every installed skill named new-plugin
gh skill update new-plugin

# See what would update without changing anything
gh skill update --dry-run
```

The update command scans supported agents in project and user scope.

Use the catalog commands to update a derived repository:

```bash
just parent-check
just parent-upgrade-preview v1.3.0
just parent-upgrade v1.3.0
just check
```

The upgrade command resolves the target once and stores its full commit ID.
Use `just catalog-sync` to reproduce the current lock without moving it.

## Vendored skills

This repository vendors selected skills from external repositories so the
collection can be installed as one tested, versioned set. Source repositories,
selected skills, and pinned revisions are recorded in
`vendor/skills-lock.json`; attribution is kept in `vendor/ATTRIBUTIONS.md`.

Use the `uv`-managed maintenance tool to check or update an external source:

```bash
uv run tools/sync_skills.py check
uv run tools/sync_skills.py check planetscale/database-skills
uv run tools/sync_skills.py check --jobs 1  # sequential fallback
uv run tools/sync_skills.py check --color always  # preserve color when piping
uv run tools/sync_skills.py update planetscale/database-skills
uv run tools/sync_skills.py validate
```

`check` is non-mutating and checks sources concurrently with up to four workers.
Use `--jobs` to change that bound; output remains in lock-file order. Status
prefixes are green for up-to-date sources and yellow when an update is
available. Color defaults to terminal-aware `auto`, respects `NO_COLOR`, and
can be controlled with `--color always|never`.

A source can declare `remove_frontmatter` in the lock file for upstream,
client-specific top-level keys that the Agent Skills specification rejects.
The sync tool applies that compatibility normalization on every update.
Provider-specific `openai.yaml` and `openai.yml` manifests are excluded from
every vendored skill copy and rejected by vendored-skill validation.

Vendored skills keep their upstream names when those names are collision-free.
Sources with generic names are namespaced (`planetscale-mysql`,
`planetscale-postgres`, and so on) to avoid collisions with independently
maintained skills. Updating a source changes the vendored files and lock
revision; tag the repository afterward to publish a tested collection version.

Notes:
- Skills installed with `--pin` are skipped until you unpin
  (`gh skill update new-plugin --unpin`).
- `gh skill update` compares a tree SHA that gh stores in the installed skill's
  frontmatter against the remote repo.
- gh injects source-tracking `metadata.github-*` into installed skills, which
  is what makes `gh skill update` work. Keep this metadata out of the repo —
  `gh skill publish --fix` strips it if it ever gets committed.

## Managing installed skills

```bash
gh skill list                 # all hosts, project + user scope
gh skill list --agent codex --scope user
gh skill preview wcygan/agent-skills new-plugin   # inspect before installing
gh skill search <query>       # find skills across GitHub
```

The CLI does not currently provide `gh skill uninstall`; to remove a skill,
delete its directory from the location shown in `gh skill list`.

## For repository maintainers

This repo is distributed via `gh skill install`, so it follows the
**Agent Skills** conventions:

- Every skill is an immediate child of `skills/`: `skills/<name>/SKILL.md`.
- `SKILL.md` frontmatter `name` must match the directory name (1-64 chars,
  lowercase `a-z0-9` + hyphens, no `--`, no leading/trailing hyphen) and must
  include a `description` (1-1024 chars).
- Adding `plugin.json` at the repository root packages the same tree as an
  Agent Plugin.

### Validate and release

```bash
just check                          # run the shared local and CI gate
just check-full                     # add the GitHub skill publication check
gh skill publish --tag v1.0.0       # add the `agent-skills` topic + create a release
```

Run `just check-full` before pushing changes.
Cut a semver tag when users need a stable release selector.

## Contributing

- Add a new skill: use the `new-plugin` skill (or read `AGENTS.md`).
- Validate before pushing: run `just check-full` from the repository root.
- Skills must follow the [Agent Skills specification](https://agentskills.io/specification).

## Official documentation

- Agent Skills specification (skill format): <https://agentskills.io/specification>
- `gh skill install` manual: <https://cli.github.com/manual/gh_skill_install>
- `gh skill update` manual: <https://cli.github.com/manual/gh_skill_update>
- Agent Plugins (portable plugin packaging): <https://agent-plugins.org/>
- Agent Plugins specification: <https://agent-plugins.org/specification>
- Plugin manifest (`plugin.json`): <https://agent-plugins.org/plugin-authors/manifest>
- Agent Plugins skills: <https://agent-plugins.org/plugin-authors/skills>

## License

MIT — see [LICENSE](LICENSE).
