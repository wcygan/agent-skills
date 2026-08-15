# Route record and probe templates

Use these templates when an agent route controls dispatch, comparison,
evaluation, or acceptance. Record supported evidence, and mark unknown fields.

## Route Record

```text
Route Record ID:
Recorded at:
Task identity and outcome:
Acceptance evidence:
Task risk:

Parent:
- Agent / thread ID:
- Provider and model:
- Reasoning effort:
- Service tier:
- Agent role:
- Multi-agent backend:

Requested child route:
- Agent / thread ID:
- Agent role:
- Provider and model:
- Reasoning effort:
- Service tier:
- Context-fork mode:
- Task name:
- Child-spawn policy:

Resolved child route:
- Provider and model:
- Reasoning effort:
- Service tier:
- Inherited fields:
- Applied role:
- Context-fork mode:
- Multi-agent backend:

Effective child route:
- Provider and model:
- Reasoning effort:
- Service tier:
- Applied role:
- Context received:
- Multi-agent backend:
- Evidence source:

Capability:
- Required and advertised tools:
- Tool schema identity:
- Permissions and approvals:
- Credentials and data boundary:
- Concurrency and cancellation limits:

Fallback:
- Trigger:
- Route:
- Preserved contracts:
- Authority:

Probe evidence:
- Dispatch:
- Route identity:
- Tool access:
- Result transport:
- Error behavior:
- Cancellation:

Status: route_ready | inherited_route_ready | route_mismatch | blocked
Blocker or residual risk:
```

## Capability matrix

```text
| Route | Backend | Efforts | Service tiers | Required tools | Fork modes | Child policy | Evidence | State |
|-------|---------|---------|---------------|----------------|------------|--------------|----------|-------|
|       |         |         |               |                |            |              |          |       |
```

Use `supported`, `unsupported`, or `unknown` for each material capability. Do
not convert a picker-visible model into dispatch support without runtime proof.

## Probe matrix

```text
| Probe | Input | Expected receipt | Prohibited outcome | Bound | Result |
|-------|-------|------------------|--------------------|-------|--------|
| Dispatch | Exact fixed reply | Child identity and terminal state | External effect | One attempt | |
| Route identity | Explicit or inherited route | Effective configuration | Silent substitution | One attempt | |
| Tool access | Harmless required read | Tool result and child identity | Undeclared tool | One call | |
| Unsupported setting | Invalid model, effort, or tier | Clear pre-work error | Partial child work | One attempt | |
| Result transport | Bounded structured result | Parent receives matching child evidence | Lost identity | One attempt | |
| Cancellation | Controllable wait fixture | Distinct cancelled state | Ambiguous success | One attempt | |
```

Use an isolated fixture for cancellation. Do not cancel shared or external
work only to complete this matrix.

## Comparison ledger

```text
| Task | Candidate route | Held constant | Intended change | Quality | Latency | Cost | Guard result | Decision |
|------|-----------------|---------------|-----------------|---------|---------|------|--------------|----------|
|      |                 |               |                 |         |         |      |              |          |
```

Compare equivalent task, context, tools, permissions, prompts, fixtures, and
acceptance criteria. Treat any other change as a new candidate.
