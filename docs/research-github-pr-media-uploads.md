# GitHub pull request media uploads

Research date: 2026-08-16.

## Findings

- OpenClaw PR #124013 is a merged UI fix. Its description embeds `resize-before.mp4` and `resize-after.mp4` as video evidence. The description also reports browser regression evidence and labels the PR as having video proof.
- OpenClaw's root `AGENTS.md` line 233 documents a direct upload flow. It posts raw file bytes to `https://uploads.github.com/user-attachments/assets` with `name`, `content_type`, and numeric `repository_id` query parameters, plus a bearer token. It says to embed the returned `.url`; images use Markdown image syntax, while videos use a bare URL line. It also says that the CDN follows repository visibility and that proof files must not be committed.
- Peter Steinberger's linked X post says the instruction was added so UI-state PRs include video evidence. The post links to the same OpenClaw guidance.
- The user-attachment endpoint is not documented in the public GitHub REST API reference found during this research. GitHub's documented REST APIs do support updating a pull request body through the pull request endpoint and creating timeline comments through the issue-comments endpoint; both bodies are Markdown-capable text fields.
- The documented release-asset upload API is a different endpoint. It stores release assets and is not the same as an attachment embedded in a PR body.

## Reproducible upload shape

```sh
repo_id="$(gh api repos/OWNER/REPO --jq .id)"
token="$(gh auth token)"
curl -sS -X POST \
  "https://uploads.github.com/user-attachments/assets?name=proof.png&content_type=image/png&repository_id=${repo_id}" \
  -H "Authorization: Bearer ${token}" \
  -H "Accept: application/json" \
  -H "Content-Type: application/octet-stream" \
  --data-binary @proof.png
```

The request body is raw binary data, not multipart form data or JSON. Use the response's `url` in the PR body. For a video, set the actual MIME type, such as `video/mp4`, and put the returned URL on its own line. Verify the resulting rendered PR before treating the upload as successful.

## Caveats

- The endpoint is an observed GitHub web-product endpoint, not a documented stable REST API. Its authorization, limits, error responses, video processing, and retention behavior can change.
- Upload permission must be tested with the token and target repository. A private repository's attachment visibility is not equivalent to public CDN hosting.
- Do not put tokens in command output or commit media to the product branch. Use a temporary file and remove it after verification if it contains sensitive data.

## Sources

- [OpenClaw PR #124013](https://github.com/openclaw/openclaw/pull/124013)
- [OpenClaw AGENTS.md at the referenced commit](https://github.com/openclaw/openclaw/blob/2ceb18118ced797a448feed3dc634e9588614aae/AGENTS.md?plain=1#L233)
- [Peter Steinberger's X post](https://x.com/steipete/status/2088486859244741020)
- [GitHub REST API: pull requests](https://docs.github.com/en/rest/pulls/pulls)
- [GitHub REST API: issue comments](https://docs.github.com/en/rest/issues/comments)
- [GitHub REST API: release assets](https://docs.github.com/en/rest/releases/assets)
