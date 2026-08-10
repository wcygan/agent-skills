"""Vendor selected external Agent Skills at reproducible git revisions."""

from __future__ import annotations

import argparse
import json
import os
import shutil
import subprocess
import sys
import tempfile
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
LOCK_PATH = ROOT / "vendor" / "skills-lock.json"
SKILLS_DIR = ROOT / "skills"
ATTRIBUTIONS_PATH = ROOT / "vendor" / "ATTRIBUTIONS.md"
GREEN = "\033[32m"
YELLOW = "\033[33m"
RESET = "\033[0m"


def run(*args: str, cwd: Path | None = None) -> str:
    result = subprocess.run(args, cwd=cwd, check=True, text=True, capture_output=True)
    return result.stdout.strip()


def load_lock() -> dict:
    return json.loads(LOCK_PATH.read_text())


def clone_source(source: dict, destination: Path, ref: str | None = None) -> str:
    run("git", "clone", "--quiet", "--filter=blob:none", source["repository"], str(destination))
    run("git", "checkout", "--quiet", ref or source["ref"], cwd=destination)
    return run("git", "rev-parse", "HEAD", cwd=destination)


def positive_int(value: str) -> int:
    parsed = int(value)
    if parsed < 1:
        raise argparse.ArgumentTypeError("must be at least 1")
    return parsed


def check_source(source: dict) -> tuple[str, str, str]:
    with tempfile.TemporaryDirectory(prefix="agent-skills-check-") as scratch:
        revision = clone_source(source, Path(scratch) / "source", source.get("branch", "main"))
    return source["repository"], source["ref"], revision


def color_enabled(mode: str) -> bool:
    if mode == "always":
        return True
    if mode == "never" or "NO_COLOR" in os.environ:
        return False
    return sys.stdout.isatty() and os.environ.get("TERM") != "dumb"


def format_check_result(repository: str, locked: str, available: str, color: bool) -> str:
    if locked == available:
        prefix = "[UP TO DATE]"
        detail = f"{repository} @ {locked}"
        ansi = GREEN
    else:
        prefix = "[UPDATE AVAILABLE]"
        detail = f"{repository}: locked {locked}, available {available}"
        ansi = YELLOW
    if color:
        prefix = f"{ansi}{prefix}{RESET}"
    return f"{prefix} {detail}"


def normalize_frontmatter(skill_text: str, source: dict) -> str:
    fields = set(source.get("remove_frontmatter", []))
    if not fields:
        return skill_text
    if not skill_text.startswith("---\n"):
        raise RuntimeError("skill file is missing YAML frontmatter")
    frontmatter, separator, body = skill_text.removeprefix("---\n").partition("\n---")
    if not separator:
        raise RuntimeError("skill file has unterminated YAML frontmatter")
    lines = [
        line
        for line in frontmatter.splitlines()
        if line[:1].isspace() or line.partition(":")[0] not in fields
    ]
    return "---\n" + "\n".join(lines) + separator + body


def exclude_provider_manifests(_directory: str, names: list[str]) -> set[str]:
    """Keep provider-specific OpenAI agent manifests out of vendored skills."""
    return {name for name in names if name.lower() in {"openai.yaml", "openai.yml"}}


def sync_source(source: dict, update_lock: bool) -> tuple[str, str]:
    with tempfile.TemporaryDirectory(prefix="agent-skills-") as scratch:
        checkout = Path(scratch) / "source"
        revision = clone_source(source, checkout, source.get("branch", "main"))
        for upstream_name, local_name in source["skills"].items():
            upstream = checkout / "skills" / upstream_name
            target = SKILLS_DIR / local_name
            if not (upstream / "SKILL.md").is_file():
                raise RuntimeError(f"missing skill file: {upstream}")
            if target.exists() and not (target / ".vendored").is_file():
                raise RuntimeError(f"refusing to overwrite non-vendored skill: {target}")
            if target.exists():
                shutil.rmtree(target)
            shutil.copytree(upstream, target, ignore=exclude_provider_manifests)
            skill_file = target / "SKILL.md"
            skill_text = skill_file.read_text()
            upstream_skill_name = Path(upstream_name).name
            skill_text = skill_text.replace("\nname: " + upstream_skill_name + "\n", "\nname: " + local_name + "\n", 1)
            skill_file.write_text(normalize_frontmatter(skill_text, source))
            (target / ".vendored").write_text(
                f"source={source['repository']}\nupstream_skill={upstream_name}\nrevision={revision}\n"
            )
        if update_lock:
            source["ref"] = revision
    return source["repository"], revision


def write_attributions(lock: dict) -> None:
    lines = ["# Vendored skill attributions", "", "These skills are copied from their upstream repositories.", ""]
    for source in lock["sources"]:
        lines.extend([f"## {source['repository']}", "", f"- License: {source['license']}", f"- Revision: `{source['ref']}`", ""])
        for upstream, local in source["skills"].items():
            lines.append(f"- `{local}` from `skills/{upstream}`")
        lines.append("")
    ATTRIBUTIONS_PATH.write_text("\n".join(lines))


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("command", choices=("update", "check", "validate"))
    parser.add_argument("source", nargs="?", help="repository URL substring to select")
    parser.add_argument("-j", "--jobs", type=positive_int, help="parallel source checks (check only; default: 4)")
    parser.add_argument("--color", choices=("auto", "always", "never"), help="check output color (default: auto)")
    args = parser.parse_args()
    if args.command != "check" and args.jobs is not None:
        parser.error("--jobs can only be used with check")
    if args.command != "check" and args.color is not None:
        parser.error("--color can only be used with check")
    lock = load_lock()
    sources = [s for s in lock["sources"] if not args.source or args.source in s["repository"]]
    if not sources:
        raise SystemExit("no matching source")
    if args.command == "validate":
        for source in sources:
            for local in source["skills"].values():
                skill = SKILLS_DIR / local
                if not (skill / "SKILL.md").is_file():
                    raise SystemExit(f"missing vendored skill: {skill}")
                if not (skill / ".vendored").is_file():
                    raise SystemExit(f"missing provenance marker: {skill}")
                if any(path.name.lower() in {"openai.yaml", "openai.yml"} for path in skill.rglob("*")):
                    raise SystemExit(f"forbidden OpenAI manifest in vendored skill: {skill}")
        print(f"validated {sum(len(s['skills']) for s in sources)} vendored skills")
        return 0
    if args.command == "check":
        use_color = color_enabled(args.color or "auto")
        with ThreadPoolExecutor(max_workers=min(args.jobs or 4, len(sources))) as executor:
            for repository, locked, available in executor.map(check_source, sources):
                print(format_check_result(repository, locked, available, use_color))
        return 0
    for source in sources:
        repository, revision = sync_source(source, update_lock=True)
        print(f"updated {repository} to {revision}")
    if args.command == "update":
        LOCK_PATH.write_text(json.dumps(lock, indent=2) + "\n")
        write_attributions(lock)
    return 0
