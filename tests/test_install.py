"""End-to-end checks of tools/install.py against real git repositories in a temp home."""
import importlib.util
import os
import subprocess
import tempfile
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

    def run(self, *flags: str) -> subprocess.CompletedProcess:
        env = {**os.environ, "HOME": str(self.home), "GIT_SSH_COMMAND": "ssh"}
        # The snapshot refresh belongs to the real catalog; the sandbox has no tools/catalog.py.
        return subprocess.run(
            ["python3", "-c",
             "import runpy, subprocess, sys\n"
             "real = subprocess.run\n"
             "subprocess.run = lambda cmd, *a, **k: (subprocess.CompletedProcess(cmd, 0) "
             "if cmd[:1] == ['uv'] else real(cmd, *a, **k))\n"
             f"sys.argv = ['install.py', '--dotfiles', {str(self.consumer)!r}, *sys.argv[1:]]\n"
             f"runpy.run_path({str(self.provider / 'tools' / 'install.py')!r}, run_name='__main__')",
             *flags], env=env, text=True, capture_output=True)

    def pin(self) -> str:
        return git(self.consumer, "show", "origin/main:agent-skills.lock.toml").split('commit = "')[1][:40]


class InstallTests(unittest.TestCase):
    def setUp(self):
        directory = tempfile.TemporaryDirectory()
        self.addCleanup(directory.cleanup)
        self.box = Sandbox(Path(directory.name).resolve())

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
