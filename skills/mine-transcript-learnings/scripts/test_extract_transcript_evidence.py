#!/usr/bin/env python3
"""Tests for extract_transcript_evidence.py using synthetic rollout files."""

from __future__ import annotations

import importlib.util
import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path
from typing import Any


SCRIPT_PATH = Path(__file__).with_name("extract_transcript_evidence.py")
SPEC = importlib.util.spec_from_file_location("extract_transcript_evidence", SCRIPT_PATH)
assert SPEC is not None and SPEC.loader is not None
MODULE = importlib.util.module_from_spec(SPEC)
sys.modules[SPEC.name] = MODULE
SPEC.loader.exec_module(MODULE)


def write_rollout(path: Path, records: list[Any], malformed: str | None = None) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as handle:
        for record in records:
            handle.write(json.dumps(record))
            handle.write("\n")
        if malformed is not None:
            handle.write(malformed)
            handle.write("\n")


def session_meta(
    thread_id: str,
    cwd: Path,
    timestamp: str = "2026-08-13T12:00:00Z",
) -> dict[str, Any]:
    return {
        "timestamp": timestamp,
        "type": "session_meta",
        "payload": {
            "id": thread_id,
            "cwd": str(cwd),
            "timestamp": timestamp,
        },
    }


def message(role: str, text: str, timestamp: str) -> dict[str, Any]:
    block_type = "input_text" if role == "user" else "output_text"
    return {
        "timestamp": timestamp,
        "type": "response_item",
        "payload": {
            "type": "message",
            "role": role,
            "content": [{"type": block_type, "text": text}],
        },
    }


def fallback_message(role: str, text: str, timestamp: str) -> dict[str, Any]:
    return {
        "timestamp": timestamp,
        "type": "event_msg",
        "payload": {
            "type": "user_message" if role == "user" else "agent_message",
            "message": text,
        },
    }


def run_script(*args: str) -> list[dict[str, Any]]:
    result = subprocess.run(
        [sys.executable, str(SCRIPT_PATH), *args],
        check=True,
        capture_output=True,
        text=True,
    )
    return [json.loads(line) for line in result.stdout.splitlines()]


class ExtractTranscriptEvidenceTests(unittest.TestCase):
    def test_extracts_observable_events_and_redacts_sensitive_text(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            project = root / "project"
            path = root / "sessions" / "rollout-2026-08-13T12-00-00-one.jsonl"
            records = [
                session_meta("one", project),
                session_meta("one", project),
                message(
                    "user",
                    "Failure for person@example.com with api_key=abc123",
                    "2026-08-13T12:01:00Z",
                ),
                {
                    "timestamp": "2026-08-13T12:01:01Z",
                    "type": "event_msg",
                    "payload": {
                        "type": "user_message",
                        "message": "Failure for person@example.com with api_key=abc123",
                    },
                },
                {
                    "timestamp": "2026-08-13T12:01:02Z",
                    "type": "response_item",
                    "payload": {
                        "type": "reasoning",
                        "summary": ["private reasoning"],
                    },
                },
                {
                    "timestamp": "2026-08-13T12:01:03Z",
                    "type": "response_item",
                    "payload": {
                        "type": "custom_tool_call",
                        "call_id": "call-1",
                        "name": "exec_command",
                        "input": "password=hunter2 run verification",
                    },
                },
                {
                    "timestamp": "2026-08-13T12:01:04Z",
                    "type": "response_item",
                    "payload": {
                        "type": "custom_tool_call_output",
                        "call_id": "call-1",
                        "output": [{"type": "text", "text": "verification passed"}],
                    },
                },
                message("assistant", "Use the verified workaround.", "2026-08-13T12:02:00Z"),
            ]
            write_rollout(path, records)

            output = run_script(
                str(root / "sessions"),
                "--since",
                "2026-08-01",
                "--cwd",
                str(project),
            )
            events = [record for record in output if record["record_type"] == "event"]
            combined = "\n".join(str(event["text"]) for event in events)

            self.assertEqual(4, len(events))
            self.assertIn("[REDACTED_EMAIL]", combined)
            self.assertIn("[REDACTED_SECRET]", combined)
            self.assertNotIn("person@example.com", combined)
            self.assertNotIn("abc123", combined)
            self.assertNotIn("hunter2", combined)
            self.assertNotIn("private reasoning", combined)
            tool_output = next(event for event in events if event["kind"] == "tool_output")
            self.assertEqual("exec_command", tool_output["tool"])

    def test_filters_by_cwd_and_selects_newest_file_deterministically(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            project = root / "project"
            other = root / "other"
            old = root / "rollout-2026-08-11T12-00-00-old.jsonl"
            new = root / "rollout-2026-08-12T12-00-00-new.jsonl"
            ignored = root / "rollout-2026-08-13T12-00-00-ignored.jsonl"
            write_rollout(old, [session_meta("old", project)])
            write_rollout(new, [session_meta("new", project)])
            write_rollout(ignored, [session_meta("ignored", other)])

            output = run_script(
                str(root),
                "--since",
                "2026-08-01",
                "--cwd",
                str(project),
                "--max-files",
                "1",
                "--metadata-only",
            )
            transcripts = [
                record for record in output if record["record_type"] == "transcript"
            ]

            self.assertEqual(["new"], [record["thread_id"] for record in transcripts])
            scan = output[0]
            self.assertEqual(1, scan["selected_files"])
            self.assertEqual(1, scan["skipped_cwd"])
            self.assertEqual(1, scan["skipped_file_limit"])

    def test_reports_malformed_and_unknown_records(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            path = root / "rollout-2026-08-13T12-00-00-unknown.jsonl"
            write_rollout(
                path,
                [
                    session_meta("unknown", root),
                    {"timestamp": "2026-08-13T12:01:00Z", "type": "mystery"},
                ],
                malformed="{not-json",
            )

            output = run_script(str(path), "--since", "2026-08-01")
            summary = next(
                record
                for record in output
                if record["record_type"] == "transcript_summary"
            )

            self.assertEqual(1, summary["malformed_records"])
            self.assertEqual({"top:mystery": 1}, summary["unknown_records"])

    def test_snapshot_boundary_excludes_later_append(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            path = root / "rollout-2026-08-13T12-00-00-live.jsonl"
            write_rollout(
                path,
                [
                    session_meta("live", root),
                    message("user", "before boundary", "2026-08-13T12:01:00Z"),
                ],
            )
            snapshot_bytes = path.stat().st_size
            metadata = MODULE.read_preflight_metadata(path, snapshot_bytes)
            candidate = MODULE.Candidate(
                path=path,
                display_path=str(path),
                snapshot_bytes=snapshot_bytes,
                modified_at=path.stat().st_mtime,
                metadata=metadata,
            )
            with path.open("a", encoding="utf-8") as handle:
                handle.write(
                    json.dumps(
                        message("assistant", "after boundary", "2026-08-13T12:02:00Z")
                    )
                )
                handle.write("\n")

            events, summary = MODULE.parse_transcript(candidate, 8_000, True)
            combined = "\n".join(event["text"] for event in events)

            self.assertIn("before boundary", combined)
            self.assertNotIn("after boundary", combined)
            self.assertEqual(snapshot_bytes, summary["bytes_read"])

    def test_rejects_non_positive_bounds(self) -> None:
        result = subprocess.run(
            [sys.executable, str(SCRIPT_PATH), "--max-files", "0"],
            capture_output=True,
            text=True,
        )
        self.assertEqual(2, result.returncode)
        self.assertIn("--max-files must be greater than zero", result.stderr)

    def test_until_date_includes_the_complete_day(self) -> None:
        parsed = MODULE.parse_until("2026-08-13")
        self.assertEqual("2026-08-13T23:59:59.999999+00:00", parsed.isoformat())

    def test_timestamp_range_uses_session_metadata(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            project = root / "project"
            path = root / "rollout-2026-08-13T00-37-29-session.jsonl"
            write_rollout(
                path,
                [session_meta("session", project, "2026-08-13T05:37:29Z")],
            )

            output = run_script(
                str(root),
                "--cwd",
                str(project),
                "--since",
                "2026-08-13T05:00:00Z",
                "--until",
                "2026-08-13T06:00:00Z",
                "--metadata-only",
            )
            transcripts = [
                record for record in output if record["record_type"] == "transcript"
            ]
            scan = output[0]

            self.assertEqual(["session"], [record["thread_id"] for record in transcripts])
            self.assertEqual("session_meta", transcripts[0]["timestamp_source"])
            self.assertEqual("timestamp", scan["time_filter_mode"])
            self.assertEqual({"session_meta": 1}, scan["timestamp_sources"])

    def test_auto_message_source_keeps_fallback_only_messages(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            path = root / "rollout-2026-08-13T12-00-00-mixed.jsonl"
            write_rollout(
                path,
                [
                    session_meta("mixed", root),
                    fallback_message(
                        "assistant", "earlier fallback", "2026-08-13T12:01:00Z"
                    ),
                    {
                        "timestamp": "2026-08-13T12:01:30Z",
                        "type": "event_msg",
                        "payload": {"type": "context_compacted"},
                    },
                    message(
                        "assistant", "later primary", "2026-08-13T12:02:00Z"
                    ),
                ],
            )

            output = run_script(str(path), "--since", "2026-08-13")
            messages = [
                record
                for record in output
                if record["record_type"] == "event" and record["kind"] == "message"
            ]
            summary = next(
                record
                for record in output
                if record["record_type"] == "transcript_summary"
            )

            self.assertEqual(
                ["earlier fallback", "later primary"],
                [record["text"] for record in messages],
            )
            self.assertEqual(
                ["event_msg", "response_item"],
                [record["message_source"] for record in messages],
            )
            self.assertEqual(1, summary["primary_messages"])
            self.assertEqual(1, summary["fallback_messages"])
            self.assertEqual(1, summary["compaction_records"])
            self.assertEqual("auto", summary["message_source_policy"])

    def test_require_text_selects_transcript_with_all_observable_markers(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            complete = root / "rollout-2026-08-13T12-00-00-complete.jsonl"
            partial = root / "rollout-2026-08-13T11-00-00-partial.jsonl"
            write_rollout(
                complete,
                [
                    session_meta("complete", root),
                    message("assistant", "commit-a", "2026-08-13T12:01:00Z"),
                    fallback_message(
                        "assistant", "commit-b", "2026-08-13T12:02:00Z"
                    ),
                ],
            )
            write_rollout(
                partial,
                [
                    session_meta("partial", root),
                    message("assistant", "commit-a", "2026-08-13T11:01:00Z"),
                ],
            )

            output = run_script(
                str(root),
                "--since",
                "2026-08-13",
                "--require-text",
                "commit-a",
                "--require-text",
                "commit-b",
            )
            transcripts = [
                record for record in output if record["record_type"] == "transcript"
            ]
            scan_summary = output[-1]

            self.assertEqual(
                ["complete"], [record["thread_id"] for record in transcripts]
            )
            self.assertEqual(1, scan_summary["matched_files"])
            self.assertEqual(1, scan_summary["skipped_required_text"])

    def test_message_source_all_retains_cross_source_duplicates(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            path = root / "rollout-2026-08-13T12-00-00-duplicate.jsonl"
            write_rollout(
                path,
                [
                    session_meta("duplicate", root),
                    message("user", "same message", "2026-08-13T12:01:00Z"),
                    fallback_message(
                        "user", "same message", "2026-08-13T12:01:01Z"
                    ),
                ],
            )

            automatic = run_script(str(path), "--since", "2026-08-13")
            automatic_messages = [
                record
                for record in automatic
                if record["record_type"] == "event" and record["kind"] == "message"
            ]
            automatic_summary = next(
                record
                for record in automatic
                if record["record_type"] == "transcript_summary"
            )
            all_sources = run_script(
                str(path),
                "--since",
                "2026-08-13",
                "--message-source",
                "all",
            )
            all_messages = [
                record
                for record in all_sources
                if record["record_type"] == "event" and record["kind"] == "message"
            ]
            all_summary = next(
                record
                for record in all_sources
                if record["record_type"] == "transcript_summary"
            )

            self.assertEqual(1, len(automatic_messages))
            self.assertEqual(1, automatic_summary["cross_source_duplicates"])
            self.assertEqual(2, len(all_messages))
            self.assertEqual(1, all_summary["cross_source_duplicates"])
            self.assertEqual(
                ["response_item", "event_msg"],
                [record["message_source"] for record in all_messages],
            )

    def test_require_text_ignores_hidden_reasoning(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            path = root / "rollout-2026-08-13T12-00-00-reasoning.jsonl"
            write_rollout(
                path,
                [
                    session_meta("reasoning", root),
                    {
                        "timestamp": "2026-08-13T12:01:00Z",
                        "type": "response_item",
                        "payload": {
                            "type": "reasoning",
                            "summary": ["hidden-marker"],
                        },
                    },
                    {
                        "timestamp": "2026-08-13T12:02:00Z",
                        "type": "mystery",
                    },
                ],
            )

            output = run_script(
                str(path),
                "--since",
                "2026-08-13",
                "--require-text",
                "hidden-marker",
            )

            self.assertFalse(
                any(record["record_type"] == "transcript" for record in output)
            )
            self.assertEqual(0, output[-1]["matched_files"])
            self.assertEqual(1, output[-1]["skipped_required_text"])
            self.assertEqual({"top:mystery": 1}, output[-1]["unknown_records"])

    def test_precise_timestamp_reports_filename_fallback(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            path = root / "rollout-2026-08-13T00-00-00-fallback.jsonl"
            write_rollout(
                path,
                [
                    {
                        "timestamp": "2026-08-13T00:00:00Z",
                        "type": "session_meta",
                        "payload": {"id": "fallback", "cwd": str(root)},
                    }
                ],
            )

            output = run_script(
                str(path),
                "--since",
                "2026-08-13T00:00:00Z",
                "--until",
                "2026-08-13T01:00:00Z",
                "--metadata-only",
            )
            transcript = next(
                record for record in output if record["record_type"] == "transcript"
            )

            self.assertEqual("filename_date", transcript["timestamp_source"])


if __name__ == "__main__":
    unittest.main()
