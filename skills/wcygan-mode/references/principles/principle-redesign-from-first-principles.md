# Redesign From First Principles

Redesign the affected code as if a new requirement had been there from the start, instead of bolting it onto the existing design. Apply when integrating a new requirement, feature, or constraint into an existing design, refactoring around a change, or deciding how far a change should propagate.

When integrating a change, redesign as if the requirement had been a foundational assumption from the start, instead of bolting it onto the existing design.

- Read the affected files and understand the current design.
- Ask: "if we were writing this from scratch with this requirement, what would we build?"
- Propagate the change through every reference inside the requested change: types, docs, examples.
- When the redesign reaches beyond the requested change, surface that in the plan or recap and keep going on the requested change.
- Think about the whole redesign, then deliver it incrementally.

Adapted from Lauren Tan's [Pstack principle](https://github.com/cursor/plugins/tree/afd51cf66a3100a95f878d6c4b93a01f6508e3b0/pstack/skills/principle-redesign-from-first-principles). [MIT license](../LICENSE.txt).
