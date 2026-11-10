---
name: reproduce-bug
description: "Establish a failing-before and passing-after check for a bug. Use for regression work, a reproducible defect, a flaky test, or a bug fix that needs a repro and a regression test."
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
4. Fix the cause when the request asked for a fix or a later go-ahead named one;
   a reproduction-only request ends with the reproduction and diagnosis. Rerun
   the same check after the fix; rerunning is safe to repeat and needs no
   go-ahead. Keep expected behavior intact, because a test that passes after its
   assertion was weakened proves nothing about the fix.
5. Check nearby contracts affected by the fix. For intermittent failures, record
   repetition counts and residual uncertainty, because one pass of a flaky check
   cannot distinguish a fix from luck.

Continue unless the defect cannot be triggered on any available surface; report
that blocker (the missing environment, data, or access) when it stops you.

Done when the same meaningful check demonstrates failure before and success after
the fix, or the missing evidence and closest available check are explicitly stated.

Adapted from pstack; [license and attribution](references/LICENSE.txt).
