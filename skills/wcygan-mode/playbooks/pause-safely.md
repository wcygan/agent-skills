# Pause safely

Use a checkpoint when the user pauses a task or an interruption forces it to
stop. For a transient failure, retry the affected step when safe and continue
the work already authorized.

1. Stop dispatching new work and communicate the pause to active owners where possible.
   Finish only the minimal atomic operation needed to leave recoverable state.
2. Record artifact locations, current revisions, uncommitted work, active operations,
   evidence, unresolved decisions, and the next action in
   a durable [decision-log](../references/methods/decision-log.md) checkpoint.
3. Stop owned processes when safe; identify anything that could not be stopped.
   Preserve files and proof. A pause needs no commit or publication.
4. Check that the checkpoint resolves to actual artifacts and survives session loss.

Tell the user what completed, what is still running, and where to resume. After
a user-requested pause, wait for their go-ahead. After an external interruption,
[recheck live state](session-pickup.md) and resume when the prerequisite is
available. If it remains unavailable, finish independent work and identify
what still blocks completion.
