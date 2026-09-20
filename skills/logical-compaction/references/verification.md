# Verification of a reduced contract

Use this reference when existing tests mix kept and cut capabilities, independent
evidence is missing, or verification involves external effects.

## Separate expected losses from regressions

Build a small scenario matrix before changing relevant assertions:

| Scenario | Decision | Expected result after compaction | Evidence |
| --- | --- | --- | --- |
| CSV export on demand | Retain | Correct rows and escaping | Existing CSV fixtures |
| Read report without access | Retain invariant | Access denied | Existing access check |
| Request XML through a surviving API | Cut | Explicit unsupported-format result | New boundary check |
| Scheduled delivery | Cut | Scheduling surface removed | Caller/config search and relevant build |

Keep expected behavior independent of the rewritten implementation. Useful sources
include unchanged fixtures, requirements with concrete examples, a simple reference
calculation, or comparison with the original implementation on retained inputs.
Differential checks establish preservation, not correctness of a pre-existing bug.

When coverage is missing, add the smallest check that protects an essential
scenario or invariant before editing. If a reliable check cannot be established,
do not declare the result verified; isolate which candidate depends on that proof.

## Edit tests without redefining success

- Delete tests that exercise only an authorized removed capability.
- Split mixed tests so retained assertions survive; account for the removed ones.
- Update expected unsupported-input outcomes to match the declared loss contract.
- Keep an unchanged oracle or independent check for every retained scenario whose
  existing assertions change.
- Investigate new failures before classifying them as intentional losses. Test
  names alone do not establish that all their assertions belong to a cut.

Avoid regenerating all expected outputs from the compacted implementation. That
would make accidental behavior changes their own evidence of correctness.

## Check effects and assumptions

Exercise meaningful boundaries within the retained domain, such as empty results,
authorization failure, output field shape, and failure after a partial write.
Choose cases from the target's actual contract rather than an exhaustive generic
edge-case list.

For external effects, use existing isolated integration facilities or a recording
fake that checks requests, ordering, and failure handling. State what it cannot
establish about a live service. Avoid real writes merely to prove a local rewrite.

When a validation check disappears, verify where the accepted input assumption is
now enforced. A type assertion or annotation alone does not validate external data.

## Measure and conclude

Compare production code in the same scope before and after. Report authored test
and documentation changes separately. Count all replacements, including code moved
outside the target, when assessing whether complexity actually decreased.

Pair code size with the dimensions affected by the cuts: fewer supported modes,
branches, state transitions, configuration options, interfaces, or dependencies.
Use the repository's existing measurement tools when available; avoid adding a
measurement framework for one compaction.

Retained checks establish the smaller contract. Boundary checks establish how
removed requests behave. Diff and reference review establish deletion completeness.
Report missing evidence and classified baseline failures beside the relevant result.
