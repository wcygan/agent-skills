# Monitor change

Inspect or follow a proposed change toward readiness.

1. Select the requested mode: status only, address review findings, repair checks,
   or watch until a stated condition. Declare the scope before acting.
2. Use the available review-system integration; the optional Python watcher is
   documented in [tools](../references/tools.md). Status-only work reads and
   reports, since nothing else was requested.
3. Assess findings with [review triage](../references/review-triage.md). Apply fixes
   only when requested, then reverify the current revision.
4. For a watch, keep to the requested duration or stopping condition. Polling and
   re-reading status are safe to repeat. Report conflicts, unavailable evidence,
   or exhausted retries as blockers, because none of them is a passing check.

Complete at the requested condition with confirmed state and remaining blockers.
Report "ready to merge" and "merged" as different states, because only the second
changes the base branch. Watch only when asked, since a watch spends time budget.
