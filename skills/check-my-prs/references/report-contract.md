# Terminal Report Contract

Use this schema for both human and JSON output. The terminal view may compress fields but must not change their meaning.

## Top-level fields

| Field | Meaning |
|---|---|
| `schema_version` | Contract version. Start at `1`. |
| `generated_at` | UTC timestamp for this observation. |
| `repository` | Canonical `OWNER/REPO`. |
| `target_pr` | PR number that established the scope, or `null` for an entirely unsubmitted local stack. |
| `stack.classification` | `tracked`, `remote-only`, `local-only`, `divergent`, or `unstacked`. |
| `stack.size` | Number of PR layers in scope. |
| `stack.frontier_pr` | Highest contiguous ready or merged PR, or `null`. |
| `stack.health` | Normalized topology, sync, and local rebase health plus affected layers. |
| `overall` | `HEALTHY`, `ACTION`, or `UNKNOWN`. |
| `pull_requests` | Bottom-to-top normalized PR records. |
| `next_actions` | Ordered, concrete, read-only recommendations or labeled mutation suggestions. |
| `evidence_gaps` | Missing, truncated, unauthorized, unsupported, or failed observations. |

## PR record

Each PR record contains:

- identity: `number`, `title`, `url`, `position`, `head`, `base`;
- lifecycle: `state`, `draft`, `mergeable`, `review_decision`;
- normalized gate: `MERGED`, `READY`, `WAITING`, `BLOCKED`, `DRAFT`, or `UNKNOWN`;
- checks: totals by required/optional and pass/pending/fail/cancel/skip/unknown;
- review: approvals, changes requested, active unresolved threads, outdated threads, requested reviewers, comments;
- guideline verdict and findings;
- scope metrics and named split concerns;
- evidence gaps local to the PR.

Never collapse “not observed” into zero. Use `null` or an evidence gap when a count is unavailable.

## Gate precedence

Apply in this order:

1. merged -> `MERGED`;
2. missing decisive evidence -> `UNKNOWN`;
3. draft -> `DRAFT`;
4. conflict/rebase need, changes requested, or required check failed/cancelled -> `BLOCKED`;
5. required check or required review pending -> `WAITING`;
6. all known requirements satisfied -> `READY`.

Active unresolved threads are reported prominently but do not change the gate without repository policy evidence.

## Overall status and exit code

| Overall | Exit | Meaning |
|---|---:|---|
| `HEALTHY` | `0` | Every in-scope open layer is ready and no action finding remains. |
| `ACTION` | `1` | A blocker, wait, presentation finding, active thread, or split recommendation needs attention. |
| `UNKNOWN` | `2` | The report is usable but decisive evidence is incomplete. |

Use exit `3` for invalid arguments, missing executables, authentication failure, repository resolution failure, or an unusable input fixture.

## Terminal layout

Render in this order:

1. one-line repository, scope, classification, and overall status;
2. bottom-to-top PR table;
3. merge frontier and stack health;
4. only non-empty attention sections: review, CI, guidelines, split signals;
5. numbered next actions;
6. evidence gaps.

Use color as reinforcement, never as the only carrier of meaning. Honor `NO_COLOR`, disable color for non-TTY output, and support explicit plain and JSON modes.

## Action ordering

Order next actions by:

1. authentication or evidence blockers;
2. the bottommost stack conflict or required-check failure;
3. changes requested and active review threads;
4. waiting required checks/reviews;
5. description, naming, and testing-evidence polish;
6. optional CI and split opportunities.
