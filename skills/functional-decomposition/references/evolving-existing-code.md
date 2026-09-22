# Evolving existing code

Use when responsibilities need to move while established behavior and callers
continue to work. Separate discovering a better boundary from the cost of getting
there.

## Establish the actual contract

Read callers and representative tests, including failures. Note ordering,
formatting, side effects, and retry behavior that users may observe. A surprising
behavior is not automatically safe to change during restructuring. Identify the
intended behavior source before combining a bug fix with a refactor.

Inspect relevant history when it can clarify ownership. Work on the smallest
coherent area whose change produces a meaningful benefit. Repository-wide naming
cleanup should not be bundled into a local responsibility move.

## Example: extract pricing from a renderer

Current shape:

```text
renderInvoice(data)
    load tax configuration
    calculate and round line amounts
    calculate total
    format HTML
```

Assume the requested change is to share the existing calculation with a CSV export
while preserving current invoice behavior. A coherent sequence is:

1. Capture representative amounts, rounding boundaries, and rendered output using
   existing fixtures or focused characterization checks.
2. Extract a calculation accepting explicit configuration and producing finalized
   amounts. Keep the renderer's public contract intact initially.
3. Have HTML rendering consume those amounts; verify existing behavior.
4. Add the authorized CSV path using the same calculation and its own formatting.
5. Remove obsolete calculation code and temporary forwarding where no caller or
   compatibility obligation remains.

The calculation may remain in the same file initially. The important change is
who owns the amounts. Preserving HTML output while silently changing rounding
would fail the contract even if both new outputs agree with each other.

## When a larger migration needs a bridge

[Fowler's Branch By Abstraction](https://martinfowler.com/bliki/BranchByAbstraction.html)
describes introducing an abstraction through which old and new implementations
can coexist during gradual replacement. Apply this when the replacement cannot
reasonably fit into one coherent change.

For each bridge, state its users, how selection works, and the condition for
removing it. A flag or adapter without an exit condition becomes permanent
complexity. Prefer a direct edit when coexistence provides no benefit.

## Preserve one source of truth

Migration is especially difficult when both implementations write shared state.
Specify which one is authoritative at each stage and how stale readers or writers
are prevented. Mirroring calculations can help compare results; mirroring writes
can duplicate external effects. Shadow execution must have an explicitly safe
effect policy.

Before moving persistence ownership, inspect transaction scope, schema compatibility,
deployment order, and rollback constraints. A source-level move alone does not
establish data migration safety. If the requested scope excludes those changes,
deliver the compatible portion and identify the decision that remains.

## Balance improvement against disruption

[Paixão and colleagues](https://discovery.ucl.ac.uk/id/eprint/1576532/)
report that optimizing structural measures can entail substantial reorganization.
Use that as a reason to evaluate migration burden alongside the proposed structure,
not as a blanket argument against refactoring.

Record the maintenance task made easier, temporary complexity introduced, and
tests required at each intermediate state. Keep an existing design when the
benefit is speculative and the disruption is concrete.

## Verification and completion

Run focused checks after each coherent change and the repository's required gate
at completion. Check references to moved symbols and inspect the diff for behavior
changes hidden among moves. Remove dead compatibility code only after establishing
that no supported caller still relies on it.

Report established equivalence, any intentionally changed behavior, unfinished
migration stages, and actual checks. Passing compilation proves less than
preserving outputs, effects, and recovery behavior.
