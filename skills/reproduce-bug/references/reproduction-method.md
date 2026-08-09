# Reproduction Method

Use this reference to move from a report to a faithful, minimized, repeatable
scenario without confusing reproduction with diagnosis.

## Contents

- Reproduction ladder
- Failure signature
- Hypothesis ledger
- Attempt design
- Minimization
- Oracle design
- Evidence capsule
- Completion states

## Reproduction ladder

Move down the ladder only after the current level reproduces:

1. reported environment and public operation;
2. controlled equivalent at the same public boundary;
3. isolated application or service boundary;
4. focused integration of the implicated components; and
5. minimal unit or model.

Higher levels preserve fidelity; lower levels improve control and speed. Keep
the highest-level reliable reproducer needed to prove integration behavior.
Do not replace a distributed, persistence, rendering, or lifecycle bug with a
unit scenario that removes its causal mechanism.

## Failure signature

A useful signature is:

- observable from a stable point;
- specific enough to exclude similar failures;
- insensitive to timestamps, random IDs, and formatting noise;
- cheap enough to evaluate repeatedly;
- able to detect partial state or prohibited side effects; and
- independent of the suspected implementation when practical.

Use several assertions when one symptom can mask another. For example, assert
both the response and committed state when an ambiguous timeout can still
complete work remotely.

## Hypothesis ledger

Keep hypotheses falsifiable:

| Field | Purpose |
|---|---|
| hypothesis | proposed condition or mechanism |
| prediction | observation expected if it matters |
| controlled change | one discriminating manipulation |
| supporting evidence | facts consistent with it |
| contradicting evidence | facts it fails to explain |
| outcome | observed result |
| status | active, weakened, rejected, or supported |

Do not promote “supported” to root cause until the mechanism and competing
explanations are addressed.

## Attempt design

Before each attempt, state:

- fixed conditions;
- one changed variable or intentionally selected interaction;
- initial state and reset procedure;
- timeout and maximum repetitions;
- signature and negative control;
- artifacts retained on failure; and
- stop condition for unsafe or runaway behavior.

Random exploration can discover a failure, but retain the seed, schedule,
input, and environment needed to replay it.

## Minimization

Reduce along one dimension at a time:

- input fields or records;
- operation sequence;
- participating components;
- concurrency and timing window;
- configuration differences;
- resource pressure;
- environment or dependency variation; and
- setup and teardown.

After every reduction, verify the positive signature and a nearby negative
control. Restore the last faithful state when the failure class changes.

Use delta-debugging-style partitioning for large inputs or sequences when each
trial is bounded and resettable. Preserve semantic dependencies; arbitrary
chunk deletion can create a different invalid-input failure.

## Oracle design

Prefer oracles in this order:

1. domain invariant or durable state;
2. typed or structured result;
3. stable public output;
4. bounded resource or timing measure;
5. normalized visual or artifact comparison; and
6. logs only when no better observable exists.

An oracle must distinguish pass, target failure, unrelated failure, timeout,
and invalid setup. Treat setup failure as its own outcome rather than a
successful reproduction.

## Evidence capsule

Retain enough to replay one attempt:

```text
scenario:
revision and environment:
controlled inputs:
seed, clock, and schedule:
initial state:
command:
expected signature:
actual outcome:
artifacts:
cleanup and retry:
```

Use repository-relative paths or run-owned artifact directories. Exclude
secrets and sensitive values; record redacted shape or hashes when sufficient.

## Completion states

Report one:

- **reliable:** controlled runs repeatedly match the target signature;
- **probabilistic:** bounded runs reproduce at a measured nonzero rate;
- **environment-specific:** only a named environment reproduces;
- **not reproduced:** bounded attempts completed without the signature;
- **different failure:** attempts failed, but not with the target signature; or
- **blocked:** a necessary input, environment, authority, or observation is
  unavailable.

“Not reproduced” is evidence about the attempted conditions, not proof that
the report is invalid.
