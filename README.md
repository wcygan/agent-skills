# agent-skills

A public Agent Skills catalog. The active catalog contains three skills:

| Skill | Purpose |
| --- | --- |
| [uv-python](skills/uv-python/SKILL.md) | Python development and dependency workflows with uv. |
| [just](skills/just/SKILL.md) | Maintain clear, reusable justfile commands. |
| [design-loop](skills/design-loop/SKILL.md) | Design, implement and verify a bounded UI outcome. |

## Install

Use a GitHub CLI build with `gh skill` support. Install to the shared user
directory explicitly:

```sh
gh skill install wcygan/agent-skills --agent codex --scope user --all --dir ~/.agents/skills
```

Add `--pin <full-commit>` for a fixed version. Other supported agents are listed
by `gh skill install --help`. For project scope, select `--scope project`.
Test discovery and installation from a local checkout in an isolated directory:

```sh
gh skill install . --from-local --all --dir /tmp/skill-check
```

## Dated archive and reset

[archive/2026-10-14](archive/2026-10-14/README.md) preserves the full prior
repository at its exact source commit: 116 skills, references, scripts, assets,
source locks, licenses, attribution and maintenance files. Its manifest contains
the bundle SHA-256 and the original catalog snapshot. The active catalog retired
113 skills and retained the three listed above.

Historical entrypoints exist only inside `catalog.tar.gz`. The archive does not
contain extracted SKILL.md files, because GitHub CLI also discovers nested
`skills/` trees. Archive bundles never participate in skill installation. Restore
a skill deliberately from the bundle, validate it and refresh the snapshot.

## Update a fork

Read [docs/catalog-inheritance.md](docs/catalog-inheritance.md). Adopted forks
track parent ownership and an exact source commit:

```sh
just parent-upgrade-preview
just parent-upgrade
just check
```

Upgrades remove inherited skills retired by the parent, retain child-owned
additions and blocked names, and copy the dated archive. Modified inherited
files require explicit reconciliation. Plain Git forks can merge upstream;
[BOOTSTRAP.md](BOOTSTRAP.md) describes adoption for templates and other arrival
routes. A repository update does not by itself remove globally installed copies.

## Publish and reset this machine through dotfiles

The repository-local [reinstall-agent-skills](.agents/skills/reinstall-agent-skills/SKILL.md)
workflow owns provider publication, the exact dotfiles pin and global refresh:

```sh
uv run --script tools/reinstall_agent_skills.py
# Explicitly reset the entire shared user catalog:
uv run --script tools/reinstall_agent_skills.py --reset-global
# Use a clean alternate consumer checkout when preserving unrelated edits:
uv run --script tools/reinstall_agent_skills.py --dotfiles /path/to/dotfiles --reset-global
```

The script refreshes the snapshot, runs `just check-full`, commits and pushes
provider changes, advances the consumer pin, installs and verifies through
`./bootstrap.sh agent-skills`, then commits and pushes the pin. Standard refresh
archives retired provider-owned copies through `--prune`. `--reset-global`
archives every other shared user skill through `--reset --yes`. Machine archives
live under XDG state outside skill discovery roots. Unrelated dotfiles edits must
be preserved; the consumer checkout used by the script must be clean.

## Author and validate

Skills remain immediate children of `skills/`, following the
[Agent Skills specification](https://agentskills.io/specification). The layout
also supports Agent Plugins packaging. Source ownership for future vendors is
recorded in `vendor/skills-lock.json`; adapted upstream work must preserve its
provenance and license. The active vendor lock is empty after this reset.

```sh
uv tool run --from skills-ref agentskills validate ./skills/<name>
just catalog-snapshot
just check-full
```

`just check` runs maintenance tests, source validation and snapshot verification;
`check-full` also checks GitHub CLI publication. The design reference app retains
its focused CI workflow and `just design-reference-check` command.
