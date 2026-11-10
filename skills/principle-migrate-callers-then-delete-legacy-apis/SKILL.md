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

**Trigger:** you are introducing a new internal API, and callers of the old one still exist.

**Rule:** migrate the callers and delete the old API in the same wave. Do not keep a compatibility layer so that migration can happen "later."

**Why:** keeping both paths doubles the surface to test and reason about, and "later" rarely comes: the old path keeps gaining callers because it still works. The codebase becomes append-only, and the cleanup is harder every month.

**Pattern:**
- Inventory every caller (search the whole repository, including tests, scripts, and generated code), migrate them, and delete the old API in the same change or the same short sequence of changes.
- Treat a temporary adapter as exceptional and time-boxed: it exists only when the migration must land in more than one wave, it carries a removal date or a tracking reference, and the removal is part of the plan, not a hope.
- Update tests to assert the new contract, and delete tests that only protect pre-refactor implementation details.
- A lever (a codemod or script) is the right way to migrate more than a handful of callers; see build-the-lever.

**When this applies:**
- No external users depend on the old API, or the project has agreed to absorb a coordinated breaking change.
- The new API is part of a simplification or refactor the project has decided on.

**When it does not:** an API with external consumers you cannot migrate yourself needs a deprecation period and a versioned release, which is a different procedure; say so and plan that instead.

**Breaking change and go-ahead:** deleting an API is a breaking change for anyone still calling it. Say so in the closing recap, naming what was removed and what replaced it. Callers outside the task's scope, or owned by others, need an explicit go-ahead before the deletion lands: migrate what is in scope, report the rest with locations, and ask.

**Test:** after the change, does a search for the old name return nothing but history? If a caller remains, the wave is not finished.

Adapted from pstack; [license and attribution](references/LICENSE.txt).
