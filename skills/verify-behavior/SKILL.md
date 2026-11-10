---
name: verify-behavior
description: "Check actual results against acceptance criteria and keep the evidence. Use before claiming that a feature, fix, refactor, or other artifact works, for a smoke test, QA pass, or end-to-end check of a change."
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

Instance ownership means what this run started and may therefore stop: the
process, port, test data, or environment it launched. A shared instance that
someone else started is theirs; use it, but leave it running and its data in place.

1. List the acceptance criteria and identify the exact artifact or revision under
   test. Match each criterion to an observable result on the relevant surface.
2. Use the project's established checks and real entry points. Check prerequisites,
   instance ownership, and readiness before exercising behavior.
3. Exercise representative success and failure paths, including the consequential
   boundaries the change touches. Check resulting side effects as well as output.
4. Retain the actions, results, and artifact identity as evidence. Inspect artifacts
   directly, because a successful build, a healthy process, or another worker's
   summary shows that something ran, not that the user-visible behavior is right.
5. Report each criterion as verified, failed, or inconclusive. Identify simulated
   boundaries, unavailable environments, and missing coverage. A changed artifact
   needs renewed evidence for the affected criteria, because earlier evidence
   describes a different revision.
6. Clean up resources the run owns, including after failure, and leave shared
   resources alone since other work may depend on them. Confirm the proof
   artifacts survive cleanup.

Running checks, starting and stopping an instance the run owns, retrying
readiness, and rerunning a check need no go-ahead. Continue unless a criterion
cannot be exercised at all; report that blocker (the missing environment,
prerequisite, or access) when it stops you.

Done when every acceptance criterion has an evidenced disposition. Report an
inconclusive check as a gap rather than a pass, because a gap reported as a pass
hides the missing check from the next reader.

Adapted from pstack; [license and attribution](references/LICENSE.txt).
