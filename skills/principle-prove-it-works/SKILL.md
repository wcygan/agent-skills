---
name: principle-prove-it-works
description: "Apply after completing a task, before declaring done. Verify against the real artifact (run the feature, read the actual value, inspect the diff), not a proxy, self-report, or 'it compiles.'"
license: MIT
metadata:
  kind: principle
  upstream-repository: https://github.com/cursor/plugins
  upstream-revision: afd51cf66a3100a95f878d6c4b93a01f6508e3b0
  upstream-path: pstack/skills/principle-prove-it-works
  upstream-author: Lauren Tan
  maintenance: local
---

# Prove It Works

Verify every task output by checking the real thing directly. Inferring from proxies, self-reports, or "it compiles" leaves the work's correctness unknown.

**Why:** Indirect verification (file mtimes, output freshness, agent self-reports, cached screenshots) feels cheaper than direct observation. Acting on a wrong inference costs far more than checking the source.

Check the real thing, not a proxy:
- Check process liveness directly, not indirectly through derived state
- Read the actual value, not a cached or derived representation
- When a check fails, check the observation method once (right target, fresh data, correct command). If the method holds, trust the failure and investigate the system; re-checking the method again only delays the real fix.
- When direct verification is impossible (no access, no environment, no way to run it), say so in the recap with what you checked instead. Stopping the work for it would lose everything that does not depend on the missing check.

## Script the check when you can

The strongest proof is a deterministic script that re-runs the same comparison, not a one-time eyeball. Write the script, run it, and keep its output as an artifact a reviewer can re-run instead of trusting your word.

Keep the artifact visible for the human: leave it in the working tree or scratch space where the reviewer can run it. When the work is large enough that the trail has to be auditable later, like a big port or migration, keep it with the change and retain a decision log and evidence pointers.

Adapted from pstack; [license and attribution](references/LICENSE.txt).
