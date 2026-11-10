---
name: principle-fix-root-causes
description: "Apply when debugging. Trace each symptom to its root cause and fix it there; reproduce first, ask why until you reach it, resist nil-check guards that silence crashes."
license: MIT
metadata:
  kind: principle
  upstream-repository: https://github.com/cursor/plugins
  upstream-revision: afd51cf66a3100a95f878d6c4b93a01f6508e3b0
  upstream-path: pstack/skills/principle-fix-root-causes
  upstream-author: Lauren Tan
  maintenance: local
---

# Fix Root Causes

**Trigger:** you are debugging: a crash, a wrong result, a flaky test, a "works on my machine".

**Rule:** do not fix the symptom. Trace the problem to its root cause and fix it there.

**Why:** symptom fixes accumulate. Each workaround makes the system harder to reason about, and the real bug remains to surface somewhere else. Root-cause fixes are slower up front and cheaper in total.

**Pattern:**
- **Reproduce first.** A fix for a bug you cannot reproduce cannot be verified; you will not know whether it worked.
- **Ask "why" until you reach a cause you can change.** Stop when the next "why" is outside the code (a requirement, a hardware limit), not when the first plausible story appears.
- **Do not add a guard inside the system to hide a crash.** A nil check deep in a call chain that silences a crash leaves the bad value in place and moves the failure somewhere less visible. A guard at a system boundary (CLI, config, network, external API) is validation, not a workaround; that is where a bad value should be rejected (see boundary-discipline).
- **If a workaround needs a paragraph-long comment to justify it, the code is wrong.** Fix the code, not the comment. The comment is the sign that the fix did not reach the cause.
- **Check for the pattern, not just the instance.** Search for the same shape elsewhere. Fix sibling instances inside the task's scope; for instances outside it, report them with locations rather than widening the change, so the diff stays reviewable and the owner of that code decides.
- **When stuck, instrument; do not guess.** Add logging, read the actual error, print the actual value. A guess costs a full fix-and-retest cycle each time it is wrong.
- **If the deciding fact took a deep dig to find,** propose the cheap, always-on signal (a log line, an assertion, a metric) that would have shown it at first look, so the next person does not repeat the dig.

**Restart bugs: suspect state before code.** When something "fails after restart," suspect stale persistent state first: config files, caches, lock files, serialized state. If clearing a state file restores behavior, the root cause is that the state was not validated or reconciled on startup, and state validation is the fix (see make-operations-idempotent).

**Scope:** a temporary guard is acceptable only when the root cause is confirmed, the real fix is scheduled, and the guard carries a reference to it. Say so in the recap.

Adapted from pstack; [license and attribution](references/LICENSE.txt).
