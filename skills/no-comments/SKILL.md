---
name: no-comments
description: "Remove implementation narration and make code explain itself while preserving schema and contract documentation. Use for comment cleanup, reviewing unnecessary comments, or requests to avoid implementation comments."
license: MIT
metadata:
  kind: component
  upstream-repository: https://github.com/cursor/plugins
  upstream-revision: 1e5c90a4b6f249917bd21fe361b3a2a7deb741b8
  upstream-path: pstack/skills/no-comments; pstack/agents/comment-sicko.md
  upstream-author: Lauren Tan
  maintenance: local
---

# No comments

Prefer names, types, and straightforward code over comments that explain the
implementation. Schema documentation is welcome: describe Protocol Buffer
messages and fields, database tables and columns, units, constraints, and
compatibility rules that consumers need to understand.

1. Use the requested files or diff. Otherwise inspect the current branch diff
   against the repository's base branch, including working-tree changes. Resolve
   the base from repository evidence; do not assume a branch named main. Keep a
   review-only request read-only.
2. Remove narration, section banners, commented-out code, and internal docstrings
   that repeat or explain implementation steps. When writing code, avoid adding
   these in the first place. Judge documentation by its purpose, not its file
   extension: schema comments define meaning; a migration's step-by-step narration
   still describes implementation.
3. Preserve legal notices, schema documentation, public API contracts, and comments
   required by tooling. Keep concise explanations of verified external platform,
   dependency, or protocol constraints that the code cannot express, including
   useful issue or RFC links. Do not use these exceptions to retain internal
   implementation walkthroughs.
4. Inspect the code before deleting a warning or workaround explanation. When it
   exposes surprising behavior in code we own, prefer a better name, a smaller
   function, a stronger type, or removal of the workaround. Apply the smallest
   behavior-preserving fix within the authorized scope. If it needs a broader
   redesign, report the exact symbol and proposed change; do not erase the only
   record of an unresolved correctness constraint merely to reach zero comments.
5. Treat lint and type suppressions as executable directives. Understand the rule
   before changing them. Fix the underlying defect when in scope and verify before
   removing its suppression; report unresolved correctness suppressions explicitly.
   Do not turn a comment cleanup into an unrelated rewrite.
6. Inspect the diff and run appropriate checks for any changed code or directives.
   Confirm schema and contract meaning survives. Report removed commentary,
   meaningful code simplifications, retained exceptions, verification, and open work.

Done when scoped implementation commentary is removed or replaced by clearer code,
useful schema and contract documentation remains, and unresolved constraints are
reported honestly. This skill needs no named reviewer, delegation API, or model.

Adapted from pstack; [license and attribution](references/LICENSE.txt).
