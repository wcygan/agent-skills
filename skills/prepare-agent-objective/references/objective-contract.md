# Objective contract

Keep this with the project's durable task records, outside the installed skill.
Use existing records where possible. Mark unknowns explicitly; do not invent a
baseline, permission, schedule, or completed check to fill a field.

| Field | Record |
| --- | --- |
| Outcome and scope | Beneficiary, affected journeys, systems, environments, and exclusions |
| Baseline | Measurement, date, artifact/release identity, workload, and uncertainty |
| Required and stretch targets | Acceptance threshold, exploration target, and who selected each |
| Invariants | Correctness, completeness, freshness, compatibility, and resource constraints |
| Inputs | Raw sources, retrieval commands, access, timestamps, and collection health checks |
| Identity | Release-to-commit mapping, configuration, platform, and dataset versions |
| Execution | Build/start commands, fixtures, accounts, isolation, and cleanup |
| Judge | Regression check, benchmark, held-out cases, or independent observation; negative control |
| Action boundary | Current authority for edits, PRs, merges, deployment, rollback, and external messages |
| Budget | Time, compute/spend, concurrent work, attempts, and escalation conditions |
| Observation window | Minimum usage/exposure, cohorts, interval, and collateral metrics |
| Continuity | Checkpoint location, case identities, owner, restart reconciliation, trigger and stop mechanism |
| Evidence and gaps | Pilot results, untested stages, missing prerequisites, and next resolving action |

## Reliability example

For an objective such as reducing recurring crashes, specify crash-free sessions
by release/platform, signal delay, minimum exposure, and the source-health check.
Reproduce a representative crash on its mapped source revision, verify the fix,
and observe the released version before calling the incident resolved in production.
Record unsupported platforms as gaps. Do not improve the metric by suppressing
reports or excluding the users experiencing failures.

## Performance example

For a ten-second operation, a user might require two seconds and request exploration
of 200 milliseconds. Pin the end-to-end boundary, representative data sizes,
hardware, concurrency, cache conditions, error rate, and result correctness.
Use separate development and held-out workloads where tuning could overfit.
Freeze acceptance before experimentation; independently inspect changes to the
measurement method and rerun baseline and candidate if the method was defective.

Record whether reaching the required target ends the run or whether authorized
exploration continues toward the stretch target within the remaining budget.
A useful improvement can be retained while the stretch target remains unmet.
