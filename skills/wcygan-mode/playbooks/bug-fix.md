# Bug fix

Reproduce and correct a reported defect.

1. Establish expected behavior and the actual failing surface with
   [investigate](../../wcygan-investigate/SKILL.md).
2. Use [reproduce-bug](../../reproduce-bug/SKILL.md) to establish failure before edits.
   Record why if reproduction is unavailable; uncertainty remains visible.
3. Trace the cause and follow [implement](../../wcygan-implement/SKILL.md) for the fix.
   Keep changes bounded to the cause and its necessary callers.
4. Rerun the original reproduction and relevant neighboring contracts. Use
   [verify](../../wcygan-verify/SKILL.md) on the affected user surface.

Complete with failing-before and passing-after evidence, or explicit gaps. Repeated
mistakes may warrant [prevent-recurrence](../../prevent-recurrence/SKILL.md).
