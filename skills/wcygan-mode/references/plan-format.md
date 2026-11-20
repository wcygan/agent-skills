# Executable plan format

Use `## Goal`, `## Scope`, and `## Completion` with nonempty prose, followed by
uniquely named `## Unit <id>` sections. IDs use letters, digits, underscores,
periods, and hyphens. Each unit has these single-line field labels; subsequent
lines continue the preceding field:

```markdown
# Example change

## Goal
Make export preserve the requested column order.

## Scope
The export adapter and its callers; no storage migration.

## Completion
An exported file preserves the supplied order and existing escaping behavior.

## Unit export
Status: pending
Depends on: none
Write scope: src/export.py and tests/test_export.py
Acceptance: Requested column order is preserved for every exported row.
Verification: Exercise export through the public API and inspect the resulting file.
Evidence: pending
```

Statuses are `pending`, `running`, `blocked`, and `complete`. Dependencies are
comma-separated unit IDs or `none`, with no cycles. A complete unit cannot depend
on an incomplete one and must link its evidence.

Acceptance, write scope, and verification hold concrete content, not placeholder
words. Add a `Performance:` field (metric, baseline, method, failure threshold)
only when performance is an acceptance criterion.
