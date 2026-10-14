---
name: maintain-verification-skill
description: "Check and repair a project verification skill against source and live behavior. Use when its commands, journey map, or evidence requirements may have drifted."
license: MIT
metadata:
  kind: component
  upstream-repository: https://github.com/cursor/plugins
  upstream-revision: 1e5c90a4b6f249917bd21fe361b3a2a7deb741b8
  upstream-path: pstack/skills/maintain-verification-skill
  upstream-author: Lauren Tan
  maintenance: local
---

# Maintain a verification skill

1. Locate the intended verification skill and feature map. Resolve multiple targets
   from the request; if none exists, report that creation is needed.
2. Reconcile the index with its entries and current source. Check every mapped
   feature, and look for missing user surfaces with concrete source evidence.
3. Exercise every mapped feature on the real surface, even if source looks unchanged.
   Use one driver per shared instance or isolated sessions. Health-check before use
   and after surprising failures; reset unusable state instead of continuing blindly.
4. Classify failures: documentation drift, a harness gap, a product regression, or
   an unavailable prerequisite. Fix only the verification skill and its owned helpers.
   Report product regressions without rewriting expected behavior to hide them.
5. Rerun corrected instructions live. For a health-check failure caused by skill
   drift, correct it and retry once before reporting the remaining blocker. Preserve
   evidence and clean owned resources after each failed attempt and final teardown.
6. Report clean, changed, or blocked with per-feature coverage and evidence. An
   unreachable feature needs its attempted route and missing prerequisite recorded;
   it is not a passing feature. Publish corrections only if requested.

Done when every feature has a source and runtime disposition, corrections have
been exercised, and surviving evidence supports the outcome. Incomplete live
coverage keeps the overall outcome blocked even when some corrections succeeded.

Adapted from pstack; [license and attribution](references/LICENSE.txt).
