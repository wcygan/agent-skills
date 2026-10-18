---
name: build-intuition
description: "Teach a concept bottom-up as a self-contained HTML lesson saved to ~/Downloads: a tiny concrete example and a step-by-step animation the learner controls. Use when someone asks to explain something intuitively, from scratch, step by step, simply, concretely, or to really understand an algorithm, data structure, protocol, or code path."
license: MIT
metadata:
  author: William Cygan
  kind: component
  maintenance: local
---

# Build intuition

Produce one self-contained HTML file in `~/Downloads` that teaches one idea
bottom-up. The learner steps through a tiny concrete example with real values,
one change at a time, until they can predict what happens next without help.
[technical-visuals](../technical-visuals/SKILL.md) gives teammates a high-level
view; this skill builds understanding from primitives. Delegate each phase to
the skill that owns it when available.

## Deliverable

- A single HTML file at `~/Downloads/<topic-slug>.html`. Never overwrite an
  existing file; choose a new name instead.
- Self-contained: inline every style, script, image, and piece of data so it
  works offline when opened directly.
- Hand off the path, a one-line summary, and what was executed versus
  illustrated. Open or publish it elsewhere only when asked.

A short chat answer replaces the file only when the idea is a definition or a
single relationship with no state changing over time. Say so and offer the
lesson if the learner still wants it.

## Delegate

| Need | Delegate to |
| --- | --- |
| The topic or the learner's level is unclear | [clarify-task](../clarify-task/SKILL.md) |
| The concept lives in a codebase | [explain-code](../explain-code/SKILL.md) |
| The lesson should explain why a design was chosen | [explain-history](../explain-history/SKILL.md) |
| Code must run to observe the real behavior | [uv-python](../uv-python/SKILL.md) or the project's toolchain |
| Palette, shapes, motion, themes, phone layout | [technical-visuals](../technical-visuals/SKILL.md) |
| Narration, titles, captions | [write-clearly](../write-clearly/SKILL.md) |
| Checking the finished lesson | [verify-behavior](../verify-behavior/SKILL.md) |

When a delegate is not installed, do its part inline to the same standard.
Delegation is a phase of this task, not a hand-off: continue to the finished
file without asking again.

## Strategies

1. **Answer one question.** Phrase it as the learner would ask it. Assume less
   prior knowledge, not more, and leave adjacent topics for another lesson.
2. **Make it concrete.** Pick the smallest example that still shows the
   mechanism, with actual values rather than variables. Include the case that
   makes the idea necessary: the limit exceeded, the conflict, the failure.
3. **Build from primitives.** Show each actor and piece of state before it
   participates. Never use a term or symbol the lesson has not introduced.
4. **Ground every step in real behavior.** Observe the actual code, a reference
   implementation, or a small faithful model, and derive each step from what
   it did. When nothing can run, say the lesson is illustrative.
5. **Change one thing at a time.** Each step shows what changed and why in one
   plain sentence. Once a kind of step has been taught, compress its repeats.
6. **Ask before revealing.** Before a consequential step, ask the learner to
   predict it; the next step answers.
7. **Let the learner set the pace.** Stepping forward and back, jumping to any
   step, and replaying must all work, and any step must look the same however
   it was reached. Motion explains a transition; it never replaces control.
8. **Generalize last.** Close with the rule the example demonstrated, what
   changes at scale, and a variation the learner can predict on their own.

See [lesson design](references/lesson-design.md) for choosing examples,
ordering steps, writing narration, and verifying the result.

## Done when

The file in `~/Downloads` opens offline, starts from stated primitives, uses a
concrete example, changes one thing per step, and ends with the general rule
and a variation. Every step matches observed behavior or the lesson says it is
illustrative. The lesson is readable and controllable in light and dark themes,
by keyboard and touch, at phone width.
