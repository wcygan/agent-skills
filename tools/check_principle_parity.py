"""Check the 24 principle skills against a pinned Pstack source and explicit adaptations.

Principles in LOCALLY_REVISED are maintained as local writing: their bodies no
longer track the pinned text, so the check verifies only their provenance metadata
and the attribution footer. See skills/wcygan-mode/references/parity.md.
"""

from __future__ import annotations

import argparse
from concurrent.futures import ThreadPoolExecutor
import difflib
from pathlib import Path
import urllib.request


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
ADAPTATIONS = {
    "type-system-discipline": (
        (
            " For TypeScript syntax, see the `typescript-best-practices` skill.",
            " Use the language's idioms for sum types, semantic wrappers, boundary parsers, and exhaustive matching.",
        ),
    ),
}


LOCALLY_REVISED = frozenset((
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
))


def render(name: str, source: str) -> str:
    _, frontmatter, body = source.split("---\n", 2)
    expected_name = f"name: principle-{name}"
    if expected_name not in frontmatter.splitlines():
        raise ValueError(f"unexpected upstream name for {name}")
    fields = [line for line in frontmatter.splitlines() if not line.startswith("disable-model-invocation:")]
    for original, replacement in ADAPTATIONS.get(name, ()):
        if body.count(original) != 1:
            raise ValueError(f"adaptation no longer matches {name}: {original}")
        body = body.replace(original, replacement)
    metadata = (
        "license: MIT\nmetadata:\n  kind: principle\n"
        "  upstream-repository: https://github.com/cursor/plugins\n"
        f"  upstream-revision: {REVISION}\n"
        f"  upstream-path: pstack/skills/principle-{name}\n"
        "  upstream-author: Lauren Tan\n  maintenance: local\n"
    )
    return "---\n" + "\n".join(fields) + "\n" + metadata + "---\n" + body.rstrip() + "\n\nAdapted from pstack; [license and attribution](references/LICENSE.txt).\n"


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--upstream", type=Path, help="Local source root containing pstack/skills; otherwise fetch the pinned revision.")
    args = parser.parse_args()
    root = Path(__file__).resolve().parents[1]

    def check(name: str) -> str:
        relative = f"pstack/skills/principle-{name}/SKILL.md"
        if name in LOCALLY_REVISED:
            actual = (root / f"skills/principle-{name}/SKILL.md").read_text()
            required = (
                f"name: principle-{name}\n",
                f"  upstream-path: pstack/skills/principle-{name}\n",
                f"  upstream-revision: {REVISION}\n",
                "Adapted from pstack; [license and attribution](references/LICENSE.txt).\n",
            )
            missing = [line.strip() for line in required if line not in actual]
            return "" if not missing else f"local/{name}: missing provenance {missing}\n"
        if args.upstream:
            source = (args.upstream / relative).read_text()
        else:
            url = f"https://raw.githubusercontent.com/cursor/plugins/{REVISION}/{relative}"
            with urllib.request.urlopen(url, timeout=30) as response:
                source = response.read().decode("utf-8")
        expected = render(name, source)
        actual = (root / f"skills/principle-{name}/SKILL.md").read_text()
        return "".join(difflib.unified_diff(expected.splitlines(True), actual.splitlines(True), fromfile=f"pinned/{name}", tofile=f"local/{name}"))

    with ThreadPoolExecutor(max_workers=8) as pool:
        differences = list(pool.map(check, NAMES))
    for difference in differences:
        if difference:
            print(difference, end="")
    if any(differences):
        return 1
    print(f"All {len(NAMES)} principles match Pstack {REVISION} with the documented adaptations.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
