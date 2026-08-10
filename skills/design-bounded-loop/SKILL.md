---
name: design-bounded-loop
description: "Design or audit a bounded feedback loop before it runs: define an outcome, authoritative observation, baseline, bounded action, authority, sole writer, evaluator, progress, checkpoint, state, budgets, terminal conditions, escalation, wakeup, and final evidence. Use when planning or reviewing a monitoring, repair, research, optimization, or supervisory loop without executing it."
license: MIT
---

# Design a Bounded Loop

Produce a decision-ready **Loop Contract** for one proposed loop. This is a
read-only design and audit workflow: it defines what a future authorized run
would need; it neither starts that run nor grants its actions.

## Set the boundary

Use this skill for a repeated observe-decide-act-verify proposal or audit. Keep
the design distinct from the run:

- A design names authority, measurements, safeguards, and terminal evidence.
- A run consumes an accepted contract under separately granted authority.

Inspect the request, applicable instructions, and available state sources
read-only. Stop for direction when a missing decision would change outcome,
authority, evaluator, state location, budget, or external effect. A Loop
Contract is task analysis, not a request to create an automation, goal, job,
schedule, commit, message, deployment, or external write.

## Build one Loop Contract

Co-locate each decision with the evidence or assumption that supports it. Fill
every field; use `unknown — decision required` rather than guessing.

```text
Outcome:
Observable source and owner:
Baseline and observation method:
Unit of action:
Allowed authority:
Forbidden authority:
Sole writer:
Evaluator and authoritative oracle:
Progress rule:
Checkpoint and rollback boundary:
State location: task_only | approved_path
Iteration / poll budget:
Time / cost budget:
Success:
Terminal failure:
Plateau / no-progress rule:
Escalate when:
Wakeup mechanism:
Final evidence:
```

The observable source must be capable of distinguishing the declared terminal
states. A dashboard, report, test, log, record, or user-visible surface is
evidence only for the state it directly observes. Define the baseline before
the first future action; for a noisy measure, name sample count, aggregation,
and meaningful-change tolerance.

Make the unit of action smallest coherent change, query, handoff, or poll.
Name one sole writer for every mutable boundary. A verifier may be independent,
but it does not obtain mutation authority by evaluating a candidate.

## Make continuation falsifiable

Define progress as a condition visible in the evaluator's evidence, such as a
closed acceptance criterion, a metric movement beyond tolerance, a reduced
finite queue, an eliminated hypothesis, or a meaningful state transition.
Activity, elapsed time, and a worker report are not progress by themselves.

Specify, before running, all stop predicates:

- success evidence and terminal-failure evidence;
- budget exhaustion;
- repeated identical evidence, a failed evaluator, or a plateau;
- loss of the authoritative source or access;
- overlapping user changes within the checkpoint boundary;
- a next action requiring new authority; and
- no supported cross-turn wakeup mechanism.

The checkpoint restores only work owned by the future loop. If safe scoped
rollback cannot be named, design a read-only or isolated future run instead.
State what must be preserved on interruption: the last normalized observation,
decision, budget consumption, and final or next-evidence handoff.

## Audit an existing proposal

Review the proposal against the same contract. Mark each field `present`,
`ambiguous`, `unsafe`, or `missing`, with a concrete consequence. Reject a
proposal that relies on an implicit writer, unverifiable progress, unbounded
continuation, broad rollback, silently expanded authority, or a promised wakeup
that no supported capability can deliver.

## Select the next workflow without borrowing it

This skill owns only the Loop Contract. Name a companion only when its trigger
matches, and hand it the bounded fields it needs:

- `hill-climbing`: a numeric metric, tolerance, behavioral guard, and
  authorized optimization experiments are already chosen.
- `verify-and-revise`: one authorized artifact has a fixed acceptance rubric
  or oracle and needs producer/verifier revisions.
- `monitor-until`: one authoritative source needs a strictly read-only watch.
- `improve-agent-harness`: a batch of agent traces or evaluations needs
  controlled harness experiments.

Do not invoke a companion or carry out its procedure in this design run. Those
skills own their artifacts and execution decisions; this contract supplies
their entry boundary, not a hidden mandate to mutate.

## Report

Return the Loop Contract and assumptions. When auditing, also return the audit
findings. End with one of: `ready for separately authorized run`, `needs a
named decision`, or `not safely loopable`. Completion requires every contract
field to be either resolved or explicitly blocked, plus final evidence that can
distinguish the declared terminal states.

## Examples

```text
Design a bounded loop to reduce a flaky-test reproduction rate. Do not run it.
```

```text
Audit this proposed incident watcher: it polls a service status endpoint until
the recovery state appears, then sends a handoff to the on-call owner.
```

## Counterexamples

- “Keep trying fixes until it works” lacks an outcome, evaluator, budget, and
  rollback boundary; turn it into a contract before any repair.
- “Watch this forever and restart it when unhealthy” combines monitoring with
  repair and lacks a terminal condition; design distinct authorized workflows.
