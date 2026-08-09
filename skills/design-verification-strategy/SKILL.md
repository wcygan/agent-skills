---
name: design-verification-strategy
description: Design an evidence-backed verification strategy for a change, feature, migration, integration, or system claim by defining risks and invariants, authoritative oracles, test tiers, fixtures, negative and counterexample cases, environment fidelity, independent or held-out checks, and acceptance evidence. Use when deciding what tests or proof are needed, validation is too broad or weak, passing checks do not prove user-visible, packaged, or operational behavior, or implementation and release need explicit verification gates; plan only unless implementation is requested.
license: MIT
metadata:
  author: William Cygan
  version: "0.1.0"
---

# Design a Verification Strategy

Design the smallest set of complementary evidence that can support one concrete
engineering claim. Make explicit what each check proves, what it cannot prove,
and which residual risks still require human or target-environment judgment.

## Preserve the authority boundary

Treat requests to design, assess, review, or recommend verification as
read-only. Do not add tests, fixtures, CI jobs, instrumentation, services, or
deployment gates unless the user asks for implementation.

Inspect repository instructions, dirty state, existing tests, task runners, CI,
fixtures, build and packaging paths, runtime topology, and acceptance artifacts
before proposing new machinery. Prefer existing authoritative checks and
fixtures over parallel frameworks.

Do not run expensive suites, start persistent dependencies, install packages,
publish artifacts, or access shared environments without inspecting their
contracts and authority requirements. Label unavailable proof instead of
substituting a weaker check.

## Define the claim

State the claim as an observable proposition:

```text
Under <starting state and environment>, when <scenario>,
the system must <observable behavior and state>,
including <important failure or recovery behavior>.
```

Record:

- **Scope:** change, feature, integration, migration, release, or incident fix.
- **Actors and boundaries:** callers, services, stores, queues, devices, and
  external dependencies.
- **Invariants:** properties that must remain true.
- **New behavior:** intentional differences from the baseline.
- **Critical risks:** credible ways the claim could be false.
- **Environments:** local, CI, packaged target, staging, or production-like.
- **Non-goals:** adjacent behavior this strategy will not prove.

Avoid “all tests pass” as the claim. A command is evidence only for the behavior
and environment it actually exercises.

## Establish the baseline

1. Locate existing checks and the behavior each one asserts.
2. Identify authoritative state owners and observable public boundaries.
3. Run only the smallest safe checks needed to confirm current behavior and
   command contracts.
4. Record known failures, flaky tests, skipped cases, environment differences,
   and unavailable dependencies.
5. Separate historical CI evidence from current local evidence.

Do not let a passing broad suite erase a focused failure. Do not call source
inspection runtime proof or mock success proof of an external integration.

## Build the risk model

For each critical risk, record:

```text
risk | consequence | invariant or requirement | discriminating scenario | authoritative oracle
```

Prioritize correctness, data loss or corruption, security boundaries,
compatibility, concurrency, irreversible effects, operator recovery, and
user-visible failure. Include plausible negative cases and counterexample
schedules rather than only happy paths.

When a concurrency property is central, model the critical schedule before
choosing a stress test. When an intermittent symptom is not yet reproducible,
establish a reliable failure signature before promising a regression test.

## Select complementary proof tiers

Choose tiers based on the claim, not a fixed test pyramid:

- structural or static validation;
- unit or component behavior;
- boundary and contract integration;
- persistence, migration, or workflow state;
- scenario or end-to-end behavior;
- browser or device-visible acceptance;
- packaged artifact or target-platform behavior; and
- operational readiness and recovery.

For each selected tier, state:

- risk covered;
- scenario and controlled inputs;
- real and substituted components;
- oracle and evidence artifact;
- environment and fidelity limits;
- runtime, cost, and authority; and
- failure localization and cleanup.

Read `references/proof-tiers-and-oracles.md` for evidence boundaries and oracle
selection. Use fewer, stronger tiers when they cover the risks directly.

## Choose authoritative oracles

Prefer an oracle at the public contract or authoritative state owner:

- returned value or protocol response;
- committed database or workflow state;
- emitted event and downstream durable effect;
- packaged application behavior on the target platform;
- user-visible state paired with the durable state it represents;
- alert, recovery state, or operator artifact for operational claims.

Avoid circular proof: producer-authored tests alone should not certify an
untrusted candidate; a mocked adapter should not certify the live provider; a
screenshot should not certify persistence; and a log line should not certify a
committed side effect.

Use independent or held-out verification when the producer can alter the
implementation and its normal tests, the consequence is high, or acceptance
must survive optimization pressure.

## Design fixtures and controlled state

Define:

- minimal representative data;
- ownership and creation of each fixture;
- isolation by run, tenant, namespace, port, or identifier;
- controlled time, randomness, concurrency, network, and external responses;
- reset, cleanup, and retry behavior;
- versioning for schemas and recorded responses; and
- safe handling of secrets and personal data.

Fixtures must preserve the semantics that matter to the risk. A fixture that
removes ordering, retries, identity, or validation rules cannot prove those
properties.

Read `references/strategy-and-gates.md` for the proof matrix, environmental
fidelity, independent verification, and acceptance-gate template.

## Cover failure and recovery

For material boundaries, include cases for:

- invalid and missing input;
- dependency timeout, rejection, or partial response;
- retry, duplicate, cancellation, and ambiguous completion;
- stale, mixed-version, or partially migrated state;
- permission denial and unavailable credentials;
- restart, resume, rollback, or cleanup; and
- absence of the intended side effect.

Inject failures only through isolated, bounded seams. Do not fault production or
shared systems to satisfy a verification plan.

## Define the acceptance gate

Make the gate executable and falsifiable:

```text
Entry state:
Candidate identity:
Required checks and environments:
Pass criteria:
Prohibited outcomes:
Evidence retained:
Stop conditions:
Rollback or retry state:
Residual human judgment:
```

Bind evidence to the exact source, configuration, dependency set, artifact, and
environment being accepted. A rebuilt or repackaged artifact is a new candidate
unless reproducibility is itself proven.

## Implement only when requested

When implementation is requested:

1. add the highest-value missing proof first;
2. reuse repository test libraries, fixtures, task runners, and CI conventions;
3. keep focused and full checks separately invocable;
4. make failures preserve the earliest cause and useful artifacts;
5. make setup and cleanup deterministic and safely retryable;
6. avoid weakening production behavior solely for testability; and
7. run the focused check followed by the relevant broader gates.

Do not broaden the change into unrelated test cleanup or replace a trusted
oracle merely because it is inconvenient.

## Verify the strategy

Confirm that:

- every critical risk maps to at least one discriminating check;
- every check has an authoritative oracle and named proof boundary;
- positive, negative, and recovery behavior are covered where material;
- substitutions and environment gaps are explicit;
- independent verification is used where producer-controlled proof is weak;
- the strategy can fail for the defects it claims to detect;
- runtime and operational cost are proportionate; and
- acceptance is bound to the exact candidate being promoted.

## Report

Lead with the claim, highest risks, and whether the current evidence is
sufficient. Then provide:

1. **Claim and scope:** scenario, invariants, new behavior, environments, and
   non-goals.
2. **Current evidence:** existing checks and exact proof boundaries.
3. **Risk-to-proof matrix:** risk, case, tier, oracle, environment, and gap.
4. **Fixture and control plan:** state, nondeterminism, isolation, and cleanup.
5. **Acceptance gate:** candidate binding, criteria, evidence, stop conditions,
   and residual judgment.
6. **Implementation order:** smallest high-leverage additions when requested.
7. **Unknowns:** unavailable proof and the safest next evidence.

## Examples

- Decide what proves a schema migration preserves reads during mixed-version
  deployment and after rollback.
- Design verification for a desktop application whose library tests pass but
  whose packaged native integration is untested.
- Replace a broad flaky end-to-end gate with focused contract checks plus one
  authoritative user journey.
- Define held-out verification for an agent-generated candidate whose normal
  repository tests are producer-controlled.
