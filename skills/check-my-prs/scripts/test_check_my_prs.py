#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.11"
# dependencies = [
#   "rich==14.3.4",
# ]
# ///

"""Unit tests for the read-only PR report normalizer and renderer."""

from __future__ import annotations

import sys
import unittest

sys.dont_write_bytecode = True

import check_my_prs as inspector


def raw_pr(
    number: int, *, title: str = "Add useful behavior", position: int = 1
) -> dict:
    return {
        "number": number,
        "title": title,
        "url": f"https://github.com/acme/widgets/pull/{number}",
        "state": "OPEN",
        "isDraft": False,
        "merged": False,
        "additions": 80,
        "deletions": 20,
        "changedFiles": 3,
        "mergeable": "MERGEABLE",
        "mergeStateStatus": "CLEAN",
        "canBeRebased": True,
        "reviewDecision": "APPROVED",
        "headRefName": f"widgets/layer-{position}",
        "baseRefName": "main" if position == 1 else f"widgets/layer-{position - 1}",
        "body": (
            "## Problem & Solution Overview\n\n"
            "The widget state was ambiguous. This adds one explicit state transition.\n\n"
            "## Testing Done\n\n"
            "- `uv run pytest tests/test_widget.py` — passed"
        ),
        "comments": {"totalCount": 0},
        "totalCommentsCount": 0,
        "reviewRequests": {"totalCount": 0, "nodes": []},
        "reviews": {
            "totalCount": 1,
            "nodes": [
                {
                    "state": "APPROVED",
                    "submittedAt": "2026-08-09",
                    "author": {"login": "reviewer"},
                }
            ],
        },
        "reviewThreads": {"totalCount": 0, "nodes": []},
        "files": {
            "totalCount": 3,
            "nodes": [
                {
                    "path": "src/widget.py",
                    "additions": 50,
                    "deletions": 10,
                    "changeType": "MODIFIED",
                },
                {
                    "path": "tests/test_widget.py",
                    "additions": 30,
                    "deletions": 10,
                    "changeType": "MODIFIED",
                },
                {
                    "path": "uv.lock",
                    "additions": 400,
                    "deletions": 300,
                    "changeType": "MODIFIED",
                },
            ],
        },
        "commits": {
            "totalCount": 1,
            "nodes": [
                {"commit": {"oid": "abc", "messageHeadline": "Add useful behavior"}}
            ],
        },
        "stackEntry": {"position": position},
        "stack": None,
    }


def bundle(
    number: int, *, position: int = 1, title: str = "Add useful behavior"
) -> dict:
    return {
        "pr": raw_pr(number, title=title, position=position),
        "checks": [
            {
                "name": "test",
                "state": "SUCCESS",
                "bucket": "pass",
                "workflow": "CI",
                "link": "https://example.test",
            }
        ],
        "checks_known": True,
        "required_checks": [
            {
                "name": "test",
                "state": "SUCCESS",
                "bucket": "pass",
                "workflow": "CI",
                "link": "https://example.test",
            }
        ],
        "required_known": True,
        "evidence_gaps": [],
    }


class BodyTests(unittest.TestCase):
    def test_accepts_exact_required_sections(self) -> None:
        result = inspector.parse_body(raw_pr(1)["body"])
        self.assertEqual([], result["findings"])
        self.assertTrue(result["testing_present"])

    def test_flags_missing_reordered_and_vague_testing(self) -> None:
        body = "## Testing Done\n\nTests pass\n\n## Problem & Solution Overview\n\nFixes it."
        findings = inspector.parse_body(body)["findings"]
        self.assertIn("required H2 sections are out of order", findings)
        self.assertTrue(any("testing evidence is vague" in item for item in findings))


class StackTests(unittest.TestCase):
    def test_reconciles_matching_and_divergent_stacks(self) -> None:
        remote = {
            "size": 2,
            "entries": {
                "nodes": [
                    {"position": 1, "pullRequest": {"number": 10}},
                    {"position": 2, "pullRequest": {"number": 11}},
                ]
            },
        }
        local = {
            "available": True,
            "in_stack": True,
            "branches": [{"pr": {"number": 10}}, {"pr": {"number": 11}}],
        }
        self.assertEqual("tracked", inspector.reconcile_stack(remote, local)[0])
        local["branches"].reverse()
        self.assertEqual("divergent", inspector.reconcile_stack(remote, local)[0])

    def test_frontier_stops_at_first_unready_layer(self) -> None:
        records = [
            {"position": 1, "number": 10, "gate": "READY"},
            {"position": 2, "number": 11, "gate": "WAITING"},
            {"position": 3, "number": 12, "gate": "READY"},
        ]
        self.assertEqual(10, inspector.compute_frontier(records))


class ReportTests(unittest.TestCase):
    def test_builds_healthy_report_and_downweights_lockfile(self) -> None:
        snapshot = {
            "repository": "acme/widgets",
            "target_pr": 10,
            "remote_stack": None,
            "local_stack": {
                "available": True,
                "in_stack": False,
                "branches": [],
                "error": None,
            },
            "repository_guidance": {},
            "pull_requests": [bundle(10)],
            "evidence_gaps": [],
        }
        report = inspector.build_report(snapshot)
        self.assertEqual("HEALTHY", report["overall"])
        self.assertEqual("READY", report["pull_requests"][0]["gate"])
        self.assertEqual(700, report["pull_requests"][0]["scope"]["generated_churn"])
        self.assertEqual(100, report["pull_requests"][0]["scope"]["substantive_churn"])

    def test_surfaces_optional_waits_and_local_rebase_health(self) -> None:
        item = bundle(10)
        item["checks"].append(
            {
                "name": "preview",
                "state": "PENDING",
                "bucket": "pending",
                "workflow": "Optional",
                "link": "https://example.test",
            }
        )
        snapshot = {
            "repository": "acme/widgets",
            "target_pr": 10,
            "remote_stack": None,
            "local_stack": {
                "available": True,
                "in_stack": True,
                "branches": [
                    {
                        "name": "widgets/layer-1",
                        "needsRebase": True,
                        "pr": {"number": 10},
                    }
                ],
                "error": None,
            },
            "repository_guidance": {},
            "pull_requests": [item],
            "evidence_gaps": [],
        }
        report = inspector.build_report(snapshot)
        self.assertEqual("ACTION", report["overall"])
        self.assertEqual("needed", report["stack"]["health"]["rebase"])
        self.assertIn(
            "optional wait",
            inspector.check_summary(report["pull_requests"][0]["checks"]),
        )
        self.assertTrue(
            any("stack-aware rebase" in action for action in report["next_actions"])
        )

    def test_unknown_evidence_has_unknown_exit(self) -> None:
        item = bundle(10)
        item["required_known"] = False
        snapshot = {
            "repository": "acme/widgets",
            "target_pr": 10,
            "remote_stack": None,
            "local_stack": {
                "available": False,
                "in_stack": False,
                "branches": [],
                "error": "gh-stack unavailable",
            },
            "repository_guidance": {},
            "pull_requests": [item],
            "evidence_gaps": [],
        }
        report = inspector.build_report(snapshot)
        self.assertEqual("UNKNOWN", report["overall"])
        self.assertEqual(2, inspector.exit_code(report))

    def test_reports_entirely_unsubmitted_local_stack(self) -> None:
        snapshot = {
            "repository": "acme/widgets",
            "target_pr": None,
            "remote_stack": None,
            "local_stack": {
                "available": True,
                "in_stack": True,
                "trunk": "main",
                "branches": [
                    {"name": "widgets/schema", "needsRebase": False},
                    {"name": "widgets/service", "needsRebase": False},
                ],
                "error": None,
            },
            "repository_guidance": {},
            "pull_requests": [],
            "evidence_gaps": [],
        }
        report = inspector.build_report(snapshot)
        self.assertIsNone(report["target_pr"])
        self.assertEqual("local-only", report["stack"]["classification"])
        self.assertEqual(2, report["stack"]["size"])
        self.assertEqual("ACTION", report["overall"])
        self.assertIn("local stack", inspector.render_plain(report))


if __name__ == "__main__":
    unittest.main()
