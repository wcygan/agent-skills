---
name: prepare-pull-request
description: "Draft or revise a local PR title, body, and review assets from the actual diff and verification evidence. Use the delivery workflow in wcygan-mode for authorized publication."
license: MIT
metadata:
  author: William Cygan
  kind: component
  maintenance: local
---

# Prepare a pull request

Leave a local review package that lets a reviewer understand the problem, the
resulting behavior, and the evidence. Verify the title and body against the target
base, final diff, and checks run on the current revision. If independent changes
obscure the review, propose a split. Keep history and scope changes within the
user's authorization.

Follow the repository's title and template conventions, including markers for
automation. Check a box only when it is true. Keep failed checks, verification
gaps, and material compatibility, rollout, or rollback concerns visible. Renew
affected evidence after changes to the revision.

For a substantial description or a useful visual, use the
[review package guidance](references/review-package.md) for disclosure headings,
scenario diagrams, and asset choices. A small change may need only a sentence or
two and a validation line. Prefer one useful 2D visual unless the user requests
3D. Use actual screenshots for claims about the rendered UI and measured results
for performance claims. Label conceptual illustrations.

The package is ready when it matches the diff and the evidence, its links and
rendered assets are usable by the intended reviewer, and any unpublished assets
or rendering gaps are identified. Remove sensitive data from the copy and assets.
Get a go-ahead before opening or updating a remote PR and use the delivery
workflow for that action.
