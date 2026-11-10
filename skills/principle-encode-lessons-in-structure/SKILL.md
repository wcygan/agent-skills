---
name: principle-encode-lessons-in-structure
description: "Apply when you catch yourself writing the same instruction a second time, or notice a recurring correction. Encode the rule as a lint, metadata flag, runtime check, or script instead of more text."
license: MIT
metadata:
  kind: principle
  upstream-repository: https://github.com/cursor/plugins
  upstream-revision: afd51cf66a3100a95f878d6c4b93a01f6508e3b0
  upstream-path: pstack/skills/principle-encode-lessons-in-structure
  upstream-author: Lauren Tan
  maintenance: local
---

# Encode Lessons in Structure

**Trigger:** you are writing the same instruction a second time (in a prompt, a README, a code comment, a review note), or the same correction has come up more than once.

**Rule:** encode the rule as structure that enforces it (a lint, a metadata flag, a runtime check, or a script) instead of adding more text. Pick the cheapest option that actually enforces the rule.

**Why:** text is read once and forgotten; structure runs every time. A second copy of an instruction is evidence that the first copy did not hold, and a third copy will hold no better. The instruction is the symptom; the missing enforcement is the cause.

**Options, in order of cost. Pick the first that enforces the rule:**
1. **Lint or static check.** The rule is about the shape of code or files and can be decided by reading them: a forbidden import, a required field, a naming pattern, a file that must exist. Runs in CI and in the editor; fails before the mistake lands.
2. **Metadata flag or schema.** The rule is a property of an item that tools already read: a required frontmatter key, a schema field, a type that forbids the wrong value. The validator that already runs does the enforcing.
3. **Runtime check.** The rule depends on state that only exists while running: an invariant assertion, a precondition on a command, a refusal when a guard fails. Costs a line of code and a clear error message.
4. **Script.** The rule describes a procedure people keep doing slightly wrong. Make the script the only documented way to do it, so the right order is the only order.

If none of these fits, the lesson needs judgment. Then make the instruction more prominent (put it where the decision is made, not in a distant document), and add a concrete example of the failure it prevents, so the reader recognizes the situation rather than recalling a rule.

**Example:** a review note says "skill directory names must match the `name` field" and the same correction appears on the next pull request. Instead of a third note, add a validation step that fails CI when they differ. The note can then be deleted; the check carries the lesson.

**Test:** after the change, can the mistake still be made without something failing? If yes, you added text, not structure.

**Corollary:** if the fix is structural, the structural fix is the only fix. Do not also keep the instruction; duplicated rules drift apart, and the text copy will be the one that goes stale.

Distinct from build-the-lever, which builds a tool for the work in front of you; this principle makes a recurring correction durable. Related to prevent-recurrence, which covers the same ground as a procedure.

Adapted from pstack; [license and attribution](references/LICENSE.txt).
