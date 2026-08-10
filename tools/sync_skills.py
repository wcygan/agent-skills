#!/usr/bin/env python3
"""Compatibility wrapper for the vendored skill command."""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from skill_catalog.vendor import (
    ATTRIBUTIONS_PATH,
    GREEN,
    LOCK_PATH,
    RESET,
    ROOT,
    SKILLS_DIR,
    YELLOW,
    check_source,
    clone_source,
    color_enabled,
    exclude_provider_manifests,
    format_check_result,
    load_lock,
    main,
    normalize_frontmatter,
    positive_int,
    run,
    sync_source,
    write_attributions,
)


if __name__ == "__main__":
    raise SystemExit(main())
