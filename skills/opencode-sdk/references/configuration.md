# Configuration, Credentials, And Isolation

Use this for host setup, resource discovery, providers, persistence, deployment,
or hermetic tests. Read `../examples/settings.ts` and the disposable runner
`../scripts/verify.ts`. These controls were checked in published 2.0.27 source.

## Explicit Host Options

| Option | Meaning in the pinned example |
| --- | --- |
| `database.path` | Places session/credential-related database state in a temporary SQLite file |
| `config.directory` | Replaces the global OpenCode configuration directory for that host |
| `config.project: false` | Suppresses project configuration discovery; it is not a general sandbox |
| `config.file` | Adds an explicitly selected config document |
| `config.content` | Supplies an inline JSON config document, applied after discovered documents |
| `models.fetch: false`, `snapshot: false`, `file` | Prevent catalog network fetching and bundled fallback; the fixture plugin contributes its model |
| `fs.filewatcher: false`, `fff: false` | Avoid watcher/background filesystem-search machinery in the fixture |
| `pty.root` | Places terminal state under the fixture root; it does not authorize shell work |

The embedded SDK's ServerOptions-derived public config surface exposes directory,
project, file, and content. Lower-level configuration discovery also has other
options; do not invent a public `config.global` flag from an internal type.
An in-memory HTTP router still owns database and filesystem services.

## Configuration Precedence

The pinned loader applies: well-known configuration, global directory documents,
explicit file, direct project files, `.opencode` directory documents, then inline
content. Project traversal runs from ancestors to descendants within each group;
`.opencode` configuration is a later group than direct files. The directory can
also contribute resources. Read source normalization and merge behavior before
assuming every field replaces an earlier value; collections have their own rules.

Use one deliberate project config location where practical. The fixture uses an
empty explicit directory, disables project discovery and supplies inline content.
A sentinel test verifies that ambient global/project agent definitions are excluded.
This is evidence about configuration discovery, not full tenant isolation.

## Instructions And Resources

Configuration and instruction discovery are separate services. In this release,
`instructions` appears in the config schema but its listed entries are not loaded
by the documented implementation; use supported AGENTS.md discovery or explicit
plugin/session instruction APIs. Do not treat a schema field as implemented
behavior without checking source and a focused test.

Inspect instruction, skill, extension/plugin, reference and MCP discovery for the
session's location and the host's home/config roots. `config.project: false` alone
does not disable every discovery mechanism. Generic business agents should have
an explicit system/context strategy and only the intended domain tools. For
multiple tenants, isolate persistence, credentials, roots and authority checks;
one host with multiple sessions is not proof of a security boundary.

## Process Roots And Credentials

Global data/cache/config/state paths are derived from XDG variables at module
initialization. Set them before importing the SDK, preferably in the child process
that owns the integration. `config.directory` controls configuration, not all data
and credential state. A host's database path is another independent setting.

The verification runner copies the fixture into a temporary app and starts child
processes with a small environment allowlist. It sets temporary XDG roots, TMPDIR
and OpenCode's test-home override, so global `.agents`/`.claude` resource discovery
uses the test tree. It forwards no provider credentials. The test-home override
is a testing control, not a recommended production tenant-isolation API. Cleanup
removes the runner-owned tree after children exit, including failure cases.

Read [authentication.md](authentication.md) for provider-specific OAuth/key
flows and active-account selection.

Real applications should resolve provider configuration deliberately and preserve
secrets as redacted values. Follow provider/integration/credential APIs rather than
assuming Pi credentials or Effect AI client credentials carry over. Separate model
resolution, authentication, and endpoint reachability. Never log credential stores,
service registration passwords, auth headers or private transcripts.

## Persistence And Deployments

Choose whether conversations survive restarts and where their database lives.
Incomplete durable execution can be resumed when a host starts; do not reuse a
dirty test database between independent scenarios. Admission durability and restart
recovery do not supply Effect Workflow replay guarantees or exactly-once domain
writes. Keep application-owned writes idempotent when replay/retry is possible.

For Bun servers, own the host at application lifetime and sessions at request/job
lifetime. Verify filesystem, SQLite, terminal and process requirements before
bundling or deploying. Cloudflare/workerd profiles use separate exports and drivers;
follow that branch of the documentation index rather than copying the Bun fixture.
