---
name: github-pr-media-proof
description: Prepare and upload image or video proof for GitHub pull requests, then review or update PR descriptions with orientation media, before/after tables, and validation evidence. Use when a PR needs screenshots, recordings, media conversion, attachment recovery, or description cleanup.
license: MIT
---

# GitHub PR media proof

Use this skill when a pull request needs visual evidence or a clearer description. Resolve every script path relative to this `SKILL.md`. Run the bundled Python files through `uv run --script`.

## Workflow

1. Run each script with `--help` when its current interface is not known.
2. Review the current PR body with `scripts/pr_body.py review`.
3. Generate or locate the requested media.
4. Run `scripts/upload_attachments.py --dry-run` on every media file.
5. Upload only after the repository, conversions, sizes, and side effects are correct.
6. Add the returned Markdown or URLs to a proposed body file.
7. Review that file with `scripts/pr_body.py review --body-file FILE`.
8. Preview the complete PR diff with `scripts/pr_body.py update --body-file FILE`.
9. Add `--write --expect-current SHA256` only after the body update is authorized.
10. Re-read the PR body and report the PR URL and uploaded URLs.

Every write step must have a checkable result: upload responses contain a URL, the proposed body contains the URLs, and the final API read contains the intended sections.

## Upload media

The uploader detects the current GitHub repository. Pass `--repo OWNER/REPO` only when detection is unavailable or the target differs.

```sh
uv run --script scripts/upload_attachments.py --dry-run screenshot.webp recording.mov
uv run --script scripts/upload_attachments.py screenshot.webp recording.mov
```

The script emits JSON by default. Use `--format markdown` for body-ready output. `--prepare-only` converts media without uploading it.

Automatic conversion creates inline-compatible PNG images and H.264 MP4 videos. It uses `ffprobe` for inspection and `ffmpeg` for conversion. Failed conversions preserve their run-owned directory and print one recovery instruction.

Read [references/media-formats.md](references/media-formats.md) before handling an unfamiliar format, a large file, a codec failure, or a private repository.

## Review and update a PR body

The body tool detects the repository and current pull request. Pass `--repo` or `--pr` only when detection fails or the target differs.

```sh
uv run --script scripts/pr_body.py review
uv run --script scripts/pr_body.py review --body-file proposed-body.md
```

Preview a proposed body, then write it explicitly:

```sh
uv run --script scripts/pr_body.py update --body-file proposed-body.md

uv run --script scripts/pr_body.py update --body-file proposed-body.md \
  --write --expect-current SHA256
```

The preview prints the current body SHA-256. The guarded write refuses concurrent changes. Re-read and merge the latest body before retrying a mismatch.

## Description format

Use this order for behavior-changing PRs:

1. `## Problem & Solution Overview` — state the problem, solution, and important boundary.
2. Put the shortest useful video near the end of the overview when it orients the reviewer faster than prose. Keep one sentence before it that says what to watch.
3. `## Before / After` — use a Markdown table for compact comparisons.
4. `## Why This Change Was Made` — explain the cause and the chosen boundary.
5. `## User Impact` — state who benefits and what remains unchanged.
6. `## Evidence` — link tests, logs, screenshots, and videos. Name each artifact.
7. `## Testing Done` — list exact commands, checks, or manual scenarios and their outcomes.

Only `Problem & Solution Overview` and `Testing Done` are required. Add the other sections when they improve review.

Prefer this table shape:

```md
| Scenario | Before | After |
| --- | --- | --- |
| Resize the pane mid-transcript | Reader position jumps | Anchor stays on the same message |
```

Use an image for a still state. Use a video for interaction, timing, animation, or state transitions. Put video URLs on their own lines so GitHub renders the player. Use image Markdown for still images. Keep the overview media short and move detailed proof to `Evidence`.

Read [references/description-guidelines.md](references/description-guidelines.md) for the review checklist and generic template.

## Safety and access

- Confirm the target repository and PR number before upload or update.
- Treat attachment URLs as repository-scoped evidence.
- Do not upload secrets, private customer data, or unreviewed recordings.
- Do not commit proof media or generated files to the product branch.
- Use `--dry-run` before an upload and preview before `--write`.
- Report every public PR update with its URL.
