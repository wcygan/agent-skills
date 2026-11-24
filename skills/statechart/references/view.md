# View module

The `--view` module exports a pure `state(vars)` function. Return a string for
a flat chart, an array of names from parent to child for nested states, or an
object mapping region names to state names for parallel regions. TLA+
sequences arrive as objects with keys starting at 1. Sets arrive as arrays.
Optional exports are `step(action, from, to)`, `group(vars)`, `colors` and
`title`. A drawn state receives a group color when its underlying states share
a group.

Use the same step label when actions should share an arrow. A trailing bracket
gives the guard in the reader's words. In a region chart, let the tool derive a
guard on other regions because a manual bracket replaces it. If hidden values
affect the destination, name the outcome in the label so the arrows differ.

Aim for roughly 20 arrows. Share labels only where the resulting chart preserves
the behavior the reader needs, including counterexample steps and rule marks.
A transition within one label is invisible. Split the label when that step
matters. In particular, retain the distinction between a `breaks` state and a
`mayBreak` state, and keep states that violate different rules distinguishable.

If the chart is still crowded, return `null` from `step()` for dispensable
arrows. Hide all steps of an arrow together so its guard stays accurate. Keep
every label reachable from a start state and leave an outgoing arrow wherever
the model can leave the label. List the hidden steps in the handoff.
