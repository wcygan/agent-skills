# Concurrency Failure Patterns and Tests

Use these patterns as search hypotheses, not as findings. Tie every conclusion
to the selected property, state owner, and an executable or observed schedule.

## Contents

- Read and write races
- Identity and version races
- Ownership and lease races
- Delivery and retry races
- Cancellation and lifecycle races
- Deadlock, livelock, and starvation
- Coordination mechanisms
- Deterministic test design
- Stress and model exploration

## Read and write races

### Lost update

Two actors read the same version, compute independently, and write without a
version check or serialization. Model the exact overwritten state.

### Check then act

An actor validates absence or eligibility, another changes the state, and the
first acts on stale evidence. Prefer an atomic authoritative constraint or
conditional mutation when the check and effect share an owner.

### Write skew

Two transactions update different records after reading a shared invariant.
Per-row atomicity can hold while the cross-record invariant fails.

### Dirty or stale decision

A cache, replica, snapshot, or earlier read drives a mutation after authority
has changed. Record visibility and freshness guarantees instead of calling all
stale reads races.

## Identity and version races

### ABA

State changes from A to B and back to A, making equality appear unchanged.
Use a generation or monotonic version when intermediate ownership matters.

### TOCTOU

The resource checked is not guaranteed to be the resource later used. Model
path, handle, identity, permission, or version changes between check and use.

### Duplicate identity

Two actors independently create or claim the same logical operation.
Determine whether uniqueness is enforced at the authoritative commit point.

## Ownership and lease races

A lease grants time-bounded permission, not proof that an expired holder
stopped. Model:

```text
acquire -> act -> pause -> lease expires -> new owner acquires
-> old owner resumes -> both attempt commit
```

Use fencing when the authoritative resource can reject stale epochs. Verify
renewal, clock, expiry, failover, and release semantics.

A process-local lock does not coordinate other processes. A distributed lock
without safe ownership checks can still permit stale release or split-brain
effects.

## Delivery and retry races

Model message publication, delivery, handler effect, durable commit,
acknowledgment, timeout, redelivery, and dead letter separately.

Common ambiguous windows:

- effect commits before acknowledgment is lost;
- acknowledgment succeeds before required state commits;
- publisher retries after an unknown remote result;
- visibility or lease expires while the first attempt still runs; and
- two retry layers multiply attempts.

Idempotency must cover the external effect, key scope, result replay, and
retention window. “Exactly once” requires a named boundary and mechanism.

## Cancellation and lifecycle races

Cancellation is often cooperative. Model request, observation, child
propagation, cleanup, and effects already committed.

Check:

- callback after owner destruction;
- close racing with read or write;
- shutdown racing with task admission;
- timeout racing with successful completion;
- resource release while another actor still uses it; and
- restart recovery racing with old worker completion.

Do not equate a cancelled future with stopped external work.

## Deadlock, livelock, and starvation

For deadlock, build a wait-for or resource-order cycle. Include locks,
transactions, bounded queues, joins, and callbacks that reenter held resources.

For livelock, show actors changing state without progress. For starvation, name
the scheduling or priority assumption that indefinitely denies one actor.

Timeouts can break waiting while leaving partial state; they do not remove the
underlying cycle.

## Coordination mechanisms

Choose the mechanism aligned with authority:

| Need | Candidate |
|---|---|
| one process, short critical section | mutex or serialized executor |
| atomic value transition | compare-and-set or conditional update |
| authoritative uniqueness | unique constraint or atomic create |
| multi-record invariant | suitable transaction or serialized owner |
| duplicate operation replay | idempotency record and result |
| time-bounded distributed ownership | lease plus fencing |
| ordered work per key | partitioned queue or single-key actor |
| order-independent updates | commutative or mergeable operation |
| cross-system partial effects | durable orchestration and compensation |

Evaluate crash behavior, availability, contention, compatibility, and recovery.
Do not add distributed coordination when a single authoritative write can
enforce the invariant.

## Deterministic test design

Create a seam immediately before the critical event, not arbitrary sleeps.
Useful controls include:

- barriers and latches;
- controllable executor or scheduler;
- virtual time;
- paused transport, queue, or acknowledgment;
- conditional storage hook;
- injected version, lease, or response;
- recorded event ledger; and
- failpoint scoped to an isolated test.

Assert the authoritative final state, actor terminal states, attempts,
side effects, and absence of leaked resources. Include a valid neighboring
schedule and cleanup proof.

## Stress and model exploration

Random scheduling, property-based state machines, repeated stress, and model
checking can discover schedules. Preserve seed, event history, and minimized
counterexample.

Use stress to supplement deterministic proofs. Report attempt count, bounds,
environment, and observed outcomes. Zero failures is not proof that no
violating schedule exists.
