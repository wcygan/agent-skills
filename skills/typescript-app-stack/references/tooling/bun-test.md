# Bun test

Executes tests with assertions, mocks, coverage, and watch support.

When test time dominates CI, measure setup and module loading separately from
assertion time. Prefer sharding by file across jobs and reusing worker state
where possible. If tests share state, reset it after every file rather than
enabling full isolation for each one.

## Documentation

- [Bun test docs](https://bun.sh/docs/test)
