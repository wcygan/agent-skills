# Propose change

Prepare a reviewable proposal for an implemented change.

1. Confirm that the user asked for a pull request, identify the target base,
   and inspect the final diff for unrelated work and temporary artifacts.
2. Follow `verify-behavior` for required evidence. Preserve
   requested draft status and the project's submission conventions.
3. Use `prepare-pull-request` for the title,
   concise problem/result, useful visual, and current verification evidence. Respect
   the repository template and omit decoration for a trivial change.
4. For a draft-only request, return the local package. When the user asks to
   open the PR, use [deliver-change](../references/methods/deliver-change.md) with the prepared package. Preserve the
   requested draft status and report any missing approval.

Complete at the requested local or published destination.
