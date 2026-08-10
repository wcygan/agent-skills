---
name: audit-resilience
description: Audit code, services, workflows, and system designs for fragile states, failure amplification, weak recovery, poor debuggability, and difficult verification. Use before implementation, launch, migration, or reliability work when a system may be easy to break or hard to restore. Produce a read-only Resilience Audit Pack with ranked findings, matched hardening patterns, counterexample scenarios, and bounded verification handoffs.
license: MIT
metadata:
  author: William Cygan
  version: "0.1.0"
---

# Audit Resilience

Find where one bounded system can enter unsafe states, amplify failures, lose
progress, hide causes, or resist verification. Return one evidence-backed
**Resilience Audit Pack** with ranked hardening opportunities.

## Preserve the authority boundary

Treat audit, review, assessment, and hardening-plan requests as read-only.
Inspect source, configuration, tests, documentation, and authorized runtime
evidence. Check repository instructions and dirty state before commands.

Do not edit code, add tests, change configuration, inject production faults,
replay shared work, or trigger external effects. Implement changes only after
the user requests them separately.

Prefer static evidence and existing isolated tests. Before any new experiment,
define its environment, side effects, time bound, stop condition, and cleanup.
Return `evidence-blocked` when safe evidence cannot support a material claim.

## Define the audit boundary

Select one system slice with a clear critical outcome. A slice can be one
module, service, request path, workflow, job, integration, or deployment path.

Record:

- **Trigger:** The request, event, command, timer, or state change.
- **Critical outcome:** The user or system result that must survive failure.
- **Authoritative state:** The owners of durable truth.
- **External effects:** Writes, messages, payments, notifications, or releases.
- **Dependencies:** Required and optional downstream capabilities.
- **Operating envelope:** Expected load, latency, data size, and concurrency.
- **Recovery objective:** The acceptable loss, delay, and operator effort.
- **Non-goals:** Adjacent behavior excluded from this audit.

If the target is too broad, select the highest-consequence path first. Do not
call a repository-wide keyword scan a system audit.

## Classify evidence

Classify every material claim:

- **observed:** Current runtime evidence demonstrates the behavior.
- **verified:** Source or executable configuration establishes the behavior.
- **declared:** A contract or document states the behavior.
- **inferred:** Indirect evidence supports the behavior.
- **unknown:** Available evidence cannot determine the behavior.

Keep confidence separate from severity. A severe unknown can rank above a
well-proven minor defect, but its next step must request evidence.

## Build the resilience model

### 1. Inventory state and control

Locate state types, constructors, validation, transitions, state owners, and
terminal states. Identify boolean combinations, nullable fields, string states,
and caller-managed ordering rules that can represent invalid conditions.

Record each material operation, attempt, message, task, actor, and external
effect identity. Identify which component may create, update, retry, cancel,
or reconcile each one.

### 2. Inventory failure boundaries

Trace boundaries where work can become partial or ambiguous:

- process, network, queue, database, filesystem, and external service calls;
- concurrency, leases, locks, transactions, and acknowledgment order;
- startup, shutdown, deployment, migration, and mixed-version operation;
- capacity, rate, memory, storage, connection, and time limits; and
- configuration, credentials, authorization, and feature controls.

For each boundary, record the possible failure, affected state, detection
signal, recovery owner, retry behavior, and terminal outcome.

### 3. State resilience properties

Write each required property as a falsifiable statement:

```text
Given STARTING_STATE and OPERATING_CONDITION, when FAILURE occurs,
the system preserves RESILIENCE_PROPERTY, as proven by AUTHORITATIVE_EVIDENCE.
```

Cover only applicable properties:

- **Safety:** Prohibited state or effects never occur.
- **Progress:** Bounded work reaches a terminal or resumable state.
- **Availability:** Critical capability remains usable within its envelope.
- **Containment:** One failure does not consume unrelated capacity.
- **Recoverability:** Restart, retry, repair, or rollback has a defined owner.
- **Diagnosability:** Evidence preserves cause, identity, state, and outcome.
- **Verifiability:** A discriminating check can falsify each important claim.

## Generate counterexamples

Challenge each property with the smallest credible scenario. Prefer scenarios
that cross a state, time, ownership, or effect boundary.

Include applicable cases:

- invalid, missing, stale, or mixed-version input;
- timeout before, during, or after an external commit;
- duplicate delivery, retry, replay, or concurrent update;
- dependency rejection, corruption, delay, or partial response;
- process loss, restart, cancellation, or ownership expiry;
- overload, queue growth, resource exhaustion, or slow consumers;
- configuration error, unavailable credentials, or denied authority; and
- missing telemetry, misleading success, or failed recovery evidence.

A theoretical possibility is not a finding by itself. Connect each finding to
a reachable state, executable path, deployed contract, or explicit unknown.

## Match hardening patterns

Read `references/resilience-patterns.md` after the system model exists. Select
patterns by failure mechanism and property. Do not apply the catalog as a
generic checklist.

Prefer patterns that remove a failure class or narrow its blast radius. State
the cost, new failure mode, compatibility effect, and operating assumption.

Do not treat these mechanisms as automatic improvements:

- retries without idempotency and a finite budget;
- fallbacks without explicit data and authorization semantics;
- caches without freshness and invalidation contracts;
- queues without capacity, terminal handling, and recovery ownership;
- redundancy without independent failure domains; or
- telemetry without a diagnostic question and bounded cardinality.

## Rank findings

Use these consequence levels:

- **critical:** Authority bypass, data corruption, irreversible duplicate
  effects, or loss of a critical outcome across the system.
- **high:** Unrecoverable progress, broad outage, or hidden high-impact failure.
- **medium:** Material degradation, slow recovery, or a significant proof gap.
- **low:** Local fragility with contained impact and a simple recovery path.

For each finding, record:

```text
ID and severity:
Resilience property:
Evidence and class:
Counterexample:
Consequence and blast radius:
Matched pattern:
Smallest hardening move:
Tradeoff or new failure mode:
Required proof:
Residual risk:
```

Rank consequence first. Then consider exposure, detectability, recovery cost,
and change leverage. Do not hide high-impact unknowns below easy cleanup work.

## Shape the hardening sequence

Recommend the smallest ordered sequence that reduces the highest risk. Prefer:

1. enforce ownership and invariants;
2. make effects safe under ambiguity and repetition;
3. bound time, attempts, work, and resource use;
4. contain dependency and workload failures;
5. make recovery explicit and resumable;
6. expose causes, attempts, state, and terminal outcomes; and
7. add discriminating verification for the accepted design.

State prerequisites and compatibility states. Separate immediate containment
from structural repair. Identify changes that require staged rollout,
migration, rollback, or human authority.

## Use bounded handoffs

Recommend another installed skill only for a precise remaining job:

- `trace-failure-path` for one concrete failure chain.
- `audit-workflow-graph` for one graph implementation.
- `model-concurrency` for one ambiguous schedule or ordering property.
- `audit-observability-path` for one diagnostic scenario.
- `design-verification-strategy` for an accepted proof plan.
- `map-change-impact` for an accepted cross-cutting hardening change.
- `plan-safe-refactor` for an accepted behavior-preserving restructure.

State the bounded input and expected output. Do not invoke implementation or
expand authority merely to complete the audit.

## Verify the audit

Before reporting, confirm:

- every critical outcome has an authoritative state owner;
- every finding names a violated or unsupported property;
- every counterexample reaches a supported state or explicit unknown;
- every matched pattern addresses the stated failure mechanism;
- every recommendation includes a tradeoff and discriminating proof;
- severity does not depend on confidence or implementation effort;
- source, tests, configuration, and runtime evidence remain distinct; and
- the report states all material scope and evidence gaps.

## Report and stop

Lead with `audited`, `partially audited`, or `evidence-blocked`. Name the
highest supported risk and the most valuable hardening move.

Return:

1. **Scope and Critical Outcomes** — target, trigger, state owners, effects,
   envelope, recovery objective, and non-goals.
2. **Resilience Model** — state, identity, dependency, resource, control, and
   recovery boundaries.
3. **Property Coverage** — each property, evidence, class, and current support.
4. **Counterexample Scenarios** — starting state, failure, path, and outcome.
5. **Ranked Findings** — evidence, consequence, pattern, tradeoff, and proof.
6. **Hardening Sequence** — ordered moves, prerequisites, and rollout needs.
7. **Verification and Handoffs** — smallest proof and bounded next owner.
8. **Unknowns and Residual Risk** — unavailable evidence and remaining risk.

Stop after the Resilience Audit Pack. Source changes, tests, fault injection,
and operational actions need separate authority.

## Examples and non-triggers

Use this skill for:

- “Find the easiest ways this payment workflow can enter a bad state.”
- “Audit this service for graceful degradation and recovery weaknesses.”
- “Review this module for idempotency, debuggability, and testability risks.”
- “What will break first when this job receives duplicate or delayed events?”

Use a narrower skill for:

- “Trace why yesterday's notification timed out.” Use `trace-failure-path`.
- “Design tests for this accepted retry change.” Use
  `design-verification-strategy`.
- “Implement the three resilience fixes in this audit.” Treat this as a new
  implementation request with repository-specific planning and verification.
