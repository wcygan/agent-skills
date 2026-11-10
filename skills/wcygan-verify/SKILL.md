---
name: wcygan-verify
description: "Verify a change against its acceptance criteria on the real artifact, and create or maintain a reusable project verification skill when repeated checks need one. Use to verify a completed change, test an application journey end to end, or confirm a fix works."
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

Read the shared [principle index](../wcygan-mode/references/principles.md) at entry and reconsider it as the work changes. Report each principle that changed a decision, with the specific choice it shaped.

Read linked components only when their stated condition applies, so the context
stays small. Keep the task's scope and any checkpoint the user set.

1. Identify the artifact and acceptance criteria. Locate any existing project
   verification skill and inspect whether it covers the relevant user journeys.
2. If reusable verification guidance is requested or necessary for repeated work,
   use `create-verification-skill` when absent. Use `maintain-verification-skill`
   when an existing skill is stale or its audit was requested. A one-off check
   needs neither. When a property must hold across every case in a stated scope,
   such as a race, retry, state machine, parser, or unsafe code, and formal
   verification is requested, use `create-formal-verification-skill`.
3. Use `verify-behavior`, following applicable project instructions. Count
   evidence from skill creation or maintenance as coverage only when it matches
   the same artifact, environment, and acceptance criteria, because a run on a
   different revision proves nothing about this one.
4. Report verified, failed, and inconclusive criteria, plus any unexercised
   journeys. Count a verification skill as proof only for the journeys it was run
   on in this check, because its existence says nothing about the current
   artifact. Separate product defects from verification-instruction defects.

Done when the requested verification scope has evidenced outcomes and owned resources
are cleaned up without losing proof.

Adapted from pstack; [license and attribution](references/LICENSE.txt).
