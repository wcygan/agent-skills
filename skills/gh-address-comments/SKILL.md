---
name: gh-address-comments
description: "Address review or issue comments on a GitHub PR. Use when asked to inspect feedback or implement fixes for selected or all comments."
metadata:
  maintenance: "local"
  upstream-repository: "https://github.com/openai/skills.git"
  upstream-skill: "skills/.curated/gh-address-comments"
  upstream-revision: "49f948faa9258a0c61caceaf225e179651397431"
  upstream-license: "Apache-2.0"
  short-description: Address comments in a GitHub PR review
license: Apache-2.0
---

# Address PR comments

Use the supplied PR or the open PR for the current branch. Check access with `gh auth status`; if authentication is missing, explain the required login. Follow the current environment's permission mechanism when an actual restriction occurs. An authentication failure, a network failure, and a rate limit require different remedies.

Run `scripts/fetch_comments.py` to inspect review threads and comments. Preserve comment IDs and locations so each change can be tied to the feedback it addresses.

Use the scope already supplied by the user: selected comments, all outstanding comments, or inspection only. Summarize and ask for selection only when the intended set is genuinely ambiguous. “Fix” or “address these comments” authorizes the corresponding local changes without a second routine approval step.

Inspect the relevant code and implement the requested corrections. If feedback is incorrect or incompatible with the requested behavior, explain the evidence and continue independent fixes. Run checks appropriate to the changed behavior, subject to the user's constraints.

Report which comments were addressed, the changes and verification evidence, and any unresolved decisions. Posting replies, resolving remote threads, pushing, or merging requires authorization for those actions; local repair alone does not imply it.
