---
name: improve-agent-harness
description: "Improve an agent harness through bounded experiments over a batch of traces or evaluations: cluster failures, classify layers, test one harness-variable hypothesis, cold-replay candidates, and require held-out or negative regression evidence. Use when recurring agent failures warrant controlled harness improvement rather than diagnosing one surprising run."
license: MIT
---

# Improve an Agent Harness

Run a bounded experiment sequence to improve a harness from a representative
batch of traces or evaluations. A harness is the agent-operating surface around
the model: instructions, context selection, tools and contracts, orchestration,
graders, memory, and retrieved skills. This skill improves that surface; it
does not treat one surprising run as a population-level defect.

## Establish the experiment contract

Before changing a harness variable, record:

```text
Target outcome and baseline batch:
Trace/evaluation provenance, privacy, and allowed use:
Failure clustering method and inclusion rule:
Layer classification:
Primary metric and acceptance threshold:
Guard metrics and prohibited regressions:
Editable harness surfaces and sole writer:
Parent and child Route Records, when applicable:
Experiment / time / cost budget:
Cold-replay environment and held-out / negative set:
Checkpoint and rollback boundary:
Human release reviewer:
Final evidence:
```

Use a batch with enough representative examples to distinguish recurring
failure from a one-off. Preserve the candidate's identity, input version, tool
availability, and evaluation configuration. If external evaluation data,
prompts, tool contracts, deployment, or release authority is missing, limit
work to authorized read-only analysis and stop before that boundary.

## Cluster before selecting a variable

For every included failure, record the trace/evaluation identity, observable
failure signature, affected task class, evidence, and confidence. Cluster only
by a shared observable signature or a tested causal hypothesis. Classify each
cluster's leading layer:

- instructions;
- context selection;
- tools or contracts;
- model routing and context forks;
- orchestration;
- graders;
- memory; or
- retrieved skills.

Keep alternate layers visible when the evidence does not discriminate them.
Choose the highest-impact cluster that fits the budget and can be evaluated
without broadening authority.

## Test one coherent hypothesis at a time

State each experiment as:

```text
Changing <one harness variable> should reduce <failure cluster> on <batch>
without worsening <guard> because <causal hypothesis>.
```

Apply the smallest candidate change within the authorized harness surface.
Replay it cold: no hidden carry-over from an interactive session, previous
memory state, cached result, altered data, or manually repaired tool result.
Evaluate the same baseline subset and an independent held-out or negative set.
The held-out or negative set must challenge the likely regression, such as a
nearby task class, safety boundary, tool-call shape, or previously successful
behavior.

When the candidate layer is `instructions` or `retrieved skills`, consult
`writing-for-agents` for the craft of the edit: pointer wording, completion
criteria, leading words, and pruning decide whether the smallest candidate is a
wording change, a disclosure move, or a deletion. It supplies craft, not
process; clustering, attribution, cold replay, and keep/discard evidence stay
with this skill.

### Test route hypotheses

When the candidate changes a model route, invoke `route-agent-models` for each
candidate. Preserve the returned Route Records with the experiment evidence.

Change one route variable at a time: provider/model, reasoning effort, service
tier, role, context fork, tool surface, or fallback. Keep task briefs,
permissions, fixtures, acceptance criteria, and child-spawn policy constant.

Measure quality separately from latency and cost. Require guard metrics for
tool correctness, authority, route mismatch, cancellation, and partial failure.
Treat silent substitution or unknown effective configuration as a discard.

## Keep or discard with evidence

Keep a candidate only when the primary threshold improves and all declared
guards hold on cold replay and held-out/negative evidence. Otherwise discard
only the experiment-owned change and record why. One candidate must not bundle
prompt edits, tool changes, evaluator changes, and orchestration changes unless
they form one inseparable harness variable; if inseparable, document why the
experiment remains attributable.

Maintain an experiment ledger:

```text
experiment | cluster | layer | hypothesis | candidate | baseline replay
cold replay | requested/effective route | held-out/negative result
guard result | keep/discard | evidence
```

Stop on the target, budget exhaustion, repeated unchanged evidence, a plateau,
invalid or unavailable evaluation, new authority, overlapping user edits, or
user cancellation. A score improvement with weaker guards or an altered grader
is a discard, not progress.

## Review before release

After the last kept candidate, produce a release-review packet with the
baseline, clusters considered, changes kept and discarded, exact replay and
held-out evidence, residual risk, rollback boundary, and required deployment
authority. A human reviewer must approve release separately. Do not deploy,
publish, modify external prompts or tools, or promote external evaluation data
under this skill unless that separate authority is explicitly granted.

## Boundary with adjacent skills

`evaluate-agent-workflow` diagnoses one agent workflow end to end and explains
where its evidence points; use it for a single surprising or unclear behavior.
`hill-climbing` optimizes one mechanical metric generally. This skill owns
batch-derived failure clusters, harness-layer classification, cold replay, and
held-out/negative regression evidence. It does not invoke those companions or
reuse their procedures as hidden execution.

## Portability

Keep the contract technology- and client-neutral. Describe models, tools,
evaluators, traces, and memory by their observable interfaces and authority;
do not assume a named framework, provider, or agent client.

## Examples

```text
Improve the harness for recurring invalid tool arguments across 40 recorded
evaluations. You may edit only tool-schema descriptions and instruction text;
use 10 held-out evaluations and stop after four experiments.
```

```text
Compare an inherited worker route with one explicit economical route. Hold the
task, context fork, tools, and acceptance rubric constant.
```

```text
Analyze a batch of long-context failures and propose bounded experiments, but
do not alter prompts, retrieved skills, or deployments.
```

## Counterexamples

- “This one answer was odd; tune the prompt” is a single-run diagnosis; first
  reproduce or evaluate it, then collect a representative batch if it recurs.
- “Raise the benchmark score by changing the grader and prompt together” loses
  attribution and weakens the oracle; preserve the evaluator and test one
  harness variable.
