# Execution boundaries

Read this when transitions coordinate asynchronous work, shared storage, retries,
or restoration. Apply only the boundaries present in the task.

## Own transitions and effects

Choose one authoritative owner per stateful entity. Keep transition decisions
pure where practical; let an adapter perform effects and send outcomes back as
events. A reducer can return both next state and effect descriptions. A runtime
may instead own tasks whose lifetimes follow states. Use the project's existing
mechanism rather than adding a second orchestration layer.

Separate requesting an operation from observing its completion. Entering
`Submitting` does not mean the submission succeeded. Awaited operations need
explicit success and failure paths. Keep guards free of side effects: evaluating
whether a transition is eligible must not itself perform the business operation.

## Reject obsolete outcomes

Assign identity to each attempt and carry it through success and failure events.
Accept an outcome only if it belongs to the current attempt. Checking only
`state == Loading` fails when request A completes while newer request B is loading.
Generate identities at the owner or trusted boundary and do not reuse them within
the lifetime in which an old completion might arrive.

Define replacement and cancellation semantics explicitly:

- Does replacement keep old results visible?
- Does cancellation only stop observing, also request work interruption, or require
  compensation for an external effect?
- Can an operation already committed remotely still report success after local cancellation?

Stopping observation, interrupting local execution, and undoing remote work are
different operations. Resource cleanup must run on success, failure, and
interruption where applicable. A timeout does not prove that a remote operation
failed to commit.

With statechart runtimes, check entry/exit and reentry semantics: transitioning to
the same state may retain its existing invocation rather than starting new work.
Read the installed version's APIs. With Effect, route to the TypeScript reference
for typed effects and boundary decoding, and inspect the actual application's
fiber/resource ownership before claiming cancellation is wired end to end.

## Commit shared changes atomically

Actor serialization protects that actor's state. It does not protect a database
record also written by another process. Use the authoritative store's transaction,
conditional write, or equivalent coordination when competing writers exist.

For example, a worker approves an order only if both the expected version and
source state still match:

```sql
UPDATE orders
SET status = 'approved', version = version + 1
WHERE id = :id AND version = :expected_version AND status = 'pending';
```

Zero affected rows means the precondition no longer holds; reload and reevaluate
according to the domain. Do not overwrite a cancellation from a stale read.
Cross-record invariants may require a wider transaction or protocol.

## Survive retry and restart

A crash after an external effect but before recording completion creates an
ambiguous outcome. Retrying a charge with a new key can charge twice even if the
local machine has only one `Paid` state. Use one stable logical-operation key
across retries and a service that enforces the required deduplication contract.
When storage and message publication must agree, inspect the existing transactional
outbox or equivalent protocol rather than assuming two writes are atomic.

Durable workflows preserve progress across failures; they do not automatically
make arbitrary external effects happen exactly once. Adopt durability tooling
when restart recovery, long waits, timers, or coordinated retries require it.

Treat saved state as versioned external input. Validate restored payloads and
define migration, rejection, or recovery when states and required data change.
Test representative old snapshots. Restoring a state can restart an invocation;
effect identity must survive restoration when retries represent the same logical
operation. Framework snapshots are not automatically a stable application schema.

## Evidence and sources

Verify conflicting commands, duplicate delivery, stale success and failure,
cancel/retry sequences, and crash windows that the task actually crosses. State
which external services are simulated. See [verification](verification.md).

- [XState invocation and reentry](https://stately.ai/docs/invoke)
- [XState promise cancellation](https://stately.ai/docs/promise-actors)
- [XState persistence compatibility](https://stately.ai/docs/persistence)
- [Conditional writes and optimistic concurrency](https://learn.microsoft.com/en-us/azure/storage/blobs/concurrency-manage)
- [Temporal activity idempotency](https://docs.temporal.io/activity-definition)
