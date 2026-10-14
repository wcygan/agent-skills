---
name: wcygan-verify
description: "Verify acceptance criteria and maintain reusable project verification when needed. Use for checking a completed change or an application journey."
license: MIT
metadata:
  kind: procedure
  upstream-repository: https://github.com/cursor/plugins
  upstream-revision: 1e5c90a4b6f249917bd21fe361b3a2a7deb741b8
  upstream-path: pstack/skills/create-verification-skill; pstack/skills/maintain-verification-skill; pstack/skills/principle-prove-it-works
  upstream-author: Lauren Tan
  maintenance: local
---

# Verify

Read linked components only when their stated condition applies. Use available
tools and preserve the task's scope, prior authorization, and explicit checkpoints.


1. Identify the artifact and acceptance criteria. Locate any existing project
   verification skill and inspect whether it covers the relevant user journeys.
2. If reusable verification guidance is requested or necessary for repeated work,
   use [create-verification-skill](../create-verification-skill/SKILL.md) when absent.
   Use [maintain-verification-skill](../maintain-verification-skill/SKILL.md) when an
   existing skill is stale or its audit was requested. A one-off check needs neither.
3. Use [verify-behavior](../verify-behavior/SKILL.md), following applicable project
   instructions. Preserve evidence from skill creation or maintenance as coverage
   only when it matches the same artifact, environment, and acceptance criteria.
4. Report verified, failed, and inconclusive criteria, plus any unexercised journeys.
   Separate product defects from verification-instruction defects.

Done when the requested verification scope has evidenced outcomes and owned resources
are cleaned up without losing proof. A reusable skill's existence is not itself proof.

Adapted from pstack; [license and attribution](references/LICENSE.txt).
