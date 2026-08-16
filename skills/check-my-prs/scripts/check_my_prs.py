#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.11"
# dependencies = [
#   "rich==14.3.4",
# ]
# ///

"""Read-only terminal health report for a GitHub pull request or PR stack."""

from __future__ import annotations

import argparse
import json
import os
import re
import shutil
import subprocess
import sys
from collections import Counter, defaultdict
from collections.abc import Iterable, Sequence
from concurrent.futures import ThreadPoolExecutor, as_completed
from dataclasses import dataclass
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

from rich import box
from rich.console import Console
from rich.panel import Panel
from rich.table import Table
from rich.text import Text

SCHEMA_VERSION = 1
MAX_GRAPHQL_ITEMS = 100
EXPECTED_HEADINGS = ["Problem & Solution Overview", "Testing Done"]
VISUAL_CUES = re.compile(
    r"(?i)\b(?:animation|browser|layout|resize|screen|visual|ui|ux|interaction|video|screenshot)\b"
)
CHECK_FIELDS = "name,state,bucket,link,startedAt,completedAt,workflow"


class InspectorError(RuntimeError):
    """An environment or input failure that prevents a usable report."""


@dataclass(frozen=True)
class CommandResult:
    args: tuple[str, ...]
    returncode: int
    stdout: str
    stderr: str


def run_command(
    args: Sequence[str],
    *,
    cwd: Path | None = None,
    timeout: int = 45,
) -> CommandResult:
    """Run a read-only command and capture its complete result."""
    try:
        completed = subprocess.run(
            list(args),
            cwd=cwd,
            check=False,
            capture_output=True,
            text=True,
            timeout=timeout,
        )
    except subprocess.TimeoutExpired as exc:
        raise InspectorError(
            f"command timed out after {timeout}s: {' '.join(args)}"
        ) from exc
    except OSError as exc:
        raise InspectorError(f"could not run {args[0]}: {exc}") from exc
    return CommandResult(
        tuple(args), completed.returncode, completed.stdout, completed.stderr
    )


def parse_json_result(result: CommandResult) -> Any | None:
    """Return JSON stdout when present and valid, otherwise None."""
    if not result.stdout.strip():
        return None
    try:
        return json.loads(result.stdout)
    except json.JSONDecodeError:
        return None


def concise_error(result: CommandResult) -> str:
    message = (
        result.stderr.strip() or result.stdout.strip() or f"exit {result.returncode}"
    )
    return message.splitlines()[0][:240]


def require_executable(name: str) -> None:
    if shutil.which(name) is None:
        raise InspectorError(f"required executable not found: {name}")


def parse_repo(value: str) -> tuple[str, str]:
    value = value.removesuffix(".git").rstrip("/")
    if value.startswith(("http://", "https://")):
        value = value.split("github.com/", 1)[-1]
    if value.startswith("git@github.com:"):
        value = value.split(":", 1)[1]
    parts = [part for part in value.split("/") if part]
    if len(parts) < 2:
        raise InspectorError(f"repository must be OWNER/REPO, got: {value}")
    return parts[-2], parts[-1]


def resolve_repository(explicit: str | None) -> str:
    if explicit:
        owner, name = parse_repo(explicit)
        return f"{owner}/{name}"
    result = run_command(["gh", "repo", "view", "--json", "nameWithOwner"])
    data = parse_json_result(result)
    if (
        result.returncode != 0
        or not isinstance(data, dict)
        or not data.get("nameWithOwner")
    ):
        raise InspectorError(
            f"could not resolve GitHub repository: {concise_error(result)}"
        )
    return str(data["nameWithOwner"])


def resolve_pr_number(repository: str, explicit: str | None) -> int:
    if explicit:
        if explicit.isdigit():
            return int(explicit)
        match = re.search(r"/pull/(\d+)(?:/|$)", explicit)
        if match:
            return int(match.group(1))
    args = ["gh", "pr", "view"]
    if explicit:
        args.append(explicit)
    args.extend(["-R", repository, "--json", "number"])
    result = run_command(args)
    data = parse_json_result(result)
    if result.returncode != 0 or not isinstance(data, dict) or not data.get("number"):
        target = explicit or "the current branch"
        raise InspectorError(
            f"could not resolve a PR for {target}: {concise_error(result)}"
        )
    return int(data["number"])


PULL_REQUEST_QUERY = r"""
query PullRequestHealth($owner: String!, $name: String!, $number: Int!) {
  repository(owner: $owner, name: $name) {
    pullRequest(number: $number) {
      number
      title
      url
      state
      isDraft
      merged
      additions
      deletions
      changedFiles
      mergeable
      mergeStateStatus
      canBeRebased
      reviewDecision
      headRefName
      headRefOid
      baseRefName
      baseRefOid
      body
      createdAt
      updatedAt
      totalCommentsCount
      comments { totalCount }
      reviewRequests(first: 100) {
        totalCount
        nodes {
          requestedReviewer {
            __typename
            ... on User { login }
            ... on Team { slug }
          }
        }
      }
      reviews(first: 100) {
        totalCount
        nodes {
          state
          submittedAt
          author { login }
        }
      }
      reviewThreads(first: 100) {
        totalCount
        nodes {
          isResolved
          isOutdated
          comments(first: 1) { totalCount }
        }
      }
      files(first: 100) {
        totalCount
        nodes { path additions deletions changeType }
      }
      commits(first: 100) {
        totalCount
        nodes { commit { oid messageHeadline } }
      }
      stackEntry { position }
      stack {
        number
        size
        baseRefName
        entries(first: 100) {
          totalCount
          nodes {
            position
            pullRequest { number headRefName baseRefName }
          }
        }
      }
    }
  }
}
"""


def fetch_pr_graphql(repository: str, number: int) -> dict[str, Any]:
    owner, name = parse_repo(repository)
    result = run_command(
        [
            "gh",
            "api",
            "graphql",
            "-f",
            f"query={PULL_REQUEST_QUERY}",
            "-F",
            f"owner={owner}",
            "-F",
            f"name={name}",
            "-F",
            f"number={number}",
        ]
    )
    data = parse_json_result(result)
    if result.returncode != 0 or not isinstance(data, dict):
        raise InspectorError(
            f"GraphQL lookup for PR #{number} failed: {concise_error(result)}"
        )
    pr = ((data.get("data") or {}).get("repository") or {}).get("pullRequest")
    if not isinstance(pr, dict):
        errors = data.get("errors") or []
        detail = (
            errors[0].get("message")
            if errors and isinstance(errors[0], dict)
            else "not found"
        )
        raise InspectorError(
            f"GraphQL lookup for PR #{number} returned no pull request: {detail}"
        )
    return pr


def checks_command(repository: str, number: int, *, required: bool) -> CommandResult:
    args = [
        "gh",
        "pr",
        "checks",
        str(number),
        "-R",
        repository,
        "--json",
        CHECK_FIELDS,
    ]
    if required:
        args.append("--required")
    return run_command(args)


def parse_checks(
    result: CommandResult, *, required: bool
) -> tuple[list[dict[str, Any]], bool, str | None]:
    data = parse_json_result(result)
    if isinstance(data, list):
        return [item for item in data if isinstance(item, dict)], True, None
    message = concise_error(result)
    lowered = message.lower()
    if (required and "no required checks reported" in lowered) or (
        not required and "no checks reported" in lowered
    ):
        return [], True, None
    label = "required checks" if required else "checks"
    return [], False, f"{label} unavailable for PR: {message}"


def fetch_pr_bundle(repository: str, number: int) -> dict[str, Any]:
    pr = fetch_pr_graphql(repository, number)
    all_result = checks_command(repository, number, required=False)
    required_result = checks_command(repository, number, required=True)
    checks, checks_known, checks_gap = parse_checks(all_result, required=False)
    required_checks, required_known, required_gap = parse_checks(
        required_result, required=True
    )
    return {
        "pr": pr,
        "checks": checks,
        "checks_known": checks_known,
        "required_checks": required_checks,
        "required_known": required_known,
        "evidence_gaps": [gap for gap in (checks_gap, required_gap) if gap],
    }


def inspect_local_stack() -> dict[str, Any]:
    extensions = run_command(["gh", "extension", "list"])
    installed = extensions.returncode == 0 and bool(
        re.search(r"(?m)(?:^|[\s/])gh-stack(?:\s|$)", extensions.stdout)
    )
    if not installed:
        return {
            "available": False,
            "in_stack": False,
            "branches": [],
            "error": "gh-stack extension is not installed; local stack health is unavailable",
        }

    result = run_command(["gh", "stack", "view", "--json"])
    data = parse_json_result(result)
    if result.returncode == 0 and isinstance(data, dict):
        branches = (
            data.get("branches") if isinstance(data.get("branches"), list) else []
        )
        return {
            "available": True,
            "in_stack": True,
            "trunk": data.get("trunk"),
            "current_branch": data.get("currentBranch"),
            "branches": branches,
            "error": None,
        }
    if result.returncode == 2:
        return {"available": True, "in_stack": False, "branches": [], "error": None}
    return {
        "available": True,
        "in_stack": False,
        "branches": [],
        "error": f"local stack inspection failed: {concise_error(result)}",
    }


def find_repository_guidance(root: Path | None) -> dict[str, bool]:
    result = {"title": False, "branch": False, "body": False}
    if root is None:
        return result
    candidates = [
        root / "AGENTS.md",
        root / "CONTRIBUTING.md",
        root / ".github" / "CONTRIBUTING.md",
        root / ".github" / "pull_request_template.md",
        root / ".github" / "PULL_REQUEST_TEMPLATE.md",
    ]
    patterns = {
        "title": re.compile(
            r"(?i)\b(?:pull request|pr)\s+title\b|\btitle convention\b"
        ),
        "branch": re.compile(r"(?i)\bbranch(?:es)?\s+(?:name|naming|convention)"),
        "body": re.compile(
            r"(?i)Problem & Solution Overview|Testing Done|pull.request.template"
        ),
    }
    for path in candidates:
        try:
            content = path.read_text(encoding="utf-8")[:500_000]
        except (FileNotFoundError, OSError, UnicodeError):
            continue
        for key, pattern in patterns.items():
            if pattern.search(content):
                result[key] = True
    return result


def git_root() -> Path | None:
    if shutil.which("git") is None:
        return None
    result = run_command(["git", "rev-parse", "--show-toplevel"])
    if result.returncode != 0 or not result.stdout.strip():
        return None
    return Path(result.stdout.strip()).resolve()


def checkout_repository(root: Path | None) -> str | None:
    if root is None:
        return None
    result = run_command(["gh", "repo", "view", "--json", "nameWithOwner"], cwd=root)
    data = parse_json_result(result)
    if result.returncode != 0 or not isinstance(data, dict):
        return None
    value = data.get("nameWithOwner")
    return str(value) if value else None


def current_branch(root: Path | None) -> str | None:
    if root is None:
        return None
    result = run_command(["git", "branch", "--show-current"], cwd=root)
    return (
        result.stdout.strip()
        if result.returncode == 0 and result.stdout.strip()
        else None
    )


def collect_snapshot(repository: str, target_pr: int) -> dict[str, Any]:
    seed = fetch_pr_bundle(repository, target_pr)
    seed_pr = seed["pr"]
    remote_stack = (
        seed_pr.get("stack") if isinstance(seed_pr.get("stack"), dict) else None
    )
    numbers = [target_pr]
    if remote_stack:
        entries = (remote_stack.get("entries") or {}).get("nodes") or []
        ordered = sorted(
            (entry for entry in entries if isinstance(entry, dict)),
            key=lambda entry: int(entry.get("position") or 0),
        )
        numbers = [
            int(entry["pullRequest"]["number"])
            for entry in ordered
            if isinstance(entry.get("pullRequest"), dict)
            and entry["pullRequest"].get("number")
        ]
        if target_pr not in numbers:
            numbers.append(target_pr)

    bundles: dict[int, dict[str, Any]] = {target_pr: seed}
    remaining = [number for number in numbers if number != target_pr]
    fetch_errors: list[str] = []
    if remaining:
        with ThreadPoolExecutor(max_workers=min(6, len(remaining))) as executor:
            futures = {
                executor.submit(fetch_pr_bundle, repository, number): number
                for number in remaining
            }
            for future in as_completed(futures):
                number = futures[future]
                try:
                    bundles[number] = future.result()
                except InspectorError as exc:
                    fetch_errors.append(str(exc))

    root = git_root()
    local_repository = checkout_repository(root)
    local_applies = local_repository == repository and current_branch(
        root
    ) == seed_pr.get("headRefName")
    local = (
        inspect_local_stack()
        if local_applies
        else {
            "applicable": False,
            "available": False,
            "in_stack": False,
            "branches": [],
            "error": None,
        }
    )
    if local_applies:
        local["applicable"] = True
    ordered_bundles = [bundles[number] for number in numbers if number in bundles]
    return {
        "repository": repository,
        "target_pr": target_pr,
        "remote_stack": remote_stack,
        "local_stack": local,
        "pull_requests": ordered_bundles,
        "repository_guidance": find_repository_guidance(root)
        if local_repository == repository
        else {},
        "evidence_gaps": fetch_errors,
    }


def collect_local_fallback_snapshot(repository: str) -> dict[str, Any] | None:
    """Collect a local stack when the current branch has no pull request yet."""
    root = git_root()
    if checkout_repository(root) != repository:
        return None
    local = inspect_local_stack()
    local["applicable"] = True
    if not local.get("in_stack"):
        return None

    numbers = local_stack_numbers(local)
    bundles: dict[int, dict[str, Any]] = {}
    fetch_errors: list[str] = []
    if numbers:
        with ThreadPoolExecutor(max_workers=min(6, len(numbers))) as executor:
            futures = {
                executor.submit(fetch_pr_bundle, repository, number): number
                for number in numbers
            }
            for future in as_completed(futures):
                number = futures[future]
                try:
                    bundles[number] = future.result()
                except InspectorError as exc:
                    fetch_errors.append(str(exc))

    current = local.get("current_branch")
    target_pr: int | None = None
    for branch in local.get("branches") or []:
        if not isinstance(branch, dict) or branch.get("name") != current:
            continue
        pr = branch.get("pr") if isinstance(branch.get("pr"), dict) else {}
        if pr.get("number"):
            target_pr = int(pr["number"])
    if target_pr is None and numbers:
        target_pr = numbers[0]

    ordered_bundles = [bundles[number] for number in numbers if number in bundles]
    remote_stack = next(
        (
            bundle["pr"]["stack"]
            for bundle in ordered_bundles
            if isinstance(bundle.get("pr"), dict)
            and isinstance(bundle["pr"].get("stack"), dict)
        ),
        None,
    )
    return {
        "repository": repository,
        "target_pr": target_pr,
        "remote_stack": remote_stack,
        "local_stack": local,
        "pull_requests": ordered_bundles,
        "repository_guidance": find_repository_guidance(root),
        "evidence_gaps": fetch_errors,
    }


def parse_body(body: str | None) -> dict[str, Any]:
    text = body or ""
    headings: list[tuple[int, str]] = []
    lines = text.splitlines()
    in_fence = False
    for index, line in enumerate(lines):
        stripped = line.strip()
        if stripped.startswith(("```", "~~~")):
            in_fence = not in_fence
            continue
        if in_fence:
            continue
        match = re.match(r"^##\s+(.+?)\s*#*\s*$", line)
        if match:
            headings.append((index, match.group(1).strip()))

    counts = Counter(name for _, name in headings)
    findings: list[str] = []
    positions: list[int] = []
    section_nonempty: dict[str, bool] = {}
    for expected in EXPECTED_HEADINGS:
        if counts[expected] == 0:
            findings.append(f"missing `## {expected}`")
            continue
        if counts[expected] > 1:
            findings.append(f"duplicated `## {expected}`")
        position = next(index for index, name in headings if name == expected)
        positions.append(position)
        next_heading = next(
            (index for index, _ in headings if index > position), len(lines)
        )
        content = "\n".join(lines[position + 1 : next_heading]).strip()
        section_nonempty[expected] = bool(content)
        if not content:
            findings.append(f"empty `## {expected}`")
    if len(positions) == len(EXPECTED_HEADINGS) and positions != sorted(positions):
        findings.append("required H2 sections are out of order")
    unexpected = [name for _, name in headings if name not in EXPECTED_HEADINGS]
    if unexpected:
        findings.append(
            "unexpected H2 section(s): " + ", ".join(f"`{name}`" for name in unexpected)
        )

    testing_text = ""
    if counts["Testing Done"]:
        testing_position = next(
            index for index, name in headings if name == "Testing Done"
        )
        next_heading = next(
            (index for index, _ in headings if index > testing_position), len(lines)
        )
        testing_text = "\n".join(lines[testing_position + 1 : next_heading]).strip()
    vague_testing = bool(
        testing_text
        and re.fullmatch(
            r"(?is)[-*\s]*(?:tests?|ci|checks?)\s+(?:pass(?:ed)?|green)[.!\s]*",
            testing_text,
        )
    )
    if vague_testing:
        findings.append(
            "testing evidence is vague; name the command or scenario and result"
        )
    if len(text.split()) > 700:
        findings.append("description is long; keep the overview high-level and brief")
    media_urls = re.findall(
        r"https://github\.com/user-attachments/assets/[^)\s]+", text
    )
    bare_media_urls = [
        line.strip()
        for line in lines
        if line.strip().startswith("https://github.com/user-attachments/assets/")
    ]
    has_before_after_table = bool(
        re.search(r"(?im)^\|[^\n]+\|\s*$", text)
        and re.search(r"(?i)before\s*\|\s*after|before.{0,40}after", text)
    )
    visual_cue = bool(VISUAL_CUES.search(text))
    visual_recommendation = None
    if visual_cue and not media_urls:
        visual_recommendation = (
            "add visual proof with `github-pr-media-proof` for this observable change"
        )
        findings.append(visual_recommendation)
    elif visual_cue and not has_before_after_table:
        visual_recommendation = (
            "consider a Markdown before/after table with `github-pr-media-proof`"
        )
    return {
        "findings": findings,
        "word_count": len(text.split()),
        "headings": [name for _, name in headings],
        "testing_present": bool(testing_text),
        "testing_vague": vague_testing,
        "sections_nonempty": section_nonempty,
        "media_urls": media_urls,
        "bare_media_urls": bare_media_urls,
        "visual_cue": visual_cue,
        "visual_recommendation": visual_recommendation,
        "has_before_after_table": has_before_after_table,
    }


def is_generated_path(path: str) -> bool:
    lowered = path.lower()
    name = Path(lowered).name
    lockfiles = {
        "package-lock.json",
        "pnpm-lock.yaml",
        "yarn.lock",
        "cargo.lock",
        "poetry.lock",
        "uv.lock",
        "go.sum",
    }
    return (
        name in lockfiles
        or any(
            part
            in {
                "vendor",
                "vendored",
                "dist",
                "build",
                "generated",
                "snapshots",
                "__snapshots__",
            }
            for part in Path(lowered).parts
        )
        or name.endswith(
            (".min.js", ".min.css", ".pb.go", ".generated.ts", ".generated.js")
        )
    )


def assess_scope(pr: dict[str, Any]) -> dict[str, Any]:
    files = (pr.get("files") or {}).get("nodes") or []
    substantive = [
        item
        for item in files
        if isinstance(item, dict) and not is_generated_path(str(item.get("path", "")))
    ]
    generated = [
        item
        for item in files
        if isinstance(item, dict) and is_generated_path(str(item.get("path", "")))
    ]

    def churn(items: Iterable[dict[str, Any]]) -> int:
        return sum(
            int(item.get("additions") or 0) + int(item.get("deletions") or 0)
            for item in items
        )

    subsystem_churn: dict[str, int] = defaultdict(int)
    for item in substantive:
        path = str(item.get("path", ""))
        parts = Path(path).parts
        subsystem = parts[0] if len(parts) > 1 else "repository root"
        subsystem_churn[subsystem] += int(item.get("additions") or 0) + int(
            item.get("deletions") or 0
        )

    substantive_churn = churn(substantive)
    dominant = sorted(subsystem_churn.items(), key=lambda pair: pair[1], reverse=True)
    possible_concerns = [
        name
        for name, amount in dominant
        if substantive_churn and amount / substantive_churn >= 0.20
    ][:4]
    commit_total = int((pr.get("commits") or {}).get("totalCount") or 0)
    changed_files = int(pr.get("changedFiles") or len(files))
    signals: list[str] = []
    if changed_files >= 25:
        signals.append(f"broad file surface ({changed_files} files)")
    if substantive_churn >= 1000:
        signals.append(f"high substantive churn ({substantive_churn} lines)")
    if commit_total >= 12:
        signals.append(f"many commits ({commit_total})")
    if substantive_churn >= 1000 and len(possible_concerns) >= 2:
        signals.append("multiple substantial areas: " + ", ".join(possible_concerns))
    return {
        "changed_files": changed_files,
        "total_churn": int(pr.get("additions") or 0) + int(pr.get("deletions") or 0),
        "substantive_churn": substantive_churn,
        "generated_churn": churn(generated),
        "commit_count": commit_total,
        "possible_concerns": possible_concerns,
        "signals": signals,
        "split_recommendation": None,
    }


def title_style(title: str) -> str:
    if re.match(r"^[a-z][a-z0-9-]*(?:\([^)]+\))?!?:\s+", title):
        return "conventional"
    if re.match(r"^\[[A-Z][A-Z0-9]+-\d+\]\s+", title):
        return "ticket-prefix"
    if re.match(r"^[A-Z][^.!?]*(?:[.!?])$", title):
        return "sentence"
    if title[:1].isupper():
        return "capitalized"
    return "lowercase"


def review_summary(pr: dict[str, Any]) -> dict[str, Any]:
    threads = (pr.get("reviewThreads") or {}).get("nodes") or []
    active_threads = sum(
        1
        for thread in threads
        if isinstance(thread, dict)
        and not thread.get("isResolved")
        and not thread.get("isOutdated")
    )
    outdated_threads = sum(
        1 for thread in threads if isinstance(thread, dict) and thread.get("isOutdated")
    )
    latest_by_author: dict[str, str] = {}
    for review in (pr.get("reviews") or {}).get("nodes") or []:
        if not isinstance(review, dict):
            continue
        author = (review.get("author") or {}).get("login")
        if author:
            latest_by_author[str(author)] = str(review.get("state") or "")
    approvals = sum(1 for state in latest_by_author.values() if state == "APPROVED")
    changes_requested = sum(
        1 for state in latest_by_author.values() if state == "CHANGES_REQUESTED"
    )
    requests = (pr.get("reviewRequests") or {}).get("nodes") or []
    requested: list[str] = []
    for request in requests:
        reviewer = (request or {}).get("requestedReviewer") or {}
        value = reviewer.get("login") or reviewer.get("slug")
        if value:
            requested.append(str(value))
    return {
        "approvals": approvals,
        "changes_requested": changes_requested,
        "active_threads": active_threads,
        "outdated_threads": outdated_threads,
        "requested_reviewers": requested,
        "issue_comments": int((pr.get("comments") or {}).get("totalCount") or 0),
        "total_comments": int(pr.get("totalCommentsCount") or 0),
    }


def normalize_checks(bundle: dict[str, Any]) -> dict[str, Any]:
    all_checks = bundle.get("checks") or []
    required_checks = bundle.get("required_checks") or []
    required_keys = {
        (str(item.get("name")), str(item.get("workflow"))) for item in required_checks
    }
    items: list[dict[str, Any]] = []
    all_counts = Counter()
    required_counts = Counter()
    for item in all_checks:
        bucket = str(item.get("bucket") or "unknown").lower()
        if bucket not in {"pass", "fail", "pending", "skipping", "cancel"}:
            bucket = "unknown"
        key = (str(item.get("name")), str(item.get("workflow")))
        is_required = key in required_keys
        all_counts[bucket] += 1
        if is_required:
            required_counts[bucket] += 1
        items.append(
            {
                "name": item.get("name"),
                "workflow": item.get("workflow"),
                "state": item.get("state"),
                "bucket": bucket,
                "required": is_required,
                "link": item.get("link"),
            }
        )
    for item in required_checks:
        key = (str(item.get("name")), str(item.get("workflow")))
        if key not in {
            (str(existing.get("name")), str(existing.get("workflow")))
            for existing in all_checks
        }:
            bucket = str(item.get("bucket") or "unknown").lower()
            if bucket not in {"pass", "fail", "pending", "skipping", "cancel"}:
                bucket = "unknown"
            required_counts[bucket] += 1
    return {
        "known": bool(bundle.get("checks_known")),
        "required_known": bool(bundle.get("required_known")),
        "items": items,
        "all": dict(all_counts),
        "required": dict(required_counts),
        "total": len(all_checks),
        "required_total": len(required_checks),
    }


def page_gaps(pr: dict[str, Any], number: int) -> list[str]:
    gaps: list[str] = []
    for field, label in (
        ("files", "files"),
        ("commits", "commits"),
        ("reviews", "reviews"),
        ("reviewThreads", "review threads"),
        ("reviewRequests", "review requests"),
    ):
        connection = pr.get(field) or {}
        total = int(connection.get("totalCount") or 0)
        observed = len(connection.get("nodes") or [])
        if total > observed:
            gaps.append(f"PR #{number}: observed {observed}/{total} {label}")
    return gaps


def classify_gate(
    pr: dict[str, Any], checks: dict[str, Any], review: dict[str, Any]
) -> tuple[str, list[str]]:
    reasons: list[str] = []
    if pr.get("merged") or pr.get("state") == "MERGED":
        return "MERGED", reasons
    if (
        not checks.get("required_known")
        or str(pr.get("mergeable") or "UNKNOWN") == "UNKNOWN"
    ):
        if not checks.get("required_known"):
            reasons.append("required-check evidence unavailable")
        if str(pr.get("mergeable") or "UNKNOWN") == "UNKNOWN":
            reasons.append("mergeability unknown")
        return "UNKNOWN", reasons
    if pr.get("isDraft"):
        return "DRAFT", ["pull request is a draft"]
    if pr.get("state") != "OPEN":
        return "BLOCKED", [f"pull request state is {pr.get('state') or 'unknown'}"]
    if pr.get("mergeable") == "CONFLICTING" or pr.get("mergeStateStatus") in {
        "DIRTY",
        "BEHIND",
    }:
        reasons.append("branch has conflicts or needs a rebase")
    if pr.get("reviewDecision") == "CHANGES_REQUESTED" or review.get(
        "changes_requested", 0
    ):
        reasons.append("changes requested")
    required = checks.get("required") or {}
    if required.get("fail", 0) or required.get("cancel", 0):
        reasons.append("required check failed or was cancelled")
    if reasons:
        return "BLOCKED", reasons
    if required.get("pending", 0):
        return "WAITING", ["required checks are pending"]
    if pr.get("reviewDecision") == "REVIEW_REQUIRED" or review.get(
        "requested_reviewers"
    ):
        return "WAITING", ["review is pending"]
    return "READY", reasons


def remote_stack_numbers(remote: dict[str, Any] | None) -> list[int]:
    if not remote:
        return []
    entries = (remote.get("entries") or {}).get("nodes") or []
    ordered = sorted(
        (entry for entry in entries if isinstance(entry, dict)),
        key=lambda entry: int(entry.get("position") or 0),
    )
    return [
        int(entry["pullRequest"]["number"])
        for entry in ordered
        if isinstance(entry.get("pullRequest"), dict)
        and entry["pullRequest"].get("number")
    ]


def local_stack_numbers(local: dict[str, Any]) -> list[int]:
    numbers: list[int] = []
    for branch in local.get("branches") or []:
        pr = branch.get("pr") if isinstance(branch, dict) else None
        if isinstance(pr, dict) and pr.get("number"):
            numbers.append(int(pr["number"]))
    return numbers


def reconcile_stack(
    remote: dict[str, Any] | None, local: dict[str, Any]
) -> tuple[str, list[str]]:
    gaps: list[str] = []
    remote_numbers = remote_stack_numbers(remote)
    local_numbers = local_stack_numbers(local)
    remote_present = bool(remote)
    local_present = bool(local.get("in_stack"))
    if local.get("error"):
        gaps.append(str(local["error"]))
    if remote_present and local_present:
        local_branch_count = len(local.get("branches") or [])
        if remote_numbers == local_numbers and local_branch_count == int(
            remote.get("size") or len(remote_numbers)
        ):
            return "tracked", gaps
        return "divergent", gaps
    if remote_present:
        return "remote-only", gaps
    if local_present:
        return "local-only", gaps
    return "unstacked", gaps


def stack_title_findings(
    records: list[dict[str, Any]], guidance: dict[str, bool]
) -> dict[int, list[str]]:
    findings: dict[int, list[str]] = defaultdict(list)
    if guidance.get("title") or len(records) < 3:
        return findings
    styles = [title_style(str(record.get("title") or "")) for record in records]
    counts = Counter(styles)
    majority_style, majority_count = counts.most_common(1)[0]
    if majority_count < 2 or len(counts) == 1:
        return findings
    for record, style in zip(records, styles, strict=True):
        if style != majority_style:
            findings[int(record["number"])].append(
                f"title style `{style}` is inconsistent with stack majority `{majority_style}`"
            )
    return findings


def stack_branch_findings(
    records: list[dict[str, Any]], guidance: dict[str, bool]
) -> dict[int, list[str]]:
    findings: dict[int, list[str]] = defaultdict(list)
    if guidance.get("branch") or len(records) < 2:
        return findings
    branches = [str(record.get("head") or "") for record in records]
    prefixes = [
        branch.split("/", 1)[0] if "/" in branch else None for branch in branches
    ]
    expected = next((prefix for prefix in prefixes if prefix), None)
    for record, branch, prefix in zip(records, branches, prefixes, strict=True):
        if prefix is None or (expected and prefix != expected):
            findings[int(record["number"])].append(
                f"branch `{branch}` does not follow the stack default `<topic>/<concern>`"
            )
    return findings


def normalize_pr(
    bundle: dict[str, Any], position: int | None, ai_generated: bool
) -> dict[str, Any]:
    pr = bundle.get("pr") or {}
    number = int(pr.get("number") or 0)
    body = parse_body(pr.get("body"))
    scope = assess_scope(pr)
    review = review_summary(pr)
    checks = normalize_checks(bundle)
    gate, gate_reasons = classify_gate(pr, checks, review)
    guideline_findings = list(body["findings"])
    if scope["signals"]:
        guideline_findings.append("scope signal: " + "; ".join(scope["signals"]))
    verdict = "NEEDS POLISH" if guideline_findings else "CLEAR"
    gaps = list(bundle.get("evidence_gaps") or []) + page_gaps(pr, number)
    return {
        "number": number,
        "title": pr.get("title"),
        "url": pr.get("url"),
        "position": position,
        "head": pr.get("headRefName"),
        "base": pr.get("baseRefName"),
        "state": pr.get("state"),
        "draft": bool(pr.get("isDraft")),
        "mergeable": pr.get("mergeable"),
        "merge_state_status": pr.get("mergeStateStatus"),
        "review_decision": pr.get("reviewDecision"),
        "gate": gate,
        "gate_reasons": gate_reasons,
        "checks": checks,
        "review": review,
        "guidelines": {
            "verdict": verdict,
            "findings": guideline_findings,
            "body": body,
            "title_convention": "not configured",
            "ai_generated_path": ai_generated,
        },
        "scope": scope,
        "evidence_gaps": gaps,
    }


def compute_frontier(records: list[dict[str, Any]]) -> int | None:
    frontier: int | None = None
    for record in sorted(records, key=lambda item: int(item.get("position") or 1)):
        if record.get("gate") not in {"MERGED", "READY"}:
            break
        frontier = int(record["number"])
    return frontier


def action_for_record(record: dict[str, Any]) -> list[str]:
    number = record["number"]
    actions: list[str] = []
    gate = record.get("gate")
    reasons = record.get("gate_reasons") or []
    if gate in {"BLOCKED", "UNKNOWN"}:
        actions.append(
            f"PR #{number}: "
            + (reasons[0] if reasons else f"investigate {gate.lower()} state")
        )
    elif gate == "WAITING":
        actions.append(
            f"PR #{number}: "
            + (reasons[0] if reasons else "wait for required evidence")
        )
    elif gate == "DRAFT":
        actions.append(f"PR #{number}: finish or explicitly retain draft status")
    review = record.get("review") or {}
    if review.get("active_threads"):
        count = review["active_threads"]
        actions.append(
            f"PR #{number}: inspect {count} active unresolved review thread{'s' if count != 1 else ''}"
        )
    findings = (record.get("guidelines") or {}).get("findings") or []
    if findings:
        actions.append(f"PR #{number}: {findings[0]}")
    checks = record.get("checks") or {}
    all_counts = checks.get("all") or {}
    required_counts = checks.get("required") or {}
    optional_failed = max(
        0,
        int(all_counts.get("fail", 0))
        + int(all_counts.get("cancel", 0))
        - int(required_counts.get("fail", 0))
        - int(required_counts.get("cancel", 0)),
    )
    optional_pending = max(
        0,
        int(all_counts.get("pending", 0)) - int(required_counts.get("pending", 0)),
    )
    if optional_failed:
        actions.append(
            f"PR #{number}: inspect {optional_failed} failing optional check(s)"
        )
    if optional_pending:
        actions.append(
            f"PR #{number}: {optional_pending} optional check(s) are still pending"
        )
    return actions


def local_rebase_layers(local: dict[str, Any]) -> list[dict[str, Any]]:
    layers: list[dict[str, Any]] = []
    for branch in local.get("branches") or []:
        if not isinstance(branch, dict) or not branch.get("needsRebase"):
            continue
        pr = branch.get("pr") if isinstance(branch.get("pr"), dict) else {}
        layers.append({"branch": branch.get("name"), "pr": pr.get("number")})
    return layers


def build_report(
    snapshot: dict[str, Any], *, ai_generated: bool = False, deep: bool = False
) -> dict[str, Any]:
    remote = (
        snapshot.get("remote_stack")
        if isinstance(snapshot.get("remote_stack"), dict)
        else None
    )
    local = (
        snapshot.get("local_stack")
        if isinstance(snapshot.get("local_stack"), dict)
        else {}
    )
    classification, stack_gaps = reconcile_stack(remote, local)
    position_by_number: dict[int, int] = {}
    if remote:
        for entry in (remote.get("entries") or {}).get("nodes") or []:
            pr = entry.get("pullRequest") if isinstance(entry, dict) else None
            if isinstance(pr, dict) and pr.get("number"):
                position_by_number[int(pr["number"])] = int(entry.get("position") or 0)

    bundles = [
        bundle
        for bundle in snapshot.get("pull_requests") or []
        if isinstance(bundle, dict)
    ]
    records = [
        normalize_pr(
            bundle,
            position_by_number.get(
                int((bundle.get("pr") or {}).get("number") or 0), index
            ),
            ai_generated,
        )
        for index, bundle in enumerate(bundles, start=1)
    ]
    records.sort(key=lambda record: int(record.get("position") or 1))
    guidance = snapshot.get("repository_guidance") or {}
    title_findings = stack_title_findings(records, guidance)
    branch_findings = stack_branch_findings(records, guidance)
    for record in records:
        findings = (
            title_findings[int(record["number"])]
            + branch_findings[int(record["number"])]
        )
        if findings:
            record["guidelines"]["findings"].extend(findings)
            record["guidelines"]["verdict"] = "NEEDS POLISH"
        record["guidelines"]["title_convention"] = (
            "repository guidance detected; manual evaluation required"
            if guidance.get("title")
            else "not configured"
        )

    gaps = list(snapshot.get("evidence_gaps") or []) + stack_gaps
    for record in records:
        gaps.extend(record.get("evidence_gaps") or [])
    if remote:
        entries = remote.get("entries") or {}
        if int(entries.get("totalCount") or 0) > len(entries.get("nodes") or []):
            gaps.append(
                f"observed {len(entries.get('nodes') or [])}/{entries.get('totalCount')} remote stack entries"
            )
    gaps = list(dict.fromkeys(str(gap) for gap in gaps if gap))

    actions: list[str] = []
    for record in records:
        actions.extend(action_for_record(record))
    rebase_layers = local_rebase_layers(local)
    if rebase_layers:
        first = rebase_layers[0]
        owner = (
            f"PR #{first['pr']}"
            if first.get("pr")
            else f"branch `{first.get('branch')}`"
        )
        actions.insert(
            0,
            f"{owner} needs a stack-aware rebase; use gh-stack-companion to verify the recovery command",
        )
    if classification == "divergent":
        actions.insert(
            0,
            "Choose whether local or remote stack topology represents intent before mutation",
        )
    elif classification == "local-only":
        actions.insert(
            0,
            "The stack exists only in local gh-stack state; submit it when it is ready for remote review",
        )
    if deep:
        actions.append(
            "Run the code-review skill for a deep Standards and Spec assessment"
        )
    if ai_generated:
        actions.append(
            "Apply the explicit AI-generated code review rubric with accountable human review"
        )
    actions = list(dict.fromkeys(actions))[:10]

    any_attention = (
        any(
            record.get("gate") not in {"READY", "MERGED"}
            or (record.get("review") or {}).get("active_threads")
            or (record.get("guidelines") or {}).get("findings")
            or any(
                (record.get("checks") or {}).get("all", {}).get(bucket, 0)
                for bucket in ("fail", "cancel", "pending")
            )
            for record in records
        )
        or bool(rebase_layers)
        or classification in {"local-only", "divergent"}
    )
    decisive_unknown = bool(gaps) or any(
        record.get("gate") == "UNKNOWN" for record in records
    )
    if decisive_unknown:
        overall = "UNKNOWN"
    elif any_attention:
        overall = "ACTION"
    else:
        overall = "HEALTHY"

    size = (
        int(remote.get("size") or len(records))
        if remote
        else (
            len(local.get("branches") or []) if local.get("in_stack") else len(records)
        )
    )
    return {
        "schema_version": SCHEMA_VERSION,
        "generated_at": datetime.now(UTC).isoformat(),
        "repository": snapshot.get("repository"),
        "target_pr": int(snapshot["target_pr"]) if snapshot.get("target_pr") else None,
        "overall": overall,
        "stack": {
            "classification": classification,
            "number": remote.get("number") if remote else None,
            "size": size,
            "base": remote.get("baseRefName")
            if remote
            else (local.get("trunk") or (records[0].get("base") if records else None)),
            "frontier_pr": compute_frontier(records),
            "health": {
                "topology": "divergent" if classification == "divergent" else "ok",
                "sync": classification,
                "rebase": (
                    "unknown"
                    if local.get("error")
                    else "needed"
                    if rebase_layers
                    else "ok"
                    if local.get("in_stack")
                    else "not-applicable"
                ),
                "needs_rebase": rebase_layers,
            },
            "local_branches": local.get("branches") or [],
        },
        "pull_requests": records,
        "next_actions": actions,
        "evidence_gaps": gaps,
        "modes": {"deep_requested": deep, "ai_generated": ai_generated},
    }


STATUS_STYLE = {
    "READY": "bold green",
    "MERGED": "green",
    "WAITING": "bold yellow",
    "BLOCKED": "bold red",
    "DRAFT": "magenta",
    "UNKNOWN": "bold cyan",
    "HEALTHY": "bold green",
    "ACTION": "bold yellow",
}


def check_summary(checks: dict[str, Any]) -> str:
    required = checks.get("required") or {}
    all_counts = checks.get("all") or {}
    if not checks.get("required_known"):
        return "required ?"
    total = int(checks.get("required_total") or 0)
    if total:
        passed = int(required.get("pass", 0)) + int(required.get("skipping", 0))
        pending = int(required.get("pending", 0))
        failed = int(required.get("fail", 0)) + int(required.get("cancel", 0))
        pieces = [f"req {passed}/{total}"]
        if pending:
            pieces.append(f"{pending} wait")
        if failed:
            pieces.append(f"{failed} fail")
        optional_pending = max(0, int(all_counts.get("pending", 0)) - pending)
        optional_failed = max(
            0,
            int(all_counts.get("fail", 0)) + int(all_counts.get("cancel", 0)) - failed,
        )
        if optional_pending:
            pieces.append(f"{optional_pending} optional wait")
        if optional_failed:
            pieces.append(f"{optional_failed} optional fail")
        return " · ".join(pieces)
    optional_failed = int(all_counts.get("fail", 0)) + int(all_counts.get("cancel", 0))
    optional_pending = int(all_counts.get("pending", 0))
    pieces = ["no required"]
    if optional_pending:
        pieces.append(f"{optional_pending} optional wait")
    if optional_failed:
        pieces.append(f"{optional_failed} optional fail")
    return " · ".join(pieces)


def review_line(review: dict[str, Any]) -> str:
    parts: list[str] = []
    if review.get("approvals"):
        parts.append(f"{review['approvals']} approved")
    if review.get("requested_reviewers"):
        parts.append(f"{len(review['requested_reviewers'])} requested")
    if review.get("active_threads"):
        parts.append(f"{review['active_threads']} threads")
    if review.get("total_comments"):
        parts.append(f"{review['total_comments']} comments")
    return " · ".join(parts) or "clear"


def visual_summary(guidelines: dict[str, Any]) -> str:
    body = guidelines.get("body") or {}
    media_count = len(body.get("media_urls") or [])
    if media_count:
        table = " + table" if body.get("has_before_after_table") else ""
        return f"{media_count} attachment(s){table}"
    if body.get("visual_cue"):
        return "recommended"
    return "not needed"


def render_rich(report: dict[str, Any], console: Console) -> None:
    overall = str(report.get("overall"))
    stack = report.get("stack") or {}
    heading = Text()
    heading.append(f"{report.get('repository')}  ", style="bold")
    target = (
        f"PR #{report.get('target_pr')}" if report.get("target_pr") else "local stack"
    )
    heading.append(f"{target}  ")
    heading.append(overall, style=STATUS_STYLE.get(overall, "bold"))
    heading.append(
        f"  {stack.get('classification')} · {stack.get('size')} layer{'s' if stack.get('size') != 1 else ''}"
    )
    console.print(Panel(heading, box=box.ROUNDED, padding=(0, 1)))

    table = Table(box=box.SIMPLE_HEAVY, show_edge=False, pad_edge=False)
    table.add_column("POS", justify="right", style="dim")
    table.add_column("PR", justify="right", style="bold")
    table.add_column("GATE")
    table.add_column("TITLE", overflow="fold", ratio=2)
    table.add_column("CI", overflow="fold")
    table.add_column("REVIEW", overflow="fold")
    table.add_column("VISUAL", overflow="fold")
    table.add_column("GUIDELINES", overflow="fold")
    for record in report.get("pull_requests") or []:
        gate = str(record.get("gate"))
        findings = (record.get("guidelines") or {}).get("findings") or []
        table.add_row(
            str(record.get("position") or "—"),
            f"#{record.get('number')}",
            Text(gate, style=STATUS_STYLE.get(gate, "bold")),
            str(record.get("title") or ""),
            check_summary(record.get("checks") or {}),
            review_line(record.get("review") or {}),
            visual_summary(record.get("guidelines") or {}),
            "clear"
            if not findings
            else f"{len(findings)} finding{'s' if len(findings) != 1 else ''}",
        )
    console.print(table)

    frontier = stack.get("frontier_pr")
    frontier_text = f"PR #{frontier}" if frontier else "none"
    console.print(f"[bold]MERGE FRONTIER[/bold]  {frontier_text}")
    health = stack.get("health") or {}
    console.print(
        "[bold]STACK HEALTH[/bold]  "
        f"topology {health.get('topology', '?')} · sync {health.get('sync', '?')} · "
        f"rebase {health.get('rebase', '?')}"
    )

    for record in report.get("pull_requests") or []:
        attention: list[str] = []
        attention.extend(record.get("gate_reasons") or [])
        review = record.get("review") or {}
        if review.get("active_threads"):
            attention.append(
                f"{review['active_threads']} active unresolved review thread(s)"
            )
        attention.extend((record.get("guidelines") or {}).get("findings") or [])
        failed = [
            check
            for check in (record.get("checks") or {}).get("items") or []
            if check.get("bucket") in {"fail", "cancel"}
        ]
        attention.extend(
            f"{'required' if check.get('required') else 'optional'} check `{check.get('name')}` is {check.get('bucket')}"
            for check in failed
        )
        if attention:
            console.print(f"\n[bold]PR #{record.get('number')} ATTENTION[/bold]")
            for item in dict.fromkeys(attention):
                console.print(f"  [yellow]•[/yellow] {item}")

    if report.get("next_actions"):
        console.print("\n[bold]NEXT[/bold]")
        for index, action in enumerate(report["next_actions"], start=1):
            console.print(f"  {index}. {action}")
    if report.get("evidence_gaps"):
        console.print("\n[bold cyan]EVIDENCE GAPS[/bold cyan]")
        for gap in report["evidence_gaps"]:
            console.print(f"  • {gap}")


def render_plain(report: dict[str, Any]) -> str:
    stack = report.get("stack") or {}
    lines = [
        (
            f"{report.get('repository')} "
            f"{'PR #' + str(report.get('target_pr')) if report.get('target_pr') else 'local stack'} | "
            f"{report.get('overall')} | "
            f"{stack.get('classification')} | {stack.get('size')} layer(s)"
        )
    ]
    for record in report.get("pull_requests") or []:
        findings = len((record.get("guidelines") or {}).get("findings") or [])
        lines.append(
            f"  {record.get('position') or '-'}  #{record.get('number')} {record.get('gate')}  "
            f"{record.get('title')}  [CI: {check_summary(record.get('checks') or {})}; "
            f"review: {review_line(record.get('review') or {})}; "
            f"visual: {visual_summary(record.get('guidelines') or {})}; guidelines: {findings}]"
        )
    frontier = stack.get("frontier_pr")
    lines.append(f"MERGE FRONTIER: {'#' + str(frontier) if frontier else 'none'}")
    health = stack.get("health") or {}
    lines.append(
        f"STACK HEALTH: topology {health.get('topology', '?')}; "
        f"sync {health.get('sync', '?')}; rebase {health.get('rebase', '?')}"
    )
    if report.get("next_actions"):
        lines.append("NEXT:")
        lines.extend(
            f"  {index}. {action}"
            for index, action in enumerate(report["next_actions"], start=1)
        )
    if report.get("evidence_gaps"):
        lines.append("EVIDENCE GAPS:")
        lines.extend(f"  - {gap}" for gap in report["evidence_gaps"])
    return "\n".join(lines)


def load_fixture(path: Path) -> dict[str, Any]:
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        raise InspectorError(f"could not load JSON fixture {path}: {exc}") from exc
    if not isinstance(data, dict):
        raise InspectorError("JSON fixture must contain an object")
    return data


def parse_args(argv: Sequence[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Read-only high-level health report for the current GitHub PR or PR stack."
    )
    parser.add_argument("--repo", help="GitHub repository as OWNER/REPO")
    parser.add_argument(
        "--pr", help="PR number, URL, or branch; defaults to the current branch"
    )
    parser.add_argument(
        "--json",
        action="store_true",
        dest="json_output",
        help="emit the report contract as JSON",
    )
    parser.add_argument("--plain", action="store_true", help="emit compact plain text")
    parser.add_argument("--no-color", action="store_true", help="disable ANSI color")
    parser.add_argument(
        "--deep",
        action="store_true",
        help="mark that a deep Standards and Spec review is requested",
    )
    parser.add_argument(
        "--ai-generated",
        action="store_true",
        help="apply the explicit AI-generated change review path",
    )
    parser.add_argument(
        "--from-json",
        type=Path,
        metavar="PATH",
        help="render a saved raw snapshot or normalized report instead of querying GitHub",
    )
    args = parser.parse_args(argv)
    if args.json_output and args.plain:
        parser.error("--json and --plain are mutually exclusive")
    return args


def exit_code(report: dict[str, Any]) -> int:
    return {"HEALTHY": 0, "ACTION": 1, "UNKNOWN": 2}.get(str(report.get("overall")), 3)


def main(argv: Sequence[str] | None = None) -> int:
    args = parse_args(argv)
    try:
        if args.from_json:
            fixture = load_fixture(args.from_json)
            report = (
                fixture
                if fixture.get("schema_version") == SCHEMA_VERSION
                else build_report(
                    fixture, ai_generated=args.ai_generated, deep=args.deep
                )
            )
        else:
            require_executable("gh")
            auth = run_command(["gh", "auth", "status"])
            if auth.returncode != 0:
                raise InspectorError(
                    f"GitHub authentication failed: {concise_error(auth)}"
                )
            repository = resolve_repository(args.repo)
            try:
                target_pr = resolve_pr_number(repository, args.pr)
            except InspectorError:
                if args.pr:
                    raise
                snapshot = collect_local_fallback_snapshot(repository)
                if snapshot is None:
                    raise
            else:
                snapshot = collect_snapshot(repository, target_pr)
            report = build_report(
                snapshot, ai_generated=args.ai_generated, deep=args.deep
            )
    except InspectorError as exc:
        print(f"check-my-prs: {exc}", file=sys.stderr)
        return 3

    if args.json_output:
        print(json.dumps(report, indent=2, sort_keys=False))
    elif args.plain:
        print(render_plain(report))
    else:
        color_enabled = (
            not args.no_color and "NO_COLOR" not in os.environ and sys.stdout.isatty()
        )
        console = Console(
            color_system="auto" if color_enabled else None, no_color=not color_enabled
        )
        render_rich(report, console)
    return exit_code(report)


if __name__ == "__main__":
    raise SystemExit(main())
