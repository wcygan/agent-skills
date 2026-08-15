# Multi-agent concurrency schedules

Use these patterns for one bounded parent/child agent property. Read the active
Route Records before assuming model, fork, cancellation, or child-spawn behavior.

## Actors and state

Model only actors that affect the property:

- parent or integration owner;
- child worker and each retry attempt;
- scheduler or thread-slot allocator;
- result transport or event stream;
- acceptance ledger or durable state owner; and
- external effect owner, when present.

Track:

```text
parent_id | child_id | task_id | attempt_id | route_record_id
base_revision | dispatch_state | terminal_state | result_revision
expected_children | received_children | cancellation_epoch | accepted_result
```

Task identity does not identify one attempt. A model route does not identify
the task that produced a result.

## Out-of-order stale result

Property: The parent accepts only results based on the current input contract.

```text
1. Parent dispatches child A at base R1.
2. Parent integrates a prerequisite and advances to R2.
3. Child A completes with evidence for R1.
4. Parent accepts A without checking its base.
```

The shortest violation is step 4. A safe schedule rejects, refreshes, or
re-dispatches the stale result with a distinct attempt.

## Cancellation and late completion

Property: Cancellation has one durable meaning and cannot become success.

```text
1. Parent dispatches child A.
2. Parent records cancellation epoch C1.
3. Child A completes before it observes C1.
4. Result transport delivers success after C1.
5. Parent marks the task accepted.
```

Define whether step 3 may finish. Bind acceptance to the cancellation epoch and
terminal-state contract.

## Duplicate retry

Property: One logical task produces one accepted contribution and one bounded
external effect.

```text
1. Child A completes an effect.
2. Its result acknowledgment is lost.
3. Parent starts retry A2.
4. A2 repeats the effect or produces a competing contribution.
5. Parent accepts both attempts.
```

Use attempt identity, effect idempotency, and one acceptance claim. A task name
alone cannot fence duplicate attempts.

## Partial fanin

Property: Every fanout reaches a declared join or terminal failure.

```text
1. Parent records three expected children.
2. Two children succeed.
3. One child fails or never reaches a terminal event.
4. Parent waits for three successes without a deadline or failure rule.
```

Specify expected-child accounting, timeout, partial-result policy, and failed
child terminal behavior.

## Slot exhaustion and nested fanout

Property: Bounded descendants cannot prevent the parent from making progress.

```text
1. Parent fills every child slot.
2. Each child waits for its own descendant slot.
3. No child can complete or release a slot.
```

Default workers to `leaf`. Otherwise reserve capacity, bound depth, or make
child scheduling nonblocking.

## Deterministic test seams

- Pause before result acceptance, cancellation observation, and acknowledgment.
- Control child completion order.
- Expose parent, child, task, attempt, route, and base identities.
- Use a fixed thread-slot allocator.
- Record every terminal transition.
- Assert durable join state and external effects.
- Run the violating schedule and one nearby valid schedule.
