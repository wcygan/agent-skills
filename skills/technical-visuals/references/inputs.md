# Input contracts

Choose the source modality separately from the output format and dimension.
All modalities default to 2D. An explicit 3D request changes presentation, not
what the evidence supports. Infer routine framing; ask only when missing facts
would materially change the explanation.

| Input | Extract before drawing | Useful output | Guardrail |
| --- | --- | --- | --- |
| Natural-language idea | Actors, action, boundary, intended takeaway | Conceptual topology or sequence | Label assumptions; do not invent implementation facts |
| Source code, diff, schema, configuration | Actual owners, calls, state, changed behavior | Architecture, before/after, data flow | Trace the relationships; file adjacency is not runtime flow |
| Logs, trace, profile, metrics, table | Units, time range, sample size, order, uncertainty | Timeline or measured chart | Preserve provenance; do not imply causation from correlation |
| Screenshot or existing diagram | Visible state, labels, hierarchy, known omissions | Annotated image or revised explanation | Separate observation from inference; inspect the supplied image |
| Storyboard or process description | Preconditions, transitions, failure/recovery states | Numbered frames or interactive stepper | Do not make a happy-path animation stand in for the whole contract |
| Brand/style reference | Explicit tokens, shapes, density, desired qualities | Styled version of an independently checked model | Appearance is not evidence of domain behavior |

When given several inputs, resolve contradictions against the authoritative source
and identify remaining uncertainty. Do not quietly combine incompatible revisions.

For an explicit 3D request, also define what the third axis means: physical space,
region, layer, capacity, or purely presentational depth. Label presentational depth
as such. Do not imply volume encodes magnitude unless the data and scale support it.

## Interaction modalities

- Mouse/pointer: click to select; drag to orbit only in a declared 3D viewport.
- Touch: sufficiently separated targets; retain page scrolling; avoid hover-only facts.
- Keyboard: native selectors/buttons for states; visible focus; camera buttons or
  documented arrow-key controls for 3D, plus reset. All essential information is
  available without dragging.
- Static/export: a named state with a caption; no required tooltip or animation.

An input control is justified when it changes understanding. A theme toggle is a
presentation control; it must not change the model or simulation state.
