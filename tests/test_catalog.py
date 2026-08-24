from __future__ import annotations

import json
import shutil
import subprocess
import tempfile
import unittest
from pathlib import Path

from skill_catalog import catalog


def write_json(path: Path, value: object) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, indent=2, sort_keys=True) + "\n")


def run_git(root: Path, *args: str) -> str:
    result = subprocess.run(
        ("git", *args),
        cwd=root,
        check=True,
        text=True,
        capture_output=True,
    )
    return result.stdout.strip()


class CatalogRepository:
    def __init__(self, root: Path) -> None:
        self.root = root
        (root / "skills" / "base").mkdir(parents=True)
        (root / "skills" / "base" / "SKILL.md").write_text("---\nname: base\ndescription: Base.\n---\nBase.\n")
        (root / "skills" / "base" / ".vendored").write_text(
            "source=example/upstream\nupstream_skill=base\nrevision=0123456789012345678901234567890123456789\n"
        )
        (root / "tool.txt").write_text("version one\n")
        write_json(
            root / catalog.SEED_NAME,
            {"schema": 1, "repository": str(root), "tracking_ref": "main"},
        )
        write_json(
            root / catalog.PROJECTION_NAME,
            {
                "schema": 1,
                "managed_paths": [
                    catalog.PROJECTION_NAME,
                    "tool.txt",
                ],
            },
        )
        catalog.snapshot(root, check=False)
        run_git(root, "init", "-b", "main")
        run_git(root, "config", "user.email", "tests@example.com")
        run_git(root, "config", "user.name", "Catalog Tests")
        self.revision_one = self.commit("initial catalog")

    def commit(self, message: str) -> str:
        run_git(self.root, "add", ".")
        run_git(self.root, "commit", "-m", message)
        return run_git(self.root, "rev-parse", "HEAD")

    def update(self) -> str:
        (self.root / "skills" / "base" / "SKILL.md").write_text(
            "---\nname: base\ndescription: Base.\n---\nBase version two.\n"
        )
        (self.root / "skills" / "added").mkdir()
        (self.root / "skills" / "added" / "SKILL.md").write_text(
            "---\nname: added\ndescription: Added.\n---\nAdded.\n"
        )
        (self.root / "tool.txt").write_text("version two\n")
        catalog.snapshot(self.root, check=False)
        revision = self.commit("update catalog")
        run_git(self.root, "tag", "v2.0.0", revision)
        return revision

    def copy_without_git(self, destination: Path) -> None:
        shutil.copytree(self.root, destination, ignore=shutil.ignore_patterns(".git"))


class CatalogTests(unittest.TestCase):
    def setUp(self) -> None:
        self.temporary = tempfile.TemporaryDirectory(prefix="catalog-tests-")
        self.root = Path(self.temporary.name)
        self.parent = CatalogRepository(self.root / "parent")

    def tearDown(self) -> None:
        self.temporary.cleanup()

    def adopt_child(self, name: str, *, initialize_git: bool = False) -> Path:
        child = self.root / name
        self.parent.copy_without_git(child)
        if initialize_git:
            run_git(child, "init", "-b", "main")
        resolved = catalog.adopt(
            child,
            repository=str(self.parent.root),
            revision=self.parent.revision_one,
            tracking_ref="main",
        )
        self.assertEqual(resolved, self.parent.revision_one)
        return child

    def test_archive_without_git_can_adopt_and_verify(self) -> None:
        child = self.adopt_child("archive")

        self.assertFalse((child / ".git").exists())
        lock, manifest = catalog.verify_child(child)
        self.assertEqual(lock["parent"]["revision"], self.parent.revision_one)
        self.assertEqual(set(manifest["skills"]), {"base"})
        self.assertTrue((child / "skills" / "base" / ".vendored").is_file())

    def test_fresh_git_repository_can_adopt_and_verify(self) -> None:
        child = self.adopt_child("fresh-git", initialize_git=True)

        self.assertTrue((child / ".git").is_dir())
        catalog.verify_child(child)

    def test_git_clone_can_adopt_without_changing_its_remote(self) -> None:
        child = self.root / "clone"
        run_git(self.root, "clone", str(self.parent.root), str(child))
        original_remote = run_git(child, "remote", "get-url", "origin")

        catalog.adopt(child, str(self.parent.root), self.parent.revision_one, "main")

        self.assertEqual(run_git(child, "remote", "get-url", "origin"), original_remote)
        catalog.verify_child(child)

    def test_template_can_keep_a_child_owned_skill(self) -> None:
        child = self.root / "local-skill"
        self.parent.copy_without_git(child)
        local = child / "skills" / "local"
        local.mkdir()
        (local / "SKILL.md").write_text("---\nname: local\ndescription: Local.\n---\nLocal.\n")

        catalog.adopt(child, str(self.parent.root), self.parent.revision_one, "main")

        self.assertTrue((local / "SKILL.md").is_file())
        _lock, manifest = catalog.verify_child(child)
        self.assertNotIn("local", manifest["skills"])

    def test_adopted_child_can_publish_a_recursive_catalog(self) -> None:
        child = self.adopt_child("recursive-parent", initialize_git=True)
        run_git(child, "config", "user.email", "tests@example.com")
        run_git(child, "config", "user.name", "Catalog Tests")
        local = child / "skills" / "local"
        local.mkdir()
        (local / "SKILL.md").write_text("---\nname: local\ndescription: Local.\n---\nLocal.\n")
        write_json(
            child / catalog.SEED_NAME,
            {"schema": 1, "repository": str(child), "tracking_ref": "main"},
        )
        catalog.snapshot(child, check=False)
        run_git(child, "add", ".")
        run_git(child, "commit", "-m", "publish child catalog")
        child_revision = run_git(child, "rev-parse", "HEAD")

        grandchild = self.root / "grandchild"
        shutil.copytree(child, grandchild, ignore=shutil.ignore_patterns(".git"))
        catalog.adopt(grandchild, str(child), child_revision, "main")

        lock, manifest = catalog.verify_child(grandchild)
        self.assertEqual(lock["parent"]["repository"], str(child))
        self.assertEqual(set(manifest["skills"]), {"base", "local"})

    def test_modified_template_content_stops_adoption(self) -> None:
        child = self.root / "modified"
        self.parent.copy_without_git(child)
        (child / "skills" / "base" / "SKILL.md").write_text("local edit\n")

        with self.assertRaisesRegex(catalog.CatalogError, "snapshot content drift"):
            catalog.adopt(child, str(self.parent.root), self.parent.revision_one, "main")

        self.assertFalse((child / catalog.LOCK_NAME).exists())

    def test_upgrade_resolves_a_tag_and_records_its_full_commit(self) -> None:
        child = self.adopt_child("upgrade")
        revision_two = self.parent.update()

        preview = catalog.upgrade(child, "v2.0.0", dry_run=True)

        self.assertIn(f"new revision: {revision_two}", preview)
        self.assertIn("skills added: added", preview)
        self.assertEqual(catalog.load_lock(child)["parent"]["revision"], self.parent.revision_one)

        catalog.upgrade(child, "v2.0.0", dry_run=False)

        lock, manifest = catalog.verify_child(child)
        self.assertEqual(lock["parent"]["revision"], revision_two)
        self.assertEqual(set(manifest["skills"]), {"added", "base"})
        self.assertEqual((child / "tool.txt").read_text(), "version two\n")

    def test_sync_reproduces_the_locked_commit(self) -> None:
        child = self.adopt_child("sync")

        resolved = catalog.sync(child)

        self.assertEqual(resolved, self.parent.revision_one)
        catalog.verify_child(child)

    def test_upgrade_refuses_a_new_parent_skill_collision(self) -> None:
        child = self.adopt_child("collision")
        local = child / "skills" / "added"
        local.mkdir()
        (local / "SKILL.md").write_text("---\nname: added\ndescription: Local.\n---\nLocal.\n")
        catalog.snapshot(child, check=False)
        self.parent.update()

        with self.assertRaisesRegex(catalog.CatalogError, "child-owned skill: added"):
            catalog.upgrade(child, "v2.0.0", dry_run=True)

        with self.assertRaisesRegex(catalog.CatalogError, "child-owned skill: added"):
            catalog.upgrade(child, "v2.0.0", dry_run=False)

        self.assertEqual((local / "SKILL.md").read_text(), "---\nname: added\ndescription: Local.\n---\nLocal.\n")
        self.assertEqual(catalog.load_lock(child)["parent"]["revision"], self.parent.revision_one)

    def test_blocked_skill_remains_child_owned_through_sync_and_upgrade(self) -> None:
        child = self.root / "blocked-skill"
        self.parent.copy_without_git(child)
        write_json(
            child / catalog.SEED_NAME,
            {
                "schema": 1,
                "repository": str(self.parent.root),
                "tracking_ref": "main",
                "blocked_skills": ["base"],
            },
        )
        local_skill = child / "skills" / "base" / "SKILL.md"
        local_skill.write_text("---\nname: base\ndescription: Local.\n---\nLocal.\n")
        catalog.snapshot(child, check=False)

        catalog.adopt(child, str(self.parent.root), self.parent.revision_one, "main")

        _lock, manifest = catalog.verify_child(child)
        self.assertNotIn("base", manifest["skills"])
        self.assertEqual(local_skill.read_text(), "---\nname: base\ndescription: Local.\n---\nLocal.\n")

        catalog.sync(child)
        self.assertEqual(local_skill.read_text(), "---\nname: base\ndescription: Local.\n---\nLocal.\n")

        revision_two = self.parent.update()
        catalog.upgrade(child, "v2.0.0", dry_run=False)

        lock, manifest = catalog.verify_child(child)
        self.assertEqual(lock["parent"]["revision"], revision_two)
        self.assertEqual(set(manifest["skills"]), {"added"})
        self.assertEqual(local_skill.read_text(), "---\nname: base\ndescription: Local.\n---\nLocal.\n")

    def test_sync_migrates_an_existing_skill_to_the_blocked_list(self) -> None:
        child = self.adopt_child("migrate-blocked-skill")
        write_json(
            child / catalog.SEED_NAME,
            {
                "schema": 1,
                "repository": str(self.parent.root),
                "tracking_ref": "main",
                "blocked_skills": ["base"],
            },
        )
        local_skill = child / "skills" / "base" / "SKILL.md"
        local_skill.write_text("---\nname: base\ndescription: Local.\n---\nLocal.\n")
        catalog.snapshot(child, check=False)

        catalog.sync(child)

        _lock, manifest = catalog.verify_child(child)
        self.assertNotIn("base", manifest["skills"])
        self.assertEqual(local_skill.read_text(), "---\nname: base\ndescription: Local.\n---\nLocal.\n")

    def test_sync_can_restore_a_removed_blocked_skill(self) -> None:
        child = self.adopt_child("restore-blocked-skill")
        local_skill = child / "skills" / "base" / "SKILL.md"
        local_skill.write_text("---\nname: base\ndescription: Local.\n---\nLocal.\n")
        write_json(
            child / catalog.SEED_NAME,
            {
                "schema": 1,
                "repository": str(self.parent.root),
                "tracking_ref": "main",
                "blocked_skills": ["base"],
            },
        )
        catalog.snapshot(child, check=False)
        catalog.sync(child)

        write_json(
            child / catalog.SEED_NAME,
            {"schema": 1, "repository": str(self.parent.root), "tracking_ref": "main"},
        )
        catalog.snapshot(child, check=False)

        with self.assertRaisesRegex(catalog.CatalogError, "child-owned skill: base"):
            catalog.sync(child)

        shutil.rmtree(child / "skills" / "base")
        catalog.snapshot(child, check=False)

        catalog.sync(child)

        _lock, manifest = catalog.verify_child(child)
        self.assertIn("base", manifest["skills"])
        self.assertEqual(local_skill.read_text(), "---\nname: base\ndescription: Base.\n---\nBase.\n")

    def test_seed_rejects_duplicate_blocked_skills(self) -> None:
        write_json(
            self.parent.root / catalog.SEED_NAME,
            {
                "schema": 1,
                "repository": str(self.parent.root),
                "tracking_ref": "main",
                "blocked_skills": ["base", "base"],
            },
        )

        with self.assertRaisesRegex(catalog.CatalogError, "must not contain duplicates"):
            catalog.load_seed(self.parent.root)

    def test_seed_rejects_an_oversized_blocked_skill_name(self) -> None:
        write_json(
            self.parent.root / catalog.SEED_NAME,
            {
                "schema": 1,
                "repository": str(self.parent.root),
                "tracking_ref": "main",
                "blocked_skills": ["a" * 65],
            },
        )

        with self.assertRaisesRegex(catalog.CatalogError, "invalid blocked skill name"):
            catalog.load_seed(self.parent.root)

    def test_unknown_lock_keys_are_rejected(self) -> None:
        child = self.adopt_child("strict-lock")
        lock_path = child / catalog.LOCK_NAME
        lock = json.loads(lock_path.read_text())
        lock["unknown"] = True
        write_json(lock_path, lock)

        with self.assertRaisesRegex(catalog.CatalogError, "unknown keys: unknown"):
            catalog.verify_child(child)

    def test_manifest_cannot_drop_inherited_ownership(self) -> None:
        child = self.adopt_child("manifest-ownership")
        manifest_path = child / catalog.MANIFEST_NAME
        manifest = json.loads(manifest_path.read_text())
        manifest["skills"] = {}
        write_json(manifest_path, manifest)

        with self.assertRaisesRegex(catalog.CatalogError, "does not match"):
            catalog.verify_child(child)

    def test_recover_restores_an_interrupted_transaction(self) -> None:
        child = self.adopt_child("recover")
        managed = child / "tool.txt"
        expected = managed.read_text()
        transaction = child / f"{catalog.TRANSACTION_PREFIX}test"
        backup = transaction / "backup" / "0"
        catalog._copy_path(managed, backup)
        catalog._write_json(
            transaction / "receipt.json",
            {
                "schema": 1,
                "paths": [{"backup": "backup/0", "path": "tool.txt", "present": True}],
            },
        )
        managed.write_text("interrupted\n")

        restored, removed = catalog.recover(child)

        self.assertEqual((restored, removed), (1, 0))
        self.assertEqual(managed.read_text(), expected)
        catalog.verify_child(child)

    def test_snapshot_rejects_symbolic_links(self) -> None:
        link = self.parent.root / "skills" / "base" / "link"
        link.symlink_to(self.parent.root / "tool.txt")

        with self.assertRaisesRegex(catalog.CatalogError, "symbolic links"):
            catalog.generate_snapshot(self.parent.root)

    def test_snapshot_ignores_generated_python_cache_files(self) -> None:
        cache = self.parent.root / "skills" / "base" / "__pycache__"
        cache.mkdir()
        (cache / "generated.pyc").write_bytes(b"generated")

        catalog.verify_snapshot(self.parent.root, require_fresh=True)


if __name__ == "__main__":
    unittest.main()
