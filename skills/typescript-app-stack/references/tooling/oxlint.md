# Oxlint

Lints JavaScript and TypeScript with a Rust-based engine. It is typically an
order of magnitude faster than ESLint for the same rule set, which makes full
linting practical on every push and in CI.

Use it when lint time is a bottleneck or when an agent should get lint feedback
without a long wait. Oxlint deliberately implements a subset of ESLint rules;
check the supported-rule list before replacing a type-aware ESLint
configuration. Enable as many rules as the project can sustain, since agents do
not tire of strict feedback.

## Documentation

- [Oxlint docs](https://oxc.rs/docs/guide/usage/linter.html)
- [Supported rules](https://oxc.rs/docs/guide/usage/linter/rules.html)
