# Scripting (UV Python)

How the scripts in this skill — and in scaffolded router skills — are written:
self-contained, UV-runnable, stdlib-only by default.

## The script form

Every script is a single file with a PEP 723 metadata block, so `uv run`
builds its environment from the file alone:

```python
#!/usr/bin/env python3
# /// script
# requires-python = ">=3.10"
# dependencies = []
# ///
```

Run with:

```bash
uv run scripts/<name>.py ...
```

- Stdlib only by default; add a dependency to the metadata block only when the
  stdlib is genuinely insufficient, and say why in the docstring.
- Keep the script deterministic: no network, no randomness, no ambient state
  unless the task demands it.
- Keep it single-file and copy-safe: scripts travel with the skill, so they
  must not import sibling skills or expect a repo layout.

## The interface

- `argparse` with a clear `name` positional and `--description` / `--target`
  style options.
- Validate before writing: name rules, description length, existing-target
  check. Refuse with exit code 2 and an actionable message naming the fix.
- Exit 0 only when the whole job is done.
- Print the created paths and next steps; keep output parseable for the agent.

## Name validation (canonical rules)

- 1–64 characters
- lowercase `a-z0-9` and hyphens only
- no leading/trailing hyphen, no consecutive hyphens (`--`)

This mirrors `new-plugin`'s validation; the deliberate copy is guarded by the
test suite (`tests/test_new_router_skill.py`) so the two cannot drift silently.

## Deeper UV

For projects, environments, tooling, and version-sensitive flags, consult the
`uv-python` skill and the installed uv help (`uv help <command>`). Prefer the
installed command's help as the source for flags over remembered examples.
