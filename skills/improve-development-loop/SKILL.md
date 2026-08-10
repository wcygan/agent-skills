---
name: improve-development-loop
description: |
  Inspect and improve an application's development loops from a change to trustworthy feedback.
  Use when setup, startup, fixtures, tests, builds, browser actions, logs, validation, or cleanup consume repeated developer or agent effort.
  Add the smallest useful automation and promote stable workflows into project-specific agent skills when implementation is requested.
license: MIT
metadata:
  author: William Cygan
  version: "0.2.0"
---

# Improve the Development Loop

Shorten the path from an application change to trustworthy feedback and a safe
retry. Treat velocity as feedback speed multiplied by confidence, not as command
duration alone.

## Preserve the authority boundary

Treat requests to inspect, audit, identify, assess, or recommend as read-only.
Do not modify tracked files in those modes. Normal diagnostic commands may
create ignored build or test artifacts when they are safe and relevant.

Implement automation or scaffolding only when the user asks to improve, add,
automate, or fix the loop. This skill grants no authority to install
dependencies, commit, push, deploy, change production state, access secrets, or
write to external systems. Preserve unrelated work and inspect repository
instructions and dirty state before making changes.

## Select one representative loop

Treat an application as having several inner loops rather than one universal
loop:

- bootstrap to first successful run;
- edit to focused feedback;
- edit to integrated application validation;
- UI change to browser-visible proof;
- failure to useful diagnosis; and
- dirty or failed state to a clean retry.

Select the loop that matches the user's task. Anchor it in one representative
change or behavior. If the user supplies none, infer the most common path from
repository evidence, state the assumption, and prefer the edit-to-focused-check
loop. Do not survey every workflow at equal depth.

Define the objective as a concrete transition:

```text
Starting state -> developer or agent actions -> trustworthy evidence -> retry state
```

## Establish evidence

1. Read repository instructions before evaluating the workflow.
2. Inspect existing task runners, scripts, tests, fixtures, local-service setup,
   CI commands, health checks, logs, and cleanup paths.
3. Reconstruct the real workflow from executable sources and observed behavior;
   use prose documentation as supporting evidence, not sole proof.
4. Run the smallest safe existing commands needed to confirm the path.
5. Record exact prerequisites, commands, manual actions, waits, state mutations,
   outputs, failure signals, and cleanup.
6. Label facts as observed, repository-derived, user-reported, or inferred.
7. Measure repeated or noisy timing claims more than once. Do not invent timing
   estimates when measurement is unavailable.

Before running a command that may install dependencies, publish artifacts,
start persistent services, or mutate shared or external state, inspect its
contract and use a documented no-write or dry-run mode. Otherwise skip it and
label that proof tier unverified. Put necessary fixtures in a unique run-owned
temporary directory and remove them before reporting unless retention was
requested. Never clean an unverified or broadly resolved path.

Prefer current local evidence over historical CI results. Do not call a fast
unit check proof of integrated or user-visible behavior.

Classify evidence by what it actually proves: structural validation,
repository-wide checks, installer or discovery behavior, integrated runtime,
and user-visible acceptance. When validation surfaces disagree, report the
exact commands and resolve the conflict at the narrowest shared claim; do not
let one passing tier erase a failure in another.

## Map the current loop

Trace these stages when they apply:

```text
orient -> prepare -> change -> exercise -> observe -> validate -> recover
```

Capture the current path in a table:

```text
stage | action or command | manual decision | wait | mutable state | evidence or failure signal
```

Count hands-on actions separately from elapsed waiting. Note context switches
such as changing terminals, opening a browser, copying identifiers, polling,
searching logs, editing data by hand, or remembering an undocumented sequence.

## Find friction

Look for demonstrated costs in these categories:

- **Repetition:** commands, inputs, clicks, or recovery steps repeated across
  changes.
- **Waiting:** avoidable full builds, broad tests, serial startup, polling, or
  slow reset paths.
- **Selection:** no focused way to exercise one component, test, route, record,
  or scenario.
- **State:** manual fixtures, shared ports, stale processes, persistent test
  data, non-idempotent setup, or unsafe cleanup.
- **Observation:** scattered logs, unclear readiness, swallowed root causes,
  ambiguous exit status, or no durable artifacts.
- **Knowledge:** hidden prerequisites, tribal command sequences, or important
  options discoverable only from source.
- **Variance:** order dependence, time dependence, external services, network
  calls, or nondeterministic data.
- **Agent impedance:** interactive-only tools, unbounded commands, prompts,
  unstable output, implicit credentials, broad authority, or global mutable
  state.

Tie every finding to a file, command, trace, or observed workflow. Do not emit a
generic developer-experience checklist as if it were repository evidence.

## Reuse before adding

Search for an existing capability before proposing new machinery:

- focused test selection or watch mode;
- incremental build support;
- fixture factories, seeders, or snapshots;
- task-runner recipes and composable scripts;
- local emulators or service profiles;
- readiness, health, status, and doctor commands;
- structured logs, traces, and artifact directories;
- CI validation that can be invoked locally; and
- scoped reset or cleanup operations.

Prefer exposing or composing an existing capability over adding a parallel
framework. Do not add a task runner merely to rename one command.

When ranking or implementing a concrete improvement, read only the references
that match the observed friction:

- For task runners, scripts, bootstrap, or CI parity, read
  `references/command-surfaces.md`.
- For hot reload, focused checks, or test selection, read
  `references/feedback-loops.md`.
- For fixtures, end-to-end orchestration, external dependencies, or readiness,
  read `references/scenario-harnesses.md`.
- For isolation, evidence, failure replay, or cleanup, read
  `references/run-evidence-and-recovery.md`.
- For generators or bounded automation interfaces, read
  `references/safe-automation.md`.
- For promoting a stable workflow into a project-specific agent skill, read
  `references/agent-capability-promotion.md`.

Do not load or apply unrelated references as a checklist.

## Rank opportunities by leverage

For each candidate, record:

```text
current cost | frequency | confidence gap | proposed change | expected gain | implementation cost | maintenance and risk
```

Prioritize repeated hands-on work, long waits on common paths, frequent recovery
failures, and missing evidence. Discount speculative savings, rare workflows,
large framework changes, and automation that would obscure failures.

Recommend the smallest improvement that materially changes the representative
loop. Prefer this order:

1. Eliminate an unnecessary step.
2. Make an existing focused path discoverable.
3. Compose repeated steps behind one canonical entry point.
4. Make setup, fixtures, or cleanup deterministic and idempotent.
5. Add fast and full validation tiers with explicit confidence boundaries.
6. Improve readiness, errors, logs, artifacts, and recovery.
7. Add a bounded interface designed for both people and agents.

Before recommending a pattern, answer:

1. Which observed manual action, wait, failure, or confidence gap does it remove?
2. Which existing capability can it reuse?
3. What new maintenance burden and failure mode does it introduce?
4. How will the same representative scenario prove the improvement?
5. Can a smaller intervention deliver most of the gain?

Combine at most two patterns in the first implementation slice unless they are
inseparable for correctness. Reject automation whose expected maintenance cost
or authority expansion outweighs the demonstrated loop improvement.

## Design an agent-operable contract

Define each proposed command or tool explicitly:

```text
Purpose:
Inputs and scope:
Prerequisites:
Timeout:
Side effects:
Success output and exit status:
Failure output and exit status:
Artifacts and logs:
Isolation:
Cleanup and retry:
```

Favor interfaces that are:

- non-interactive or explicitly selectable as non-interactive;
- deterministic, idempotent, and safe to rerun;
- targetable to one test, component, route, record, or scenario;
- bounded by timeouts and finite retries that preserve the earliest cause;
- explicit about readiness rather than dependent on blind sleeps;
- isolated with per-run ports, namespaces, directories, or identifiers when
  concurrent work is plausible;
- consistent in stdout, stderr, exit codes, and artifact locations;
- optionally machine-readable when parsing is a repeated need;
- scoped in cleanup so unrelated state cannot be removed; and
- free of hard-coded user paths, secrets, production access, and implicit
  external writes.

Use role names such as setup, dev, focused check, full check, smoke, doctor,
status, and reset as concepts. Follow the repository's existing naming
conventions rather than imposing those exact command names.

## Implement the smallest useful slice

When implementation is requested:

1. Choose the highest-leverage low-risk candidate supported by evidence.
2. Reuse the repository's existing language, task runner, and abstractions.
3. Keep wrapper scripts thin and make error handling deliberate.
4. Add or update tests for meaningful script or harness behavior.
5. Make the new path discoverable through the repository's established help or
   contributor surface.
6. Preserve a broader validation path when adding a faster focused path.
7. Avoid source-architecture refactors unless they are necessary to create the
   requested seam.

Do not automate a process that cannot yet be reproduced or explained. First
make its state and failure semantics observable.

## Evaluate agent capability promotion

Always evaluate a proven tooling improvement for promotion into a
project-specific agent skill. Create or extend that skill only when the
promotion gate in `references/agent-capability-promotion.md` passes.

Keep each layer responsible for one concern:

- The project skill owns scenario selection, authority, evidence, and recovery.
- The `justfile` owns stable, discoverable project command entry points.
- A uv-managed or native script owns substantial, testable mechanics.
- The application and its tools remain the source of behavior.

Use the `just` skill when the project uses or adopts `just`. Use the
`uv-python` skill when Python is the justified script surface. Use the
`writing-for-agents` skill to create or change the project skill. Do not install
these tools or skills unless the user authorizes that change.

Do not copy recipe bodies, script internals, or general tool documentation into
the project skill. Teach the agent when to use the project commands, how to
judge their evidence, and how to recover safely.

## Verify the resulting loop

Repeat the same representative scenario used for the baseline. Compare:

- commands and manual actions;
- hands-on time and elapsed feedback time;
- context switches;
- setup and retry reliability;
- failure diagnostic quality; and
- confidence supplied by the resulting evidence.

Exercise the success path, one relevant failure path, and cleanup or retry.
Accept a faster path only when it preserves a clearly named broader check or
provides equivalent evidence for the claimed scope.

If the result exposes a stable numeric measure and behavioral guard, use the
`hill-climbing` skill for a separately requested bounded optimization loop. Do
not turn this audit into open-ended optimization automatically.

## Report

Use this structure, omitting sections that do not apply:

```text
## Selected development loop
Representative task:
Starting state:
Trustworthy evidence:
Retry state:

## Current path
stage | action or command | manual decision | wait | state | evidence

## Friction
finding | evidence | frequency or cost | confidence impact

## Ranked opportunities
priority | improvement | expected gain | cost and risk

## Recommended slice
Current path:
Target path:
Command or tool contract:
Acceptance criteria:

## Changes and proof
Changed files:
Before:
After:
Validation:

## Agent capability promotion
Decision:
Project skill:
Command surface:
Script surface:
Skill validation:

## Residual gaps
Unverified assumptions:
Deferred opportunities:
```

Keep recommendations evidence-backed and executable. State when the current
loop is already adequate or when an automation would cost more to maintain than
the manual work it replaces.

## Examples

```text
Audit the inner loop for adding an API endpoint. Identify repeated manual work
and propose improvements, but do not modify files.
```

```text
Improve the edit-to-browser-validation loop for this application. Implement the
highest-leverage low-risk automation without adding dependencies.
```

```text
Make this repository easier for a coding agent to operate locally. Focus on
deterministic setup, focused checks, readiness, failure evidence, safe reset,
and promotion of stable workflows into a project-specific agent skill.
```
