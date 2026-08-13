#!/usr/bin/env python3
"""Extract bounded, sanitized observable events from Codex rollout JSONL files."""

from __future__ import annotations

import argparse
import datetime as dt
import hashlib
import json
import re
import sys
from collections import Counter
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Iterable


DEFAULT_DAYS = 30
DEFAULT_MAX_FILES = 100
DEFAULT_MAX_BYTES = 100 * 1024 * 1024
DEFAULT_MAX_EVENT_CHARS = 8_000
PREFLIGHT_BYTES = 1024 * 1024

KNOWN_TOP_LEVEL_TYPES = {
    "event_msg",
    "response_item",
    "session_meta",
    "turn_context",
    "world_state",
}
KNOWN_RESPONSE_TYPES = {
    "custom_tool_call",
    "custom_tool_call_output",
    "message",
    "reasoning",
}
KNOWN_EVENT_TYPES = {
    "agent_message",
    "agent_reasoning",
    "context_compacted",
    "task_complete",
    "task_started",
    "thread_settings_applied",
    "token_count",
    "user_message",
    "web_search_end",
}

SECRET_PATTERNS: tuple[tuple[re.Pattern[str], str], ...] = (
    (
        re.compile(
            r"(?i)\b(api[_-]?key|access[_-]?token|authorization|password|passwd|secret|cookie)"
            r"(\s*[:=]\s*)([^\s,;}\]]+)"
        ),
        r"\1\2[REDACTED_SECRET]",
    ),
    (re.compile(r"(?i)\bBearer\s+[A-Za-z0-9._~+/=-]+"), "Bearer [REDACTED_SECRET]"),
    (re.compile(r"\bsk-[A-Za-z0-9_-]{12,}\b"), "[REDACTED_OPENAI_KEY]"),
    (re.compile(r"\bgh[pousr]_[A-Za-z0-9]{20,}\b"), "[REDACTED_GITHUB_TOKEN]"),
    (re.compile(r"\bAKIA[0-9A-Z]{16}\b"), "[REDACTED_AWS_KEY]"),
    (
        re.compile(r"\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b"),
        "[REDACTED_JWT]",
    ),
    (
        re.compile(
            r"-----BEGIN [^-]+ PRIVATE KEY-----.*?-----END [^-]+ PRIVATE KEY-----",
            re.DOTALL,
        ),
        "[REDACTED_PRIVATE_KEY]",
    ),
    (
        re.compile(r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b"),
        "[REDACTED_EMAIL]",
    ),
)


@dataclass(frozen=True)
class Candidate:
    path: Path
    display_path: str
    snapshot_bytes: int
    modified_at: float
    metadata: dict[str, Any]
    selected_at: str | None = None
    timestamp_source: str = "filename"


def display_path(path: Path) -> str:
    home = Path.home()
    try:
        return f"~/{path.resolve().relative_to(home.resolve())}"
    except (ValueError, OSError):
        return str(path)


def sanitize_text(text: str, max_chars: int) -> tuple[str, int, bool]:
    sanitized = text.replace(str(Path.home()), "~")
    redactions = 0
    for pattern, replacement in SECRET_PATTERNS:
        sanitized, count = pattern.subn(replacement, sanitized)
        redactions += count
    truncated = len(sanitized) > max_chars
    if truncated:
        sanitized = sanitized[:max_chars] + "\n[TRUNCATED]"
    return sanitized, redactions, truncated


def parse_instant(value: str) -> dt.datetime:
    normalized = value.strip()
    if len(normalized) == 10:
        parsed = dt.datetime.fromisoformat(normalized)
        return parsed.replace(tzinfo=dt.timezone.utc)
    if normalized.endswith("Z"):
        normalized = normalized[:-1] + "+00:00"
    parsed = dt.datetime.fromisoformat(normalized)
    if parsed.tzinfo is None:
        parsed = parsed.replace(tzinfo=dt.timezone.utc)
    return parsed.astimezone(dt.timezone.utc)


def parse_until(value: str) -> dt.datetime:
    parsed = parse_instant(value)
    if len(value.strip()) == 10:
        return parsed + dt.timedelta(days=1) - dt.timedelta(microseconds=1)
    return parsed


def is_date_only(value: str) -> bool:
    return len(value.strip()) == 10


def filename_instant(path: Path) -> dt.datetime | None:
    match = re.search(r"rollout-(\d{4}-\d{2}-\d{2})T", path.name)
    if not match:
        return None
    return parse_instant(match.group(1))


def metadata_instant(metadata: dict[str, Any]) -> dt.datetime | None:
    value = metadata.get("timestamp")
    if not isinstance(value, str) or not value:
        return None
    try:
        return parse_instant(value)
    except ValueError:
        return None


def read_preflight_metadata(path: Path, snapshot_bytes: int) -> dict[str, Any]:
    consumed = 0
    try:
        with path.open("rb") as handle:
            while consumed < min(snapshot_bytes, PREFLIGHT_BYTES):
                remaining = min(snapshot_bytes, PREFLIGHT_BYTES) - consumed
                raw_line = handle.readline(remaining)
                if not raw_line:
                    break
                consumed += len(raw_line)
                if not raw_line.endswith(b"\n") and consumed >= PREFLIGHT_BYTES:
                    break
                try:
                    record = json.loads(raw_line)
                except (UnicodeDecodeError, json.JSONDecodeError):
                    continue
                if record.get("type") == "session_meta":
                    payload = record.get("payload")
                    return payload if isinstance(payload, dict) else {}
    except OSError:
        return {}
    return {}


def discover_paths(inputs: Iterable[str]) -> tuple[list[Path], list[str]]:
    supplied = [Path(value).expanduser() for value in inputs]
    roots = supplied or [
        Path.home() / ".codex" / "sessions",
        Path.home() / ".codex" / "archived_sessions",
    ]
    diagnostics: list[str] = []
    found: dict[str, Path] = {}
    for root in roots:
        if not root.exists():
            diagnostics.append(f"missing path: {display_path(root)}")
            continue
        paths = [root] if root.is_file() else root.rglob("rollout-*.jsonl")
        for path in paths:
            if path.is_file() and path.name.endswith(".jsonl"):
                try:
                    key = str(path.resolve())
                except OSError:
                    key = str(path)
                found[key] = path
    return list(found.values()), diagnostics


def cwd_matches(metadata: dict[str, Any], requested: Path | None) -> bool:
    if requested is None:
        return True
    value = metadata.get("cwd")
    if not isinstance(value, str) or not value:
        return False
    try:
        actual = Path(value).expanduser().resolve()
        expected = requested.expanduser().resolve()
        return actual == expected or expected in actual.parents
    except OSError:
        return value == str(requested)


def select_candidates(args: argparse.Namespace) -> tuple[list[Candidate], dict[str, Any]]:
    paths, discovery_diagnostics = discover_paths(args.paths)
    now = dt.datetime.now(dt.timezone.utc)
    since = args.since or now - dt.timedelta(days=args.days)
    until = args.until
    precise_window = not args.since_date_only or (
        until is not None and not args.until_date_only
    )
    dated: list[
        tuple[
            float,
            float,
            str,
            Path,
            int,
            dict[str, Any],
            str,
            dt.datetime,
        ]
    ] = []
    skipped_time = 0
    timestamp_sources: Counter[str] = Counter()

    for path in paths:
        try:
            stat = path.stat()
        except OSError:
            continue
        filename_time = filename_instant(path)
        if precise_window and filename_time is not None:
            coarse_since = (since - dt.timedelta(days=1)).date()
            coarse_until = (
                (until + dt.timedelta(days=1)).date() if until is not None else None
            )
            if filename_time.date() < coarse_since or (
                coarse_until is not None and filename_time.date() > coarse_until
            ):
                skipped_time += 1
                continue

        snapshot_bytes = stat.st_size
        metadata = read_preflight_metadata(path, snapshot_bytes)
        session_time = metadata_instant(metadata)
        if precise_window and session_time is not None:
            instant = session_time
            timestamp_source = "session_meta"
        elif filename_time is not None:
            instant = filename_time
            timestamp_source = "filename_date"
        else:
            instant = dt.datetime.fromtimestamp(stat.st_mtime, tz=dt.timezone.utc)
            timestamp_source = "modified_at"
        timestamp_sources[timestamp_source] += 1
        if instant < since or (until is not None and instant > until):
            skipped_time += 1
            continue
        dated.append(
            (
                instant.timestamp(),
                stat.st_mtime,
                str(path),
                path,
                snapshot_bytes,
                metadata,
                timestamp_source,
                instant,
            )
        )

    dated.sort(key=lambda item: (-item[0], item[2]))
    selected: list[Candidate] = []
    total_bytes = 0
    skipped_cwd = 0
    skipped_bytes = 0
    skipped_file_limit = 0

    for (
        _session_time,
        modified_at,
        _path_key,
        path,
        snapshot_bytes,
        metadata,
        timestamp_source,
        instant,
    ) in dated:
        if not cwd_matches(metadata, args.cwd):
            skipped_cwd += 1
            continue
        if len(selected) >= args.max_files:
            skipped_file_limit += 1
            continue
        if snapshot_bytes > args.max_bytes - total_bytes:
            skipped_bytes += 1
            continue
        selected.append(
            Candidate(
                path=path,
                display_path=display_path(path),
                snapshot_bytes=snapshot_bytes,
                modified_at=modified_at,
                metadata=metadata,
                selected_at=instant.isoformat(),
                timestamp_source=timestamp_source,
            )
        )
        total_bytes += snapshot_bytes

    summary = {
        "discovered_files": len(paths),
        "selected_files": len(selected),
        "selected_bytes": total_bytes,
        "skipped_time": skipped_time,
        "skipped_cwd": skipped_cwd,
        "skipped_byte_limit": skipped_bytes,
        "skipped_file_limit": skipped_file_limit,
        "time_filter_mode": "timestamp" if precise_window else "calendar_date",
        "timestamp_sources": dict(sorted(timestamp_sources.items())),
        "diagnostics": discovery_diagnostics,
    }
    return selected, summary


def text_from_message(payload: dict[str, Any]) -> str:
    content = payload.get("content")
    if isinstance(content, str):
        return content
    if not isinstance(content, list):
        return ""
    parts: list[str] = []
    for block in content:
        if not isinstance(block, dict):
            continue
        if block.get("type") in {"input_text", "output_text", "text"}:
            text = block.get("text")
            if isinstance(text, str):
                parts.append(text)
    return "\n".join(parts)


def text_from_tool_output(value: Any) -> str:
    if isinstance(value, str):
        return value
    if not isinstance(value, list):
        return json.dumps(value, sort_keys=True) if value is not None else ""
    parts: list[str] = []
    for block in value:
        if not isinstance(block, dict):
            continue
        if block.get("type") in {"text", "input_text", "output_text"}:
            text = block.get("text")
            if isinstance(text, str):
                parts.append(text)
        elif block.get("type") in {"image", "audio"}:
            parts.append(f"[{str(block.get('type')).upper()}_OMITTED]")
    return "\n".join(parts)


def event_record(
    candidate: Candidate,
    ordinal: int,
    timestamp: Any,
    kind: str,
    text: str,
    max_chars: int,
    **extra: Any,
) -> dict[str, Any]:
    sanitized, redactions, truncated = sanitize_text(text, max_chars)
    record: dict[str, Any] = {
        "record_type": "event",
        "transcript": candidate.display_path,
        "thread_id": candidate.metadata.get("id"),
        "ordinal": ordinal,
        "timestamp": timestamp,
        "kind": kind,
        "text": sanitized,
        "redactions": redactions,
        "truncated": truncated,
    }
    record.update({key: value for key, value in extra.items() if value is not None})
    return record


def parse_transcript(
    candidate: Candidate,
    max_chars: int,
    include_tools: bool,
    message_source: str = "auto",
) -> tuple[list[dict[str, Any]], dict[str, Any]]:
    primary_events: list[dict[str, Any]] = []
    fallback_events: list[dict[str, Any]] = []
    call_names: dict[str, str] = {}
    unknown = Counter()
    malformed = 0
    compaction_records = 0
    consumed = 0
    ordinal = 0

    try:
        with candidate.path.open("rb") as handle:
            while consumed < candidate.snapshot_bytes:
                remaining = candidate.snapshot_bytes - consumed
                raw_line = handle.readline(remaining)
                if not raw_line:
                    break
                consumed += len(raw_line)
                ordinal += 1
                if not raw_line.endswith(b"\n") and consumed >= candidate.snapshot_bytes:
                    malformed += 1
                    break
                try:
                    record = json.loads(raw_line)
                except (UnicodeDecodeError, json.JSONDecodeError):
                    malformed += 1
                    continue
                if not isinstance(record, dict):
                    malformed += 1
                    continue
                top_type = record.get("type")
                payload = record.get("payload")
                timestamp = record.get("timestamp")

                if top_type == "response_item" and isinstance(payload, dict):
                    payload_type = payload.get("type")
                    if payload_type == "message":
                        role = payload.get("role")
                        if role in {"user", "assistant"}:
                            text = text_from_message(payload)
                            if text:
                                primary_events.append(
                                    event_record(
                                        candidate,
                                        ordinal,
                                        timestamp,
                                        "message",
                                        text,
                                        max_chars,
                                        role=role,
                                        phase=payload.get("phase"),
                                        message_source="response_item",
                                    )
                                )
                    elif payload_type == "custom_tool_call" and include_tools:
                        call_id = payload.get("call_id")
                        name = payload.get("name")
                        if isinstance(call_id, str) and isinstance(name, str):
                            call_names[call_id] = name
                        tool_input = payload.get("input")
                        if isinstance(tool_input, str) and tool_input:
                            primary_events.append(
                                event_record(
                                    candidate,
                                    ordinal,
                                    timestamp,
                                    "tool_call",
                                    tool_input,
                                    max_chars,
                                    tool=name,
                                    call_id=call_id,
                                )
                            )
                    elif payload_type == "custom_tool_call_output" and include_tools:
                        call_id = payload.get("call_id")
                        text = text_from_tool_output(payload.get("output"))
                        if text:
                            primary_events.append(
                                event_record(
                                    candidate,
                                    ordinal,
                                    timestamp,
                                    "tool_output",
                                    text,
                                    max_chars,
                                    tool=call_names.get(call_id),
                                    call_id=call_id,
                                )
                            )
                    elif payload_type not in KNOWN_RESPONSE_TYPES:
                        unknown[f"response_item:{payload_type}"] += 1
                elif top_type == "event_msg" and isinstance(payload, dict):
                    payload_type = payload.get("type")
                    if payload_type in {"user_message", "agent_message"}:
                        text = payload.get("message")
                        if isinstance(text, str) and text:
                            fallback_events.append(
                                event_record(
                                    candidate,
                                    ordinal,
                                    timestamp,
                                    "message",
                                    text,
                                    max_chars,
                                    role=(
                                        "user"
                                        if payload_type == "user_message"
                                        else "assistant"
                                    ),
                                    message_source="event_msg",
                                )
                            )
                    elif payload_type == "context_compacted":
                        compaction_records += 1
                    elif payload_type not in KNOWN_EVENT_TYPES:
                        unknown[f"event_msg:{payload_type}"] += 1
                elif top_type == "compacted":
                    compaction_records += 1
                elif top_type not in KNOWN_TOP_LEVEL_TYPES:
                    unknown[f"top:{top_type}"] += 1
    except OSError as exc:
        return [], {
            "malformed_records": malformed,
            "unknown_records": dict(unknown),
            "read_error": str(exc),
        }

    primary_messages = [
        event for event in primary_events if event.get("kind") == "message"
    ]
    primary_non_messages = [
        event for event in primary_events if event.get("kind") != "message"
    ]
    primary_message_counts = Counter(
        (event.get("role"), event.get("text")) for event in primary_messages
    )
    fallback_message_counts = Counter(
        (event.get("role"), event.get("text")) for event in fallback_events
    )
    cross_source_duplicates = sum(
        min(count, fallback_message_counts[key])
        for key, count in primary_message_counts.items()
    )
    if message_source == "primary":
        emitted_messages = primary_messages
    elif message_source == "fallback":
        emitted_messages = fallback_events
    elif message_source == "all":
        emitted_messages = primary_messages + fallback_events
    else:
        unmatched_primary = primary_message_counts.copy()
        unique_fallback: list[dict[str, Any]] = []
        for event in fallback_events:
            key = (event.get("role"), event.get("text"))
            if unmatched_primary[key]:
                unmatched_primary[key] -= 1
            else:
                unique_fallback.append(event)
        emitted_messages = primary_messages + unique_fallback
    events = primary_non_messages + emitted_messages
    events.sort(key=lambda event: int(event["ordinal"]))
    return events, {
        "malformed_records": malformed,
        "unknown_records": dict(sorted(unknown.items())),
        "snapshot_bytes": candidate.snapshot_bytes,
        "bytes_read": consumed,
        "event_count": len(events),
        "primary_messages": len(primary_messages),
        "fallback_messages": len(fallback_events),
        "cross_source_duplicates": cross_source_duplicates,
        "compaction_records": compaction_records,
        "message_source_policy": message_source,
    }


def emit(record: dict[str, Any]) -> None:
    print(json.dumps(record, sort_keys=True, ensure_ascii=False))


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description=(
            "Read bounded Codex rollout JSONL files and emit sanitized observable "
            "messages and tool events as JSONL."
        )
    )
    parser.add_argument(
        "paths",
        nargs="*",
        help=(
            "rollout files or roots; defaults to ~/.codex/sessions and "
            "~/.codex/archived_sessions"
        ),
    )
    parser.add_argument("--cwd", type=Path, help="include this cwd and descendants")
    time_group = parser.add_mutually_exclusive_group()
    time_group.add_argument(
        "--days",
        type=int,
        default=DEFAULT_DAYS,
        help=f"include the previous N days (default: {DEFAULT_DAYS})",
    )
    time_group.add_argument(
        "--since",
        help="include files on or after this ISO date or timestamp",
    )
    parser.add_argument(
        "--until",
        help="include files on or before this ISO date or timestamp",
    )
    parser.add_argument("--max-files", type=int, default=DEFAULT_MAX_FILES)
    parser.add_argument("--max-bytes", type=int, default=DEFAULT_MAX_BYTES)
    parser.add_argument(
        "--max-event-chars", type=int, default=DEFAULT_MAX_EVENT_CHARS
    )
    parser.add_argument(
        "--metadata-only",
        action="store_true",
        help="emit transcript metadata without message or tool content",
    )
    parser.add_argument(
        "--no-tools",
        action="store_true",
        help="exclude tool calls and tool outputs",
    )
    parser.add_argument(
        "--message-source",
        choices=("auto", "primary", "fallback", "all"),
        default="auto",
        help="select response_item, event_msg, or merged observable messages",
    )
    parser.add_argument(
        "--require-text",
        action="append",
        default=[],
        metavar="TEXT",
        help="require every literal marker in sanitized observable event text",
    )
    return parser


def validate_args(parser: argparse.ArgumentParser, args: argparse.Namespace) -> None:
    for field in ("days", "max_files", "max_bytes", "max_event_chars"):
        if getattr(args, field) <= 0:
            parser.error(f"--{field.replace('_', '-')} must be greater than zero")
    args.since_date_only = False
    args.until_date_only = False
    if args.since is None:
        args.since = dt.datetime.now(dt.timezone.utc) - dt.timedelta(days=args.days)
    else:
        args.since_date_only = is_date_only(args.since)
        try:
            args.since = parse_instant(args.since)
        except ValueError as exc:
            parser.error(f"invalid --since value: {exc}")
    if args.until is not None:
        args.until_date_only = is_date_only(args.until)
        try:
            args.until = parse_until(args.until)
        except ValueError as exc:
            parser.error(f"invalid --until value: {exc}")
    if args.until is not None and args.until < args.since:
        parser.error("--until must not precede the scan start")
    if args.metadata_only and args.require_text:
        parser.error("--require-text cannot be used with --metadata-only")
    if any(not marker for marker in args.require_text):
        parser.error("--require-text values must not be empty")


def main(argv: list[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)
    validate_args(parser, args)
    selected, selection = select_candidates(args)
    scan_id = hashlib.sha256(
        "\n".join(
            f"{candidate.display_path}:{candidate.snapshot_bytes}"
            for candidate in selected
        ).encode("utf-8")
    ).hexdigest()[:16]

    emit(
        {
            "record_type": "scan",
            "scan_id": scan_id,
            "cwd_filter": display_path(args.cwd) if args.cwd else None,
            "since": args.since.isoformat(),
            "until": args.until.isoformat() if args.until else None,
            "max_files": args.max_files,
            "max_bytes": args.max_bytes,
            "max_event_chars": args.max_event_chars,
            "required_text_count": len(args.require_text),
            **selection,
        }
    )

    total_events = 0
    total_malformed = 0
    unknown_totals: Counter[str] = Counter()
    matched_files = 0
    skipped_required_text = 0
    for candidate in selected:
        if args.metadata_only:
            events: list[dict[str, Any]] = []
            summary: dict[str, Any] | None = None
        else:
            events, summary = parse_transcript(
                candidate,
                max_chars=args.max_event_chars,
                include_tools=not args.no_tools,
                message_source=args.message_source,
            )
            total_malformed += int(summary["malformed_records"])
            unknown_totals.update(summary["unknown_records"])
            observable_text = "\n".join(
                str(event.get("text", "")) for event in events
            )
            if not all(marker in observable_text for marker in args.require_text):
                skipped_required_text += 1
                continue

        matched_files += 1
        emit(
            {
                "record_type": "transcript",
                "scan_id": scan_id,
                "transcript": candidate.display_path,
                "thread_id": candidate.metadata.get("id"),
                "cwd": (
                    sanitize_text(str(candidate.metadata.get("cwd", "")), 4096)[0]
                    or None
                ),
                "created_at": candidate.metadata.get("timestamp"),
                "selected_at": candidate.selected_at,
                "timestamp_source": candidate.timestamp_source,
                "snapshot_bytes": candidate.snapshot_bytes,
            }
        )
        if args.metadata_only:
            continue
        for event in events:
            event["scan_id"] = scan_id
            emit(event)
        total_events += len(events)
        assert summary is not None
        emit(
            {
                "record_type": "transcript_summary",
                "scan_id": scan_id,
                "transcript": candidate.display_path,
                **summary,
            }
        )

    emit(
        {
            "record_type": "scan_summary",
            "scan_id": scan_id,
            "selected_files": len(selected),
            "matched_files": matched_files,
            "skipped_required_text": skipped_required_text,
            "events": total_events,
            "malformed_records": total_malformed,
            "unknown_records": dict(sorted(unknown_totals.items())),
            "redaction_notice": (
                "Heuristic redaction is not complete; review output before use."
            ),
        }
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
