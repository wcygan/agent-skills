"""Focused checks for publication gates, exact pin replacement, and no-op reruns."""
import importlib.util
import subprocess
import tempfile
import unittest
from pathlib import Path
from unittest.mock import Mock, call, patch

SPEC = importlib.util.spec_from_file_location(
    "reinstall", Path(__file__).resolve().parents[1] / "tools/reinstall_agent_skills.py"
)
reinstall = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(reinstall)


class PinTests(unittest.TestCase):
    def test_exact_pin_and_noop(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "agent-skills.lock.toml"
            path.write_text('repository = "wcygan/agent-skills"\n'
                            'directory = ".agents/skills"\n'
                            f'commit = "{"a" * 40}"\n')
            reinstall.update_pin(path, "b" * 40)
            self.assertIn(f'commit = "{"b" * 40}"', path.read_text())
            before = path.stat().st_mtime_ns
            reinstall.update_pin(path, "b" * 40)
            self.assertEqual(before, path.stat().st_mtime_ns)

    def test_foreign_source_unchanged(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "lock.toml"
            original = 'repository = "other/skills"\ndirectory = ".agents/skills"\n'
            path.write_text(original)
            with self.assertRaises(ValueError):
                reinstall.update_pin(path, "b" * 40)
            self.assertEqual(original, path.read_text())


class PublicationTests(unittest.TestCase):
    def exercise_workflow(self, failed_gate=None, *, reset_global=False, check_returncode=0,
                          apply=True):
        with tempfile.TemporaryDirectory() as directory:
            provider = Path(directory).resolve() / "provider"
            consumer = Path(directory).resolve() / "consumer"
            provider.mkdir()
            consumer.mkdir()
            (consumer / "agent-skills.lock.toml").write_text(f'commit = "{"b" * 40}"\n')
            sha = "a" * 40

            def git_result(root, *args):
                if args == ("rev-parse", "--git-path", "reinstall-agent-skills.lock"):
                    return str(provider / "reinstall-agent-skills.lock")
                if args == ("status", "--porcelain"):
                    return ""
                return sha

            def command_result(root, *args):
                if args == ("just", failed_gate):
                    raise subprocess.CalledProcessError(1, args)

            events = Mock()
            with patch.object(reinstall, "__file__", str(provider / "tools" / "reinstall.py")), \
                    patch.object(reinstall.sys, "argv", ["reinstall.py", "--dotfiles", str(consumer)]
                                 + (["--reset-global"] if reset_global else [])
                                 + (["--apply"] if apply else [])), \
                    patch.object(reinstall, "preflight", return_value="main"), \
                    patch.object(reinstall, "git", side_effect=git_result), \
                    patch.object(reinstall, "run", side_effect=command_result) as run, \
                    patch.object(reinstall, "commit_if_changed") as commit, \
                    patch.object(reinstall, "update_pin") as pin, \
                    patch.object(reinstall.subprocess, "run",
                                 return_value=subprocess.CompletedProcess([], check_returncode)) as raw, \
                    patch("builtins.print"):
                events.attach_mock(raw, "raw")
                events.attach_mock(run, "run")
                events.attach_mock(commit, "commit")
                events.attach_mock(pin, "pin")
                if failed_gate:
                    with self.assertRaises(subprocess.CalledProcessError):
                        reinstall.main()
                else:
                    reinstall.main()
            return provider, consumer, sha, events.mock_calls

    def test_snapshot_and_validation_precede_publication(self):
        provider, consumer, sha, events = self.exercise_workflow()
        self.assertEqual(events[:5], [
            call.run(provider, "just", "catalog-snapshot"),
            call.run(provider, "just", "check-full"),
            call.commit(provider, "chore(skills): publish current catalog", "."),
            call.run(provider, "git", "push", "origin", "HEAD:refs/heads/main"),
            call.run(consumer, "git", "pull", "--ff-only", "origin", "main"),
        ])
        self.assertEqual(events[5], call.pin(consumer / "agent-skills.lock.toml", sha))

    def test_failed_gate_stops_before_commit_push_or_pin_update(self):
        for gate in ("catalog-snapshot", "check-full"):
            with self.subTest(gate=gate):
                provider, _, _, events = self.exercise_workflow(failed_gate=gate)
                expected = [call.run(provider, "just", "catalog-snapshot")]
                if gate == "check-full":
                    expected.append(call.run(provider, "just", "check-full"))
                self.assertEqual(events, expected)

    def test_requested_reset_runs_even_when_existing_pin_checks_pass(self):
        _, consumer, _, events = self.exercise_workflow(reset_global=True)
        self.assertIn(call.run(consumer, "./bootstrap.sh", "agent-skills", "--reset", "--yes"),
                      events)
        self.assertNotIn(call.run(consumer, "./bootstrap.sh", "agent-skills", "--prune"), events)

    def test_failed_catalog_check_uses_provider_only_pruning(self):
        _, consumer, _, events = self.exercise_workflow(check_returncode=1)
        self.assertIn(call.run(consumer, "./bootstrap.sh", "agent-skills", "--prune"), events)
        self.assertNotIn(call.run(consumer, "./bootstrap.sh", "agent-skills", "--reset", "--yes"),
                         events)

    def test_dry_run_is_the_default_and_changes_nothing(self):
        provider, consumer, _, events = self.exercise_workflow(apply=False)
        self.assertEqual(events, [
            call.raw(["./bootstrap.sh", "agent-skills", "--check"], cwd=consumer),
        ])


class PreflightTests(unittest.TestCase):
    def preflight_on(self, branch):
        root = Path("/repo")
        answers = {
            ("rev-parse", "--show-toplevel"): "/repo",
            ("symbolic-ref", "--short", "HEAD"): branch,
            ("symbolic-ref", "--short", "refs/remotes/origin/HEAD"): "origin/main",
            ("rev-parse", "--abbrev-ref", "@{upstream}"): f"origin/{branch}",
        }
        with patch.object(reinstall, "git",
                          side_effect=lambda _, *args: answers.get(args, "/missing/marker")), \
                patch.object(reinstall.Path, "resolve", lambda self: self):
            return reinstall.preflight(root)

    def test_default_branch_passes(self):
        self.assertEqual("main", self.preflight_on("main"))

    def test_feature_branch_is_refused(self):
        with self.assertRaisesRegex(ValueError, "on feature; publish only from main"):
            self.preflight_on("feature")


class ConsumerPathTests(unittest.TestCase):
    def test_worktree_defaults_to_dotfiles_beside_main_checkout(self):
        with tempfile.TemporaryDirectory() as directory:
            development = Path(directory).resolve()
            provider = development / "agent-skills" / ".claude" / "worktrees" / "w"
            consumer = development / "dotfiles"
            seen = []

            def git_result(root, *args):
                if args == ("rev-parse", "--path-format=absolute", "--git-common-dir"):
                    return str(development / "agent-skills" / ".git")
                if args == ("rev-parse", "--git-path", "reinstall-agent-skills.lock"):
                    return str(development / "lock")
                raise ValueError("stop")

            with patch.object(reinstall, "__file__", str(provider / "tools" / "reinstall.py")), \
                    patch.object(reinstall.sys, "argv", ["reinstall.py"]), \
                    patch.object(reinstall, "git", side_effect=git_result), \
                    patch.object(reinstall, "preflight",
                                 side_effect=lambda root: seen.append(root) or "main"), \
                    patch("builtins.print"):
                with self.assertRaisesRegex(ValueError, "stop"):
                    reinstall.main()
            self.assertEqual([provider, consumer], seen)
