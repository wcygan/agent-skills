# Comparing decompositions

Use when more than one structure seems reasonable or when restructuring needs a
concrete justification. Compare alternatives against the same behavior and
constraints; do not give one design credit for requirements the other lacks.

The comparison method below is engineering synthesis informed by
[Parnas's change-oriented comparison](https://www.cs.lafayette.edu/~gexia/cs301/resources/parnas.html)
and [Ousterhout's advice to consider alternative designs](https://web.stanford.edu/~ouster/cgi-bin/cs190-spring15/lecture.php?topic=complexity).

## Make alternatives meaningfully different

Good alternatives move knowledge, ownership, or coordination. Renaming the same
classes does not create a new design. Include keeping the existing structure when
it already satisfies the task, especially for mature code with a migration cost.

State the assumptions before comparing: expected callers, data volume, state
lifetime, likely changes, and required failures. An uncertain assumption should
produce a conditional recommendation or a focused investigation.

## Example: shipping quote calculation

Assume two callers require the same eligibility and price-selection policy. One
external carrier integration currently supplies offers; selection must be tested
without network access. Compare:

- **A: end-to-end helper per caller.** Each helper retrieves and selects offers.
- **B: shared selection plus carrier access.** Callers coordinate retrieval with
  a shared calculation over normalized offers.
- **C: configurable quote pipeline.** Stages and strategies are registered through
  a generic framework.

| Scenario | A | B | C |
|---|---|---|---|
| Change selection tie rule | Inspect both helpers | Change shared policy | Find/configure owning strategy |
| Change provider response format | Potentially both callers | Change carrier translation | Change provider stage |
| Test selection with explicit offers | Separate it or mock retrieval | Direct value-based test | Construct required pipeline context |
| Trace a rejected offer | Read local helper | Follow access and policy | Follow registered stages and configuration |
| Add unrelated carrier-specific capability | Local integration work | Keep capability in carrier access | May require extending generic protocol |

For these assumptions, B has a concrete benefit without C's configuration burden.
If there were one short caller and stable rules, A might be adequate. If users
must compose stages dynamically, C would answer an actual requirement; it would
still need evidence that the framework's contracts fit those stages.

## Choose observable dimensions

For each credible change or failure, record:

1. Which responsibility owns the change.
2. Which callers or contracts also change, and why.
3. What a maintainer must understand to implement it.
4. Which checks establish correct behavior.
5. What conversion, runtime, or migration costs are introduced.

Use counts only when they are actually known. Avoid inventing a numerical score
for maintainability. Fewer files edited can still hide a difficult global rule
inside one large component.

## Resolve the important uncertainty

If the decision hinges on performance, measure the relevant operation with
representative inputs. If it hinges on API usability, write two realistic caller
examples. If it hinges on state ownership, trace a concurrent or failure schedule.
Choose the cheapest evidence that distinguishes the alternatives.

Do not implement several full architectures solely to complete a comparison.
Likewise, do not require alternatives for every routine private helper.

## Decision record

```text
Chosen structure and why:
Responsibilities and private decisions:
Preserved behavior and constraints:
Scenario demonstrating the benefit:
Added costs and accepted dependencies:
Remaining uncertainty and when to revisit:
Implementation/verification next step, if authorized:
```

This can be a short paragraph for a small change. A formal ADR is appropriate
only when the project or decision needs one. Continue authorized implementation
after choosing the design.
