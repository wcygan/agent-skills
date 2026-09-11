---
name: distill
description: "Summarize supplied text or a long response into a concise brief. Use for a TLDR, key points, practical meaning, or executive summary."
license: MIT
metadata:
  author: William Cygan
  version: "0.1.0"
---

# Distill

Turn supplied text into a short Human Brief that preserves its meaning while reducing reading effort. Use the previous response when the user refers to “this,” “that,” or “your last response.” Infer the audience from the conversation unless the user specifies one.

## Preserve the source

The supplied source determines the brief's content. Research, verify, or expand it only when that work is also requested. Preserve exact identifiers, quantities, commands, ownership, and domain terms when they affect the meaning.

Prioritize the main conclusion, practical effects, decisions and actions, and material risks or uncertainty. Retain a detail when omitting it could change a decision or interpretation. Merge repetition; remove background and examples that do not serve the requested depth.

Preserve confidence levels, disagreement, and unresolved questions. Distinguish source claims from your inference. Do not invent conclusions, actions, or urgency.

## Choose the form

A Human Brief may contain a gist, key points, practical meaning, decisions or actions, and caveats. Use only the sections that help the reader; a TLDR may need just a paragraph. Match the user's requested format and depth without filling a point quota.

Use a comparison table for repeated fields or a small diagram when relationships are central. `show-me` can help when available; a clear direct visual is sufficient without it. Omit a visual when prose is easier to understand.

The brief is complete when it is shorter, easier to read, and faithful to the source. State when the requested compression necessarily omits decision-relevant context.

## Nearby requests

- `wait-what`: explain a confusing previous answer again, with a different framing or more context.
- `handoff`: preserve the continuation context another agent needs.
- `explore-topic`: broaden coverage instead of compressing a supplied source.
- `show-me`: make a visual explanation the primary result.

Use the appropriate companion when useful, or complete the requested work directly with available evidence.
