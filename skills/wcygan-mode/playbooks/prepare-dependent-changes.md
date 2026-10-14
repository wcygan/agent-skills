# Prepare dependent changes

Build a verified sequence that another owner will land.

1. Define the target sequence, dependency order, acceptance criteria, and who will
   land it. Use [slice-changes](../../slice-changes/SKILL.md) to verify that each
   prefix remains valid and that the full sequence meets the goal. Use [coordinate](../../wcygan-coordinate/SKILL.md) to assign bounded units.
2. Give one coordinator ownership of base changes and sequence maintenance. Workers
   produce their assigned changes and evidence without independently rebasing the stack.
3. Verify each change against its intended predecessor and the integrated sequence.
   Renew affected evidence whenever the integration context changes.
4. Follow [deliver](../../wcygan-deliver/SKILL.md) to present the reviewed sequence,
   blockers, and landing instructions to its owner.

Complete at the requested handoff state. Preparing the sequence does not itself
authorize merging it, and a verified upper change cannot bypass an unverified predecessor.
