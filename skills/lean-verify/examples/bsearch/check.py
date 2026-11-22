# /// script
# requires-python = ">=3.11"
# dependencies = []
# ///
"""Check the binary search proof, then check that the Lean model and the Python code agree.

The proof covers the model in `lean/Bsearch.lean`. This run compares the model
with `bsearch.py` on generated inputs, which is what ties the proof to the code.
Half of the lists are unsorted: the two must agree there too, although the
proof of absence does not apply.
"""

import random
import subprocess
import sys
from pathlib import Path

from bsearch import search

LEAN = Path(__file__).parent / "lean"


def requests(rng: random.Random) -> list[str]:
    asked = ["5", "5 5", "4 5", "6 5", "2 2 2 2 2"]
    for case in range(4000):
        xs = [rng.randint(-20, 20) for _ in range(rng.randint(0, 30))]
        if case % 2 == 0:
            xs.sort()
        asked.append(" ".join(map(str, [rng.randint(-22, 22), *xs])))
    return asked


def python_answer(request: str) -> str:
    target, *xs = map(int, request.split())
    found = search(xs, target)
    return "none" if found is None else str(found)


def main() -> int:
    built = subprocess.run(["lake", "build", "--wfail"], cwd=LEAN)
    if built.returncode != 0:
        print("FAIL: the Lean proof does not build")
        return 1
    asked = requests(random.Random(0))
    model = subprocess.run([LEAN / ".lake/build/bin/model"], input="\n".join(asked) + "\n",
                           capture_output=True, text=True, check=True).stdout.splitlines()
    if len(model) != len(asked):
        print(f"FAIL: the model answered {len(model)} of {len(asked)} requests")
        return 1
    for request, expected in zip(asked, model):
        actual = python_answer(request)
        if actual != expected:
            print(f"FAIL: on `{request}` the model gives `{expected}` and bsearch.py gives `{actual}`")
            return 1
    print(f"PASS: proof builds; model and bsearch.py agree on {len(asked)} inputs")
    return 0


if __name__ == "__main__":
    sys.exit(main())
