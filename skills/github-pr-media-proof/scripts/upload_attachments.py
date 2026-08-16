#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.11"
# dependencies = []
# ///
"""Prepare and upload image or video evidence for a GitHub pull request.

Run this script from a GitHub checkout. It detects OWNER/REPO through `gh`,
validates each file, converts incompatible media with ffmpeg, uploads the
result, and prints reusable attachment URLs. Use `--dry-run` before an external
write. Use `--prepare-only` to convert files without uploading them.

Examples:
    uv run --script upload_attachments.py --dry-run screenshot.webp demo.mov
    uv run --script upload_attachments.py screenshot.png demo.mp4
    uv run --script upload_attachments.py --repo OWNER/REPO --prepare-only clip.mkv
"""

from __future__ import annotations

import argparse
import json
import pathlib
import shutil
import subprocess
import sys
import tempfile
import urllib.error
import urllib.parse
import urllib.request
from dataclasses import asdict, dataclass

from github_context import ToolError, require_command, resolve_repository, run_gh


INLINE_IMAGE_TYPES = {
    ".gif": "image/gif",
    ".jpeg": "image/jpeg",
    ".jpg": "image/jpeg",
    ".png": "image/png",
    ".svg": "image/svg+xml",
}
ADDITIONAL_IMAGE_TYPES = {
    ".bmp": "image/bmp",
    ".tif": "image/tiff",
    ".tiff": "image/tiff",
}
GITHUB_VIDEO_TYPES = {
    ".mov": "video/quicktime",
    ".mp4": "video/mp4",
    ".webm": "video/webm",
}
CONVERTIBLE_IMAGE_TYPES = {".avif", ".heic", ".heif", ".webp"}
CONVERTIBLE_VIDEO_TYPES = {
    ".avi",
    ".flv",
    ".m2ts",
    ".m4v",
    ".mkv",
    ".mpeg",
    ".mpg",
    ".mts",
    ".ts",
    ".wmv",
}
IMAGE_LIMIT = 10 * 1024 * 1024
VIDEO_FREE_PLAN_LIMIT = 10 * 1024 * 1024
VIDEO_MAX_LIMIT = 100 * 1024 * 1024


@dataclass(frozen=True)
class MediaPlan:
    source: str
    kind: str
    action: str
    output_suffix: str
    mime: str
    warnings: tuple[str, ...] = ()


def run_media_command(args: list[str], timeout: int, recovery: str) -> str:
    require_command(args[0], recovery)
    try:
        result = subprocess.run(
            args,
            check=False,
            capture_output=True,
            text=True,
            timeout=timeout,
        )
    except subprocess.TimeoutExpired as error:
        raise ToolError(
            f"`{args[0]}` timed out after {timeout} seconds",
            recovery,
        ) from error
    if result.returncode != 0:
        detail = (result.stderr or result.stdout or "unknown media tool error").strip()
        raise ToolError(f"{args[0]} failed: {detail[:1200]}", recovery)
    return result.stdout


def probe_media(path: pathlib.Path, timeout: int) -> tuple[str, str | None]:
    output = run_media_command(
        [
            "ffprobe",
            "-v",
            "error",
            "-select_streams",
            "v:0",
            "-show_entries",
            "stream=codec_name,codec_type",
            "-of",
            "json",
            str(path),
        ],
        timeout,
        "Install ffmpeg, verify the file, or use a GitHub-supported format.",
    )
    try:
        streams = json.loads(output).get("streams") or []
    except json.JSONDecodeError as error:
        raise ToolError(
            f"ffprobe returned invalid JSON for `{path}`",
            "Run `ffprobe FILE` and repair or replace the media file.",
        ) from error
    if not streams:
        raise ToolError(
            f"no image or video stream was found in `{path}`",
            "Verify the file with `ffprobe FILE` and retry with image or video media.",
        )
    stream = streams[0]
    return str(stream.get("codec_type") or "video"), stream.get("codec_name")


def plan_media(path: pathlib.Path, convert: str, timeout: int) -> MediaPlan:
    if not path.is_file():
        raise ToolError(f"media file does not exist: `{path}`", "Correct the path and retry.")
    suffix = path.suffix.lower()
    warnings: list[str] = []
    size = path.stat().st_size

    if suffix in INLINE_IMAGE_TYPES:
        if size > IMAGE_LIMIT:
            raise ToolError(
                f"image exceeds GitHub's 10 MB limit: `{path}`",
                "Resize or compress the image, then retry.",
            )
        return MediaPlan(str(path), "image", "upload", suffix, INLINE_IMAGE_TYPES[suffix])

    if suffix in ADDITIONAL_IMAGE_TYPES:
        if convert == "never":
            return MediaPlan(
                str(path), "image", "upload", suffix, ADDITIONAL_IMAGE_TYPES[suffix]
            )
        return MediaPlan(str(path), "image", "convert-image", ".png", "image/png")

    if suffix in GITHUB_VIDEO_TYPES:
        if size > VIDEO_MAX_LIMIT:
            raise ToolError(
                f"video exceeds GitHub's 100 MB maximum: `{path}`",
                "Trim or compress the video, then retry.",
            )
        if size > VIDEO_FREE_PLAN_LIMIT:
            warnings.append("video exceeds 10 MB and can require a paid GitHub plan")
        if convert == "never":
            return MediaPlan(
                str(path), "video", "upload", suffix, GITHUB_VIDEO_TYPES[suffix],
                tuple(warnings),
            )
        _, codec = probe_media(path, timeout)
        if suffix == ".mp4" and codec == "h264":
            return MediaPlan(
                str(path), "video", "upload", suffix, GITHUB_VIDEO_TYPES[suffix],
                tuple(warnings),
            )
        return MediaPlan(
            str(path), "video", "convert-video", ".mp4", "video/mp4",
            tuple(warnings),
        )

    if suffix in CONVERTIBLE_IMAGE_TYPES:
        if convert == "never":
            raise ToolError(
                f"GitHub does not list `{suffix}` as a supported image format",
                "Remove `--convert never` or convert the file to PNG, JPEG, GIF, or SVG.",
            )
        return MediaPlan(str(path), "image", "convert-image", ".png", "image/png")

    if suffix in CONVERTIBLE_VIDEO_TYPES:
        if convert == "never":
            raise ToolError(
                f"GitHub does not list `{suffix}` as a supported video format",
                "Remove `--convert never` or convert the file to H.264 MP4.",
            )
        return MediaPlan(str(path), "video", "convert-video", ".mp4", "video/mp4")

    kind, _ = probe_media(path, timeout)
    if convert == "never":
        raise ToolError(
            f"GitHub does not list `{suffix or 'this extension'}` as supported media",
            "Remove `--convert never` to let ffmpeg create a supported file.",
        )
    if kind == "video":
        return MediaPlan(str(path), "video", "convert-video", ".mp4", "video/mp4")
    return MediaPlan(str(path), "image", "convert-image", ".png", "image/png")


def prepare_media(plan: MediaPlan, directory: pathlib.Path, timeout: int) -> pathlib.Path:
    source = pathlib.Path(plan.source)
    if plan.action == "upload":
        return source
    target = directory / f"{source.stem}-github{plan.output_suffix}"
    recovery = f"Run ffmpeg against `{source}` manually, inspect its error, then retry."
    if plan.action == "convert-image":
        command = [
            "ffmpeg", "-hide_banner", "-loglevel", "error", "-y",
            "-i", str(source), "-frames:v", "1", str(target),
        ]
    else:
        command = [
            "ffmpeg", "-hide_banner", "-loglevel", "error", "-y",
            "-i", str(source), "-map", "0:v:0", "-map", "0:a?",
            "-c:v", "libx264", "-pix_fmt", "yuv420p", "-movflags", "+faststart",
            "-c:a", "aac", "-b:a", "128k", str(target),
        ]
    run_media_command(command, timeout, recovery)
    if not target.is_file() or target.stat().st_size == 0:
        raise ToolError(
            f"ffmpeg did not create `{target}`",
            recovery,
        )
    return target


def validate_prepared_size(path: pathlib.Path, kind: str) -> tuple[str, ...]:
    size = path.stat().st_size
    if kind == "image" and size > IMAGE_LIMIT:
        raise ToolError(
            f"prepared image exceeds GitHub's 10 MB limit: `{path}`",
            "Resize or compress the image, then retry.",
        )
    if kind == "video" and size > VIDEO_MAX_LIMIT:
        raise ToolError(
            f"prepared video exceeds GitHub's 100 MB maximum: `{path}`",
            "Trim or compress the video, then retry.",
        )
    if kind == "video" and size > VIDEO_FREE_PLAN_LIMIT:
        return ("video exceeds 10 MB and can require a paid GitHub plan",)
    return ()


def upload_media(
    repository: str,
    repository_id: str,
    token: str,
    path: pathlib.Path,
    mime: str,
    timeout: int,
) -> str:
    query = urllib.parse.urlencode(
        {"name": path.name, "content_type": mime, "repository_id": repository_id}
    )
    request = urllib.request.Request(
        f"https://uploads.github.com/user-attachments/assets?{query}",
        data=path.read_bytes(),
        method="POST",
        headers={
            "Accept": "application/json",
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/octet-stream",
        },
    )
    try:
        with urllib.request.urlopen(request, timeout=timeout) as response:
            payload = json.load(response)
    except urllib.error.HTTPError as error:
        detail = error.read(800).decode("utf-8", errors="replace").strip()
        raise ToolError(
            f"GitHub upload failed with HTTP {error.code}: {detail or error.reason}",
            f"Run `gh auth status`, confirm write access to `{repository}`, then retry once.",
        ) from error
    except urllib.error.URLError as error:
        raise ToolError(
            f"GitHub upload connection failed: {error.reason}",
            "Check network access and retry the same command. No automatic retry was made.",
        ) from error
    url = payload.get("url")
    if not isinstance(url, str) or not url:
        raise ToolError(
            f"GitHub returned no attachment URL for `{path}`",
            "Retry once. If it repeats, use GitHub drag-and-drop and record the returned URL.",
        )
    return url


def output_record(record: dict[str, object], output_format: str) -> None:
    if output_format == "json":
        print(json.dumps(record, sort_keys=True))
        return
    if record.get("url"):
        if record.get("kind") == "image":
            print(f"![{pathlib.Path(str(record['source'])).stem}]({record['url']})")
        else:
            print(record["url"])
    else:
        print(f"{record['source']}: {record['action']} -> {record['prepared_path']}")


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description=__doc__.splitlines()[0],
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""Examples:
  uv run --script %(prog)s --dry-run screenshot.webp demo.mov
  uv run --script %(prog)s screenshot.png demo.mp4
  uv run --script %(prog)s --repo OWNER/REPO --prepare-only clip.mkv

Side effects:
  Upload mode writes user attachments to GitHub. Conversion uses a temporary
  directory. Failed runs preserve converted files and print their location.
""",
    )
    parser.add_argument("files", nargs="+", type=pathlib.Path, help="image or video files")
    parser.add_argument("--repo", metavar="OWNER/REPO", help="default: detect with `gh repo view`")
    parser.add_argument(
        "--convert", choices=("auto", "never"), default="auto",
        help="auto creates inline-compatible images and H.264 MP4 video",
    )
    parser.add_argument("--prepare-only", action="store_true", help="convert without uploading")
    parser.add_argument("--dry-run", action="store_true", help="validate and show the plan")
    parser.add_argument("--keep-prepared", action="store_true", help="retain converted files")
    parser.add_argument("--output-dir", type=pathlib.Path, help="directory for converted files")
    parser.add_argument("--timeout", type=int, default=60, help="seconds per external command")
    parser.add_argument("--format", choices=("json", "markdown"), default="json")
    return parser


def main() -> int:
    args = build_parser().parse_args()
    workspace: pathlib.Path | None = None
    generated_workspace = args.output_dir is None
    succeeded = False
    try:
        if args.timeout < 1:
            raise ToolError("timeout must be positive", "Pass `--timeout SECONDS`.")
        repository = resolve_repository(args.repo)
        plans = [plan_media(path.resolve(), args.convert, args.timeout) for path in args.files]
        conversions = [plan for plan in plans if plan.action != "upload"]
        if conversions:
            require_command(
                "ffmpeg",
                "Install ffmpeg, then rerun the dry-run.",
            )
            require_command(
                "ffprobe",
                "Install ffmpeg, then rerun the dry-run.",
            )
            for plan in conversions:
                probe_media(pathlib.Path(plan.source), args.timeout)
        if args.dry_run:
            for plan in plans:
                output_record({**asdict(plan), "repo": repository, "prepared_path": None}, args.format)
            succeeded = True
            return 0

        if args.output_dir:
            workspace = args.output_dir.resolve()
            workspace.mkdir(parents=True, exist_ok=True)
        else:
            workspace = pathlib.Path(tempfile.mkdtemp(prefix="github-pr-media-proof-"))

        prepared = [prepare_media(plan, workspace, args.timeout) for plan in plans]
        plans = [
            MediaPlan(
                plan.source,
                plan.kind,
                plan.action,
                plan.output_suffix,
                plan.mime,
                tuple(dict.fromkeys((*plan.warnings, *validate_prepared_size(path, plan.kind)))),
            )
            for plan, path in zip(plans, prepared, strict=True)
        ]
        if args.prepare_only:
            for plan, path in zip(plans, prepared, strict=True):
                output_record(
                    {**asdict(plan), "repo": repository, "prepared_path": str(path), "url": None},
                    args.format,
                )
            succeeded = True
            return 0

        token = run_gh(
            "auth", "token",
            recovery="Run `gh auth login`, confirm `gh auth status`, then retry.",
        )
        repository_id = run_gh(
            "api", f"repos/{repository}", "--jq", ".id",
            recovery=f"Confirm access to `{repository}` or pass the correct `--repo`.",
        )
        for plan, path in zip(plans, prepared, strict=True):
            url = upload_media(
                repository, repository_id, token, path, plan.mime, args.timeout
            )
            output_record(
                {**asdict(plan), "repo": repository, "prepared_path": str(path), "url": url},
                args.format,
            )
        succeeded = True
    except (OSError, ToolError) as error:
        if workspace is not None:
            print(f"artifacts: {workspace}", file=sys.stderr)
        if isinstance(error, ToolError):
            print(error.format(), file=sys.stderr)
        else:
            print(f"error: {error}\nrecovery: Correct the local file error and retry.", file=sys.stderr)
        return 1
    finally:
        retain = args.keep_prepared or args.prepare_only
        if workspace is not None and generated_workspace and not retain and succeeded:
            shutil.rmtree(workspace)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
