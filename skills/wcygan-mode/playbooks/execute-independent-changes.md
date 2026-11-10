# Execute independent changes

Execute a queue of independent changes through the delivery step the user approved.

1. Confirm the queue entries are independent and establish per-entry acceptance
   criteria, the approved delivery step (commit, push, pull request, or merge),
   and a shared resource budget.
2. Use `wcygan-coordinate`. Give each change one owner
   and isolated writable state; keep its implementation, review, and evidence together.
3. Pilot one complete change before increasing concurrency. Verify each result
   independently where possible and inspect the actual evidence.
4. Let each owner deliver only after its required gates pass. The coordinator checks
   publication state and records outcomes rather than assuming submitted means done.

Complete when every queue entry is delivered or explicitly blocked. Keep dependent
changes out of the queue, because the queue assumes isolation; add entries only
when the user asks.
