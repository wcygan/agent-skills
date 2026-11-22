# Worked examples

Each folder in `examples/` proves a property of real code and has one command that reruns the check. Copy the shape of the one that matches how your code connects to Lean.

| Example | Code | Connection to Lean | Shows |
| --- | --- | --- | --- |
| `examples/varint/` | Python | Hand-written model and a differential test | A proof with no hypothesis |
| `examples/bsearch/` | Python | Hand-written model and a differential test | A hypothesis reported as scope |
| `examples/varint-rust/` | Rust | Aeneas generates the Lean from the Rust | A proof about the code itself, with no model |

## How the Python examples are built

| File | Role |
| --- | --- |
| `<name>.py` | The code under proof. |
| `lean/<Name>.lean` | The model of that code, and the theorems. |
| `lean/Main.lean` | Runs the model on requests from standard input. |
| `check.py` | The one command. It runs `lake build --wfail`, then compares the model with the Python. |

```sh
uv run <skill dir>/examples/varint/check.py
uv run <skill dir>/examples/bsearch/check.py
```

Each needs uv and elan. The first run downloads the Lean version that `lean/lean-toolchain` pins. A pass prints one line, such as:

```text
PASS: proof builds; model and varint.py agree on 4411 inputs
```

The theorems are about the Lean functions. `check.py` sends the same generated requests to the model and to the Python, and compares every answer. The seed is fixed, so that a failure repeats. The model recurses and the Python loops, so the two do not look alike; the differential test is what shows that they compute the same thing.

## Varint: a proof with no hypothesis

`encode` writes a non-negative integer seven bits to a byte, and `decode` reads it back.

- `decode_encode`: for every integer `n` and every list of following bytes, decoding the bytes of `n` returns `n` and leaves the following bytes untouched. A break loses or corrupts a stored number.
- `encode_byte`: every byte that `encode` writes is below 256.

Both depend only on `propext` and `Quot.sound`. The 4,411 requests are integers up to 200 bits, random byte strings, encodings with a byte added, and encodings with the last byte removed.

Each of these breaks was made, seen to fail, and restored:

| Break | Result |
| --- | --- |
| `while n > 0x80` in `encode` | ``FAIL: on `e 128` the model gives `128 1` and varint.py gives `128` `` |
| `8 * i` for `7 * i` in `decode` | `FAIL` on a decode request, with both answers |
| `n ≤ 128` for `n < 128` in the model | The proof of `decode_encode` leaves an unsolved goal |
| `sorry` in a proof | `lake build --wfail` fails |

Not covered: negative integers, where `encode` raises and the model has no such input; and bytes above 255 in the model's `decode`, which a Python `bytes` value cannot hold.

## Binary search: a hypothesis reported as scope

`search` returns an index of the target in a list of integers, or nothing.

- `search_found`: an index that `search` returns is inside the list and holds the target. This has no hypothesis, so it is true of an unsorted list too.
- `search_missing`: when the list is sorted and `search` returns nothing, the target is at no index. A break makes a caller treat a present value as absent.

Together they say that on a sorted list, `search` returns an index exactly when the target is present. `Sorted` is the scope of the second theorem, and the hand-off must say so. The file shows that the hypothesis is needed and not a convenience: `#guard search #[3, 1, 2] 3 = none` is a list that holds the target where `search` returns nothing.

Both theorems depend only on `propext`, `Classical.choice`, and `Quot.sound`. Half of the 4,005 requests are unsorted lists, because the model and the Python must agree there too, although the proof of absence does not apply.

| Break | Result |
| --- | --- |
| `hi = mid - 1` in the Python | `FAIL` on a list where the model finds the target and the Python does not |
| `lo = mid + 2` in the Python | `FAIL`, the same way |
| `mid + 2` for `mid + 1` in the model | The proof of `go_missing` fails |
| `sorry` in a proof | `lake build --wfail` fails |

Not covered: a list that the caller did not sort, for absence; which index is returned when the target occurs more than once; and integers beyond the generated range, for the agreement between the model and the Python.

## Varint in Rust: a proof about the code itself

`src/lib.rs` is the same codec on `u64`, with a `round_trip` function that encodes into a fresh buffer and decodes it. Aeneas translates the crate to `lean/Varint.lean`, and `lean/Proofs.lean` proves theorems about that generated file. Nobody wrote a model, so there is no differential test.

```sh
uv run <skill dir>/examples/varint-rust/check.py
```

It needs uv, elan, cargo, and nix. The check runs the Rust tests, translates the crate again and compares the result with `lean/Varint.lean`, then runs `lake build --wfail`. A pass prints:

```text
PASS: Rust tests pass; generated Lean matches src/lib.rs; proof builds
```

- `round_trip_spec`: for every `u64`, `round_trip` does not panic and returns the number it was given. In generated code every arithmetic step, index, and `push` can fail, so "does not panic" is part of the statement and is proved. It has no hypothesis and depends only on `propext`, `Classical.choice`, and `Quot.sound`.

The proof has two layers, and the split is worth copying. `encode_loop_spec` and `decode_loop_spec` show that each Rust loop computes a plain function on numbers, `bytes` and `decodeSpec`. `decodeSpec_bytes` then proves the round trip on those plain functions with ordinary arithmetic. Aeneas's `step*` tactic does most of the first layer.

What this route costs, measured here:

- **Tools.** Charon and Aeneas have no installer. `check.py` runs both with `nix run` at the commit that `lean/lakefile.toml` pins, so the tools and the Lean library match. The first run builds them, which took several minutes. Without nix, the check still builds the proof and says that the translation was not rechecked.
- **Mathlib.** The Aeneas Lean library depends on Mathlib. `lean/.lake` is 7.7 GB after `lake exe cache get`. A warm check takes about 13 seconds.
- **Rust that translates badly.** The `?` operator on an `Option` becomes two axioms that no proof can see through, so `decode` uses `let ... else`. Check the generated file for `axiom` before you plan a proof.
- **Loops.** The `-loops-to-rec` option turns each loop into a recursive function, which is the form that induction and `step*` handle.

| Break | Result |
| --- | --- |
| `while n > 128` in `encode` | The Rust test fails |
| The same break with the test removed | `FAIL`: the generated file no longer matches. After `--regenerate`, the proof of `encode_loop_spec` fails |
| `sorry` in a proof | `lake build --wfail` fails |

Not covered: `encode` into a buffer that is already near `usize::MAX` bytes, which `encode_spec` rules out with a hypothesis and `round_trip` never does; what `decode` returns on bytes that `encode` did not write; and the translation itself, since the proof trusts that Charon and Aeneas give the generated Lean the meaning of the Rust.

## What the Python examples do not cover

The proof covers every input of the model. The differential test covers only the generated inputs of the Python. A difference between the two on an input that was never generated would not be found.
