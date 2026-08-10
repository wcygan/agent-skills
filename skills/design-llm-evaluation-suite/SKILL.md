---
name: design-llm-evaluation-suite
description: Design a regression-oriented evaluation suite for an LLM, RAG pipeline, tool-using agent, or multi-agent workflow by defining behavioral cases, datasets, deterministic and model-graded oracles, trace or receipt requirements, stochastic thresholds, framework selection, CI tiers, and retained evidence. Use when deciding what LLM or agent evals to add, choosing an evaluation harness for Python, Rust, TypeScript, or an HTTP service, preparing a prompt, model, tool, or orchestration migration, or explicitly implementing an eval harness; remain read-only unless implementation is requested.
license: MIT
metadata:
  author: William Cygan
  version: "0.1.0"
---

# Design an LLM Evaluation Suite

Turn one bounded LLM or agent quality target into an **LLM Evaluation Suite
Pack**. Treat the suite as a proof system: every case must identify the
candidate, exercise a meaningful behavior, use the lowest reliable oracle, and
retain evidence that explains failure.

## Preserve the authority boundary

Treat requests to design, assess, compare, or recommend evals as read-only.
Inspect repository instructions, dirty state, existing tests, evals, fixtures,
CI, runtime topology, prompts, tool contracts, and trace schemas before
proposing new machinery.

Implement only when the user explicitly asks to add, build, or integrate the
suite. Implementation authority may cover project-local eval code,
configuration, scrubbed fixtures, documentation, and pinned development
dependencies inside the authorized repository. It does not include production
traffic, cloud synchronization, shared-result publication, red-team execution,
or external writes.

External model or grader calls need an explicit data, credential, cost, and
timeout boundary. Prefer local-only runs and recorded artifacts when they prove
the claim. Never enable a platform login, upload, sharing flag, or telemetry
export merely to complete setup. Preserve unrelated work and stop when the
target path overlaps unowned changes.

## Route the right job

Establish ownership before designing cases:

| Dominant request | Owner |
|---|---|
| Explain one surprising or inconsistent agent execution | `evaluate-agent-workflow` |
| Improve prompts, tools, orchestration, memory, or graders from a representative batch | `improve-agent-harness` |
| Prove a deterministic feature, migration, integration, or release claim | `design-verification-strategy` |
| Recover missing correlation, trace, or durable-outcome evidence | `audit-observability-path` |
| Model schedule-dependent tools, subagents, retries, or cancellation | `model-concurrency` |
| Optimize an established numeric eval score under a behavioral guard | `hill-climbing`, only when explicitly invoked |
| Measure application load, throughput, CPU, memory, or backend latency | A performance-benchmark workflow, not this skill |

Continue when reusable cases must evaluate behavior that materially depends on
a model, retrieval system, tool choice, agent orchestration, or stochastic
output. Specialized adversarial red teaming is a separate authorization and
workflow even when the selected framework supports it.

Ownership is complete when the request either remains here or has one named
route and the minimum artifact needed by that route.

## Build the evaluation contract

Record this contract before selecting metrics or a framework:

```text
Decision the suite informs:
Candidate identity:
Application and assertion boundaries:
Target behaviors:
Prohibited behaviors:
Dataset source and owner:
Required traces or durable receipts:
Oracle ladder:
Stochastic claim and threshold:
Runtime, cost, data, and authority budgets:
Required gates and evidence:
Non-goals:
```

An **eval** decides whether a behavioral or quality claim is satisfied. A
**benchmark** measures a property under a controlled workload. A measurement
becomes a gate only after an acceptance threshold is attached. Keep profiling,
load testing, and optimization outside the suite unless they supply a bounded
secondary metric such as per-case latency or cost.

The evaluation contract is complete when each field is resolved or marked
`unknown — decision required` and every unknown that blocks a trustworthy run
has a stop condition.

## Inspect current evidence before adding a harness

1. Locate existing unit, integration, scenario, browser, and eval checks.
2. Identify the application boundary that can exercise the real behavior with
   the least unrelated variance.
3. Find authoritative output, tool, retrieval, workflow, persistence, and UI
   state owners.
4. Inspect current fixtures, captured failures, trace formats, task runners,
   dependency managers, CI commands, and artifact paths.
5. Record what each existing check proves and which required behavior remains
   uncovered.

Prefer extending an existing harness when it can express the evaluation
contract without weakening the oracle. A new framework must close a named gap
that repository-native tests cannot cover proportionately.

Inspection is complete when every proposed addition maps to an uncovered
behavior or evidence boundary.

## Bind candidate identity

Record all dimensions that can change the result:

- source revision and built artifact;
- prompt, instruction, template, and retrieval-data versions;
- model, provider, sampling settings, and feature flags;
- advertised tools, schemas, ordering, permissions, and availability;
- orchestration, memory, cache, retry, and session configuration;
- evaluator, grader, rubric, dependency, and framework versions; and
- operating environment and relevant external-service substitutions.

Two runs are comparable only across dimensions held constant or intentionally
varied. A prompt, tool-catalog, grader, or fixture change creates a new
candidate even when the model name is unchanged.

Candidate binding is complete when the retained run evidence can reconstruct
the evaluated configuration without relying on ambient defaults.

## Build the case matrix

Include only cases that discriminate meaningful behavior:

1. representative positive cases;
2. valid alternative phrasing or input shapes;
3. missing-information and boundary cases;
4. invalid or prohibited actions;
5. competing tools, answers, or strategies that should lose;
6. scrubbed and minimized prior regressions; and
7. held-out cases that the producer cannot silently rewrite.

For every case record:

```text
Case ID and behavior:
Starting state and input:
Expected and prohibited outcomes:
Controlled and real dependencies:
Assertion boundary:
Oracle and threshold:
Trials and tolerated variance:
Failure artifacts:
Runtime, cost, and data class:
```

Read `references/evaluation-contract.md` when defining datasets, oracles,
model graders, repeated trials, trace receipts, or held-out cases.

The matrix is complete when every target behavior has at least one positive or
negative discriminator and every prohibited behavior has an observable oracle.

## Apply the oracle ladder

Use the lowest reliable rung for each property:

1. exact structure, schema, or protocol assertion;
2. deterministic domain rule;
3. tool, argument, citation, event, or durable-state receipt;
4. reference-based semantic comparison;
5. rubric-based model grader; and
6. calibrated human judgment.

Do not ask a model grader whether a known tool name, argument, identifier,
schema, or durable side effect is correct when a mechanical assertion can
decide it. Do not use the candidate agent as its sole grader. Pin grader and
rubric identity, calibrate model-graded dimensions against reviewed examples,
and retain reasons for failures.

Use one focused component assertion to localize a defect and one higher-level
case when the user-visible claim crosses layers. A final answer cannot prove a
tool executed, a write committed, or a citation supports the claim.

Oracle selection is complete when every assertion names its rung, authoritative
evidence, threshold, and known false-pass or false-fail boundary.

## Require trace receipts only where needed

Final-output evaluation is sufficient when internal choices are not part of
the contract. Require component traces or durable receipts when the claim
depends on retrieval, tool selection, arguments, order, subagent handoff,
retry, cancellation, persistence, or terminal outcome.

Prefer standard telemetry or application-owned structured events over an
eval-only shadow model. For cross-language workflows, OpenTelemetry spans may
carry stable operation, tool, and attempt attributes. Keep hidden reasoning out
of the contract; evaluate observable decisions, actions, evidence, and state.

If required evidence cannot be correlated or reconstructed, route the bounded
gap to `audit-observability-path` and leave the affected case blocked rather
than substituting final prose.

Trace design is complete when every component assertion resolves to a stable
span, event, receipt, state owner, or explicit unavailable-evidence gap.

## Select one primary harness

Choose in this order:

1. **Existing or native harness:** select it when it satisfies the case,
   oracle, trace, artifact, and gate contracts with less maintenance.
2. **DeepEval:** prefer it for Python-native test workflows, Python-instrumented
   traces or spans, and DeepEval-specific metrics. Read
   `references/deepeval.md` only when this branch is selected or seriously
   compared.
3. **Promptfoo:** prefer it for black-box HTTP services, Rust or other
   cross-language backends, TypeScript providers, provider matrices, or
   OpenTelemetry trajectory assertions. Read `references/promptfoo.md` only
   when this branch is selected or seriously compared.
4. **Small custom adapter:** select it only when an existing test runner can
   consume the cases and neither framework adds enough value to justify a new
   runtime.

Treat the frontend language as relevant only when the frontend owns prompts,
tool orchestration, or agent state. When TypeScript only presents a Rust-owned
agent result, evaluate semantics at the backend boundary and verify rendering,
streaming, citations, and failure states with ordinary frontend checks.

Framework capabilities drift. Before recommending installation or writing
integration code, verify the current official documentation, package metadata,
runtime requirements, license, and relevant language parity. Pin the selected
version in the target repository. Use two evaluation frameworks only when they
prove distinct required claims and each has a maintenance owner.

Selection is complete when the decision record names the chosen harness,
rejected alternatives, required adapter, maintenance cost, and current source
evidence.

## Bound stochastic execution

Name the statistical claim before repeating a case. Define trials, aggregation,
sampling settings, seed support, concurrency, cache policy, retry policy,
threshold, confidence or tolerance, timeout, and cost ceiling. Record failed
attempts separately from evaluator retries; retries must not erase evidence or
quietly turn a failed case into a pass.

Test deterministic application layers separately. A repeated model success
rate cannot prove that a tool was advertised, an event persisted, or a UI
rendered. Preserve equivalent execution envelopes when comparing models,
prompts, providers, or harness changes.

Execution bounds are complete when a run has a finite trial count, time and
cost ceiling, stop behavior, and evidence retained for every failed case.

## Design proportionate gates

When CI, release, or recurring evaluation is in scope, read
`references/ci-and-evidence.md`. Prefer:

- a focused pull-request gate for cheap deterministic cases;
- a scheduled suite for broader live-model and repeated-run evidence;
- a release gate for held-out cases bound to the exact candidate; and
- explicit human review for disputed rubrics or newly mined failures.

A noisy or uncalibrated model-graded metric begins in report-only mode. Promote
it to a blocking gate only after its variance, false-failure behavior, cost,
and owner are known. Lower-tier success never overrides a required held-out or
target-environment failure.

Gate design is complete when each tier names entry state, candidate identity,
cases, threshold, budget, artifacts, stop conditions, and decision owner.

## Implement only under explicit authority

When implementation is requested:

1. Reuse the repository's language, dependency manager, task runner, fixtures,
   and CI conventions.
2. Add the smallest representative vertical slice: one case, its lowest
   reliable oracle, the chosen adapter, a focused command, and failure artifact.
3. Pin project-local dependencies and record any new runtime prerequisite.
4. Keep captured data scrubbed, minimal, versioned, and isolated.
5. Make external calls opt-in and bounded; keep platform login, upload, and
   sharing disabled by default.
6. Run the focused case, one meaningful failure case, and the relevant broader
   repository checks.
7. Add more cases only after the slice fails for the intended defect and
   preserves useful diagnostic evidence.

Do not weaken production contracts solely for evaluation convenience. Expose a
bounded test adapter or existing observable boundary instead.

Implementation is complete when the focused command is repeatable from a known
state, fails on a controlled counterexample, produces the promised artifact,
and leaves cleanup or retry state explicit.

## Verify and report

Confirm that:

- every target behavior maps to a discriminating case;
- every case has an assertion boundary and authoritative oracle;
- deterministic and model-graded properties are separated;
- candidate and grader identities are retained;
- trace requirements stop at observable behavior;
- stochastic claims have finite budgets and thresholds;
- framework selection is evidence-backed rather than language-matched by habit;
- external data, cost, and cloud boundaries are explicit; and
- the suite can fail for the defects it claims to detect.

Return the LLM Evaluation Suite Pack:

1. **Decision and scope**
2. **Candidate identity and application boundary**
3. **Current evidence and gaps**
4. **Dataset provenance and case matrix**
5. **Oracle ladder and trace receipts**
6. **Harness decision and rejected alternatives**
7. **Execution, variance, cost, and data contract**
8. **CI and release gates**
9. **Implementation order and validation**, when requested
10. **Unknowns, residual risk, and stop reason**

Completion requires every shortlisted behavior to have a case, oracle,
execution budget, and failure artifact, or to be explicitly blocked by a named
decision or missing evidence.

## Examples

- Design Promptfoo evals for a Rust agent API, using deterministic assertions
  for tool arguments and a calibrated rubric for answer usefulness.
- Design DeepEval tests for a Python RAG pipeline with end-to-end faithfulness
  and component-level retrieval evidence.
- Define held-out evals for a prompt, model, or tool-schema migration while
  keeping the provider envelope fixed.
- Add one bounded CI eval slice to an existing TypeScript agent harness without
  enabling cloud sharing.

## Counterexamples

- One anomalous answer needs causal diagnosis before it justifies a suite.
- A batch of stable eval failures plus permission to tune prompts belongs to
  harness improvement.
- Rust CPU profiling and HTTP saturation are application-performance work even
  when the endpoint invokes an LLM.
