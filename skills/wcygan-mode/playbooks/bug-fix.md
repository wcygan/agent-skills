# Bug fix

Reproduce and correct a reported defect.

1. Establish expected behavior and the actual failing surface with
   [investigation](investigation.md).
2. Use [reproduce-bug](../references/methods/reproduce-bug.md) to establish failure before edits.
   For a reproduction-only request, return the failing case and diagnosis here.
   If reproduction is unavailable, report the attempted check and evidence gap.
3. Trace the cause and follow [implement-change](../references/methods/implement-change.md) for the fix.
   Keep changes bounded to the cause and its necessary callers.
4. Rerun the original reproduction and relevant neighboring contracts. Use
   `verify-behavior` on the affected user surface.

Complete with failing-before and passing-after evidence, or explicit gaps. Repeated
mistakes may warrant [prevent-recurrence](../references/methods/prevent-recurrence.md).
