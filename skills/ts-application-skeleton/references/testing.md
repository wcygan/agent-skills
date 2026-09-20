# Testing strategy

Use Bun Test for application tests: they execute in the same runtime as the
SQLite adapter. Use Playwright Test for browser journeys. Effect TestClock and
TestSchema complement the runner. No second unit-test runner is required.

## Evidence by boundary

- Pure rules: test meaningful invariants and threshold behavior.
- Effect services: provide explicit layers and test typed failure, cancellation,
  finalization, and concurrency where relevant. Close every ManagedRuntime.
- Time: use TestClock for deadlines, retries, TTL, and limiter behavior; start
  the sleeping fiber before advancing time. Use Deferred/Queue for synchronization,
  not arbitrary sleeps.
- Schemas: TestSchema checks decoding, encoding, and relevant round-trip
  properties. Include malformed persisted values and boundary input cases.
- Storage: real temporary SQLite databases. Verify migrations, rollback, reopen
  durability, stale-write conflicts, non-destructive seeding, and backup restore.
  In-memory databases are useful for service tests but do not prove restart
  durability.
- Provider adapters: deterministic HTTP fixtures exercise the real adapter and
  SDK. Block unexpected external requests. Live provider tests are explicit,
  optional, and never part of the default suite.
- Browser: use the production build with a disposable data directory and mock
  providers. Test create/detail/edit/reload/delete, field errors, empty state,
  conflicts from two pages, failure/retry, and missing IDs. Assert user-visible
  behavior with accessible locators.
- Distribution: bootstrap into /tmp, install the locked dependencies, check,
  explicitly seed, start, and request every example route plus an unknown ID.
  Verify local data, secrets, reports, and dependencies are excluded.

## Commands and isolation

just check runs recipe formatting, lint, strict types, Bun tests, and build.
just test-browser builds and runs Playwright. Install Chromium first with
bunx playwright install chromium (CI also installs OS dependencies).

Browser tests use *.pw.ts so Bun Test does not collect them. The Playwright
webServer wrapper owns and removes its temporary database. Port 4199 is reserved
for this test command; reuseExistingServer is false so it cannot silently test
another running app. Run browser suites serially on a machine.

The generated CI workflow runs application checks and browser tests without
credentials. Trace files are retained locally on browser failures; they may
contain application content. Never publish traces containing real user data.

Sources: https://bun.com/docs/test
https://playwright.dev/docs/intro
https://effect.website/docs/v4/api/effect/testing/TestClock
https://effect.website/docs/v4/api/effect/testing/TestSchema
