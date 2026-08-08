#!/usr/bin/env python3
"""Scaffold a new Agent Skill (and optionally an Agent Plugins package).

Run from the repository root:

    python skills/new-plugin/scripts/new_plugin.py <name> \
        --description "what it does + when to use it" \
        --author "Your Name" [--license MIT] [--plugin]

Validates the skill name against the Agent Skills naming rules before writing
anything. Stdlib only; no dependencies.
"""

import argparse
import json
import os
import re
import sys
from datetime import date

NAME_RE = re.compile(r"^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$")
NAME_MAX = 64


def plugin_name_from_repo_root(repo_root: str) -> str:
    """Derive a valid plugin.json name from the repo directory name."""
    name = os.path.basename(os.path.abspath(repo_root)).lower().strip()
    name = re.sub(r"[^a-z0-9.-]", "-", name)
    name = re.sub(r"-{2,}", "-", name)
    name = name.strip(".-")
    if not NAME_RE.match(name):
        name = "agent-skills"
    if "--" in name or ".." in name or len(name) > 64:
        name = "agent-skills"
    return name


def validate_name(name: str) -> str | None:
    """Return an error message if name is invalid, else None."""
    if not (1 <= len(name) <= NAME_MAX):
        return f"name must be 1-{NAME_MAX} characters (got {len(name)})"
    if not NAME_RE.match(name):
        return (
            "name must be lowercase a-z0-9 and hyphens only, start and end with "
            "an alphanumeric, and contain no leading/trailing hyphen"
        )
    if "--" in name:
        return "name must not contain consecutive hyphens (--)"
    return None


def skill_frontmatter(name: str, description: str, author: str, license_: str) -> str:
    body = []
    body.append("---")
    body.append(f"name: {name}")
    body.append(f"description: {description}")
    body.append(f"license: {license_}")
    if author:
        body.append("metadata:")
        body.append(f"  author: {author}")
        body.append('  version: "0.1.0"')
    body.append("---")
    body.append("")
    body.append(f"# {name}")
    body.append("")
    body.append("What this skill does and when to use it. Step-by-step instructions, example inputs/outputs, and common edge cases.")
    body.append("")
    body.append("Keep this file under ~500 lines; move detail into `references/`, `scripts/`, and `assets/` and reference files with relative paths:")
    body.append("")
    body.append("```text")
    body.append(f"{name}/")
    body.append("├── SKILL.md")
    body.append("├── scripts/       # self-contained executable helpers")
    body.append("├── references/    # docs loaded on demand (REFERENCE.md, FORMS.md, ...)")
    body.append("└── assets/        # templates, examples, schemas")
    body.append("```")
    body.append("")
    return "\n".join(body)


def plugin_manifest(repo_root: str, description: str, author: str, license_: str) -> str:
    pname = plugin_name_from_repo_root(repo_root)
    manifest = {
        "$schema": "https://agent-plugins.org/schemas/1.0.0/plugin.schema.json",
        "name": pname,
        "version": "0.1.0",
        "description": description,
        "license": license_ or "MIT",
    }
    if author:
        manifest["author"] = {"name": author}
    manifest["repository"] = ""
    return json.dumps(manifest, indent=2, ensure_ascii=False) + "\n"


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(description="Scaffold a new Agent Skill / Agent Plugins package.")
    ap.add_argument("name", help="skill name: 1-64 chars, lowercase a-z0-9 and hyphens")
    ap.add_argument("--description", default="A description of what this skill does and when to use it.",
                    help="1-1024 chars; what it does + when to use it")
    ap.add_argument("--author", default="", help="author name stored in metadata.author")
    ap.add_argument("--license", default="MIT", help="SPDX license id (default: MIT)")
    ap.add_argument("--plugin", action="store_true",
                    help="also write a plugin.json at the repo root (Agent Plugins package)")
    ap.add_argument("--repo-root", default=None,
                    help="repo root (default: two levels up from this script)")
    args = ap.parse_args(argv)

    if not (1 <= len(args.description) <= 1024):
        print(f"error: description must be 1-1024 characters (got {len(args.description)})", file=sys.stderr)
        return 2

    err = validate_name(args.name)
    if err:
        print(f"error: invalid skill name {args.name!r}: {err}", file=sys.stderr)
        return 2

    script_dir = os.path.dirname(os.path.abspath(__file__))
    repo_root = args.repo_root and os.path.abspath(args.repo_root) or os.path.abspath(os.path.join(script_dir, "..", "..", ".."))
    skill_dir = os.path.join(repo_root, "skills", args.name)
    skill_file = os.path.join(skill_dir, "SKILL.md")

    if os.path.exists(skill_file):
        print(f"error: already exists: {skill_file}", file=sys.stderr)
        return 2

    os.makedirs(skill_dir, exist_ok=True)
    with open(skill_file, "w") as f:
        f.write(skill_frontmatter(args.name, args.description, args.author, args.license))
    print(f"created: {skill_file}")

    if args.plugin:
        manifest_file = os.path.join(repo_root, "plugin.json")
        with open(manifest_file, "w") as f:
            f.write(plugin_manifest(repo_root, args.description, args.author, args.license))
        print(f"created: {manifest_file}")

    print("\nnext steps:")
    print("  1. Fill in the SKILL.md body with instructions and examples.")
    print("  2. Validate the whole repo:  gh skill publish --dry-run")
    print("  3. Test discovery:            gh skill install . --from-local --all --dir /tmp/skill-check")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
