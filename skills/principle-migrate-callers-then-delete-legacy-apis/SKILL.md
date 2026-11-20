---
name: principle-migrate-callers-then-delete-legacy-apis
description: "Apply when introducing a new internal API while old callers still exist. Migrate callers and delete the old API in the same wave instead of preserving compatibility layers."
license: MIT
metadata:
  kind: principle
  upstream-repository: https://github.com/cursor/plugins
  upstream-revision: afd51cf66a3100a95f878d6c4b93a01f6508e3b0
  upstream-path: pstack/skills/principle-migrate-callers-then-delete-legacy-apis
  upstream-author: Lauren Tan
  maintenance: local
---

# Migrate Callers Then Delete Legacy APIs

When a new internal API replaces an old one, migrate every caller and delete the old API in the same wave. Do not keep a compatibility layer so that migration can happen later.

- Inventory every caller, including tests, scripts, and generated code.
- A temporary adapter is the exception: only when the migration must land in more than one wave, and with its removal in the plan.
- Update tests to assert the new contract, and delete tests that only protect the old implementation.

This applies when no external users depend on the old API, or the project has agreed to a coordinated breaking change. An API with external consumers you cannot migrate needs a deprecation period instead. Name what was removed and what replaced it in the recap.

The test: does a search for the old name return nothing?

Adapted from pstack; [license and attribution](references/LICENSE.txt).
