# Foundation

A minimal single-process Bun app with TanStack Start, React, Tailwind CSS,
Effect v4, Oxlint, Pi, and OpenRouter. Both AI feature areas work without a real API key.

## Generate a new application

With this skill installed, run:

```sh
bun ~/.agents/skills/ts-application-skeleton/scripts/create.ts ~/Development/my-app
cd ~/Development/my-app
just dev
```

Use the actual skill path if installed elsewhere. The generator installs locked
dependencies and sets your package name and Portless hostname. The destination
must not exist. `--name my-app` supports destination paths containing spaces;
`--skip-install` lets you defer installation. Generated applications are independent
copies, so subsequent skill updates do not overwrite application changes.

## Run the distributed example

The entire application lives in the skill's `examples/` directory and travels
with the skill. Copy it to a working directory before installing dependencies,
so generated files stay outside your installed skill catalog:

```sh
# Replace the source path with this skill's installed location.
cp -R /path/to/ts-application-skeleton/examples ./foundation
cd foundation
just setup
just dev
```

Requires Bun 1.4+, Node.js 24+ (for Portless), `just`, and a global Portless
installation. Verified with just 1.51.0 and Portless 0.15.6. Install Portless
with `npm install -g portless@0.15.6` if it is missing.

Open **https://foundation.localhost** (use the URL printed by Portless in a
linked Git worktree). No `.env` file is needed for mock mode.

`just dev` calls `bun run dev`, which runs Bun/Vite through Portless. Portless
assigns the backend port, and Vite reads `PORT` with strict port binding.
React Fast Refresh, Tailwind updates, and Start server-module reloads work
through the proxy, including its WebSocket forwarding. Backend changes replace
the Effect runtime when its dependencies change. Restart dev mode after editing
`.env`; environment changes are not source hot reloads.

Portless reuses the machine's existing proxy. On a fresh machine, its first run
may request OS permission to trust its local certificate and bind HTTPS port
443. See [Portless setup](https://portless.sh/) for those one-time steps.
Stop this app with Ctrl-C; the shared proxy remains available to other apps.
To bypass the proxy temporarily, use `PORTLESS=0 just dev` and Vite's printed URL.

Run `just` to list setup, development, verification, and data-maintenance commands.
The justfile is the public command surface; package scripts own the commands.
Bun loads the optional `.env`; just does not read or echo its secrets.

## Provider mocking

`AI_MODE=mock` is the default. MSW intercepts outgoing OpenRouter HTTP requests
inside the server process. Pi consumes a normal streaming response; the decision
adapter consumes TypeSafe System One JSON. The React UI, server functions, Effect layers,
real Pi SDK, and real `DecisionModel` validation still execute.

Responses are deterministic fixtures, not generated intelligence. The examples
cover coffee-shop dependency injection, reading-app features, support-ticket
classification, ranking, evidence checks, action previews, skill selection, and
source extraction. Decision scenarios include uncertain and no-match results. Other agent prompts receive a generic fixture. Ticket fixtures
use simple keyword matching. The page banner identifies the active mode.

The mock provider also supports these failure scenarios:

- `[mock:rate-limit]`: HTTP 429, available in Pi chat and backend decision tests.
- `[mock:invalid]`: malformed decision JSON, exercised by backend tests.

Mock mode uses a dummy credential, ignores any real key you have configured,
and blocks unmatched external HTTP requests. Local development requests can
pass through. The interception layer is scoped to the shared Effect runtime
and is removed at shutdown. No separate mock server or process is needed.

## Optional live mode

```sh
cp -n .env.example .env
```

Then edit `.env` and restart:

```dotenv
AI_MODE=live
OPENROUTER_API_KEY=your-key-here
OPENROUTER_MODEL=openai/gpt-4.1-mini
OPENROUTER_DECISION_MODEL=typesafe/jev-1.13
HOST=127.0.0.1
PORT=3000
```

`.env` and `.env.*` are ignored, except `.env.example`. Secrets stay server-side
in Effect redacted configuration. Live requests consume OpenRouter credits;
choose a chat model available in Pi’s catalog. Decisions independently default
to `typesafe/jev-1.13` through `OPENROUTER_DECISION_MODEL`. Mock tests
do not establish live model availability or response quality.

The dev backend and production listener bind to loopback. This local example has no
authentication or public deployment configuration. SQLite persistence is enabled by default.

## Pages and architecture

- `/`: overview and setup.
- `/pi-agent`: a PromptKit-based chat window with suggestions, message rows,
  Markdown replies, copy, stop, and new-chat controls. The transcript stays in
  the mounted page; each prompt starts a fresh in-memory Pi session without
  filesystem or shell tools, extensions, or inherited context files.
- `/collections`: persistent collection overview, status counts, and create form. New databases start empty.
- `/collections/$itemId`: an individual collection item with a stable URL, owner,
  description, details, and highlights. Unknown IDs render a 404 with a link back to the overview.
  Both loaders call the shared Effect bridge and read a deterministic service
  layer. SQLite stores the records; no model call is needed. Edit and delete operations reject stale versions.
- `/decisions`: a directory of six decision demos, each with its own URL:
  - `/decisions/tickets`: ticket category and urgency drive a queue suggestion.
  - `/decisions/ranking`: 15 Score questions assess five features; sliders
    recombine the answers without another provider request.
  - `/decisions/evidence`: code checks quote presence, then Choice judges
    support; uncertain results route to review.
  - `/decisions/actions`: parallel questions select a handler and bounded
    arguments. Only the relevant arguments are consumed; devices are not controlled.
  - `/decisions/skills`: shortlist a small catalog, then inspect detailed scope;
    either stage can return no recommendation. No skill is executed.
  - `/decisions/extraction`: code finds invoice amounts, Choice selects a source
    span, and code copies and normalizes it to integer cents.

The demos accept preset scenarios. Mock mode uses deterministic provider fixtures,
including uncertain and no-match outcomes. The inspector exposes input and typed
judgments; request counts describe the workflow, not latency or quality measurements.
Unknown scenario IDs fail explicitly. All demos use the same server and adapter
path in mock and live modes.

```text
React → Start validator → server function → Effect request bridge
                                            ↓ shared runtime
                         ┌──────────────────┴──────────────────┐
                    AgentRunner                         ticket assessment
                         ↓                                     ↓
                        Pi                               DecisionModel
                         └──────────────────┬──────────────────┘
                                    OpenRouter HTTP
                                            ↓
                               local MSW fixtures (default)
```

- `src/components/prompt-kit/`: locally maintained PromptKit adaptations and
  upstream MIT attribution. Markdown uses GFM and escaped code blocks, skips
  raw HTML, keeps safe URL handling, and renders remote images as descriptions.
- `src/shared/contracts.ts`: browser-safe schemas and result types.
- `src/server/config.ts`: mode, model, and redacted credentials.
- `src/server/mocks/openrouter.ts`: HTTP/SSE fixtures and scoped interception.
- `src/server/adapters/`: real SDK and provider boundaries.
- `src/server/decisions/`: `Decision.make` definitions and application policy.
- `src/server/layers.ts`: dependency composition; interception starts first.
- `src/server/runtime.ts`: process-owned, server-only shared runtime.
- `src/server/start-bridge.server.ts`: the only Start-to-Effect execution handoff.
- `src/server/request-effect.ts`: request scope, deadline, output encoding, error policy.
- `src/server/request-context.ts`: request ID and operation, isolated per invocation.
- `server/plugins/runtime.ts`: runtime initialization and shutdown cleanup.

Every server function uses `Schema.toStandardSchemaV1` for its input (when
present), then calls `runServerEffect` with an output schema and an Effect.
LOG_LEVEL accepts Debug, Info, Warn, Error, or None (default Info). Request logs
include operation, reference, duration, and outcome without payloads.
The bridge creates a request ID, forwards the HTTP abort signal, and supplies
request scope, a 60-second deadline, log context, and an operation span.
Application services do not import Start or execute runtimes.

Responses are typed success/error envelopes. Expected errors carry a stable
code and safe message; unexpected defects are sanitized. Error cards show the
server-generated reference for log correlation. Standard Schema validation,
CSRF, and network failures remain Start transport errors and use the UI's
transport-error handling. Default Start CSRF protection remains enabled.

The decision adapter distinguishes rate limiting, configuration, provider
failure, and invalid output. Pi reports provider failures without inferring
HTTP status codes from SDK error text. No automatic retry is added.

Request tests verify finalization, context isolation, cancellation, output
validation, and deadlines using a controllable Effect clock. These establish
Effect-side interruption; browser disconnect propagation through a particular
hosting adapter and live provider still requires deployment-specific testing.

The application-owned OpenRouter decision adapter calls
`https://openrouter.ai/api/v1/systemone` using the same OpenRouter API key.
It maps Effect `Classify` to TypeSafe `choice`, `Probability` to `noul`, and
`Rate` to `score`. Score level indices map back to their rubric descriptions;
Choice and Score confidence are preserved. Independent questions share a request.
It does not use chat completions or generated decision JSON.
The request and mock contracts follow the current
[OpenRouter System One guide](https://openrouter.ai/docs/guides/community/typesafe-sdk)
and [TypeSafe API](https://docs.typesafe.ai/api). Effect validates labels,
probability ranges, and sums. Mock probabilities are fixtures; live performance
and review thresholds require evaluation on the target data. Requests forward cancellation to Pi and fetch.

Pinned Effect `4.0.0-rc.116` uses `Schema.TaggedError`; older v4 guidance may call
it `TaggedErrorClass`. Nitro's Bun preset serves everything in one process.
Oxlint enforces TypeScript, React, accessibility, and all anti-slop rules:
18 generic rules from `anti-slop` and 5 Effect rules from `anti-slop-effect`, all
at error severity. Both plugins are vendored under `tools/oxlint/anti-slop/`.
See its `UPSTREAM.md` for the pinned revision and license attribution.
`oxlint` and `@oxlint/plugins` are pinned together at `1.83.0`.

Generated route code and vendored plugin source are excluded from app linting;
no anti-slop rules are disabled for application code or tests. The lint-policy
tests verify rule coverage and exercise both plugins against temporary fixtures.

## Verify and build

```sh
just check
just start
```

`check` runs lint, strict typechecking, tests, and the production build. `start`
serves http://127.0.0.1:3000. Tests exercise actual Pi streaming and decision
adapters through mocked HTTP, plus policy, validation, failures, and the network
block. No real key or paid calls are used.

The current Nitro build emits upstream `use client` bundling warnings. Browser
checks cover the built app as well as the automated backend tests.

## Chat UI foundation

The layout follows [PromptKit's Full Chat App](https://www.prompt-kit.com/c/full-chat-app).
Selected Message, Prompt Suggestion, Markdown, and Chat Container sources were
reviewed on 2026-09-20 and adapted to the existing Tailwind styles and Effect
server function. See `src/components/prompt-kit/UPSTREAM.md` for exact registry
sources, hashes, local changes, and license. Dependencies are pinned in the
manifest and lockfile; `just setup` installs them. No additional environment
variables are required.

Try “Write a little code” to exercise Markdown headings, lists, inline code,
and a fenced TypeScript block in mock mode. Enter sends; Shift+Enter adds a
line. Stop restores the last draft, and New chat clears the visible transcript.
Messages are independent runs, not a persisted or contextual multi-turn session.
Responses appear when the backend completes; no simulated streaming is used.


## Local data and maintenance

SQLite data lives in APP_DATA_DIR (default .data in the app directory), separate
from build output. Startup runs versioned migrations before services become
available. The directory and SQLite sidecars are gitignored. Do not store real
data in the installed skill directory.

- just doctor checks prerequisite tools and configuration without revealing secrets.
- just seed adds missing lorem ipsum collection items, preserving existing edits.
- just backup /path/to/new-backup.sqlite exports a consistent backup to a new file.
- just restore /path/to/backup.sqlite /path/to/new-directory/app.sqlite restores
  into a new file and validates integrity. Create the destination directory first.
  Stop the app, point APP_DATA_DIR there, and restart. Keep the original data
  until the restored app is verified.
- just test-browser runs production browser journeys against disposable SQLite
  data. First install Chromium with bunx playwright install chromium.

The browser test server reserves port 4199 and refuses to reuse an existing
server. Database maintenance commands never overwrite an existing backup or
restore destination. Backups can contain private data: keep them outside Git.

## Updating this foundation

foundation.json records the template version. Applications are independent
copies; skill updates never overwrite them. Version 0.2.0 adds SQLite persistence,
explicit seeding, collection CRUD, and browser testing to the earlier fixture
demo. Existing apps need the SQL adapter, initial migration, and APP_DATA_DIR
configuration; fixture-only versions have no persisted records to migrate.

Apply future template changes selectively. Pin Effect and its SQL adapter to
compatible releases, retain bun.lock, and verify checks, browser journeys,
database upgrades, and restoration before using an updated app with real data.
The bundled GitHub Actions workflow runs tests and browser checks without secrets.

## Adapt the UI

The UI has three boundaries:

- `src/routes/` registers URLs and loaders. Collection routes pass loader data
  into feature components; chat and decisions mount their feature page directly.
- `src/features/pi-agent/`, `src/features/decisions/`, and
  `src/features/collections/` own demo UI and interaction state. Features import
  shared components directly and do not import one another or route modules.
- `src/app/` owns the playground shell and presentation metadata.
  `AppShell` accepts navigation, an optional banner, and page children. It has
  no provider or feature imports. `src/components/` holds shared presentation
  such as `PageHeading`, route feedback, and the adapted PromptKit components.

To remove a demo from the UI, delete its entry in `src/app/examples.ts`, its
route file(s), and its matching feature directory. The metadata entry controls
both the navigation link and overview card. Run `bun run build` to regenerate
`src/routeTree.gen.ts`; do not edit that generated file by hand. Update the
home-page introduction and remove the demo's browser tests as appropriate.

To replace the playground chrome, change the `AppShell` composition in
`src/routes/__root.tsx`. To remove the provider banner and its request, remove
that route's `getProviderMode` import, loader, `useLoaderData` call, and banner
prop together; the shell itself needs no changes. The overview's “Make it yours”
section is demo content owned by `src/routes/index.tsx`.

These are UI removal boundaries. Backend services, shared contracts, provider
mocks, and dependencies remain explicit: trace their remaining callers before
removing them, since both AI demos share server infrastructure. Keep the
collection editor and status presentation with the collection feature when
replacing its domain model. Request cancellation stays inside each AI page,
where its different retry and reset behavior is visible.

Run `just check` and `just test-browser` after adapting the application.
