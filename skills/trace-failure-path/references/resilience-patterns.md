# Resilience Patterns

Use this reference to inspect failure behavior at boundaries. Treat patterns as
mechanisms to verify, not as assumed best practices.

## Contents

- Timeouts and deadlines
- Retries and redelivery
- Circuit breakers and load shedding
- Transactions and outboxes
- Sagas and compensation
- Dead letters and quarantine
- Cancellation and leases
- Fallbacks
- Boundary checklist

## Timeouts and deadlines

Identify the owner, start point, duration, propagation, and resulting action.
Distinguish:

- caller deadline from server execution limit;
- connection, request, idle, task, and transaction timeouts;
- local timeout from remote cancellation; and
- timeout response from proof that remote work stopped.

Nested timeouts should leave enough budget for cleanup and error propagation.
An ambiguous remote outcome requires idempotency or reconciliation, not only a
retry.

## Retries and redelivery

Record:

- owner and layer;
- retryable conditions;
- maximum attempts or elapsed duration;
- backoff, jitter, and server guidance;
- per-attempt versus end-to-end timeout;
- idempotency key or deduplication scope;
- state retained between attempts; and
- terminal action after exhaustion.

Multiply nested retry bounds to understand worst-case attempts. Do not assume a
library default is the deployed value.

For queue redelivery, establish acknowledgment timing, visibility or lease
timeout, poison-message behavior, and whether processing can overlap.

## Circuit breakers and load shedding

Identify the measured failures, rolling window, threshold, open duration,
half-open probe, scope, and fallback. Determine whether rejected work is safe
to retry elsewhere and whether the breaker state is local or shared.

Differentiate overload protection from dependency-health inference.

## Transactions and outboxes

Record which effects share a transaction and the exact commit point. For an
outbox, separate:

    business commit -> outbox visibility -> publisher claim
    -> external publish -> publication acknowledgment -> outbox completion

Inspect duplicate publication, stuck claims, ordering, cleanup, and replay.
An outbox can make handoff durable without making downstream handling exactly
once.

## Sagas and compensation

List forward steps, committed effects, compensation triggers, compensation
owners, retry policy, and irreversible actions. Compensation creates a new
business action; it is not a transactional rollback.

Show states where forward action and compensation can both be incomplete.

## Dead letters and quarantine

Establish what moves an item to terminal storage, what context is retained, how
operators discover it, who owns replay or correction, and how repeated replay
is bounded. A dead-letter queue without detection and recovery ownership is an
abandonment mechanism.

## Cancellation and leases

Trace cancellation tokens, context, signals, worker shutdown, child tasks, and
external requests. Determine whether cancellation is cooperative and what
happens to already committed effects.

For leases or locks, record acquisition, renewal, expiry, fencing, release, and
behavior after ownership loss. Expiry can permit concurrent work unless fencing
prevents stale owners from committing.

## Fallbacks

State the semantic difference between primary and fallback results. Check
freshness, completeness, authorization, cache scope, and whether fallback
success suppresses operator evidence.

Do not classify stale or partial data as safe solely because a fallback avoids
an exception.

## Boundary checklist

For each resilience mechanism, ask:

1. What exact failure activates it?
2. Which component owns it?
3. What state already changed?
4. Can the action repeat safely?
5. What bounds time and attempts?
6. What is the terminal state?
7. How do users and operators learn the outcome?
8. What current evidence proves the deployed behavior?
