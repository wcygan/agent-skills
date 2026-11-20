---
name: principle-attack-the-premise
description: "Apply when two or more fixes that share one premise have failed the same gate. Write the premise down and test it directly before you write another fix that assumes it."
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

When two or more fixes that share one premise have failed the same gate, suspect the premise, not the fixes. One failed fix is not a trigger; it can be an implementation mistake.

- Write the premise down: the one sentence every failed fix assumed.
- Test it before the next fix. Find an observation that would come out differently if the premise were false, and make it. Look at how the failures are distributed (by actor, input, or time), not only at how large they are.
- If the evidence contradicts the premise, look for what the failures share that it did not predict. If one part always lands on the losing side, change what puts it there instead of adding a mechanism that cleans up after it.

Do not start the next fix before the premise is written down and tested.

Adapted from pstack; [license and attribution](references/LICENSE.txt).
