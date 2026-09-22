# Worked example: reservation store

Use when a component's simplicity depends on keeping related state and mutations
together. This original example extends the short example in
[State and invariants](state-and-invariants.md).

## Requirements and assumptions

Allocate a fixed positive number of interchangeable slots within one process.
Requests supply a unique reservation ID and a positive integer quantity. Calls
may overlap. Release restores capacity and can be repeated safely.

Successful IDs retain their original quantity and lifecycle for the store's
lifetime. A retry of a released ID returns `Released`; it does not reserve again.
Reusing an ID with another quantity returns `Conflict`. Unsuccessful `SoldOut`
attempts are not retained, so retrying them may later succeed. This is an explicit
choice, not universal idempotency semantics.

Persistence, ID expiration, fairness, waiting for capacity, and external actions
are outside this example. Adding any of them requires extending the contract.

## State and representation

```text
capacity: positive integer
remaining: integer
reservations: map<Id, {quantity: positive integer, status: Active | Released}>
```

The invariant at observable operation boundaries is:

```text
0 <= remaining <= capacity
remaining + sum(quantity for Active reservations) = capacity
```

Released entries are retained so an old request cannot silently become a new one.
This consumes memory proportional to successful IDs over the store's lifetime.
If that is unacceptable, choose an expiration/retention contract and a different
implementation; deleting entries changes retry behavior.

## A tempting but insufficient split

```text
AvailabilityReader.remaining()
ReservationWriter.add(id, quantity)
CapacityWriter.subtract(quantity)
```

Each name describes a step, but the capacity invariant spans all three. Callers
must coordinate them, handle partial failure, and prevent races. Even locking each
individual method permits two callers to observe the same remaining capacity.

Give one component the entire transition:

```text
tryReserve(id, quantity) -> Reserved | Released | Conflict | SoldOut | Invalid
release(id)             -> Released | Unknown
```

## Illustrative transition logic

The following is abstract pseudocode. `atomic` means the implementation provides
exclusive observation and all-or-nothing state publication for the transition;
it is not supplied merely by writing this word or acquiring an arbitrary lock.

```text
tryReserve(id, quantity):
    if quantity is not a positive integer: return Invalid
    atomic:
        if reservations contains id:
            entry = reservations[id]
            if entry.quantity != quantity: return Conflict
            return Reserved if entry.status == Active else Released
        if remaining < quantity: return SoldOut
        publish reservations[id] = (quantity, Active)
                and remaining = remaining - quantity
        return Reserved

release(id):
    atomic:
        if reservations does not contain id: return Unknown
        entry = reservations[id]
        if entry.status == Released: return Released
        publish entry.status = Released
                and remaining = remaining + entry.quantity
        return Released
```

A simple in-memory implementation can serialize operations and ensure potentially
failing preparation occurs before publishing the new state. All readers must use
the same synchronization discipline. No external callback runs inside the state
transition. In a database implementation, determine the transaction and constraints
that enforce the same contract across processes.

## Reason about overlap

For capacity one, two distinct requests for one slot can overlap. Legal outcomes
allow either request to win, but not both. A reservation retry racing its release
can return `Reserved` or `Released` according to the operation order; after release
has completed, a later retry must return `Released`.

[Herlihy and Wing's linearizability paper](https://cs.brown.edu/~mph/HerlihyW90/p463-herlihy.pdf)
provides the formal basis for reasoning about such operation histories. Choosing
that contract does not establish that an implementation satisfies it. Nor does it
make a reservation plus a separate payment one atomic action.

## Verification plan

Start with sequential cases: fill capacity exactly, exceed capacity, retry active
and released IDs, conflict on quantity, release twice, and release an unknown ID.
Check that `SoldOut` can become `Reserved` after another ID is released.

Compare generated operation sequences with a simple model that computes remaining
capacity from active entries. Arrange contested schedules for two reservations,
two releases, and retry versus release. Assert legal histories and the invariant,
not a fixed winner for overlapping calls.

Include exception-safety checks around publication if the concrete representation
can fail during mutation. A successful lock acquisition does not undo partial
mutation when an exception occurs.

## Maintenance evaluation

Changing the internal map or deriving `remaining` rather than storing it should
leave callers unaffected. Adding priority or expiration changes visible semantics
and needs a contract decision. Splitting the map and counter into independent
services would introduce coordination work; it is not justified by the logical
decomposition alone.
