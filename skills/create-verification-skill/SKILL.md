---
name: create-verification-skill
description: "Create a project skill that launches, exercises, and verifies real application behavior. Use when reusable project verification guidance is requested or needed."
license: MIT
metadata:
  kind: component
  upstream-repository: https://github.com/cursor/plugins
  upstream-revision: 1e5c90a4b6f249917bd21fe361b3a2a7deb741b8
  upstream-path: pstack/skills/create-verification-skill
  upstream-author: Lauren Tan
  maintenance: local
---

# Create a verification skill

1. Inspect the project's actual user surfaces, startup commands, prerequisites,
   existing checks, interaction methods, and observable side effects. Establish
   instance ownership and whether concurrent runs can safely be isolated.
2. Use the project's chosen skill location and standard name/description frontmatter.
   Write exact, observed instructions for launch, usable readiness, instance health,
   driving behavior, evidence capture, and cleanup. Include executable helpers only
   when they materially improve repeatability, and document their invocation.
3. Map the main user journeys, starting with roughly three to five where available.
   Each entry names prerequisites, real entry points, actions, and observable success.
   Keep a linked feature index and detail under the skill's references directory.
4. Require real user paths and side-effect checks. Identify simulated external
   boundaries explicitly. Missing prerequisites are coverage gaps; do not weaken
   a journey to manufacture a pass. Validate what a dry-run actually changes.
5. Execute the generated instructions end to end for at least one mapped journey:
   launch, health check, drive, capture proof, and cleanup. Clean owned resources
   after failed attempts too; confirm evidence remains afterward.
6. Validate the skill format and report which journeys and target environments
   were exercised. If the application cannot run, preserve a clearly labeled draft
   with the exact blocker rather than claim a working verification skill.

Done when a fresh reader can execute the skill, one complete journey has evidence,
cleanup preserves that proof, and untested journeys remain explicitly identified.

Adapted from pstack; [license and attribution](references/LICENSE.txt).
