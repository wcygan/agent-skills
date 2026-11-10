# Pause safely

Checkpoint active work on an explicit pause or unavoidable interruption.

1. Stop dispatching new work and communicate the pause to active owners where possible.
   Finish only the minimal atomic operation needed to leave recoverable state.
2. Record artifact locations, current revisions, uncommitted work, active operations,
   evidence, unresolved decisions, and the next action using
   `wcygan-record`.
3. Stop owned processes when safe; identify anything that could not be stopped.
   Preserve files and proof. A pause needs no commit or publication; those need
   their own go-ahead.
4. Check that the checkpoint resolves to actual artifacts and survives session loss.

Complete with a durable handoff and explicit remaining activity. Say that the
underlying task is incomplete, and wait for the user before resuming, because
they asked for the pause.
