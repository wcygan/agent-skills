# Bun and TypeScript

Read when creating the package, scripts, runtime entrypoint, or environment setup.

## Foundation

- Use Bun to install dependencies and run the production application. Keep one
  package and `bun.lock`; use `bun install --frozen-lockfile` in CI.
- Enable TypeScript `strict` mode. Bun executes TypeScript but does not replace
  typechecking; provide a separate `tsc --noEmit` script.
- Provide `dev`, `build`, `start`, `typecheck`, `lint`, and `test` scripts.
  Derive dev/build/start commands from the selected Start hosting integration;
  do not assume a generated server output path. Verify that `start` actually
  uses Bun. Development build tooling may differ from the production process.
- Use `bun test` for ordinary tests unless the project needs an Effect-aware
  runner; keep that choice explicit in the test script.
- Keep `.env` ignored. Commit `.env.example` with `OPENROUTER_API_KEY=` when AI
  is enabled. Bun loads environment files; Effect configuration owns parsing
  and validation inside the backend.

## Development commands

The bundled example exposes `just setup`, `just dev`, `just check`, `just build`,
and `just start`. Keep recipes as thin wrappers over package scripts. Copy the
example outside the skill before installing dependencies.

Use Portless for a stable development hostname. The example runs
`portless run --name foundation bun --bun vite --host 127.0.0.1`; Vite reads
Portless's `PORT` explicitly and enables `strictPort` so the proxy cannot silently
point at the wrong listener. React/Vite hot reload remains enabled; production
hosting does not depend on Portless. Node.js 24+ is required for the Portless CLI.
See the example README for global installation, HTTPS trust, and proxy bypass.

Verify a client edit updates without navigation and a server edit changes the
next server-function response. Restore temporary probes after checking them.

## Process ownership

The Start server and Effect runtime live in the same process. Startup builds
application dependencies before accepting work. Shutdown stops accepting work,
interrupts/drains active work according to a bounded policy, and releases the
runtime. Verify the installed hosting adapter's lifecycle hooks. Development
reload must dispose replaced runtimes rather than duplicate background work.

## Evidence

Run a frozen install, typecheck, build, and production start. Exercise a UI route
and server call; stop the process and check that owned work is cleaned up.

Sources: [Bun docs](https://bun.com/docs),
[TypeScript](https://bun.com/docs/runtime/typescript),
[environment variables](https://bun.com/docs/runtime/environment-variables).
