# Invariants and Checkpoints

Use this reference to define what the refactor preserves and what makes each
intermediate state safe.

## Contents

- Invariant categories
- Baseline evidence
- Characterization
- Slice contract
- Validation tiers
- Rollback
- Stop conditions
- Completion and cleanup

## Invariant categories

Consider only categories relevant to the transformation:

- **Functional:** inputs, outputs, errors, defaults, and side effects.
- **Contract:** API, event, schema, file, CLI, and serialization behavior.
- **State:** authority, transactions, uniqueness, consistency, and retention.
- **Temporal:** ordering, retries, idempotency, timeouts, and scheduling.
- **Security:** identity, authorization, isolation, and sensitive-data flow.
- **Lifecycle:** startup, shutdown, cleanup, cancellation, and recovery.
- **Operational:** logs, metrics, traces, alerts, configuration, and ownership.
- **Performance:** latency, throughput, capacity, or resource budgets that are
  contractual rather than aspirational.

Write invariants as observable claims. “Works as before” is not an invariant.

## Baseline evidence

For each invariant, identify current proof:

| Invariant | Current evidence | Confidence | Gap |
|---|---|---|---|
| claim | test, trace, contract, state, or observation | observed, verified, declared, inferred, unknown | missing proof |

Do not add characterization for every implementation detail. Preserve behavior
that consumers, operators, data, or documented contracts depend on.

## Characterization

Add or propose characterization when:

- behavior is real but weakly specified;
- errors, ordering, or side effects can drift during movement;
- generated snapshots or fixtures encode a stable public result;
- old and new implementations need equivalence comparison; or
- production evidence reveals a contract absent from tests.

Characterization is a temporary description of current behavior, not an
endorsement of every quirk. Mark undesirable behavior for a later intentional
change rather than silently fixing it during the refactor.

## Slice contract

Each slice should record:

| Field | Question |
|---|---|
| starting state | what exact architecture and compatibility exists? |
| change | what one structural responsibility moves? |
| invariant | what must remain true? |
| proof | which focused and broader evidence verifies it? |
| transient state | what duplication or compatibility is introduced? |
| rollback | what restores the starting state and can it read new state? |
| stop | which observation prevents continuation? |
| resulting state | what is now authoritative and supported? |

Avoid slices defined only by elapsed time or file count.

## Validation tiers

Select evidence proportional to the claim:

- static and structural checks for names, dependency direction, and generated
  consistency;
- focused tests for local contracts and error behavior;
- integration or contract tests for boundary compatibility;
- end-to-end scenarios for public behavior and side effects;
- migration or replay fixtures for old and new state;
- concurrency or recovery scenarios for ordering and durability; and
- runtime observability for staged routing or independently deployed changes.

A passing unit suite does not prove mixed-version or durable-state safety. A
successful deployment does not prove behavioral equivalence.

## Rollback

Rollback is valid only when the prior structure can interpret all state and
contracts produced by the slice. Record:

- code and configuration reversal;
- data or event compatibility;
- queued and long-running work;
- cache and projection state;
- external effects that cannot be undone; and
- forward-fix conditions when reversal is unsafe.

“Revert the commit” is not a complete rollback plan for stateful or deployed
changes.

## Stop conditions

Stop the sequence when:

- an invariant fails;
- current state differs from the plan;
- an unknown consumer or owner becomes material;
- rollback cannot interpret newly written state;
- the slice requires an unapproved behavior or authority change;
- validation cannot distinguish old and new behavior;
- temporary architecture lacks safe ownership; or
- unrelated dirty work overlaps the planned files or responsibility.

Update the plan from evidence rather than continuing to preserve momentum.

## Completion and cleanup

A refactor is complete when:

- target ownership and dependency direction are authoritative;
- all callers and persisted forms use supported contracts;
- temporary routing, flags, adapters, and dual paths meet removal criteria;
- old implementation and dead compatibility are removed;
- generated outputs and documentation match their sources;
- validation covers preserved invariants at the required tiers; and
- no operational or rollback procedure refers to the obsolete structure.

Do not remove compatibility merely because the new code exists. Prove that the
coexistence window and retained-state obligations have closed.
