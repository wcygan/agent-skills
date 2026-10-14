---
name: in-your-own-words
description: "Restate in your own words what the user's goals are and what problem they are trying to solve. Use for in-your-own-words, requests to restate intent, or checking your understanding of a request."
license: MIT
metadata:
  kind: component
  upstream-repository: https://github.com/cursor/plugins
  upstream-revision: 1e5c90a4b6f249917bd21fe361b3a2a7deb741b8
  upstream-path: pstack/skills/in-your-own-words
  upstream-author: Lauren Tan
  maintenance: local
---

# In your own words

Restate in your own words what you think the user's goals are and what problem
they are trying to solve.

Use the available [write-clearly](../write-clearly/SKILL.md) skill to make the
restatement plain, concise, and concrete. If it is unavailable, use familiar
words, lead with the desired outcome, and remove jargon and filler.

Preserve the user's scope, constraints, and uncertainty. Distinguish the underlying
problem from a suggested implementation without inventing motives or requirements.
Return the restatement itself, rather than a plan, solution, or report about your
process. A standalone request to restate intent does not authorize implementation.

Adapted from pstack; [license and attribution](references/LICENSE.txt).
