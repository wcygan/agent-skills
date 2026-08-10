# Derive an Agent Skills catalog

Use this workflow to inherit this catalog and add your own skills.

The workflow supports forks, templates, archives, and new Git repositories.
All routes use the same tracked catalog files.

Git history and remote names do not define catalog ownership.
The generated lock defines the parent and its exact commit.

## Requirements

Install these commands before catalog maintenance:

- Install Git for parent resolution.
- Install uv for the Python maintenance environment.
- Install just for the project command interface.
- Install GitHub CLI for template creation, skill installation, and publication.

Run `just catalog-doctor` to check configuration and local commands.

## Adopt the default parent

Run these commands from the repository root:

```bash
just catalog-adopt
just catalog-doctor
just check
```

The seed file supplies the default repository and tracking reference.
Adoption resolves that reference once and stores a full Git commit ID.

Pass an explicit repository and commit when you need a fixed source:

```bash
just catalog-adopt https://github.com/wcygan/agent-skills.git <40-character-commit> main
```

The third value remains the moving reference for later update checks.
The commit remains the authoritative content version.

Commit these generated files after adoption:

| File | Purpose |
| --- | --- |
| `catalog.lock.json` | Records the parent repository, tracking reference, and exact commit. |
| `vendor/catalog-manifest.json` | Records imported skill and file hashes. |
| `vendor/catalog-parent-snapshot.json` | Records the inherited parent snapshot. |
| `catalog-snapshot.json` | Records this repository's distributable content. |

## Use any arrival route

### Fork or clone

Fork the repository, then clone your fork.

Run `just catalog-adopt` in the clone.
The command does not change Git remotes or branches.

### GitHub template

Enable **Template repository** in the source repository settings.
Repository files cannot enable or copy this GitHub setting.

Create a repository from the GitHub template.
Clone the generated repository.

Run `just catalog-adopt` in the generated repository.
The tracked snapshot proves which existing files came from the template.

### Downloaded archive

Download and extract the repository archive.
Run `just catalog-adopt` in the extracted directory.

The command works without a `.git` directory.
You can keep the directory outside Git.

### New Git history

Delete `.git` when you do not want the prior history.
Run `git init` before or after adoption.

Run `just catalog-adopt` and `just check`.
Catalog verification uses files and hashes instead of Git history.

## Add local skills

Add each local skill under `skills/<name>/SKILL.md`.
Use a name that does not conflict with an inherited skill.

Refresh the distributable snapshot after local catalog changes:

```bash
just catalog-snapshot
just check
```

The parent manifest does not own unlisted skills and files.
Parent synchronization preserves those local paths.

An upgrade stops when the parent adds a conflicting local name.
Rename the local skill or keep the current parent commit.

## Check for parent updates

Check the moving parent reference without changing files:

```bash
just parent-check
```

The result compares the tracking reference with the locked commit.
The command does not change the lock or imported content.

## Preview and apply an upgrade

Preview a release tag, branch, or commit:

```bash
just parent-upgrade-preview v1.3.0
```

The preview lists added, changed, and removed skills and files.
It also checks local content and path collisions.

Apply the same target after review:

```bash
just parent-upgrade v1.3.0
just check
```

The tag selects a commit during this command.
The updated lock stores only the resolved 40-character commit ID.

Omit the target to use the configured tracking reference:

```bash
just parent-upgrade-preview
just parent-upgrade
```

Use `just catalog-sync` to reproduce the current lock.
Synchronization never moves the locked commit.

## Understand upgrade ownership

One parent commit pins these imported surfaces:

- Parent skills and their nested vendored skills.
- Direct vendor locks and attribution files.
- Catalog maintenance code and tests.
- The just command interface.
- The uv project lock.
- The shared CI workflow.
- The agent bootstrap guide.
- This catalog inheritance guide.

The tool preserves nested `.vendored` files without modification.
This keeps the original repository and commit provenance.

The tool rejects edits to inherited paths.
It also rejects unknown lock, manifest, projection, and snapshot keys.

## Roll back an upgrade

The tool restores prior files when an apply step reports a failure.

Recover files after a forced process stop:

```bash
just catalog-recover
just check
```

Recovery uses the transaction receipt created before file replacement.

Review each successful upgrade as one repository change.
Commit it separately when the result passes `just check`.

Use the old commit to reverse an uncommitted upgrade:

```bash
just parent-upgrade <old-40-character-commit>
just check
```

You can also revert the separate upgrade commit with Git.

## Publish your derived catalog

A derived catalog can become a parent for another repository.

1. Change `catalog-seed.json` to your repository URL and tracking reference.
2. Add or update your local skills.
3. Run `just catalog-snapshot`.
4. Run `just check`.
5. Commit and push the catalog files.

A descendant can now use your template, fork, or archive.
Its adoption command pins one exact commit from your repository.

Existing origin metadata is replaced during this reparenting step.
The new parent repository must differ from the existing parent repository.

Your descendants inherit your skills and your inherited skills.
The original nested vendor markers remain present.

## Use the CI gate

The tracked CI workflow runs `just check` for pull requests and main pushes.
The workflow uses read-only repository permissions and pinned action commits.

The test suite covers these arrival states:

- A Git clone with an existing remote.
- An archive without Git metadata.
- A copied tree with new Git metadata.
- A template with local skills.
- A recursively derived catalog.

GitHub template creation copies workflow files but not repository settings.
Enable GitHub Actions in the new repository.

Add the CI job as a required check when branch protection needs it.

## Handle schema evolution

Current catalog files use schema version `1`.
The parser rejects unknown keys and unsupported schema versions.

Compatible tooling updates arrive through normal parent upgrades.
A breaking schema change stops before file writes.

Follow the release migration instructions before a breaking schema upgrade.
