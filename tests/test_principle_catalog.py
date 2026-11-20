"""Keep the standalone principle catalog and workflow routing distributable."""

from pathlib import Path
import re
import unittest

from skill_catalog.catalog import generate_snapshot


ROOT = Path(__file__).resolve().parents[1]
INDEX = ROOT / "skills/wcygan-mode/references/principles.md"
# The Pstack revision every principle leaf records as its source. See docs/pstack-parity.md.
REVISION = "afd51cf66a3100a95f878d6c4b93a01f6508e3b0"
NAMES = (
    "attack-the-premise",
    "boundary-discipline",
    "build-the-lever",
    "encode-lessons-in-structure",
    "exhaust-the-design-space",
    "experience-first",
    "explain-the-number",
    "fix-root-causes",
    "foundational-thinking",
    "guard-the-context-window",
    "laziness-protocol",
    "make-operations-idempotent",
    "migrate-callers-then-delete-legacy-apis",
    "minimize-reader-load",
    "model-the-domain",
    "never-block-on-the-human",
    "outcome-oriented-execution",
    "prove-it-works",
    "redesign-from-first-principles",
    "separate-before-serializing-shared-state",
    "sequence-verifiable-units",
    "subtract-before-you-add",
    "test-behavior-not-implementation",
    "type-system-discipline",
)


def links(path: Path) -> list[Path]:
    return [
        (path.parent / target.split("#", 1)[0]).resolve()
        for target in re.findall(r"\[[^\]]*\]\(([^)]+)\)", path.read_text())
        if not target.startswith(("https://", "http://", "#"))
    ]


class PrincipleCatalogTests(unittest.TestCase):
    def test_index_and_distribution_cover_the_pinned_source_catalog(self) -> None:
        expected = {f"principle-{name}" for name in NAMES}
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
        for name in NAMES:
            folder = ROOT / "skills" / f"principle-{name}"
            text = (folder / "SKILL.md").read_text()
            with self.subTest(principle=name):
                self.assertEqual(re.search(r"^name: (.+)$", text, re.MULTILINE)[1], folder.name)
                self.assertEqual(re.search(r"^  upstream-path: (.+)$", text, re.MULTILINE)[1], f"pstack/skills/{folder.name}")
                self.assertEqual(re.search(r"^  upstream-revision: (.+)$", text, re.MULTILINE)[1], REVISION)
                license_path = folder / "references/LICENSE.txt"
                self.assertIn(license_path.resolve(), links(folder / "SKILL.md"))
                self.assertTrue(text.endswith(
                    "Adapted from pstack; [license and attribution](references/LICENSE.txt).\n"))
                self.assertEqual(license_path.read_bytes(), (ROOT / "skills/wcygan-mode/references/LICENSE.txt").read_bytes())

    def test_principle_links_resolve_inside_the_distributed_catalog(self) -> None:
        paths = [INDEX]
        paths.extend(ROOT / "skills" / f"principle-{name}" / "SKILL.md" for name in NAMES)
        for path in paths:
            for target in links(path):
                with self.subTest(source=path.relative_to(ROOT), target=target):
                    self.assertTrue(target.is_file(), f"unavailable dependency: {target}")
                    self.assertTrue(target.is_relative_to(ROOT / "skills"), f"dependency outside distribution: {target}")


if __name__ == "__main__":
    unittest.main()
