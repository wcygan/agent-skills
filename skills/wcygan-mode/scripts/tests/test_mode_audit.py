from pathlib import Path
import subprocess
import sys
import tempfile
import unittest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from audit_worktrees import audit
from mode_tools.common import ToolError


class AuditTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name).resolve()
        self.repo = self.root / "repository"
        self.repo.mkdir()
        self.git("init", "--initial-branch=main")
        self.git("config", "user.name", "Test")
        self.git("config", "user.email", "test@example.invalid")
        (self.repo / "file").write_text("base")
        self.git("add", "file")
        self.git("commit", "-m", "base")
        self.work = self.root / "work tree with spaces"
        self.git("worktree", "add", "-b", "task", str(self.work))

    def git(self, *args):
        result = subprocess.run(
            ["git", *args], cwd=self.repo, text=True, capture_output=True, check=True
        )
        return result.stdout

    def reader(self, **_):
        class Reader:
            def pulls(self, state):
                return []

        return Reader()

    def row(self, **kwargs):
        result = audit(self.repo, "main", gh_factory=self.reader, **kwargs)
        return next(r for r in result["worktrees"] if r["worktree"] == str(self.work))

    def test_unknown_owner_and_explicit_inactive_owner(self):
        self.assertEqual(self.row()["bucket"], "review-unknown-ownership")
        row = self.row(activity={str(self.work): {"active": False}})
        self.assertEqual(row["bucket"], "candidate")
        self.assertTrue(row["merged"])
        self.assertEqual(row["branch"], "task")
        self.assertEqual(
            self.row(activity={str(self.work): {"active": True}})["bucket"],
            "hold-active",
        )

    def test_untracked_and_tracked_changes_hold(self):
        (self.work / "untracked").write_text("valuable")
        self.assertEqual(self.row()["bucket"], "hold-local-work")
        (self.work / "untracked").unlink()
        (self.work / "file").write_text("edited")
        self.assertEqual(self.row()["bucket"], "hold-local-work")

    def test_detached_and_unavailable_pr_evidence(self):
        subprocess.run(
            ["git", "checkout", "--detach"],
            cwd=self.work,
            check=True,
            capture_output=True,
        )
        self.assertEqual(self.row()["remote"], "detached")

        def unavailable(**_):
            raise ToolError("offline")

        result = audit(
            self.repo,
            "main",
            activity={str(self.work): {"active": False}},
            gh_factory=unavailable,
        )
        row = next(r for r in result["worktrees"] if r["worktree"] == str(self.work))
        self.assertEqual(row["bucket"], "review-incomplete-evidence")
        self.assertTrue(result["warnings"])
        self.assertTrue(self.work.exists())

    def test_primary_locked_and_closed_pr_not_disposable(self):
        self.git("worktree", "lock", str(self.work))
        self.assertEqual(self.row()["bucket"], "hold-protected")
        self.git("worktree", "unlock", str(self.work))
        (self.work / "file").write_text("new")
        subprocess.run(
            ["git", "commit", "-am", "change"],
            cwd=self.work,
            check=True,
            capture_output=True,
        )

        class Reader:
            def pulls(self, state):
                return [{"number": 1, "headRefName": "task", "state": "CLOSED"}]

        result = audit(
            self.repo,
            "main",
            activity={str(self.work): {"active": False}},
            gh_factory=lambda **_: Reader(),
        )
        self.assertEqual(
            next(r for r in result["worktrees"] if r["primary"])["bucket"],
            "hold-protected",
        )
        self.assertEqual(
            next(r for r in result["worktrees"] if not r["primary"])["bucket"], "review"
        )
