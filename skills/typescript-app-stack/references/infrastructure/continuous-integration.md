# Continuous integration

Runs formatting, lint, typecheck, build, and tests for each change. In an
agent-driven workflow the CI loop is the main feedback delay, so treat pipeline
duration as a product metric: measure queue time, setup time, and run time
separately before changing anything.

## Fast defaults

- **Measure first.** Audit recent runs and split each job into waiting for a
  runner, setup, and actual work. Optimize the largest bucket, then re-measure.
- **Avoid runner queue time.** Hosted-runner waits can exceed the work itself.
  Move every job, including small ones, to a faster runner provider or
  self-hosted pool; a five-second job behind a ten-minute queue is a ten-minute
  job.
- **Parallelize independent jobs.** Run lint, typecheck, build, and tests at the
  same time. A pull request should take as long as its slowest job.
- **Only run affected work.** Use a task graph such as Nx or Turborepo to skip
  unchanged projects, and run the full suite on a schedule. Test the skip logic
  deliberately: hide a real change from the graph and confirm the run fails.
- **Cache dependencies from the default branch.** Pull-request caches are
  usually branch-scoped, so seed a cache from main or most runs start cold.
  Check the cache hit rate rather than assuming it works.
- **Prefer a blobless clone.** `filter: blob:none` avoids downloading file
  contents without breaking history reads; a shallow clone breaks tools that
  inspect history.
- **Match parallelism to available cores.** Oversubscribing a small runner adds
  contention and flakiness without reducing wall time.
- **Split the slowest job.** If one shard also runs migrations or another app's
  tests, move that work into its own parallel job.
- **Shard tests, and buy cores before shards.** Profile how much time goes to
  module loading versus assertions. If setup dominates, larger runners help
  more than additional shards.
- **Avoid reloading the application per test file.** Test runners that isolate
  every file pay the full import cost repeatedly. Reuse workers where the
  runner supports it, and add a hook that resets shared state after each file so
  tests cannot leak into one another.
- **Run fast checks before pushing.** A pre-push hook that formats, lints, and
  typechecks changed files gives an agent feedback in seconds instead of a CI
  round trip. Prefer a hook over prose in `AGENTS.md`, because agents skip
  instructions.
- **Audit before deleting tests.** Measure first; test count is often not the
  source of the delay.

Faster CI usually costs more. Compare the increase with the value of shorter
agent feedback loops rather than optimizing only for the monthly bill.

## Documentation

- [GitHub Actions documentation](https://docs.github.com/en/actions)
- [Nx affected](https://nx.dev/ci/features/affected)
- [Turborepo documentation](https://turborepo.com/docs)
- [Vitest test isolation](https://vitest.dev/config/#isolate)
