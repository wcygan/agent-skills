"""Focused checks for exact pin replacement and no-op reruns."""
import importlib.util
import tempfile
import unittest
from pathlib import Path

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
