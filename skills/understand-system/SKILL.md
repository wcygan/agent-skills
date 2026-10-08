---
name: understand-system
description: "Build an evidence-backed visual explanation of an application or subsystem. Use when understanding a system requires connecting components, important flows, data ownership, and operational boundaries; default to styled 2D diagrams."
license: "MIT"
metadata:
  author: "William Cygan"
  version: "0.1.0"
---

# Understand a System

Build one connected, evidence-backed explanation of an application or subsystem:
what it supports, how components cooperate, where authoritative data lives, and
which boundaries matter to operation and future changes. Deliver a styled 2D
system map with coordinated views and source anchors.

Use `trace-codepath` for a single execution question and
`map-production-scenario` for one operation requiring execution, data, and signal
lenses. Use `improve-codebase-architecture` when the result sought is structural
improvement. This workflow owns orientation, not automatic redesign.

## Preserve application state and deliver the explanation

Read repository instructions and inspect dirty state. Keep application source,
configuration, data, and existing documentation read-only during orientation.
Inspect existing contracts, local checks, and authorized operational evidence;
mapping does not authorize production queries, test traffic, instrumentation,
dependency installation, or domain-document changes.

Creating the requested explanation permits task-owned visual artifacts. Save
them outside tracked application files by default, or at the requested output
location. Documentation edits and other implementation follow their granted
scope; completion of this explanatory phase does not revoke authorization for
other requested work. Preserve unrelated changes.

Read [Companion contracts](references/companion-contracts.md) when selecting a
specialist; consult only its selected section. Compose in the current session
by default. Delegation requires
authorization; use `route-agent-models` and pass bounded context, evidence,
revision, and phase authority. Routes add no tools or permissions.

Companion availability is separate from the required result. Use direct analysis
or presentation when available knowledge and tools can meet the same contract;
identify the method and any unavailable guide or capability. Keep unsupported
claims and unverified presentation visible rather than inventing evidence.

## 1. Frame the reader's questions

Record:

```text
System purpose, users/actors, and supported outcomes:
Reader and questions the explanation must answer:
Repository/revision, subsystem boundary, and available evidence:
Representative scenarios and important excluded areas:
Delivery format, output location, and supported viewports/themes:
Visual dimension: 2D unless explicitly requested otherwise:
Authority and evidence or delivery constraints:
```

Infer routine scope from the request and repository evidence. Start with an
overview and one important journey; add views only when they answer distinct
reader questions. Consult existing domain terminology and decisions. Invoke
`domain-modeling` only if changing the domain model or its documents is itself
requested; reading a glossary needs no mutating companion.

**Complete when:** the audience, bounded system, questions, representative
scenarios, and visual delivery contract are clear.

## 2. Establish components and evidence-backed relationships

Inspect executable entrypoints, registration, dependency construction,
deployment units, schemas, state owners, and external integrations. Distinguish
repository organization from runtime topology. A folder, interface, package,
or configured client is not automatically a deployed service or observed call.

Maintain one shared model:

```text
component ID | purpose | authoritative owner/state | source anchor
relationship | from/to IDs | mechanism/condition | evidence | confidence
scenario ID | trigger | selected components | terminal outcome | gaps
```

Label material claims as observed, source-verified, declared, inferred, or
unknown. Preserve opaque boundaries and source/runtime differences. Read
[System map model](references/system-map-model.md) when the map spans multiple
contexts or deployment units, async handoffs, derived state, mixed evidence, or
too many details for one readable view.

**Complete when:** each material component has a supported role and anchor,
each drawn relationship has evidence or a visible uncertainty label, and
topology assumptions are explicit.

## 3. Connect important journeys and data ownership

Trace selected scenarios from trigger to terminal outcome. Use
`trace-codepath` for unresolved dispatch or execution and `trace-data-lineage`
for uncertain identity, transformation, ownership, or copies.

Use `map-production-scenario` when a selected operation needs all three of its
execution, data, and signal lenses. Reuse its artifacts instead of repeating
those analyses separately. Add failure or recovery detail only when it answers
a reader question or explains a material guarantee.

Connect the journey to authoritative versus derived state, synchronous versus
asynchronous boundaries, access decisions, and relevant lifecycle or recovery
ownership. Show operational signals only to the fidelity available. Keep
critical correctness and change boundaries visible without turning the map
into a resilience audit or speculative refactor list.

Reconcile names, component identities, arrows, data owners, scenario variants,
and revision across all views. Resolve contradictions through a discriminating
inspection; retain unresolved ones as explicit questions.

**Complete when:** each selected journey reaches a supported terminal outcome
or named opaque boundary, material state ownership is accounted for, and every
view refers to the same reconciled model.

## 4. Build the visual explanation with `style-technical-visuals`

Presentation is a core deliverable. Use `style-technical-visuals` with the
reconciled model, reader questions, evidence labels, format, and viewports.
Select **2D explicitly** before the handoff, then follow its 2D guide and closest
active standalone example. This supplied selection settles the dimension;
there is no recurring 2D/3D question. Use its 3D branch only when explicitly
requested, retaining the same factual and accessibility requirements.

Make coloring, the design system, and icons part of the visual contract:

- **Design system:** use existing product tokens when applicable; otherwise
  adapt the selected example's shared tokens, typography, surfaces, spacing,
  borders, and control patterns. Keep a consistent visual language across views.
- **Semantic color:** assign each color role a stable meaning, with a compact
  legend or direct explanation. Distinguish component categories, focus, and
  evidence/state overlays without reusing a color ambiguously. Reinforce color
  with labels, shapes, badges, or line styles.
- **Icons:** use a consistent set for component roles and verified technology
  identities. Keep visible names beside icons; preserve attribution for reused
  marks. Use generic role symbols when the technology is unknown. An icon must
  not invent a product, deployment, or responsibility.
- **Geometry and hierarchy:** make boundaries, ports, arrows, and labels
  readable; start at system purpose and major components, then expose journey
  or data detail. Keep evidence anchors and unknowns accessible near claims.

Honor the requested format. For a richer explanation, prefer one standalone
2D HTML/SVG artifact with coordinated panels. Add selection, step-through, or
detail inspection only when it teaches a real relationship or sequence.
Static topology can remain static. Simulated steps must be labeled as explanatory
models, separate from observed runtime or measured quantities.

**Complete when:** the styled artifact answers the reader's questions, every
view uses the agreed tokens/colors/icons, and its content matches the model.

## 5. Verify meaning and presentation, then deliver

Check every material node, edge, state owner, and scenario against its evidence.
Walk journeys forward from entry and backward from terminal outcome. Confirm
that abstraction has not hidden access, durable handoff, ordering, or other
boundaries needed to understand the system.

Follow `style-technical-visuals` through rendered verification with available
browser or artifact tooling. Check supported desktop and compact views, themes,
controls, reading order, contrast, labels, connection geometry, icon meanings,
and stable semantic colors. The explanation must remain understandable without
color or motion. Account for offline loading when delivery promises a
self-contained artifact; report any rendering or interaction checks unavailable.

Lead with **explained and visually verified**, **explained; verification
limited**, or **partial/blocked**, according to evidence. Provide the artifact
or inline visual, a short account of system purpose and key journeys, navigation
anchors for important components, material invariants, and unresolved questions
with their smallest next evidence. Keep secondary detail in the artifact or
supporting ledger instead of repeating all companion reports.

**Complete when:** the requested questions have a supported visual explanation,
source anchors and uncertainty are retained, presentation checks are accounted
for, and the user can open or inspect the delivered result.
