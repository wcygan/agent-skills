# Proof Tiers and Oracles

Use this reference to state precisely what a check proves and to avoid replacing
target behavior with a convenient proxy.

## Proof tiers

| Tier | Strong evidence for | Does not establish by itself |
|---|---|---|
| Static | syntax, types, schemas, policy shape, dependency graph | runtime behavior or integration |
| Unit/component | local decisions, transformations, invariants | wiring, external semantics, packaging |
| Contract | request/response, event, schema, compatibility at one boundary | complete workflow or live dependency behavior |
| Integration | selected real components and their coordination | user journey or target-platform packaging |
| State/workflow | durable transitions, retries, migration, resume | presentation or external effect unless asserted |
| Scenario/E2E | integrated behavior in a named environment | other environments, scale, or recovery not exercised |
| Browser/device | user-visible interaction and presentation | authoritative persistence unless checked separately |
| Packaged target | built artifact and native/platform integration | production topology or operational readiness |
| Operational | deployment, telemetry, failure response, recovery | business correctness not asserted by the scenario |

Choose tiers that cover distinct risks. More tiers do not automatically create
more confidence.

## Oracle patterns

### Structural oracle

Assert a parsed schema, configuration, graph, or artifact property. Prefer
semantic parsing over text matching.

### State oracle

Query the authoritative owner after the operation. Include identity, version,
terminal status, and absence of prohibited duplicates or partial state.

### Protocol oracle

Assert status, headers or metadata, payload semantics, error classification,
and compatibility behavior at a public boundary.

### Side-effect oracle

Observe the actual authorized sink, not only the intent to call it. Where live
effects are unsafe, assert against an isolated fake and label the live boundary
unverified.

### User-visible oracle

Assert meaningful rendered state and interaction behavior. Pair it with a state
oracle when the UI claims persistence or completion.

### Recovery oracle

Assert both restored service and correct durable state after retry, restart,
rollback, or compensation. “Process is running” is insufficient.

### Independent oracle

Use an evaluator, fixture, policy, or acceptance path the candidate producer
cannot silently weaken. Bind it to the exact candidate inputs and artifact.

## Weak proxies

- command exit zero without meaningful assertions;
- snapshot existence without semantic inspection;
- log emission instead of committed outcome;
- mock success instead of real integration;
- current process health instead of user-visible recovery;
- source build instead of packaged target behavior;
- producer tests as the only evidence for an untrusted candidate; and
- historical evidence for a different commit, dependency set, or artifact.

## Negative controls

A high-value strategy demonstrates that its oracle can reject a known nearby
defect. Use a safe mutation, fixture variation, counterexample schedule, or
recorded failing candidate. Do not weaken production code or retain deliberate
defects merely to create a negative control.
