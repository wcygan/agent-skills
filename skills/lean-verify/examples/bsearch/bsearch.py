# /// script
# requires-python = ">=3.11"
# dependencies = []
# ///
"""Binary search over a sorted list of integers.

`lean/Bsearch.lean` models `search` and proves that an index it returns holds
the target, and that on a sorted list it returns nothing only when the target
is absent.
"""

import sys


def search(xs: list[int], target: int) -> int | None:
    lo, hi = 0, len(xs)
    while lo < hi:
        mid = (lo + hi) // 2
        if xs[mid] < target:
            lo = mid + 1
        elif target < xs[mid]:
            hi = mid
        else:
            return mid
    return None


if __name__ == "__main__":
    target, *xs = map(int, sys.argv[1:])
    print(search(xs, target))
