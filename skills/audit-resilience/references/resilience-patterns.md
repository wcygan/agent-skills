# Resilience Pattern Catalog

Use this catalog after the audit defines its system model and resilience
properties. Match patterns to evidence-backed failure mechanisms.

## State correctness

### Make invalid states unrepresentable

Use constrained constructors, tagged unions, newtypes, validated values, and
exhaustive matching. Keep illegal combinations outside the runtime model.

Check whether callers can bypass construction rules. Confirm persistence and
wire formats preserve the same invariant.

### Use explicit state machines

Replace related flags and implicit order with named states and guarded
transitions. Define failure, cancellation, recovery, and terminal states.

Check reachability, guard overlap, terminal escape, and version compatibility.

### Enforce invariants at the authority owner

Put uniqueness, balance, permission, and lifecycle checks beside authoritative
state. Treat caller checks as early feedback, not final enforcement.

Check transactions, concurrent updates, stale reads, and bypass paths.

### Assign one writer

Give each authoritative value one mutation owner. Use serialization, optimistic
versions, or compare-and-set when several actors submit changes.

Check lost updates, stale owners, repair tools, and administrative bypasses.

### Validate trust boundaries

Parse, validate, and normalize input when it enters a trust domain. Preserve
the original evidence when operators need forensic context.

Check size limits, recursion, encodings, unknown fields, and partial parsing.

## Effects and repetition

### Make effects idempotent

Bind a stable operation identity to each logical effect. Store enough outcome
state to return or reconcile repeated requests.

Check key scope, retention, payload mismatch, concurrent duplicates, and
ambiguous provider outcomes.

### Make commits atomic

Use one transaction when related state must change together. Define the exact
commit point and behavior after conflict, timeout, or process loss.

Check external effects that cannot share the transaction.

### Use transactional outbox and inbox records

Record business state and delivery intent atomically. Deduplicate consumption
before applying a downstream effect.

Check publisher claims, duplicate publication, ordering, cleanup, and poison
messages. Do not claim exactly-once delivery without end-to-end proof.

### Compensate committed work

Use a saga when several irreversible boundaries cannot share one transaction.
Model compensation as a new business action with its own retries and failures.

Check states where forward work and compensation are both incomplete.

### Reconcile ambiguous outcomes

Compare intended state with authoritative external state after uncertain
completion. Give repair decisions a named owner and an audit trail.

Check delayed truth, repeated repair, manual override, and irreversibility.

## Time and ownership

### Propagate deadlines and cancellation

Use one end-to-end deadline budget. Reserve time for cleanup and error
propagation. Carry cancellation into child work where semantics permit.

Check whether a local timeout proves remote work stopped. Usually it does not.

### Bound retries

Retry only classified transient failures. Set finite attempts or elapsed time,
backoff, jitter, and a terminal action.

Check nested retry multiplication, server guidance, retained state, and
idempotency.

### Fence stale owners

Use monotonic fencing tokens when leases or locks can expire. Reject commits
from owners that lost authority.

Check clock assumptions, renewal failure, process pauses, and storage support.

### Checkpoint resumable work

Persist progress at stable boundaries. Make resume distinguish completed,
pending, and unsafe-to-repeat work.

Check checkpoint atomicity, version changes, cleanup, and abandoned progress.

### Drain before shutdown

Stop new admission, finish or checkpoint owned work, release authority, and
expose shutdown progress.

Check hard deadlines, stuck work, message visibility, and replacement overlap.

## Fault containment and load

### Degrade gracefully

Define the minimum critical capability. Return explicit partial, stale, queued,
or unavailable states when optional dependencies fail.

Check correctness, freshness, authorization, user disclosure, and recovery.

### Use circuit breakers

Stop repeated calls to an unhealthy dependency. Define scope, thresholds,
open time, half-open probes, and fallback behavior.

Check whether rejected work is safe to retry and whether breaker state aligns
with the failure domain.

### Isolate with bulkheads

Separate resource pools, queues, workers, or quotas for unrelated workloads.
Preserve capacity for critical work.

Check shared downstream limits and starvation between pools.

### Apply backpressure

Bound queues and concurrent work. Slow producers, reject excess work, or shed
low-value load before the system exhausts resources.

Check admission fairness, retry feedback, queue age, and user semantics.

### Set resource budgets

Limit memory, storage, connections, file handles, payload size, work units, and
cardinality. Make budget exhaustion visible and recoverable.

Check cleanup, leaks, untrusted dimensions, and per-tenant isolation.

### Use independent redundancy

Replicate only when instances do not share the same critical failure domain.
Define selection, quorum, failover, consistency, and repair behavior.

Check correlated dependencies, split brain, stale replicas, and failback.

## Compatibility and change safety

### Version contracts

Give persisted and transported data explicit compatibility rules. Use tolerant
readers only when ignored data cannot change safety or authority.

Check replay, rollback, old writers, new readers, and unknown variants.

### Use expand-and-contract change

Add compatible state first, migrate or dual-read safely, switch authority, and
remove old state only after evidence confirms retirement.

Check partial rollout, rollback direction, long-lived jobs, and old artifacts.

### Validate configuration before service

Parse typed configuration and reject unsafe combinations before accepting work.
Use safe defaults only when absence has one correct meaning.

Check secret presence, units, ranges, environment drift, and reload behavior.

### Limit rollout exposure

Use canaries, feature controls, tenant cohorts, and automatic stop gates. Bind
evidence to the exact candidate and configuration.

Check shared state compatibility, flag cleanup, and rollback side effects.

### Use least authority

Give each component only the data and actions its job requires. Separate
classification or drafting from policy approval and irreversible effects.

Check credential scope, confused deputies, repair tools, and emergency access.

## Diagnosability and verification

### Preserve causal identity

Carry operation, attempt, message, task, actor, and effect identities across
boundaries. Keep retries distinct while preserving end-to-end causation.

Check fanout, asynchronous links, sampling, privacy, and metric cardinality.

### Record terminal outcomes

Make success, rejection, failure, cancellation, exhaustion, compensation, and
abandonment distinguishable in durable state and operational evidence.

Check silent fallback, swallowed errors, and misleading success responses.

### Separate liveness and readiness

Report process health, admission readiness, dependency degradation, and
recovery state separately. Tie each signal to an operator action.

Check startup, shutdown, stale health, and optional dependencies.

### Create deterministic seams

Control time, randomness, identifiers, external responses, concurrency, and
resource limits through narrow interfaces. Keep production semantics intact.

Check whether substitutes preserve ordering, persistence, and failure behavior.

### Test counterexamples

Create focused tests for invalid state, duplicate work, ambiguous completion,
timeout, cancellation, restart, overload, and recovery.

Use authoritative oracles. A mock cannot prove a real dependency contract.

### Exercise bounded faults

Inject failures only in isolated environments with explicit budgets, stop
conditions, cleanup, and expected evidence.

Check that the test can detect the defect it claims to cover.

### Retain replayable evidence

Keep bounded event history, inputs, decisions, state transitions, and candidate
identity when deterministic replay or forensic reconstruction is required.

Check privacy, retention, schema evolution, missing external state, and replay
side effects.

## Selection test

Before recommending a pattern, answer:

1. Which supported counterexample activates it?
2. Which resilience property does it protect?
3. Which component owns the mechanism?
4. Which state or effect boundary changes?
5. What new failure mode does the pattern introduce?
6. What evidence proves the mechanism and its terminal behavior?
7. What residual risk remains after adoption?
