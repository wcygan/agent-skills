---
name: logical-compaction
description: "Reduce code and control-flow complexity by deliberately removing secondary capabilities while preserving a useful core. Use when the user accepts behavior loss for an 80/20 implementation, smaller feature set, or radical code reduction."
license: MIT
metadata:
  author: William Cygan
  version: "0.1.0"
---

# Logical Compaction

Reduce a bounded implementation to its smallest useful core. Delete whole
capabilities and the machinery they require, then simplify the retained flow.
Pursue substantial code removal and fewer concepts to maintain.

Treat “retain 80%” as a prioritization goal: selected workflows must still work
completely. A percentage of passing tests does not measure retained value.

## Choose the workflow

Use this skill when the request authorizes a smaller behavioral contract.
Ordinary cleanup belongs to `simplify-code`, which preserves behavior.

Use `shape-safe-change` when a cut requires unresolved compatibility, rollout,
or migration decisions. Continue independently supported local work; a missing
companion skill does not block work whose requirements can be established here.

## 1. Define the core

Read the request, repository instructions, worktree state, and target. Preserve
existing user changes. Infer a bounded target from the request when possible.

Record a compact contract in the working conversation:

```text
Target and mutable scope:
Core job:
Retained scenarios and correctness requirements:
Authorized capability cuts:
Evidence for prioritization and assumptions:
Focused and final checks:
```

Describe retained scenarios through observable inputs, outputs, and side
effects. Include failure, ordering, access, and performance requirements that
make those scenarios useful. Keep shared invariants outside the loss budget.

Apply the user's existing priorities and delegation of product choices. Ask
only when a missing decision materially changes the retained core or scope;
continue independent work while that decision is pending. Once authorized,
carry cuts through implementation and verification without another phase approval.

When the core is vague, capabilities compete, or a numeric retention target is
requested, read [Choosing the core](references/choosing-the-core.md).

This step is complete when each proposed loss is supported by the request or
delegated judgment, and each retained scenario has an observable success condition.

## 2. Establish the baseline and rank cuts

Trace the target's callers, data, state, errors, and side effects far enough to
distinguish secondary capabilities from mechanisms needed by retained scenarios.
Run the smallest relevant baseline checks and classify existing failures.

When tests mix retained and removed behavior, coverage is missing, or external
effects complicate verification, read [Verification](references/verification.md)
before editing.

Record production code size separately from tests, generated files, and docs,
plus the relevant counts of branches, modes, interfaces, and dependencies.
Use the same scope and measurement method for the final comparison.

For each candidate, record:

```text
Capability removed:
User-visible loss and behavior for formerly supported requests:
Code and supporting machinery unlocked for deletion:
Shared consumers or invariants that must survive:
Unchanged expected-result source or independent check:
Focused check:
```

Rank candidates by removable code and conceptual burden relative to lost value,
confidence, and coupling. Favor a cut that deletes a subsystem over expression
shortening. Search registrations, configuration, generated consumers, and runtime
entrypoints when ordinary callers cannot establish whether code is still needed.

Before implementing each candidate, identify an unchanged expected-result source
or independent check for the retained scenarios and shared invariants it affects.
Add any missing checks needed to distinguish an intentional cut from damage to
the core before editing the implementation. This step is complete when the leading
candidate has that evidence and a bounded deletion scope.

## 3. Cut capabilities, then collapse their machinery

Apply one coherent cut at a time. Remove the capability, its exclusive support
code, and obsolete promises in target-local configuration, tests, and docs.
Update affected callers within scope so the smaller implementation is usable.

After each cut, rescan for newly unnecessary dispatch, wrappers, state,
parameters, configuration, and dependencies. Simplify those remnants before
choosing the next capability. Preserve useful types and named concepts; prefer
direct flow over dense syntax that merely reduces line breaks.

When cuts involve multiple modes, adapters, retries, validation, telemetry, or
stateful workflows, read [Deletion patterns](references/deletion-patterns.md).

Run the candidate's focused checks. Correct a regression within scope or undo
only that candidate, preserving unrelated work. Account for intentional behavior
changes explicitly instead of broadly weakening assertions.

Respect repository review limits. Otherwise bound work by the named target and
coherent cuts; a large deletion alone need not force an arbitrary line-count stop.
If shared consumers or migrations expand the agreed scope, isolate that decision
and continue cuts that do not depend on it.

Repeat until no supported cut or resulting structural simplification remains
within scope. When a budget or unresolved dependency stops the loop earlier,
record the verified portion and the remaining candidates.

## 4. Verify the smaller contract

Verify every retained scenario and shared invariant against the evidence established
before its implementation changed. Compilation and the edited test suite alone
are insufficient.

Every removed or changed test expectation must correspond to an authorized cut
or a demonstrably redundant check. Preserve checks for retained behavior inside
mixed tests. Verify that formerly supported requests have the declared outcome,
including explicit rejection when they can still reach a public boundary.

Run relevant final checks and inspect the diff for unrelated changes, dangling
callers, stale configuration, and unaccounted behavior changes. Rebuild the
structural account. Accept compaction when:

- the retained contract passes its checks;
- every observed behavior loss is an authorized cut;
- production code decreases and at least one structural dimension improves;
- the reduction is real, rather than code moved elsewhere or hidden in a new
  dependency; and
- relevant checks pass or have clearly separated baseline failures.

If proof is unavailable, report the result as unverified. If only structural
cleanup was possible, report that outcome without claiming capability reduction.

## Report the result

Lead with the outcome: verified compaction, structural cleanup only, no supported
cut, partial completion, or verification blocked/failed.

Include the retained core, deliberate losses, production code before and after,
structural reductions, changed paths, checks and their results, and any unresolved
candidates or limitations. Claim a retained-value percentage only when its
measurement supports it. Commits, installation, and publication follow the user's
requested scope.

## Example invocation

> Compact the reporting module to CSV generation on demand. Remove JSON, XML,
> scheduling, and delivery retries. Keep report calculations, access checks, and
> CSV escaping correct. Delete the support code those cuts make unnecessary.
