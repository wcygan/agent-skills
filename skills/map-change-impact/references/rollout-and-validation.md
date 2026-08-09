# Rollout and Validation

Use this reference when an impact map must account for mixed versions,
persisted state, external consumers, or phased deployment.

## Compatibility matrix

Evaluate combinations that can exist during rollout:

| Producer or writer | Consumer or reader | Data or config | Question |
|---|---|---|---|
| old | old | old | baseline behavior |
| new | old | old or new | can old readers tolerate new output? |
| old | new | old | can new readers consume existing state? |
| new | new | old | does migration or defaulting cover old state? |
| new | new | new | intended steady state |
| rolled back old | mixed | changed | is rollback still valid? |

Include queued messages, long-running workflows, cached objects, offline
clients, and delayed jobs when they extend the coexistence window.

## Expand and contract

Prefer phases that preserve compatibility:

1. add tolerant readers or optional storage;
2. deploy code that can handle old and new forms;
3. begin new writes or dual publication;
4. backfill or migrate historical state;
5. verify adoption and correctness;
6. stop old writes;
7. remove old reads and compatibility code; and
8. delete obsolete state only after rollback and retention windows close.

Use this sequence only when it fits the system. Record the evidence gate and
rollback point for each phase.

## Rollout plan fields

For each phase, state:

- prerequisites and owner;
- mutation performed;
- compatible versions before and after;
- validation evidence;
- expected duration or convergence condition;
- stop condition;
- rollback action; and
- irreversible effects.

Do not call rollback safe if the new phase writes state the old version cannot
interpret or if external consumers cannot revert.

## Validation selection

Map checks to claims:

| Claim | Useful evidence |
|---|---|
| direct caller compatibility | focused compile, type, or unit checks |
| wire compatibility | schema and contract tests with old/new fixtures |
| storage compatibility | migration checks and old/new reader-writer tests |
| consumer behavior | integration or replay fixture using representative payloads |
| user-visible behavior | focused end-to-end scenario |
| mixed-version safety | staged or simulated compatibility matrix |
| operational readiness | dashboards, alerts, capacity, and runbook exercise |
| rollback safety | restore or rollback rehearsal with changed state |

A passing broad test suite does not replace a missing compatibility scenario.
Avoid listing checks that do not cover a named impact.

## Risk and priority

Prioritize by consequence, likelihood, exposure duration, detectability, and
recovery difficulty. Elevate:

- irreversible data changes;
- external or unknown consumers;
- mixed-version contract breaks;
- ambiguous writes or duplicate side effects;
- security and authorization changes;
- changes without observable adoption or failure signals; and
- rollback paths that have not seen the new state.

Tie every risk to evidence or a named unknown. Avoid generic migration warnings.

## Completion criteria

An impact plan is ready for implementation when:

- the old and new contracts are explicit;
- required adaptations have owners or clear repository locations;
- unknown external boundaries have a coordination path;
- mixed-version and retained-data cases are addressed;
- every rollout phase has evidence and a stop condition;
- irreversible operations are isolated and acknowledged; and
- the validation plan proves the important compatibility claims.
