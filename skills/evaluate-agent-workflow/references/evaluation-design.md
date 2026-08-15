# Evaluation Design

Use this reference to turn an observed agent defect or desired behavior into a
focused regression evaluation.

## Select the assertion boundary

Choose the lowest boundary that proves the responsible behavior:

- **Schema or catalog:** capability is advertised exactly and invalid arguments
  are rejected.
- **Route resolution:** requested model, effort, role, and context fork resolve
  to the expected effective route or explicit error.
- **Tool adapter:** validated arguments produce the expected normalized result.
- **Orchestration:** recorded model and tool items advance state correctly.
- **Persistence:** authoritative events and identities are durably retained.
- **Projection:** durable inputs produce the expected API or transcript state.
- **Agent behavior:** the model selects an appropriate action or answer under a
  controlled envelope.
- **User journey:** the integrated workflow produces the intended visible and
  durable outcome.

Cross-layer regressions usually need one focused assertion plus one integrated
case. Avoid relying only on a full end-to-end case when a narrower test can
localize failure.

## Build the case set

Include only cases that discriminate meaningful behavior:

1. canonical positive case;
2. valid alternative phrasing or input shape;
3. boundary or missing-information case;
4. invalid or prohibited action;
5. competing tool or action that should not be selected; and
6. prior regression example, scrubbed and minimized.

For migrations, run the same frozen set against old and new configurations.
Change one variable at a time and retain the request envelopes used.

## Choose an oracle

Prefer, in order:

1. exact structural assertions on schemas, events, state, or side effects;
2. deterministic semantic assertions on normalized outputs;
3. domain-specific rule checks;
4. rubric-based grading with explicit dimensions and examples; and
5. model grading only when the property cannot be checked mechanically.

Do not ask the same agent to generate and validate its own answer without an
independent rule or held-out evidence. Do not use answer wording as a proxy for
tool execution or durable state.

## Handle stochastic behavior

Name the statistical claim before repeating runs. Record:

- number of trials;
- model, provider, parameters, and seed support;
- parent and child route, role, context fork, inheritance, and fallback;
- per-case success definition;
- aggregate threshold;
- tolerated variance or confidence interval;
- latency and cost budget; and
- failure artifacts retained for diagnosis.

Repeated success does not prove an unavailable tool, persistence path, or UI
projection works. Test deterministic system layers separately.

## Keep fixtures trustworthy

- Minimize real transcripts and remove secrets and personal data.
- Preserve field presence, order, identity, and failure details needed by the
  behavior under test.
- Version fixtures when request or event contracts change.
- Distinguish generated fixtures from captured production-like artifacts.
- Fail visibly when required fixture fields are absent; do not silently default
  away the behavior being tested.

## Evaluation contract

```text
Behavior:
Prohibited behavior:
Controlled envelope:
Cases:
Assertion boundary:
Oracle:
Threshold and variance:
Artifacts on failure:
Runtime and cost bound:
Data and authority boundary:
```
