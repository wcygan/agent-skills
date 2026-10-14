"""Keep the standalone principle catalog and workflow routing distributable."""

import importlib.util
from pathlib import Path
import re
import unittest

from skill_catalog.catalog import generate_snapshot


ROOT = Path(__file__).resolve().parents[1]
INDEX = ROOT / "skills/wcygan-mode/references/principles.md"
SPEC = importlib.util.spec_from_file_location("principle_parity", ROOT / "tools/check_principle_parity.py")
PARITY = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(PARITY)


def links(path: Path) -> list[Path]:
    return [
        (path.parent / target.split("#", 1)[0]).resolve()
        for target in re.findall(r"\[[^\]]*\]\(([^)]+)\)", path.read_text())
        if not target.startswith(("https://", "http://", "#"))
    ]


class PrincipleCatalogTests(unittest.TestCase):
    def test_index_and_distribution_cover_the_pinned_source_catalog(self) -> None:
        expected = {f"principle-{name}" for name in PARITY.NAMES}
        discovered = {name for name in generate_snapshot(ROOT)["skills"] if name.startswith("principle-")}
        indexed = [path.parent.name for path in links(INDEX) if path.name == "SKILL.md"]
        self.assertEqual(discovered, expected)
        self.assertCountEqual(indexed, expected)

    def test_every_workflow_entrypoint_links_the_same_index(self) -> None:
        workflows = [
            path for path in (ROOT / "skills").glob("*/SKILL.md")
            if re.search(r"^  kind: (orchestrator|procedure)$", path.read_text(), re.MULTILINE)
        ]
        self.assertTrue(workflows)
        for path in workflows:
            with self.subTest(workflow=path.parent.name):
                self.assertIn(INDEX.resolve(), links(path))

    def test_leaf_provenance_and_license_survive_individual_distribution(self) -> None:
        for name in PARITY.NAMES:
            folder = ROOT / "skills" / f"principle-{name}"
            text = (folder / "SKILL.md").read_text()
            with self.subTest(principle=name):
                self.assertEqual(re.search(r"^name: (.+)$", text, re.MULTILINE)[1], folder.name)
                self.assertEqual(re.search(r"^  upstream-path: (.+)$", text, re.MULTILINE)[1], f"pstack/skills/{folder.name}")
                self.assertEqual(re.search(r"^  upstream-revision: (.+)$", text, re.MULTILINE)[1], PARITY.REVISION)
                license_path = folder / "references/LICENSE.txt"
                self.assertIn(license_path.resolve(), links(folder / "SKILL.md"))
                self.assertEqual(license_path.read_bytes(), (ROOT / "skills/wcygan-mode/references/LICENSE.txt").read_bytes())

    def test_principle_links_resolve_inside_the_distributed_catalog(self) -> None:
        paths = [INDEX, INDEX.with_name("parity.md")]
        paths.extend(ROOT / "skills" / f"principle-{name}" / "SKILL.md" for name in PARITY.NAMES)
        for path in paths:
            for target in links(path):
                with self.subTest(source=path.relative_to(ROOT), target=target):
                    self.assertTrue(target.is_file(), f"unavailable dependency: {target}")
                    self.assertTrue(target.is_relative_to(ROOT / "skills"), f"dependency outside distribution: {target}")


if __name__ == "__main__":
    unittest.main()
