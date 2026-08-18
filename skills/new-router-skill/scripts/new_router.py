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
    ├── SKILL.md          # frontmatter + router-shaped fill-in template
    ├── references/       # .gitkeep seeded so the folder survives git
    └── scripts/          # .gitkeep seeded so the folder survives git

Validates the name against the Agent Skills naming rules before writing
anything. Stdlib only; no dependencies. Mirrors new-plugin's validation regex;
guarded by tests/test_new_router_skill.py.
"""

import argparse
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
    body.append(f"description: {description}")
    body.append("license: MIT")
    body.append("metadata:")
    body.append("  version: 0.1.0")
    if author:
        body.append(f"  author: {author}")
    body.append("---")
    body.append("")
    body.append(f"# {name}")
    body.append("")
    body.append("> Fill in: one line — the router's recurring job, and when an agent should reach for it.")
    body.append("")
    body.append("## The route")
    body.append("")
    body.append("> Fill in: the routing map. For every branch an agent can arrive with, name the")
    body.append("> one specialist that owns it and the predicate that selects it. One specialist per")
    body.append("> branch; no overlapping routes; cut branches that route nowhere.")
    body.append("")
    body.append("| Branch (what the agent arrives with) | Predicate (what selects the route) | Owner (skill that handles it) |")
    body.append("| --- | --- | --- |")
    body.append("|  |  |  |")
    body.append("")
    body.append("## When to use / not to use")
    body.append("")
    body.append("- Triggers: ...")
    body.append("- Non-triggers: ...")
    body.append("")
    body.append("## How to route")
    body.append("")
    body.append("1. Step with a completion criterion: ...")
    body.append("2. ...")
    body.append("")
    body.append("## Authority")
    body.append("")
    body.append("- May inspect: ...")
    body.append("- May create or change: ...")
    body.append("")
    body.append("## References")
    body.append("")
    body.append("> Detail belongs here, one level deep, loaded on demand:")
    body.append("> references/ROUTING.md — the routing discipline behind this map.")
    body.append("> references/SCRIPTING.md — UV script conventions for helpers in scripts/.")
    body.append("> references/WRITING.md — how this body was composed.")
    body.append("")
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

    for sub in ("references", "scripts"):
        os.makedirs(os.path.join(skill_dir, sub), exist_ok=True)
        gitkeep = os.path.join(skill_dir, sub, ".gitkeep")
        if not os.path.exists(gitkeep):
            open(gitkeep, "w").close()

    with open(skill_file, "w") as f:
        f.write(skill_template(args.name, args.description, args.author))

    print(f"created: {skill_file}")
    print(f"created: {os.path.join(skill_dir, 'references')}/")
    print(f"created: {os.path.join(skill_dir, 'scripts')}/")
    print("\nnext steps:")
    print("  1. Fill in the routing map and steps in SKILL.md (see references/routing.md and references/writing-for-agents.md).")
    print("  2. Add reference files and UV scripts as the router grows (see references/scripting.md).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
