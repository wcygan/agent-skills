# Prepare dependent changes

Build a verified sequence that another owner will land.

1. Define the target sequence, dependency order, acceptance criteria, and who will
   land it. Use `slice-changes` to verify that each
   prefix remains valid and that the full sequence meets the goal. Use `wcygan-coordinate` to assign bounded units.
2. Give one coordinator ownership of base changes and sequence maintenance. Workers
   produce their assigned changes and evidence without independently rebasing the stack.
3. Verify each change against its intended predecessor and the integrated sequence.
   Renew affected evidence whenever the integration context changes.
4. Follow `wcygan-deliver` to present the reviewed sequence,
   blockers, and landing instructions to its owner.

Complete at the requested handoff state. Merging needs its own go-ahead from the
sequence's owner. A verified upper change still waits for its unverified
predecessor, because its verification assumed that predecessor landed first.
