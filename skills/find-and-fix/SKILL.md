---
name: find-and-fix
description: "Find and repair one software issue across execution, data, and recovery boundaries. Use when an unclear symptom needs coordinated tracing, causal diagnosis, a scoped fix, and verification."
license: "MIT"
metadata:
  author: "William Cygan"
  version: "0.1.0"
---

# Find and Fix

Carry one unclear software issue from reported symptom through evidence-backed
cause, the smallest authorized repair, and verification of the original
behavior. Own scope, companion selection, evidence reconciliation, repair
sequencing, and the integrated outcome. Use `diagnosing-bugs` for the focused
feedback and repair loop; use the tracing and planning companions to resolve
questions that loop cannot answer alone.

For an already established cause and accepted repair, proceed to implementation
and checks. Pure execution or lineage explanations belong to their tracing
skills; a broad reliability assessment belongs to `audit-resilience`. Keep
this workflow focused on resolving one issue.

## Preserve authority across phases

Read repository instructions and inspect dirty state before commands. Preserve
unrelated work and distinguish authoritative source from generated output.

A diagnosis-only request keeps tracked files read-only and uses existing
evidence and safe local checks. Temporary or ignored diagnostic artifacts must
be isolated and within the user's execution constraints. A request such as
"find the issue and help me fix it" authorizes the corresponding local repair,
necessary reproduction artifacts, and relevant checks. Continue that work
after analytical companions finish; their read-only phase ending is not an
approval gate for the parent repair.

Production instrumentation, real-traffic replay, shared-state changes, data
recovery, deployment, and publication require authority covering those effects.
Before an experiment, establish environment, side effects, limits, stop
conditions, and cleanup. Use redacted structure and metadata for sensitive
data; keep credentials and sensitive values out of retained evidence.

## 1. Frame one issue

Start an issue record with:

- reported symptom and expected behavior, with the source of each claim;
- operation, entry anchor, terminal outcome, and affected environment;
- relevant inputs, configuration, lifecycle state, and known frequency;
- scope, exclusions, repair authority, and operational constraints; and
- an observable condition that distinguishes failure from success.

Infer a narrow scenario from repository evidence when possible. Ask only when
an essential missing decision prevents selecting the scenario or changes the
repair scope. For a vague request, select the path most directly supported by
the user's evidence. A repository-wide search provides leads, not a diagnosis.

**Complete when:** one bounded scenario has an expected contract and a
recognizable failure signature.

## 2. Establish feedback with `diagnosing-bugs`

Pass the framed issue and phase authority to `diagnosing-bugs`. First request
the diagnostic phase: a faithful reproduction or observation procedure,
starting conditions, captured result, competing explanations, and smallest
discriminating check. Retain its evidence in the parent record before selecting
additional lenses or beginning repair.

For performance issues, require equivalent measurement conditions and the
relevant budget. For intermittent issues, retain attempt counts, observed
frequency, bounds, and reproduction limits. When reproduction is unavailable,
continue safe source inspection and existing artifact analysis; identify what
each source establishes and what remains unexercised.

Use an already adequate reproduction and causal explanation as input rather
than repeating their discovery. Return to the same feedback loop as companion
evidence refines the mechanism.

**Complete when:** a faithful check and captured result exist, or the exact
reproduction gap and safe next check are recorded.

## 3. Select companions for remaining questions

Use these contracts, including the two phases of `diagnosing-bugs`. Read
`references/companion-contracts.md` when selecting a companion for its bounded
input, required output, and completion condition. Reuse completed evidence and
omit lenses whose predicates are false.

| Companion | Selection predicate and responsibility |
|---|---|
| `diagnosing-bugs` | The core feedback or repair loop needs work: reproduce the symptom, discriminate explanations, implement the supported repair when authorized, and check it. |
| `trace-codepath` | Dispatch, runtime wiring, branch selection, or the route from entrypoint to the affected outcome is uncertain. Establish the selected execution path. |
| `trace-failure-path` | An error, timeout, cancellation, suppression, retry, fallback, or partial outcome needs a propagation and recovery account. Distinguish cause from downstream symptoms. |
| `trace-data-lineage` | A wrong, missing, stale, duplicated, or exposed value requires tracing identity, meaning, transformations, or authoritative ownership. Locate semantic divergence. |
| `audit-resilience` | Evidence identifies unsafe partial state, ambiguous effects, amplified retries, lost progress, or unclear recovery ownership. Assess the implicated property and the repair's counterexample. |
| `plan-safe-refactor` | The supported repair requires changing module boundaries, implementation structure, or ownership through independently safe intermediate states. Plan the necessary structural lane. |

Establish execution first when uncertain routing prevents bounding other
lenses. Failure and lineage evidence may refine each other. Audit only the
implicated system slice once its state and boundaries are known. Plan a
refactor after the causal mechanism and concrete target structure exist.

Companions are replaceable specialists, not installation prerequisites. Refer
to their exact installed names. If one is unavailable, perform its work
directly when available tools and knowledge can establish the same evidence.
If availability cannot be inspected, label it unknown. Identify the method
actually used; pause only dependent claims or actions when an essential
capability or evidence source remains unavailable.

Compose skills in the current session by default. This workflow does not
itself authorize spawning agents. For explicitly authorized delegation, use
`route-agent-models` to resolve inherited or requested routes and pass the
bounded issue context, existing evidence, and phase authority. An agent route
adds no permissions or external effects.

**Complete when:** each selected lens returns its required evidence or exact
gap, and all artifacts refer to the same scenario, environment, and revision.

## 4. Reconcile the cause and repair boundary

Merge companion evidence into the issue record. Reconcile operation and
attempt identities, data owners, variants, revisions, and boundary names.
Keep originating cause, downstream symptoms, and adjacent risks distinct;
deduplicate findings that describe the same mechanism. Resolve contradictory
claims with the smallest discriminating check against the selected variant
and revision. Preserve unresolved contradictions instead of averaging confidence.

Classify material claims as **observed** (current runtime evidence),
**verified** (source or executable configuration), **declared** (a contract or
document), **inferred** (indirect support), or **unknown**. Attribute user
reports separately from current observations. Source establishes a path's
semantics; runtime evidence establishes that the scenario took it.

Require the proposed mechanism to explain the failure signature and predict a
distinguishing result. Retain competing explanations, supporting and
contradicting evidence, and next checks until evidence discriminates them.
A material unknown remains a leading hypothesis; pause any repair that depends
on that unsupported edge and continue independent investigation.

For a supported mechanism, define:

- authoritative owner and causal point the repair must address;
- intentional behavior change and behavior that must remain stable;
- affected callers, contracts, state, and generated outputs;
- faithful failure check and relevant regression risks; and
- compatibility, checkpoints, and rollback needs where applicable.

**Complete when:** the causal claim and repair boundary are supported, or the
exact missing evidence or decision is recorded. Diagnosis-only requests report
here; combined requests continue into their authorized repair.

## 5. Execute the scoped repair

Pass the supported mechanism, repair boundary, established feedback, and
repair authority to `diagnosing-bugs`. Let it implement and check the smallest
local correction at the causal owner. Use the supplied evidence instead of
restarting diagnosis; return to investigation if new evidence contradicts it.

When `plan-safe-refactor` applies, preserve its verified checkpoints: execute
one independently safe structural slice at a time, validate its invariants,
and prove the intentional bug-fix behavior separately. Resilience changes enter
the repair only when necessary to resolve this issue or already requested.
Retain adjacent architecture and hardening findings as follow-up work.

Add or strengthen regression tests at the boundaries that explain the issue:

- **Unit tests:** Isolate the faulty logic, transformation, or invariant.
- **Integration tests:** Exercise affected interactions between components,
  persistence, or service contracts.
- **End-to-end (e2e) tests:** Cover the user-visible journey or complete workflow
  when the failure depends on its assembled path.

Choose the smallest useful set of these test levels that catches the original
bug and prevents its recurrence. Extend coverage across levels when a narrower
test cannot prove the relevant behavior. Assert observable outcomes and
contracts, and record whether the checks detect known bad behavior. Retain
limitations when a faithful test seam is unavailable. Account for temporary
instrumentation and artifacts.

**Complete when:** the scoped correction and required structural checkpoints
are implemented and their focused checks are recorded. Existing bad records
or queued work may still need separately authorized recovery; account for that
before claiming resolution.

## 6. Verify the integrated outcome

Review the repair against the original issue record, not just a companion's
success status. Confirm the expected terminal behavior, material state
effects, relevant regressions, and repository-required checks. Reuse valid
results; repeat checks when later edits or failures invalidate them. Fix
failures caused by the change within scope, distinguish pre-existing failures,
and inspect the final diff and diagnostic artifacts.

For performance, compare equivalent conditions against the relevant budget.
For intermittent issues, report bounds and observed frequency; one passing
attempt does not prove elimination. Keep local test proof separate from claims
about distributed recovery or previously affected records.

Lead with **diagnosed**, **fixed**, **implemented; verification limited**, or
**unresolved**, according to the evidence. Return one integrated report with:

1. cause or leading hypothesis, causal evidence, and material unknowns;
2. repair made or proposed, affected scope, and important tradeoffs;
3. original failure check, regression coverage added or strengthened, and
   post-repair results;
4. unresolved recovery, compatibility, or verification limits; and
5. the smallest next action for a blocker and the evidence it would obtain.

Use a compact causal graph when it clarifies the issue. Link evidence near
claims and incorporate companion findings as supporting sections.

**Complete when:** diagnosis-only work has an evidence-backed answer and next
action, or repair work has demonstrated the requested behavior within the
tested scope. If essential evidence, authority, or a decision is missing,
report the partial result and exact blocker instead of claiming a verified fix.
