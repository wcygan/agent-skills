---
name: route-agent-models
description: Select and verify one agent model route. Cover provider, model, reasoning effort, service tier, role, context fork, tools, permissions, and fallback. Use before heterogeneous dispatch, route changes, route comparisons, inheritance diagnosis, unsupported-route diagnosis, or route receipt design.
license: MIT
metadata:
  author: William Cygan
  version: "0.1.0"
---

# Route Agent Models

Select one evidence-backed agent route. Return one **Route Record** before the
route controls dispatch, comparison, or acceptance.

This skill selects configuration. It does not authorize delegation, tools,
file changes, external effects, or publication.

## Preserve authority

Treat route selection and verification as read-only. Dispatch only when the
user or an owning workflow authorizes delegation.

Keep the parent workflow's authority ceiling. A model change cannot add tools,
permissions, credentials, external effects, or child-spawn authority.

Inspect repository instructions and current runtime state. Preserve unrelated
work. Stop when route verification needs a new external effect.

## Define the task contract

Record:

- worker outcome and acceptance evidence;
- task risk and complexity;
- required context and maximum context exposure;
- required tools, permissions, credentials, and data boundary;
- latency, cost, and service-tier constraints;
- final integration and acceptance owner;
- child-spawn policy: `leaf` or explicitly bounded descendants; and
- fallback policy and stop condition.

The contract is complete when each requirement can reject an unsuitable route.

## Discover the live route surface

Inspect the active runtime, tool schema, model catalog, and current parent
configuration. Record:

- parent provider, model, reasoning effort, service tier, and agent role;
- available child models and compatible multi-agent backends;
- supported reasoning levels and service tiers for each candidate;
- available roles and how the runtime selects them;
- context-fork modes and their inheritance rules;
- child tools, permissions, credentials, and approval behavior; and
- concurrency, cancellation, and child-spawn limits.

Treat missing fields as `unknown`. Use current runtime evidence instead of a
cached model list or an earlier task's aliases.

## Separate identity, role, route, and context

Keep these choices distinct:

- **Task identity:** names the child work and its evidence.
- **Agent role:** selects instructions or a configured worker profile.
- **Model route:** selects provider, model, reasoning effort, and service tier.
- **Context fork:** selects how much parent history the child receives.

Treat a full-history fork as inherited configuration unless the runtime proves
that overrides are compatible. Use a fresh or explicit partial fork for a
heterogeneous route when the runtime supports it.

Give a fresh-context child an exact brief. Include its outcome, evidence,
authority, owned scope, dependencies, preservation rule, and stop conditions.

Use `leaf` by default. Permit descendants only when the owning workflow defines
their bound, authority, accounting, and integration behavior.

## Select the route by risk

Choose the smallest capable route:

- Use the strongest proven route for integration, contract decisions, and
  final acceptance.
- Use a fast, economical route for bounded read-only or mechanical work.
- Use a specialist route only when the task needs its supported capability.
- Use inheritance only after the parent route satisfies the worker contract.
- Escalate after evidence shows that the current route cannot meet acceptance.

Select one route per worker task. Split tasks when one route cannot satisfy all
requirements without excessive context, cost, or authority.

## Verify compatibility

Verify every selected route against:

- exact provider and model availability;
- active multi-agent backend compatibility;
- supported reasoning effort and service tier;
- required tool schemas and tool-choice controls;
- permissions, credentials, approvals, and data access;
- context-fork and role-selection rules;
- concurrency, cancellation, and child-spawn limits; and
- fallback behavior.

Define one explicit fallback or return `blocked`. A fallback must preserve the
same acceptance, authority, data, and tool contracts.

## Probe a new route

Before a new route performs mutating work, run a bounded harmless probe. Verify:

1. dispatch succeeds;
2. the effective route matches the request;
3. required read-only tool access works;
4. result transport preserves identity and evidence;
5. unsupported settings return clear errors; and
6. cancellation reaches a distinguishable terminal state.

Use a no-tool probe when tool access is not part of the task contract. Never
create an external effect only to prove routing.

Read `references/route-record.md` before dispatch, route comparison, evaluation,
or acceptance. Use its Route Record, capability matrix, and probe matrix.

## Accept the effective route

Compare requested, resolved, and effective configuration. Use runtime receipts,
events, or configuration evidence. Do not accept a worker's prose claim as the
sole route proof.

Return `route_mismatch` when the effective route differs without an authorized
fallback. Return `blocked` when compatibility or proof remains unknown.

## Report

Return exactly one status:

```text
route_ready | inherited_route_ready | route_mismatch | blocked
```

Report:

1. task contract and risk;
2. requested, resolved, and effective route;
3. role and context-fork choice;
4. tool, permission, and backend compatibility;
5. probe evidence;
6. fallback or blocker;
7. child-spawn policy; and
8. Route Record location or inline record.

## Examples and counterexamples

**Example:** Route independent repository searches to a fast worker. Keep final
integration on the stronger parent. Record both effective routes.

**Example:** Use a fresh-context specialist because its model differs from the
parent. Give it a bounded brief and leaf policy.

**Counterexample:** A cheaper model name alone does not prove tool, backend, or
reasoning compatibility.

**Counterexample:** A successful child answer does not prove the requested model
ran or that cancellation and failures work.
