#!/usr/bin/env python3
# /// script
# requires-python = ">=3.10"
# dependencies = []
# ///

"""Scaffold a router-style skill tree for agent consumption.

Run from anywhere:

    uv run skills/new-router-skill/scripts/new_router.py my-router \
        --description "what it does + when to use it"

Creates the standardized tree under the target (default ~/.agents/skills, the
installed skills home; pass --target skills to author inside this repo):

    <target>/my-router/
    └── SKILL.md          # frontmatter + router-shaped fill-in template

Add references and scripts only when they have useful content.

Validates the name against the Agent Skills naming rules before writing
anything. Stdlib only; no dependencies. Mirrors new-plugin's validation regex;
guarded by tests/test_new_router_skill.py.
"""

import argparse
import json
import os
import re
import sys

NAME_RE = re.compile(r"^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$")
NAME_MAX = 64


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


def skill_template(name: str, description: str, author: str) -> str:
    body = []
    body.append("---")
    body.append(f"name: {name}")
    body.append(f"description: {json.dumps(description, ensure_ascii=False)}")
    body.append("license: MIT")
    body.append("metadata:")
    body.append('  version: "0.1.0"')
    if author:
        body.append(f"  author: {json.dumps(author, ensure_ascii=False)}")
    body.append("---")
    body.append("")
    body.append(f"# {name}")
    body.append("")
    body.extend([
        "## Purpose",
        "",
        "Describe the recurring result and why selecting a specialist needs this router.",
        "",
        "## The route",
        "",
        "| Request condition | Evidence that selects this branch | Owner |",
        "| --- | --- | --- |",
        "| Fill in an observable condition | Required evidence | Skill or direct capability |",
        "",
        "Define overlap resolution, unmatched requests, and essential knowledge needed to choose. Keep detailed branch guidance behind conditional references only when useful.",
        "",
        "## Completion and authority",
        "",
        "State the selected owner and evidence, then continue the requested work within existing authorization. Explain fallback behavior when a companion is unavailable; stop dependent work only for an essential missing capability, decision, or permission.",
        "",
        "Replace these prompts with the router's actual guidance. Add resources only when needed and link real files with explicit reading conditions.",
        "",
    ])
    return "\n".join(body)


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(
        description="Scaffold a router-style skill tree for agent consumption."
    )
    ap.add_argument("name", help="skill name: 1-64 chars, lowercase a-z0-9 and hyphens")
    ap.add_argument(
        "--description",
        default="A router that picks the right specialist for the work. Use when a request matches one of its branches.",
        help="1-1024 chars; what it does + when to use it",
    )
    ap.add_argument(
        "--target",
        default="~/.agents/skills",
        help="scaffold directory (default: ~/.agents/skills; use 'skills' for this repo's catalog)",
    )
    ap.add_argument("--author", default="", help="author name stored in metadata.author")
    args = ap.parse_args(argv)

    if not (1 <= len(args.description) <= 1024):
        print(f"error: description must be 1-1024 characters (got {len(args.description)})", file=sys.stderr)
        return 2

    err = validate_name(args.name)
    if err:
        print(f"error: invalid skill name {args.name!r}: {err}", file=sys.stderr)
        return 2

    target = os.path.expanduser(args.target)
    skill_dir = os.path.join(target, args.name)
    skill_file = os.path.join(skill_dir, "SKILL.md")

    if os.path.exists(skill_file):
        print(f"error: already exists: {skill_file}", file=sys.stderr)
        return 2

    os.makedirs(skill_dir, exist_ok=True)

    with open(skill_file, "w") as f:
        f.write(skill_template(args.name, args.description, args.author))

    print(f"created: {skill_file}")
    print("\nnext steps:")
    print("  Compose the routes, essential knowledge, completion, and authority in SKILL.md.")
    print("  Add resources only when a branch needs them, with conditional reading pointers.")
    print("  Follow the target repository's validation and publication requirements.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
