# Forma

A single Bun + TanStack Start app for working with agents to ship software.
It unifies the design-loop examples as connected React pages, rather than embedded
HTML demos. The server uses Effect v4 and local SQLite.

## Run

From this directory, run `just dev` or `bun run dev`. Both install locked
dependencies, seed missing sample records, and start Vite with hot reload.
Requires Bun 1.4+ and Node 24+ for the lint toolchain; `just` is optional.

Once the skill is globally installed, run from **any directory**:

```sh
just --justfile "$HOME/.agents/skills/design-loop/examples/justfile" dev
```

GitHub CLI installs a pinned, verified skill. The launcher detects that managed
installation and copies the application into a source-versioned writable runtime
under `${XDG_CACHE_HOME:-$HOME/.cache}/design-loop/forma/`. Dependencies and build
output stay there; sample data persists in its `data/` directory across versions.
The launcher prints **App directory**: use that directory for Browser Use setup,
checks, or experiments. Installed source files remain unchanged. To experiment
with live settings, put a private `.env` in the runtime, not the skill directory.
A repository checkout runs directly, so source edits retain hot reload.

Open **http://127.0.0.1:5173** locally. The listener binds to `0.0.0.0`, and the
launcher discovers the running Tailscale CLI, allows this machine's exact full
and short MagicDNS names in Vite, and prints the tailnet URLs. Open the printed
**http://<host>.<tailnet>.ts.net:5173** or Tailscale IP URL from another tailnet
device. No ACL or firewall changes are made. If automatic discovery is unavailable,
set `__VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS` to the exact hostname manually.
`PORT=5174 just dev` selects another port; a busy port fails explicitly.
`HOST=127.0.0.1 just dev` restricts the listener to loopback. Binding all interfaces
also permits LAN access; this unauthenticated prototype is intended for mock
sample records in a trusted development network.

`dev` seeds missing samples and preserves existing edits; `bun run seed` or **Load sample workspace** on the overview does the same.
SQLite lives in ignored `.data/app.sqlite`. Mock mode needs no `.env` or API key.

```sh
bun run check           # lint, strict types, 19 unit tests, production build
bunx playwright install chromium   # if the test browser is not installed
bun run test:e2e        # production browser journeys with disposable SQLite
bun run build
PORT=3000 bun run start # one Bun process, all interfaces, port 3000
just doctor
just backup /absolute/path/to/new-backup.sqlite
just restore /absolute/path/to/backup.sqlite /absolute/path/to/new-directory/app.sqlite
```

Ctrl-C stops the server. The optional `bun run dev:portless` needs Portless and
serves **https://forma-reference.localhost** on loopback. Use the direct listener
for Tailscale. Both development and production respect `HOST` and `PORT` overrides.

For the Browser Use workflow and the route-to-pattern map, read the skill's
`references/reference-app.md`. Inspect this implementation, record why a pattern
fits the target task, and adapt it in the target app's stack.

## Connected pages

| Route | Purpose |
|---|---|
| `/` | Actionable overview, blockers, and current goals |
| `/tickets` | Searchable roadmap, filters, bulk completion, create and detail actions |
| `/deployments` | Application surfaces, PR → version → artifact → staging → production |
| `/approvals` | Persistent drafts, review-before-submit, reviewer decisions, resubmission, history |
| `/feed` | Goals/progress updates linked to tickets and releases, replies, saved posts, notifications |
| `/settings` | Provider-first model selection, simulated connections, fast/effort controls, notifications |
| `/agent` | Dedicated chat with record-specific discussion links and related records |
| `/about` | Public product introduction, illustrative pricing, trust, FAQ, primary workspace action |

All routes share one header. **Agent** is a dedicated page. Discussion links on
tickets, releases, and approvals open a focused conversation with a prepared
question and a link back to the record.
Ticket, release, and approval links connect the same authoritative records.

## Production approval rule

A production action must have:

1. The current release revision in `Staging ready`.
2. An `Approved` request for that exact release and artifact identifier.
3. An approval that has not already been consumed by deployment.

The Effect service checks these conditions inside a SQLite transaction. Approval
and ticket decisions reject stale versions. Deployment consumes approval and
adds a linked progress update. The disabled UI button is additional guidance;
the server rejects bypasses independently. Request changes requires a reason;
resubmitting keeps the same request ID and activity history. A failed build can
be retried to simulate a repaired build and successful staging.

This is a **local application prototype**. Deployment, build execution, reviewer
identity, provider OAuth, and notification delivery are simulated. There is no
authentication; the Operator/Reviewer selector demonstrates two roles without
creating security permissions. Nothing calls a real CI system, registry, cluster,
or payment service. Supporting files persist as names only; their contents are
never read or uploaded. Real deployments need authenticated roles, CI/artifact
adapters, immutable artifact digests, and an actual deployment executor.

## Agent modes

Mock is the default: the agent returns deterministic analysis of current server
records, including blockers, related ticket IDs, and approval status. It makes
no model call and has no tools that approve or deploy. It is explicitly labeled
as local analysis; it is not general-purpose generated intelligence.

Live read-only chat is wired to the real Pi/OpenRouter adapter. To opt in, create
a private `.env` from `.env.example`, set `AI_MODE=live`, your server-side
`OPENROUTER_API_KEY`, and `OPENROUTER_MODEL`, then restart. Live calls consume
provider credits. No live provider call was used to verify this scaffold.
Each prompt receives a fresh server snapshot and current route; workspace content
is treated as data. Visible transcript stays on the agent page while it is mounted. Responses are
rendered after completion, without fake streaming. Cancellation restores the last
draft; leaving the page interrupts an active request.

The settings connection/model/fast/effort controls demonstrate the preference UI;
they persist locally but do not override the server provider configuration.
OpenAI/OpenRouter sign-in is clearly labeled as a demo connection.

## Ownership

- `src/routes`: Start routes and search validation.
- `src/app`: common shell and shared workspace state/actions.
- `src/features`: page-specific interaction and agent page.
- `src/components`: shared controls/status and attributed PromptKit adaptations.
- `src/shared/workspace.ts`: browser-safe schemas and command contract.
- `src/server/workspace`: application service, relational storage, approval rule.
- `src/server/functions/workspace.ts`: thin Start RPC boundaries and contextual agent.
- `src/server/runtime.ts`: one process-owned Effect runtime, with shutdown/HMR disposal.
- `src/server/storage`: migrations and backup/restore.

The scaffold's optional decision and collection demo features were removed.
Its first database migration remains as immutable migration history; application
records use the workspace tables. See [DESIGN.md](DESIGN.md),
[design brief](docs/design-brief.md), and [PromptKit integration result](docs/prompt-kit-integration.md).

PromptKit MIT attribution is retained under `src/components/prompt-kit/`.
Provider icons were copied from the existing browser-navigation demo's
`public/providers` assets. They are vendor marks used for identification, not
Forma-owned marks or endorsements. This application replaces the former standalone HTML examples in design-loop.
The parent catalog license is included as LICENSE for standalone reuse.
