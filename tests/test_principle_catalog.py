"""Keep all principle rules discoverable inside the wcygan-mode bundle."""

from pathlib import Path
import re
import unittest

from skill_catalog.catalog import generate_snapshot


ROOT = Path(__file__).resolve().parents[1]
MODE = ROOT / "skills/wcygan-mode"
INDEX = MODE / "references/principles.md"
RULES = INDEX.parent / "principles"
LICENSE = INDEX.parent / "LICENSE.txt"
# The Pstack revision recorded for each principle. See docs/pstack-parity.md.
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
        for target in re.findall(r"\[[^\]]*\]\(([^)]+)\)", path.read_text(encoding="utf-8"))
        if not target.startswith(("https://", "http://", "#"))
    ]


class PrincipleCatalogTests(unittest.TestCase):
    def test_index_and_bundle_cover_the_source_catalog(self) -> None:
        expected = {RULES / f"principle-{name}.md" for name in NAMES}
        snapshot = generate_snapshot(ROOT)
        self.assertIn("wcygan-mode", snapshot["skills"])
        self.assertFalse(any(name.startswith("principle-") for name in snapshot["skills"]))
        self.assertEqual(set(RULES.glob("*.md")), expected)
        self.assertCountEqual(
            [path for path in links(INDEX) if path.parent == RULES],
            expected,
        )

    def test_mode_entrypoint_links_the_index(self) -> None:
        self.assertIn(INDEX, links(MODE / "SKILL.md"))

    def test_rule_provenance_and_shared_license(self) -> None:
        self.assertIn("Copyright (c) 2026 Lauren Tan", LICENSE.read_text(encoding="utf-8"))
        for name in NAMES:
            rule = RULES / f"principle-{name}.md"
            with self.subTest(principle=name):
                self.assertIn(
                    f"https://github.com/cursor/plugins/tree/{REVISION}/pstack/skills/principle-{name}",
                    rule.read_text(encoding="utf-8"),
                )
                self.assertIn(LICENSE, links(rule))

    def test_principle_links_resolve_inside_the_mode_bundle(self) -> None:
        for path in [INDEX, *RULES.glob("*.md")]:
            for target in links(path):
                with self.subTest(source=path.relative_to(ROOT), target=target):
                    self.assertTrue(target.is_file(), f"unavailable dependency: {target}")
                    self.assertTrue(target.is_relative_to(MODE), f"dependency outside bundle: {target}")

    def test_documented_rule_links_resolve(self) -> None:
        docs = ROOT / "docs/pstack-principles.md"
        self.assertCountEqual(
            [path for path in links(docs) if path.parent == RULES],
            RULES.glob("*.md"),
        )
        for target in links(docs):
            with self.subTest(target=target):
                self.assertTrue(target.is_file(), f"unavailable link: {target}")


if __name__ == "__main__":
    unittest.main()
