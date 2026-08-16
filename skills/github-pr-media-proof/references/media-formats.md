# Media formats and recovery

Read this reference for media selection, conversion, size limits, access, and failure recovery.

## GitHub formats

GitHub documents these image and video formats:

| Kind | Direct formats | Default handling |
| --- | --- | --- |
| Inline image | PNG, GIF, JPEG, SVG | Upload unchanged |
| Additional image | BMP, TIFF | Convert to PNG for inline review |
| Video | MP4, MOV, WebM | Normalize to H.264 MP4 when needed |
| Convertible image | WebP, AVIF, HEIC, HEIF | Convert to PNG with ffmpeg |
| Convertible video | AVI, FLV, M4V, MKV, MPEG, MTS, TS, WMV | Convert to H.264 MP4 with ffmpeg |

The last two rows are script inputs, not documented GitHub upload formats. The script converts them before upload.

GitHub recommends H.264 video for browser compatibility. Current limits are 10 MB for images and GIFs, 10 MB for free-plan videos, and 100 MB for paid-plan videos.

Source: <https://docs.github.com/en/get-started/writing-on-github/working-with-advanced-formatting/attaching-files>

## Access

Public repository attachments are public. Private and internal repository attachments require repository access.

The upload endpoint is an observed GitHub web endpoint. It is not in the public REST API reference. Treat endpoint changes as an external compatibility risk.

## Recovery table

| Failure | Recovery |
| --- | --- |
| Repository detection fails | Run inside the target checkout or pass `--repo OWNER/REPO`. |
| Pull request detection fails | Check out the PR branch or pass `--pr NUMBER`. |
| GitHub authentication fails | Run `gh auth status`, then use `gh auth login` if required. |
| Format is unsupported | Allow automatic conversion or provide a documented GitHub format. |
| ffmpeg or ffprobe is missing | Install ffmpeg, then rerun the dry-run. |
| Conversion fails | Inspect the preserved artifact directory and run ffprobe on the source. |
| Image exceeds 10 MB | Resize or compress the image before upload. |
| Video exceeds the plan limit | Trim or compress the recording before upload. |
| Upload times out | Check network access and retry once. The script does not retry automatically. |
| Body digest changed | Re-read the PR body, merge concurrent edits, and preview again. |

An upload can succeed before a later file fails. Record every returned URL before retrying. GitHub does not document an attachment deletion API.
