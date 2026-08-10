# CI and Evaluation Evidence

Use this reference when evaluation results will gate pull requests, scheduled
runs, releases, or promotion decisions.

## Bind every run to a candidate

Retain enough identity to distinguish application and evaluator changes:

```text
Run and suite identity:
Source revision and artifact:
Prompt and instruction versions:
Model, provider, and sampling:
Tool catalog and schemas:
Retrieval data and index:
Orchestration and feature flags:
Framework, grader, and rubric:
Dataset and held-out versions:
Environment and dependency lock:
Start/end time and budgets:
```

Generate this identity from authoritative sources when practical. Do not rely
on branch names, ambient environment, or mutable provider aliases as the sole
candidate record.

## Choose proportionate tiers

### Pull-request gate

Use fast deterministic cases, recorded lower-layer fixtures, and the smallest
bounded live-model sample needed for the change. Trigger on relevant paths and
retain failure reasons. Keep uncalibrated stochastic metrics report-only.

### Scheduled suite

Use broader representative cases, repeated trials, live dependencies when
authorized, drift indicators, and cost/latency reporting. Scheduled evidence
finds trends but does not certify a different release candidate automatically.

### Release gate

Bind held-out cases, grader, dataset, application artifact, configuration, and
target environment to the exact candidate. Include required deterministic,
integrated, recovery, and user-visible checks outside the LLM suite when the
release claim crosses those layers.

### Human review

Require an owner for disputed rubric results, newly mined failures, policy
judgment, threshold changes, and accepted residual risk. Preserve the original
machine result alongside adjudication.

## Define one gate contract

```text
Decision and owner:
Entry state:
Candidate identity:
Required cases and environment:
Trials and aggregation:
Pass threshold:
Hard prohibited outcomes:
Known tolerated variance:
Time, cost, and external-call budget:
Evidence retained:
Stop conditions:
Retry or rerun policy:
Residual human judgment:
```

A rerun is new evidence, not erasure of the first failure. Define when reruns
are allowed and how all attempts affect the decision.

## Control cost and concurrency

- Estimate maximum cases multiplied by trials, grader calls, retries, tokens,
  and concurrent workers before enabling the gate.
- Use a hard timeout and finite retry count.
- Bound provider concurrency and respect documented rate limits.
- Stop on repeated authentication, quota, schema, or evaluator failures rather
  than consuming the full case budget.
- Distinguish system failures from behavioral failures in the result.
- Require explicit authority before sending private cases to an external
  candidate or grader.

## Retain useful evidence

Keep, subject to privacy and retention policy:

- normalized case and candidate identities;
- pass/fail and component scores;
- deterministic assertion diffs;
- grader rubric, score, and reason;
- trace or durable-receipt references;
- latency, cost, token, cache, retry, and attempt data;
- earliest framework or provider error; and
- human adjudication and threshold changes.

Use access-controlled artifacts for sensitive cases. Redact secrets and
personal data before retention; do not make logs or CI annotations a secondary
full-data export.

## Promote a metric carefully

Before changing a metric from informational to blocking, require:

1. pinned grader and rubric;
2. reviewed calibration cases;
3. observed variance across repeated equivalent runs;
4. an understood false-pass and false-fail rate;
5. a threshold with a decision rationale;
6. a budget and accountable owner; and
7. a rollback path for evaluator regressions.

Changing the grader, rubric, aggregation, or dataset invalidates the old
baseline unless comparability is demonstrated.

## Verify the gate

Exercise one passing case, one intended behavioral failure, one framework or
provider failure, and the artifact-retention path. Confirm that each outcome is
distinguishable, the earliest cause survives, the command exits appropriately,
and cleanup or retry does not alter unrelated state.
