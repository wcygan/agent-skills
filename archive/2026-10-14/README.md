# Catalog archive — 2026-10-14

This archive captures every tracked repository file at commit `fe444ec0b007d73cff0445db7d223a34c4cc8cd5` before
the catalog reset: 116 skills, their scripts, references and assets, tests,
maintenance code, source locks, attribution and licenses. The date uses
America/Chicago. Generated caches, installed dependencies and private runtime
state are excluded because they were not tracked repository content.

- `catalog.tar.gz` contains the original paths and file contents.
- `manifest.json` records the source commit, archive SHA-256, original catalog
  snapshot, and the 113 retired skills.
- `skill-inventory.md` and `skill-inventory.json` describe the catalog,
  provenance, dependencies and orchestrators at the reset boundary.

The active catalog contains only `uv-python`, `just`, and `design-loop`. Their
pre-reset versions also remain in this archive. Archives are historical source,
not installable catalogs: SKILL.md entrypoints exist only inside the bundle,
so GitHub CLI discovery cannot install them.

Inspect or restore outside an active skill discovery directory:

```sh
mkdir -p /tmp/agent-skills-2026-10-14
tar -xzf archive/2026-10-14/catalog.tar.gz -C /tmp/agent-skills-2026-10-14
```

To restore one skill deliberately, copy its complete extracted directory into
`skills/`, preserve its attribution, validate it, and refresh the snapshot.
Forks using catalog inheritance remove retired parent-owned skills on upgrade;
independently owned additions and explicitly blocked names retain their ownership.
