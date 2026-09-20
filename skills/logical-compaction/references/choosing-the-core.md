# Choosing the core

Use this reference when priorities are ambiguous or the user wants a measurable
retention target.

## Translate value into scenarios

Start with the job the user needs completed, then identify the smallest end-to-end
scenario set that delivers it. A scenario includes its meaningful failure outcomes:
“export a correct report” includes how a failed read avoids producing a misleading
success file.

Use explicit user priorities first, then documented requirements and available
usage evidence. Label code-based inferences as assumptions. Code size, test count,
and path frequency alone do not establish product value.

Classify capabilities:

| Class | Decision |
| --- | --- |
| Core workflow | Preserve its observable success and failure requirements. |
| Supporting invariant | Retain the guarantee; simplify its mechanism where justified. |
| Secondary capability | Cut when authorized and its loss is acceptable. |
| Uncertain capability | Investigate or ask if its classification changes the core. |

Rarity alone does not make a capability expendable. A rarely used recovery path
may be necessary to make the primary workflow usable after failure.

For an ambiguous request, make the decision concrete: “The smallest useful core
appears to be CSV export on demand; scheduled delivery would disappear.” Ask about
that product choice only if existing authorization does not settle it. Avoid asking
the user to approve routine helper, syntax, or test organization choices.

## Handle numeric targets

Prefer a named scenario set when no credible denominator exists. Report “retains
CSV export on demand” instead of inventing “80% of functionality.”

When usage or user-assigned weights exist, record their source and coverage:

```text
retained share = sum(weights of fully retained scenarios) / sum(all scenario weights)
```

State what the weights measure: observed executions, user priorities, or another
explicit unit. Label estimates. Keep mandatory invariants as pass/fail constraints
outside the weighted score. Avoid overlapping scenarios that double-count value.
A retained scenario must pass its complete contract to count as retained.

A code-reduction target measures something different. Report its baseline and
final size separately; pursue further cuts only while the core remains intact.

## Resolve competing cuts

Prefer cuts that remove a distinct reason for complexity: one export format can
cost little, while removing scheduled execution may eliminate job persistence,
timers, retry bookkeeping, and cancellation states.

Compare the whole consequence of each cut, including caller changes and boundary
handling. A tiny implementation with many compatibility shims may be a poor trade.
Use qualitative rankings when precise cost or value data would be invented.

Finish with a scenario set and a loss list specific enough to judge a diff. If
the requested size target cannot coexist with the core, report the conflict and
the next capability that would have to go.
