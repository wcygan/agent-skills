---
name: maintain-outcome
description: "Maintain a measurable application or engineering outcome through repeated observation, prioritized fixes, and post-delivery verification. Use for ongoing reliability, performance budgets, error budgets, crash rates, SLOs, or recurring operational improvement with a defined objective."
license: MIT
metadata:
  author: William Cygan
  kind: component
  maintenance: local
---

# Maintain an outcome

Run a bounded improvement cycle against a measurable objective, preserving durable
state between cycles. Work from the agreed setup for the objective: its inputs,
how it is verified, which actions have a standing go-ahead, the budget, and the
trigger that starts a cycle. When that setup is missing or stale, use an available
prepare-agent-objective skill or establish those same items before acting on them.

1. Read the objective, latest checkpoint, active owners, remaining budget, and exact
   deployed versions. Reconcile pending work with live artifacts before acting.
   Record which signal each fix answers and which commit, PR, or deployment carries
   it, so a retry does not create a duplicate fix, PR, or deployment. Give each
   shared file, branch, or deployment one owner, because two writers on one target
   race.
2. Check observation health, freshness, coverage, and exposure before judging the
   outcome. Missing telemetry is inconclusive. For crashes, relate events to sessions
   or users by release and platform; zero events with no traffic proves nothing,
   because nothing ran.
3. Group repeated signals, rank by user impact, and select a bounded unit. Track
   observed, investigating, reproduced, locally verified, delivered, and operationally
   confirmed states separately. Keep unsupported hypotheses and blocked cases visible.
4. Investigate the cause and capture failure or baseline evidence. Use applicable
   investigation, bug-fix, or experiment workflows when available. Make the smallest
   effective change, or test a structural alternative when repeated local fixes fail.
   Stay within the objective's scope, invariants, and resource budget.
5. Verify against the real affected surface, including relevant failure paths. Inspect
   outputs and side effects directly. Preserve evidence and unchanged acceptance
   criteria. Commit, push, open or merge a PR, deploy, or roll back only with a
   go-ahead for that action, given either in the objective's setup or now; otherwise
   prepare the result and record the action needed from its owner. Tests, builds,
   reads, and reruns need no go-ahead.
6. After delivery, evaluate the outcome over the agreed observation window and
   only once the new version has carried enough traffic to show the change. Check
   collateral metrics and affected cohorts. A local test or successful deployment
   shows the change shipped, not that the outcome moved. Low exposure, missing
   platform coverage, and delayed signals remain pending evidence.
7. On regressions, follow the agreed rollback or escalation path. After a repeated
   failure, stop retrying the same fix: state the failed assumption and the check
   that would tell the remaining hypotheses apart. At the cycle budget or a blocking
   prerequisite, checkpoint progress and report the exact next action. Preserve
   successful improvements and failed trials.
8. Record metric movement, versions, evidence, unresolved cases, remaining budget,
   and the next agreed trigger. Clean owned resources without deleting proof.
   Check that a configured trigger is active before claiming continued monitoring.
   Without one, finish this cycle and state that another invocation is required.

Post a short progress update after each unit of work: the signal, the state it
reached, and what is next. End with a recap that leads with outcome movement and
its uncertainty, then what was verified, what is still pending evidence, and the
next action. A sustained objective remains ongoing after a successful cycle; claim
health only for the observed scope and interval. Escalate exhausted budgets, broken
observation, and missing go-aheads without silently widening scope or promising
perpetual success.
