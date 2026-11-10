# Coordinate program

Coordinate a sustained project across multiple work units.

1. Define the completion predicate, tracks, dependencies, ownership, and budget. Use
   `wcygan-coordinate`; keep one-session work lightweight.
   For outcome ownership with uncertain operational inputs or proof, use
   `prepare-agent-objective` first. Route
   recurring health or performance objectives through
   `maintain-outcome`; an active execution trigger is needed
   for automatic future cycles.
2. For durable coordination, initialize the Python store described in
   [tools](../references/tools.md) outside installed skills. Record instructions,
   units, verification evidence, unresolved gates, and current artifact identities.
3. Pilot one unit through execution, verification, integration, and the requested
   delivery stage before expanding. Fix weaknesses in the brief or proof method first.
4. Give each worker a self-contained brief, because a worker starts cold and
   re-derives whatever the brief leaves out: goal, write scope and files, inputs,
   acceptance criteria, checks, timebox, the evidence to return, and the return
   format. Dispatch a worker only for a unit whose writes are isolated and whose
   output is bounded; `coordinate-work` has the brief template. Separate shared
   writes and reject stale results.
5. Drain results, inspect evidence, update state, and integrate in dependency order.
   Verify a writer has stopped before reusing its workspace. Report at each
   integration point, not only at the end.
6. On restart, reconcile live artifacts and owners with stored claims before dispatch.

Complete with every required unit accounted for, integrated evidence, and durable
handoff state. Inspect the evidence a ledger entry points to, because the entry
only records a claim.
