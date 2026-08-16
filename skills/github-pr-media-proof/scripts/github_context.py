"""Shared GitHub CLI context and error handling for PR media tools."""

from __future__ import annotations

import re
import shutil
import subprocess


REPOSITORY_PATTERN = re.compile(r"^[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+$")


class ToolError(RuntimeError):
    """Report one failed operation with a safe recovery instruction."""

    def __init__(self, message: str, recovery: str) -> None:
        super().__init__(message)
        self.recovery = recovery

    def format(self) -> str:
        return f"error: {self}\nrecovery: {self.recovery}"


def require_command(name: str, recovery: str) -> str:
    path = shutil.which(name)
    if path is None:
        raise ToolError(f"required command `{name}` was not found", recovery)
    return path


def run_gh(
    *args: str,
    input_text: str | None = None,
    timeout: int = 30,
    recovery: str,
) -> str:
    require_command(
        "gh",
        "Install GitHub CLI, then run `gh auth status` before retrying.",
    )
    try:
        result = subprocess.run(
            ["gh", *args],
            check=False,
            capture_output=True,
            input=input_text,
            text=True,
            timeout=timeout,
        )
    except subprocess.TimeoutExpired as error:
        raise ToolError(
            f"`gh {' '.join(args)}` timed out after {timeout} seconds",
            recovery,
        ) from error
    if result.returncode != 0:
        detail = (result.stderr or result.stdout or "unknown GitHub CLI error").strip()
        raise ToolError(f"GitHub CLI failed: {detail[:800]}", recovery)
    return result.stdout.strip()


def resolve_repository(explicit: str | None) -> str:
    if explicit:
        repository = explicit.removesuffix(".git").strip("/")
    else:
        repository = run_gh(
            "repo",
            "view",
            "--json",
            "nameWithOwner",
            "--jq",
            ".nameWithOwner",
            recovery="Run from a GitHub checkout or pass `--repo OWNER/REPO`.",
        )
    if not REPOSITORY_PATTERN.fullmatch(repository):
        raise ToolError(
            f"invalid repository `{repository}`",
            "Pass the repository as `--repo OWNER/REPO`.",
        )
    return repository


def resolve_pull_request(repository: str, explicit: int | None) -> int:
    if explicit is not None:
        if explicit < 1:
            raise ToolError("pull request number must be positive", "Pass `--pr NUMBER`.")
        return explicit
    value = run_gh(
        "pr",
        "view",
        "--repo",
        repository,
        "--json",
        "number",
        "--jq",
        ".number",
        recovery="Check out a branch with a pull request or pass `--pr NUMBER`.",
    )
    try:
        return int(value)
    except ValueError as error:
        raise ToolError(
            f"GitHub returned an invalid pull request number: `{value}`",
            "Pass `--pr NUMBER` explicitly.",
        ) from error
