# Worked example: a varint codec in Python

`examples/varint/` proves a property of Python code through a Lean model and a differential test. Copy its shape when the code under proof is not Lean.

| File | Role |
| --- | --- |
| `varint.py` | The code under proof. `encode` writes a non-negative integer seven bits to a byte, and `decode` reads it back. |
| `lean/Varint.lean` | The model of both functions, and the theorems. |
| `lean/Main.lean` | Runs the model on requests from standard input. |
| `check.py` | The one command. It builds the proof, then compares the model with `varint.py`. |

## Run it

```sh
uv run <skill dir>/examples/varint/check.py
```

It needs uv and elan. The first run downloads the Lean version that `lean/lean-toolchain` pins. A pass prints:

```text
PASS: proof builds; model and varint.py agree on 4411 inputs
```

## What is proved

- `decode_encode`: for every integer `n` and every list of following bytes, decoding the bytes of `n` returns `n` and leaves the following bytes untouched. A break loses or corrupts a stored number.
- `encode_byte`: every byte that `encode` writes is below 256.

Neither theorem has a hypothesis. Both depend only on `propext` and `Quot.sound`.

## What ties the proof to the Python

The theorems are about the Lean functions. `check.py` sends the same 4,411 generated requests to the model and to `varint.py`, and compares every answer. The requests are integers up to 200 bits, random byte strings, encodings with a byte added, and encodings with the last byte removed. The seed is fixed, so that a failure repeats.

The model recurses and the Python loops, so the two do not look alike. That is expected: the differential test is what shows that they compute the same thing.

## The check can fail

Each of these breaks was made, seen to fail, and restored:

| Break | Result |
| --- | --- |
| `while n > 0x80` in `encode` | ``FAIL: on `e 128` the model gives `128 1` and varint.py gives `128` `` |
| `8 * i` for `7 * i` in `decode` | `FAIL` on a decode request, with both answers |
| `n ≤ 128` for `n < 128` in the model | The proof of `decode_encode` leaves an unsolved goal |
| `sorry` in a proof | `lake build --wfail` fails |

## What is not covered

- Negative integers. `encode` raises, and the model has no such input.
- Inputs outside the generated set, for the agreement between the model and the Python. The proof covers every input of the model; the test covers 4,411 inputs of the Python.
- Bytes above 255 in the model's `decode`. A Python `bytes` value cannot hold one.
