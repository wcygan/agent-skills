---
name: prepare-pull-request
description: "Prepare a concise, visual, evidence-backed pull request from the actual diff. Use when drafting or updating a PR title/body, assembling review assets, or preparing a change for review; publication follows existing authorization."
license: MIT
metadata:
  author: William Cygan
  kind: component
  maintenance: local
---

# Prepare a pull request

Help a reviewer understand the problem, the resulting behavior, and the evidence
without reconstructing the conversation. Prefer a small change with one useful
visual and a few precise sentences. Follow the repository's PR template and title
conventions; brevity must not erase required information or material risks.

Use linked skills when available; the criteria here remain the fallback when a
component is installed alone. Report missing rendering or publication capabilities.

1. Inspect the target base, current revision, final diff, and actual validation.
   Separate unrelated work and distinguish tests run from suggested commands.
   If the change has several independent purposes, use
   [slice-changes](../slice-changes/SKILL.md) to propose a coherent boundary;
   do not rewrite history or expand the task merely to improve the description.
2. Write the problem and before/after behavior first. Use
   [write-clearly](../write-clearly/SKILL.md) for prose and captions. Explain a
   concrete trigger when useful; omit the transcript, abandoned attempts, and
   file-by-file narration unless they explain a material tradeoff.
3. Select one visual that answers the main reviewer question. Use
   [technical-visuals](../technical-visuals/SKILL.md) when creating a figure.
   Default to 2D; use 3D only when requested. For format and evidence choices,
   read [review package](references/review-package.md).
4. State verification for the current revision, reproducible commands when useful,
   and material compatibility, rollout, or rollback concerns. Keep uncertainty
   visible. A conceptual diagram is explanation, not execution evidence.
5. Inspect the completed description and rendered assets as a reviewer. Confirm
   links, readable labels, accessible captions, revision consistency, and removal
   of temporary paths or sensitive data. Refresh stale visuals after scope changes.
6. If publication is authorized, use the available publication mechanism or
   [deliver-change](../deliver-change/SKILL.md), preserving requested draft status,
   and read back the title, body, base, head, and asset access. Otherwise deliver the
   reviewable local title/body and assets at the requested checkpoint.

A trivial typo or obvious dependency pin may need no visual; omit decorative
figures. More than one visual is justified when it answers distinct necessary
questions. No fixed word count outranks correctness or the repository template.

Done when the review package matches the actual change and evidence, and the
requested local or published destination is confirmed. Preparing or opening a PR
never implies merge or deployment authority.
