---
name: design-loop
description: "Design, style, or redesign websites and apps through investigation, layout, design-system creation, implementation, validation, and delivery. Use for an autonomous UI design loop, including from-scratch builds and replacement of poorly designed interfaces."
license: MIT
metadata:
  author: William Cygan
  version: "0.3.0"
---

# Design Loop

Own one integrated result: a consistent, easy-to-use interface that helps a user
complete a specific task with fewer unnecessary steps. Carry the same brief and
acceptance criteria from investigation through delivery; advance on evidence.

Run the whole authorized flow independently. Make routine layout and implementation
decisions, recommend an approach, build it, verify it, and correct failures.
Honor requests limited to a brief, wireframe, prototype, or review. A request to
design a UI does not itself authorize a production deployment.

## 1. Investigate and frame

Inspect the request, repository instructions, existing UI, components, routes,
relevant data, and supplied research. Exercise the current task when possible.
Preserve existing work and identify the actual implementation boundary.

Choose the design mode from the request:

- **Improve:** retain useful established conventions while addressing a bounded problem.
- **Redesign:** reconsider layout, navigation, interaction, components, and visual
  language from the user task. Existing design has no privileged status.
- **From scratch:** establish the task structure and a coherent design system together.

A request to redesign a poorly styled product authorizes replacing its design
within the requested scope. Treat the current UI as evidence of capabilities and
friction, not as a specification to preserve. Retain required business behavior,
data contracts, user content, and explicit brand constraints; retain visual or
interaction precedent only when it earns its place against the brief. Reusing the
technical stack does not require reusing its presentation layer.

Maintain a compact brief in task state or an existing project design document:

```text
User and task:
Current friction and supporting evidence:
Desired outcome:
Design mode and explicit brand constraints:
Scope and preserved behavior:
Content, actions, and business rules:
Existing components and design conventions:
Acceptance criteria and verification method:
Assumptions and unresolved decisions:
Authorized delivery: artifact | implementation | PR | deployment
```

Separate observations from hypotheses. Infer reversible details from the project;
ask when missing information changes the user goal, business rule, scope, or
authorized external action. Continue independent work while awaiting answers.

**Done:** the primary task, bounded change, and observable success criteria are
clear. If evidence is unavailable, record the assumption and its verification gap.

## 2. Structure the task

Read [references/structure.md](references/structure.md) when organizing pages,
navigation, content, forms, or responsive layouts.

Map the shortest understandable path through the task, including recovery.
Prioritize content and actions; choose grouping, navigation, screen boundaries,
and relevant loading, empty, error, success, and permission states. Remove steps
that serve no user need while preserving necessary review and safeguards.

**Done:** every required piece of content and action has a place, the task has a
complete path, and responsive behavior preserves access to essential actions.

## 3. Inspect references and explore

Read [references/product-patterns.md](references/product-patterns.md) when selecting
design-system inspiration or resolving an unfamiliar interaction pattern.
Use LinkedIn, X, Linear, Facebook, Mercury, Ramp, Figma, and Vercel as reference
candidates. Inspect relevant examples and adapt the underlying task pattern.

Use the bundled **Forma reference app** for settings, records, overview/detail,
public product pages, feeds, approval workflows, and agent chat. It connects
these patterns through actual React routes, shared tokens, and local SQLite.
Read [references/reference-app.md](references/reference-app.md) before running
or inspecting it; [examples/README.md](examples/README.md) owns application setup.

Resolve paths from this skill's directory, including when installed under
`~/.agents/skills/design-loop`. Run from any working directory using the installed global location:

```sh
just --justfile "$HOME/.agents/skills/design-loop/examples/justfile" dev
```

For another installation location, resolve the justfile relative to this loaded
skill. In the repository example directory, `just dev` or `bun run dev` works.
The launcher prepares dependencies and samples; installed skills run from a
writable cache so the pinned skill contents remain unchanged.

The app listens on `0.0.0.0:5173`, including the host's Tailscale interface.
Open `http://127.0.0.1:5173` locally or the printed Tailscale MagicDNS/IP URL
from a peer. The launcher discovers and allows the host's exact Tailscale names.
Use Browser Use's local CLI to navigate, exercise the relevant route and recovery
states, and capture layout evidence. Keep the app in mock mode, use sample data,
and record the route, observed interaction, design rationale, and adaptation to
the target brief. Read the inspection guide for Browser Use setup, MagicDNS,
responsive checks, lifecycle, and limits. Adapt the patterns in the target app's
stack; the reference is inspiration rather than a required product or framework.

Start structural exploration with grayscale, system fonts, plain borders, real
labels, and representative content. Use existing visual styles directly when the
structure is settled, the mode is improve, and the styles fit the brief. Neutral
wireframes are a structural tool, not the final aesthetic for a styling request.

Read [references/design-system.md](references/design-system.md) for from-scratch
design, styling, restyling, or replacement of an existing design system. Select a
visual direction and build a representative styled slice before propagating it.

Create two or three directions only when a meaningful structural decision remains
uncertain. Keep the task and content constant; vary navigation, grouping, density,
action placement, or task sequencing. For standalone wireframes, prefer one
self-contained responsive HTML file with useful click-through behavior.

Compare directions against the brief. Recommend one and explain its material
tradeoff. Continue with the recommendation when within the agreed scope; routine
phase transitions do not require renewed approval.

**Done:** one approach is selected with a task-based rationale, reference evidence
or clearly labeled inference, and any unresolved consequential decision exposed.

## 4. Build the recommended approach

Implement in the project's existing stack unless changing it is in scope. In
improve mode, reuse suitable components and conventions. In redesign and
from-scratch modes, establish or replace shared tokens and components to implement
the selected system; judge existing elements by fit rather than longevity.
Apply the system consistently across all in-scope screens and states.

Connect the primary path to actual data and behavior when implementation is in
scope. For prototypes, label simulated behavior and its limits. Keep structural
decisions separate from visual-language decisions so both can be evaluated.
For styling requests, deliver the complete selected visual language, including
typography, color, spacing, surfaces, controls, and interaction states.

**Done:** the selected approach works at the requested fidelity, required states
are represented, and each change supports the agreed task.

## 5. Validate and revise

Read [references/validation.md](references/validation.md) before checking the
candidate. Exercise the primary task, recovery paths, keyboard operation, and
desktop/mobile layouts. Run repository checks appropriate to the changed behavior.

Compare the candidate with the baseline and acceptance criteria. Fix demonstrated
failures, then repeat affected checks. Keep criteria stable; record any justified
change to the verification method. Separate agent inspection from real user evidence.

Use up to three corrective passes by default, or the user's stated budget. Stop
earlier when two consecutive passes reproduce the same failure without a new
supported hypothesis, or when required evidence or authority is unavailable.
Preserve the candidate and report incomplete criteria instead of calling it done.

**Done:** every required criterion has passing evidence; material limitations are
explicit. An attractive screenshot alone does not establish task completion.

## 6. Deliver and learn

Read [references/delivery.md](references/delivery.md) when preparing a handoff,
PR, preview, deployment, or follow-up iteration.

Complete the authorized delivery steps. Report the user-facing change, selected
approach and important tradeoff, artifact or changed files, verification evidence,
and unresolved problems. Retain authorization across phases; prepare a concrete,
reviewable result before requesting any missing external-action authorization.

**Done:** the bounded outcome passes its criteria and authorized delivery is complete.
Re-enter the loop only for observed feedback, a failed criterion, or a newly agreed
objective. Treat future user research as pending work rather than inventing findings.

## Portability

This skill owns the flow and requires no companion skill. Use available browser,
design, repository, and deployment tools that fit the environment. Optional
specialists can supply bounded evidence; reconcile their output against the brief.
Use direct analysis when they are unavailable. Report unavailable verification
honestly and finish independent authorized work.

## Example requests

- “Use design-loop to simplify this settings page. Implement and verify your
  recommendation, then open a draft PR.”
- “Design a neutral wireframe for this dashboard. Compare layouts and recommend
  one; stop at the HTML artifact.”
- “Improve this expense-submission flow using relevant established product
  patterns. Keep the existing components and deploy to the authorized preview.”
- “Redesign this badly styled app from first principles. Replace its layout and
  visual system as needed, preserve its required capabilities, and verify the result.”
