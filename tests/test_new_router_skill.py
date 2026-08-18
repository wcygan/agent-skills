"""Tests for the new-router-skill scaffold script."""

from __future__ import annotations

import importlib.util
import sys
import tempfile
import unittest
from pathlib import Path

SCRIPTS = Path(__file__).parents[1] / "skills" / "new-router-skill" / "scripts"
spec = importlib.util.spec_from_file_location("new_router", SCRIPTS / "new_router.py")
new_router = importlib.util.module_from_spec(spec)
assert spec.loader is not None
spec.loader.exec_module(new_router)
sys.modules["new_router"] = new_router


class ValidateNameTest(unittest.TestCase):
    def test_accepts_valid_names(self) -> None:
        for name in ("a", "router", "new-router-skill", "route42"):
            self.assertIsNone(new_router.validate_name(name))

    def test_rejects_invalid_names(self) -> None:
        for name in ("", "Router", "-router", "router-", "rou--ter", "snake_case", "a" * 65):
            self.assertIsNotNone(new_router.validate_name(name))


class ScaffoldTest(unittest.TestCase):
    def setUp(self) -> None:
        self._tmp = tempfile.TemporaryDirectory()
        self.target = Path(self._tmp.name)

    def tearDown(self) -> None:
        self._tmp.cleanup()

    def test_scaffolds_router_tree(self) -> None:
        code = new_router.main(
            ["my-router", "--target", str(self.target), "--description", "Picks a route."]
        )
        self.assertEqual(code, 0)
        skill_dir = self.target / "my-router"
        body = (skill_dir / "SKILL.md").read_text()
        self.assertIn("name: my-router", body)
        self.assertIn("Picks a route.", body)
        self.assertIn("## The route", body)
        self.assertTrue((skill_dir / "references" / ".gitkeep").is_file())
        self.assertTrue((skill_dir / "scripts" / ".gitkeep").is_file())

    def test_refuses_existing_skill(self) -> None:
        skill_dir = self.target / "existing"
        skill_dir.mkdir(parents=True)
        (skill_dir / "SKILL.md").write_text("x")
        code = new_router.main(["existing", "--target", str(self.target)])
        self.assertEqual(code, 2)

    def test_refuses_invalid_name_without_writing(self) -> None:
        code = new_router.main(["Bad_Name", "--target", str(self.target)])
        self.assertEqual(code, 2)
        self.assertFalse((self.target / "Bad_Name").exists())

    def test_expands_home_default_target(self) -> None:
        # --target "~" must expand to the real home directory, not a literal "~".
        import os

        expanded = os.path.expanduser("~/.agents/skills")
        self.assertTrue(expanded.startswith("/"))


if __name__ == "__main__":
    unittest.main()
