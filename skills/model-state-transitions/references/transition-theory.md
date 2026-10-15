# From valid values to valid behavior

Read this when explaining why a model excludes a bad history, or when deciding
what must be included in state. It builds on [type algebra](type-algebra.md).

## A transition system

Use four ingredients:

- `S`: the modeled states, including relevant payloads.
- `S0`: the permitted initial states, a subset of `S`.
- `E`: events or actions that can affect the model.
- `T`: the transition relation; `T(s, e, s')` means event `e` may take `s` to `s'`.

A deterministic reducer implements a function such as `step: S × E → S`.
A partial function omits disallowed pairs; a total API can instead return a
decision such as `Accepted(next, effects) | Rejected(reason) | Ignored` for every
input pair. This makes the rejection policy explicit without declaring every
event a legitimate business transition. Exceptions and nontermination still
need attention before calling an implementation mathematically total.

A relation can describe nondeterminism: several outcomes may be permitted for
the same state and event. This is useful for environmental responses and concurrent
schedules. Model the uncertainty instead of assuming the convenient ordering.

## State must remember distinctions that affect the future

If two histories need different responses to the same next event, a model that
collapses them into one state has forgotten relevant information.

```text
History A: start request 1
History B: start request 1; replace it with request 2
Next event: request 1 completes
```

Both histories end in `Loading` if only the phase is recorded, but the correct
responses differ. Carry the active identity in state: `Loading(requestId)`.
State is the summary of the past needed to decide future behavior; it need not
store the full event log. IDs and epochs must remain distinct over the relevant
message lifetime, including restart when late messages can cross it.

## Representable, reachable, and permitted are different

A state may belong to `S` yet never be reachable from `S0` through `T`.
Reachability means there is a finite allowed sequence from an initial state to it.
A trace is a sequence of states and labeled transitions; temporal properties
constrain these traces, not just the shape of one value.

`Cancelled` and `Completed(receipt)` can both be valid states while
`Cancelled → Completed(receipt)` is a forbidden edge for the same attempt.
Conversely, accepting a late receipt may be the correct domain policy when it
records a remote operation that actually committed. Decide the rule before
encoding it; state machines enforce the selected model, not the model's truth.

## Why invariant preservation works

Let `I(s)` be a predicate that should hold in every reachable state. The standard
inductive argument has two obligations:

```text
Initialization:  for every s in S0, I(s)
Preservation:    I(s) and T(s, e, s') imply I(s')
```

If both hold for all modeled transitions, induction on trace length establishes
`I` for every reachable state. Sometimes the desired invariant is not inductive
by itself: strengthen it with supporting facts that also hold initially and are
preserved. Testing some transitions provides evidence, not this universal proof.

The implementation must also satisfy the premises: initial construction, decoding,
restoration, and every mutation path must respect the model. A direct setter or
another database writer creates an extra transition, invalidating a proof that
omitted it. Concurrent check-then-write operations need an atomic enforcement
boundary to act like the single transition assumed by the model.

## Safety and progress

Safety rules out a bad finite prefix of behavior, such as publishing an obsolete
result. State invariants are one way to express safety. History-sensitive safety
may need extra state, such as a generation or a record of consumed capabilities.

Liveness requires eventual progress, such as accepted work eventually resolving.
A machine that stays in `Loading` forever can preserve every data invariant.
Progress claims therefore need assumptions about dependency responses, scheduling,
retries, cancellation, and fairness. A timeout creates an explicit outcome; it
does not prove that remote work stopped. Finite tests establish only the bounded
progress they exercise. See [verification](verification.md) for evidence choices.

## Finite control does not imply a finite state space

A machine with three phase names and an arbitrary counter has finite control but
potentially infinitely many modeled states. This is often called an extended
state machine. Hierarchy shares behavior among substates; parallel regions
represent combinations of active states. Neither removes cross-region invariants
or the need to account for relevant interleavings.

Abstraction can make reasoning tractable. A concrete implementation state `c`
maps through `alpha(c)` to a simpler abstract state. One useful safety argument
requires every concrete step to correspond to an allowed abstract step or an
internal step that leaves the abstract observation unchanged, with initial states
also corresponding. The mapping must retain distinctions relevant to the property.

For example, abstracting an arbitrary request ID to “current” versus “obsolete”
can preserve the stale-result question. Abstracting both to “some response” loses
it. Adding abstract behaviors can produce spurious counterexamples; excluding
real behaviors can hide bugs. An infinite sequence of invisible internal steps
also shows why a safety-preserving abstraction need not preserve progress.

## Apply the theory

Before claiming a guarantee, answer:

1. Which values are representable, and which are reachable?
2. What information distinguishes histories requiring different future behavior?
3. What establishes the invariant initially and preserves it on every relevant edge?
4. Can an actor, restore path, or external writer bypass those edges?
5. Does the claim concern safety, progress, or both, and under which assumptions?

These questions support a small reducer just as well as a formal specification.
Use [execution boundaries](execution-boundaries.md) for the operational mechanisms.

## Sources

- [Lamport: Specifying Systems](https://lamport.org/tla/book.html): state machines, invariant proofs, and refinement.
- [Lamport: Safety, Liveness, and Fairness](https://lamport.org/tla/safety-liveness.pdf): properties of behaviors and their assumptions.
- [W3C SCXML](https://www.w3.org/TR/scxml/): executable statechart semantics, hierarchy, and parallel configurations.
