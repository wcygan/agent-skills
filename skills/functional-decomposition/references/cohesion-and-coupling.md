# Cohesion and coupling

Use when responsibilities appear scattered, a component has unrelated jobs, or
many boundaries carry assumptions about each other. The categories below are
practical inspection lenses, not a universal metric taxonomy.

## Inspect the kind of dependency

| Dependency | Example | Possible response |
|---|---|---|
| Behavioral | Renderer calls a price calculator | Often an intentional collaboration |
| Representation | Renderer interprets calculator's internal status bits | Return a meaningful result type |
| Temporal | `publish` is valid only after hidden initialization | Make lifetime explicit or establish it internally |
| Shared mutation | Validator and writer modify the same work object | Name ownership and pass narrower values |
| Policy | Two paths implement the same eligibility rule | Give the rule one appropriate owner |
| Lifecycle | Two resources must be opened/closed together | Place their coordination where both lifetimes are known |

A call is not automatically harmful coupling. Replacing a direct call with an
event can add ordering and failure dependencies even while removing an import.
Inspect what another part must know and what changes together.

## Example: address formatting

Two functions both join street, city, and postal code. One produces a human label;
the other produces a carrier's machine input. Their similar syntax suggests a
shared helper, but their contracts may differ: the label can localize punctuation,
while the carrier format must remain fixed.

A sensible shared part might be address validation if the validity rules truly
match. Keep the two output policies separate when their consumers can require
different changes. Conversely, two invoice paths that must apply the identical
rounding rule should share its meaning even if their current syntax differs.

## Find cohesion in actual work

Ask what unifies a candidate component: a domain rule, a data invariant, a resource
lifetime, an algorithm, or a caller capability. "All utilities" and "all methods
called during startup" usually need more explanation. A coordinator can be
cohesive around a use case while delegating the domain and infrastructure details.

Maintenance history can reveal repeated joint edits. Inspect the content of a
sample rather than treating co-change counts as proof. A formatter, generated
client update, or rename can touch unrelated responsibilities together. A single
feature can legitimately cross several well-chosen modules.

## Original review worksheet

```text
Proposed group: address validation + shipping label rendering
Shared invariant: validated fields satisfy carrier restrictions
Independent variation: localization changes label presentation only
Knowledge crossing the boundary: validated address value
Recommendation: keep validation reusable, keep presentation policy separate
Evidence to inspect: carrier contract and localization requirements
```

Use a worksheet only when the relationship is disputed. Ordinary cohesive code
does not need a numerical score to justify staying together.

## Evidence limits

[Paixão and colleagues' study](https://discovery.ucl.ac.uk/id/eprint/1576532/)
examines structural optimization across software releases and the disruption it
can introduce. Its relevance here is that improved cohesion/coupling measures
must be weighed against restructuring cost. It does not establish that minimizing
imports, maximizing helper reuse, or changing the most files improves maintenance.

Prefer a concrete conclusion: "This change removes shared knowledge of the
carrier encoding from two callers; it adds one value conversion." That is more
reviewable than "the architecture is now loosely coupled."
