"""Tests for the GitHub PR media proof command surfaces."""

from __future__ import annotations

import importlib
import sys
import tempfile
import unittest
from pathlib import Path
from unittest import mock


SCRIPTS = Path(__file__).parents[1] / "skills" / "github-pr-media-proof" / "scripts"
sys.path.insert(0, str(SCRIPTS))

github_context = importlib.import_module("github_context")
pr_body = importlib.import_module("pr_body")
upload = importlib.import_module("upload_attachments")


class GitHubContextTests(unittest.TestCase):
    def test_explicit_repository_does_not_call_github(self) -> None:
        with mock.patch.object(github_context, "run_gh") as run_gh:
            self.assertEqual("owner/repo", github_context.resolve_repository("owner/repo"))
        run_gh.assert_not_called()

    def test_repository_detection_has_recovery(self) -> None:
        with mock.patch.object(
            github_context,
            "run_gh",
            side_effect=github_context.ToolError("not a checkout", "pass --repo"),
        ):
            with self.assertRaisesRegex(github_context.ToolError, "not a checkout"):
                github_context.resolve_repository(None)


class UploadPlanningTests(unittest.TestCase):
    def test_supported_image_uploads_without_ffmpeg(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            image = Path(directory) / "proof.png"
            image.write_bytes(b"png")
            plan = upload.plan_media(image, "auto", 5)
        self.assertEqual("upload", plan.action)
        self.assertEqual("image/png", plan.mime)

    def test_additional_image_converts_for_inline_display(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            image = Path(directory) / "proof.tiff"
            image.write_bytes(b"tiff")
            plan = upload.plan_media(image, "auto", 5)
        self.assertEqual("convert-image", plan.action)
        self.assertEqual(".png", plan.output_suffix)

    def test_non_h264_video_converts_to_mp4(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            video = Path(directory) / "proof.webm"
            video.write_bytes(b"video")
            with mock.patch.object(upload, "probe_media", return_value=("video", "vp9")):
                plan = upload.plan_media(video, "auto", 5)
        self.assertEqual("convert-video", plan.action)
        self.assertEqual("video/mp4", plan.mime)

    def test_unsupported_media_explains_recovery(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            media = Path(directory) / "proof.webp"
            media.write_bytes(b"image")
            with self.assertRaises(upload.ToolError) as raised:
                upload.plan_media(media, "never", 5)
        self.assertIn("Remove `--convert never`", raised.exception.recovery)


class PullRequestBodyTests(unittest.TestCase):
    def test_complete_visual_body_passes(self) -> None:
        body = """## Problem & Solution Overview

The recording shows the stable behavior.

https://github.com/user-attachments/assets/video-id

## Before / After

| Scenario | Before | After |
| --- | --- | --- |
| Resize | Jumps | Stable |

## Evidence

![After](https://github.com/user-attachments/assets/image-id)

## Testing Done

- `uv run pytest` — passed
"""
        result = pr_body.review_body(body)
        self.assertTrue(result.ok)
        self.assertEqual(2, len(result.media_urls))
        self.assertTrue(result.has_before_after_table)

    def test_missing_sections_return_actionable_errors(self) -> None:
        result = pr_body.review_body(
            "## Problem & Solution Overview\n\nShort summary."
        )
        self.assertFalse(result.ok)
        self.assertTrue(all(finding.recovery for finding in result.findings))
        self.assertIn(
            "missing `## Testing Done`",
            [finding.message for finding in result.findings],
        )

    def test_empty_and_duplicate_sections_fail(self) -> None:
        body = """## Problem & Solution Overview

## Problem & Solution Overview

Repeated.

## Evidence

## Testing Done

"""
        messages = [finding.message for finding in pr_body.review_body(body).findings]
        self.assertIn("duplicated `## Problem & Solution Overview`", messages)
        self.assertIn("empty `## Problem & Solution Overview`", messages)
        self.assertIn("empty `## Testing Done`", messages)

    def test_evidence_is_optional(self) -> None:
        body = """## Problem & Solution Overview

This change improves a non-visual command.

## Testing Done

- `uv run pytest` — passed
"""
        result = pr_body.review_body(body)
        self.assertTrue(result.ok)


if __name__ == "__main__":
    unittest.main()
