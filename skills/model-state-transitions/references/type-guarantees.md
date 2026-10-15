# What different type techniques can guarantee

Read this to select a mechanism for an invariant that ordinary variants do not
capture. These techniques address different questions; they are not a ladder
on which a more elaborate system is always better.

## Refinements and validated construction

A refinement describes a subset: `{x: T | P(x)}` means a value of type `T` for
which predicate `P` holds. Examples include positive amounts and intervals whose
end is after their start. A refinement checker can require proof that construction
and operations preserve the predicate, sometimes discharging obligations with a solver.

A smart constructor provides a practical runtime boundary:

```text
makePositive: Integer → Result<Positive, ValidationError>
```

Keep construction controlled and prevent mutation that could invalidate the fact.
A brand, newtype, or wrapper can distinguish semantic roles such as `OrderId` and
`CustomerId`; merely attaching the name does not validate the underlying value.
Parsing once and returning a trusted domain value carries more useful information
than returning a boolean and continuing to pass the original unchecked input.

A dependent type can index a type by a value, for example `Vector<Element, length>`.
This can express relationships between values and operations. Such precision is
useful when it removes a concrete partial operation or proof obligation; ordinary
unions and constructors usually suffice for routine application lifecycles.

## Typestate constrains available operations

Typestate makes the current protocol phase part of a value's type:

```text
connect: Disconnected → Result<Connected, ConnectError>
send:    Connected × Message → Result<Connected, SendError>
close:   Connected → Closed
```

These signatures explain which operations are meaningful. They do not by
themselves prevent an old `Connected` alias from being used after `close`.
Construction visibility, ownership, and runtime authority determine that.
Failure also matters: an error result may need to return the original resource
or a new uncertain state. Do not invent a successful next phase when an external
operation has an ambiguous outcome.

Use ordinary enum states when the phase is discovered dynamically or must live
in a heterogeneous collection. Use typestate when phase-specific operations give
callers a simpler API. See the consuming protocol example in [Rust](rust.md).

## Ownership connects a local protocol to actual authority

A linear discipline requires a tracked resource to be used exactly once according
to its rules; an affine discipline permits at most one use, including discarding it.
These restrictions concern resource/capability usage, not “a network request occurs
exactly once.” A type discipline alone cannot prove that an external service
committed an operation once.

Rust moves prevent reuse of a moved non-`Copy` value, which makes consuming
typestate transitions effective for that handle. Borrowing and controlled mutation
help maintain local access rules. Ordinary Rust ownership permits dropping values;
it is not a general promise that a business protocol must eventually complete.
Duplicating a capability, reconstructing it freely, or retaining another path to
the same underlying resource can defeat a protocol designed around unique authority.

TypeScript and Java references can be aliased. Readonly properties and immutable
records restrict forms of mutation; they do not revoke another reference or
consume its authority. An owner object or atomic runtime protocol may therefore
be needed even when the phase-specific API looks like typestate.

## Session types describe communication protocols

Session types describe the order and shape of messages between participants.
A simple protocol might require a request followed by either an acknowledgement
or a rejection, then termination. Compatible endpoint protocols match sends with
receives and account for the available choices. Multiparty systems describe roles
and can derive local views from a global protocol under suitable conditions.

Protocol conformance, communication safety, deadlock freedom, and liveness depend
on the particular type system and its assumptions. Crash behavior, unreliable
delivery, and timeouts require explicit semantics; a typed message union provides
none of these properties automatically. Failure-aware session-type research
illustrates why environmental assumptions belong in the claim.

Consider this approach when independently developed participants repeatedly
violate message ordering contracts and tooling fits the project. A local reducer
with validated events is often the simpler sufficient choice.

## Effect types describe computations

An effect type can expose a computation's success value, expected errors, and
required services. For example, Effect's `Effect<A, E, R>` tracks these channels.
It is complementary to a state type: `A` may itself be a discriminated union,
while the computation producing it may require network access and fail.

Such a signature does not prove termination, idempotency, protocol order, or a
correct state transition. Typed expected failures also do not eliminate defects
or interruption. Effect handlers and runtimes supply operational semantics;
the application still decides ownership and lifecycle policies. See
[TypeScript + Effect](typescript-effect.md) for the verified concrete example.

## Choose the claim before the mechanism

| Question | Candidate mechanism | Additional obligation |
| --- | --- | --- |
| Which alternatives and payloads exist? | Sum/product types | Faithful domain cases and validated boundaries |
| Does a value satisfy a predicate? | Refinement or smart constructor | Establish and preserve the predicate |
| Which operation is available in this phase? | Typestate | Control constructors and stale aliases |
| Who may use or mutate this resource? | Ownership/capability discipline | Match local handles to actual authority |
| Which messages may follow each other? | Session types or protocol machine | Explicit participants and failure assumptions |
| What does this computation require or fail with? | Effect types | Correct orchestration and effects |

The propositions-as-types perspective relates constructing a value to establishing
a proposition. In a proof-oriented system, this can encode substantial correctness
arguments. Do not equate “the application compiles” with a proof of its business
specification: the encoded proposition, trusted constructors, axioms, runtime,
and escape hatches determine what has actually been established.

## Sources

- [F*: refinement and dependent function types](https://fstar-lang.org/tutorial/book/part1/part1_getting_off_the_ground.html)
- [Rust ownership](https://doc.rust-lang.org/book/ch04-01-what-is-ownership.html) and [typestate](https://doc.rust-lang.org/stable/embedded-book/static-guarantees/typestate-programming.html)
- [Barwell et al.: asynchronous multiparty protocols with crash-stop failures](https://mrg.cs.ox.ac.uk/publications/designing-asynchronous-multiparty-protocols-with-crash-stop-failures/)
- [Effect v4 Effect API](https://effect.website/docs/v4/api/effect/Effect)
- [Lean: propositions and proofs](https://lean-lang.org/theorem_proving_in_lean4/Propositions-and-Proofs/)
