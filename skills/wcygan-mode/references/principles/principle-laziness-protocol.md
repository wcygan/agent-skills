# Laziness Protocol

Apply when refactoring, evaluating diff size, or tempted to add abstractions, layers, or signal threading. Bias toward deletion and the smallest change that solves the problem.

Bias toward deletion and the smallest change that solves the problem.

- **Delete first.** Look for what the change makes unnecessary (a branch, a flag, a wrapper) and remove it in the same change.
- **Consolidate decisions.** Put a repeated choice behind one source of truth and derive the rest. Two values that must stay in sync are a bug waiting for the sync to fail.
- **Minimize the diff.** Solve the stated problem without reshaping neighboring code. Fewer lines beat "elegant" boilerplate.
- **Resist threading.** A value passed through several signatures to reach one consumer usually belongs somewhere else.

Outside the task's scope, report what could be deleted instead of deleting it. Removing a public API or user-visible behavior is a breaking change, so say so.

The test: for each added line, name the line it lets you delete or the failure it prevents.

Adapted from Lauren Tan's [Pstack principle](https://github.com/cursor/plugins/tree/afd51cf66a3100a95f878d6c4b93a01f6508e3b0/pstack/skills/principle-laziness-protocol). [MIT license](../LICENSE.txt).
