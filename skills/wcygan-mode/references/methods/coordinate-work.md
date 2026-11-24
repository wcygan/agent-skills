# Coordinate work

1. Define the result, acceptance criteria, and constraints. Use [clarify-task](clarify-task.md)
   for missing decisions and [slice-changes](slice-changes.md) for dependent PR boundaries.
   Resolve risky shared interfaces before assigning implementation. Choose
   partitioned coverage or competing attempts.
   For competition, declare the selection rule before execution, so the winner
   is not picked by hindsight.
2. Give each unit a self-contained brief, because a worker starts cold and
   re-derives any context the brief leaves out: goal, scope and files it may
   write, inputs, dependencies, acceptance criteria, the evidence to return, and
   the return format (what to report and how long). Name one owner per unit.
3. Complete blocking prerequisites first. Run a unit in parallel only when it is
   useful: its writes are isolated from every other unit's and its output is
   bounded. A unit that needs the coordinator’s live context stays with the
   coordinator. Otherwise follow the plan serially when isolation is unavailable.
   Separate concurrent writes and serialize shared
   mutations, so no two writers race on one target.
4. Track each unit as pending, running, complete, or blocked with artifact pointers.
   Verify a prior writer has stopped before replacing it in the same workspace,
   or isolate the replacement and reject stale results.
5. Inspect returned artifacts and evidence, including exact revisions and methods
   for measurements. A failed read, test, or status check is safe to retry
   without asking. For an incomplete result, request one correction, then record
   unresolved coverage rather than retrying indefinitely.
6. Integrate in dependency order and verify the combined result. Resolve
   overlapping assumptions explicitly, because units that pass alone can still
   conflict when combined.

Done when every required unit has an evidenced outcome and integration is checked.
Report missing units, stopped attempts, and unresolved ownership or dependency gaps.

Adapted from Lauren Tan’s Pstack. [swarm](https://github.com/cursor/plugins/tree/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/skills/swarm) · [orchestrate.md](https://github.com/cursor/plugins/tree/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/skills/poteto-mode/playbooks/orchestrate.md). [MIT license](../LICENSE.txt).
