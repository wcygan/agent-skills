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
| `animate` | Builds production-ready UI animations from a request using deliberate motion, tooling, easing, interruption, and accessibility decisions. | `gh skill install wcygan/agent-skills animate --agent codex --scope user` |
| `animation-vocabulary` | Names web animation and motion effects from vague descriptions. | `gh skill install wcygan/agent-skills animation-vocabulary --agent codex --scope user` |
| `audit-observability-path` | Audits whether one scenario can be detected, correlated, explained, and reconstructed across system boundaries. | `gh skill install wcygan/agent-skills audit-observability-path --agent codex --scope user` |
| `better-colors` | Designs OKLCH palettes, checks contrast, and guides web color systems. | `gh skill install wcygan/agent-skills better-colors --agent codex --scope user` |
| `better-ui` | Applies design-engineering principles for polished interface details and interactions. | `gh skill install wcygan/agent-skills better-ui --agent codex --scope user` |
| `effect-ts` | Builds production TypeScript applications with Effect v4, including workflows, services, schemas, configuration, schedules, caches, streams, HTTP clients, and tests. | `gh skill install wcygan/agent-skills effect-ts --agent codex --scope user` |
| `ephemeral-chooser` | Creates, compares, shares, and promotes temporary component variants. | `gh skill install wcygan/agent-skills ephemeral-chooser --agent codex --scope user` |
| `find-animation-opportunities` | Identifies UI moments that benefit from motion and proposes precise recipes. | `gh skill install wcygan/agent-skills find-animation-opportunities --agent codex --scope user` |
| `hill-climbing` | Runs a guarded, metric-driven optimization loop using one-variable experiments, a numeric measure, behavioral guard, and plateau rules. | `gh skill install wcygan/agent-skills hill-climbing --agent codex --scope user` |
| `improve-animations` | Audits animation code and produces prioritized, self-contained improvement plans. | `gh skill install wcygan/agent-skills improve-animations --agent codex --scope user` |
| `improve-development-loop` | Finds and automates repeated developer and agent work to shorten the path from a change to trustworthy feedback. | `gh skill install wcygan/agent-skills improve-development-loop --agent codex --scope user` |
| `map-change-impact` | Maps the blast radius, compatibility obligations, rollout risks, and validation needs of a proposed change. | `gh skill install wcygan/agent-skills map-change-impact --agent codex --scope user` |
| `model-concurrency` | Models actors, state, ordering, invariants, and counterexample schedules for concurrent and distributed behavior. | `gh skill install wcygan/agent-skills model-concurrency --agent codex --scope user` |
| `new-plugin` | Scaffolds a new Agent Skill (or Agent Plugins package) into this repo with valid frontmatter, and validates the result. | `gh skill install wcygan/agent-skills new-plugin --agent codex --scope user` |
| `pi-coding-agent` | Uses and investigates the Pi coding-agent CLI, including sessions, models, skills, and extensions. | `gh skill install wcygan/agent-skills pi-coding-agent --agent codex --scope user` |
| `pi-sdk` | Builds, debugs, and explains TypeScript integrations with the Pi coding-agent SDK. | `gh skill install wcygan/agent-skills pi-sdk --agent codex --scope user` |
| `plan-safe-refactor` | Plans staged, behavior-preserving refactors with invariants, checkpoints, compatibility, rollback, and cleanup. | `gh skill install wcygan/agent-skills plan-safe-refactor --agent codex --scope user` |
| `reproduce-bug` | Turns intermittent or poorly understood symptoms into controlled, repeatable reproductions with reliable regression oracles. | `gh skill install wcygan/agent-skills reproduce-bug --agent codex --scope user` |
| `review-animations` | Reviews animation and motion code against a high craft bar. | `gh skill install wcygan/agent-skills review-animations --agent codex --scope user` |
| `skill-intake` | Formalizes rough automation ideas into a skill decision, structured brief, and paste-ready implementation handoff. | `gh skill install wcygan/agent-skills skill-intake --agent codex --scope user` |
| `trace-codepath` | Traces one execution path across functions, services, transports, asynchronous work, and resources with evidence-backed diagrams. | `gh skill install wcygan/agent-skills trace-codepath --agent codex --scope user` |
| `trace-data-lineage` | Traces a field, record, event, or dataset through transformations, ownership boundaries, copies, and exposures. | `gh skill install wcygan/agent-skills trace-data-lineage --agent codex --scope user` |
| `trace-failure-path` | Traces a concrete failure through propagation, partial state, retries, recovery, and user or operator outcomes. | `gh skill install wcygan/agent-skills trace-failure-path --agent codex --scope user` |
| `typst-author` | Generates, edits, and troubleshoots Typst documents and projects. | `gh skill install wcygan/agent-skills typst-author --agent codex --scope user` |

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
