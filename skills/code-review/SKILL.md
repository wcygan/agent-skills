---
name: code-review
description: "Review a PR, branch, or working diff against repository standards and the requested behavior. Use for code review or review since a specified revision."
license: MIT
metadata:
  maintenance: "local"
  upstream-repository: "https://github.com/mattpocock/skills.git"
  upstream-skill: "skills/engineering/code-review"
  upstream-revision: "84fdeffd12f2ee307994d1eb6feb48173b6e0502"
  upstream-license: "MIT"
---

# Review Standards and Spec separately

Review the change from two perspectives so success on one cannot conceal a failure on the other:

- **Standards:** conformance to the repository's documented conventions and maintainability needs.
- **Spec:** conformance to the user's requested behavior and supplied requirements.

## Establish the comparison and requirements

Use the user's comparison target when supplied. Otherwise infer the PR base for a PR review, or inspect the staged and unstaged changes for a working-tree review. Ask only when several plausible targets would produce materially different reviews. Resolve references before reviewing and report an empty comparison accurately.

For branch changes since divergence, use `git diff <base>...HEAD`; for changes since a specific commit, use `git diff <commit> HEAD`. Include `git diff` and `git diff --cached` when the requested scope includes uncommitted work. Record the comparison so findings are reproducible.

Prefer requirements provided in the conversation or a supplied spec path. Then use discoverable project specs or issue references in the PR and commits. Read `docs/agents/issue-tracker.md` only when retrieving requirements from that tracker. Missing tracker configuration does not prevent a local review. If some requirements remain unavailable, review the known behavior and identify the limitation instead of inventing a spec.

Read applicable repository instructions and standards. For maintainability concerns beyond documented rules, consult `references/design-smells.md` when useful. Treat those heuristics as judgment calls; explain a concrete consequence in this change rather than flagging a pattern by name alone.

## Conduct the review

Keep the two perspectives separate, whether reviewing locally or delegating. Use independent reviewers when the size or complexity warrants them and the environment permits delegation; a small change can be reviewed directly. Give any reviewer the exact comparison, relevant requirements or standards, and the same scope.

For Standards, distinguish documented violations from design judgments. For Spec, look for missing or incorrect behavior and unintended changes. Follow affected call paths far enough to support a finding. Avoid repeating issues already established by tooling unless they explain a material failure.

## Completion and authority

Present findings under **Standards** and **Spec**, with actionable file/line locations, supporting requirements or evidence, and practical consequences. Prioritize within each perspective; do not collapse them into a single score. State when an axis has no findings or cannot be assessed fully.

A review-only request ends with the findings and coverage limits. If the user also requested fixes, continue into those authorized changes and check the affected behavior. Review completion does not require a new approval for work already requested.
