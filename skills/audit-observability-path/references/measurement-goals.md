# Measurement Goals

Use this reference when a user wants to make one code path measurable. Start
with the question the evidence must answer. Choose the smallest signals that
can answer it across the selected path.

## Measurement goal card

Write one card before recommending instrumentation:

```text
Flow:
Primary question:
Supporting questions:
Start event:
Terminal events:
Rate denominator:
Latency interval:
Important stages:
Identity classes:
Constraints:
```

Keep one primary question and no more than two supporting questions. Name the
terminal outcomes before defining a rate. Mark a field unknown when the path or
runtime does not establish it.

## Common goal classes

| Goal | Define first | Useful evidence |
|---|---|---|
| Outcome rate | Started work, terminal outcomes, numerator, denominator | Bounded outcome counters plus terminal logs or records |
| Flow latency | Start, end, and completion semantics | End-to-end trace or duration distribution |
| Stage bottleneck | Stage boundaries and whether time overlaps | Child spans or bounded stage-duration histograms |
| Throughput | Work unit, completion event, and time window | Counters, rates, and queue or backlog gauges |
| Queue delay | Enqueue, delivery, start, and completion events | Message timestamps, linked spans, and wait-duration histograms |
| Retry and recovery | Operation identity, attempt identity, retry policy, terminal recovery | Attempt counters, structured events, and durable outcomes |
| Resource contribution | Resource, operation stage, and safe aggregation dimension | Resource metrics paired with traces or stage metrics |

Use metrics for bounded population questions. Use traces for causal timing and
stage relationships. Use logs for detailed error and terminal context. Use audit
or domain records for durable business outcomes. Read `signal-model.md` for the
proof limits of each signal type.

## Find high-value placement points

Inspect these points in order:

1. Flow entry and terminal outcome.
2. Process, transport, queue, workflow, and datastore boundaries.
3. Expensive, variable, or externally managed stages.
4. Retry, timeout, cancellation, fallback, and dead-letter paths.
5. Durable commits and user-visible side effects.
6. Boundaries where operation or attempt context can be lost.

Prefer one signal at a material boundary over many signals in trivial helpers.
Separate queue wait, active processing, dependency wait, and durable commit
when they can explain most of the observed duration.

## Rank opportunities

For each candidate, record:

```text
stage or boundary | question answered | signal | operator action | cost and risk
```

Rank candidates using these tests:

1. Does the signal answer a named question?
2. Does it cover a material boundary or terminal outcome?
3. Can an operator act on the result?
4. Does it preserve useful operation and attempt context?
5. Are volume, cardinality, privacy, and retention bounded?
6. Can a representative safe scenario validate it?

Choose the smallest set that establishes the outcome and separates the major
stages. Add diagnostic detail only when the baseline cannot localize a problem.

## Define signal contracts

Every proposed addition needs:

- repository-native signal name and type;
- exact producer location;
- unit and aggregation;
- bounded attributes and identity fields;
- outcome, error, retry, and cancellation semantics;
- sampling, redaction, access, and retention;
- query, dashboard, alert, runbook, or review consumer; and
- a validation scenario with expected evidence.

For a success-rate metric, distinguish started, successful, failed, cancelled,
timed-out, abandoned, and unknown outcomes. Do not use “missing completion” as a
failure unless the observation window and terminal policy support that claim.

For a latency metric, state whether the interval covers queue wait, processing,
dependency calls, commit time, or the full end-to-end operation. Do not add stage
durations that overlap unless the query explains the overlap.

For a trace, create spans for useful work and causal boundaries. For a log,
retain the earliest actionable error and stable operation and attempt context.
For a metric, use bounded dimensions. Keep unbounded identifiers in logs or
traces when they are safe to retain.

## Validate the design

Use the smallest safe scenario that exercises the selected path. Confirm:

- every started operation reaches one defined terminal category or an explicit
  in-flight or unknown state;
- the rate numerator and denominator can be queried without guesswork;
- the latency interval has observable start and end events;
- stage durations identify the dominant contribution without double-counting;
- retries remain distinct attempts of one operation;
- sensitive values are redacted before export; and
- source or configuration claims are not presented as proof of runtime export,
  storage, retention, or alert delivery.

## Reject weak measurement plans

Reshape a plan when it:

- instruments every function without a diagnostic question;
- logs full requests, responses, or exception payloads;
- places operation, user, or record identifiers in metric labels;
- counts starts without defining terminal outcomes;
- measures only averages when tail latency matters;
- uses one span for an entire distributed path with no stage boundaries; or
- adds telemetry without naming its operator or validation consumer.

## Example

For an HTTP request that publishes a message, runs a worker, and commits a
database result:

- define success as the durable commit, not the HTTP response alone;
- count terminal outcomes by bounded result class;
- link the publish and worker spans with operation and attempt context;
- measure queue wait, worker processing, dependency wait, and commit time; and
- retain one structured terminal or earliest-error record for reconstruction.
