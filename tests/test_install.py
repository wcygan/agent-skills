"""End-to-end checks of tools/install.py against real git repositories in a temp home."""
import importlib.util
import json
import os
import signal
import subprocess
import tempfile
import time
import unittest
from pathlib import Path

SCRIPT = Path(__file__).resolve().parents[1] / "tools/install.py"
SPEC = importlib.util.spec_from_file_location("install", SCRIPT)
install = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(install)

OURS = "https://github.com/wcygan/agent-skills"


def git(root, *args):
    return subprocess.run(["git", *args], cwd=root, check=True, text=True,
                          capture_output=True).stdout.strip()


class Sandbox:
    """A provider and a consumer checkout, each with a bare origin, and an empty home."""

    def __init__(self, root: Path):
        self.home = root / "home"
        self.shared = self.home / ".agents" / "skills"
        self.claude = self.home / ".claude" / "skills"
        self.claude.mkdir(parents=True)
        self.env: dict[str, str] = {}
        self.provider = self.checkout(root, "agent-skills")
        self.consumer = self.checkout(root, "dotfiles")
        (self.provider / "tools").mkdir()
        (self.provider / "tools" / "install.py").write_bytes(SCRIPT.read_bytes())
        self.skill("alpha")
        self.skill("beta")
        (self.provider / "skills" / "alpha" / "scripts").mkdir()
        tool = self.provider / "skills" / "alpha" / "scripts" / "tool.sh"
        tool.write_text("#!/bin/sh\n")
        tool.chmod(0o755)
        (self.consumer / "agent-skills.lock.toml").write_text(
            'version = 2\nrepository = "wcygan/agent-skills"\n'
            f'commit = "{"0" * 40}"\nagent = "codex"\ndirectory = ".agents/skills"\n')
        for checkout in (self.provider, self.consumer):
            git(checkout, "add", "-A")
            git(checkout, "commit", "-qm", "seed")
            git(checkout, "push", "-q", "-u", "origin", "main")
            git(checkout, "remote", "set-head", "origin", "main")

    @staticmethod
    def checkout(root: Path, name: str) -> Path:
        git(root, "init", "-q", "--bare", "-b", "main", f"{name}.git")
        git(root, "init", "-q", "-b", "main", name)
        path = root / name
        git(path, "remote", "add", "origin", str(root / f"{name}.git"))
        for key, value in (("user.name", "t"), ("user.email", "t@example.invalid"),
                           ("commit.gpgsign", "false")):
            git(path, "config", key, value)
        return path

    def skill(self, name: str, body: str = "Body.\n") -> None:
        folder = self.provider / "skills" / name
        folder.mkdir(parents=True, exist_ok=True)
        (folder / "SKILL.md").write_text(
            f"---\nname: {name}\ndescription: d\nmetadata:\n  kind: component\n---\n\n{body}")

    def command(self, *flags: str) -> tuple[list[str], dict[str, str]]:
        # The sandbox provider has no skill_catalog package, so the run skips the snapshot.
        return (["python3", str(self.provider / "tools" / "install.py"), "--dotfiles",
                 str(self.consumer), *flags],
                {**os.environ, "HOME": str(self.home), "GIT_SSH_COMMAND": "ssh", **self.env})

    def run(self, *flags: str, wait: bool = True) -> subprocess.CompletedProcess:
        """Run the installer; `wait` pushes before it exits, so pushed state can be asserted."""
        command, env = self.command(*flags, *(["--wait"] if wait else []))
        return subprocess.run(command, env=env, text=True, capture_output=True)

    def block_pushes(self) -> Path:
        """Make every catalog push wait until the returned file is removed."""
        gate = self.provider.parent / "gate"
        gate.write_text("")
        hook = self.provider / ".git" / "hooks" / "pre-push"
        hook.parent.mkdir(exist_ok=True)
        hook.write_text(f'#!/bin/sh\nwhile [ -e "{gate}" ]; do sleep 0.05; done\n')
        hook.chmod(0o755)
        return gate

    def publishers(self) -> list[int]:
        """Process ids of this sandbox's background publishers."""
        pattern = f"{self.provider / 'tools' / 'install.py'} --publish"
        return [int(pid) for pid in subprocess.run(["pgrep", "-f", pattern], text=True,
                                                   capture_output=True).stdout.split()]

    def pin(self) -> str:
        return git(self.consumer, "show", "origin/main:agent-skills.lock.toml").split('commit = "')[1][:40]

    def remote(self, name: str) -> Path:
        return self.provider.parent / f"{name}.git"

    def remote_pin(self) -> str:
        return git(self.remote("dotfiles"), "show", "main:agent-skills.lock.toml").split('commit = "')[1][:40]

    def publishes(self) -> list[dict]:
        log = self.provider / ".git" / "install.push.jsonl"
        return [json.loads(line) for line in log.read_text().splitlines()] if log.exists() else []

    def settle(self) -> list[dict]:
        """Wait up to 10 s for every background publisher of this sandbox to exit; return the records."""
        deadline = time.monotonic() + 10
        while self.publishers():
            if time.monotonic() > deadline:
                raise AssertionError("a background publisher is still running after 10 s")
            time.sleep(0.05)
        return self.publishes()


class InstallTests(unittest.TestCase):
    def setUp(self):
        directory = tempfile.TemporaryDirectory()
        self.addCleanup(directory.cleanup)
        self.box = Sandbox(Path(directory.name).resolve())
        self.addCleanup(self.box.settle)  # A publisher must not outlive the directory it pushes from.

    def installed(self):
        return sorted(path.name for path in self.box.shared.iterdir())

    def test_first_run_commits_pushes_pins_installs_and_links(self):
        self.box.skill("gamma")
        result = self.box.run()
        self.assertEqual(0, result.returncode, result.stdout + result.stderr)
        head = git(self.box.provider, "rev-parse", "HEAD")
        self.assertEqual("", git(self.box.provider, "status", "--porcelain"))
        self.assertEqual(head, git(self.box.provider, "rev-parse", "origin/main"))
        self.assertEqual("feat(skills): update gamma", git(self.box.provider, "log", "-1", "--format=%s"))
        self.assertEqual(head, self.box.pin())
        self.assertEqual(["alpha", "beta", "gamma"], self.installed())
        manifest = (self.box.shared / "gamma" / "SKILL.md").read_text()
        self.assertEqual(
            "---\nname: gamma\ndescription: d\nmetadata:\n"
            f"    github-path: skills/gamma\n    github-pinned: {head}\n    github-ref: {head}\n"
            f"    github-repo: {OURS}\n"
            f"    github-tree-sha: {git(self.box.provider, 'rev-parse', 'HEAD:skills/gamma')}\n"
            "    kind: component\n---\nBody.\n", manifest)
        self.assertTrue(os.access(self.box.shared / "alpha" / "scripts" / "tool.sh", os.X_OK))
        self.assertEqual(self.box.shared / "gamma", (self.box.claude / "gamma").readlink())

    def test_a_second_run_changes_nothing(self):
        self.box.run()
        heads = [git(repo, "rev-parse", "HEAD") for repo in (self.box.provider, self.box.consumer)]
        stamp = (self.box.shared / "alpha" / "SKILL.md").stat().st_mtime_ns
        result = self.box.run()
        self.assertEqual(0, result.returncode, result.stdout + result.stderr)
        self.assertIn("nothing to commit", result.stdout)
        self.assertEqual(heads, [git(repo, "rev-parse", "HEAD")
                                 for repo in (self.box.provider, self.box.consumer)])
        self.assertEqual(stamp, (self.box.shared / "alpha" / "SKILL.md").stat().st_mtime_ns)

    def test_an_edit_replaces_only_that_skill_and_drops_its_obsolete_files(self):
        self.box.run()
        untouched = (self.box.shared / "beta").stat().st_ino
        (self.box.provider / "skills" / "alpha" / "scripts" / "tool.sh").unlink()
        self.box.skill("alpha", "New body.\n")
        result = self.box.run()
        self.assertIn("replaced: alpha; restamped: 1", result.stdout)
        self.assertFalse((self.box.shared / "alpha" / "scripts").exists())
        self.assertIn("New body.", (self.box.shared / "alpha" / "SKILL.md").read_text())
        self.assertEqual(untouched, (self.box.shared / "beta").stat().st_ino)
        head = git(self.box.provider, "rev-parse", "HEAD")
        self.assertIn(f"github-pinned: {head}", (self.box.shared / "beta" / "SKILL.md").read_text())

    def test_a_retired_skill_is_archived_and_unlinked_while_foreign_entries_stay(self):
        self.box.run()
        foreign = self.box.shared / "foreign"
        foreign.mkdir()
        (foreign / "SKILL.md").write_text("---\nname: foreign\n---\n")
        (self.box.claude / "foreign").symlink_to(foreign)
        (self.box.claude / "own-folder").mkdir()
        git(self.box.provider, "rm", "-rq", "skills/beta")
        result = self.box.run()
        self.assertEqual(0, result.returncode, result.stdout + result.stderr)
        self.assertEqual(["alpha", "foreign"], self.installed())
        self.assertFalse((self.box.claude / "beta").is_symlink())
        self.assertTrue((self.box.claude / "foreign").is_symlink())
        self.assertTrue((self.box.claude / "own-folder").is_dir())
        archives = list((self.box.home / ".local/state/dotfiles/agent-skills-archives").glob("*/beta/SKILL.md"))
        self.assertEqual(1, len(archives))

    def test_a_foreign_tree_with_a_catalog_name_is_left_alone_and_reported(self):
        clash = self.box.shared / "alpha"
        clash.mkdir(parents=True)
        (clash / "SKILL.md").write_text("---\nname: alpha\n---\nMine.\n")
        result = self.box.run()
        self.assertEqual(0, result.returncode, result.stdout + result.stderr)
        self.assertIn("left alone: alpha", result.stdout)
        self.assertIn("Mine.", (clash / "SKILL.md").read_text())

    def test_a_failed_catalog_push_is_reported_and_the_rerun_publishes_it(self):
        self.box.run()
        git(self.box.provider, "remote", "set-url", "--push", "origin", "/nonexistent.git")
        self.box.skill("gamma")
        result = self.box.run()
        self.assertNotEqual(0, result.returncode)
        self.assertIn("Stopped: push from", result.stderr)
        head = git(self.box.provider, "rev-parse", "HEAD")
        self.assertNotEqual(head, git(self.box.provider, "rev-parse", "origin/main"))
        # The pin push ran beside the failed one, so the skills and the pin are current.
        self.assertEqual(head, self.box.pin())
        self.assertTrue((self.box.shared / "gamma").is_dir())
        git(self.box.provider, "remote", "set-url", "--push", "origin",
            str(self.box.provider.parent / "agent-skills.git"))
        self.assertEqual(0, self.box.run().returncode)
        self.assertEqual(git(self.box.provider, "rev-parse", "HEAD"), self.box.pin())

    def test_another_branch_is_refused_before_anything_changes(self):
        git(self.box.provider, "switch", "-qc", "feature")
        self.box.skill("gamma")
        result = self.box.run()
        self.assertIn("is on feature; install only from main", result.stderr)
        self.assertEqual("?? skills/gamma/", git(self.box.provider, "status", "--porcelain"))
        self.assertFalse(self.box.shared.exists())

    def test_unrelated_dotfiles_edits_are_not_committed(self):
        (self.box.consumer / "notes.txt").write_text("mine\n")
        self.assertEqual(0, self.box.run().returncode)
        self.assertEqual("?? notes.txt", git(self.box.consumer, "status", "--porcelain"))

    def assert_published(self):
        """Both remotes hold what the checkouts hold, and the pin names the catalog commit."""
        head = git(self.box.provider, "rev-parse", "HEAD")
        self.assertEqual(head, git(self.box.remote("agent-skills"), "rev-parse", "main"))
        self.assertEqual(git(self.box.consumer, "rev-parse", "HEAD"),
                         git(self.box.remote("dotfiles"), "rev-parse", "main"))
        self.assertEqual(head, self.box.remote_pin())

    def test_a_default_run_exits_before_pushing_and_publishes_in_the_background(self):
        self.box.skill("gamma")
        result = self.box.run(wait=False)
        self.assertEqual(0, result.returncode, result.stdout + result.stderr)
        self.assertIn("Publishing continues in the background", result.stdout)
        self.assertTrue((self.box.shared / "gamma").is_dir())
        records = self.box.settle()
        self.assert_published()
        self.assertEqual(["ok"], [record["outcome"] for record in records])
        self.assertEqual(git(self.box.provider, "rev-parse", "HEAD"), records[-1]["commit"])

    def test_a_failed_background_push_is_recorded_warned_about_and_retried(self):
        self.box.run()
        git(self.box.provider, "remote", "set-url", "--push", "origin", "/nonexistent.git")
        self.box.skill("gamma")
        result = self.box.run(wait=False)
        self.assertEqual(0, result.returncode, result.stdout + result.stderr)
        self.assertEqual("failed", self.box.settle()[-1]["outcome"])
        head = git(self.box.provider, "rev-parse", "HEAD")
        self.assertNotEqual(head, git(self.box.remote("agent-skills"), "rev-parse", "main"))
        result = self.box.run(wait=False)
        self.assertEqual(0, result.returncode, result.stdout + result.stderr)
        self.assertTrue(result.stdout.startswith("Warning: the last publish"), result.stdout)
        self.assertEqual("failed", self.box.settle()[-1]["outcome"])
        git(self.box.provider, "remote", "set-url", "--push", "origin",
            str(self.box.remote("agent-skills")))
        self.assertEqual(0, self.box.run(wait=False).returncode)
        self.assertEqual("ok", self.box.settle()[-1]["outcome"])
        self.assert_published()
        self.assertNotIn("Warning", self.box.run(wait=False).stdout)

    def test_two_default_runs_back_to_back_leave_everything_published_and_clean(self):
        self.box.skill("gamma")
        first = self.box.run(wait=False)
        self.box.skill("delta")
        second = self.box.run(wait=False)
        self.assertEqual(0, first.returncode, first.stdout + first.stderr)
        self.assertEqual(0, second.returncode, second.stdout + second.stderr)
        records = self.box.settle()
        self.assert_published()
        self.assertEqual({"ok"}, {record["outcome"] for record in records})
        for checkout in (self.box.provider, self.box.consumer):
            self.assertEqual("", git(checkout, "status", "--porcelain"))
            git(checkout, "fsck", "--no-dangling")
        self.assertEqual(["alpha", "beta", "delta", "gamma"], self.installed())

    def test_wait_fails_the_run_when_the_remote_rejects_the_push(self):
        self.box.run()
        other = self.box.provider.parent / "other"
        git(other.parent, "clone", "-q", str(self.box.remote("agent-skills")), "other")
        (other / "theirs.txt").write_text("theirs\n")
        git(other, "add", "-A")
        git(other, "-c", "user.name=o", "-c", "user.email=o@example.invalid", "-c",
            "commit.gpgsign=false", "commit", "-qm", "theirs")
        git(other, "push", "-q", "origin", "main")
        theirs = git(other, "rev-parse", "HEAD")
        self.box.skill("gamma")
        result = self.box.run()
        self.assertNotEqual(0, result.returncode)
        self.assertIn("Stopped: push from", result.stderr)
        self.assertEqual(theirs, git(self.box.remote("agent-skills"), "rev-parse", "main"))
        self.assertEqual("failed", self.box.publishes()[-1]["outcome"])

    def test_an_unchanged_default_run_starts_no_publisher(self):
        self.box.run()
        before = self.box.publishes()
        result = self.box.run(wait=False)
        self.assertEqual(0, result.returncode, result.stdout + result.stderr)
        self.assertNotIn("Publishing continues", result.stdout)
        self.assertEqual(before, self.box.settle())

    def test_a_publisher_killed_before_recording_is_reported_and_the_next_run_warns(self):
        self.box.run()
        gate = self.box.block_pushes()
        self.box.skill("gamma")
        self.assertEqual(0, self.box.run(wait=False).returncode)
        for pid in self.box.publishers():
            os.killpg(pid, signal.SIGKILL)  # The publisher leads its own session, so this takes git too.
        self.box.settle()
        gate.unlink()
        self.assertEqual(1, len(self.box.publishes()))
        timings = self.box.run("--timings", wait=False).stdout
        self.assertIn("Unpublished: catalog", timings)
        self.assertIn("no publish is running", timings)
        result = self.box.run(wait=False)
        self.assertEqual(0, result.returncode, result.stdout + result.stderr)
        self.assertTrue(result.stdout.startswith("Warning: catalog"), result.stdout)
        self.assertEqual("ok", self.box.settle()[-1]["outcome"])
        self.assert_published()
        self.assertNotIn("Unpublished", self.box.run("--timings", wait=False).stdout)
        self.assertNotIn("Warning", self.box.run(wait=False).stdout)

    def test_timings_reports_a_publish_still_in_progress(self):
        self.box.run()
        gate = self.box.block_pushes()
        self.box.skill("gamma")
        self.assertEqual(0, self.box.run(wait=False).returncode)
        timings = self.box.run("--timings", wait=False).stdout
        gate.unlink()
        self.assertIn("a publish is in progress", timings)

    def test_wait_says_it_is_waiting_for_a_running_publisher_then_finishes(self):
        self.box.run()
        gate = self.box.block_pushes()
        self.addCleanup(gate.unlink, missing_ok=True)
        self.box.skill("gamma")
        self.assertEqual(0, self.box.run(wait=False).returncode)
        output = self.box.provider.parent / "wait.out"
        command, env = self.box.command("--wait")
        with output.open("w") as sink:
            waiting = subprocess.Popen(command, env=env, stdout=sink, stderr=subprocess.STDOUT)
        self.addCleanup(waiting.kill)
        deadline = time.monotonic() + 5
        while "Waiting for" not in output.read_text() and time.monotonic() < deadline:
            time.sleep(0.05)
        said = output.read_text()
        other = self.box.run(wait=False)
        gate.unlink()
        self.assertEqual(0, waiting.wait(timeout=10), output.read_text())
        self.assertIn("Waiting for the publish in progress", said)
        self.assertIn("Stopped: another install is running", other.stderr)
        self.box.settle()
        self.assert_published()

    def test_runs_during_a_slow_push_queue_one_publisher_and_record_only_real_pushes(self):
        self.box.run()
        gate = self.box.block_pushes()
        self.addCleanup(gate.unlink, missing_ok=True)
        for name in ("gamma", "delta", "epsilon", "zeta"):
            self.box.skill(name)
            result = self.box.run(wait=False)
            self.assertEqual(0, result.returncode, result.stdout + result.stderr)
            self.assertIn("Publishing continues in the background", result.stdout)
        self.assertLessEqual(len(self.box.publishers()), 2)
        gate.unlink()
        records = self.box.settle()
        self.assert_published()
        self.assertEqual({"ok"}, {record["outcome"] for record in records})
        self.assertNotIn({}, [record["pushes"] for record in records])

    def test_a_push_that_hangs_is_stopped_and_recorded_as_failed(self):
        self.box.run()
        self.box.block_pushes()  # Never released: the hook ends when the sandbox is removed.
        self.box.env["AGENT_SKILLS_PUSH_TIMEOUT"] = "1"
        self.box.skill("gamma")
        self.assertEqual(0, self.box.run(wait=False).returncode)
        record = self.box.settle()[-1]
        self.assertEqual("failed", record["outcome"])
        self.assertIn("timed out after 1s", record["error"])


class UnitTests(unittest.TestCase):
    def test_commit_message_is_a_function_of_the_staged_paths(self):
        self.assertEqual("feat(skills): update a, b",
                         install.commit_message(["skills/b/SKILL.md", "skills/a/x/y.md", "README.md"]))
        self.assertEqual("feat(skills): update 4 skills",
                         install.commit_message([f"skills/{n}/SKILL.md" for n in "abcd"]))
        self.assertEqual("chore: update catalog tooling", install.commit_message(["justfile"]))

    def test_stamp_adds_metadata_when_the_skill_has_none_and_keeps_folded_text(self):
        text = "---\nname: x\ndescription: >\n  folded\n  text\n---\nBody\n"
        stamped = install.stamp(text, "x", "c" * 40, "t" * 40)
        self.assertTrue(stamped.startswith("---\nname: x\ndescription: >\n  folded\n  text\nmetadata:\n"
                                           "    github-path: skills/x\n"))
        self.assertTrue(stamped.endswith(f"    github-tree-sha: {'t' * 40}\n---\nBody\n"))

    def test_stamp_refuses_metadata_it_cannot_reindent_safely(self):
        with self.assertRaisesRegex(install.Stop, "one `key: value` per line"):
            install.stamp("---\nname: x\nmetadata:\n  nested:\n    deep: 1\n---\n", "x", "c", "t")

    def test_run_summary_lists_steps_with_their_share(self):
        record = {"started": "2026-11-21T10:00:00+00:00", "outcome": "ok", "seconds": 2.0,
                  "spans": [{"step": "commit", "seconds": 0.5, "ok": True},
                            {"step": "push dotfiles", "seconds": 1.0, "ok": True}]}
        lines = install.format_run(record).splitlines()
        self.assertEqual("2.00s total (ok)", lines[0])
        self.assertRegex(lines[2], r"1\.000s\s+50%\s+push dotfiles")
        self.assertRegex(lines[3], r"0\.500s\s+25%\s+everything else")
        header, row = install.format_history([record]).splitlines()
        self.assertIn("push dotfiles", header)
        self.assertTrue(row.rstrip().endswith("1.000"))


if __name__ == "__main__":
    unittest.main()
