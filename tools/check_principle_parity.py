"""Check that the 24 locally revised principle skills keep their Pstack provenance.

Each leaf must carry its name, pinned upstream path and revision, and the
attribution footer. See docs/pstack-parity.md.
"""

from __future__ import annotations

from pathlib import Path


REVISION = "afd51cf66a3100a95f878d6c4b93a01f6508e3b0"
NAMES = (
    "attack-the-premise",
    "boundary-discipline",
    "build-the-lever",
    "encode-lessons-in-structure",
    "exhaust-the-design-space",
    "experience-first",
    "explain-the-number",
    "fix-root-causes",
    "foundational-thinking",
    "guard-the-context-window",
    "laziness-protocol",
    "make-operations-idempotent",
    "migrate-callers-then-delete-legacy-apis",
    "minimize-reader-load",
    "model-the-domain",
    "never-block-on-the-human",
    "outcome-oriented-execution",
    "prove-it-works",
    "redesign-from-first-principles",
    "separate-before-serializing-shared-state",
    "sequence-verifiable-units",
    "subtract-before-you-add",
    "test-behavior-not-implementation",
    "type-system-discipline",
)


def missing_provenance(root: Path, name: str) -> list[str]:
    text = (root / f"skills/principle-{name}/SKILL.md").read_text()
    required = (
        f"name: principle-{name}\n",
        f"  upstream-path: pstack/skills/principle-{name}\n",
        f"  upstream-revision: {REVISION}\n",
        "Adapted from pstack; [license and attribution](references/LICENSE.txt).\n",
    )
    return [line.strip() for line in required if line not in text]


def main() -> int:
    root = Path(__file__).resolve().parents[1]
    failures = {name: missing for name in NAMES if (missing := missing_provenance(root, name))}
    for name, missing in failures.items():
        print(f"principle-{name}: missing provenance {missing}")
    if failures:
        return 1
    print(f"All {len(NAMES)} principles carry Pstack {REVISION} provenance.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
