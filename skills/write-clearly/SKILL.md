---
name: write-clearly
description: "Make technical prose and repeated UI text concise, concrete, and accurate. Use for documentation, explanations, feeds, summaries, labels, or editing unclear writing."
license: MIT
metadata:
  kind: component
  upstream-repository: https://github.com/cursor/plugins
  upstream-revision: 1e5c90a4b6f249917bd21fe361b3a2a7deb741b8
  upstream-path: pstack/skills/unslop; pstack/skills/technical-writing; pstack/skills/bro
  upstream-author: Lauren Tan
  maintenance: local
---

# Write clearly

1. Identify what the reader needs to understand or do. Lead with that outcome.
2. State one main idea per paragraph using familiar words, concrete subjects, and
   active verbs. Explain necessary terms where they first appear.
3. Preserve technical meaning, qualifications, and evidence while removing filler,
   repeated conclusions, decorative framing, and unsupported certainty.
4. Use examples for unfamiliar behavior and tables for genuine comparisons. Keep
   commands and examples consistent with the actual interface and project conventions.
5. Use one term for one concept across prose, code references, and visual labels.
   Keep conditions close to the actions they qualify. Prefer concrete verbs.
   Default to short sentences, but treat that as a default rather than a cap:
   vary sentence length, and let a sentence run longer when a condition, a
   contrast, or a qualification belongs with its claim. Retain uncertainty,
   exceptions, and necessary technical terms.
   For PR prose, instructions, captions, or labels, read
   [examples and editing checks](references/examples.md) when useful.
6. Read the result as a newcomer. Resolve missing prerequisites and ambiguous
   references; link deeper detail where it changes a decision.

For a report, handoff, or final message after agent work, write for a reader who
has not seen the tool calls, the files opened, or the steps taken, and who may be
switching in from other work. Make the message self-contained and put the key
points in the first sentences. Replace any label or abbreviation coined during
the work with a description of the thing itself. Use a paragraph where ideas
connect, and keep bullets for lists of separate items.

For feeds, repeated cards, table summaries, notifications, or session titles, read
[repeated-item writing](references/repeated-items.md). Review the collection together:
consistent individual sentences can still hide the differences readers need to find.

For a relationship that is clearer visually, use an available technical-visuals
skill and keep prose for the takeaway, evidence, and qualifications. A simple fact
stays as a sentence, because a figure makes the reader decode what one line could
state; an image never substitutes for a missing explanation, for the same reason.

Done when the reader can understand the point or perform the task without guessing,
and every substantive claim retains its original support and degree of certainty.

Adapted from pstack; [license and attribution](references/LICENSE.txt).
