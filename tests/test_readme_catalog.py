"""Verify catalog discovery and navigation from the public entrypoints."""
import re
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MODE = ROOT / "skills/wcygan-mode"


class ReadmeCatalogTests(unittest.TestCase):
    def test_catalog_guide_and_playbook_links_resolve(self):
        sources = [ROOT / "README.md", MODE / "SKILL.md", *MODE.glob("playbooks/*.md")]
        for source in sources:
            for link in re.findall(r"\]\(((?:skills/|playbooks/|references/|\.\.?/)[^\s)]+|[a-z-]+\.md)\)",
                                   source.read_text(encoding="utf-8")):
                with self.subTest(source=source.relative_to(ROOT), link=link):
                    self.assertTrue((source.parent / link.split("#", 1)[0]).exists())

    def test_readme_entrypoints_match_discovery(self):
        guide = (ROOT / "README.md").read_text(encoding="utf-8").split("## Replacements")[0]
        linked = set(re.findall(r"\]\(skills/([^/]+)/SKILL\.md\)", guide))
        self.assertEqual(linked, {p.parent.name for p in (ROOT / "skills").glob("*/SKILL.md")})

    def test_methods_are_reachable_with_only_mode_installed(self):
        pending = [MODE / "SKILL.md"]
        visited = set()
        while pending:
            source = pending.pop()
            if source in visited:
                continue
            visited.add(source)
            for link in re.findall(r"\]\(([^\s)#]+\.md)(?:#[^)]*)?\)", source.read_text(encoding="utf-8")):
                if "://" in link:
                    continue
                target = (source.parent / link).resolve()
                with self.subTest(source=source.relative_to(MODE), link=link):
                    self.assertTrue(target.is_relative_to(MODE) and target.is_file())
                if target.is_relative_to(MODE) and target.is_file():
                    pending.append(target)
        methods = set((MODE / "references/methods").glob("*.md"))
        self.assertFalse(methods - visited, f"Unreachable methods: {methods - visited}")

    def test_every_playbook_is_reachable_from_mode(self):
        entrypoint = (MODE / "SKILL.md").read_text(encoding="utf-8")
        linked = set(re.findall(r"\]\(playbooks/([a-z-]+\.md)\)", entrypoint))
        self.assertEqual(linked, {path.name for path in MODE.glob("playbooks/*.md")})
