# Executable plan format

The checker validates this Markdown structure. It does not enforce punctuation,
exact prose, a fixed count of verification lanes, or a specific runtime.

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
comma-separated unit IDs or `none`. Every referenced dependency must exist and
cycles are rejected. A complete unit cannot depend on an incomplete unit.

Acceptance, write scope, and verification must contain concrete content, not
placeholder words. A complete unit must include a Markdown evidence link.
Relative file evidence resolves from the plan's directory and must exist.
Remote links are recorded but not fetched by the checker; review their contents.

Use an optional `Performance:` field to record the metric, baseline, measurement
method, and failure threshold when performance is an acceptance criterion.
Otherwise ordinary behavioral verification is sufficient. The checker validates
structure; the author must still judge the adequacy of the checks and evidence.

Headings and field-like examples inside fenced code blocks are ignored. Unclosed
fences are errors. Unrelated prose and additional sections are allowed.
