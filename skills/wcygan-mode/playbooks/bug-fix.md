# Bug fix

Reproduce and correct a reported defect.

1. Establish expected behavior and the actual failing surface with
   `wcygan-investigate`.
2. Use `reproduce-bug` to establish failure before edits.
   Record why if reproduction is unavailable; uncertainty remains visible.
3. Trace the cause and follow `wcygan-implement` for the fix.
   Keep changes bounded to the cause and its necessary callers.
4. Rerun the original reproduction and relevant neighboring contracts. Use
   `wcygan-verify` on the affected user surface.

Complete with failing-before and passing-after evidence, or explicit gaps. Repeated
mistakes may warrant `prevent-recurrence`.
