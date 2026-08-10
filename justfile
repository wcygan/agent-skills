# List supported project commands.
default:
    @just --list

# Adopt the configured parent. Optional values override catalog-seed.json.
catalog-adopt $CATALOG_REPOSITORY="" $CATALOG_REVISION="" $CATALOG_TRACKING_REF="":
    uv run --locked tools/catalog.py adopt

# Check catalog configuration, content, and required tools.
catalog-doctor:
    uv run --locked tools/catalog.py doctor

# Restore files from an interrupted catalog transaction.
catalog-recover:
    uv run --locked tools/catalog.py recover

# Reproduce all inherited content from the locked parent commit.
catalog-sync:
    uv run --locked tools/catalog.py sync

# Verify inherited content or this repository's source snapshot.
catalog-verify:
    uv run --locked tools/catalog.py verify

# Refresh the source snapshot after distributable content changes.
catalog-snapshot:
    uv run --locked tools/catalog.py snapshot

# Check that the source snapshot matches distributable content.
catalog-snapshot-check:
    uv run --locked tools/catalog.py snapshot-check

# Check the moving parent reference without changing files.
parent-check:
    uv run --locked tools/catalog.py check

# Preview a parent upgrade. An empty target uses the tracking reference.
parent-upgrade-preview $CATALOG_TARGET="":
    uv run --locked tools/catalog.py upgrade --dry-run

# Upgrade inherited content. An empty target uses the tracking reference.
parent-upgrade $CATALOG_TARGET="":
    uv run --locked tools/catalog.py upgrade

# Validate directly vendored skills.
vendor-validate:
    uv run --locked tools/sync_skills.py validate

# Run the maintenance test suite.
test:
    uv run --locked python -m unittest discover -s tests -v

# Run the repeatable local and CI validation gate.
check:
    just --fmt --check
    uv lock --check
    uv run --locked python -m unittest discover -s tests -v
    uv run --locked tools/sync_skills.py validate
    uv run --locked tools/catalog.py verify

# Run the local gate and the GitHub skill publication check.
check-full: check
    gh skill publish --dry-run
