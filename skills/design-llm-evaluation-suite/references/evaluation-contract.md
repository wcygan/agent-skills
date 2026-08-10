# Evaluation Contract

Use this reference to design cases, datasets, oracles, stochastic trials, and
held-out evidence after the suite's target and application boundary are known.

## Build behavior-centered cases

Write every case around one behavior, not one preferred sentence:

```text
Case ID:
Behavior:
Starting state:
Input and attachments:
Available capabilities:
Expected outcome:
Prohibited outcome:
Authoritative evidence:
Controlled dependencies:
Real dependencies:
Candidate dimensions held constant:
Oracle and threshold:
Trials and aggregation:
Failure artifacts:
Runtime, cost, and data class:
```

Use exact expected output only when wording is itself the contract. Otherwise
assert normalized structure, domain facts, tool or state receipts, semantic
requirements, and prohibited claims independently.

## Own dataset provenance

For every dataset or case collection, record:

- owner and intended decision;
- source: authored, captured, incident-derived, synthetic, or production-like;
- collection window and inclusion rule;
- consent, privacy, licensing, and redaction constraints;
- schema and semantic version;
- train, development, regression, calibration, and held-out membership;
- duplicates, near-duplicates, exclusions, and known skew; and
- retention, deletion, and access boundaries.

Keep a captured failure's semantics while minimizing private or incidental
content. Synthetic cases expand coverage but do not prove production
representativeness. Prevent prompt examples, model-tuning data, and producer
feedback from silently entering the held-out set.

## Apply the oracle ladder

### 1. Structure

Use schema, type, protocol, shape, required-field, and parser assertions. These
are the strongest oracles for machine-consumed output.

### 2. Domain rules

Use deterministic calculations, allowlists, invariants, policy engines, and
known-good reference data. Keep the rule independent from the implementation
under test.

### 3. Action and state receipts

Assert tool name, normalized arguments, ordering when required, result class,
event identity, durable state, absence of prohibited effects, and terminal
workflow outcome. A model response that claims success is not a receipt.

### 4. Reference-based semantics

Compare facts, citations, retrieved context, expected concepts, or worked
answers without demanding identical prose. Record reference authority and
version.

### 5. Model graders

Use a rubric only for irreducibly semantic properties. Define one dimension per
score where possible, clear anchors, counterexamples, required evidence,
threshold, grader identity, and failure reason. Avoid broad labels such as
`quality` or `good answer`.

### 6. Human calibration

Use reviewed examples to measure grader agreement and settle disputed
dimensions. Record reviewer instructions, disagreements, adjudication, and
which thresholds remain judgment calls.

## Calibrate model graders

Before making a grader blocking:

1. Assemble clear pass, clear fail, and difficult boundary examples.
2. Obtain independent labels or an accepted reference decision.
3. Run the pinned grader and rubric without exposing the expected label.
4. Inspect false passes, false failures, instability, verbosity bias, and
   sensitivity to irrelevant wording.
5. Revise the rubric or narrow the property, then repeat on held-out examples.
6. Record agreement, residual ambiguity, and the human owner of threshold
   changes.

The candidate model must not be its only grader. Shared provider or model-family
bias is a limitation even when the grader is a different deployment.

## Bound repeated trials

Repeat runs only for a named stochastic property. Record:

```text
Per-trial success:
Trials per case:
Aggregation:
Required threshold:
Tolerance or confidence statement:
Sampling and seed support:
Concurrency:
Cache policy:
Application retries:
Evaluator retries:
Timeout and cost ceiling:
Early-stop rule:
```

Treat application attempts and evaluator retries separately. Retain the first
failure rather than replacing it with the eventual retry result. Do not change
the sample set, rubric, trial count, or aggregation while comparing candidates
without establishing a new baseline.

## Design trace receipts

Use component evidence only when it is part of the behavior contract or needed
to localize a failure. Give each trace a stable operation identity and distinct
attempt identities. Useful observable fields include:

- input and normalized request identity;
- model and provider identity;
- available and selected tools;
- normalized tool arguments and result class;
- retrieval query, document identities, and provenance;
- subagent or handoff identity;
- retry, cancellation, and terminal status;
- event or durable-state receipt; and
- latency, token, and cost measurements with units.

Avoid private chain-of-thought or hidden reasoning. A plan exposed as an
application artifact may be evaluated as output, but the suite must not require
private model internals.

## Keep held-out evidence independent

Use held-out cases when a producer can modify prompts, tools, application code,
normal tests, or graders. Pin the verifier and input identities, prevent the
candidate change from editing them, and retain rejection evidence. A held-out
set should include nearby successful behaviors and prohibited alternatives,
not only variations of known failures.

## Check suite sensitivity

Before accepting the design, test the counterfactual:

- Would the suite fail if the wrong tool were called with plausible prose?
- Would it detect unsupported citations or a missing durable effect?
- Would it distinguish a provider failure from agent behavior?
- Would a vacuous or overly verbose answer pass the rubric?
- Would cache reuse hide the candidate change?
- Could changing the grader manufacture an improvement?

Record any defect class the suite cannot distinguish.
