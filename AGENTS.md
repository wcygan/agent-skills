# AGENTS.md

## Purpose of this repository

This is a **public GitHub repository that stores all of my agent skills** and
distributes them through the GitHub CLI:

```bash
gh skill install OWNER/agent-skills --agent codex --scope user --all
```

Skills in this repository follow the **Agent Skills** specification, which is
the format `gh skill install` discovers, validates, and installs. Every skill
lives at `skills/<name>/SKILL.md` (with optional `scripts/`, `references/`,
and `assets/` directories).

This repo deliberately uses the layout that **Agent Plugins** also defines for
its `skills/` component, so the same tree can be packaged as an Agent Plugin
(optional `plugin.json`) for plugin-capable clients without restructuring.

## Repository layout

```
agent-skills/
├── plugin.json        # OPTIONAL: only if we adopt Agent Plugins packaging
├── README.md          # user-facing: install instructions + skill index
├── LICENSE
└── skills/
    ├── <skill-name>/
    │   ├── SKILL.md        # required: YAML frontmatter + instructions
    │   ├── scripts/        # optional: executable code
    │   ├── references/     # optional: docs loaded on demand
    │   └── assets/         # optional: templates, resources
    └── ...
```

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

## Validation before merging/committing skills

Validate each skill with the Agent Skills reference library before pushing:

```bash
uv tool run skills-ref validate ./skills/<skill-name>
```

Also verify discovery with the actual installer (draft check, installs into a
scratch dir):

```bash
gh skill install ./agent-skills --from-local --all --dir /tmp/skill-check
```

## Distribution

- Installation: `gh skill install OWNER/agent-skills --agent <agent> --scope <scope>` (`--all` to install every skill; a trailing skill name selects one).
- Support any agent, e.g. global install for Codex:

  ```bash
  gh skill install OWNER/agent-skills --agent codex --scope user --all
  ```

- **Versioning:** `gh skill install` resolves versions as git tags, commit
  SHAs, or default-branch HEAD. Cut release tags (`v1.0.0`, semver) so users
  can pin: `gh skill install OWNER/agent-skills ... --pin v1.0.0`.
- gh injects source-tracking metadata into installed skill frontmatter,
  enabling `gh skill update`.

## Official documentation references

- Agent Skills specification (format this repo follows):
  <https://agentskills.io/specification>
- `gh skill install` reference (our distribution path):
  <https://cli.github.com/manual/gh_skill_install>
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
