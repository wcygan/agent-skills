---
name: identify-hill-climbing-opportunities
description: >-
  Identify and rank hill-climbing opportunities by connecting desired outcomes
  to numeric target, driver, and guard metrics, measurement methods, and
  editable levers. Use when a codebase, system, deployment pipeline, or
  developer experience should improve, but the metric or causal neighborhood
  remains unclear. Produce a read-only Metric Opportunity Map and one
  Hill-Climbing Target Brief, or explain why no safe target is ready.
license: MIT
metadata:
  author: William Cygan
  version: "0.1.0"
---

# Identify Hill-Climbing Opportunities

Turn a broad improvement goal into ranked metric opportunities and one
decision-ready target. Stop before changing the system.

This skill owns discovery before `hill-climbing`. The execution skill owns
experiments only after the user approves a complete target contract.

## Keep the discovery read-only

- Inspect source, configuration, tests, benchmarks, task runners, and existing
  evidence.
- Use existing, user-authorized telemetry only through read-only queries.
- Inspect a command before running it. Prefer a documented no-write mode.
- Run bounded local measurements only when their side effects are understood.
- Put run-owned caches and artifacts in a unique temporary directory.
- Preserve shared caches. Model cold state with an isolated cache directory.
- Report a measurement plan when safe measurement is unavailable.
- Stop before source edits, instrumentation changes, dependency installation,
  deployments, production traffic, or external writes.
- Do not commit, push, publish, or grant authority to a later workflow.

## Frame one outcome

Record this frame before collecting metrics:

```text
Desired outcome:
Beneficiary:
Scenario:
Environment:
Workload or input set:
Scope:
Editable surfaces:
External constraints:
Time and cost budget:
Available evidence:
```

Define one representative scenario. Separate environments or workloads when
their behavior differs materially.

Treat cold and warm states as different scenarios. Do not combine their
samples into one baseline.

Complete this step when the outcome, scenario, and control boundary are clear.
Ask for one missing decision when it can change the selected metric.

## Inventory metric candidates

Search for current measures before inventing new ones:

- tests, benchmarks, evaluators, and coverage reports;
- build, test, deployment, and task-runner commands;
- service-level objectives, dashboards, alerts, and telemetry queries;
- traces, profiles, logs, workflow histories, and incident evidence;
- resource, cost, capacity, and queue reports; and
- product or quality measures with stable definitions.

Label each claim as `observed`, `verified`, `declared`, `inferred`, or
`unknown`. Source proves possible behavior. Current measurements prove only the
measured scenario.

Classify every candidate by one role:

- **Outcome:** represents value for a user, developer, operator, or system.
- **Target:** supplies the numeric objective for one optimization loop.
- **Driver:** helps explain target movement or locates a useful lever.
- **Guard:** detects an unacceptable regression while the target improves.
- **Context:** segments the workload or exposes a confounding condition.

A measure can have different roles for different goals. Record its role for
the current opportunity.

Use `references/opportunity-lenses.md` when the search is broad or a driver map
needs domain examples. Use its lenses as prompts, not as established causes.

## Normalize each candidate

Record enough detail to compare candidates honestly:

```text
Name and role:
Outcome link:
Unit and denominator:
Direction:
Start and stop boundaries:
Workload or input set:
Environment and cache state:
Segments and percentiles:
Measurement source or command:
Aggregation and sample count:
Expected noise and tolerance:
Measurement time and cost:
Baseline evidence:
```

Apply these rules:

- Define every rate with a numerator, denominator, and time window.
- Define every duration with exact start and stop events.
- Prefer distributions or tail percentiles when averages hide poor outcomes.
- Hold workload and input distribution stable across comparisons.
- Separate first-attempt errors from final outcomes after retries.
- Treat code coverage as executed-code evidence, not correctness proof.
- Require an explicit oracle for correctness and subjective quality.
- Choose one primary target. Preserve other important outcomes as guards.
- Avoid a composite score unless the domain already gives it stable meaning.

## Build a driver map

Map what is probably related to each viable target. Distinguish evidence from
theory.

```text
Target:
Direct components:
Demand and input drivers:
Application work:
Dependency and wait drivers:
Capacity, contention, and scheduling:
Data, cache, and retained-state drivers:
Configuration, topology, and routing:
Measurement effects:
Editable levers:
External or fixed factors:
Confounders:
Required guards:
```

Record each material relationship in this form:

```text
driver | expected direction | mechanism | evidence | confidence
diagnostic measure | editable lever | falsifying observation
```

Common knowledge can suggest a driver. It cannot establish the current cause.
Keep inferred and unknown drivers visible until evidence resolves them.

Complete the map when every major metric component has an owner, lever,
external boundary, or explicit unknown.

## Test hill-climbability

Evaluate each target against these gates:

1. **Relevant:** Movement represents the framed outcome.
2. **Numeric:** The result is parseable and has a clear direction.
3. **Repeatable:** A fixed scenario produces comparable samples.
4. **Affordable:** Measurement fits the time and cost budget.
5. **Sensitive:** Authorized editable surfaces can move the result.
6. **Controlled:** Workload, environment, and important confounders are fixed.
7. **Tolerant:** Noise and minimum meaningful change are known.
8. **Guarded:** Regressions have an independent behavioral guard.
9. **Reversible:** Candidate experiments can use a safe checkpoint boundary.

Assign one verdict:

- `ready_for_approval`;
- `needs_measurement_work`;
- `needs_outcome_or_guard`;
- `not_controllable`;
- `misleading_proxy`; or
- `route_elsewhere`.

Do not hide a failed gate with an opportunity score. Rank ready candidates by
outcome value, evidence, expected leverage, feedback cost, and risk.

## Select one target

Recommend one target only when it passes every gate. Explain why it is better
than the nearest candidate.

Prepare this handoff without starting the optimization loop:

```text
Goal:
Scenario and workload:
Scope and editable surfaces:
Metric:
Direction: higher_is_better | lower_is_better
Measure:
Environment and cache state:
Aggregation:
Tolerance:
Guard:
Target:
Baseline evidence:
Candidate neighborhoods:
Excluded levers and external factors:
Likely drivers and confidence:
Checkpoint recommendation:
Unresolved decisions or authority:
Readiness: ready_for_approval
```

If no candidate passes, return the highest-value prerequisite. Examples include
a stable workload, a correctness oracle, a safe measure, or missing signals.

## Keep adjacent skill boundaries clear

- Use `hill-climbing` after explicit approval of the target and experiment
  authority.
- Use `improve-development-loop` to redesign or implement a repeated developer
  workflow.
- Use `trace-codepath` when one runtime path needs a detailed source trace.
- Use `audit-observability-path` when missing signals block measurement or
  attribution.
- Use `design-verification-strategy` when the guard or correctness oracle needs
  a broader proof design.
- Use `design-bounded-loop` when the future loop needs a general control
  contract beyond metric selection.

Recommend the next skill and pass a bounded artifact. Do not borrow its
authority during this discovery.

## Report

Return this structure:

```markdown
## Opportunity frame

## Evidence boundary

## Metric inventory

| Candidate | Role | Definition | Source | Evidence | Confidence |
|---|---|---|---|---|---|

## Driver maps

## Ranked opportunities

| Rank | Target | Outcome value | Measure readiness | Leverage | Cost | Risk | Verdict |
|---|---|---|---|---|---|---|---|

## Recommended Hill-Climbing Target Brief

## Residual gaps and next handoff
```

The report is complete when it contains one `ready_for_approval` target or an
evidence-backed reason that no safe target is ready.

## Examples

```text
Find hill-climbing opportunities for checkout API performance. Include
application work, dependency time, traffic shape, and capacity. Do not edit.
```

```text
Compare developer experience metrics for cold first deploy, hot redeploy,
deployment duration, code coverage, and edit-to-feedback time.
```

```text
We want fewer workflow failures. Identify a measurable target, likely drivers,
and guards before we authorize experiments.
```

## Counterexamples

- “Reduce p95 latency with this benchmark and guard” already supplies a target;
  use `hill-climbing`.
- “Implement a faster local deployment command” requests a developer-loop
  change; use `improve-development-loop`.
- “Prove this feature is correct” requests a verification strategy, not metric
  discovery.
