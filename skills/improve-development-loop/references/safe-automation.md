# Safe Automation

Use these patterns when repeated changes need generation or a manual workflow
needs a narrow interface for automation. Keep inputs explicit and authority no
broader than the original operation.

## Contents

- [Common-change scaffolding](#common-change-scaffolding)
- [Bounded automation interface](#bounded-automation-interface)

## Common-change scaffolding

**Signal:** Adding a route, component, handler, migration, fixture, test, or
similar unit repeatedly requires copying a known file set and editing the same
registries or metadata.

**Intervention:** Add a narrow generator or template-backed command for one
stable change shape.

**Minimum contract:**

- Accept a small explicit input schema and reject unknown inputs.
- Support dry-run or preview the exact target paths and registrations.
- Refuse collisions and never overwrite user-owned files silently.
- Produce deterministic, formatted output using current repository conventions.
- Update only the required indexes, manifests, or registries.
- Run focused validation against the generated result.

**Acceptance evidence:** Generate two representative variants, compare repeated
generation for determinism, exercise invalid names and collisions, and prove the
output passes the same checks as a manually authored example.

**Avoid when:** The change shape is still evolving, generation would preserve
accidental boilerplate, or fewer than several repeated edits would be removed.

## Bounded automation interface

**Signal:** A workflow is available only through interactive clicks, free-form
shell access, repeated copy-paste, or an interface with implicit scope and
authority.

**Intervention:** Add a narrow command or typed tool that exposes the required
operation to both people and automation.

**Minimum contract:**

- Advertise every accepted input and reject unknown inputs.
- Validate scope before acting.
- Declare side effects, external access, timeout, and retry behavior.
- Return stable exit statuses and optionally machine-readable results.
- Preserve explicit approval boundaries for sensitive or irreversible actions.
- Avoid arbitrary commands, paths, URLs, queries, or executable flags.

**Acceptance evidence:** Exercise valid, invalid, unknown, unauthorized, timed
out, and interrupted calls. Confirm failures preserve the earliest cause and do
not degrade into a broader default operation.

**Avoid when:** The adapter grants more authority than the original workflow or
creates a generic shell, filesystem, network, or production-control endpoint.
