---
name: verify-behavior
description: "Check actual results against acceptance criteria. Use before claiming that a feature, fix, refactor, or other artifact works."
license: MIT
metadata:
  kind: component
  upstream-repository: https://github.com/cursor/plugins
  upstream-revision: 1e5c90a4b6f249917bd21fe361b3a2a7deb741b8
  upstream-path: pstack/skills/principle-prove-it-works; pstack/skills/figure-it-out; pstack/skills/create-verification-skill
  upstream-author: Lauren Tan
  maintenance: local
---

# Verify behavior

1. List the acceptance criteria and identify the exact artifact or revision under
   test. Match each criterion to an observable result on the relevant surface.
2. Use the project's established checks and real entry points. Check prerequisites,
   instance ownership, and readiness before exercising behavior.
3. Exercise representative success and failure paths, including the consequential
   boundaries the change touches. Check resulting side effects as well as output.
4. Retain the actions, results, and artifact identity as evidence. Inspect artifacts
   directly; another worker's summary, a successful build, or a healthy process alone
   does not establish that user behavior works.
5. Report each criterion as verified, failed, or inconclusive. Identify simulated
   boundaries, unavailable environments, and missing coverage. Changed artifacts
   require renewed evidence for the affected criteria.
6. Clean up only resources the run owns, including after failure. Confirm the proof
   artifacts survive cleanup.

Done when every acceptance criterion has an evidenced disposition. Inconclusive
checks remain gaps; they do not count as passing.

Adapted from pstack; [license and attribution](references/LICENSE.txt).
