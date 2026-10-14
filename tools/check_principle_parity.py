"""Check the 24 principle skills against a pinned Pstack source and explicit adaptations."""

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
    "build-the-lever": (
        ("When you fan work out to subagents,", "When delegation is available and authorized and you fan work out to subagents,"),
        ("Commit the lever when the work outlives the session.", "Keep the lever when the work outlives the session; commit it when committing is authorized."),
    ),
    "explain-the-number": (
        (
            "For a performance number, run the full procedure with the [benchmark-checklist](../benchmark-checklist/SKILL.md) skill.",
            "For a performance number, compare repeated runs under matched workloads and environments, retain raw results, and check that the measured work actually occurred.",
        ),
    ),
    "guard-the-context-window": (
        (
            "- **Size phases and cap scope.** Limit files per phase, set turn budgets, account for mechanism costs.",
            "- **Size phases and cap scope.** Limit files per phase, set turn budgets, account for mechanism costs.\n- Route bounded bulk reading to subagents when delegation is available and authorized; keep findings and evidence pointers in the main thread. Otherwise narrow reads and summarize locally.",
        ),
    ),
    "never-block-on-the-human": (
        ("Make reasonable decisions, proceed,", "Make reasonable decisions within the authorized scope, proceed,"),
        (
            "Irreversible actions (force-push, delete production data, send external messages) still require confirmation.",
            "Irreversible actions (force-push, delete production data, send external messages) still require authorization. Preserve prior authorization and explicit checkpoints; ask only when authority or a necessary product decision is missing.",
        ),
    ),
    "prove-it-works": (
        ("(the **show-me-your-work** skill)", "(retain a decision log and evidence pointers)"),
        ("Commit it only for large or complex work", "Commit it only when committing is authorized and for large or complex work"),
    ),
    "sequence-verifiable-units": (
        (
            "Rebase onto clean trunk first so every check measures against the real baseline.",
            "Establish the actual starting revision and preserve unrelated work so every check measures against a known baseline; rebase only when authorized.",
        ),
    ),
    "type-system-discipline": (
        (
            " For TypeScript syntax, see the `typescript-best-practices` skill.",
            " Use the language's idioms for sum types, semantic wrappers, boundary parsers, and exhaustive matching.",
        ),
    ),
}


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
