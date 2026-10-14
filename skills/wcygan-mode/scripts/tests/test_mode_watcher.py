from copy import deepcopy
import contextlib
import io
from pathlib import Path
import sys
from types import SimpleNamespace
import unittest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from mode_tools.github import GitHub, QueryError
from mode_tools.watcher import snapshot, decision, watch, backoff
import watch_pr

SHA = "a" * 40


def facts(number=1, **changes):
    return dict(
        number=number,
        state="OPEN",
        mergedAt=None,
        mergeable="MERGEABLE",
        mergeStateStatus="CLEAN",
        reviewDecision=None,
        headRefOid=SHA,
        headRefName=f"b{number}",
        baseRefName="main",
        isDraft=False,
        **changes,
    )


def options(**changes):
    values = dict(
        mode="single",
        status_only=False,
        allow_draft=False,
        timeout=10,
        interval=1,
        sweep_interval=3,
        max_query_errors=3,
    )
    values.update(changes)
    return SimpleNamespace(**values)


class FakeClock:
    def __init__(self):
        self.value = 0
        self.sleeps = []

    def now(self):
        return self.value

    def observed_at(self):
        return str(self.value)

    def sleep(self, n):
        self.sleeps.append(n)
        self.value += n


class Reader:
    owner = "o"
    name = "r"
    config = {}

    def __init__(self):
        self.states = {}
        self.check_rows = [{"name": "test", "kind": "passed"}]
        self.thread_rows = []
        self.head = "SUCCESS"
        self.calls = []

    def facts(self, n):
        self.calls.append(n)
        value = facts(n)
        value.update(self.states.get(n, {}))
        return value

    def checks(self, *_):
        return "gh-pr-checks", deepcopy(self.check_rows)

    def threads(self, *_):
        return deepcopy(self.thread_rows)

    def rollups(self, *_):
        return [{"oid": SHA, "state": self.head}]


class WatcherTests(unittest.TestCase):
    def test_readiness_and_tier_priority(self):
        r = Reader()
        self.assertEqual(decision([snapshot(r, 1)])["kind"], "READY")
        cases = [
            ({"mergeable": "CONFLICTING"}, 2),
            ({"isDraft": True}, 6),
            ({"reviewDecision": "CHANGES_REQUESTED"}, 6),
            ({"reviewDecision": "REVIEW_REQUIRED"}, 6),
            ({"state": "CLOSED"}, 6),
        ]
        for change, code in cases:
            r.states = {1: change}
            self.assertEqual(decision([snapshot(r, 1)])["exitCode"], code)
        r.states = {1: {"mergeable": "UNKNOWN"}}
        self.assertEqual(decision([snapshot(r, 1)])["kind"], "WAITING")
        r.states = {2: {"mergeable": "CONFLICTING"}}
        r.check_rows = [{"name": "test", "kind": "failed"}]
        result = decision([snapshot(r, 1), snapshot(r, 2)])
        self.assertEqual(result["exitCode"], 2)
        self.assertEqual(result["blocker"]["pr"]["number"], 2)

    def test_threads_hidden_failure_and_pending_draft(self):
        r = Reader()
        r.thread_rows = [{"id": "t"}]
        self.assertEqual(decision([snapshot(r, 1)])["exitCode"], 3)
        r.thread_rows = []
        r.states = {1: {"mergeStateStatus": "BLOCKED"}}
        r.head = "FAILURE"
        self.assertEqual(decision([snapshot(r, 1)])["exitCode"], 4)
        r.states = {1: {"isDraft": True}}
        r.check_rows = [{"name": "test", "kind": "pending"}]
        self.assertEqual(decision([snapshot(r, 1)])["kind"], "WAITING")

    def test_status_only_is_one_observation(self):
        r = Reader()
        r.states = {1: {"mergeable": "CONFLICTING"}}
        events = []
        clock = FakeClock()
        result = watch(r, [1], options(status_only=True), events.append, clock)
        self.assertEqual(result["exitCode"], 0)
        self.assertEqual(r.calls, [1])
        self.assertEqual(clock.sleeps, [])

    def test_timeout_and_wait_dedup(self):
        r = Reader()
        r.check_rows = [{"name": "test", "kind": "pending"}]
        events = []
        clock = FakeClock()
        result = watch(r, [1], options(timeout=3), events.append, clock)
        self.assertEqual(result["exitCode"], 5)
        self.assertEqual([e["kind"] for e in events], ["WAITING", "TIMEOUT"])
        self.assertEqual(clock.value, 3)

    def test_query_retry_budget_and_backoff(self):
        r = Reader()

        def fail(n):
            raise QueryError("unavailable")

        r.facts = fail
        events = []
        clock = FakeClock()
        result = watch(r, [1], options(timeout=0), events.append, clock)
        self.assertEqual(result["exitCode"], 7)
        self.assertEqual(clock.sleeps, [60, 120])
        self.assertEqual(backoff(1, 10), 300)

    def test_queue_advances_without_sleep_and_does_not_treat_ready_as_merged(self):
        r = Reader()
        r.states = {1: {"state": "MERGED"}}
        events = []
        clock = FakeClock()
        result = watch(
            r, [1, 2], options(mode="queued-stack", timeout=1), events.append, clock
        )
        self.assertEqual(result["exitCode"], 5)
        self.assertIn("ADVANCE", [e["kind"] for e in events])
        self.assertEqual(clock.sleeps, [1])
        r.states[2] = {"state": "MERGED"}
        events = []
        clock = FakeClock()
        self.assertEqual(
            watch(r, [1, 2], options(mode="queued-stack"), events.append, clock)[
                "kind"
            ],
            "COMPLETE",
        )
        self.assertEqual(clock.sleeps, [])

    def test_interrupted_sweep_resumes_failed_pr(self):
        r = Reader()
        r.states = {1: {"state": "MERGED"}, 2: {"state": "MERGED"}}
        original = r.facts
        failed = False

        def flaky(n):
            nonlocal failed
            if n == 2 and not failed:
                failed = True
                r.calls.append(n)
                raise QueryError("once")
            return original(n)

        r.facts = flaky
        events = []
        result = watch(
            r,
            [1, 2],
            options(mode="queued-stack", timeout=0),
            events.append,
            FakeClock(),
        )
        self.assertEqual(result["kind"], "COMPLETE")
        self.assertEqual(r.calls[:3], [1, 2, 2])
        self.assertEqual(sum(e["kind"] == "STATUS" for e in events), 1)

    def test_pending_wait_names_actual_pr(self):
        r = Reader()
        rows = [snapshot(r, 1)]
        r.check_rows = [{"name": "test", "kind": "pending"}]
        rows.append(snapshot(r, 2))
        self.assertEqual(decision(rows)["frontier"]["number"], 2)

    def test_usage_and_help_do_not_query(self):
        for args in [
            ["--stack-prs", "1"],
            ["--interval", "nan"],
            ["--owner", "x"],
            ["--stack", "--queued-stack"],
        ]:
            with (
                self.assertRaises(SystemExit) as exc,
                contextlib.redirect_stderr(io.StringIO()),
            ):
                watch_pr.main(args)
            self.assertEqual(exc.exception.code, 64)
        with (
            self.assertRaises(SystemExit) as exc,
            contextlib.redirect_stdout(io.StringIO()),
        ):
            watch_pr.main(["--help"])
        self.assertEqual(exc.exception.code, 0)


class GitHubTests(unittest.TestCase):
    def reader(self):
        return GitHub("o/r")

    def test_threads_paginate_and_filter_resolved(self):
        r = self.reader()
        calls = []

        def graph(q, **v):
            calls.append(v.get("cursor"))
            row = {
                "id": "later" if v.get("cursor") else "first",
                "isResolved": not bool(v.get("cursor")),
                "comments": {"nodes": []},
            }
            return {
                "pullRequest": {
                    "reviewThreads": {
                        "nodes": [row],
                        "pageInfo": {
                            "hasNextPage": not bool(v.get("cursor")),
                            "endCursor": "next",
                        },
                    }
                }
            }

        r.graphql = graph
        self.assertEqual([t["id"] for t in r.threads(1)], ["later"])
        self.assertEqual(calls, [None, "next"])

    def test_bad_pagination_and_unknown_enums_fail(self):
        r = self.reader()
        r.graphql = lambda *a, **k: {"pullRequest": {"reviewThreads": {"nodes": []}}}
        with self.assertRaises(QueryError):
            r.threads(1)
        value = facts()
        value["reviewDecision"] = "NEW_ENUM"
        r.command = lambda *a, **k: value
        with self.assertRaises(QueryError):
            r.facts(1)

    def test_fast_checks_and_fallback_pagination(self):
        r = self.reader()
        r.command = lambda *a, **k: [{"name": "unit", "bucket": "pass"}]
        self.assertEqual(r.checks(1, SHA)[0], "gh-pr-checks")
        r.command = lambda *a, **k: []
        cursors = []

        def graph(q, **v):
            cursors.append(v.get("cursor"))
            return {
                "object": {
                    "statusCheckRollup": {
                        "contexts": {
                            "nodes": [
                                {
                                    "__typename": "CheckRun",
                                    "name": "unit",
                                    "status": "COMPLETED",
                                    "conclusion": "SUCCESS",
                                }
                            ],
                            "pageInfo": {
                                "hasNextPage": not bool(v.get("cursor")),
                                "endCursor": "next",
                            },
                        }
                    }
                }
            }

        r.graphql = graph
        source, rows = r.checks(1, SHA)
        self.assertEqual(source, "graphql-rollup")
        self.assertEqual(len(rows), 2)
        self.assertEqual(cursors, [None, "next"])
        r.graphql = lambda *a, **k: {
            "object": {
                "statusCheckRollup": {
                    "contexts": {
                        "nodes": [],
                        "pageInfo": {"hasNextPage": False, "endCursor": None},
                    }
                }
            }
        }
        with self.assertRaises(QueryError):
            r.checks(1, SHA)

    def test_stack_order_and_ambiguous_children(self):
        r = self.reader()
        r.facts = lambda n: dict(number=n, headRefName="two", baseRefName="one")
        rows = [
            dict(number=1, headRefName="one", baseRefName="main"),
            dict(number=2, headRefName="two", baseRefName="one"),
            dict(number=3, headRefName="three", baseRefName="two"),
        ]
        r.pulls = lambda: rows
        self.assertEqual(r.stack(2), [1, 2, 3])
        rows.append(dict(number=4, headRefName="four", baseRefName="two"))
        with self.assertRaises(QueryError):
            r.stack(2)

    def test_configured_bot_passes_and_gate_annotation(self):
        r = self.reader()
        r.config = {"review_bots": ["reviewer"], "review_gate_checks": ["Approval"]}

        def pages(field, *args):
            if field == "reviews":
                return iter([{"author": {"login": "reviewer"}, "submittedAt": "now"}])
            return iter(
                [
                    {
                        "id": "thread",
                        "isResolved": False,
                        "comments": {
                            "nodes": [
                                {"author": {"login": "reviewer"}, "body": "check"}
                            ]
                        },
                    }
                ]
            )

        r.pages = pages
        self.assertEqual(r.threads(1)[0]["automationReviewPasses"], 1)
        r.command = lambda *a, **k: [{"name": "Approval", "bucket": "pending"}]
        self.assertTrue(r.checks(1, SHA)[1][0]["reviewGate"])
