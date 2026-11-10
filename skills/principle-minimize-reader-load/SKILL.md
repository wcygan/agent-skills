---
name: principle-minimize-reader-load
description: "Apply when reviewing or shaping code that's hard to trace. Count layers between question and answer, and hidden state in the reader's head; collapse one-caller wrappers and shrink mutable scope."
license: MIT
metadata:
  kind: principle
  upstream-repository: https://github.com/cursor/plugins
  upstream-revision: afd51cf66a3100a95f878d6c4b93a01f6508e3b0
  upstream-path: pstack/skills/principle-minimize-reader-load
  upstream-author: Lauren Tan
  maintenance: local
---

# Minimize Reader Load

**Trigger:** you are reviewing or shaping code that is hard to trace.

**Rule:** measure maintainability as the work a reader must do, on two axes: **layers to trace** (indirections between the question and the answer) and **state to hold** (hidden or mutable context the reader must keep in their head). Cut whichever is high.

**Why:** lines of code, cyclomatic complexity, and "clean architecture" are proxies; reader load is the thing that costs money every time someone opens the file. The two axes are independent: a flat file with 50 globals is as hard to reason about as a six-layer adapter stack. Guard both. This is the human analog of guard-the-context-window; working memory is finite for readers too.

**Pattern:**
- **Collapse layers that cost more than they save:** wrappers with one caller, adapters with no second implementation, speculative indirection that was never needed. Inline them, because each one is a file the reader must open to learn nothing new.
- **Make adjacent layers change the abstraction.** A layer that repeats the same methods and arguments adds reader load without compression. Collapse pass-through layers.
- **Demand interface compression.** A broad interface that hides little makes readers learn both the surface and the implementation. Prefer boundaries that hide meaningful decisions.
- **Shrink state scope:** prefer pure functions (returns over mutations), locals over fields, fields over module state, module state over globals. Derive instead of sync, so there is one place a value can change.
- **Name the invariant at the boundary,** not in every consumer, so the reader learns it once.
- Before adding a layer or a piece of state, ask: does it reduce reader load elsewhere by at least as much? If not, it is a net cost.

**The test:** can a new reader answer "where does X come from?" and "what can change X?" in under 30 seconds? If not, cut layers or cut state.

**Where the rule bends:** a one-caller wrapper that is a system boundary stays. The function that parses CLI arguments, the adapter that converts a wire type into a domain type, or the module that hides an external API has one caller by design; its job is to be the one place validation and conversion happen (see boundary-discipline). Inlining it would spread the boundary into the caller. The test still applies: the reader should be able to say "X comes from the boundary parser" in under 30 seconds, which a well-named boundary makes easy.

Adapted from pstack; [license and attribution](references/LICENSE.txt).
