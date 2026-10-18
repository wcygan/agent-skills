"""Keep the README's catalog index and headline counts in step with skills/."""
import re
import unittest
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
README = (ROOT / "README.md").read_text()
HEADLINE = {
    "orchestrator": r"(\d+) orchestrator",
    "principle": r"(\d+) engineering principles",
    "component": r"(\d+) focused components",
    "procedure": r"(\d+) procedural skills",
    "specialist": r"(\d+) specialist skills",
}


def kinds() -> dict[str, str]:
    result = {}
    for entry in sorted((ROOT / "skills").iterdir()):
        frontmatter = (entry / "SKILL.md").read_text().split("---")[1]
        match = re.search(r"^  kind: (\S+)$", frontmatter, re.MULTILINE)
        result[entry.name] = match.group(1) if match else "specialist"
    return result


class ReadmeCatalogTests(unittest.TestCase):
    def test_every_non_principle_skill_is_listed(self):
        missing = [name for name, kind in kinds().items()
                   if kind != "principle" and f"(skills/{name}/SKILL.md)" not in README]
        self.assertEqual([], missing, "add these skills to a README table")

    def test_every_listed_skill_exists(self):
        listed = set(re.findall(r"\(skills/([a-z0-9-]+)/SKILL\.md\)", README))
        self.assertEqual(set(), listed - set(kinds()))

    def test_headline_counts_match_frontmatter(self):
        headline = README.split("\n\n")[1]
        counts = Counter(kinds().values())
        self.assertEqual(set(HEADLINE), set(counts), "classify every skill kind in the headline")
        for kind, pattern in HEADLINE.items():
            with self.subTest(kind=kind):
                match = re.search(pattern, headline)
                self.assertIsNotNone(match, f"headline lacks a {kind} count")
                self.assertEqual(counts[kind], int(match.group(1)))
