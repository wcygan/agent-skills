#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.11"
# dependencies = []
# ///
"""Review, preview, or update a GitHub pull request description.

Run this script from the pull request branch. It detects OWNER/REPO and the
current pull request through `gh`. Review accepts a local body file or the live
description. Update prints a diff by default and writes only with `--write`.

Examples:
    uv run --script pr_body.py review
    uv run --script pr_body.py review --body-file proposed-body.md
    uv run --script pr_body.py update --body-file proposed-body.md
    uv run --script pr_body.py update --body-file proposed-body.md --write
"""

from __future__ import annotations

import argparse
from collections import Counter
import difflib
import hashlib
import json
import pathlib
import re
import sys
from dataclasses import asdict, dataclass

from github_context import ToolError, resolve_pull_request, resolve_repository, run_gh


ATTACHMENT_PATTERN = re.compile(
    r"https://github\.com/user-attachments/assets/[^)\s]+"
)
REQUIRED_HEADINGS = (
    "Problem & Solution Overview",
    "Testing Done",
)


@dataclass(frozen=True)
class Finding:
    level: str
    message: str
    recovery: str


@dataclass(frozen=True)
class Review:
    findings: tuple[Finding, ...]
    headings: tuple[str, ...]
    media_urls: tuple[str, ...]
    bare_media_urls: tuple[str, ...]
    has_before_after_table: bool

    @property
    def ok(self) -> bool:
        return not any(finding.level == "error" for finding in self.findings)


def body_digest(body: str) -> str:
    return hashlib.sha256(body.encode()).hexdigest()


def fetch_body(repository: str, pull_request: int, timeout: int) -> str:
    payload = run_gh(
        "api",
        f"repos/{repository}/pulls/{pull_request}",
        timeout=timeout,
        recovery=f"Confirm access to `{repository}` and that PR #{pull_request} exists.",
    )
    try:
        data = json.loads(payload)
    except json.JSONDecodeError as error:
        raise ToolError(
            "GitHub returned invalid pull request JSON",
            "Run `gh api repos/OWNER/REPO/pulls/NUMBER` and inspect the response.",
        ) from error
    body = data.get("body")
    return body if isinstance(body, str) else ""


def review_body(body: str) -> Review:
    lines = body.splitlines()
    entries = [
        (index, line.removeprefix("## ").strip())
        for index, line in enumerate(lines)
        if line.startswith("## ")
    ]
    headings = tuple(heading for _, heading in entries)
    normalized = {heading.casefold() for heading in headings}
    counts = Counter(heading.casefold() for heading in headings)
    findings: list[Finding] = []
    for heading in REQUIRED_HEADINGS:
        normalized_heading = heading.casefold()
        if normalized_heading not in normalized:
            findings.append(Finding(
                "error",
                f"missing `## {heading}`",
                f"Add a non-empty `## {heading}` section.",
            ))
            continue
        if counts[normalized_heading] > 1:
            findings.append(Finding(
                "error",
                f"duplicated `## {heading}`",
                f"Merge duplicate `## {heading}` sections.",
            ))
        position = next(
            index for index, name in entries
            if name.casefold() == normalized_heading
        )
        end = next((index for index, _ in entries if index > position), len(lines))
        if not "\n".join(lines[position + 1:end]).strip():
            findings.append(Finding(
                "error",
                f"empty `## {heading}`",
                f"Add observed content to `## {heading}`.",
            ))
    media = tuple(ATTACHMENT_PATTERN.findall(body))
    bare_media = tuple(
        line.strip()
        for line in body.splitlines()
        if line.strip().startswith("https://github.com/user-attachments/assets/")
    )
    has_table = bool(
        re.search(r"(?im)^\|[^\n]*before[^\n]*\|[^\n]*after[^\n]*\|\s*$", body)
    )
    if not media:
        findings.append(Finding(
            "warning",
            "no GitHub user attachments were found",
            "Use `upload_attachments.py` when visual proof would improve review.",
        ))
    if media and not has_table:
        findings.append(Finding(
            "info",
            "media exists without a before/after table",
            "Add a table when the change has comparable before and after behavior.",
        ))
    for url in media:
        if url in bare_media:
            continue
        if f"]({url})" not in body:
            findings.append(Finding(
                "warning",
                f"attachment URL has unclear Markdown context: {url}",
                "Use image Markdown for stills or put a video URL on its own line.",
            ))
    return Review(tuple(findings), headings, media, bare_media, has_table)


def render_review(review: Review, output_format: str) -> None:
    if output_format == "json":
        print(json.dumps({
            "ok": review.ok,
            "headings": review.headings,
            "media_urls": review.media_urls,
            "bare_media_urls": review.bare_media_urls,
            "has_before_after_table": review.has_before_after_table,
            "findings": [asdict(finding) for finding in review.findings],
        }, sort_keys=True))
        return
    print("PASS" if review.ok else "NEEDS UPDATE")
    for finding in review.findings:
        print(f"{finding.level.upper()}: {finding.message}")
        print(f"  recovery: {finding.recovery}")
    print(f"media: {len(review.media_urls)} attachment(s)")
    print(f"before/after table: {'yes' if review.has_before_after_table else 'no'}")


def print_diff(current: str, proposed: str, body_file: pathlib.Path) -> None:
    diff = difflib.unified_diff(
        current.splitlines(True),
        proposed.splitlines(True),
        fromfile="current PR body",
        tofile=str(body_file),
    )
    rendered = "".join(diff)
    print(rendered or "No PR body changes.")


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description=__doc__.splitlines()[0],
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""Examples:
  uv run --script %(prog)s review
  uv run --script %(prog)s review --body-file proposed-body.md
  uv run --script %(prog)s update --body-file proposed-body.md
  uv run --script %(prog)s update --body-file proposed-body.md --write

Update safety:
  `update` is a preview unless `--write` is present. Use the SHA-256 printed by
  preview with `--expect-current` to prevent overwriting a changed body.
""",
    )
    subparsers = parser.add_subparsers(dest="command", required=True)
    common = argparse.ArgumentParser(add_help=False)
    common.add_argument("--repo", metavar="OWNER/REPO", help="default: detect with `gh repo view`")
    common.add_argument("--pr", type=int, help="default: detect from the current branch")
    common.add_argument("--timeout", type=int, default=30, help="seconds per GitHub CLI command")

    review_parser = subparsers.add_parser(
        "review", parents=[common], help="check description structure and media"
    )
    review_parser.add_argument("--body-file", type=pathlib.Path, help="review this file instead of GitHub")
    review_parser.add_argument("--format", choices=("text", "json"), default="text")

    update_parser = subparsers.add_parser(
        "update", parents=[common], help="preview or write a complete description"
    )
    update_parser.add_argument("--body-file", required=True, type=pathlib.Path)
    update_parser.add_argument("--write", action="store_true", help="perform the GitHub update")
    update_parser.add_argument(
        "--expect-current", metavar="SHA256",
        help="refuse the write if the current body digest changed",
    )
    return parser


def main() -> int:
    args = build_parser().parse_args()
    try:
        if args.timeout < 1:
            raise ToolError("timeout must be positive", "Pass `--timeout SECONDS`.")

        if args.command == "review" and args.body_file:
            if not args.body_file.is_file():
                raise ToolError(
                    f"body file does not exist: `{args.body_file}`",
                    "Correct `--body-file` and retry.",
                )
            body = args.body_file.read_text()
            result = review_body(body)
            render_review(result, args.format)
            return 0 if result.ok else 1

        repository = resolve_repository(args.repo)
        pull_request = resolve_pull_request(repository, args.pr)
        current = fetch_body(repository, pull_request, args.timeout)

        if args.command == "review":
            result = review_body(current)
            render_review(result, args.format)
            return 0 if result.ok else 1

        if not args.body_file.is_file():
            raise ToolError(
                f"body file does not exist: `{args.body_file}`",
                "Correct `--body-file` and retry.",
            )
        proposed = args.body_file.read_text()
        current_digest = body_digest(current)
        print(f"current_sha256: {current_digest}", file=sys.stderr)
        print_diff(current, proposed, args.body_file)
        if not args.write:
            print(
                "preview only: rerun with `--write --expect-current "
                f"{current_digest}` to update PR #{pull_request}",
                file=sys.stderr,
            )
            return 0
        if args.expect_current and args.expect_current != current_digest:
            raise ToolError(
                "the current PR body does not match `--expect-current`",
                "Review the latest body, merge concurrent edits, and preview again.",
            )
        run_gh(
            "api",
            "--method",
            "PATCH",
            f"repos/{repository}/pulls/{pull_request}",
            "--input",
            "-",
            input_text=json.dumps({"body": proposed}),
            timeout=args.timeout,
            recovery="Re-read the PR body before retrying. Preserve concurrent edits.",
        )
        verified = fetch_body(repository, pull_request, args.timeout)
        if verified != proposed:
            raise ToolError(
                "GitHub accepted the update, but the body did not verify byte-for-byte",
                "Open the PR, inspect the rendered body, and reconcile GitHub normalization.",
            )
        print(f"updated https://github.com/{repository}/pull/{pull_request}")
        return 0
    except (OSError, ToolError) as error:
        if isinstance(error, ToolError):
            print(error.format(), file=sys.stderr)
        else:
            print(f"error: {error}\nrecovery: Correct the local file error and retry.", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
