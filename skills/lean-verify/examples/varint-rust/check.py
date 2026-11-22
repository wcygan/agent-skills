# /// script
# requires-python = ">=3.11"
# dependencies = []
# ///
"""Check the Rust varint proof.

`lean/Varint.lean` is what Aeneas generates from `src/lib.rs`, so the proof in
`lean/Proofs.lean` is about the Rust itself. This run tests the Rust, confirms
that the generated file is still what Aeneas produces, and builds the proof.
Pass `--regenerate` to rewrite the generated file after a change to the Rust.
"""

import shutil
import subprocess
import sys
import tempfile
import tomllib
from pathlib import Path

HERE = Path(__file__).parent
LEAN = HERE / "lean"
GENERATED = LEAN / "Varint.lean"


def aeneas_flake() -> str:
    """The Aeneas commit that `lean/lakefile.toml` pins, so the tools and the library match."""
    lakefile = tomllib.loads((LEAN / "lakefile.toml").read_text())
    rev = next(r["rev"] for r in lakefile["require"] if r["name"] == "aeneas")
    return f"github:AeneasVerif/aeneas/{rev}"


def translate() -> str:
    flake = aeneas_flake()
    with tempfile.TemporaryDirectory() as scratch:
        llbc = Path(scratch) / "varint.llbc"
        subprocess.run(["nix", "run", f"{flake}#charon", "--", "cargo", "--preset=aeneas",
                        "--dest-file", llbc], cwd=HERE, check=True, capture_output=True)
        subprocess.run(["nix", "run", flake, "--", "-backend", "lean", llbc, "-dest", scratch,
                        "-loops-to-rec", "-no-progress-bar"], check=True, capture_output=True)
        return (Path(scratch) / "Varint.lean").read_text()


def main() -> int:
    if subprocess.run(["cargo", "test", "--quiet"], cwd=HERE).returncode != 0:
        print("FAIL: the Rust tests fail")
        return 1
    if shutil.which("nix") is None:
        translated = "not rechecked, because nix is not installed"
    else:
        fresh = translate()
        if "--regenerate" in sys.argv:
            GENERATED.write_text(fresh)
        elif fresh != GENERATED.read_text():
            print("FAIL: lean/Varint.lean is not what Aeneas generates from src/lib.rs; "
                  "run with --regenerate, then fix the proof")
            return 1
        translated = "matches src/lib.rs"
    subprocess.run(["lake", "exe", "cache", "get"], cwd=LEAN, capture_output=True)
    if subprocess.run(["lake", "build", "--wfail"], cwd=LEAN).returncode != 0:
        print("FAIL: the Lean proof does not build")
        return 1
    print(f"PASS: Rust tests pass; generated Lean {translated}; proof builds")
    return 0


if __name__ == "__main__":
    sys.exit(main())
