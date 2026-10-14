import contextlib
import io
import json
from pathlib import Path
import socket
import subprocess
import sys
import tempfile
import unittest
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import orchestrate
from mode_tools.store import Store
from mode_tools.common import ToolError, Missing

SHA = "a" * 40


class StoreTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.path = Path(self.temp.name) / "state"

    def test_lifecycle_units_and_status(self):
        with Store(self.path) as s:
            s.init()
            s.unit_add("one", "backend", "/brief.md")
            s.init()
            s.unit_set("one", state="running", branch="feature", pr=1, sha=SHA)
            self.assertEqual(s.units(track="backend")[0]["sha"], SHA)
            self.assertEqual(s.units(state="pending"), [])
            self.assertEqual(s.status()["summary"]["unitStates"], {"running": 1})
            self.assertTrue((self.path / "status.md").exists())
            with self.assertRaises(ToolError):
                s.unit_add("one", "x")
        with self.assertRaises(ToolError):
            s.units()
        with Store(self.path) as s:
            self.assertEqual(s.unit_get("one")["state"], "running")

    def test_ledger_exact_revision_replace_and_corruption(self):
        with Store(self.path) as s:
            s.init()
            s.record(1, SHA, "verifier-blocked", "evidence.txt")
            s.record(1, SHA, "behavior-verified", "evidence2.txt", "reviewer")
            self.assertEqual(len(s.ledger()), 1)
            self.assertEqual(s.check(1, SHA)["verifier"], "reviewer")
            with self.assertRaises(Missing):
                s.check(1, "b" * 40)
            with self.assertRaises(ToolError):
                s.record(1, SHA, "fake", "evidence")
            with self.assertRaises(ToolError):
                s.record(1, "short", "behavior-verified", "evidence")
            with self.assertRaises(ToolError):
                s.record(1, SHA, "behavior-verified", "bad\nevidence")
            (self.path / "ledger.tsv").write_text("wrong\theader\n")
            with self.assertRaises(ToolError):
                s.ledger()

    def test_live_writer_cannot_be_stolen_and_lock_recovers_after_exit(self):
        scripts = Path(__file__).resolve().parents[1]
        with Store(self.path) as s:
            s.init()
            result = subprocess.run(
                [
                    sys.executable,
                    "-B",
                    str(scripts / "orchestrate.py"),
                    "--store",
                    str(self.path),
                    "--force",
                    "init",
                ],
                capture_output=True,
                text=True,
            )
            self.assertEqual(result.returncode, 1)
            self.assertIn("locked", result.stderr)
        (self.path / ".orch.lock").write_text(
            json.dumps({"host": socket.gethostname(), "pid": 99999999})
        )
        with Store(self.path) as s:
            s.init()
        (self.path / ".orch.lock").write_text(
            json.dumps({"host": "different-host", "pid": 123})
        )
        with self.assertRaises(ToolError):
            with Store(self.path):
                pass
        (self.path / ".orch.lock").write_text("malformed")
        with self.assertRaises(ToolError):
            with Store(self.path):
                pass

    def test_inbox_validate_before_drain_and_keep_recovery_copy(self):
        with Store(self.path) as s:
            s.init()
            s.unit_add("one", "x")
            pointer = s.push("worker", "one", "complete", "proof")
            self.assertEqual(s.drain(True), [pointer])
            self.assertEqual(s.drain(), [pointer])
            self.assertEqual(s.drain(), [])
            self.assertEqual(
                json.loads(next((self.path / "drains").iterdir()).read_text()),
                [pointer],
            )
            s.push("worker", "one", "complete", "proof2")
            with patch.object(s, "save", side_effect=OSError("interrupted")):
                with self.assertRaises(OSError):
                    s.drain()
            self.assertEqual(len(s.records("inbox")), 1)
            (self.path / "inbox.json").write_text('[{"status":"bad"}]')
            with self.assertRaises(ToolError):
                s.drain()
            self.assertIn("bad", (self.path / "inbox.json").read_text())

    def test_gates_standing_and_frontier_pin(self):
        with Store(self.path) as s:
            s.init()
            s.park("scope", "Question?", "A,B", "A")
            self.assertEqual(s.records("gates")[0]["kind"], "open")
            self.assertEqual(s.resolve("scope", "B")["answer"], "B")
            s.standing_add("Keep evidence")
            s.standing_add("Protect existing work")
            self.assertEqual(s.records("standing")[1]["number"], 2)
            rows = [
                {"pr": 1, "branches": "main -> one", "sha": SHA, "state": "MERGED"},
                {"pr": 2, "branches": "one -> two", "sha": "b" * 40, "state": "OPEN"},
            ]
            with self.assertRaises(ToolError):
                s.set_frontier(rows, [2, 1])
            self.assertEqual(s.frontier()["generation"], 0)
            self.assertEqual(s.set_frontier(rows, [1, 2])["lowestUnmerged"], 2)
            (self.path / "frontier.json").write_text(
                '{"generation": 1,"prs":[],"lowestUnmerged":2}'
            )
            with self.assertRaises(ToolError):
                s.frontier()

    def test_cli_commands_exit_codes_and_json(self):
        def call(*args):
            out = io.StringIO()
            with (
                contextlib.redirect_stdout(out),
                contextlib.redirect_stderr(io.StringIO()),
            ):
                code = orchestrate.main(["--store", str(self.path), "--json", *args])
            return code, json.loads(out.getvalue()) if out.getvalue() else None

        self.assertEqual(call("init")[0], 0)
        self.assertEqual(call("unit", "add", "one", "--track", "x")[0], 0)
        self.assertEqual(call("unit", "counts")[1], {"pending": 1})
        self.assertEqual(call("unit", "get", "absent")[0], 2)
        self.assertEqual(
            call(
                "ledger",
                "record",
                "1",
                SHA,
                "unit-test-verified",
                "--evidence",
                "proof",
            )[0],
            0,
        )
        self.assertEqual(call("ledger", "summary")[1], {"unit-test-verified": 1})
        with (
            self.assertRaises(SystemExit) as exc,
            contextlib.redirect_stderr(io.StringIO()),
        ):
            orchestrate.main(["bogus"])
        self.assertEqual(exc.exception.code, 1)

    def test_malformed_units_and_symlink_refused(self):
        with Store(self.path) as s:
            s.init()
            s.unit_add("one", "x")
            with (self.path / "units.tsv").open("a") as f:
                f.write("bad\trow\n")
            with self.assertRaises(ToolError):
                s.units()
        (self.path / "units.tsv").unlink()
        (self.path / "units.tsv").symlink_to("/dev/null")
        with Store(self.path) as s:
            with self.assertRaises(ToolError):
                s.units()

    def test_frontier_resolves_chain_and_rejects_missing_parent(self):
        rows = [
            dict(number=1, headRefName="one", baseRefName="main"),
            dict(number=2, headRefName="two", baseRefName="one"),
        ]

        class Reader:
            repo = "o/r"

            def pulls(self, state):
                return rows

            def command(self, args):
                return {"defaultBranchRef": {"name": "main"}}

            def facts(self, n):
                row = next(r for r in rows if r["number"] == n)
                return dict(row, headRefOid=SHA, state="OPEN")

        args = orchestrate.parser().parse_args(
            ["--store", str(self.path), "frontier", "set", "--prs", "1,2"]
        )
        with Store(self.path) as s:
            s.init()
            with (
                patch.object(orchestrate, "GitHub", return_value=Reader()),
                patch.object(orchestrate, "run", return_value="two\n"),
            ):
                result = orchestrate.execute(s, args)
                self.assertEqual([r["pr"] for r in result["prs"]], [1, 2])
                rows.pop(0)
                with self.assertRaises(ToolError):
                    orchestrate.execute(s, args)
                self.assertEqual(s.frontier()["generation"], 1)
