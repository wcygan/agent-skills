from __future__ import annotations

import argparse
import os
import subprocess
import sys
import unittest
from pathlib import Path

from tools import sync_skills


ROOT = Path(__file__).resolve().parents[1]


class SyncSkillsCharacterizationTests(unittest.TestCase):
    def test_positive_int_accepts_one(self) -> None:
        self.assertEqual(sync_skills.positive_int("1"), 1)

    def test_positive_int_rejects_zero(self) -> None:
        with self.assertRaisesRegex(argparse.ArgumentTypeError, "must be at least 1"):
            sync_skills.positive_int("0")

    def test_provider_manifests_are_excluded_case_insensitively(self) -> None:
        names = ["SKILL.md", "openai.yaml", "OPENAI.YML", "notes.md"]

        self.assertEqual(
            sync_skills.exclude_provider_manifests("ignored", names),
            {"openai.yaml", "OPENAI.YML"},
        )

    def test_frontmatter_normalization_removes_selected_top_level_fields(self) -> None:
        text = "---\nname: demo\nmodel: old\nmetadata:\n  model: nested\n---\nBody\n"

        normalized = sync_skills.normalize_frontmatter(
            text,
            {"remove_frontmatter": ["model"]},
        )

        self.assertEqual(
            normalized,
            "---\nname: demo\nmetadata:\n  model: nested\n---\nBody\n",
        )

    def test_check_output_keeps_current_text_without_color(self) -> None:
        self.assertEqual(
            sync_skills.format_check_result("example/repo", "abc", "def", False),
            "[UPDATE AVAILABLE] example/repo: locked abc, available def",
        )

    def test_validate_command_keeps_current_success_output(self) -> None:
        result = subprocess.run(
            [sys.executable, "tools/sync_skills.py", "validate"],
            cwd=ROOT,
            env={**os.environ, "NO_COLOR": "1"},
            check=True,
            text=True,
            capture_output=True,
        )

        self.assertEqual(result.stdout, "validated 42 vendored skills\n")


if __name__ == "__main__":
    unittest.main()
