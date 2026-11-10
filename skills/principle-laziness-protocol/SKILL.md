---
name: principle-laziness-protocol
description: "Apply when refactoring, evaluating diff size, or tempted to add abstractions, layers, or signal threading. Bias toward deletion and the smallest change that solves the problem."
license: MIT
metadata:
  kind: principle
  upstream-repository: https://github.com/cursor/plugins
  upstream-revision: afd51cf66a3100a95f878d6c4b93a01f6508e3b0
  upstream-path: pstack/skills/principle-laziness-protocol
  upstream-author: Lauren Tan
  maintenance: local
---

# Laziness Protocol

**Trigger:** you are refactoring, judging the size of a diff, or tempted to add an abstraction, a layer, or a value threaded through several signatures to reach one place.

**Rule:** bias toward deletion. Make the smallest change that solves the problem, and prefer removing code to adding it.

**Why:** every added line is read, maintained, and reasoned about by everyone who follows; a deleted line costs nothing again. "Elegant" boilerplate is still boilerplate, and an abstraction with one use is indirection with no return.

**Pattern:**
- **Delete first.** Before adding, look for what the change makes unnecessary: a branch, a flag, a wrapper, a test of a detail that no longer exists. Remove it in the same change.
- **Keep one source of truth.** Do not repeat the same decision in several places. Put it behind one definition and derive everything else from it. Two values that must stay in sync (a boolean mirrored from a state, a count kept beside a list) are a bug waiting for the sync to fail; derive the second from the first instead. The model-the-domain principle covers which structure to derive from.
- **Minimize the diff.** Solve the stated problem; do not reshape neighboring code on the way. A reviewer should see one reason for the change.
- **Resist threading.** Passing a value through five signatures to reach one consumer usually means the value belongs somewhere else (a context, a config read at the boundary, or nowhere, because the consumer can derive it).

**Scope of the deletion bias:** delete freely within the task and within code the task owns. For code outside the task's scope, or owned by others, report what could be deleted (with locations) rather than deleting it, so the diff stays reviewable and the owner decides. Deleting a public API or a user-visible behavior is a breaking change; say so in the recap and get a go-ahead before it lands.

**Test:** for each added line, name the line it lets you delete or the failure it prevents. A line with neither is one to cut.

Related principles by name: subtract-before-you-add covers the order of removal before addition; minimize-reader-load covers collapsing layers; migrate-callers-then-delete-legacy-apis covers removing an old API once callers have moved.

Adapted from pstack; [license and attribution](references/LICENSE.txt).
