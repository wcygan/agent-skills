# Multi-agent routing evaluation

Use this reference when model routing, inheritance, context forks, or child
lifecycle behavior affects the evaluated claim.

## Bind the routing candidate

Record one Route Record from `route-agent-models` for each parent and child
configuration. Bind:

- parent and child identities;
- requested, resolved, and effective provider/model routes;
- reasoning effort and service tier;
- agent role and context-fork mode;
- inherited fields and authorized fallback;
- multi-agent backend and feature flags;
- advertised tools, schemas, permissions, and approvals;
- child-spawn policy and concurrency limit; and
- prompt, task brief, fixture, and acceptance criteria.

Two runs are comparable only when every uncontrolled field remains constant.

## Standard routing matrix

```text
| Case | Input route | Required assertion | Prohibited outcome | Receipt |
|------|-------------|--------------------|--------------------|---------|
| Inherited default | Omit child override | Documented parent fields resolve on child | Unknown silent default | Route Record |
| Explicit route | Supported child override | Effective route matches request | Silent inheritance or substitution | Route Record |
| Unsupported model | Invalid or incompatible model | Clear pre-work error | Partial child work | Dispatch error |
| Unsupported effort | Invalid effort for model | Clear pre-work error | Effort coercion | Dispatch error |
| Fork conflict | Override with incompatible fork | Contractual error or supported resolution | Hidden context or route change | Route and fork receipt |
| Tool mismatch | Route lacks required tool | Dispatch blocks or task fails closed | Fabricated tool success | Tool catalog and result |
| Child failure | Controlled child failure | Parent applies declared failure policy | Unmarked success | Parent/child terminal events |
| Cancellation | Controlled cancellable child | Distinct cancellation states | Ambiguous success or orphan | Lifecycle events |
| Partial fanout | One child fails or times out | Declared join policy executes | Infinite wait or lost child | Child accounting ledger |
| Synthesis | Conflicting bounded child results | Parent preserves provenance and acceptance rule | Unsupported merge | Integration receipt |
```

Select only cases that discriminate the target behavior. Keep one integrated
case when the user-visible claim crosses route, child, and parent boundaries.

## Receipt contract

```text
Case and attempt ID:
Parent and child IDs:
Requested route:
Resolved route:
Effective route:
Role and context fork:
Inherited fields:
Tool schema and permissions:
Dispatch result:
Child terminal state:
Parent terminal or join state:
Fallback:
Assertion and oracle:
Failure artifact:
```

Use structured runtime evidence. A child's natural-language model claim is not
an authoritative route receipt.

## Deterministic controls

- Use fixed task briefs and scrubbed fixtures.
- Isolate cancellation and failure injection.
- Bound child count, trials, time, and cost.
- Keep evaluator retries separate from worker retries.
- Preserve out-of-order completion evidence.
- Test route resolution separately from answer quality.
- Keep hidden reasoning outside the oracle.
