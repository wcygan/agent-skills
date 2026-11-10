---
name: create-verification-skill
description: "Create a project skill that launches, exercises, and verifies real application behavior through its main user journeys. Use when a project needs reusable e2e, smoke test, or journey verification guidance that tells an agent how to launch the app, drive it, and capture evidence."
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

Instance ownership means what a run started and may therefore stop: the process,
port, test data, or environment it launched. A shared instance belongs to whoever
started it and stays running.

Starting and stopping an instance the run owns, retrying readiness, and rerunning
a journey need no go-ahead. Get an explicit go-ahead before seeding a shared
database or writing outside the skill directory, because both change state that
other people or runs depend on.

1. Inspect the project's actual user surfaces, startup commands, prerequisites,
   existing checks, interaction methods, and observable side effects. Establish
   instance ownership and whether concurrent runs can safely be isolated.
   Post a short progress update: what surfaces and commands were found.
2. Use the project's chosen skill location and standard name/description frontmatter.
   Write exact, observed instructions for launch, usable readiness, instance health,
   driving behavior, evidence capture, and cleanup. Include executable helpers only
   when they materially improve repeatability, since each helper is one more thing
   to keep in step with the project, and document their invocation.
3. Map the main user journeys, starting with roughly three to five where available.
   Each entry names prerequisites, real entry points, actions, and observable success.
   Keep a linked feature index and detail under the skill's references directory.
   Post a short progress update: which journeys are mapped.
4. Require real user paths and side-effect checks. Identify simulated external
   boundaries explicitly. Record a missing prerequisite as a coverage gap rather
   than weakening the journey, because a weakened journey passes without proving
   the behavior. Validate what a dry-run actually changes.
5. Execute the generated instructions end to end for at least one mapped journey:
   launch, health check, drive, capture proof, and cleanup. Clean owned resources
   after failed attempts too; confirm evidence remains afterward.
   Post a short progress update: which journey ran and whether it produced evidence.
6. Validate the skill format and report which journeys and target environments
   were exercised. If the application cannot run, keep a clearly labeled draft
   with the exact blocker, because a draft presented as a working skill would be
   trusted by the next reader without evidence.

Continue unless the application cannot be launched or a prerequisite is missing;
report that blocker when it stops you. End with a self-contained recap that leads
with the outcome, then which journeys have evidence, which do not, and what is next.

Done when a fresh reader can execute the skill, one complete journey has evidence,
cleanup preserves that proof, and untested journeys remain explicitly identified.

Adapted from pstack; [license and attribution](references/LICENSE.txt).
