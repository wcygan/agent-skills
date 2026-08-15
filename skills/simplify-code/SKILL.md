---
name: simplify-code
description: Simplify one bounded code target and its same-behavior tests through verified edits. Use it when the user asks to simplify code, remove dead code or unnecessary indirection, flatten control flow, or consolidate repeated meaning. Also use it for bounded readability and test cleanup without a cross-cutting redesign. Preserve intended behavior. Require separate authority and proof for each bug fix.
license: MIT
metadata:
  author: William Cygan
  version: "0.1.0"
---

# Simplify Code

Produce verified, simpler code for one bounded target. Reduce structural burden,
not line count alone.

## Route nearby work

Use this skill when the user requests edits to a named file, symbol, module, or
small diff.

Route these nearby jobs to their owning skill:

- Use `code-review` when the user wants findings without edits.
- Use `plan-safe-refactor` when work needs stages, new seams, moved ownership,
  or compatibility states.
- Use `shape-safe-change` for uncertain API, event, schema, dependency,
  configuration, migration, or behavior changes.
- Use `reproduce-bug` when a reported bug does not yet have a reliable
  reproduction.

## Define the simplification contract

Read the request, repository instructions, and current worktree state. Record:

```text
Target:
Intended behavior:
Authorized bug changes:
Mutable production scope:
Mutable test scope:
Authoritative oracle:
Unchanged oracle or independent check:
Focused checks:
Final checks:
Non-goals:
Review LOC limit:
Commit policy: prohibited | authorized
```

Require one named target. The mutable test scope can include tests in any file
that directly exercise the same behavior.

Treat all existing changes as user-owned. Preserve them and stop when safe
separation is unclear.

Treat a missing commit request as `prohibited`. Do not push, publish, deploy,
or change external systems without separate authority.

## Establish the baseline

Trace the target far enough to understand its inputs, outputs, errors, side
effects, state, ordering, concurrency, security, and performance contracts.

Run the smallest authoritative checks before editing. Separate existing
failures from failures that involve the target.

Add characterization coverage when it is safe, local, and necessary. Stop
with `blocked` when no reliable oracle can distinguish success from regression.

Keep one oracle unchanged, or use an independent equivalence check. Do not
weaken every proof source during the same run.

Record this structural account:

```text
Behavior-bearing concepts:
Branches and nesting:
Indirection and call depth:
Interfaces and configuration:
Mutable state and scope:
Duplicated meaning:
Code size:
```

Use code size only as supporting evidence. A shorter result is not always a
simpler result.

## Separate bug fixes

Use separate task phases when the target contains an authorized, proven bug.

1. Confirm explicit authority to change the named behavior.
2. Name the expected behavior source, such as a user requirement or contract.
3. Add or identify evidence that fails for the bug.
4. Apply the smallest supported bug fix.
5. Run the bug oracle and restore a passing state.
6. Record the behavior change separately.
7. Start simplification only after the bug fix checks pass.

A reproduction proves a defect only when an authority defines expected
behavior. It never grants change authority. Report an unauthorized bug.

Do not treat style preference or a surprising implementation as proof of a
bug. Escalate a bug fix that requires cross-cutting change.

## Find supported simplifications

Inspect the complete target with this order:

1. Delete supported dead code, unused configuration, stale comments, and
   redundant tests.
2. Inline needless wrappers, adapters, variables, and forwarding functions.
3. Replace nested or flag-driven control flow with direct expressions and
   guard clauses.
4. Narrow mutable state, variable scope, parameters, and lifecycle.
5. Consolidate duplicated meaning behind one source of truth.
6. Improve names, conditions, comments, and target-local style.
7. Simplify tests that directly exercise the same behavior.
8. Add an abstraction only when total structural burden decreases.

Require evidence for deletion. Search callers, registrations, generated use,
reflection, configuration, and runtime entrypoints when they can retain code.

Consolidate shared meaning, not similar syntax. Keep separate rules separate
when they can change for different reasons.

Prove each test edit against an unchanged oracle or independent equivalence
check.

Run a formatter only when its write scope fits the mutable scope. Otherwise,
make local style edits manually. Inspect the formatter diff before acceptance.

## Execute to a bounded fixed point

Rank candidates by proof strength, risk, and structural reduction. Apply one
coherent candidate at a time.

Run the focused checks after each candidate. Correct or undo only the candidate
through a focused edit. Stop when no supported correction exists.

Rescan every rubric category after each accepted change. Continue until no
supported candidate remains.

Estimate total review LOC before editing. Use the lower of 300 LOC and each
repository limit. Route work expected to exceed that limit.

Count review LOC as additions plus deletions. Stop before the change exceeds
the limit. Return `review_limit_reached` with the verified layer and remainder.

Stop when a candidate changes public contracts, schemas, dependencies,
concurrency design, ownership, migrations, or compatibility states. Route that
work to the applicable design or refactor skill.

## Verify the result

Run all focused checks and the relevant broader checks. Inspect the final diff
for scope, intent, and unrelated changes.

Rebuild the structural account. Accept the result only when:

- intended behavior passes its authoritative oracle;
- each proven bug change passes its separate oracle;
- at least one structural dimension decreases;
- no structural increase lacks a specific tradeoff;
- all edits belong to the mutable scope; and
- all required checks pass or have classified baseline failures.

Do not claim success from line count, formatting, compilation, or test count
alone.

## Report one terminal result

Return exactly one status:

```text
simplified_verified | bug_fixed_only | no_supported_simplification
review_limit_reached | verification_failed | blocked | escalated
```

Report:

```text
Status:
Target and mutable scope:
Intended behavior and oracle:
Authorized and proven bug changes:
Simplification changes:
Test and style changes:
Before-and-after structural account:
Changed paths:
Focused and final checks:
Remaining candidates:
Escalated work:
Commit status:
```

Lead with the verified result. Separate completed work, remaining work, unavailable proof, and escalations.

## Example

> Simplify this adapter. Fix the authorized bug first. Start simplification after its checks pass.
