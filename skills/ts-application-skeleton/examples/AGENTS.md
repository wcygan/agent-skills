# Working in this application

This is a single-process Bun + Effect + TanStack Start + Tailwind application.
It includes optional Pi chat, typed decision demos, and SQLite-backed collections.
AI calls default to intercepted provider HTTP responses (`AI_MODE=mock`), so the
application works without an API key. New databases start empty; `just seed`
explicitly adds demo collection records.

## Source and generated copies

In the `ts-application-skeleton` skill, this directory is the distributable
source template. Its parent `scripts/create.ts` reads it to create independent
applications, excluding secrets, local data, dependencies, and build artifacts.
The generator never writes back to the template. Skill updates do not modify
generated applications.

When working on the bundled template, consult the parent `SKILL.md` and relevant
`references/` documents for foundation guidance. Generated applications do not
contain those parent documents: use this application's `README.md`, `DESIGN.md`,
and source as the local references, or consult the installed skill when needed.

## Ownership boundaries

- `src/routes/` registers URLs, loaders, and page composition.
- `src/features/` owns each feature's UI and local interaction state.
- `src/app/` owns the playground shell and navigation metadata.
- `src/shared/` contains browser-safe schemas and domain data.
- `src/server/` owns Effect services, adapters, persistence, and runtime wiring.
- `README.md` documents commands, provider modes, and the request lifecycle.
- `DESIGN.md` defines the UI system. Read it before UI changes and document new
  tokens, colors, or patterns in the same change.

## Implementation and verification

Use `just setup`, `just dev`, `just check`, and `just test-browser`. Keep backend
I/O and orchestration in Effect, behind thin Start server functions. Retain
pending/error states, cancellation, schema validation, and request cleanup.
Preserve SQLite data and stale-write protection when changing collection behavior.

For the bundled template, install dependencies and run builds in a working copy
outside the catalog so distribution checks see only source files. Generated apps
can run these commands in place. Preserve `bun.lock` during ordinary installs.

The default application has local SQLite and no authentication or separate
backend server. Add other infrastructure only when the product requires it.
Keep credentials server-side. Never commit `.env`, local databases, dependency
folders, test reports, or build output; `.env.example` contains placeholders only.
