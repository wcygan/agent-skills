---
name: principle-attack-the-premise
description: "Apply when two or more fixes that share one premise have failed the same gate. Take a census of which actors hold the imbalance before the next fix, then question the premise instead of writing another fix that assumes it."
license: MIT
metadata:
  kind: principle
  upstream-repository: https://github.com/cursor/plugins
  upstream-revision: afd51cf66a3100a95f878d6c4b93a01f6508e3b0
  upstream-path: pstack/skills/principle-attack-the-premise
  upstream-author: Lauren Tan
  maintenance: local
---

# Attack the Premise

**Trigger:** two or more fixes that share one premise have failed the same gate (the same failing test, benchmark, or check).

**Rule:** before the next fix, write the premise down and count where the failing condition actually lands. Then question the premise instead of writing another fix that assumes it.

**Why:** each fix that fails under a shared premise is evidence about the premise, not about the fix. A third fix built on the same assumption is most likely a third failure.

Terms used here:
- **Premise:** the one sentence every failed fix assumed. Example: "the workers are slow because the queue is too big."
- **Actors:** the components or callers that could hold the failing condition: workers, hosts, requests, callers, files, test cases.
- **Imbalance:** the failing condition being held by some actors far more than others. Example: a timeout that only ever hits two of twenty workers.
- **Census:** a count, per actor, of how often that actor holds the failing condition across runs.

**Pattern:**
- **Write the premise down.** If you cannot state it in one sentence, you do not yet know what the failed fixes had in common.
- **Take a census before the next fix.** Count, per component or caller, how often each holds the failing condition. The census shows *which* actors hold the condition, not how large it is. Write it as a rerunnable script (the build-the-lever principle), so a reviewer can rerun it and so you can rerun it after the fix.
- **Read the skew.** If the same few actors hold most of the imbalance on every run, something assigns them that role: an ordering, a hash, a default, a first-come rule. Find what assigns the role. That assignment is the next "why" in the fix-root-causes chain.
- **Remove the asymmetry instead of compensating for it** (the laziness-protocol principle). Rotate the role between actors, randomize the assignment, or move the role so no actor holds it on every run. A return path, a shared pool, a batched hand-off, or a periodic rebalance leaves the assignment in place and adds work on every run.

**Stop gate:** do not start the next fix before the premise is written down and the census exists. Without them, the next fix is a guess that costs a full implement-and-test cycle and, if it fails, adds nothing to what you know; with them, a failed fix at least tells you which actor it did not help.

**Scope and exception:** if the census is even across actors, the premise is not the cause. Look elsewhere and keep the census as evidence. One failed fix is not yet a trigger; one failure can be an implementation mistake.

Distinct from redesign-from-first-principles, which rebuilds a design around a new requirement. This principle questions a fact the current design assumes.

Adapted from pstack; [license and attribution](references/LICENSE.txt).
