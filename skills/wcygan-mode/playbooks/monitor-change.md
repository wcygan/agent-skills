# Monitor change

Inspect or follow a proposed change toward readiness.

1. Select the requested mode: status only, address review findings, repair checks,
   or watch until a stated condition. Declare the scope before acting.
2. Use the available review-system integration; the optional Python watcher is
   documented in [tools](../references/tools.md). Status-only work remains observational.
3. Assess findings with [review triage](../references/review-triage.md). Apply fixes
   only when requested, then reverify the current revision.
4. For a watch, preserve the requested duration or stopping condition. Report conflicts,
   unavailable evidence, or exhausted retries without treating them as passing checks.

Complete at the requested condition with confirmed state and remaining blockers.
Ready to merge is distinct from merged, and opening a proposal does not start a watch.
