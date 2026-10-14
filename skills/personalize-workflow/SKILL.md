---
name: personalize-workflow
description: "Capture a user’s established working preferences in a concise skill. Use when asked to create or update personal working instructions."
license: MIT
metadata:
  kind: component
  upstream-repository: https://github.com/cursor/plugins
  upstream-revision: 1e5c90a4b6f249917bd21fe361b3a2a7deb741b8
  upstream-path: pstack/skills/automate-me
  upstream-author: Lauren Tan
  maintenance: local
---

# Personalize a workflow

1. Find existing personal instructions in the requested scope and update them in
   place where appropriate. Preserve preferences that have not been superseded.
2. Use explicit user preferences and repeated patterns from relevant, accessible
   records. A one-off task constraint is not a lasting preference; resolve conflicting
   evidence and ask only about consequential gaps.
3. Write only specific, actionable conventions that change how work is done.
   Keep the trigger specific to the user's working style rather than all coding.
4. Use the project's skill format and chosen location. Reference existing procedures
   when useful rather than copying their contents. Avoid platform configuration,
   fixed model choices, and claims of capabilities the environment may not have.
5. Check the draft against representative prior requests and current preferences.
   Validate its format and show what was captured, revised, or left uncertain.

Done when the skill expresses the user's demonstrated preferences concisely and
preserves their control over scope. Installation, global activation, scheduling,
and publication occur only when included in the request.

Adapted from pstack; [license and attribution](references/LICENSE.txt).
