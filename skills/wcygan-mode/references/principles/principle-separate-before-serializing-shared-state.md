# Separate Before Serializing Shared State

Apply when concurrent actors might write to the same file, branch, key, or state object. Eliminate the sharing first; serialize structurally only when one shared writer is a real invariant.

When concurrent actors might write the same file, branch, key, or object, first ask whether they need one shared object or are publishing independent facts. Default to giving each actor its own file, key, branch, or state directory, and merge only where the state is read. Two workers writing their own field into one `state.json` is still shared mutation. The same holds for parallel subagents: give each its own worktree, branch, and output file.

Only when one shared write target is a real invariant, serialize access structurally (a lockfile, a single writer, sequential phases, compare-and-swap). Instructions are not concurrency control, and "we need a lock" is a smell to check first.

Adapted from Lauren Tan's [Pstack principle](https://github.com/cursor/plugins/tree/afd51cf66a3100a95f878d6c4b93a01f6508e3b0/pstack/skills/principle-separate-before-serializing-shared-state). [MIT license](../LICENSE.txt).
