# Forma working conventions

Use Bun and the existing justfile. `just dev` serves http://127.0.0.1:5173 and
http://<tailscale-ip>:5173 by binding to 0.0.0.0; `just dev-local` binds loopback.
Keep inspection in mock mode with sample data. Keep one production Bun process;
Start owns transport, Effect owns
backend I/O, and SQLite owns authoritative records.

Feature UI belongs in src/features; route files register URLs and compose pages.
Use shared shell, tokens, controls, and workspace schemas. Keep server functions
thin and browser bundles free of storage/config/provider implementations.

Production deployment must validate the current staged artifact and an approved,
unused request inside the same transaction. Preserve stale-version checks and
activity history. Roles, deployments, and OAuth are local simulations until real
adapters and authenticated identities are explicitly implemented.

Run just check and just test-browser for substantial changes. Use disposable data
for tests; preserve the developer database and immutable migration history.
Keep credentials in an ignored .env; mock mode is the default. Live model calls,
Git publication, and real deployments require their own task authorization.
