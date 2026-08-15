# Agent Evidence Model

Use this reference to classify artifacts and find the earliest divergence in an
agent workflow.

## Evidence classes

- **Observed:** captured from the evaluated run or current authorized state.
- **Verified:** established directly in executable source or configuration.
- **Declared:** promised by documentation, schema, prompt, or test name.
- **Inferred:** supported indirectly but not demonstrated.
- **Unknown:** absent, inaccessible, ambiguous, or removed by retention.

Configuration declares what should happen. A request or transcript shows what
was exchanged. Durable events show what was retained. A projection shows what a
consumer derived. None substitutes automatically for the others.

## Layer model

| Layer | Questions | Useful artifacts | Common divergence |
|---|---|---|---|
| Instructions | What behavior and boundaries were effective? | system/developer instructions, prompt assembly, policy version | stale or conflicting instruction |
| Input | What did the application actually send? | normalized request, attachments, context selection, truncation logs | omitted or transformed requirement |
| Runtime | Which parent and child controls executed? | effective provider/model IDs, efforts, tiers, flags, backends, request IDs | silent fallback or mixed configuration |
| Routing | How did the child route resolve? | Route Record, requested/resolved route, role, context fork, inheritance, fallback | rejected override, wrong inheritance, incompatible fork, silent substitution |
| Capability | What could the model select? | advertised tool list, JSON schemas, auth/availability state | missing, permissive, stale, or reordered tool |
| Decision | What did the model emit? | response items, finish reason, tool name and arguments | no selection, wrong selection, invalid arguments |
| Execution | What did the tool or dependency do? | validated input, output, status, stderr, timing, side effects | rejected call, partial result, downstream failure |
| Orchestration | How was the turn advanced? | routing events, retry/cancel decisions, attempt IDs, state assembly | duplicate, dropped, reordered, or stale step |
| Retention | What became durable? | event stream, workflow history, database rows, audit records | lost event or ambiguous identity |
| Projection | What did consumers derive? | reducers, queries, caches, API envelopes | stale or lossy projection |
| Presentation | What did the user see? | UI state, transcript, links, screenshots | hidden, mislabeled, or malformed output |
| Evaluation | What was judged? | dataset, grader, assertions, thresholds | circular or irrelevant oracle |

## Identity and sequence

Track identities explicitly:

- session, conversation, turn, response, and response-item IDs;
- parent and child thread, task, role, and Route Record IDs;
- tool-call and tool-result IDs;
- workflow, run, activity, task, and attempt IDs;
- persisted event sequence or revision;
- projection version and cache key; and
- request IDs from model providers and external dependencies.

A shared business identifier does not prove two records are the same attempt.
Timestamp proximity does not prove causal order.

## Divergence ledger

Use one row per relevant transition:

```text
layer | expected contract | observed artifact | evidence class | divergence | consequence
```

Stop assigning primary cause once the earliest supported divergence is found,
but continue far enough to identify later amplification or presentation defects.

## Evidence collection cautions

- Preserve raw order and distinguish ingestion time from event time.
- Record truncation, redaction, sampling, and retention limitations.
- Avoid copying full prompts or tool payloads when a hash, field list, or
  redacted excerpt proves the claim.
- Treat UI envelopes and durable state as separate evidence surfaces.
- Treat a mocked tool result as proof of orchestration behavior, not proof of
  the live external dependency.
- Treat a passing transcript snapshot as presentation proof, not necessarily
  proof of durable state or side effects.
