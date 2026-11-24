# Build the Lever

Start with the project's existing commands and tests. If one reproduces a
reported failure, give the command and the result that explains the failure.

Build a small tool when an operation repeats across many inputs, when a
missing check should catch future regressions, or when the user asks for one.
For a migration, try it on one representative input, inspect the change, and
rerun it to check that an already-migrated input stays intact. Keep the tool
with the change when a maintainer needs to repeat the work.

Adapted from Lauren Tan's [Pstack principle](https://github.com/cursor/plugins/tree/afd51cf66a3100a95f878d6c4b93a01f6508e3b0/pstack/skills/principle-build-the-lever). [MIT license](../LICENSE.txt).
