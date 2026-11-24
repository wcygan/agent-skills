---
name: review-changes
description: "Review a code change, pull request, or design against its intent. Deliver evidence-backed findings and a verdict in the reply or as a requested HTML review report."
license: MIT
compatibility: The optional HTML report requires Python 3.10 or newer and a browser to view the result.
metadata:
  kind: component
  upstream-repository: https://github.com/cursor/plugins
  upstream-revision: 1e5c90a4b6f249917bd21fe361b3a2a7deb741b8
  upstream-path: pstack/skills/interrogate
  upstream-author: Lauren Tan
  maintenance: local
---

# Review changes

Judge the identified revision or design against its intended behavior and constraints.
Use surrounding contracts and callers to establish reachability and impact. Run the
normal entry point or compare with the baseline when that can settle a finding.
For a regression test, check whether it would pass without the change.

Reuse findings and evidence that cover the exact revision, preserving who observed
what. For large, contested, or security-sensitive changes, use an independent
reviewer when available. Give them the intent, scope, and evidence. If reviewing
alone, take a second critical pass and disclose that limit. Merge duplicates
and resolve disagreements against the artifact.

Each retained finding needs a rationale, a concrete failure or cost, supporting
evidence, and the smallest relevant changed location when applicable. Classify it as
**Act on** for a substantiated blocker introduced or worsened by the change,
**Consider** for an optional improvement, **Noted** for context such as a preexisting
problem, or **Dismissed** for an unsupported, incorrect, or preference-only claim.
Keep untested hypotheses and unresolved checks visible in the verdict's limits.

Deliver a verdict and actionable findings first in the reply, with enough context to
show your reading of someone else's PR. For requested HTML, follow the
[report format and renderer](references/html-report.md) and return the verdict and
page path. Apply fixes when implementation is in scope. Get an explicit go-ahead
before posting a review or comment in the user's name.

[Pstack license and attribution](references/LICENSE.txt) · [Local contributions license](references/LOCAL-LICENSE.txt)
