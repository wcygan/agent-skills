# Verification

Use when selecting evidence for a decomposition or an implementation change.
Match checks to behavioral obligations and changed risks. Test count, coverage,
and a cleaner diagram are not substitutes for those obligations.

## Choose an independent oracle

Use requirements, known input/output cases, an existing trusted implementation,
or a simpler model. Preserve useful baseline checks. When updating tests, avoid
changing every expected result merely to agree with the new implementation.

For a structural-only change, comparisons should include observable errors,
effects, and order where promised. If behavior is intentionally changed, identify
the authority for that change and the separate cases that establish it.

## Select checks by responsibility

| Responsibility | Useful evidence | What it does not establish |
|---|---|---|
| Pure calculation | Boundary examples and domain properties | Correct external facts or commit behavior |
| Representation owner | Operation sequences and invariant checks | Concurrent safety unless interleavings are covered |
| Provider adapter | Contract fixtures and relevant integration checks | Whole workflow recovery |
| Coordinator | Success, partial failure, cancellation, cleanup | All collaborator internals |
| Concurrent transition | Controlled schedules and history/model checks | Every possible execution from a few passing runs |
| Behavior-preserving replacement | Differential checks against a trusted baseline | Correctness of defects shared with the baseline |

Use existing project tooling. A trivial extraction with adequate existing coverage
does not require a new property-testing framework.

## Example: selection policy

For the delivery selector in [Stepwise refinement](stepwise-refinement.md):

- A selected option satisfies zone, mass, and deadline constraints.
- No eligible option has a lower specified ordering key.
- Permuting a catalog of uniquely identified options preserves the result.
- An empty catalog returns the specified absence outcome.

The first property alone is insufficient: an implementation that returns
`NoOption` for every input may satisfy a conditional assertion about selected
values. Also establish that a result exists whenever at least one option is
eligible. Generate boundary and tied values deliberately, not only typical ones.

## Example: stateful model comparison

For a reservation store, a small sequential model can map IDs to quantities and
compute available capacity by summing active reservations. Generate reserve,
retry, release, and conflicting-request actions; compare outcomes and capacity
after each action. Keep the model simpler than the optimized implementation.

[Hypothesis's stateful-testing documentation](https://hypothesis.readthedocs.io/en/latest/stateful.html)
demonstrates generating action sequences and comparing a system with a model.
This approach is applicable with equivalent tools in other languages. Generated
sequential histories do not automatically test concurrent schedules.

For the race where two reservations compete for one slot, arrange both operations
at the contested point using the project's concurrency test facilities, then
verify the legal outcomes. Avoid using arbitrary sleeps as the only evidence that
an interleaving occurred.

## Verify composition and effects

Inspect whether one component's result satisfies the next component's assumptions.
Examples include money units, normalized identifiers, owned versus borrowed
buffers, and whether a partial read is a valid record.

When failure can follow a commit, test that the retry uses the same identity and
does not apply the effect again under the promised contract. Use the actual store
for guarantees implemented by transactions or uniqueness constraints. A permissive
fake can validate sequencing while missing the real consistency requirement.

## Establish structural benefit separately

After behavioral checks, inspect one representative maintenance scenario. Record
the decision's new owner, callers relieved of knowledge, and any new coordination
cost. This is an argument supported by code inspection; label it accordingly.
Tests show behavior, not that a design is universally easier to maintain.

Complete verification when relevant obligations have evidence or explicit gaps.
Report commands and observed results, distinguishing a proposed test from one
actually executed. Broaden testing when failures or unresolved risks justify it.
