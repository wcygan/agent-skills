---
name: maintain-outcome
description: "Maintain a measurable application or engineering outcome through repeated observation, prioritized fixes, and post-delivery verification. Use for ongoing reliability, performance budgets, or recurring operational improvement with a defined objective."
license: MIT
metadata:
  author: William Cygan
  kind: component
  maintenance: local
---

# Maintain an outcome

Run a bounded improvement cycle against a measurable objective, preserving durable
state between cycles. Use an existing operating contract; when it is missing or
stale, use an available prepare-agent-objective skill or establish the same inputs,
verification, authority, budget, and trigger before dependent actions.

1. Read the objective, latest checkpoint, active owners, remaining budget, and exact
   deployed versions. Reconcile pending work with live artifacts before acting.
   Record signal identities and change identities so retries do not create duplicate
   fixes, PRs, or deployments. Permit one owner per shared mutation.
2. Check observation health, freshness, coverage, and exposure before judging the
   outcome. Missing telemetry is inconclusive. For crashes, relate events to sessions
   or users by release and platform; zero events with no traffic proves nothing.
3. Group repeated signals, rank by user impact, and select a bounded unit. Track
   observed, investigating, reproduced, locally verified, delivered, and operationally
   confirmed states separately. Keep unsupported hypotheses and blocked cases visible.
4. Investigate the cause and capture failure or baseline evidence. Use applicable
   investigation, bug-fix, or experiment workflows when available. Make the smallest
   effective change, or test a structural alternative when repeated local fixes fail.
   Stay within the objective's scope, invariants, and resource budget.
5. Verify against the real affected surface, including relevant failure paths. Inspect
   outputs and side effects directly. Preserve evidence and unchanged acceptance
   criteria. Submit, merge, deploy, or roll back only as authorized by the contract;
   otherwise prepare the result and record the action needed from its owner.
6. After delivery, evaluate the outcome over the contract's observation window and
   minimum exposure. Check collateral metrics and affected cohorts. A local test or
   successful deployment is not operational confirmation. Low exposure, missing
   platform coverage, and delayed signals remain pending evidence.
7. On regressions, follow the authorized rollback or escalation path. Stop blind
   retries after repeated failure; state the failed assumption and next discriminating
   check. At the cycle budget or a blocking prerequisite, checkpoint progress and
   report the exact next action. Preserve successful improvements and failed trials.
8. Record metric movement, versions, evidence, unresolved cases, remaining budget,
   and the next authorized trigger. Clean owned resources without deleting proof.
   Check that a configured trigger is active before claiming continued monitoring.
   Without one, finish this cycle and state that another invocation is required.

Report outcome movement and uncertainty, not just completed tasks. A sustained
objective remains ongoing after a successful cycle; claim health only for the
observed scope and interval. Escalate exhausted budgets, broken observation, and
missing authority without silently widening scope or promising perpetual success.
