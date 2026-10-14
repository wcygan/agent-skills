---
name: prevent-recurrence
description: "Prevent a demonstrated class of repeated mistakes through structure or checks. Use when the same correction has been needed more than once."
license: MIT
metadata:
  kind: component
  upstream-repository: https://github.com/cursor/plugins
  upstream-revision: 1e5c90a4b6f249917bd21fe361b3a2a7deb741b8
  upstream-path: pstack/skills/correct
  upstream-author: Lauren Tan
  maintenance: local
---

# Prevent recurrence

1. Group observed mistakes by cause. Establish recurrence with at least two concrete
   examples; distinguish a repeated class from one isolated bug.
2. Prefer eliminating the possibility through ownership, interfaces, or one source
   of truth. Next consider types, then an automated check with an actionable error,
   then a behavior test. Use prose rules for the remaining judgment calls.
3. Choose the smallest guard that fits the project. Explain why a stronger structural
   solution is unsuitable when using a weaker safeguard.
4. Demonstrate that the guard rejects a real past mistake and accepts the corrected
   behavior. Inspect false positives and give legitimate exceptions narrow scope.
5. Apply the requested correction and its guard together. Remove redundant guidance
   when enforcement makes it unnecessary; record remaining limits.

Done when the recurring failure is prevented or detected with demonstrated evidence,
and contributors can understand how to fix a violation.

Adapted from pstack; [license and attribution](references/LICENSE.txt).
