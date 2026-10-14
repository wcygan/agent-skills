# Autonomous run

Drive one bounded task to an observable completion condition.

1. State the completion predicate, scope, resource budget, and explicit pause gates.
   Use [clarify-task](../../clarify-task/SKILL.md) for missing decisions.
2. Select the matching engineering playbook and execute small verified units. Record
   significant decisions with [decision-log](../../decision-log/SKILL.md).
3. Reassess failed assumptions using evidence; stop repeating an approach that fails
   for the same reason. Keep unrelated issues outside the authorized task.
4. Continue until the predicate holds, the budget is reached, the user pauses, or an
   external prerequisite prevents progress. Preserve a useful checkpoint on exit.

Complete with a verified outcome or a precise stopping reason. Future scheduling
requires an available mechanism and user scope; the skill itself provides no scheduler.
