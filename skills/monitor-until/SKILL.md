---
name: monitor-until
description: Watch one authoritative state source, read-only, until a declared terminal condition, timeout, access loss, or poll budget. Use when an explicitly invoked status watcher needs normalized observations, meaningful-transition evidence, bounded backoff, and truthful cross-turn wakeup limits without repairing or changing the monitored target.
license: MIT
---

# Monitor Until

Watch one authoritative state source under a finite **watch contract**. This is
structurally read-only: it observes, normalizes, records, and hands off. A
monitor does not repair, retry, restart, reconcile, acknowledge, or otherwise
change the monitored target.

## Establish the watch contract

Require an explicit invocation and record:

```text
Authoritative state source and owner:
Read-only observation method:
Normalization and identity fields:
Initial observation:
Success terminal condition:
Failure terminal condition:
Timeout and poll budget:
Backoff schedule and maximum interval:
Meaningful-transition rule:
Access-loss outcome:
State location: task_only | approved_path
Cross-turn wakeup capability:
Final handoff recipient or artifact:
```

The source must be the owner of the state being watched, or the contract must
state the proxy limitation. Normalize only fields that distinguish identity,
version or timestamp, status, and terminal reason. Preserve raw evidence or a
stable reference when permitted so a later reader can audit the normalization.

If the terminal condition is ambiguous, access is not read-only, or no bounded
poll/time limit is supplied, stop and request a decision. Treat an unavailable
source or lost access as an explicit terminal outcome, not as an invitation to
probe alternative systems or modify credentials.

## Observe with bounded backoff

For each poll:

1. Read the declared source with its authorized read-only method.
2. Normalize the observation and retain source identity and capture time.
3. Compare it with the most recent normalized observation.
4. Record only an initial, terminal, or meaningful transition in the ledger.
5. Stop on a terminal condition, timeout, poll budget, access loss, or user
   cancellation; otherwise wait for the next declared backoff interval.

Use finite increasing or fixed backoff with a maximum interval. Count failed
reads and polls against the budget. A successful read that produces the same
normalized state is a valid observation, not a meaningful transition.

## Keep the transition ledger

Use task-only state unless a durable location was approved:

```text
sequence | capture time | source identity | normalized state | fingerprint
transition reason | terminal evaluation | next allowed poll
```

Meaningful transitions must be named before polling, for example status enters
or leaves a terminal class, version advances, an owned queue crosses a declared
threshold, or terminal reason changes. A timestamp alone is not a meaningful
transition unless freshness itself is the condition.

## Treat cross-turn continuation truthfully

Continue past the current task only if a supported wakeup or recurring-monitor
capability is actually available and authorized. Record its identifier and
schedule in the ledger. Otherwise return the latest observation and a bounded
manual re-check instruction; do not imply that the watch remains active.

The watcher may recommend a downstream repair handoff after a terminal failure,
but it does not perform that repair or invoke an execution companion. The
handoff names the source evidence, terminal condition, and separate authority
needed.

## Report

Return `success`, `failure`, `timeout`, `budget_exhausted`, `access_lost`, or
`cancelled`; include the initial and final normalized observations, meaningful
transition ledger, poll/time consumption, raw-evidence references, and the
final handoff. Completion requires one recorded terminal outcome or a proven
bounded stop, not merely an elapsed wait.

## Portability and boundary

Use generic capability categories—read-only query, status endpoint, durable
record, emitted event, or user-visible state—not client-specific automation
names. `design-bounded-loop` may define a watch contract; use it when the
authority or terminal design is unsettled. `monitor-until` owns the observation
ledger and does not run repair, remediation, or optimization workflows.

## Examples

```text
Monitor the deployment's authoritative status record every 30 seconds for at
most ten polls. Stop when it becomes ready, fails, or access is lost. Do not
restart or acknowledge anything.
```

```text
Watch the batch's durable completion record for 20 minutes with capped
exponential backoff, then hand off a terminal failure to the named owner.
```

## Counterexamples

- “Monitor it and retry failed jobs” combines observation with mutation; use a
  separately authorized repair workflow after this watcher stops.
- “Keep an eye on it” omits an authoritative source and finite stop condition;
  turn it into a watch contract first.
