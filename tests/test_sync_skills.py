from __future__ import annotations

import argparse
import os
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from skill_catalog import vendor

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

        count = sum(len(source["skills"]) for source in sync_skills.load_lock()["sources"])
        self.assertEqual(result.stdout, f"validated {count} vendored skills\n")

    def test_root_skill_import_is_selective_pinned_and_preserves_license(self) -> None:
        source = {
            "repository": "example/repo",
            "branch": "main",
            "ref": "pinned-revision",
            "skills_root": ".",
            "skills": {".": "demo"},
            "include": ["SKILL.md"],
            "license_files": {"LICENSE": "references/LICENSE"},
            "supplemental_files": {"NOTICE": "references/NOTICE"},
        }

        def clone(source: dict, checkout: Path, ref: str) -> str:
            self.assertEqual(ref, "pinned-revision")
            checkout.mkdir()
            (checkout / "SKILL.md").write_text("---\nname: demo\ndescription: Demo\n---\nBody\n")
            (checkout / "LICENSE").write_text("Copyright and permission notice\n")
            (checkout / ".git").mkdir()
            (checkout / "README.md").write_text("Repository infrastructure\n")
            return ref

        with tempfile.TemporaryDirectory() as scratch:
            skills = Path(scratch)
            (skills / "NOTICE").write_text("Bundled resource notice\n")
            with patch.object(vendor, "SKILLS_DIR", skills), patch.object(vendor, "ROOT", skills), patch.object(vendor, "clone_source", clone):
                vendor.sync_source(source, update_lock=False)
            target = skills / "demo"
            self.assertTrue((target / "SKILL.md").is_file())
            self.assertFalse((target / ".git").exists())
            self.assertFalse((target / "README.md").exists())
            self.assertEqual((target / "references/LICENSE").read_text(), "Copyright and permission notice\n")
            self.assertEqual((target / "references/NOTICE").read_text(), "Bundled resource notice\n")
            self.assertIn("revision=pinned-revision", (target / ".vendored").read_text())

    def test_root_skill_attribution_uses_original_path(self) -> None:
        with tempfile.TemporaryDirectory() as scratch:
            attribution = Path(scratch) / "ATTRIBUTIONS.md"
            with patch.object(vendor, "ATTRIBUTIONS_PATH", attribution):
                vendor.write_attributions({"sources": [{
                    "repository": "example/repo", "ref": "abc", "license": "MIT",
                    "skills_root": ".", "skills": {".": "demo"},
                }]})
            self.assertIn("`demo` from `.`", attribution.read_text())


if __name__ == "__main__":
    unittest.main()
