---
name: verify-behavior
description: "Verify acceptance criteria on the real artifact. Use for smoke tests, QA, end-to-end journeys, fix confirmation, or evidence that a completed change works."
license: MIT
metadata:
  kind: procedure
  upstream-repository: https://github.com/cursor/plugins
  upstream-revision: 1e5c90a4b6f249917bd21fe361b3a2a7deb741b8
  upstream-path: pstack/skills/principle-prove-it-works; pstack/skills/figure-it-out; pstack/skills/create-verification-skill; pstack/skills/maintain-verification-skill
  upstream-author: Lauren Tan
  maintenance: local
---

# Verify behavior

Match each acceptance criterion to an observable result on the exact artifact
or revision. Use the project's normal entry points and established verification
guidance. Exercise relevant success and failure paths and inspect outputs and
side effects directly. A build, readiness check, or secondhand report gives
supporting context. Claim verification for the behavior actually exercised.

Confirm prerequisites and ownership before running checks. Use shared resources
within their intended scope and leave their processes and data in place. Clean up
resources this run created, including after failure, and preserve the evidence.

Finish with an evidenced disposition for each criterion: **verified**, **failed**,
or **inconclusive**. Keep the artifact identity, actions, and observed results.
Name simulated boundaries, missing prerequisites, and gaps. Continue with
independent criteria when one is blocked and renew affected evidence after a
revision changes.

For reusable project verification guidance or a requested proof or model check
over a defined scope, use the appropriate workflow in `verification-skill`.

[Pstack license and attribution](references/LICENSE.txt)
