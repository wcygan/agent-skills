#!/usr/bin/env python3
"""Observe worktree retention evidence; never delete. See ../references/LICENSE.txt."""

import sys

sys.dont_write_bytecode = True
import os
from pathlib import Path
import time
from mode_tools.common import Parser, ToolError, read_json, run, emit
from mode_tools.github import GitHub


def size_bytes(path):
    total = 0
    complete = True

    def failed(_):
        nonlocal complete
        complete = False

    for base, dirs, files in os.walk(path, followlinks=False, onerror=failed):
        for name in files:
            try:
                total += (Path(base) / name).lstat().st_size
            except OSError:
                complete = False
    return total, complete


def worktrees(repo):
    raw = run(["git", "worktree", "list", "--porcelain", "-z"], cwd=repo)
    result = []
    for block in raw.split("\0\0"):
        if not block.strip("\0"):
            continue
        row = {}
        for entry in block.split("\0"):
            key, _, value = entry.partition(" ")
            if key:
                row[key] = value
        if "worktree" not in row or "HEAD" not in row:
            raise ToolError("invalid worktree record")
        result.append(row)
    return result


def audit(repo, base=None, activity=None, fetch=False, gh_factory=GitHub):
    repo = str(Path(repo).resolve())
    warnings = []
    if base is None:
        for candidate in (
            "origin/HEAD",
            "origin/main",
            "origin/master",
            "main",
            "master",
        ):
            try:
                run(["git", "rev-parse", "--verify", candidate], cwd=repo)
                base = candidate
                break
            except ToolError:
                pass
    if base is None:
        raise ToolError("no base found; pass --base")
    if fetch:
        try:
            run(["git", "fetch", "origin"], cwd=repo)
        except ToolError as exc:
            warnings.append(f"fetch failed: {exc}")
    base_sha = run(
        ["git", "rev-parse", "--verify", base + "^{commit}"], cwd=repo
    ).strip()
    try:
        prs = gh_factory(cwd=repo).pulls("all")
        pr_available = True
    except ToolError as exc:
        prs = []
        pr_available = False
        warnings.append(f"PR evidence unavailable: {exc}")
    activity = activity or {}
    if not isinstance(activity, dict):
        raise ToolError("activity must map absolute worktree paths to records")
    for path, record in activity.items():
        if (
            not Path(path).is_absolute()
            or not isinstance(record, dict)
            or type(record.get("active")) is not bool
        ):
            raise ToolError(
                "activity requires absolute paths and explicit active booleans"
            )
        if "last_activity" in record and not isinstance(record["last_activity"], str):
            raise ToolError("last_activity must be a string")
    activity = {str(Path(path).resolve()): record for path, record in activity.items()}
    rows = []
    for index, wt in enumerate(worktrees(repo)):
        path = wt["worktree"]
        branch = wt.get("branch", "").removeprefix("refs/heads/")
        head = wt["HEAD"]
        row = dict(
            worktree=path,
            branch=branch or None,
            sha=head,
            primary=index == 0,
            locked="locked" in wt,
            pr=None,
            activity=activity.get(str(Path(path).resolve())),
            bucket="review",
        )
        try:
            raw = run(["git", "status", "--porcelain=v1", "-z"], cwd=path)
            # Any bytes indicate valuable local state, including untracked files.
            row["dirty"] = bool(raw)
            row["status"] = raw.split("\0") if raw else []
            stamp = int(run(["git", "log", "-1", "--format=%ct"], cwd=path).strip())
            row["ageDays"] = max(0, int((time.time() - stamp) / 86400))
            row["merged"] = not run(
                ["git", "rev-list", f"{base_sha}..{head}"], cwd=repo
            ).strip()
            row["sizeBytes"], row["sizeComplete"] = size_bytes(path)
            row["remote"] = "detached" if not branch else "no-remote"
            if branch:
                try:
                    counts = run(
                        [
                            "git",
                            "rev-list",
                            "--left-right",
                            "--count",
                            f"origin/{branch}...{head}",
                        ],
                        cwd=repo,
                    ).split()
                    behind, ahead = map(int, counts)
                    row.update(
                        remote="pushed" if ahead == behind == 0 else "diverged",
                        ahead=ahead,
                        behind=behind,
                    )
                except ToolError:
                    pass
            matches = [p for p in prs if p["headRefName"] == branch]
            if len(matches) == 1:
                row["pr"] = matches[0]
            if row["primary"] or row["locked"]:
                row["bucket"] = "hold-protected"
            elif row["dirty"]:
                row["bucket"] = "hold-local-work"
            elif any(p["state"] == "OPEN" for p in matches):
                row["bucket"] = "hold-open-pr"
            elif row["activity"] is None:
                row["bucket"] = "review-unknown-ownership"
            elif row["activity"]["active"]:
                row["bucket"] = "hold-active"
            elif len(matches) > 1 or not pr_available:
                row["bucket"] = "review-incomplete-evidence"
            elif row["merged"]:
                row["bucket"] = "candidate"
            elif row["pr"] and row["pr"]["state"] == "MERGED":
                row["bucket"] = "review-squash-equivalence"
        except (ToolError, OSError, ValueError) as exc:
            row.update(bucket="review-unavailable", error=str(exc))
        rows.append(row)
    rows.sort(key=lambda r: r.get("sizeBytes", 0), reverse=True)
    return {
        "base": base,
        "baseSha": base_sha,
        "fetched": fetch and not any(w.startswith("fetch failed") for w in warnings),
        "warnings": warnings,
        "worktrees": rows,
        "note": "Candidates require owner review; no deletion is performed.",
    }


def main(argv=None):
    p = Parser(description=__doc__)
    p.add_argument("repo", nargs="?", default=".")
    p.add_argument("-b", "--base")
    p.add_argument(
        "--activity", help="explicit ownership JSON; no transcript discovery"
    )
    p.add_argument(
        "--fetch", action="store_true", help="explicitly refresh origin refs"
    )
    p.add_argument("--json", action="store_true")
    a = p.parse_args(argv)
    try:
        result = audit(
            a.repo, a.base, read_json(a.activity) if a.activity else None, a.fetch
        )
        if a.json:
            emit(result)
        else:
            print(f"Base: {result['base']} ({result['baseSha']})")
            for row in result["worktrees"]:
                print(
                    f"{row.get('sizeBytes', '?')}\t{row['bucket']}\t{row['worktree']}"
                )
            for warning in result["warnings"]:
                print(warning, file=sys.stderr)
        return 0
    except (ToolError, OSError) as exc:
        print(f"error: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main())
