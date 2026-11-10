---
name: personalize-workflow
description: "Capture a user's established working preferences in a concise personal skill or instructions file. Use when asked to create or update personal working instructions, preferences, or a CLAUDE.md-style profile."
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
   records. Leave out one-off task constraints, because they are not lasting
   preferences. Ask only about consequential gaps; a small gap is cheaper to fill
   with a reasonable default the user can edit.
3. Write only specific, actionable conventions that change how work is done.
   Keep the trigger specific to the user's working style rather than all coding.
4. Use the project's skill format and chosen location. Reference existing procedures
   when useful rather than copying their contents. Avoid platform configuration,
   fixed model choices, and claims of capabilities the environment may not have.
5. Check the draft against representative prior requests and current preferences.
   Validate its format and show what was captured, revised, or left uncertain.

## Rules the output must follow

- Every approval rule names exact actions (for example: commit, push, open or
  merge a pull request, deploy, publish a package, post in the user's name)
  rather than a category such as "risky changes".
- Exceptions live inside the rule they modify, so the reader sees the rule and
  its exception together.
- Each "never" states its reason in the same sentence.
- No model-specific lines: the output must work whichever model reads it.
- Conflicts: the most recent explicit statement from the user wins, and the
  output shows the conflict (what was superseded and by which statement) so the
  user can confirm or reverse it.

Done when the skill expresses the user's demonstrated preferences concisely and
preserves their control over scope. Installation, global activation, scheduling,
and publication happen only when the request includes them, because the user
chose the scope; otherwise hand back the draft.

Adapted from pstack; [license and attribution](references/LICENSE.txt).
