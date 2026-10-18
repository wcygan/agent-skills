# Lesson design

## Choose the example

The example is the lesson. Pick values the learner can check in their head and
that force the interesting case.

| Concept | Too abstract | Concrete enough |
| --- | --- | --- |
| Hash table | "keys hash to buckets" | 4 buckets, `hash(k) = k % 4`; insert 3, 7, 11 to show a collision |
| MVCC read | "readers see a snapshot" | One row, one reader, one writer, and the timestamps that decide what is visible |
| Leader election | "a node times out and requests votes" | 3 nodes with named timers; one fires first and collects votes |
| Gradient descent | "parameters follow the gradient" | One weight, one input, one target; show the loss, gradient, and a single update |
| Request path | "middleware processes the request" | One real request traced through each layer in order |

- Prefer small integers and short names. Avoid arithmetic that distracts.
- Keep the example large enough for the mechanism to matter: a cache that never
  misses or a lock nobody contends teaches nothing.
- Keep identities stable. A value, actor, or message keeps its name, color, and
  role for the whole lesson.
- Introduce one complication at a time. Teach the plain path first, then replay
  with the failure, conflict, or limit.

## Order the steps

1. **Setup:** the initial state, with each primitive labeled.
2. **Warm-up:** one or two easy steps that show what a step looks like.
3. **Tension:** the step where the naive expectation breaks.
4. **Resolution:** the mechanism doing its job, one change at a time.
5. **Repeat with a twist:** the same mechanism in a new context. Compress
   routine steps the learner has already seen.
6. **Rule:** the generalization and what changes at scale.
7. **Your turn:** a variation, opened with a prediction.

## Ground the steps in behavior

Prefer sources in this order: the real code under the learner's question, a
reference implementation, a small model written for the lesson, and only then
hand-reasoned steps. When writing a model, check its invariants after every
step and compare it with known outputs.

Record the complete state at every step rather than describing changes, so any
step can be shown on its own. Derive the narration from the same recorded values
so the words and the picture cannot disagree. Keep whatever produced the steps
available, and mention it in the handoff so a variation can be regenerated.

## Write the narration

- One sentence per step, present tense, cause before effect.
- Each step reads alone, because learners jump around: name the subject instead
  of "it" or "this".
- Show the thing before naming it; introduce the real term once it is visible.
- Keep exact values in view when they carry the lesson; drop decoration.

## Present it

- Keep the layout stable between steps so only meaningful changes move.
- Mark what changed with a color and a non-color cue such as an outline or label.
- Keep completed effects visible until the behavior removes them.
- Hide a prediction's answer until the learner advances.
- Offer keyboard control, touch-sized buttons, a step count, and a way to jump
  to or link to any step. Autoplay, if offered, stops at predictions.
- Respect reduced motion, and design for a phone first.
- Use the [technical-visuals design system](../../technical-visuals/references/design-system.md)
  for palette, shapes, and themes; its
  [blog visuals](../../technical-visuals/examples/blog/index.html) show motion
  that follows real routes and causality.

## Verify

- Compare every rendered step with the recorded behavior, by inspection or by a
  script that reads the page.
- Jump directly to steps in the middle and confirm they match stepping there.
- Exercise every control by keyboard and touch.
- Check light and dark themes at desktop and phone widths for clipping,
  overlap, and wrapped controls.
- Confirm the file works offline and makes no network requests.
- Report what you checked, what was illustrative, and what you could not check.
