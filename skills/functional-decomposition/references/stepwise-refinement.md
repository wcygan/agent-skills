# Stepwise refinement

Use when required behavior is clear enough to start but the algorithm or data
representation is not. The outcome is an implementable account of behavior,
including failure cases and intermediate values.

## Source basis

[Wirth's 1971 paper](https://john.cs.olemiss.edu/~hcc/csci658/notes/localcopy/WirthStepwiseRefinement.pdf)
develops a program through progressively more concrete operations and data. It
emphasizes explicit design decisions and considering alternatives. The procedure
and example below apply that approach to an ordinary application component.

## Refine the unknowns

1. Express the result in domain terms, including a failure outcome.
2. Write a small sequence, branch, or loop that would produce it if its named
   operations existed.
3. Describe the values crossing those operations. Resolve ambiguous units,
   identity, ordering, and optional values before inventing containers.
4. Refine the operation whose ambiguity most constrains the others.
5. Revisit earlier choices when an implementation reveals a new constraint.

At each level, explain what the operation establishes for the next one. A function
name such as `processData` does not establish anything without a behavioral
description. A named conceptual step can remain inline if extracting it would
obscure local control flow.

## Worked example: find a delivery option

Assumptions: a request contains parcel mass in grams, a destination zone, and a
delivery deadline. A supplied catalog contains supported zones, maximum mass,
arrival estimates, and integer prices in one currency. No network access occurs
inside selection. Among eligible options choose the cheapest, then the earliest,
then a stable option identifier. Return `NoOption` if none qualifies.

First refinement:

```text
selectDelivery(request, catalog)
    eligible = retain options satisfying the request
    return cheapest eligible option, or NoOption
```

The word "cheapest" hides a tie policy. Refine it and the eligibility rule:

```text
eligible(option, request) =
    request.zone is in option.zones
    and request.massGrams <= option.maxMassGrams
    and option.arrival <= request.deadline

orderKey(option) = (option.priceMinorUnits, option.arrival, option.id)
```

A full sort would work. A single pass retaining the smallest key would also work
and avoids allocating a sorted list when only one result is required. Choose
based on readability and actual catalog size; record any performance requirement
that makes the choice consequential.

Data refinement exposes missing assumptions: mixed currencies require an explicit
conversion policy; estimated arrival times require a common time basis. Those are
behavior decisions, not incidental changes to a tuple.

## Decide what becomes a boundary

`eligible` might become a private predicate because it explains a rule and can be
read independently. `orderKey` might remain a local expression. Catalog retrieval
may live behind a separate boundary because its transport and freshness vary.
The refinement tree does not prescribe a class hierarchy or public API.

For a new implementation, construct enough of a vertical path to test the data
assumptions early. For existing code, first preserve its established tie behavior;
adopting the example's tie policy would be a behavior change.

## Evidence and stopping point

Check no eligible option, exact mass limit, deadline equality, and ties. A useful
property is that the chosen result is eligible and no eligible option has a
smaller specified key. Include invalid-input behavior at the boundary responsible
for it.

Stop refinement when the remaining operations map clearly to ordinary code and
their data and outcomes are unambiguous. Additional naming should improve a
reader's understanding rather than reproduce individual language expressions.
