#!/usr/bin/env python3
"""Compatibility entrypoint for inherited catalog maintenance."""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from skill_catalog.catalog import main


if __name__ == "__main__":
    raise SystemExit(main())
