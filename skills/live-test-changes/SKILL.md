---
name: live-test-changes
description: >-
  Deploy and live-test one bounded application change in an isolated local environment. Exercise relevant public paths and feature-flag states. Produce durable, reproducible evidence with exact Bash commands, requests, responses, observed outcomes, cleanup, and proof limits. Use after implementation for PR evidence, review, handoff, release checks, or manual acceptance. Do not use for test planning, development-loop improvement, or shared-environment deployment.
license: MIT
metadata:
  author: William Cygan
  version: "0.1.0"
---

# Live-Test Changes

Prove one implemented application change in a running local deployment. Bind
every claim to observed evidence that another teammate can reproduce.

Do not finish with a plan when safe local execution is available. Deploy the
application, exercise the selected paths, and report the observed result.

## Route the request

Use this skill after implementation when runtime proof is the requested result.
Keep these nearby jobs separate:

- Use `incremental-execution` to implement or repair the change.
- Use `design-verification-strategy` to design a broader proof strategy.
- Use `improve-development-loop` to improve repeated local feedback work.
- Use `pr-guidelines` to assess the complete pull request presentation.
- Use `reproduce-bug` to isolate an intermittent or uncertain symptom.

This skill can consume an accepted test plan. Otherwise, it creates the
smallest live-test plan needed for the stated claim.

## Preserve the authority boundary

The request authorizes documented, run-owned local deployment actions. It
permits local builds, processes, containers, fixtures, requests, and cleanup
that directly support the selected scenario.

Keep tracked application files read-only. Preserve unrelated work and existing
runtime state. Start and stop only processes, containers, and resources owned
by this run.

Do not access shared development, staging, or production systems. Do not use
production credentials or personal data. Ask before installing host
dependencies or using a paid service.

Stop before execution when deployment would mutate existing user data, run an
unsafe migration, expose a secret, or write to an unauthorized external
system. Report the blocked step and the smallest required decision.

## Establish the live-test contract

Read repository instructions before running commands. Inspect the current
revision, dirty state, deployment surfaces, fixtures, feature flags, readiness
checks, logs, and cleanup paths.

Record this contract in task state:

```text
Claim:
Candidate identity:
Relevant change:
Local environment:
Public entry points:
Required cases:
Authoritative observations:
Feature flags:
Allowed local effects:
Forbidden effects:
Readiness bound:
Cleanup and retry state:
```

Bind the evidence to the exact candidate. Record the revision, build identity,
configuration, and relevant dirty-state fingerprint when available. A stale or
rebuilt artifact is a different candidate.

State the claim as observable behavior:

```text
Under the named local state, when the scenario runs, the application produces
the expected public response and durable effect without the prohibited result.
```

Stop for clarification when the candidate, expected behavior, or authoritative
observation is unclear.

## Inspect the local deployment path

Prefer repository-owned task runners, compose files, scripts, and documented
commands. Inspect each command before execution. Identify:

- required services and dependencies;
- build and startup behavior;
- image pulls or package installation;
- ports, files, volumes, databases, and background processes;
- environment variables and secret sources;
- migrations, seed operations, and external endpoints;
- readiness and failure signals; and
- shutdown, reset, and cleanup behavior.

Use only the services required by the claim. Select unique ports, identifiers,
namespaces, or directories when concurrent local work is possible.

Prefer an isolated local store or disposable database. Do not reuse existing
application data when the scenario mutates state.

## Build the live-test plan

Map each material risk to one discriminating case:

```text
case | public path | controlled input | expected result | authoritative observation
```

Include the smallest useful set of cases:

- the changed success path;
- one relevant rejection or failure path;
- a baseline or negative control when it distinguishes the change; and
- each required feature-flag state.

Prefer public contracts over internal calls. Use protocol responses, committed
state, emitted events, completed jobs, or user-visible state as observations.
A log line alone does not prove a durable side effect.

Read only the matching branch in `references/scenario-patterns.md` before
execution. Use its feature-flag branch whenever a relevant flag exists.

## Prepare isolated state

Create the smallest representative fixture. Give every mutable resource a
run-owned identity. Record fixture creation and cleanup commands.

Control material time, randomness, identity, and external responses when the
repository provides safe seams. Label any emulator, stub, or substituted
dependency as a proof limit.

Check current ports and processes before startup. Stop on an ownership conflict
that cannot be isolated safely.

## Deploy the exact candidate

Run the inspected build and startup commands. Capture:

- the command and working directory;
- relevant non-secret configuration;
- exit status and decisive output;
- artifact or image identity;
- process, container, service, and port identity; and
- the authoritative readiness signal.

Use a bounded readiness check. Preserve startup output when readiness fails.
Do not replace readiness with an unexplained sleep.

Return `BLOCKED` when the environment cannot deploy safely. Return `FAIL` when
the candidate starts incorrectly or misses its readiness condition.

## Exercise the selected paths

Run each planned case against the local deployment. Keep the input stable
across comparison cases. Capture the exact request or action before its
response.

For each case, record:

```text
Case:
Command or action:
Observed response:
Observed durable state:
Exit status:
Result:
```

Do not convert unexpected behavior into a repair task. Preserve the evidence
and return `FAIL` for a falsified claim.

## Compare feature-flag states

When a relevant feature flag exists:

1. Identify its default and configuration source.
2. Determine whether it is read during build, startup, or runtime.
3. Prove the disabled state is active.
4. Run the disabled case with controlled input.
5. Reset state that can affect the comparison.
6. Prove the enabled state is active.
7. Run the enabled case with equivalent input.
8. Record the behavioral difference and both outcomes.

Use separate builds for build-time flags. Use separate starts for startup
flags. Use an isolated toggle path for runtime flags.

Return `PARTIAL` or `BLOCKED` when a required state cannot be selected or
proven. State `Feature flags: not applicable` when no relevant flag exists.

## Clean up and confirm retry state

Stop run-owned processes and containers. Remove only verified run-owned
fixtures, files, volumes, and data. Keep evidence artifacts when the user asks
for retention.

Run the documented status or readiness check after cleanup. Record remaining
local state and any cleanup failure. Never use a broad reset or cleanup path.
Return `PARTIAL` when behavior proof passes but required cleanup or retry-state
confirmation fails.

## Report durable evidence

Read `references/evidence-format.md` completely before reporting. Use exactly
one terminal status:

```text
PASS | FAIL | PARTIAL | BLOCKED
```

- `PASS`: Every required case has matching observed evidence.
- `FAIL`: Observed behavior falsifies the claim.
- `PARTIAL`: Some required proof is unavailable, but useful cases ran.
- `BLOCKED`: Safe deployment or execution could not start or continue.

Produce a reproducible evidence report and a paste-ready `## Testing Done`
section. State what the evidence proves and what remains unproved.

Do not claim an unobserved result. Separate current observations from
repository-derived expectations and user-reported history.

## Examples

```text
Deploy this branch locally, exercise the changed API, and give me reproducible
commands and responses for the pull request.
```

```text
Live-test this feature with the flag disabled and enabled. Prove which state
was active and record the behavior in a Testing Done section.
```

```text
Run the packaged desktop application, exercise the changed workflow, and
capture the visible result plus its durable backing state.
```

## Counterexamples

- “Implement this endpoint and test it” includes implementation. Use
  `incremental-execution` for the complete delivery job.
- “Tell me what tests this migration needs” requests proof design only.
- “Deploy this branch to staging” targets a shared environment.
