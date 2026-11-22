# /// script
# requires-python = ">=3.11"
# dependencies = []
# ///
"""Check the varint proof, then check that the Lean model and the Python code agree.

The proof covers the model in `lean/Varint.lean`. This run compares the model
with `varint.py` on generated inputs, which is what ties the proof to the code.
"""

import random
import subprocess
import sys
from pathlib import Path

from varint import decode, encode

LEAN = Path(__file__).parent / "lean"


def requests(rng: random.Random) -> list[str]:
    edges = [0, 1, 127, 128, 255, 256, 16383, 16384, 2**32, 2**64 - 1, 2**64]
    numbers = edges + [rng.getrandbits(rng.randint(1, 200)) for _ in range(2000)]
    streams = [bytes(rng.getrandbits(8) for _ in range(rng.randint(0, 12))) for _ in range(2000)]
    streams += [encode(n) + bytes([rng.getrandbits(8)]) for n in numbers[:200]]
    streams += [encode(n)[:-1] for n in numbers[:200]]
    return [f"e {n}" for n in numbers] + [" ".join(["d", *map(str, s)]) for s in streams]


def python_answer(request: str) -> str:
    kind, *words = request.split()
    if kind == "e":
        return " ".join(map(str, encode(int(words[0]))))
    decoded = decode(bytes(map(int, words)))
    if decoded is None:
        return "none"
    value, rest = decoded
    return " ".join(map(str, [value, *rest]))


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
            print(f"FAIL: on `{request}` the model gives `{expected}` and varint.py gives `{actual}`")
            return 1
    print(f"PASS: proof builds; model and varint.py agree on {len(asked)} inputs")
    return 0


if __name__ == "__main__":
    sys.exit(main())
