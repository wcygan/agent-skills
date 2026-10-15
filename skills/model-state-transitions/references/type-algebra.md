# The algebra of domain types

Read this to derive a representation from domain rules. The notation below is
language-neutral: `A × B` means a pair and `A + B` means a tagged choice. It is
not TypeScript syntax. The concrete references translate these ideas into code.

## Types describe possible values

A useful starting model treats a type as a set of possible values, its inhabitants.
Ask which values have a legitimate domain meaning before choosing fields.
This is an abstraction: runtime nulls, unsafe operations, mutation, and divergence
require additional reasoning in real languages.

Let `D` be the legitimate domain situations and `R` the representations admitted
by the model. An ideal representation has these properties:

- Every admitted representation has a valid meaning in `D`.
- Every required situation in `D` can be represented.
- Situations callers need to distinguish remain distinguishable.
- Equivalent meanings do not require redundant, synchronized fields without a reason.

The goal is faithful representation, not the fewest possible states. A model that
deletes a legitimate workflow is too restrictive even if it prevents many bugs.
Multiple representations can intentionally mean the same thing, for example
cached or normalized forms; the cost is maintaining their consistency.

## Products express facts that coexist

`A × B` contains one `A` and one `B`. Records and tuples are product-like:

```text
Address = Street × City × PostalCode
```

For finite sets, the number of possible pairs is `|A| × |B|`, where `|A|` means
the number of inhabitants of `A`. Two independent booleans have four combinations.
The combination is correct only when those combinations belong to the domain.

For example, `isPending: Bool × isApproved: Bool` admits both true and both false.
If the domain allows exactly one phase at a time, the product admits unwanted
combinations. If playback and mute really vary independently, their product is
appropriate. Do not turn every product into a sum merely to reduce a count.

## Sums express alternatives

`A + B` chooses one tagged branch with its payload. Tags distinguish branches even
when their payload types overlap. For finite sets, its cardinality is `|A| + |B|`.

```text
Decision = Pending | Approved(Approval) | Rejected(Reason)
```

Each branch defines which facts must coexist in that case. This is a sum of
products when a branch carries several fields. The shape excludes approval data
without an approved case and requires a reason in the rejected case. Whether an
approval is authentic or a reason is meaningful needs a stronger contract.

Absence is itself an alternative: `Option<A> = None | Some(A)`, with cardinality
`1 + |A|`. Optional fields are appropriate when absence is independently meaningful.
Several options are a warning sign when their presence must be correlated.

For a finite payload type `A` of size `n`, `Bool × Option<A>` admits `2(1+n)`
values. If the actual domain is `Open | Done(A)`, it needs `1+n` cases: one open
case and one completed case for each payload. The extra combinations are exactly
what the weaker representation forces every reader to interpret or reject.
These counts explain a modeling choice; they are not a software quality metric.

## Algebra helps reveal equivalent structures

The empty type has no inhabitants; the unit type has one. At the value-set level:

```text
A + Empty ≅ A             A × Unit ≅ A
A × Empty ≅ Empty        A × (B + C) ≅ (A × B) + (A × C)
```

`≅` means values can be converted both ways without losing information. An empty
type is not null, and unit is not optional data. Language constructs such as
TypeScript `never`, Rust's uninhabited enums, and unit values approximate these
roles subject to each language's rules.

The distributive law explains why shared data can live outside a variant or be
repeated in each branch. For example, `OrderId × (Draft | Submitted(Receipt))`
preserves the same information as two branches each carrying `OrderId`. Choose
the form that makes ownership and updates clearest. Do not factor a field out if
it is required only in some branches.

For finite `A` and `B`, there are `|B| ^ |A|` mathematical total functions from
`A` to `B`: one output choice per input. A programming-language function signature
alone does not establish totality; it may throw, diverge, or perform effects.

## Derive a model rather than decorate a loose one

1. Name the meaningful alternatives in the domain.
2. Within each alternative, collect facts that must coexist.
3. Factor genuinely common data and separate independent concerns.
4. Test the shape with one invalid situation and one legitimate edge case.
5. Identify remaining predicates that the structure cannot express.

A nonempty sequence of `A` can be constructed as `A × List<A>`, rather than
allowing an empty list and making every consumer reject it. A time interval can
use a start plus a nonnegative duration, but the duration still needs validation
and endpoint arithmetic must respect overflow. A clever shape does not erase
numeric or external-world assumptions.

Do not encode every conceivable fact in a type. Strengthen the model where a
consumer would otherwise need a partial operation, repeated validity check, or
hidden convention. Preserve usability and legitimate variation.

## From values to behavior

Even a perfect `Draft | Submitted(Receipt)` value model permits constructing a
new valid draft after submission. Whether that history is legal is a separate
question. Continue with [transition theory](transition-theory.md). For predicates
and controlled construction, read [type guarantees](type-guarantees.md).

## Sources and concrete bridges

- [Cornell: algebraic data types and tagged alternatives](https://cs3110.github.io/textbook/chapters/data/algebraic_data_types.html)
- [F*: types as values and refinement predicates](https://fstar-lang.org/tutorial/book/part1/part1_getting_off_the_ground.html)
- [TypeScript + Effect](typescript-effect.md): union payloads and Schema decoding.
- [Rust](rust.md): enum payloads; [Java](java.md): sealed record variants.
