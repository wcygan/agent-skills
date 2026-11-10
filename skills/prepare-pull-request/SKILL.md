---
name: prepare-pull-request
description: "Prepare a concise, visual, evidence-backed pull request from the actual diff. Use when drafting or updating a PR title and body, writing a PR description, assembling review assets, or preparing a change for review. Opening the PR needs an explicit go-ahead."
license: MIT
metadata:
  author: William Cygan
  kind: component
  maintenance: local
---

# Prepare a pull request

Help a reviewer understand the problem, the resulting behavior, and the evidence
without reconstructing the conversation. Prefer a small change with one useful
overview visual and a few precise sentences. Follow the repository's PR template and
title conventions. Brevity must not erase required information or material risks,
because a reviewer who misses a risk approves blind.

Use the named skills when they are installed; the criteria here remain the fallback
when this skill is installed alone. Report missing rendering or publication
capabilities.

1. Inspect the target base, current revision, final diff, and actual validation.
   Separate unrelated work and distinguish tests run from suggested commands.
   If the change has several independent purposes, use the slice-changes skill to
   propose a coherent boundary; rewriting history or expanding the task to improve
   the description changes what the reviewer is reviewing.
2. Write the problem and before/after behavior first. Use the write-clearly skill
   for prose and captions. Explain a concrete trigger when useful; omit the
   transcript, abandoned attempts, and file-by-file narration unless they explain
   a material tradeoff.
3. Synthesize the code into the smallest useful model of actors, state, and
   outcomes; mirroring the call graph or listing changed files repeats the diff.
   Select one overview visual that answers the main reviewer question. Use the
   technical-visuals skill when creating a figure. Default to 2D; use 3D only
   when requested. For format and evidence choices, read
   [review package](references/review-package.md).
4. Lay out the body with a short visible overview and the full description in a
   collapsed section, following the exact headings, disclosure rules, and
   scenario-diagram rules in [review package](references/review-package.md).
   State verification for the current revision, reproducible commands when useful,
   and material compatibility, rollout, or rollback concerns, keeping uncertainty
   and failures visible above the fold.
5. Inspect the completed description and rendered assets as a reviewer. Confirm
   links, readable labels, accessible captions, revision consistency, and removal
   of temporary paths or sensitive data. Refresh stale visuals after scope changes.
6. Opening a pull request posts in the user's name, so it needs an explicit
   go-ahead. Before publishing, read back the title, base, head, the evidence the
   body cites, and what was not verified. With the go-ahead, use the available
   publication mechanism or the deliver-change skill, preserving requested draft
   status, and confirm the published title, body, base, head, and asset access.
   Without it, deliver the reviewable local title, body, and assets.

A trivial typo or obvious dependency pin may need no visual; omit decorative
figures. More than one visual is justified when it answers distinct necessary
questions. No fixed word count outranks correctness or the repository template.

Done when the review package matches the actual change and evidence, and the
requested local or published destination is confirmed.
