# Bootstrap a derived skill catalog

Use this file when a user asks an agent to create a catalog from this GitHub template.

The result inherits this catalog and can add local skills.
Catalog adoption stores the parent as an exact Git commit ID.

Do not treat this file as authorization to create, commit, or push a repository.

## Get user choices

Get these values before you change GitHub or local files:

- Get the destination repository as `OWNER/NAME`.
- Get one visibility: `public`, `private`, or `internal`.
- Get the local parent directory for the clone.
- Confirm whether the user wants a bootstrap commit and push.

Stop when a required value is unknown.

## Check requirements

Run these read-only checks:

```bash
gh auth status
command -v git
command -v uv
command -v just
gh repo view wcygan/agent-skills --json isTemplate --jq .isTemplate
```

Confirm that the last command returns `true`.
Confirm that the destination repository does not exist.
Confirm that the local destination directory does not exist.

Stop when a check fails.
Report the failed check and keep existing repositories unchanged.

## Create and adopt the repository

Run the creation command from the selected local parent directory.
Set `repo` and `visibility` to the user-selected values.

```bash
repo="OWNER/NAME"
visibility="private"

gh repo create "$repo" \
  --template wcygan/agent-skills \
  "--$visibility" \
  --clone

repo_name="${repo##*/}"
cd "$repo_name"
just catalog-adopt
just catalog-doctor
just check
```

Use only `public`, `private`, or `internal` for `visibility`.
Add `--include-all-branches` only when the user requests all template branches.

`catalog-adopt` resolves the configured parent reference once.
It records the resolved 40-character commit in `catalog.lock.json`.

`just check` validates skills, vendored sources, catalog ownership, tests, and formatting.

## Review and finish

Run `git status --short` and inspect every changed file.

Expect catalog adoption to create the lock and parent metadata.
Stop when the diff contains unrelated or unexpected changes.

If the user authorized a commit and push, commit only the reviewed bootstrap changes.

Use this commit message:

```text
chore: adopt parent skill catalog
```

Push the current branch after the commit succeeds.

Without commit authority, leave the verified changes uncommitted.
Report the repository URL, local path, parent commit, check result, and final Git status.

## Use another arrival route

The same catalog can start from a fork, clone, archive, copied tree, or new Git history.

Read [docs/catalog-inheritance.md](docs/catalog-inheritance.md) for those workflows and parent upgrades.

Do not delete Git history, overwrite local skills, force-push, or relax failed checks during bootstrap.
