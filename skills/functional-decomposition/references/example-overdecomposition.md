# Worked example: excessive decomposition

Use when implementation structure adds navigation and configuration without
isolating useful knowledge. This original example shows a justified combination
of code, while retaining a small adapter that serves a real purpose.

## Scenario and assumptions

A local application returns a shipping quote for one parcel. It has one provider
and one selection policy. The caller supplies the request; the result is a quote,
a domain absence/rejection, or a provider failure. There is no public extension
system and no requirement for independently deployable stages.

Current path:

```text
QuoteController
  → QuoteService
    → QuoteManager
      → QuoteProcessor
        → QuotePipeline
          → ProviderAdapter
          → CandidateFilter
          → PriceSelector
          → QuoteBuilder
```

Suppose inspection establishes that service, manager, and processor only forward
the same arguments and errors. The pipeline is a fixed list configured in exactly
one place. The adapter translates provider transport and errors. The filter and
selector implement the actual eligibility and tie rules.

These are necessary findings. Names and short bodies alone would not establish
that the layers are redundant.

## Check what each layer owns

| Layer | Observed responsibility | Decision |
|---|---|---|
| Controller | Transport input/output and authorization context | Keep at the actual transport boundary |
| Service/manager/processor | Forward unchanged values | Combine after checking other callers |
| Fixed pipeline | Call retrieval, selection, construction | Replace with direct coordination |
| Provider adapter | Translate protocol and provider failures | Keep its concrete boundary |
| Filter/selector | Coherent quote policy | Group under one calculation, helpers private as useful |
| Builder | Wrap final values | Inline if it adds no validation or ownership guarantee |

Before removing forwarding layers, inspect interfaces, external callers, tracing,
transactions, authorization, and resource lifetimes. A one-line decorator may
still enforce an important contract through language or framework behavior.

## Candidate shape

```text
QuoteController
  → quote(request, provider)
      → provider.fetchOffers(request)
      → chooseQuote(request, normalizedOffers)
```

`chooseQuote` owns selection rules over values. The provider adapter owns protocol
translation. `quote` owns sequencing and maps established provider outcomes into
the use case. These may require only a few functions in existing modules.

Illustrative pseudocode:

```text
quote(request, provider):
    offers = provider.fetchOffers(request)
    if provider failure: return mappedFailure(offers)
    return chooseQuote(request, offers)
```

Private predicates can keep the calculation legible. Removing public layers does
not require writing one long expression or deleting useful internal names.

## Preserve the behavior contract

Suppose old selection chooses the lowest price, then earliest arrival, then a
stable offer ID. Preserve all three criteria. A refactor to `min(price)` could
change ties even while most fixtures pass.

Check whether the removed pipeline supplied a timeout, normalized currencies, or
converted provider errors. Move real behavior to its appropriate owner rather
than deleting it with a wrapper. Keep effect ordering and the number of provider
requests unchanged unless the requested scope authorizes a change.

## Verification and benefit

Use existing end-to-end quote fixtures. Add missing tie or provider-failure cases
only where needed to establish the affected behavior. Test the pure selection
through values and retain adapter integration checks. Tests asserting calls to
obsolete forwarding classes should be assessed for their behavioral purpose,
then replaced by assertions on that purpose where necessary.

The structural benefit is specific: a maintainer now follows a coordinator,
policy calculation, and protocol adapter; forwarding-only contracts and the fixed
registration list disappear. Confirm by tracing the same price-rule change before
and after. Reduced line count alone is not the evidence.

## When to keep the original structure

If callers independently compose pipelines, an extension contract may be real.
If a wrapper preserves a supported public API, compatibility may justify retaining
it. If the current direct implementation is already short and clear, extracting
the proposed pieces could have no benefit. Report that conclusion rather than
forcing a before/after rewrite.

## Documentation connection

Read [Abstraction and granularity](abstraction-and-granularity.md) for extraction
criteria. The example applies the interface-cost perspective in
[Ousterhout's lecture notes](https://web.stanford.edu/~ouster/cgi-bin/cs190-spring15/lecture.php?topic=complexity);
it does not claim those notes prescribe this particular module layout.
