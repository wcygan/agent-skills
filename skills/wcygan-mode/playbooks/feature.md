# Feature

Build new or changed user behavior.

1. Define observable acceptance criteria and investigate the existing integration points.
2. Use `wcygan-design` when ownership or structure is unsettled.
   Name the data shape and who controls each state transition before implementation.
3. Follow `wcygan-implement`. Resolve blocking dependencies
   first; split work only where outputs and write ownership can be separated.
4. Follow `wcygan-verify` against the real affected surface.
   Use `wcygan-review` for consequential or contested choices.

Complete with the implemented outcome, design tradeoffs, evidence, and open issues.
Use `wcygan-deliver` for the destination the user asked for (local handoff,
commit, or pull request); committing and publishing each need an explicit go-ahead.
