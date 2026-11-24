"""The standalone Mermaid style check accepts a styled flowchart and names each fix."""
import importlib.util
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.dont_write_bytecode = True  # keep __pycache__ out of the distributable skill
SKILL = ROOT / "skills/visual-explainer"
SPEC = importlib.util.spec_from_file_location(
    "check_style", SKILL / "scripts/check_style.py")
check_style = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(check_style)

STYLED = """flowchart TD
  read[Read (both) checkouts] -->|changes found: add (all)| commit[Catalog commit]
  commit --> check{Anything left to do?}
  check -->|yes| halt[Stop]
  check -.->|no| hub[(GitHub)]
  classDef inspect fill:#c3e0ff,stroke:#1680f3,color:#1c1c1c
  classDef record fill:#e3d5ff,stroke:#9b35d6,color:#1c1c1c
  class read,check inspect
  class commit,halt record
  hub:::record
"""


class StyleCheckTests(unittest.TestCase):
    def test_a_styled_flowchart_passes(self):
        self.assertEqual(check_style.problems(STYLED), [])

    def test_the_skill_palette_passes_its_own_check(self):
        skill = (SKILL / "references/mermaid.md").read_text()
        palette = [line.strip() for line in skill.splitlines()
                   if line.strip().startswith("classDef ")]
        names = [line.split()[1] for line in palette]
        self.assertEqual(len(names), 5)
        nodes = "\n".join(f"  n{i}[Part]" for i in range(len(names)))
        classes = "\n".join(f"  class n{i} {name}" for i, name in enumerate(names))
        self.assertEqual(
            check_style.problems("flowchart LR\n" + nodes + "\n" + "\n".join(palette) + "\n" + classes),
            [])

    def test_an_uncolored_part_is_named(self):
        found = check_style.problems(STYLED.replace("  hub:::record\n", ""))
        self.assertEqual(found, ["hub has no color: add it to a `class hub <kind>` line"])

    def test_a_node_only_named_in_an_edge_needs_a_color(self):
        found = check_style.problems(STYLED + "  commit --o extra\n")
        self.assertEqual(found, ["extra has no color: add it to a `class extra <kind>` line"])

    def test_a_question_must_be_a_diamond_and_a_diamond_a_question(self):
        found = check_style.problems(
            STYLED.replace("check{Anything left to do?}", "check[Anything left to do?]")
            .replace("halt[Stop]", "halt{Stop}"))
        self.assertEqual(len(found), 2)
        self.assertIn("check asks a question", found[0])
        self.assertIn("halt is a diamond", found[1])

    def test_a_class_needs_fill_stroke_and_color(self):
        found = check_style.problems(STYLED.replace(",stroke:#9b35d6,color:#1c1c1c", ""))
        self.assertEqual(len(found), 1)
        self.assertIn("classDef record lacks stroke, color", found[0])

    def test_one_color_for_every_part_fails(self):
        found = check_style.problems(STYLED.replace("class commit,halt record", "class commit,halt inspect")
                                     .replace("hub:::record", "hub:::inspect"))
        self.assertTrue(any("same color" in line for line in found))

    def test_other_diagram_kinds_pass_unchecked(self):
        self.assertEqual(check_style.problems("sequenceDiagram\n  A->>B: hi\n"), [])


if __name__ == "__main__":
    unittest.main()
