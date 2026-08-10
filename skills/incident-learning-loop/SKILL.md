---
name: incident-learning-loop
description: Turn a closed or stabilized engineering incident into an evidence-backed Incident Learning Pack that distinguishes trigger, cause, contributing conditions, material impact, detection and recovery gaps, and verifiable corrective actions. Use after an outage, retry storm, data inconsistency, degraded workflow, or other incident when teams need to decide what to prevent, detect, or improve next; remain read-only and stop before remediation or active incident response.
license: MIT
metadata:
  author: William Cygan
  version: "0.1.0"
---

# Incident Learning Loop

Turn one closed or stabilized engineering incident into one reconciled,
evidence-backed Incident Learning Pack. Use the pack to decide what should be
prevented, detected, or improved next, then stop before remediation.

## Confirm the activation boundary

Use this skill only when all of these are true:

- one incident has a bounded trigger, affected scope, and time window;
- active harm is contained or the incident is closed;
- no urgent mitigation, rollback, restart, repair, or production decision
  remains in this workflow; and
- existing authorized evidence can be inspected without changing the system.

Treat an incident as **stabilized** only when its harmful progression is
contained, emergency operational ownership has ended or moved elsewhere, and
read-only evidence collection cannot interfere with recovery. A report that
the incident is stabilized is `reported` evidence until an authoritative
incident state, operator declaration, or equivalent source verifies it.

Stop and route active mitigation or urgent repair to the appropriate
operational workflow. Stop when independent incidents have been combined;
split them and run this skill once per incident. A flaky symptom without a
stabilized incident belongs to `diagnose-difficult-bug`, not this workflow.

## Preserve the authority boundary

Keep the run read-only. Inspect repository instructions, source,
configuration, incident records, redacted telemetry, existing tests, and
other already-authorized artifacts. Preserve source references, time windows,
and redactions.

Do not deploy, restart, reconcile, patch, roll back, add instrumentation,
create tests, generate production traffic, replay live messages, mutate data,
widen telemetry access, or create tracked files, issues, tasks, or remediation
records. Produce the pack in the response. Treat every corrective action and
proof plan as a proposal requiring separate authority.

Stop before evidence collection whose access, sensitivity, blast radius,
retention, or cleanup is unclear. Name opaque third-party boundaries and the
claims they prevent instead of requesting or exposing sensitive values.

## Preflight the companions

Resolve companions through the client's installed skill mechanism by exact
name. Pass this run's read-only authority boundary into every invocation; a
companion's mutating mode remains out of scope even when available. Do not read
sibling skill files or recreate a missing companion's method.

The following companions are conditional:

| Companion | Required only when | Returned artifact |
| --- | --- | --- |
| `diagnose-difficult-bug` | The causal mechanism remains uncertain after the incident evidence is framed. | Diagnosis Dossier |
| `map-production-scenario` | Material impact, ownership, data effects, or terminal outcome remains uncertain. | Production Scenario Dossier |
| `audit-observability-path` | A named detection or reconstruction question remains unanswered and neither routed dossier already contains the needed signal-gap evidence. | Observability audit evidence |
| `design-verification-strategy` | One or more evidence-supported corrective work packages are prioritized for proof planning. | Verification strategy for each selected package |

Check availability before invoking a route. If a predicate fires and its
companion is unavailable, mark the pack `blocked`, name the missing artifact,
and stop before the claims that artifact would support. `shape-safe-change`,
`plan-safe-refactor`, and domain skills are downstream handoffs, not companions
invoked during this learning run.

## Use the supporting resources

Read `references/incident-learning-model.md` only when detailed evidence or
causal-language taxonomy, action-ranking guidance, or reconciliation examples
are needed. Use `assets/incident-learning-pack.md` only when composing the
final pack. The core workflow and authority boundary remain in this file.

## Build the Incident Learning Pack

### 1. Create the Incident Card

Record:

- incident identifier or bounded label;
- reported trigger and expected behavior;
- affected scope and time window;
- closed or stabilized state and the evidence for that state;
- repositories, services, data stores, vendors, and environments in scope;
- authorized evidence sources and sensitivity constraints;
- authority boundary; and
- explicit exclusions, including adjacent incidents.

The card is complete when every later claim can be tested against the same
incident boundary without silently widening scope.

### 2. Create the Evidence Ledger

Assign stable evidence keys (`E1`, `E2`, ...) and finding keys (`F1`, `F2`,
...). For every source record its reference, time window, relevant claim,
evidence class, integrity or provenance limit, access boundary, and redaction.
Classify claims as `observed`, `verified`, `declared`, `reported`, `inferred`,
or `unknown`. Never let a source's presence upgrade the class of a claim it
cannot prove.

Preserve contradictions as separate ledger entries. Mark the consequence of
missing, expired, sampled, aggregated, or third-party evidence. When an
evidence class or causal term is ambiguous, apply the detailed taxonomy.

### 3. Plan routes from unresolved questions

Write the unresolved question before invoking any companion:

- **Causal question:** What mechanism produced the observed departure?
- **Impact question:** Which users, durable state, owners, or terminal outcomes
  were materially affected?
- **Signal question:** Could the incident be detected and reconstructed from
  existing signals?

Apply the narrowest route that owns the unanswered question:

1. Route to `diagnose-difficult-bug` only for causal uncertainty. Pass the
   Incident Card, Evidence Ledger, failure signature, and known controls.
   Require its Diagnosis Dossier with confidence and unknowns intact.
2. Route to `map-production-scenario` only for unresolved impact, ownership,
   data effects, or terminal outcomes. Give it one incident-specific impact
   question and terminal sink. It must not repeat causal diagnosis.
3. Route directly to `audit-observability-path` only for a still-unanswered,
   named detection or reconstruction question and only after checking all
   routed artifacts for usable signal-gap evidence.

When both the causal and impact predicates fire, execute
`map-production-scenario` first because its required signal phase may answer
questions needed by the later diagnosis. Pass its relevant evidence into
`diagnose-difficult-bug`; allow the diagnosis to invoke its own observability
route only when a causal reconstruction question is still blocked. This
scheduling reuses evidence without asking the impact companion to diagnose the
cause.

Do not repeat an observability audit to improve wording or confidence. Record
the route decision, input question, returned artifact, reused evidence, and
remaining gap for every considered companion.

### 4. Build one finding model

Separate these findings even when they are closely related:

- **Trigger:** the event or condition that initiated or exposed the incident.
- **Root cause or leading hypothesis:** the supported causal mechanism, or the
  strongest bounded explanation when a material causal edge remains unproven.
- **Contributing conditions:** conditions that changed likelihood, severity,
  propagation, or recovery without independently establishing the mechanism.
- **Material impact:** affected users, service commitments, data, money,
  security, operations, and terminal outcomes.
- **Detection gap:** why unhealthy behavior was not recognized accurately or
  promptly.
- **Response gap:** why available information did not lead to the right
  decision or ownership promptly.
- **Recovery gap:** why restoration, reconciliation, or proof of recovery was
  slow, unsafe, incomplete, or ambiguous.

Link every finding to evidence keys, give it `high`, `medium`, or `low`
confidence, and preserve contradictory evidence and unknowns. A correlation,
code smell, plausible source path, or untested hypothesis is not a root cause.
Apply the detailed causal thresholds when the label or confidence is disputed.

### 5. Rank the corrective action portfolio

Propose the smallest actions that address supported findings. Classify each as
exactly one primary category:

- **Prevention:** reduce the chance or propagation of recurrence.
- **Detection:** identify the unhealthy state or material outcome sooner and
  more reliably.
- **Response:** improve interpretation, ownership, or safe decision-making
  after detection.
- **Recovery:** restore service or state and prove the terminal outcome more
  safely or quickly.

For each action record its finding and evidence links, expected benefit, owner
boundary, priority rationale, dependencies, residual risk, and confidence.
Actions without a supported finding are unverified backlog candidates, not
recommendations. Use the detailed rubric when the ranking or category is
disputed.

Group related actions into bounded corrective work packages. Select no more
than three highest-priority packages for proof planning. Use fewer when the
evidence supports fewer; never promote speculative work merely to fill the
cap.

### 6. Define proof requirements for at most three packages

Invoke `design-verification-strategy` separately for each selected work
package, with a maximum of three invocations. Pass the supported finding,
corrective claim, affected invariant, critical risks, owner boundary,
environment constraints, and residual risk. Keep the companion read-only.

Carry back only the proof requirements needed for the pack: observable claim,
authoritative oracle, discriminating positive, negative, and recovery cases,
required fidelity, evidence artifact, acceptance gate, authority requirement,
and what remains unproven. Do not create tests, fixtures, CI, instrumentation,
or implementation plans. Leave all lower-ranked actions explicitly
`proof not planned`.

### 7. Reconcile instead of concatenating

Reconcile all incident and companion evidence into one account. Verify:

- the trigger, causal account, and material impact describe the same incident
  window and affected path;
- every root-cause or hypothesis edge has evidence and confidence;
- every impact claim reaches a supported user, durable-state, operational, or
  terminal outcome;
- each detection, response, and recovery gap attaches to a supported finding;
- every ranked action cites a finding and names its residual risk;
- each proof-planned package tests the corrective claim rather than merely
  repeating its proposed implementation; and
- contradictions, opaque boundaries, and unknown owners remain visible.

Revise linked sections together when one claim changes. If evidence cannot
resolve a contradiction, lower confidence or mark the pack incomplete. Read
the detailed reconciliation examples when a cross-artifact contradiction
cannot otherwise be resolved.

### 8. Report and stop

Compose one final pack from the reusable output template. Lead with one status:

- `complete`: causal, impact, gap, action, and selected proof claims reconcile;
- `incomplete`: the incident is bounded and safe to analyze, but material
  evidence remains unknown; or
- `blocked`: the incident is active or unbounded, authority is ambiguous,
  evidence collection is unsafe, or a required routed companion is unavailable.

An incomplete or blocked pack must state the last supported conclusion and the
smallest next evidence. Never claim a proven root cause, successful prevention,
or verified recovery without supporting evidence.

End with text-only downstream handoff boundaries:

- use `shape-safe-change` for an accepted cross-cutting, contract, schema,
  configuration, ownership, migration, or behavior change;
- use `plan-safe-refactor` for an accepted behavior-preserving structural
  change; or
- use the relevant domain skill for a narrower accepted change.

Do not invoke the handoff skill, design the change, create tracked remediation
artifacts, or begin implementation in this run. State the separate approval,
authority, and evidence needed next.

## Trigger examples

- “What should we learn and change after this incident?”
- “Create a prevention, detection, and recovery plan from this retry storm.”
- “Turn this stabilized outage into an evidence-backed follow-up package.”

Route “Fix the production outage now” to active incident operations. Route
“Why is this flaky?” to `diagnose-difficult-bug`. Route “Map this event's data
and telemetry” to `map-production-scenario` or its single-lens companions.
