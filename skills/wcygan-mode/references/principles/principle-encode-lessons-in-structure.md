# Encode Lessons in Structure

Apply when you catch yourself writing the same instruction a second time, or notice a recurring correction. Encode the rule as a lint, metadata flag, runtime check, or script instead of more text.

When you write the same instruction a second time, or the same correction recurs, encode the rule as structure that enforces it instead of adding more text. Pick the cheapest option that enforces it: a lint or static check, a metadata flag or schema, a runtime check, or a script that becomes the only documented way.

- If the fix is structural, it is the only fix. Delete the instruction, because two copies drift.
- If the lesson needs judgment and cannot be encoded, put the instruction where the decision is made and add an example of the failure it prevents.

The test: after the change, can the mistake still be made without something failing? If yes, you added text, not structure.

Adapted from Lauren Tan's [Pstack principle](https://github.com/cursor/plugins/tree/afd51cf66a3100a95f878d6c4b93a01f6508e3b0/pstack/skills/principle-encode-lessons-in-structure). [MIT license](../LICENSE.txt).
