# Feature

Build new or changed user behavior.

1. Define observable acceptance criteria and investigate the existing integration points.
2. Use [design-options](../references/methods/design-options.md) when ownership or structure is unsettled.
   Name the data shape and who controls each state transition before implementation.
3. Follow [implement-change](../references/methods/implement-change.md). Resolve blocking dependencies
   first; split work only where outputs and write ownership can be separated.
4. Follow `verify-behavior` against the real affected surface.
   Use `review-changes` for consequential or contested choices.

Complete with the implemented outcome, design tradeoffs, evidence, and open issues.
Use [deliver-change](../references/methods/deliver-change.md) for the destination the user asked for (local handoff,
commit, or pull request).
