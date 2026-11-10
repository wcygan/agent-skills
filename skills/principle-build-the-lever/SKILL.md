---
name: principle-build-the-lever
description: "Apply to any non-trivial work, not just bulk work: edits, migrations, analyses, checks. Build the tool that does it or proves it (codemod, script, generator, or a skill your subagents follow) instead of working by hand. The tool is the artifact a reviewer can rerun."
license: MIT
metadata:
  kind: principle
  upstream-repository: https://github.com/cursor/plugins
  upstream-revision: afd51cf66a3100a95f878d6c4b93a01f6508e3b0
  upstream-path: pstack/skills/principle-build-the-lever
  upstream-author: Lauren Tan
  maintenance: local
---
# Build the Lever

**Trigger:** any non-trivial work, not only bulk work: a set of edits, a migration, an analysis, a verification check.

**Rule:** build the tool that does the work or proves it (a codemod, script, generator, query, or a skill that delegates follow) instead of doing the work by hand. The lever is what a reviewer reruns.

**Why:** a tool does the work the same way every time and reruns for free. Hand-done changes can only be re-verified by redoing them; a deterministic script turns "trust me" into "run this".

**When to build it:** default to building the lever. Skip it only when the task is trivial: a couple of edits you can see and check at a glance, in one sitting, that nobody will need to repeat. Rough thresholds: more than about five similar edits, any edit spread over more than two files, any change that will run again (another branch, another machine, after a rebase), or any result a reviewer must be able to reproduce. The cost of a lever is the time to write and prove it, usually minutes; the cost of skipping it is paying the hand-work again on every rerun and asking the reviewer to redo it to check it.

**Pattern:**
- Do the first unit by hand to learn the recipe, then build the tool. Prove it by rerunning it on that unit and diffing against your hand-done version. Make the lever safe to rerun (see make-operations-idempotent).
- Codemod or script for edits, generator for repetitive files, a dump-to-sqlite query for analysis, a rerunnable check for verification.
- A deterministic lever beats fan-out. If the tool can process every unit in one pass, run it yourself. Do not fan out delegates to hand-apply what a script can do.
- When you fan work out to subagents, write the lever as a skill they all read: the recipe, the verification contract, and the do-not-touch fences in one artifact. Keep it outside the delegates' write scope so they cannot quietly edit the contract.
- Applying this principle produces a file. If you cited it and there is no codemod, script, generator, or delegate skill in the diff, you did not apply it.
- Keep the lever with the change when the work outlives the session, so the next run and the reviewer can use it. Writing and running a lever locally is ordinary work.

The bar is triviality, not repetition. A one-off still earns a lever when the lever is what makes the work checkable. Per the laziness-protocol principle, build the smallest script that does or proves the job, never a framework.

Distinct from encode-lessons-in-structure, which makes a recurring instruction a durable guardrail; this principle is about throughput and reviewability on the work in front of you. For scripting the verification itself, see prove-it-works.

Adapted from pstack; [license and attribution](references/LICENSE.txt).
