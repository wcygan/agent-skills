# Bootstrapping an application

Run the generator using Bun 1.4+:

```sh
bun ~/.agents/skills/ts-application-skeleton/scripts/create.ts ~/Development/my-app
cd ~/Development/my-app
just dev
```

The generated app uses `https://my-app.localhost`. Development also requires
Node.js 24+, Portless, and just; their setup is documented in the app README.
The generator itself requires only Bun. It does not start a proxy, initialize
Git, create a real `.env`, or call a live model provider.

## Options and behavior

- `<destination>` is required and must not exist, even as an empty directory.
- `--name <name>` sets both the package name and Portless hostname. Otherwise
  the destination's final directory name is used. Names must be lowercase DNS
  labels, 1–63 characters, using letters, digits, and interior hyphens.
- `--skip-install` copies and configures the app without installing packages.
  Run `just setup` in it later.
- `--help` prints usage.

The template is located relative to the script, independent of the caller's
working directory. Output inside the skill directory is rejected. The script
excludes `.env` variants except `.env.example`, dependency directories, Git
metadata, caches, .data, SQLite files/sidecars, test/browser artifacts, and build output. Unexpected symbolic
links fail the copy; they are not followed. Source licenses are retained.

Only the package name, development hostname, lockfile root workspace name, and
README title/URL change. Dependency pins remain intact. The UI retains the
Foundation example branding for later application-specific customization.

If copying/configuration fails, the newly created destination is removed. If
dependency installation fails, the generated source is retained: fix the
installation problem and run `just setup` there. No existing files are replaced.

## Reproducible smoke test

From the repository:

```sh
just foundation-bootstrap-test
```

Or from an installed skill, using its actual location:

```sh
bun test ~/.agents/skills/ts-application-skeleton/scripts/create.test.ts
```

The test creates `/tmp/foundation-bootstrap-*`, runs the shipped generator,
checks artifact exclusions and overwrite protection, verifies a frozen install,
and runs the generated app's lint, typecheck, tests, and build. It explicitly seeds
the temporary app's SQLite database and checks foundation metadata and CI inclusion. It starts the
production application on an ephemeral loopback port and requests `/`,
`/pi-agent`, `/decisions`, all six decision demo subroutes, `/collections`, and each
of the three item detail routes. Unknown item IDs must return a 404. Valid routes must return HTTP 200, route-specific rendered
content, the mock-mode indicator, and a reachable JavaScript asset.

The test forces mock mode, clears the provider key, and overrides `APP_DATA_DIR`
with `.data` inside the generated application so inherited configuration cannot
seed or migrate an existing database. It needs package-registry
access or a populated Bun cache, but no model credentials, Portless proxy, or
browser. Requests have deadlines, subprocesses have timeouts, and cleanup stops
the server process group and removes the temporary workspace. This verifies
startup and server-rendered routes; it does not replace interactive browser tests.
