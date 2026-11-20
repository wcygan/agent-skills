"""Shared process and file-reading boundaries. See ../../references/LICENSE.txt."""

import argparse
import json
import math
from pathlib import Path
import subprocess
from datetime import datetime, timezone


class ToolError(Exception):
    pass


class Missing(ToolError):
    pass


class Parser(argparse.ArgumentParser):
    error_code = 1

    def error(self, message):
        self.print_usage(__import__("sys").stderr)
        self.exit(self.error_code, f"error: {message}\n")


def positive(value):
    try:
        number = int(value)
    except (ValueError, TypeError):
        raise argparse.ArgumentTypeError("expected a positive integer") from None
    if number < 1:
        raise argparse.ArgumentTypeError("expected a positive integer")
    return number


def seconds(value):
    try:
        number = float(value)
    except (ValueError, TypeError):
        raise argparse.ArgumentTypeError(
            "expected finite nonnegative seconds"
        ) from None
    if not math.isfinite(number) or number < 0:
        raise argparse.ArgumentTypeError("expected finite nonnegative seconds")
    return number


def now():
    return datetime.now(timezone.utc).isoformat()


def run(args, cwd=None, allowed=(0,)):
    try:
        result = subprocess.run(
            args, cwd=cwd, text=True, capture_output=True, timeout=60
        )
    except (OSError, subprocess.TimeoutExpired) as exc:
        raise ToolError(f"{args[0]} could not complete: {exc}") from exc
    if result.returncode not in allowed:
        raise ToolError(
            f"{args[0]} exited {result.returncode}: {result.stderr.strip()}"
        )
    return result.stdout


def decode(raw):
    try:
        return json.loads(raw)
    except (ValueError, TypeError) as exc:
        raise ToolError("malformed JSON") from exc


def read_json(path):
    try:
        if Path(path).is_symlink():
            raise ToolError(f"refusing symlink: {path}")
        return decode(Path(path).read_text())
    except FileNotFoundError as exc:
        raise Missing(f"missing file: {path}") from exc


def emit(value, pretty=False):
    print(
        json.dumps(value, indent=2 if pretty else None, ensure_ascii=False), flush=True
    )
