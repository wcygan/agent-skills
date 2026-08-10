"""Manage one inherited Agent Skills catalog at an exact git revision."""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
import shutil
import stat
import subprocess
import tempfile
from pathlib import Path, PurePosixPath
from typing import Any


SCHEMA = 1
SEED_NAME = "catalog-seed.json"
PROJECTION_NAME = "catalog-projection.json"
SNAPSHOT_NAME = "catalog-snapshot.json"
LOCK_NAME = "catalog.lock.json"
MANIFEST_NAME = "vendor/catalog-manifest.json"
PARENT_SNAPSHOT_NAME = "vendor/catalog-parent-snapshot.json"
TRANSACTION_PREFIX = ".catalog-transaction-"
SHA_PATTERN = re.compile(r"[0-9a-f]{40}")
HASH_PATTERN = re.compile(r"[0-9a-f]{64}")
SKILL_PATTERN = re.compile(r"[a-z0-9]+(?:-[a-z0-9]+)*")
IGNORED_DIRECTORIES = {"__pycache__", ".mypy_cache", ".pytest_cache", ".ruff_cache"}
IGNORED_FILES = {".DS_Store"}


class CatalogError(RuntimeError):
    """Report a safe, user-actionable catalog failure."""


def _read_object(path: Path) -> dict[str, Any]:
    try:
        value = json.loads(path.read_text())
    except FileNotFoundError as error:
        raise CatalogError(f"missing required file: {path}") from error
    except json.JSONDecodeError as error:
        raise CatalogError(f"invalid JSON in {path}: {error}") from error
    if not isinstance(value, dict):
        raise CatalogError(f"expected a JSON object in {path}")
    return value


def _require_keys(value: dict[str, Any], expected: set[str], context: str) -> None:
    actual = set(value)
    if actual == expected:
        return
    missing = sorted(expected - actual)
    unknown = sorted(actual - expected)
    details = []
    if missing:
        details.append(f"missing keys: {', '.join(missing)}")
    if unknown:
        details.append(f"unknown keys: {', '.join(unknown)}")
    raise CatalogError(f"invalid {context}: {'; '.join(details)}")


def _require_schema(value: Any, context: str) -> None:
    if value != SCHEMA:
        raise CatalogError(f"unsupported {context} schema: {value!r}; supported: {SCHEMA}")


def _require_string(value: Any, context: str) -> str:
    if not isinstance(value, str) or not value.strip():
        raise CatalogError(f"{context} must be a non-empty string")
    return value


def _require_revision(value: Any, context: str = "revision") -> str:
    revision = _require_string(value, context)
    if not SHA_PATTERN.fullmatch(revision):
        raise CatalogError(f"{context} must be a full 40-character git commit ID")
    return revision


def _require_hash(value: Any, context: str) -> str:
    digest = _require_string(value, context)
    if not HASH_PATTERN.fullmatch(digest):
        raise CatalogError(f"{context} must be a lowercase SHA-256 value")
    return digest


def _safe_relative_path(value: Any, context: str) -> str:
    text = _require_string(value, context)
    path = PurePosixPath(text)
    if path.is_absolute() or ".." in path.parts or "." in path.parts or "\\" in text:
        raise CatalogError(f"{context} must be a safe repository-relative path: {text}")
    return path.as_posix()


def _write_json(path: Path, value: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_name(f".{path.name}.tmp")
    temporary.write_text(json.dumps(value, indent=2, sort_keys=True) + "\n")
    os.replace(temporary, path)


def discover_root(start: Path | None = None) -> Path:
    current = (start or Path.cwd()).resolve()
    if current.is_file():
        current = current.parent
    for candidate in (current, *current.parents):
        if (candidate / SEED_NAME).is_file() or (candidate / PROJECTION_NAME).is_file():
            return candidate
    raise CatalogError(f"could not find {SEED_NAME} or {PROJECTION_NAME}")


def _check_regular_file(path: Path) -> None:
    if path.is_symlink():
        raise CatalogError(f"symbolic links are not supported: {path}")
    if not path.is_file():
        raise CatalogError(f"expected a regular file: {path}")


def _file_digest(path: Path) -> str:
    _check_regular_file(path)
    executable = bool(stat.S_IMODE(path.stat().st_mode) & 0o111)
    digest = hashlib.sha256()
    digest.update(b"executable\0" if executable else b"regular\0")
    with path.open("rb") as source:
        for chunk in iter(lambda: source.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def _tree_files(directory: Path) -> list[Path]:
    if directory.is_symlink():
        raise CatalogError(f"symbolic links are not supported: {directory}")
    if not directory.is_dir():
        raise CatalogError(f"expected a directory: {directory}")
    files: list[Path] = []
    for current, directory_names, file_names in os.walk(directory, followlinks=False):
        current_path = Path(current)
        for name in directory_names:
            child = current_path / name
            if child.is_symlink():
                raise CatalogError(f"symbolic links are not supported: {child}")
        directory_names[:] = [name for name in directory_names if name not in IGNORED_DIRECTORIES]
        for name in file_names:
            child = current_path / name
            if child.is_symlink():
                raise CatalogError(f"symbolic links are not supported: {child}")
            if name in IGNORED_FILES or child.suffix in {".pyc", ".pyo"}:
                continue
            _check_regular_file(child)
            files.append(child)
    return sorted(files, key=lambda path: path.relative_to(directory).as_posix())


def _tree_digest(directory: Path) -> str:
    digest = hashlib.sha256()
    for path in _tree_files(directory):
        relative = path.relative_to(directory).as_posix()
        digest.update(relative.encode())
        digest.update(b"\0")
        digest.update(_file_digest(path).encode())
        digest.update(b"\0")
    return digest.hexdigest()


def load_seed(root: Path) -> dict[str, Any]:
    seed = _read_object(root / SEED_NAME)
    _require_keys(seed, {"schema", "repository", "tracking_ref"}, "catalog seed")
    _require_schema(seed["schema"], "catalog seed")
    return {
        "schema": SCHEMA,
        "repository": _require_string(seed["repository"], "seed repository"),
        "tracking_ref": _require_string(seed["tracking_ref"], "seed tracking_ref"),
    }


def load_projection(root: Path) -> dict[str, Any]:
    projection = _read_object(root / PROJECTION_NAME)
    _require_keys(projection, {"schema", "managed_paths"}, "catalog projection")
    _require_schema(projection["schema"], "catalog projection")
    paths = projection["managed_paths"]
    if not isinstance(paths, list) or not paths:
        raise CatalogError("managed_paths must be a non-empty list")
    normalized = [_safe_relative_path(path, "managed path") for path in paths]
    if len(normalized) != len(set(normalized)):
        raise CatalogError("managed_paths must not contain duplicates")
    if "skills" in normalized or any(path.startswith("skills/") for path in normalized):
        raise CatalogError("managed_paths must not include skills; skill ownership is separate")
    if SEED_NAME in normalized:
        raise CatalogError(f"managed_paths must not include child-owned {SEED_NAME}")
    return {"schema": SCHEMA, "managed_paths": normalized}


def _load_digest_map(value: Any, context: str, key_kind: str) -> dict[str, str]:
    if not isinstance(value, dict):
        raise CatalogError(f"{context} must be an object")
    result: dict[str, str] = {}
    for raw_key, raw_digest in value.items():
        if key_kind == "skill":
            key = _require_string(raw_key, f"{context} key")
            if not SKILL_PATTERN.fullmatch(key):
                raise CatalogError(f"invalid skill name in {context}: {key}")
        else:
            key = _safe_relative_path(raw_key, f"{context} key")
        result[key] = _require_hash(raw_digest, f"{context} digest for {key}")
    return result


def _load_snapshot_path(path: Path) -> dict[str, Any]:
    snapshot = _read_object(path)
    _require_keys(snapshot, {"schema", "skills", "files"}, "catalog snapshot")
    _require_schema(snapshot["schema"], "catalog snapshot")
    return {
        "schema": SCHEMA,
        "skills": _load_digest_map(snapshot["skills"], "snapshot skills", "skill"),
        "files": _load_digest_map(snapshot["files"], "snapshot files", "file"),
    }


def load_snapshot(root: Path) -> dict[str, Any]:
    return _load_snapshot_path(root / SNAPSHOT_NAME)


def load_lock(root: Path) -> dict[str, Any]:
    lock = _read_object(root / LOCK_NAME)
    _require_keys(lock, {"schema", "parent"}, "catalog lock")
    _require_schema(lock["schema"], "catalog lock")
    parent = lock["parent"]
    if not isinstance(parent, dict):
        raise CatalogError("lock parent must be an object")
    _require_keys(parent, {"repository", "tracking_ref", "revision"}, "lock parent")
    return {
        "schema": SCHEMA,
        "parent": {
            "repository": _require_string(parent["repository"], "lock repository"),
            "tracking_ref": _require_string(parent["tracking_ref"], "lock tracking_ref"),
            "revision": _require_revision(parent["revision"], "lock revision"),
        },
    }


def load_manifest(root: Path) -> dict[str, Any]:
    manifest = _read_object(root / MANIFEST_NAME)
    _require_keys(manifest, {"schema", "parent_revision", "skills", "files"}, "catalog manifest")
    _require_schema(manifest["schema"], "catalog manifest")
    return {
        "schema": SCHEMA,
        "parent_revision": _require_revision(manifest["parent_revision"], "manifest parent_revision"),
        "skills": _load_digest_map(manifest["skills"], "manifest skills", "skill"),
        "files": _load_digest_map(manifest["files"], "manifest files", "file"),
    }


def generate_snapshot(root: Path) -> dict[str, Any]:
    projection = load_projection(root)
    skills_dir = root / "skills"
    if not skills_dir.is_dir() or skills_dir.is_symlink():
        raise CatalogError(f"expected a regular skills directory: {skills_dir}")
    skills: dict[str, str] = {}
    for skill in sorted(skills_dir.iterdir(), key=lambda path: path.name):
        if not skill.is_dir() or skill.is_symlink():
            continue
        if not (skill / "SKILL.md").is_file():
            continue
        if not SKILL_PATTERN.fullmatch(skill.name):
            raise CatalogError(f"invalid skill directory name: {skill.name}")
        skills[skill.name] = _tree_digest(skill)

    files: dict[str, str] = {}
    for relative in projection["managed_paths"]:
        if relative == SNAPSHOT_NAME:
            continue
        path = root / relative
        if path.is_symlink():
            raise CatalogError(f"symbolic links are not supported: {path}")
        if path.is_file():
            files[relative] = _file_digest(path)
            continue
        if path.is_dir():
            for child in _tree_files(path):
                child_relative = child.relative_to(root).as_posix()
                files[child_relative] = _file_digest(child)
            continue
        raise CatalogError(f"managed path does not exist: {relative}")
    return {"schema": SCHEMA, "skills": skills, "files": dict(sorted(files.items()))}


def _verify_digest_map(root: Path, values: dict[str, str], kind: str) -> list[str]:
    drift: list[str] = []
    for relative, expected in values.items():
        path = root / (f"skills/{relative}" if kind == "skill" else relative)
        try:
            actual = _tree_digest(path) if kind == "skill" else _file_digest(path)
        except CatalogError:
            drift.append(relative)
            continue
        if actual != expected:
            drift.append(relative)
    return drift


def verify_snapshot(root: Path, *, require_fresh: bool) -> dict[str, Any]:
    if _transactions(root):
        raise CatalogError("unfinished catalog transaction; run catalog-recover")
    snapshot = load_snapshot(root)
    skill_drift = _verify_digest_map(root, snapshot["skills"], "skill")
    file_drift = _verify_digest_map(root, snapshot["files"], "file")
    if skill_drift or file_drift:
        details = _format_drift(skill_drift, file_drift)
        raise CatalogError(f"catalog snapshot content drift: {details}")
    if require_fresh:
        expected = generate_snapshot(root)
        if snapshot != expected:
            raise CatalogError(f"{SNAPSHOT_NAME} is stale; run the snapshot command")
    return snapshot


def verify_child(root: Path) -> tuple[dict[str, Any], dict[str, Any]]:
    lock = load_lock(root)
    manifest = load_manifest(root)
    if manifest["parent_revision"] != lock["parent"]["revision"]:
        raise CatalogError("catalog lock and manifest revisions differ")
    parent_snapshot = _load_snapshot_path(root / PARENT_SNAPSHOT_NAME)
    expected_files = dict(parent_snapshot["files"])
    expected_files[PARENT_SNAPSHOT_NAME] = _file_digest(root / PARENT_SNAPSHOT_NAME)
    if manifest["skills"] != parent_snapshot["skills"] or manifest["files"] != expected_files:
        raise CatalogError("catalog manifest does not match the inherited source snapshot")
    skill_drift = _verify_digest_map(root, manifest["skills"], "skill")
    file_drift = _verify_digest_map(root, manifest["files"], "file")
    if skill_drift or file_drift:
        details = _format_drift(skill_drift, file_drift)
        raise CatalogError(f"inherited catalog content drift: {details}")
    verify_snapshot(root, require_fresh=True)
    return lock, manifest


def _format_drift(skills: list[str], files: list[str]) -> str:
    parts = []
    if skills:
        parts.append(f"skills={','.join(skills)}")
    if files:
        parts.append(f"files={','.join(files)}")
    return "; ".join(parts)


def _run_git(*args: str, cwd: Path | None = None, check: bool = True) -> subprocess.CompletedProcess[str]:
    try:
        return subprocess.run(
            ("git", *args),
            cwd=cwd,
            check=check,
            text=True,
            capture_output=True,
        )
    except FileNotFoundError as error:
        raise CatalogError("git is required for parent resolution") from error
    except subprocess.CalledProcessError as error:
        detail = error.stderr.strip() or error.stdout.strip() or str(error)
        raise CatalogError(f"git command failed: {detail}") from error


def clone_revision(repository: str, requested_ref: str, destination: Path) -> str:
    _run_git("clone", "--quiet", "--no-checkout", "--no-local", repository, str(destination))
    candidate = requested_ref
    resolved = _run_git("rev-parse", "--verify", f"{candidate}^{{commit}}", cwd=destination, check=False)
    if resolved.returncode != 0:
        candidate = f"origin/{requested_ref}"
        resolved = _run_git("rev-parse", "--verify", f"{candidate}^{{commit}}", cwd=destination, check=False)
    if resolved.returncode != 0:
        raise CatalogError(f"parent reference does not resolve to a commit: {requested_ref}")
    revision = resolved.stdout.strip()
    _require_revision(revision, "resolved parent revision")
    _run_git("checkout", "--quiet", "--detach", revision, cwd=destination)
    return revision


def _source_manifest(checkout: Path, revision: str) -> dict[str, Any]:
    snapshot = verify_snapshot(checkout, require_fresh=True)
    files = dict(snapshot["files"])
    files[PARENT_SNAPSHOT_NAME] = _file_digest(checkout / SNAPSHOT_NAME)
    return {
        "schema": SCHEMA,
        "parent_revision": revision,
        "skills": snapshot["skills"],
        "files": dict(sorted(files.items())),
    }


def _copy_path(source: Path, destination: Path) -> None:
    if source.is_symlink():
        raise CatalogError(f"symbolic links are not supported: {source}")
    destination.parent.mkdir(parents=True, exist_ok=True)
    if source.is_dir():
        shutil.copytree(source, destination)
    else:
        _check_regular_file(source)
        shutil.copy2(source, destination)


def _remove_path(path: Path) -> None:
    if path.is_symlink() or path.is_file():
        path.unlink(missing_ok=True)
    elif path.is_dir():
        shutil.rmtree(path)


def _owned_paths(root: Path, manifest: dict[str, Any]) -> list[Path]:
    paths = [root / "skills" / name for name in manifest["skills"]]
    paths.extend(root / relative for relative in manifest["files"])
    return paths


def _transactions(root: Path) -> list[Path]:
    transactions = []
    for path in sorted(root.glob(f"{TRANSACTION_PREFIX}*")):
        if path.is_symlink() or not path.is_dir():
            raise CatalogError(f"invalid catalog transaction path: {path}")
        transactions.append(path)
    return transactions


def _write_recovery_receipt(root: Path, transaction: Path, paths: list[Path], present: set[Path]) -> None:
    entries = []
    for index, path in enumerate(paths):
        entries.append(
            {
                "backup": f"backup/{index}",
                "path": path.relative_to(root).as_posix(),
                "present": path in present,
            }
        )
    _write_json(transaction / "receipt.json", {"schema": SCHEMA, "paths": entries})


def _load_recovery_receipt(transaction: Path) -> list[dict[str, Any]] | None:
    receipt_path = transaction / "receipt.json"
    if not receipt_path.is_file():
        return None
    receipt = _read_object(receipt_path)
    _require_keys(receipt, {"schema", "paths"}, "catalog recovery receipt")
    _require_schema(receipt["schema"], "catalog recovery receipt")
    if not isinstance(receipt["paths"], list):
        raise CatalogError("recovery receipt paths must be a list")
    entries = []
    seen = set()
    for raw_entry in receipt["paths"]:
        if not isinstance(raw_entry, dict):
            raise CatalogError("recovery receipt entries must be objects")
        _require_keys(raw_entry, {"backup", "path", "present"}, "recovery receipt entry")
        path = _safe_relative_path(raw_entry["path"], "recovery path")
        backup = _safe_relative_path(raw_entry["backup"], "recovery backup")
        if PurePosixPath(path).parts[0] == ".git":
            raise CatalogError("recovery paths must not access Git metadata")
        if not backup.startswith("backup/"):
            raise CatalogError(f"recovery backup must be below backup/: {backup}")
        if not isinstance(raw_entry["present"], bool):
            raise CatalogError("recovery present value must be a Boolean")
        if path in seen:
            raise CatalogError(f"duplicate recovery path: {path}")
        seen.add(path)
        entries.append({"backup": backup, "path": path, "present": raw_entry["present"]})
    return entries


def _restore_transaction(root: Path, transaction: Path) -> bool:
    entries = _load_recovery_receipt(transaction)
    if entries is None:
        shutil.rmtree(transaction)
        return False
    targets = [root / entry["path"] for entry in entries]
    for path in sorted(targets, key=lambda item: (len(item.parts), str(item)), reverse=True):
        _remove_path(path)
    for entry in entries:
        if not entry["present"]:
            continue
        backup = transaction / entry["backup"]
        if not backup.exists() and not backup.is_symlink():
            raise CatalogError(f"missing recovery backup: {entry['backup']}")
        _copy_path(backup, root / entry["path"])
    shutil.rmtree(transaction)
    return True


def recover(root: Path) -> tuple[int, int]:
    transactions = _transactions(root)
    restored = 0
    removed = 0
    for transaction in transactions:
        if _restore_transaction(root, transaction):
            restored += 1
        else:
            removed += 1
    return restored, removed


def _check_collisions(root: Path, old_manifest: dict[str, Any], target_manifest: dict[str, Any]) -> None:
    old_skills = set(old_manifest["skills"])
    for name, digest in target_manifest["skills"].items():
        path = root / "skills" / name
        if path.exists() and name not in old_skills and _tree_digest(path) != digest:
            raise CatalogError(f"refusing to overwrite child-owned skill: {name}")

    old_files = set(old_manifest["files"])
    for relative, digest in target_manifest["files"].items():
        path = root / relative
        if path.exists() and relative not in old_files and _file_digest(path) != digest:
            raise CatalogError(f"refusing to overwrite child-owned file: {relative}")
        for parent in path.parents:
            if parent == root:
                break
            if parent.exists() and not parent.is_dir():
                raise CatalogError(f"file blocks managed path: {parent.relative_to(root)}")


def _initial_manifest(root: Path) -> dict[str, Any]:
    if not (root / SNAPSHOT_NAME).is_file():
        return {"schema": SCHEMA, "parent_revision": "0" * 40, "skills": {}, "files": {}}
    snapshot = verify_snapshot(root, require_fresh=False)
    files = dict(snapshot["files"])
    parent_snapshot = root / PARENT_SNAPSHOT_NAME
    if parent_snapshot.is_file():
        files[PARENT_SNAPSHOT_NAME] = _file_digest(parent_snapshot)
    return {
        "schema": SCHEMA,
        "parent_revision": "0" * 40,
        "skills": snapshot["skills"],
        "files": files,
    }


def _apply_parent(
    root: Path,
    checkout: Path,
    lock: dict[str, Any],
    old_manifest: dict[str, Any],
    target_manifest: dict[str, Any],
) -> None:
    pending = _transactions(root)
    if pending:
        raise CatalogError("unfinished catalog transaction; run catalog-recover")
    _check_collisions(root, old_manifest, target_manifest)
    affected = {path for path in _owned_paths(root, old_manifest)}
    affected.update(_owned_paths(root, target_manifest))
    affected.update({root / LOCK_NAME, root / MANIFEST_NAME, root / SNAPSHOT_NAME})
    ordered = sorted(affected, key=lambda path: (len(path.parts), str(path)))
    transaction = Path(tempfile.mkdtemp(prefix=".catalog-transaction-", dir=root))
    backup = transaction / "backup"
    present: list[tuple[Path, Path]] = []
    try:
        for index, path in enumerate(ordered):
            if path.exists() or path.is_symlink():
                backup_path = backup / str(index)
                _copy_path(path, backup_path)
                present.append((path, backup_path))
        _write_recovery_receipt(root, transaction, ordered, {path for path, _backup in present})
        for path in reversed(ordered):
            _remove_path(path)
        for name in target_manifest["skills"]:
            _copy_path(checkout / "skills" / name, root / "skills" / name)
        for relative in target_manifest["files"]:
            source = checkout / SNAPSHOT_NAME if relative == PARENT_SNAPSHOT_NAME else checkout / relative
            _copy_path(source, root / relative)
        _write_json(root / LOCK_NAME, lock)
        _write_json(root / MANIFEST_NAME, target_manifest)
        _write_json(root / SNAPSHOT_NAME, generate_snapshot(root))
    except BaseException:
        _restore_transaction(root, transaction)
        raise
    else:
        shutil.rmtree(transaction)


def _changes(old: dict[str, str], new: dict[str, str]) -> tuple[list[str], list[str], list[str]]:
    old_keys = set(old)
    new_keys = set(new)
    added = sorted(new_keys - old_keys)
    removed = sorted(old_keys - new_keys)
    changed = sorted(key for key in old_keys & new_keys if old[key] != new[key])
    return added, changed, removed


def format_upgrade_report(old: dict[str, Any], new: dict[str, Any]) -> str:
    skill_changes = _changes(old["skills"], new["skills"])
    file_changes = _changes(old["files"], new["files"])
    lines = [
        f"old revision: {old['parent_revision']}",
        f"new revision: {new['parent_revision']}",
    ]
    labels = ("added", "changed", "removed")
    for label, values in zip(labels, skill_changes, strict=True):
        lines.append(f"skills {label}: {', '.join(values) if values else '-'}")
    for label, values in zip(labels, file_changes, strict=True):
        lines.append(f"files {label}: {', '.join(values) if values else '-'}")
    return "\n".join(lines)


def _prepare_parent(repository: str, requested_ref: str) -> tuple[tempfile.TemporaryDirectory[str], Path, str, dict[str, Any]]:
    scratch = tempfile.TemporaryDirectory(prefix="skill-catalog-parent-")
    checkout = Path(scratch.name) / "source"
    try:
        revision = clone_revision(repository, requested_ref, checkout)
        manifest = _source_manifest(checkout, revision)
    except Exception:
        scratch.cleanup()
        raise
    return scratch, checkout, revision, manifest


def adopt(
    root: Path,
    repository: str | None = None,
    revision: str | None = None,
    tracking_ref: str | None = None,
) -> str:
    seed = load_seed(root)
    selected_repository = repository or seed["repository"]
    selected_tracking_ref = tracking_ref or seed["tracking_ref"]
    has_lock = (root / LOCK_NAME).is_file()
    has_manifest = (root / MANIFEST_NAME).is_file()
    if has_lock != has_manifest:
        raise CatalogError("catalog origin metadata is incomplete")
    if has_lock:
        current_lock = load_lock(root)
        if current_lock["parent"]["repository"] == selected_repository:
            raise CatalogError("catalog adoption already exists; use sync or upgrade")
    requested = revision or selected_tracking_ref
    old_manifest = _initial_manifest(root)
    scratch, checkout, resolved, target_manifest = _prepare_parent(selected_repository, requested)
    try:
        lock = {
            "schema": SCHEMA,
            "parent": {
                "repository": selected_repository,
                "tracking_ref": selected_tracking_ref,
                "revision": resolved,
            },
        }
        _apply_parent(root, checkout, lock, old_manifest, target_manifest)
    finally:
        scratch.cleanup()
    return resolved


def sync(root: Path) -> str:
    lock, old_manifest = verify_child(root)
    parent = lock["parent"]
    scratch, checkout, resolved, target_manifest = _prepare_parent(parent["repository"], parent["revision"])
    try:
        if resolved != parent["revision"]:
            raise CatalogError("locked parent commit resolved to a different commit")
        _apply_parent(root, checkout, lock, old_manifest, target_manifest)
    finally:
        scratch.cleanup()
    return resolved


def check_parent(root: Path) -> tuple[str, str]:
    lock, _manifest = verify_child(root)
    parent = lock["parent"]
    scratch, _checkout, available, _target = _prepare_parent(parent["repository"], parent["tracking_ref"])
    scratch.cleanup()
    return parent["revision"], available


def upgrade(root: Path, requested_ref: str | None, *, dry_run: bool) -> str:
    lock, old_manifest = verify_child(root)
    parent = lock["parent"]
    requested = requested_ref or parent["tracking_ref"]
    scratch, checkout, resolved, target_manifest = _prepare_parent(parent["repository"], requested)
    try:
        _check_collisions(root, old_manifest, target_manifest)
        report = format_upgrade_report(old_manifest, target_manifest)
        if not dry_run:
            new_lock = {
                "schema": SCHEMA,
                "parent": {
                    "repository": parent["repository"],
                    "tracking_ref": parent["tracking_ref"],
                    "revision": resolved,
                },
            }
            _apply_parent(root, checkout, new_lock, old_manifest, target_manifest)
    finally:
        scratch.cleanup()
    return report


def snapshot(root: Path, *, check: bool) -> bool:
    if _transactions(root):
        raise CatalogError("unfinished catalog transaction; run catalog-recover")
    expected = generate_snapshot(root)
    if check:
        actual = load_snapshot(root)
        if actual != expected:
            raise CatalogError(f"{SNAPSHOT_NAME} is stale; run the snapshot command")
        return False
    _write_json(root / SNAPSHOT_NAME, expected)
    return True


def doctor(root: Path) -> list[str]:
    messages = []
    pending = _transactions(root)
    if pending:
        raise CatalogError("unfinished catalog transaction; run catalog-recover")
    load_seed(root)
    load_projection(root)
    messages.append("catalog configuration is valid")
    if (root / LOCK_NAME).is_file():
        lock, manifest = verify_child(root)
        messages.append(f"child catalog is pinned to {lock['parent']['revision']}")
        messages.append(f"verified {len(manifest['skills'])} inherited skills")
    else:
        current = verify_snapshot(root, require_fresh=True)
        messages.append(f"source snapshot contains {len(current['skills'])} skills")
    for command in ("git", "uv", "just"):
        location = shutil.which(command)
        if not location:
            raise CatalogError(f"required command is unavailable: {command}")
        messages.append(f"found {command}: {location}")
    return messages


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=__doc__)
    subparsers = parser.add_subparsers(dest="command", required=True)

    adopt_parser = subparsers.add_parser("adopt", help="adopt a parent catalog")
    adopt_parser.add_argument("--repository", default=os.environ.get("CATALOG_REPOSITORY") or None)
    adopt_parser.add_argument("--revision", default=os.environ.get("CATALOG_REVISION") or None)
    adopt_parser.add_argument("--tracking-ref", default=os.environ.get("CATALOG_TRACKING_REF") or None)

    subparsers.add_parser("sync", help="reproduce the locked parent catalog")
    subparsers.add_parser("check", help="check the parent tracking reference")
    subparsers.add_parser("verify", help="verify inherited content or the source snapshot")
    subparsers.add_parser("doctor", help="check catalog configuration and tools")
    subparsers.add_parser("recover", help="restore an interrupted catalog transaction")
    subparsers.add_parser("snapshot", help="write the source snapshot")
    subparsers.add_parser("snapshot-check", help="verify the source snapshot")

    upgrade_parser = subparsers.add_parser("upgrade", help="upgrade to a parent reference")
    upgrade_parser.add_argument("target", nargs="?", default=os.environ.get("CATALOG_TARGET") or None)
    upgrade_parser.add_argument("--dry-run", action="store_true")
    return parser


def main(argv: list[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)
    try:
        root = discover_root()
        if args.command == "adopt":
            revision = adopt(root, args.repository, args.revision, args.tracking_ref)
            print(f"adopted parent catalog at {revision}")
        elif args.command == "sync":
            print(f"synchronized parent catalog at {sync(root)}")
        elif args.command == "check":
            locked, available = check_parent(root)
            if locked == available:
                print(f"[UP TO DATE] parent catalog @ {locked}")
            else:
                print(f"[UPDATE AVAILABLE] parent catalog: locked {locked}, available {available}")
        elif args.command == "verify":
            if (root / LOCK_NAME).is_file():
                lock, manifest = verify_child(root)
                print(f"verified {len(manifest['skills'])} inherited skills at {lock['parent']['revision']}")
            else:
                current = verify_snapshot(root, require_fresh=True)
                print(f"verified source snapshot with {len(current['skills'])} skills")
        elif args.command == "doctor":
            print("\n".join(doctor(root)))
        elif args.command == "recover":
            restored, removed = recover(root)
            print(f"restored {restored} catalog transactions; removed {removed} pre-write transactions")
        elif args.command == "snapshot":
            snapshot(root, check=False)
            print(f"wrote {SNAPSHOT_NAME}")
        elif args.command == "snapshot-check":
            snapshot(root, check=True)
            print(f"verified {SNAPSHOT_NAME}")
        elif args.command == "upgrade":
            print(upgrade(root, args.target, dry_run=args.dry_run))
            if args.dry_run:
                print("dry run; no files changed")
            else:
                print("parent catalog upgraded")
        else:
            parser.error(f"unknown command: {args.command}")
    except CatalogError as error:
        print(f"error: {error}", file=os.sys.stderr)
        return 1
    return 0
