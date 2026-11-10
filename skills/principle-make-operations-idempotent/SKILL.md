---
name: principle-make-operations-idempotent
description: "Apply when designing commands, lifecycle steps, or processing loops that run amid crashes, restarts, and retries. Converge to the same end state regardless of partial prior runs."
license: MIT
metadata:
  kind: principle
  upstream-repository: https://github.com/cursor/plugins
  upstream-revision: afd51cf66a3100a95f878d6c4b93a01f6508e3b0
  upstream-path: pstack/skills/principle-make-operations-idempotent
  upstream-author: Lauren Tan
  maintenance: local
---

# Make Operations Idempotent

**Trigger:** you are designing a command, a lifecycle step (startup, shutdown, migration), or a processing loop that will run where crashes, restarts, and retries happen.

**Rule:** design the operation so it converges to the correct end state no matter how many times it runs or what a previous run left behind. An operation that converges this way is called idempotent.

**Why:** in long-running systems, crashes and retries are normal, not exceptional. If partial state from one run changes the next run's outcome, every restart becomes a debugging session and every retry is a gamble.

**The pattern:**
- **Convergent startup:** scan for existing state, clean stale artifacts, adopt live work rather than assuming a clean slate.
- **Content-based cleanup:** decide what to keep by comparing content, not creation order or timestamps, because a crash can leave the newest artifact as the broken one.
- **Recoverable locks:** a lock must be safe to recover after the holder crashes. Record enough in the lock to tell a live holder from a dead one (an owner identity plus a liveness check, or an expiry), and let the next run reclaim a dead lock on its own. A lock that only a human can clear turns every crash into an outage that waits for someone to notice.
- **Idempotent scheduling:** failed work is respawned from its definition, not from a half-finished record, and inputs are regenerated after each cycle rather than consumed once.
- **Write the final state atomically** (write to a temporary name, then rename) so a reader never sees a half-written artifact.

**The test, for every state-mutating operation:**
1. What happens if this runs twice in a row?
2. What happens if the previous run crashed at every possible point?
3. Does re-execution converge to the same end state?

If any answer is "it depends on what state was left behind," the operation needs a reconciliation step before it does its work.

**Scope:** a one-shot script run by hand under supervision can skip this, with the cost that a failure is cleaned up by hand. Anything that runs unattended, on a schedule, or in a retry loop cannot.

Related: fix-root-causes treats "fails after restart" as a sign of unreconciled state; separate-before-serializing-shared-state covers when a lock is needed at all.

Adapted from pstack; [license and attribution](references/LICENSE.txt).
