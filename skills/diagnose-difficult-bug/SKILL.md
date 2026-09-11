---
name: diagnose-difficult-bug
description: "Diagnose one intermittent, stateful, or distributed bug. Use when a deterministic unit failure or single stack trace cannot explain the cause."
license: MIT
metadata:
  author: William Cygan
  version: "0.1.0"
---

# Diagnose a Difficult Bug

Orchestrate one difficult bug from reported symptom to bounded causal diagnosis.
Keep reproduction, diagnosis, repair, and review as separate phases.

## Activation boundary

Use this skill for one intermittent, stateful, environment-dependent, or
distributed symptom whose cause cannot be established from a deterministic
unit failure or one stack trace. Typical requests include:

- "Diagnose this once-a-day timeout."
- "Find why duplicate work happens only during retries."
- "Investigate this difficult bug without fixing it."

Do not use it to fix an obvious null dereference, implement a known repair,
review a completed bug-fix branch, or survey unrelated failures. Select one
operation, one failure signature, and one environment boundary.

## Preserve the authority boundary

Keep a diagnosis-only request read-only on tracked files. A combined diagnosis-and-fix request can continue into local repair after the causal evidence is established. Read repository instructions
and inspect dirty state before diagnostics. Safe, isolated commands may create
run-owned temporary or ignored artifacts, but must not alter shared or
production state.

Create a tracked reusable reproducer only when the user explicitly requests
one or when it is necessary to an authorized repair. Reproducer permission alone covers its smallest demonstrated control seam, not unrelated production changes. Preserve unrelated work and report files created or changed.

Do not inject faults into production, replay real traffic, mutate shared data,
disable safeguards, or run unbounded stress or load. Stop before an experiment
whose effects, limits, ownership, or cleanup are unclear. Prefer existing
artifacts, isolated fixtures, deterministic controls, and bounded attempts.

## Select useful companions

Prefer these specialists for the two core evidence needs:

- `reproduce-bug` owns the faithful reproduction and its mechanical oracle.
- `trace-failure-path` owns the evidence-backed propagation graph.

Use available companions by name and preserve their evidence labels and unknowns. If a companion is missing, perform the analysis directly when available tools and knowledge can establish the same evidence. Do not claim a companion was invoked when it was not. The conditional lenses below apply when their predicates are true; pause only claims that depend on evidence or capabilities that remain unavailable, and continue independent work.

## Run the diagnosis

### 1. Frame one symptom

Record the reported operation, exact symptom, expected contract, affected
environment, known frequency, time window, and exclusions. Distinguish facts
reported by the user from current observations. Define the terminal question
the diagnosis must answer.

This step is complete when a matching outcome can be classified mechanically
without relying on incidental wording, timestamps, or intuition.

### 2. Establish the reproduction

Use `reproduce-bug` when available, or establish reproduction directly, with the framed symptom. Keep tracked-file changes within the requested reproduction or repair scope. Record the
reproduction status, failure signature, bounded attempt ledger, necessary
conditions, negative control, artifacts, and oracle.

Reproduction and diagnosis are distinct:

- Continue to causal analysis after a reliable reproduction.
- Continue cautiously after a probabilistic or environment-specific
  reproduction only when at least one captured attempt matches the signature
  and retains evidence for the same failure path.
- For `not reproduced` or `blocked`, produce a partial Diagnosis Dossier with
  the missing evidence. Continue independent investigation, but do not assert a verified root cause. A report, stack trace, or source inspection alone does not replace reproduction.

Do not call a condition causal merely because toggling it changes frequency.
The reproduction establishes the phenomenon; later steps establish why it
happens.

### 3. Trace the reproduced failure

Use `trace-failure-path` when available, or trace directly with the reproduction signature, controlled
conditions, and captured artifacts rather than the original report alone.
Require the earliest supported divergence, every material propagation or
translation edge, retry and timeout ownership, durable state effects, user and
operator surfaces, and terminal outcome.

Annotate every node and edge with its evidence class and confidence. Leave a
gap visible when an edge is inferred or unknown. This step is complete when the
graph connects the reproduced trigger to its terminal outcome or identifies
the exact missing edge that prevents reconstruction.

### 4. Maintain the hypothesis ledger

Keep competing explanations separate. For each hypothesis record its causal
mechanism, discriminating prediction, supporting and contradicting evidence,
status, evidence classes, confidence, and smallest safe next check. Reject a
hypothesis when its discriminating prediction fails; do not add qualifications
until it becomes unfalsifiable.

Use these evidence classes consistently:

- **observed:** current runtime or controlled-reproduction evidence;
- **verified:** source, executable configuration, or authoritative state;
- **declared:** contracts, documentation, or policy;
- **reported:** user or incident evidence not independently observed;
- **inferred:** an explanation supported indirectly; and
- **unknown:** unavailable, ambiguous, or unsafe to obtain.

### 5. Model concurrency when ordering can change the outcome

Use `model-concurrency` when available, or model the relevant ordering directly, when at least one of these predicates is true:

- two or more independently advancing actors access shared or durable state and
  their overlap can affect the signature;
- retry, timeout, cancellation, lease, acknowledgment, transaction, failover,
  or duplicate delivery creates an ambiguous outcome; or
- the reproduction changes when the relative order of material events changes.

Asking about asynchronous code by itself is not enough. When invoked, require
the shortest evidence-grounded violating schedule, a nearby valid schedule,
the violated invariant, supported happens-before edges, and a deterministic
test seam. Mark unsupported ordering edges as unknown. If no predicate is true,
state that the counterexample schedule is not applicable.

### 6. Audit observability when signals block reconstruction

Use `audit-observability-path` when available, or audit signals directly, when any of these predicates prevents the
failure graph from being completed:

- the initiating operation cannot be correlated with its attempts or
  asynchronous descendants;
- available signals cannot distinguish the earliest cause from downstream
  symptoms, retries, or cleanup failures; or
- the authoritative durable state or terminal outcome cannot be observed.

Use the audit to map existing evidence and specify the smallest safe signal
needed next. An instrumentation recommendation is not evidence and does not
fill a graph edge. If the required evidence remains unavailable or unsafe to
obtain, keep the diagnosis blocked and stop.

### 7. Synthesize causal confidence

Attach an evidence class and `high`, `medium`, or `low` confidence to every
conclusion. Use a compact annotation such as:

```text
[evidence: observed + verified; confidence: high]
```

Use **root cause** only when all of the following hold:

1. a faithful reproduction matches the reported signature;
2. the proposed mechanism explains the complete material failure graph;
3. a discriminating control or counterexample schedule changes the outcome as
   predicted;
4. a nearby negative control does not produce the failure; and
5. no material causal edge remains inferred or unknown.

Call a supported mechanism with one material unproven edge a **leading causal
hypothesis** at medium confidence. Treat a report, correlation, code smell, or
unexercised source path as a low-confidence lead. Never upgrade confidence to
make the dossier feel complete.

### 8. Define the oracle and repair boundary

Specify a regression oracle even when no test is created. It must name:

- isolated starting state and controlled inputs;
- trigger and observation point;
- exact mechanical fail and pass conditions;
- a nearby negative control;
- maximum attempts, duration, concurrency, and resource use;
- reset, cleanup, and retained failure artifacts; and
- known-bad expectation plus the expected post-repair result.

Avoid blind sleeps, log substrings when structured state exists, and assertions
that pass after either success or timeout. If the user requested a reusable
reproducer, let `reproduce-bug` own its implementation and validation, then
return to the diagnosis before proceeding with any authorized repair.

Define the repair boundary, not the repair: name the authoritative owner, the
violated invariant, the first and last causal points a future change must
cover, compatibility or state constraints, and the oracle that future work
must satisfy. For diagnosis-only work, this proposed boundary is the deliverable. For a combined request, use it to guide the authorized repair and verification.

## Stop conditions

Stop and issue the Diagnosis Dossier when any of these occurs:

- an essential evidence source or capability is unavailable;
- the symptom cannot be reproduced faithfully;
- a material edge lacks safe evidence;
- an experiment would be unsafe, unbounded, or outside granted authority;
- investigation drifts beyond the selected symptom or environment; or
- the diagnosis is complete and evidence-backed.

Stopping means reporting the current evidence and smallest next evidence, not
substituting an assumption. A diagnosis-only request ends here. Continue into repair or review when the user already requested it, without adding a routine approval stop.

## Diagnosis Dossier

Cover the following evidence in both complete and partial investigations. Combine overlapping sections and omit inapplicable detail; retain the causal chain, oracle, and material unknowns:

1. **Scope and authority:** symptom, operation, environment, exclusions,
   allowed artifacts, and companion availability.
2. **Reproduction status:** status, signature, conditions, attempt evidence,
   negative control, fidelity limits, and what the reproduction proves.
3. **Failure graph:** reproduced trigger through terminal outcome, with state
   effects and an evidence/confidence annotation on every material node and
   edge.
4. **Hypothesis ledger:** prediction, evidence for and against, disposition,
   evidence classes, confidence, and next discriminating check.
5. **Counterexample schedule:** violating and nearby valid schedules when the
   concurrency predicate fired; otherwise state why it was not applicable.
6. **Causal confidence:** root cause, leading hypothesis, or unresolved;
   evidence-backed rationale and material unknowns.
7. **Regression oracle:** starting state, trigger, fail/pass conditions,
   negative control, bounds, reset, artifacts, and known-bad/post-repair
   expectations.
8. **Repair boundary:** owner, invariant, causal span, constraints, and future
   acceptance oracle; report implementation separately when also requested.
9. **Next evidence:** smallest safe, bounded evidence for every remaining gap,
   what each result would discriminate, and why the investigation stopped.

Keep reproduction artifacts and diagnosis claims traceable to each other. If
the dossier is partial, say so at the top and preserve unknowns rather than
filling them with plausible explanations. Attach evidence class and confidence to consequential claims without repeating identical annotations throughout the report.
