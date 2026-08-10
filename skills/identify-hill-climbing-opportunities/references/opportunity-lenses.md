# Opportunity Lenses

Use these lenses to widen candidate discovery or map likely drivers. Select
only lenses that match the framed outcome.

These relationships are hypotheses. Verify the current system before naming a
cause or recommending a lever.

## General driver lenses

Test every candidate against these possible driver groups:

| Lens | Questions |
|---|---|
| Demand | How do volume, mix, size, bursts, and arrival timing affect it? |
| Application work | Which algorithms, calls, queries, copies, and conversions consume work? |
| Dependencies | Which services, datastores, networks, and tools add time or failure? |
| Capacity | Where do CPU, memory, connections, workers, locks, and queues saturate? |
| State | How do caches, indexes, data shape, history, and retained state affect it? |
| Control | Which retries, limits, batching, concurrency, and scheduling rules affect it? |
| Topology | How do routing, regions, placement, fan-out, and load distribution affect it? |
| Measurement | Can sampling, aggregation, missing signals, or clock boundaries distort it? |

For each likely driver, identify a diagnostic measure and an editable lever.
Mark external or inaccessible factors separately.

## Runtime latency and responsiveness

Possible target metrics include:

- p50, p95, or p99 duration for one fixed request class;
- queue wait, processing time, or end-to-end completion time;
- time to first byte or time to a user-visible result; and
- deadline success rate under a fixed workload.

Likely driver groups include:

- application algorithms, serialization, copies, and allocation;
- database query count, N+1 access, query plans, locks, and connection waits;
- external service latency, retry behavior, fan-out, and call ordering;
- network distance, payload size, protocol setup, and transport limits;
- queue depth, worker concurrency, lock contention, and scheduling delay;
- cache hits, misses, invalidation, and cold-start work;
- traffic volume, request mix, burst shape, routing, and tenant skew; and
- capacity limits, autoscaling delay, overload control, and resource sharing.

Use error rate, correctness, throughput, and cost as possible guards. Keep the
request mix and offered load stable across measurements.

## Correctness and quality

Possible target metrics include:

- fixed-suite pass rate over representative inputs;
- invariant violations per eligible operation;
- mutation score for a fixed mutation set;
- escaped defect rate over a stable reporting window; and
- task or evaluation success over a versioned dataset.

Likely driver groups include:

- oracle quality and test input distribution;
- untested branches, states, boundaries, and failure paths;
- schema, validation, and data-quality behavior;
- concurrency, ordering, retries, and duplicate processing;
- dependency contracts and compatibility drift;
- configuration, feature flags, and environment differences; and
- evaluator, grader, sampling, or labeling error.

Code coverage is executed-code evidence. It can support test-gap discovery, but
it does not prove assertions, behavior, or user outcomes.

A coverage target needs a fixed tool, source set, test set, and exclusion
policy. Use test quality, runtime, and behavior as guards.

## Errors and reliability

Possible target metrics include:

- terminal failures per eligible operation;
- first-attempt error rate and eventual success rate;
- timeout, retry, cancellation, or dead-letter rate;
- availability for one bounded service-level indicator;
- flaky test rate over repeated fixed runs; and
- recovery time after a controlled failure.

Likely driver groups include:

- invalid input and workload distribution;
- dependency failures, timeouts, quotas, and rate limits;
- retry policy, backoff, idempotency, and overload amplification;
- resource exhaustion, queue growth, and lock contention;
- partial state, compensation, and recovery behavior;
- deployment, configuration, and version skew; and
- missing or collapsed attempt and terminal outcome signals.

Define errors with a numerator, eligible denominator, time window, and terminal
meaning. Retries can hide user failure or inflate internal error counts.

## Throughput and scale

Possible target metrics include:

- successful operations per second under a fixed load model;
- maximum sustained throughput within a latency and error budget;
- queue drain rate or backlog age; and
- work completed per worker, core, connection, or cost unit.

Likely driver groups include:

- concurrency limits, partitioning, batching, and vectorization;
- serial sections, locks, coordination, and shared resources;
- database, broker, and connection capacity;
- routing, sharding, tenant skew, and hot keys;
- backpressure, admission control, and retry traffic; and
- resource requests, limits, placement, and autoscaling.

Use tail latency, error rate, correctness, and cost as guards. Raw throughput is
misleading when offered load or success criteria change.

## Resource efficiency and cost

Possible target metrics include:

- CPU time, memory, bytes, or energy per successful operation;
- infrastructure cost per successful request, job, or tenant;
- artifact, image, bundle, or transfer size;
- storage growth per retained record; and
- external API or model cost per accepted result.

Likely driver groups include:

- algorithms, allocation, copies, and retained objects;
- payload, artifact, image, and dependency size;
- cache policy, compression, batching, and data layout;
- overprovisioning, idle capacity, placement, and autoscaling;
- retry, duplicate, abandoned, or speculative work; and
- pricing tiers, quotas, and external service selection.

Prefer cost per successful outcome over raw resource reduction. Guard latency,
correctness, reliability, and capacity headroom.

## Developer experience and delivery

Treat each timing boundary and cache state as a separate metric.

### Time to first successful deploy

Model a clean checkout or new environment with cold caches. Define whether the
clock starts at checkout, tool setup, dependency installation, or command
invocation. Stop at a healthy, usable deployment.

Possible drivers include:

- toolchain setup and environment checks;
- dependency resolution, download, and installation;
- clean compilation, tests, packaging, and image construction;
- artifact upload, infrastructure provisioning, and scheduling;
- rollout, migration, readiness, and health checks; and
- missing prerequisites, manual steps, and poor failure messages.

Use isolated caches instead of deleting shared developer caches.

### Time to redeploy

Model one representative source change with warm tools and cached dependencies.
Stop when the changed behavior is healthy and observable.

Possible drivers include:

- file watching and change detection;
- incremental build scope and cache invalidation;
- test selection and required quality gates;
- image-layer reuse and artifact delta size;
- upload, scheduling, restart, and readiness time; and
- state reset, fixture preparation, and stale process cleanup.

Cold first deploy and hot redeploy answer different questions. Report both when
both workflows matter.

### Deployment duration

Define one exact deployment segment. Useful boundaries include:

- accepted revision to healthy deployment;
- pipeline start to completed rollout;
- artifact available to completed rollout; and
- rollout start to readiness.

Possible drivers include queue wait, tests, build work, artifact transfer,
approval gates, scheduler delay, rollout policy, and health-check timing.

### Feedback and recovery metrics

Other developer experience candidates include:

- edit to focused test result;
- edit to browser-visible proof;
- clean and incremental build duration;
- focused, integration, and full test duration;
- local service startup and readiness time;
- fixture creation and reset time;
- time to an actionable failure message;
- failed-state recovery time;
- cache hit rate for builds or dependencies;
- flaky run rate; and
- manual steps or tool handoffs per repeated loop.

Code coverage can be a delivery quality signal. Treat it as a proxy with an
explicit source set, test set, coverage type, and guard.

Use correctness, reproducibility, diagnostic quality, and broader validation
as possible guards for speed improvements.

## Agent and evaluation quality

Possible target metrics include:

- success rate on a versioned evaluation set;
- invalid tool calls or recovery failures per task;
- accepted result cost or latency;
- citation, schema, or contract compliance; and
- grader agreement against a held-out review set.

Likely driver groups include instructions, context selection, tool contracts,
orchestration, memory, retrieval, model choice, and grader behavior.

Freeze the dataset, grader, tool surface, and sampling policy. Use held-out or
negative cases as guards when the target can overfit.

## Product and user outcomes

Possible metrics include task completion, conversion, abandonment, retention,
support demand, or time to user value.

These metrics often have slow feedback and many confounders. They are suitable
only when a controlled, repeatable measure can respond to the editable scope.
Otherwise, report a product experiment or evaluation prerequisite instead of a
hill-climbing target.
