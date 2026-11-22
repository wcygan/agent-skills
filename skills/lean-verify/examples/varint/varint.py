# /// script
# requires-python = ">=3.11"
# dependencies = []
# ///
"""Variable-length encoding of a non-negative integer, seven bits to a byte.

Every byte but the last has its high bit set. `lean/Varint.lean` models both
functions and proves that `decode` inverts `encode` for every integer.
"""

import sys


def encode(n: int) -> bytes:
    if n < 0:
        raise ValueError("cannot encode a negative integer")
    out = bytearray()
    while n >= 0x80:
        out.append((n & 0x7F) | 0x80)
        n >>= 7
    out.append(n)
    return bytes(out)


def decode(data: bytes) -> tuple[int, bytes] | None:
    """Return the first value and the bytes after it, or None when it is cut short."""
    value = 0
    for i, byte in enumerate(data):
        value |= (byte & 0x7F) << (7 * i)
        if byte < 0x80:
            return value, data[i + 1:]
    return None


if __name__ == "__main__":
    for arg in sys.argv[1:]:
        print(arg, encode(int(arg)).hex(" "))
