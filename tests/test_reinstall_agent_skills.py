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
    def exercise_workflow(self, failed_gate=None):
        with tempfile.TemporaryDirectory() as directory:
            provider = Path(directory).resolve() / "provider"
            consumer = Path(directory).resolve() / "consumer"
            provider.mkdir()
            consumer.mkdir()
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
                    patch.object(reinstall.sys, "argv", ["reinstall.py", "--dotfiles", str(consumer)]), \
                    patch.object(reinstall, "preflight", return_value="main"), \
                    patch.object(reinstall, "git", side_effect=git_result), \
                    patch.object(reinstall, "run", side_effect=command_result) as run, \
                    patch.object(reinstall, "commit_if_changed") as commit, \
                    patch.object(reinstall, "update_pin") as pin, \
                    patch.object(reinstall.subprocess, "run", return_value=subprocess.CompletedProcess([], 0)), \
                    patch("builtins.print"):
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
