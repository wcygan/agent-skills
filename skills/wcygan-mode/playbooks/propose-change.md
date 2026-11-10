# Propose change

Prepare a reviewable proposal for an implemented change.

1. Confirm that the user asked for a pull request, identify the target base,
   and inspect the final diff for unrelated work and temporary artifacts.
2. Follow `wcygan-verify` for required evidence. Preserve
   requested draft status and the project's submission conventions.
3. Use `prepare-pull-request` for the title,
   concise problem/result, useful visual, and current verification evidence. Respect
   the repository template and omit decoration for a trivial change.
4. With the go-ahead to open the pull request, use the available publication
   mechanism and read back the created proposal, current revision, and target.
   Leave unrelated work in place rather than resetting it for a clean branch,
   because that would discard the user's edits.

Complete with the confirmed proposal and its evidence, or a local prepared handoff
when opening the pull request had no go-ahead. Merging needs its own go-ahead.
