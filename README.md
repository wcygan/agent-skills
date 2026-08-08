# agent-skills

A public collection of reusable **agent skills** installable with the GitHub CLI:

```bash
gh skill install wcygan/agent-skills --agent codex --scope user --all
```

Skills follow the [Agent Skills](https://agentskills.io/specification) format
(`skills/<name>/SKILL.md`), which is what `gh skill install` discovers and
installs natively. The layout is also compatible with
[Agent Plugins](https://agent-plugins.org/) packaging, so the same tree can be
loaded as a plugin by plugin-capable clients.

> `gh skill` is a GitHub CLI preview feature and may change. Requires a recent
> GitHub CLI: `gh --version` (2.60+ recommended).

## Skills in this repo

| Skill | What it does | Install |
|-------|--------------|---------|
| `new-plugin` | Scaffolds a new Agent Skill (or Agent Plugins package) into this repo with valid frontmatter, and validates the result. | `gh skill install wcygan/agent-skills new-plugin --agent codex --scope user` |

## Installation

### Requirements

- [GitHub CLI](https://cli.github.com/) with the `gh skill` commands
  (`gh skill --help`).
- A public GitHub repository hosting this repo (clone/clone-able via HTTPS).

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

## Updating

```bash
# Update all installed skills
gh skill update --all

# Update one skill for one agent/scope
gh skill update new-plugin --agent codex --scope user

# See what would update without changing anything
gh skill update --dry-run
```

## Vendored skills

This repository vendors selected skills from external repositories so the
collection can be installed as one tested, versioned set. Source repositories,
selected skills, and pinned revisions are recorded in
`vendor/skills-lock.json`; attribution is kept in `vendor/ATTRIBUTIONS.md`.

Use the `uv`-managed maintenance tool to check or update an external source:

```bash
uv run tools/sync_skills.py check planetscale/database-skills
uv run tools/sync_skills.py update planetscale/database-skills
uv run tools/sync_skills.py validate
```

Vendored skills are intentionally namespaced (`planetscale-mysql`,
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
- Adding `plugin.json` at the repo root turns the same tree into an Agent
  Plugins package for plugin-capable clients (VS Code, Cursor, Copilot,
  ChatGPT/Codex, Kiro).

### Validate and release

```bash
gh skill publish --dry-run          # validate all skills in this repo
gh skill publish --tag v1.0.0       # add the `agent-skills` topic + create a release
```

Run `gh skill publish --dry-run` before pushing changes, and cut a semver git
tag (`v1.*`) when you want users to be able to pin a release.

# Contributing
- Add a new skill: use the `new-plugin` skill (or read `AGENTS.md`).
- Validate before pushing: `gh skill publish --dry-run` from the repo root.
- Skills must follow the Agent Skills specification: https://agentskills.io/specification

## Official documentation

- Agent Skills specification (skill format): <https://agentskills.io/specification>
- `gh skill install` manual: <https://cli.github.com/manual/gh_skill_install>
- Agent Plugins (portable plugin packaging): <https://agent-plugins.org/>
- Agent Plugins specification: <https://agent-plugins.org/specification>
- Plugin manifest (`plugin.json`): <https://agent-plugins.org/plugin-authors/manifest>
- Agent Plugins skills: <https://agent-plugins.org/plugin-authors/skills>

## License

MIT — see [LICENSE](LICENSE).
