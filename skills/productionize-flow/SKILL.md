---
name: productionize-flow
description: "Make one working request, job, or workflow dependable within a defined operating envelope. Use when a prototype or happy-path implementation needs coordinated hardening, observability, and verified failure recovery before unattended or production use."
license: "MIT"
metadata:
  author: "William Cygan"
  version: "0.1.0"
---

# Productionize a Flow

Carry one working flow from happy-path behavior to verified operation within a
defined envelope. Own the connection between required outcomes, credible
failures, hardening changes, useful signals, and demonstrated recovery.

Use `audit-resilience` for an assessment without this integrated delivery.
Use `find-and-fix` for one existing defect. Active incidents belong to an
operational response workflow; completing a readiness assessment must not delay
urgent containment. Keep this skill bounded to one request, job, or workflow.

## Preserve mode and authority

Read repository instructions and inspect dirty state and relevant runtime
state. Preserve unrelated changes and distinguish source from generated output.

An assessment or plan request keeps application files read-only and uses
existing evidence and safe local checks. A request to productionize the flow
authorizes corresponding local code, tests, configuration, and documentation
within scope. Continue after analytical phases without renewed routine approval.

Shared-state writes, production access, fault injection outside isolated local
state, paid services, dependency changes, commits, publication, and deployment
require authority covering those effects. Before an experiment, establish
environment, starting state, side effects, bounds, cleanup, and stop conditions.
Prefer synthetic fixtures and redacted metadata for retained evidence.

Read [Companion contracts](references/companion-contracts.md) when selecting a
specialist; load only the selected section. Compose in the current session by
default. Delegation requires authorization; use `route-agent-models` for an
authorized route and pass bounded context and phase authority.

Companions are replaceable specialists. When one is unavailable, establish its
required evidence directly with available tools and knowledge. State the method
and limitations. An essential gap blocks dependent work; continue independent
investigation and already-supported implementation.

## 1. Define operational acceptance

Record this contract in task state:

```text
Flow purpose, trigger, entry anchor, and terminal outcome:
Retained scenarios and correctness requirements:
Authoritative state, actors, dependencies, and external effects:
Operating envelope: workload, data size, concurrency, and resource limits:
Failure and recovery requirements:
Detection and operator questions:
Existing budgets and acceptance criteria, with their sources:
Target environments, candidate identity, and fidelity constraints:
Mutable scope, non-goals, mode, and operational authority:
```

Select requirements from the request, repository contracts, and supported
operating evidence. State assumptions; resolve a missing threshold only when
it materially changes acceptance or scope. Define each requirement as an
observable outcome, including how work is rejected, delayed, retried, resumed,
or reported when success is unavailable. Preserve required business behavior.

**Complete when:** the flow and operating envelope are bounded, each material
requirement has a source and observable acceptance condition, and authority
for each proposed kind of effect is understood.

## 2. Reconstruct the flow and credible failure model

Locate runtime selection, callers, state owners, dependency boundaries,
transactions, acknowledgments, lifecycle, and existing controls. Use
`trace-codepath` for uncertain execution and `audit-resilience` to establish
the bounded state and failure model. Reuse matching existing analysis.

Run the smallest relevant baseline checks and classify existing failures.
Label material claims as observed, source-verified, declared, inferred, or
unknown. Resolve contradictory claims against the same revision and scenario.

For each consequential boundary, connect:

```text
starting state and operating condition -> failure or timing schedule
  -> threatened requirement -> possible partial state or ambiguous effect
  -> current control -> detection -> recovery owner -> terminal outcome
```

Use `model-concurrency` when a race, duplicate, cancellation, lease, or ordering
schedule matters and existing evidence does not already establish it. Read
[Acceptance scenarios](references/acceptance-scenarios.md) for durable work,
external effects, resource saturation, or incomplete failure/recovery coverage.

Separate supported defects from credible counterexamples and severe unknowns.
Rank necessary work by consequence, evidence, and the declared envelope. Add
controls only for an accepted requirement or supported risk; retain adequate
existing mechanisms and avoid speculative platform expansion.

**Complete when:** each critical requirement has a supported control or a
named gap, and each proposed change addresses a specific failure mechanism.

## 3. Bind controls, signals, and proof to the same scenarios

Build one acceptance matrix:

```text
requirement | scenario and starting state | failure or condition
control/change | expected terminal state and effects | authoritative oracle
signal and correlation | operator/recovery action | environment and fidelity
check and acceptance gate | evidence or gap
```

Mark a signal or recovery action not applicable with a reason when the
requirement needs neither. Keep the matrix scoped to consequential outcomes.

Use `audit-observability-path` for unanswered detection or reconstruction
questions. Reuse signal evidence already obtained by another phase. Require
signals that distinguish the selected outcomes and support the recovery
decision; bound privacy, cardinality, volume, and retention by actual needs.

Use `design-verification-strategy` when the matrix lacks discriminating checks,
independent expected results, or suitable environment fidelity. Establish proof
before dependent edits. A log of completion does not prove durable effects;
an instrumentation definition does not prove alert delivery.

Use `shape-safe-change` for unresolved contract, schema, dependency, ownership,
compatibility, or rollout consequences. Use `plan-safe-refactor` only when a
structural transition needs safe stages. Reuse an adequate supplied plan and
artifacts produced through another companion.

**Complete when:** each selected requirement connects a concrete control,
terminal-state oracle, needed signal, recovery action, and executable check,
with unresolved decision and environment gates explicit. Assessment-only work
reports the matrix here; implementation requests continue within granted scope.

## 4. Implement the necessary hardening

Pass each bounded work package and its proof requirements to
`incremental-execution`, or execute directly under the same contract. Include
the required application change, focused checks, relevant signals, and operator
instructions together when they implement one coherent control.

Preserve declared normal behavior and identify intentional failure-behavior
changes. Honor staged checkpoints and repository review constraints. Validate
after each coherent change; correct an introduced regression within scope or
undo only that change. Keep newly discovered adjacent work outside the package
unless it is necessary to meet acceptance or already authorized.

**Complete when:** selected controls, instrumentation, checks, and recovery
instructions are implemented, focused results are recorded, and temporary
mechanisms have a defined disposition.

## 5. Demonstrate integrated operation and recovery

Use `live-test-changes` for a running isolated local proof. Exercise the same
scenarios from the matrix, including material failure and recovery conditions.
When the terminal outcome requires visible UI interaction, use
`computer-use-ui-testing` with the same fixtures and pair visible results with
the authoritative state they represent.

Verify the entire chain: the required outcome or declared failure occurs,
durable state and effects remain correct, needed signals preserve identity,
and the stated recovery action reaches a supported terminal or resumable state.
Check relevant performance and resource budgets under representative conditions.

Run applicable repository gates, inspect the diff, and account for temporary
processes, fixtures, instrumentation, and transition paths. Bind results to the
final revision, configuration, artifact, and environment; repeat only evidence
invalidated by later changes or failures.

**Complete when:** every required acceptance gate passes at the necessary
fidelity, or its exact failure or unavailable proof is recorded. Local recovery
proof does not establish deployed alerting, production capacity, or restoration
of previously affected records.

## Report readiness within the proven envelope

Lead with **assessed/planned**, **verified within the named envelope**,
**implemented; verification limited**, or **blocked/failed**.

Return one integrated report: flow contract, selected risks and controls,
implementation changes, acceptance matrix results, useful signals, recovery
procedure, actual operating evidence, remaining deployment or environment
gates, and cleanup state. Keep hypotheses and unsupported claims visible.

Describe operator actions with prerequisites, identity checks, bounds, expected
effects, stop conditions, and confirmation evidence. If recovery is irreversible
or only supports rolling forward, state that limitation. Avoid an unqualified
production-ready label while an essential acceptance gate remains unproven.
