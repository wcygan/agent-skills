---
name: ts-application-skeleton
description: Scaffold, adapt, or plan a minimal single-process Bun TypeScript application with an Effect v4 backend, TanStack Start React UI, Tailwind CSS, Oxlint, OpenRouter, Pi agents, and typed decision models. Use when establishing this foundation, refactoring its bundled skeleton into an application, removing demo features, or deciding where a new capability belongs.
---

# TypeScript Application Skeleton

Use one package and one production Bun process. TanStack Start serves the UI
and server endpoints; Effect owns backend workflows, dependencies, errors, and
resource lifetimes. These are application defaults, not a request to migrate an
existing app or add every optional integration.

## TypeSafe guidance

For typed AI decision work, use the separately installed
[upstream TypeSafe skill](https://github.com/typesafe-ai/skills). This catalog
does not vendor it; upstream owns its guidance and updates. If it is missing,
install it directly:

```sh
gh skill install typesafe-ai/skills skills/typesafe-ai --dir ~/.agents/skills
```

The bundled demos use mocked providers and run without installing this companion
skill or configuring a provider key. The companion supplies development guidance,
not an application runtime dependency.

## Bootstrap an application

Run the bundled generator when creating an independent application:

```sh
bun /path/to/ts-application-skeleton/scripts/create.ts /path/to/my-app
```

The destination must not exist. The script derives its package name and Portless
hostname from the directory, copies the template without secrets or local build
artifacts, and installs the locked dependencies. Use `--name my-app` when the
folder name is not a valid lowercase hostname, or `--skip-install` to only copy.
Then run `just dev` inside the new application. Updating this skill does not
modify generated applications.

Read [bootstrap details](references/bootstrap.md) for prerequisites, failure
recovery, and the temporary-directory startup test.

## Bundled skeleton application

`examples/` is the complete runnable application and the generator's source
template, including its lockfile, UI, backend, and tests. Edit it when improving
this distributed foundation; edit the generated copy when building a client's
application. Generated apps are independent copies, not consumers of a shared
runtime package.

Read [the application guide](examples/README.md) when running the skeleton or
adapting its features. Read [the design system](examples/DESIGN.md) before UI
changes; preserve its typography, spacing, tokens, and interaction states unless
a redesign is requested. Install dependencies and generate build artifacts in
a copy outside the skill catalog.

The playground demonstrates three optional feature areas:

- **Pi agent:** chat suggestions, Markdown replies, copy, cancellation, and
  reset. Each prompt starts a fresh Pi session; the visible transcript stays
  in the mounted page.
- **Decisions:** a directory of typed assessment demos, including ticket routing,
  ranking, evidence checks, bounded action previews, skill selection, and source
  extraction. These demonstrate application policy without executing the
  suggested actions.
- **Collections:** SQLite-backed list/detail pages and create, edit, and delete
  forms with validation and stale-write protection. New databases start empty.

AI features default to intercepted provider HTTP responses, so real adapters
and Effect workflows run without an API key. Use `AI_MODE=live` only when real
provider calls are wanted. Demo features are examples to replace or remove,
not requirements for every generated application.

## Adapt and refactor the skeleton

Use the existing ownership boundaries rather than creating a generic feature
framework. Paths below are relative to `examples/` or a generated app:

| Boundary | Ownership and adaptation point |
| --- | --- |
| `src/routes/` | URL registration, loaders, and page composition. Keep transport concerns here and pass loader data into feature UI. `routeTree.gen.ts` is generated. |
| `src/features/` | Feature pages and local interaction state. Pi, decisions, and collections have separate directories; collection editor, actions, and status styling stay with collections. |
| `src/app/` | Playground shell, navigation, banner, and overview cards. `examples.ts` supplies navigation and card metadata without importing feature implementations. |
| `src/components/` | Shared presentation: page headings, route feedback, and attributed PromptKit adaptations. Import components directly. |
| `src/shared/` | Browser-safe contracts and demo definitions used across UI and server boundaries. |
| `src/server/` | Effect services, decision policy, adapters, persistence, and composition. UI removal does not automatically remove these dependencies. |

Choose the smallest refactoring that supports the intended product:

- **Replace the shell or branding:** compose `AppShell` in
  `src/routes/__root.tsx` with navigation, an optional banner, and page children.
  Its layout has no feature or provider imports. Change shared visual tokens in
  `src/styles/app.css`; keep the design document aligned with intentional changes.
- **Remove a top-level demo:** remove its entry in `src/app/examples.ts`, its
  route files, and its feature directory. Update overview copy and affected
  browser journeys. For one nested decision demo, inspect its route and
  `src/shared/decision-demos.ts` entries while retaining other consumers of the
  shared decision UI and backend.
- **Remove provider chrome:** remove the banner composition and its
  `getProviderMode` import, root loader, and loader-data read together. Removing
  only the visible banner leaves the provider request in place.
- **Replace a domain:** adapt collection UI together with its shared schemas,
  server functions, and service. If persisted records already exist, plan a
  database migration separately from a behavior-preserving UI refactor.
- **Split a growing feature:** extract cohesive presentation or feature-local
  state when it simplifies independent changes. Prefer explicit components and
  children over additional mode flags; share repeated meaning, not merely
  similar JSX. Keep chat reset/cancellation and assessment selection behavior
  explicit rather than forcing both into a generic request controller.
- **Prune unused infrastructure:** trace remaining imports, server functions,
  `src/server/layers.ts`, runtime startup, mocks, configuration, tests, and
  dependencies before removing a provider or storage integration. Preserve
  attribution for retained third-party adaptations.

For structural refactors, preserve URLs, rendered elements/styles, accessible
labels, pending/error states, cancellation, and persistence semantics unless
changes to those behaviors are requested. Regenerate routes with `bun run build`
after route changes instead of editing `src/routeTree.gen.ts` by hand. Run
`just check` and `just test-browser` in the app; compare representative desktop
and mobile views when preserving the look and feel. Continue through these
checks within the requested implementation scope.

## Minimal architecture

```text
React UI → Start server function/route → Effect application service
                                         ↓ required capabilities
                                      adapter layers → external systems

server composition root → shared Effect runtime → services + adapter layers
```

Keep transport code thin. Pure domain rules may be ordinary TypeScript;
backend I/O and orchestration must compose as Effects. React rendering and
local UI state do not need Effect wrappers.

Use this initial layout, creating optional modules only when used:

```text
package.json                 # scripts and pinned dependencies
bun.lock
justfile                     # setup, dev (Portless + hot reload), check, build, start
tsconfig.json                # strict TypeScript
vite.config.ts               # Start, React, Tailwind build integration
oxlint.config.ts
.env.example                 # placeholders only
src/
  router.tsx
  routes/                    # Start registration, loaders, page composition
  app/                       # shell and application navigation
  features/<feature>/        # feature UI and local interaction state
  components/                # shared presentation when needed
  styles/app.css
  shared/                    # transport schemas/types safe for the browser
  server/
    runtime.ts               # process-owned runtime and lifecycle
    start-bridge.server.ts   # Start request → Effect handoff
    request-effect.ts        # request scope, deadline, output/error policy
    request-context.ts       # immutable per-request service
    layers.ts                # production dependency composition
    collections/             # example domain service; replace for your domain
    storage/                 # SQLite migrations, database, backup/restore
    adapters/                # provider, SDK, storage implementations as needed
    functions/               # thin Start server functions
    decisions/               # optional typed assessments and routing policy
```

Paths describe ownership; adapt framework entry filenames to the installed
Start version. Do not add a separate API server, worker process, monorepo,
additional database server, queue, generic repository layer, or dependency-injection framework
without an actual requirement. SQLite via @effect/sql-sqlite-bun is the default
local persistence layer; new applications start with an empty database.

## Read the relevant foundation

For a new app, read Bun, Effect, Start, Tailwind, Oxlint, local persistence, testing, and local operations; read anti-slop
when selecting lint policy. For an existing app, load only affected areas.

| Area / trigger | Reference |
| --- | --- |
| Local SQLite, migrations, seed, backup/restore, optional persistence APIs | [Local persistence](references/local-persistence.md) |
| Bun/Effect tests, browser journeys, database recovery evidence | [Testing strategy](references/testing.md) |
| Local commands, diagnostics, external-call policies, upgrades, optional extensions | [Local operations](references/local-operations.md) |
| Runtime, TypeScript, scripts, environment, production process | [Bun and TypeScript](references/bun-typescript.md) |
| Backend behavior, service boundaries, layers, errors, lifecycle | [Effect backend](references/effect-backend.md) |
| Routes, server functions, SSR, browser/server separation | [TanStack Start](references/tanstack-start.md) |
| CSS installation, tokens, component styling | [Tailwind CSS](references/tailwind-css.md) |
| Lint command, configuration, CI integration | [Oxlint](references/oxlint.md) |
| Opinionated lint rules or local plugin adoption | [Anti-slop rules](references/anti-slop.md) |
| Model credentials, endpoint, provider configuration | [OpenRouter](references/openrouter.md) |
| Stateful LLM runs, tools, sessions, agent events | [Pi agent framework](references/pi-agent.md) |
| Typed model assessments and application routing | [Decision framework](references/decision-framework.md) |

When integrating Pi with OpenRouter, read both references plus Effect. When
adding decisions, read the decision and Effect references, then the actual
provider's documentation; a chat endpoint is not evidence of decision support.

## Execution and completion

1. Inspect existing instructions, package versions, and entrypoints. For a new
   app, resolve compatible versions and commit the lockfile; check the matching
   official docs before using version-sensitive APIs.
2. Build the smallest requested vertical slice: UI input → server boundary →
   Effect service → typed result displayed in the UI. Use test layers for
   external integrations so basic verification needs no paid model call.
3. Wire one production runtime, cleanup, scripts, and relevant foundation
   configuration. Keep working through implementation and verification when
   those are requested; planning does not introduce a new approval gate.
4. Run lint, typecheck, focused tests, and a production build. Smoke-test the
   built app under Bun, including the server call and rendered UI. For active
   integrations, verify failure mapping and interruption/resource cleanup.
5. Report the structure, resolved versions, checks, and any integration that
   remains unverified. A scaffold-only request can omit live integrations but
   must label placeholders rather than presenting them as working code.
