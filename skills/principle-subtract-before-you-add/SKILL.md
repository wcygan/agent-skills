---
name: principle-subtract-before-you-add
description: "Apply when sequencing an addition, refactor, or rewrite. Remove dead code, redundant validators, and stub references first, then build on the simpler base."
license: MIT
metadata:
  kind: principle
  upstream-repository: https://github.com/cursor/plugins
  upstream-revision: afd51cf66a3100a95f878d6c4b93a01f6508e3b0
  upstream-path: pstack/skills/principle-subtract-before-you-add
  upstream-author: Lauren Tan
  maintenance: local
---

# Subtract Before You Add

When evolving a system, remove complexity first, then build. Default to subtraction, and leave the design slightly simpler behind the same or smaller surface than you found it.

- Sequence removal before construction.
- Cut before you polish: get to the minimum before investing in quality.
- Design for observed usage, not speculative edge cases. Add no validators, parsers, or guards beyond what the spec demands.
- In prompts and skills, remove redundant instructions and templates, and delete a reference file that has no novel content.

Dead code outside the task's area is an expansion: name it in the recap whether you delete it or leave it.

Adapted from pstack; [license and attribution](references/LICENSE.txt).
