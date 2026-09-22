# State and invariants

Use for components that retain mutable data, manage resource lifetimes, or serve
overlapping operations. Begin with the valid states and transitions before
extracting functions around individual reads and writes.

## Source basis

[Cornell's data-abstraction notes](https://www.cs.cornell.edu/courses/cs3110/2009fa/Lectures/lec08.html)
explain how an abstraction function interprets a representation and how an
invariant restricts valid representations. For concurrency,
[Herlihy and Wing](https://cs.brown.edu/~mph/HerlihyW90/p463-herlihy.pdf)
provide the linearizability model: each operation can appear to occur at one
instant during its call. The examples below apply these concepts; they are not
proofs of arbitrary implementations.

## Record ownership and observation points

For each mutable resource, identify:

- Its creator, lifetime, mutators, and finalizer.
- What it represents to callers and which representations are valid.
- Whether references escape to code that can mutate it.
- The points where observers can see it, including callbacks and suspension.
- Which complete transition must preserve consistency.

An internal operation may temporarily break an invariant while restoring it
before observation. This is unsafe if callbacks, exceptions, or concurrent reads
can expose the intermediate state. Treat `await`, unlocked reads, and user code
called under a lock as important inspection points.

## Example: a capacity-limited reservation store

Suppose the store tracks `capacity`, `remaining`, and a map of reservations.
Accepted reservations have positive quantities and unique reservation IDs.

```text
0 <= remaining <= capacity
remaining + sum(active reservation quantities) = capacity
```

A separate `available()` followed by `reserve()` invites this schedule:

```text
A reads remaining = 1
B reads remaining = 1
A inserts reservation for 1
B inserts reservation for 1
```

Instead expose a complete operation:

```text
tryReserve(reservationId, quantity) -> Reserved | SoldOut | Conflict
```

Within one protected transition, check whether the ID already represents the same
request, check capacity, and update both the map and remaining quantity. Returning
the existing result for the same ID and quantity can support retries; reusing an
ID for a different quantity must have an explicit outcome.

A lock can implement this in a single process if all relevant accesses use it.
A persistent multi-process implementation needs an appropriate database operation
or transaction. A process-local lock does not protect other writers.

## Failure and concurrency questions

If a database write commits but its acknowledgment is lost, callers cannot infer
rollback from a timeout. Preserve request identity and provide a way to determine
the established outcome. If reserving also triggers an external action, specify
that action's delivery and retry semantics separately.

Individually atomic `get` and `set` operations do not make their composition an
atomic update. Likewise, a pure decision computed from a snapshot can be stale
when committed. Keep its required validity check in the owning transition.

## Verification example

For capacity one, run two distinct reservations concurrently and check that at
most one succeeds. Retry the winner's ID and quantity and check that capacity is
not consumed again. Try the same ID with a different quantity and check the
specified conflict. After every completed transition, verify the capacity
equation through a test hook or an independent model appropriate to the project.

Also inspect error exits and resource cleanup. Sequential unit tests establish
only the tested sequential behavior; they do not establish the concurrent
contract. See [Stateful component](example-stateful-component.md) for a longer
worked example with explicit assumptions.
