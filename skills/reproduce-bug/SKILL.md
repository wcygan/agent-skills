---
name: reproduce-bug
description: "Establish a failing-before and passing-after check for a bug. Use for regression work or a reproducible defect with a practical check."
license: MIT
metadata:
  kind: component
  upstream-repository: https://github.com/cursor/plugins
  upstream-revision: 1e5c90a4b6f249917bd21fe361b3a2a7deb741b8
  upstream-path: pstack/skills/tdd
  upstream-author: Lauren Tan
  maintenance: local
---

# Reproduce a bug

1. State expected behavior, observed behavior, and the smallest triggering input
   or sequence. Identify the actual affected path.
2. Prefer an existing, inexpensive test surface. When a new test would require
   unrelated infrastructure or brittle mocks, use a focused executable reproduction.
3. Run the check before the fix. Confirm it fails because of the reported defect,
   rather than missing setup or a different error. Record the failing evidence.
4. For an authorized fix, correct the cause and rerun the same check. Keep expected
   behavior intact; a passing test obtained by weakening the assertion is no proof.
5. Check nearby contracts affected by the fix. For intermittent failures, record
   repetition counts and residual uncertainty rather than treating one pass as proof.

Done when the same meaningful check demonstrates failure before and success after
the fix, or the missing evidence and closest available check are explicitly stated.
A reproduction-only request ends with the reproduction and diagnosis.

Adapted from pstack; [license and attribution](references/LICENSE.txt).
