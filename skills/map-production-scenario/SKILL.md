---
name: map-production-scenario
description: "Explain one production scenario across code execution, data changes, and operational evidence. Use when all three need a combined account."
license: MIT
metadata:
  author: William Cygan
  version: "0.1.0"
---

# Map a Production Scenario

Produce one integrated Production Scenario Dossier for one concrete operation.
Own the scenario boundary, companion routing, shared identities,
reconciliation, and final judgment. Let each companion own the analysis and
evidence for its lens.

## Preserve the authority boundary

Keep scenario mapping read-only. Inspect source, configuration, schemas, tests, and existing authorized operational artifacts. Use redacted structure and metadata instead of sensitive production records.

Mapping alone does not authorize production traffic, replays, instrumentation, schema edits, or repairs. Record missing evidence and the smallest safe inspection. If the user also requests changes, finish the evidence-backed map and continue into those authorized changes; retain access and operational safeguards.

## Preflight the dossier

Prefer `trace-codepath`, `trace-data-lineage`, and `audit-observability-path` for the execution, data, and signal lenses. Use `trace-failure-path` for the named failure variant when its predicate applies.

If a companion is unavailable, establish its lens directly with available evidence and capabilities. Report the method used and preserve evidence labels. Continue independent lenses; block only claims that require missing evidence or an essential capability.

## Define one scenario

Write a scenario card before invoking a companion:

- **Trigger:** one request, event, command, timer, job dispatch, or state
  transition.
- **Variant:** one success or named input, configuration, authorization, or
  lifecycle variant.
- **Question:** one operational behavior the dossier must explain.
- **Terminal sink:** one response, durable result, state transition, external
  handoff, or proven opaque boundary where the scenario ends.
- **Scope:** the repositories, services, environments, and existing artifacts
  that may be inspected.
- **Exclusions:** adjacent branches and platform areas that are not needed to
  answer the question.

Select the narrowest representative scenario supported by the request and
repository evidence. If materially different triggers, variants, or sinks
remain, ask the user to choose one. Do not turn the dossier into a
repository-wide architecture survey.

Assign stable stage keys (`S1`, `S2`, ...) to the anticipated path and boundary
keys (`B1`, `B2`, ...) to process, transport, asynchronous, datastore, or
external boundaries. Companions may refine the sequence, but reuse the keys
across every phase.

## Route the companions

Establish execution first, then use that path to select material data and signals. Reuse existing evidence rather than repeating a completed analysis. The table defines the evidence each lens needs, whether obtained through a companion or directly.

| Phase | Companion | Route | Phase input | Required phase output |
| --- | --- | --- | --- | --- |
| Execution | `trace-codepath` | Always | Scenario card, stage and boundary keys | Scenario path to the terminal sink, edge ledger, evidence classes, conditions, state effects, and opaque boundaries |
| Data | `trace-data-lineage` | Always, after execution | Scenario card, established path, boundary keys, and the minimum material data units selected from that path | Lineage ledger for each selected unit, transformations, copies, authoritative owners, identity rules, lifecycle semantics, and gaps |
| Signals | `audit-observability-path` | Always, after execution and data | Scenario card, established path, boundary keys, material outcomes, and current shared identity map | Coverage ledger, correlation assessment, answerable and unanswerable diagnostic questions, signal gaps, and safe next evidence |
| Failure | `trace-failure-path` | Only for a named broken variant | Baseline path, named failure trigger or symptom, divergence stage, expected contract, terminal question, state effects, and shared identity map | Failure ledger from divergence to terminal outcome, attempt and recovery semantics, surfaces, partial state, and gaps |

Select only data units necessary to explain the question or terminal outcome:
fields, records, events, messages, state transitions, or persisted results that
are created, transformed, copied, owned, or exposed along the established
path. Mere containment does not make a field material.

Run the failure phase only when the user or evidence names a concrete broken
variant such as a timeout, rejected message, dependency error, cancellation,
or retry exhaustion. A general question such as “can failures be
reconstructed?” belongs to the signals phase and does not justify inventing a
failure branch.

## Maintain the shared identity model

Start the identity table from execution evidence, refine it during lineage,
and test it during the signals and failure phases. Track names and shapes, not
real identifier values.

| Identity class | Meaning |
| --- | --- |
| Operation | The end-to-end logical intent; it normally survives retries and redelivery. |
| Attempt | One execution or retry of an operation; distinct attempts must not collapse into one outcome. |
| Message | One transport envelope or event instance crossing an asynchronous boundary. |
| Job | The scheduler, workflow, run, or task identity used by the execution system. |
| Domain | The business entity, aggregate, record, or result identity affected by the operation. |

For each class, record its actual field name, creation point, owner,
propagation or mapping at every boundary, and supporting evidence class. Mark
the class `not applicable`, `absent`, or `unknown` when appropriate. Never
invent a universal correlation identifier, equate two classes because their
values look alike, or use a domain identifier alone as proof of causality.

## Reconcile the ledgers

Build a reconciliation matrix keyed by stage or boundary. Reconcile rather
than concatenate the companion reports:

| Key | Execution edge or state | Material data effect | Operational evidence | Failure effect, if routed | Identities present | Confidence or gap |
| --- | --- | --- | --- | --- | --- | --- |

Apply these checks:

1. Every scenario-critical execution hop has a named data effect or an
   explicit `none`, plus a usable operational signal or a visible gap.
2. Every lineage transformation or copy attaches to the execution stage that
   causes it and identifies its authoritative owner.
3. Every coverage row attaches to an established stage or boundary and states
   which operation, attempt, message, job, and domain identities it preserves.
4. The terminal sink agrees across execution, durable data outcome, and the
   operator-visible outcome. An absent outcome signal is a gap, not success.
5. A failure ledger diverges at an established execution stage, distinguishes
   attempts, and reconciles partial state and recovery signals with the data
   and coverage ledgers.
6. Contradictory companion claims remain explicit. Prefer stronger direct
   evidence, but do not silently smooth over different owners, identifiers,
   paths, or terminal outcomes.

Use the common evidence classes `observed`, `verified`, `declared`, `inferred`,
and `unknown`. Preserve source locations and evidence citations from the
companions beside the claims they support.

## Handle stopping conditions

Mark the dossier **complete** only when every applicable lens has its required evidence, all scenario-critical ledger rows reconcile through shared
identities, and the three required lenses reach the terminal sink without an
opaque boundary that could change the answer.

Mark it **incomplete** when evidence ends at an opaque boundary, an identity
join is unsupported, a material lineage unit cannot be followed, or the
terminal outcome cannot be reconstructed. Stop claims at the last supported
stage, identify the exact boundary or ledger row, and state the next evidence
needed.

Mark it **blocked** when the scenario cannot be bounded or essential evidence or capabilities are unavailable. List completed phases, if any, but do not present a
partial result as a complete dossier.

Assign confidence by lens and overall:

- **High:** scenario-critical claims are observed or verified, identities join
  across material boundaries, and the terminal outcome is proven.
- **Medium:** the path is coherent, but declared or inferred evidence leaves a
  non-critical uncertainty.
- **Low:** an unknown boundary, broken identity join, conflicting ledger, or
  unproven terminal outcome could change the answer.

Overall confidence cannot exceed the lowest confidence of a
scenario-critical lens.

## Report the Production Scenario Dossier

Cover these areas in one dossier. Combine overlapping sections and link detailed ledgers rather than repeating them:

1. **Status and conclusion:** complete, incomplete, or blocked; the established
   behavior and whether operators can reconstruct the outcome.
2. **Scenario card:** trigger, variant, question, terminal sink, scope, and
   exclusions.
3. **Integrated scenario view:** the smallest diagram or text graph that shows
   execution stages, boundaries, material data effects, and signal coverage;
   include the failure divergence only when routed.
4. **Shared identity map:** operation, attempt, message, job, and domain
   identities with mappings and discontinuities.
5. **Reconciliation matrix:** one row per material stage or boundary.
6. **Supporting ledgers:** execution, lineage, and coverage ledgers, plus the
   failure ledger when routed, without repeating identical evidence.
7. **Confidence, contradictions, and gaps:** per-lens and overall confidence,
   opaque boundaries, conflicts, and their consequences.
8. **Next evidence:** the smallest safe, read-only inspection that would close
   each important gap.

Keep recommendations separate from established behavior. End when the
terminal sink is reconciled or when a blocking or opaque boundary has been
reported visibly.

## Trigger examples

Use this skill for:

- “Explain this production request, including its data and telemetry.”
- “Map this scheduled job from dispatch to persisted result.”
- “Show how this event flows and whether failures can be reconstructed.”

Route a single-lens request directly to its companion instead:

- “Trace this function to its caller.” → `trace-codepath`
- “Where does this customer field get copied?” → `trace-data-lineage`
- “Which logs correlate this queue handoff?” → `audit-observability-path`
- “Why does this timeout cause duplicate writes?” → `trace-failure-path`

A request such as “Repair the currently failing deployment” is operational
repair, not a Production Scenario Dossier.
