#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.11"
# dependencies = []
# ///
"""Publish the provider, then advance and install dotfiles' immutable skill pin."""
from __future__ import annotations

import argparse
import fcntl
import os
import re
import subprocess
import sys
import tomllib
from pathlib import Path


def run(root: Path, *args: str, capture: bool = False) -> str:
    print(f"[{root.name}] {' '.join(args)}", flush=True)
    # A caller's VIRTUAL_ENV belongs to this script, not to the commands it runs.
    env = {key: value for key, value in os.environ.items() if key != "VIRTUAL_ENV"}
    result = subprocess.run(args, cwd=root, check=True, text=True, env=env,
                            stdout=subprocess.PIPE if capture else None)
    return result.stdout.rstrip("\n") if capture else ""


def git(root: Path, *args: str) -> str:
    return run(root, "git", *args, capture=True)


def preflight(root: Path) -> str:
    if Path(git(root, "rev-parse", "--show-toplevel")).resolve() != root:
        raise ValueError(f"Not a repository root: {root}")
    branch = git(root, "symbolic-ref", "--short", "HEAD")
    default = git(root, "symbolic-ref", "--short", "refs/remotes/origin/HEAD").removeprefix("origin/")
    if branch != default:
        raise ValueError(f"{root} is on {branch}; publish only from {default} after review")
    upstream = git(root, "rev-parse", "--abbrev-ref", "@{upstream}")
    if upstream != f"origin/{branch}":
        raise ValueError(f"Expected origin/{branch} upstream in {root}")
    for marker in ("MERGE_HEAD", "rebase-merge", "rebase-apply", "CHERRY_PICK_HEAD"):
        if Path(git(root, "rev-parse", "--git-path", marker)).exists():
            raise ValueError(f"Unfinished Git operation in {root}")
    return branch


def commit_if_changed(root: Path, message: str, *paths: str) -> None:
    run(root, "git", "add", "--", *paths)
    result = subprocess.run(["git", "diff", "--cached", "--quiet"], cwd=root)
    if result.returncode == 1:
        run(root, "git", "commit", "-m", message)
    elif result.returncode != 0:
        raise ValueError(f"Cannot inspect staged changes in {root}")


def update_pin(path: Path, sha: str) -> None:
    original = path.read_text()
    lock = tomllib.loads(original)
    if lock.get("repository") != "wcygan/agent-skills" or lock.get("directory") != ".agents/skills":
        raise ValueError("Unexpected dotfiles catalog source or destination")
    updated, count = re.subn(r'^commit = "[0-9a-f]{40}"$', f'commit = "{sha}"',
                             original, flags=re.MULTILINE)
    if count != 1:
        raise ValueError("Expected exactly one full commit pin")
    if updated != original:
        temporary = path.with_suffix(".toml.tmp")
        temporary.write_text(updated)
        temporary.replace(path)


def unsupported_entries(shared: Path, names: set[str] | None) -> list[Path]:
    """Entries the installer refuses to archive: anything but files and directories.

    `names` limits the scan to those skill trees; None scans every tree.
    """
    found: list[Path] = []
    if not shared.is_dir():
        return found
    for tree in sorted(shared.iterdir()):
        if names is not None and tree.name not in names:
            continue
        if tree.is_symlink() or not tree.is_dir():
            continue
        for directory, subdirectories, files in os.walk(tree):
            for name in sorted(subdirectories + files):
                path = Path(directory) / name
                if path.is_symlink() or not (path.is_dir() or path.is_file()):
                    found.append(path)
    return found


def plan_links(catalog: set[str], shared: Path, claude: Path) -> tuple[list[str], list[str], list[str]]:
    """Plan `claude/<name> -> shared/<name>` links: names to add, remove, and leave alone.

    Only a dangling link into `shared` for a skill outside the catalog is removed.
    An entry that is anything other than the expected link is left alone.
    """
    if not claude.is_dir():
        return [], [], []
    add, conflicts = [], []
    for name in sorted(catalog):
        link = claude / name
        if link.is_symlink() and Path(os.readlink(link)) == shared / name:
            continue
        if link.is_symlink() or link.exists():
            conflicts.append(name)
        else:
            add.append(name)
    remove = sorted(
        link.name for link in claude.iterdir()
        if link.is_symlink() and link.name not in catalog
        and Path(os.readlink(link)).parent == shared and not link.exists()
    )
    return add, remove, conflicts


def apply_links(add: list[str], remove: list[str], shared: Path, claude: Path) -> None:
    for name in remove:
        (claude / name).unlink()
    for name in add:
        (claude / name).symlink_to(shared / name)


def report_plan(provider: Path, consumer: Path, provider_branch: str, consumer_branch: str,
                reset_global: bool, links: tuple[list[str], list[str], list[str]]) -> None:
    lock = tomllib.loads((consumer / "agent-skills.lock.toml").read_text())
    check = subprocess.run(["./bootstrap.sh", "agent-skills", "--check"], cwd=consumer)
    unpushed = git(provider, "rev-list", "--count", f"origin/{provider_branch}..HEAD")
    add, remove, conflicts = links
    print(f"Dry run: no pushes, pin updates, installs, or link changes.\n"
          f"Provider {provider} on {provider_branch} at {git(provider, 'rev-parse', 'HEAD')}; "
          f"{unpushed} unpushed commit(s) would be pushed.\n"
          f"Consumer {consumer} on {consumer_branch}; current pin {lock.get('commit')}; "
          f"catalog check {'passes' if check.returncode == 0 else 'fails'}.\n"
          f"Install mode: {'--reset --yes' if reset_global else '--prune when the check fails'}.\n"
          f"Claude links: add {add or 'none'}; remove {remove or 'none'}; "
          f"left alone {conflicts or 'none'}.\n"
          f"Rerun with --apply to publish and install.")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--dotfiles", type=Path,
                        help="Consumer checkout (default: dotfiles beside the main checkout)")
    parser.add_argument("--apply", action="store_true",
                        help="Push, pin, and install; without it, only preflight and report")
    parser.add_argument("--reset-global", action="store_true",
                        help="Archive every shared user skill outside this catalog")
    args = parser.parse_args()
    provider = Path(__file__).resolve().parents[1]
    common = Path(git(provider, "rev-parse", "--path-format=absolute", "--git-common-dir"))
    consumer = (args.dotfiles or common.parent.parent / "dotfiles").resolve()
    # Fail fast on overlapping invocations; the installer also owns its user lock.
    lock_path = Path(git(provider, "rev-parse", "--git-path", "reinstall-agent-skills.lock"))
    if not lock_path.is_absolute():
        lock_path = provider / lock_path
    with lock_path.open("a") as handle:
        fcntl.flock(handle, fcntl.LOCK_EX | fcntl.LOCK_NB)
        provider_branch = preflight(provider)
        consumer_branch = preflight(consumer)
        dirty = git(consumer, "status", "--porcelain")
        # Permit the lock-only state left by an interrupted prior run.
        if dirty and any(line[3:] != "agent-skills.lock.toml" for line in dirty.splitlines()):
            raise ValueError("Dotfiles has unrelated changes; preserve them before running")
        if dirty:
            git(consumer, "fetch", "origin", consumer_branch)
            if git(consumer, "rev-parse", "HEAD") != git(consumer, "rev-parse", f"origin/{consumer_branch}"):
                raise ValueError("Interrupted lock update requires clean, synchronized dotfiles HEAD")
        git(provider, "fetch", "origin", provider_branch)
        if git(provider, "merge-base", "HEAD", f"origin/{provider_branch}") != git(provider, "rev-parse", f"origin/{provider_branch}"):
            raise ValueError("Provider is behind or diverged; reconcile it before publishing")
        pending = git(provider, "status", "--porcelain").splitlines()
        if pending:
            raise ValueError(f"Provider has {len(pending)} uncommitted path(s); "
                             "commit the reviewed change or discard it first")
        lock = tomllib.loads((consumer / "agent-skills.lock.toml").read_text())
        shared = Path.home() / lock.get("directory", ".agents/skills")
        claude = Path.home() / ".claude" / "skills"
        skills = provider / "skills"
        catalog = {entry.name for entry in skills.iterdir() if entry.is_dir()} if skills.is_dir() else set()
        pinned = set(git(provider, "ls-tree", "--name-only", f"{lock.get('commit')}:skills").splitlines())
        blocked = unsupported_entries(shared, None if args.reset_global else catalog | pinned)
        if blocked:
            raise ValueError("The installer refuses skill trees that hold anything but files and "
                             "directories; move these out first: " + ", ".join(map(str, blocked)))
        if not args.apply:
            report_plan(provider, consumer, provider_branch, consumer_branch, args.reset_global,
                        plan_links(catalog, shared, claude))
            return
        run(provider, "just", "check-full")
        run(provider, "git", "push", "origin", f"HEAD:refs/heads/{provider_branch}")
        sha = git(provider, "rev-parse", "HEAD")
        if not dirty:
            run(consumer, "git", "pull", "--ff-only", "origin", consumer_branch)
        update_pin(consumer / "agent-skills.lock.toml", sha)
        check = subprocess.run(["./bootstrap.sh", "agent-skills", "--check"], cwd=consumer)
        if args.reset_global:
            run(consumer, "./bootstrap.sh", "agent-skills", "--reset", "--yes")
        elif check.returncode:
            run(consumer, "./bootstrap.sh", "agent-skills", "--prune")
        run(consumer, "./bootstrap.sh", "agent-skills", "--check")
        add, remove, conflicts = plan_links(catalog, shared, claude)
        apply_links(add, remove, shared, claude)
        print(f"Claude links: added {add or 'none'}; removed {remove or 'none'}; "
              f"left alone {conflicts or 'none'}.")
        run(consumer, "make", "test-pre")
        run(consumer, "git", "diff", "--check")
        commit_if_changed(consumer, "chore(skills): advance catalog pin", "agent-skills.lock.toml")
        run(consumer, "git", "push", "origin", f"HEAD:refs/heads/{consumer_branch}")
        print(f"Published and verified wcygan/agent-skills@{sha}")


if __name__ == "__main__":
    try:
        main()
    except (ValueError, OSError, subprocess.CalledProcessError) as error:
        sys.exit(f"Stopped: {error}. Completed steps remain durable; rerun after resolving the failure.")
