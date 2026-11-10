# Autonomous run

Drive one bounded task to an observable completion condition.

1. State the completion predicate, scope, explicit pause gates, and any resource
   budget the user set. Do not invent a budget, because a self-imposed limit
   becomes a reason to stop early. Use `clarify-task` for missing decisions.
   For outcome ownership with uncertain operational inputs or proof, use
   `prepare-agent-objective` first. Route
   recurring health or performance objectives through
   `maintain-outcome`; an active execution trigger is needed
   for automatic future cycles.
2. Select the matching engineering playbook and execute small verified units. Record
   significant decisions with `decision-log`.
3. Reassess failed assumptions using evidence; stop repeating an approach that fails
   for the same reason. Report unrelated issues instead of fixing them, so the
   run stays within the requested task.
4. Continue until the predicate holds, a budget the user set is reached, the user
   pauses, an irreversible action needs a go-ahead, or progress needs something
   only the user can supply. Work through ordinary obstacles such as errors,
   timeouts, locked files, and failing tools: diagnose, then retry what is safe
   to repeat, fix the request, or use another route. Leave a deliberate blocker
   (a protected file, access withheld on purpose, a safety guardrail) alone and
   report it. Post a short progress update at each phase boundary and leave a
   useful checkpoint on exit.

Complete with a verified outcome or a precise stopping reason. Future scheduling
needs an external trigger the user approved; the skill itself provides no scheduler.
