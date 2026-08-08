---
name: new-plugin
description: >-
  Scaffold a new Agent Skill or Agent Plugins package in this repository: create
  skills/<name>/SKILL.md with valid frontmatter, optionally add a plugin.json,
  and validate the result. Use when adding a new skill to the repo, initializing
  an Agent Plugins package, or checking that a skill name and frontmatter meet the
  Agent Skills naming rules.
license: MIT
---

# new-plugin

Create a new, spec-compliant skill (or Agent Plugins package) in this repo that
`gh skill install` can discover and validate. Use this whenever you add a
capability to the repo so every skill starts out conformant.

## When to use

- Adding a new skill to this repository.
- Packaging a skill as an Agent Plugins package (`plugin.json` at repo root).
- Verifying a skill name / frontmatter against the Agent Skills rules before validation.

## Steps

### 1. Choose a skill name

The name IS the directory name and must follow the Agent Skills rules:

- 1–64 characters
- lowercase `a-z0-9` and hyphens only
- must not start or end with a hyphen
- must not contain consecutive hyphens (`--`)

Valid: `code-review`, `pdf-processing`, `terraform-plan`. Invalid: `PDF`, `-lint`, `a--b`.

### 2. Scaffold with the generator script

Run the bundled generator (from the repo root):

```bash
python skills/new-plugin/scripts/new_plugin.py my-skill \
  --description "What it does and when to use it." \
  --author "Your Name"
```

It creates:

```text
skills/my-skill/
└── SKILL.md          # frontmatter + a fill-in template
```

Flags:

- `--description` (recommended): 1–1024 chars, e.g. "Extracts text from PDFs and merges forms. Use when handling PDF documents."
- `--author`: stored in frontmatter `metadata.author`.
- `--license`: SPDX identifier, e.g. `MIT` (defaults to `MIT`).
- `--plugin`: also write a valid `plugin.json` at the repo root so the tree is
  also an Agent Plugins package.
- `--repo-root DIR`: repo root override (default: two levels up from the script).

The script validates the name and refuses invalid ones.

### 3. Write the body

Fill in `SKILL.md` after the frontmatter with step-by-step instructions and
examples. Keep the whole file under ~500 lines; push detail into
`references/`, `scripts/`, and `assets/` and reference them with relative
paths from `SKILL.md`:

```text
my-skill/
├── SKILL.md
├── scripts/       # self-contained executable helpers
├── references/    # docs loaded on demand (REFERENCE.md, FORMS.md, ...)
└── assets/        # templates, examples, schemas
```

Structure for reliable activation:

- `description`: what the skill does AND when to use it, with searchable keywords.
- Body: step-by-step instructions, example inputs/outputs, common edge cases.
- Relative file references kept one level deep (e.g. `references/REFERENCE.md`).

### 4. Validate

```bash
gh skill publish --dry-run                 # validates the whole repo
python skills/new-plugin/scripts/new_plugin.py --help
```

### 5. Test the install path

```bash
gh skill install . --from-local my-skill --all --dir /tmp/skill-check
```

Install the scaffolded skill into a scratch dir before committing.

## Frontmatter template

```yaml
---
name: <directory-name>
description: <what it does + when to use it, 1-1024 chars>
license: MIT
metadata:
  author: <your-name>
  version: "0.1.0"
---
```

Required frontmatter: `name` and `description`. Optional: `license`,
`compatibility`, `metadata`, `allowed-tools`. See
https://agentskills.io/specification for the authoritative rules.

## Related references

- Agent Skills specification: https://agentskills.io/specification
- Repo layout and distribution notes: see `AGENTS.md` and `README.md` at the repo root.
- Agent Plugins packaging: https://agent-plugins.org/plugin-authors/manifest
