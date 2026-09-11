---
name: resolving-merge-conflicts
description: "Resolve an in-progress Git merge or rebase while preserving the intent of both changes. Use when conflicts prevent the requested integration from completing."
license: MIT
metadata:
  maintenance: "local"
  upstream-repository: "https://github.com/mattpocock/skills.git"
  upstream-skill: "skills/engineering/resolving-merge-conflicts"
  upstream-revision: "84fdeffd12f2ee307994d1eb6feb48173b6e0502"
  upstream-license: "MIT"
---

# Resolve merge conflicts

Identify the active Git operation, conflicting files, and unrelated staged or unstaged work before editing. Read the competing changes and their intent from history and relevant requirements; consult PRs or issues when they explain a consequential conflict.

Resolve hunks to preserve both intended behaviors where compatible. Use the merge's stated goal to resolve routine tradeoffs. If the alternatives require a missing product decision, isolate that conflict, continue independent resolutions, and ask about the decision. Do not silently introduce new behavior or discard either side.

Run checks appropriate to the merged behavior and the user's constraints, and repair failures caused by the resolution. Stage only files belonging to this operation, preserving unrelated work. Complete the requested merge or rebase using Git's operation-specific continuation; if the user requested only proposed resolutions or inspection, stop at that scope. Do not abort or discard work unless authorized. Report the resulting operation state and any unresolved conflicts.
