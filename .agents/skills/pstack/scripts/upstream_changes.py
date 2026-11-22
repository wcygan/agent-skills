#!/usr/bin/env python3
"""Report what changed in upstream pstack skills and which local skills it touches.

Usage: python3 -B upstream_changes.py [--days N]   (run from the repository root)

Reads each skills/*/SKILL.md `upstream-path` to map upstream skill directories
to local skills, then asks GitHub for the commits under pstack/skills.
Needs an authenticated `gh`. Changes nothing.
"""
import argparse
import datetime
import json
import pathlib
import re
import subprocess
import sys

REPO = "cursor/plugins"
ROOT = "pstack/skills/"


def gh(path):
    out = subprocess.run(["gh", "api", "--paginate", "--slurp", path],
                         capture_output=True, text=True)
    if out.returncode:
        sys.exit(f"gh api {path} failed:\n{out.stderr}")
    return [item for page in json.loads(out.stdout)
            for item in (page if isinstance(page, list) else [page])]


def local_map():
    mapped = {}
    for skill in sorted(pathlib.Path("skills").glob("*/SKILL.md")):
        text = skill.read_text()
        if REPO not in text:
            continue
        match = re.search(r"^\s*upstream-path:\s*(.+)$", text, re.M)
        if not match:
            continue
        for source in match.group(1).split(";"):
            name = source.strip().removeprefix(ROOT).split("/")[0]
            if skill.parent.name not in mapped.setdefault(name, []):
                mapped[name].append(skill.parent.name)
    return mapped


def main():
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--days", type=int, default=14)
    days = parser.parse_args().days
    if not pathlib.Path("skills").is_dir():
        sys.exit("Run from the repository root: no skills/ directory here.")
    mapped = local_map()
    since = (datetime.datetime.now(datetime.timezone.utc)
             - datetime.timedelta(days=days)).strftime("%Y-%m-%dT%H:%M:%SZ")

    upstream = [e["name"] for e in gh(f"repos/{REPO}/contents/{ROOT.rstrip('/')}")]
    unmapped = [n for n in upstream if n not in mapped]
    print(f"Upstream skills no local skill names as a source ({len(unmapped)}):")
    print("  " + ", ".join(unmapped) if unmapped else "  none")

    commits = gh(f"repos/{REPO}/commits?path={ROOT.rstrip('/')}&since={since}&per_page=100")
    print(f"\nUpstream commits under {ROOT} in the last {days} days ({len(commits)}):")
    touched = {}
    for commit in commits:
        sha = commit["sha"]
        subject = commit["commit"]["message"].splitlines()[0]
        print(f"  {sha[:9]} {commit['commit']['author']['date'][:10]} {subject}")
        for page in gh(f"repos/{REPO}/commits/{sha}?per_page=100"):
            for changed in page.get("files", []):
                name = changed["filename"]
                if not name.startswith(ROOT):
                    continue
                skill, _, rest = name.removeprefix(ROOT).partition("/")
                touched.setdefault(skill, set()).add(f"{changed['status']} {rest}")

    print("\nChanged upstream skill -> local skills that name it:")
    for skill in sorted(touched):
        local = ", ".join(mapped.get(skill, [])) or "no local skill"
        files = sorted(touched[skill])
        added = [f for f in files if f.startswith("added ")]
        print(f"  {skill} -> {local}  ({len(files)} files"
              + (f"; {', '.join(added)}" if added else "") + ")")
    if not touched:
        print("  none")


if __name__ == "__main__":
    main()
