#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.11"
# dependencies = []
# ///
"""Publish the provider, then advance and install dotfiles' immutable skill pin."""
from __future__ import annotations

import argparse
import fcntl
import re
import subprocess
import sys
import tomllib
from pathlib import Path


def run(root: Path, *args: str, capture: bool = False) -> str:
    print(f"[{root.name}] {' '.join(args)}", flush=True)
    result = subprocess.run(args, cwd=root, check=True, text=True,
                            stdout=subprocess.PIPE if capture else None)
    return result.stdout.rstrip("\n") if capture else ""


def git(root: Path, *args: str) -> str:
    return run(root, "git", *args, capture=True)


def preflight(root: Path) -> str:
    if Path(git(root, "rev-parse", "--show-toplevel")).resolve() != root:
        raise ValueError(f"Not a repository root: {root}")
    branch = git(root, "symbolic-ref", "--short", "HEAD")
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


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--dotfiles", type=Path, default=Path(__file__).resolve().parents[2] / "dotfiles")
    args = parser.parse_args()
    provider = Path(__file__).resolve().parents[1]
    consumer = args.dotfiles.resolve()
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
        run(provider, "just", "check-full")
        commit_if_changed(provider, "chore(skills): publish current catalog", ".")
        run(provider, "git", "push", "origin", f"HEAD:refs/heads/{provider_branch}")
        sha = git(provider, "rev-parse", "HEAD")
        if not dirty:
            run(consumer, "git", "pull", "--ff-only", "origin", consumer_branch)
        update_pin(consumer / "agent-skills.lock.toml", sha)
        check = subprocess.run(["./bootstrap.sh", "agent-skills", "--check"], cwd=consumer)
        if check.returncode:
            run(consumer, "./bootstrap.sh", "agent-skills")
        run(consumer, "./bootstrap.sh", "agent-skills", "--check")
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
