---
name: distill
description: Distill long responses or supplied text into a concise Human Brief with the gist, key points, practical meaning, actions, and important caveats. Use when the user asks for a summary, TLDR, salient points, plain-language explanation, executive brief, or compact visual understanding without losing essential meaning.
license: MIT
metadata:
  author: William Cygan
  version: "0.1.0"
---

# Distill

Turn a large source into a short Human Brief. Preserve the source meaning while
you reduce its reading cost.

## Route nearby work

Use `distill` when compression is the primary job.

- Use `wait-what` when the previous message needs a new explanation or more context.
- Use `show-me` when a visual explanation is the primary result.
- Use `handoff` when another agent needs complete continuation context.
- Use `explore-topic` when the user wants broader coverage instead of compression.

Continue with `distill` when the user also wants one small visual. The Human
Brief remains the integrated result.

## 1. Bound the source

Identify the exact text to distill. Use the previous response when the user says
"this," "that," or "your last response."

Identify the audience and requested depth when the user supplies them. Otherwise,
write for the current user and use the standard brief format.

Treat the supplied source as the authority for content. Research, verify, or
expand it only when the user asks for that separate work.

This step is complete when the source, audience, and depth are clear.

## 2. Build a content ledger

Extract these source elements before you write:

- the main conclusion or message;
- the claims that support it;
- decisions already made;
- actions assigned or requested;
- practical effects for the user;
- risks, conditions, and uncertainty; and
- open questions or missing evidence.

Keep exact identifiers, quantities, commands, and domain terms when they affect
meaning. Separate source claims from your inferences.

This step is complete when each important source element has one ledger entry.

## 3. Rank by user value

Use this order unless the user gives another priority:

1. Bottom line.
2. User effect.
3. Decisions and required actions.
4. Risks and uncertainty.
5. Supporting detail.

Merge repeated points. Remove history, examples, and implementation detail that
do not change the bottom line.

Retain a detail when removing it could change a decision, action, risk, or
interpretation.

This step is complete when every retained point affects user understanding.

## 4. Choose the smallest useful form

Use the standard Human Brief unless the user requests another form.

- Use a quick brief for requests such as "TLDR" or "just the gist."
- Use a visual brief when relationships are central to understanding.
- Use a comparison table for exact mappings or repeated fields.
- Use a small text diagram for sequence, hierarchy, ownership, or flow.
- Use Mermaid only when interaction or state changes need it.

Apply `show-me` when it is available and a visual is necessary. If it is not
available, use one small, copyable table or text diagram.

Omit the visual when prose and bullets are clearer.

This step is complete when the selected form reduces reading effort.

## 5. Write the Human Brief

Use plain language and short sentences. Use established domain terms when they
are more precise than a substitute. Define an uncommon term when it must remain.

Use only the sections that contain useful source information:

```markdown
## The gist

[One or two sentences.]

## Key points

- [Three to seven points.]

## Why this matters

[The practical meaning for the user.]

## Visual

[One small visual when it improves understanding.]

## Decisions or actions

- [Only decisions or actions present in the source.]

## Important caveats

- [Risks, conditions, uncertainty, or omitted context.]
```

For a quick brief, return the gist and no more than five key points. Add a
caveat only when omission would change the meaning.

## 6. Check fidelity

Confirm each brief statement against the source.

- Preserve the source confidence level.
- Label your inference as an inference.
- Preserve important disagreement and uncertainty.
- Preserve required actions and their owners.
- Remove invented conclusions, actions, and urgency.
- State when severe compression hides important context.

Stop when the brief is shorter, easier to scan, and faithful to the source.

## Activation examples

- "Distill that response into the points I need to remember."
- "Give me the TLDR and tell me why it matters."
- "Turn this design review into a one-minute brief."
- "Summarize this in plain language and show the flow."
- "What decisions, actions, and risks are buried in this text?"

Do not use this skill to summarize a source that the user has not supplied or
authorized you to access.
