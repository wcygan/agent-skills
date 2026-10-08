---
name: flow-simplification
description: "Simplify an end-to-end code flow by mapping its purpose and phases, removing unnecessary machinery, and verifying preserved outcomes and performance. Use when substantial code reduction requires redesigning a workflow across functions or modules; remove capabilities only when authorized."
license: "MIT"
metadata:
  author: "William Cygan"
  version: "0.1.0"
---

# Flow Simplification

Reconstruct one code flow's purpose and required guarantees, design a smaller
implementation, and verify the retained outcomes. Own the connection between
the flow map, redesign, code reduction, and proof; companions contribute bounded
work to that result.

Use `simplify-code` directly for a local cleanup that needs no flow redesign.
Use `logical-compaction` directly when the main job is already an agreed feature
reduction. A flow explanation without redesign belongs to `trace-codepath`.

## Preserve the requested mode and authority

Read repository instructions and inspect dirty state before commands. Preserve
unrelated work and identify authoritative source versus generated output.

A planning request keeps tracked files read-only and uses existing evidence
and safe local checks. A request to simplify or rewrite the flow authorizes
the corresponding local implementation and necessary tests and documentation
within scope. Analytical companions finishing does not end that authorization;
continue implementation once required evidence and decisions are settled.

Dependency changes, shared-state experiments, production operations, commits,
publication, and deployment require authority covering those effects. Bound
local runtime experiments by environment, side effects, cleanup, and limits.

Read [Companion contracts](references/companion-contracts.md) when selecting a
specialist at any phase; consult its selected section. Compose in the current
session by default. This workflow does not itself authorize agent delegation.
For authorized delegation, use `route-agent-models` and pass the bounded flow
context, revision, evidence, and phase authority. Routes add no permissions.

Companion availability is separate from evidence requirements. If a skill is
unavailable, do its work directly when the same obligations can be met with
available tools and knowledge. Identify the method used and any capability gap;
block only dependent actions when essential evidence remains unavailable.

## 1. Define the flow contract

Record in the working conversation:

```text
Purpose and user or system outcome:
Trigger, entry anchor, and terminal outcome:
Retained scenarios, variants, and failure outcomes:
Preserved guarantees and their authoritative sources:
Authorized capability cuts or other behavior changes:
Performance requirements and comparison criteria:
Mutable scope, non-goals, and review constraints:
Requested mode and operational authority:
```

Describe scenarios through observable inputs, outputs, state, and effects.
Include relevant access, ordering, transaction, idempotency, concurrency,
recovery, compatibility, and resource-lifecycle guarantees. High-level purpose
guides redesign; it does not authorize discarding these guarantees.

Default to preserving behavior. Treat capability cuts as authorized only when
covered by the request or delegated product judgment. Separate authorized bug
corrections from structural work, with their own expected behavior and proof.
Use repository evidence to infer routine scope; ask only for a missing decision
that materially changes the contract or blocks dependent work.

**Complete when:** one bounded flow has observable retained outcomes, named
guarantees, and an explicit boundary for any permitted behavior changes.

## 2. Map the current flow and establish the baseline

Trace representative scenarios from trigger to terminal effects. For each
meaningful phase, identify its inputs and representations, decisions, state
owner, effects, and requirement served. Include failure and recovery paths
that support retained scenarios. Use `trace-codepath` when dispatch or execution
boundaries are uncertain.

Collapse incidental framework plumbing in the map while preserving mechanisms
that alter the contract. Label material claims as observed, source-verified,
declared, inferred, or unknown, with evidence locations. Reconcile conflicting
sources through a discriminating check; keep unresolved conflicts visible.

Run the smallest relevant baseline checks and classify existing failures.
Establish an unchanged expected-result source or independent check for affected
guarantees before changing implementation or assertions. An essential proof gap
blocks dependent edits; continue design and safe proof work. Add necessary
characterization when implementation is authorized; otherwise describe the
missing coverage.

Record production code size and relevant structural dimensions: phases,
representations, branches, indirection, mutable state, interfaces, duplicated
rules, and dependencies. Include support code outside the immediate entrypoint;
separate tests, generated output, and documentation. Fix the measurement scope
and method for the final comparison.

Read [Proof and measurement](references/proof-and-measurement.md) when coverage
is missing, test expectations may change, stateful effects need proof, or
performance requires comparison. Use `design-verification-strategy` when the
existing evidence cannot distinguish preservation from regression.

**Complete when:** the meaningful phases and their purposes are accounted for,
baseline results and measurements are recorded, and each candidate's affected
guarantees have reliable proof or a specific evidence gap.

## 3. Design a smaller flow

Describe the simplest algorithm that fulfills the contract before preserving
existing class and module boundaries. Look for redundant phases, repeated
validation or transformations, competing representations, unnecessary
intermediate state, wrappers, dispatch, and duplicated ownership. Preserve
separate rules that differ in meaning or reasons to change.

For each candidate, record:

```text
Current phases and machinery affected:
Proposed phases, data ownership, and algorithm:
Code and concepts eliminated:
How each affected guarantee remains fulfilled:
Intentional differences and their authority:
Affected callers, contracts, state, and support code:
Independent correctness check and performance comparison:
Transition needs, tradeoffs, and remaining unknowns:
```

Account for every removed responsibility: show that it is redundant, fulfilled
by the proposed design, or part of an authorized capability cut. Search callers,
registrations, configuration, generated consumers, and dynamic entrypoints
where ordinary references cannot establish deletion safety.

Prefer substantial removal of machinery with strong proof and acceptable
runtime cost. Judge the complete implementation burden, including new support
code and dependencies. Moving code, hiding it in a dependency, or compressing
syntax does not demonstrate eliminated complexity. Use measured reduction
instead of promising an arbitrary percentage.

**Complete when:** one recommended design maps every affected requirement to
its new implementation and proof, or no supported simplification remains.

## 4. Prepare the necessary transition

Select only companions whose predicates hold:

| Companion | Predicate and contribution |
|---|---|
| `shape-safe-change` | Consequences for contracts, schemas, dependencies, ownership, or rollout remain uncertain. Reconcile impact, compatibility, transition, and proof before dependent edits. |
| `plan-safe-refactor` | The redesign needs independently safe structural stages. Produce concrete checkpoints, validation, rollback, and removal conditions for temporary machinery. |
| `simplify-code` | A bounded behavior-preserving portion fits its scope and review limits. Implement and verify that portion. |
| `logical-compaction` | Authorized capability cuts unlock meaningful deletion. Remove those capabilities and their exclusive machinery while preserving the retained core. |

Reuse an adequate current design, proof strategy, or stage plan, including
artifacts returned through another companion. Structural stages preserve their
named behavior; intentional losses and bug corrections have separate acceptance
conditions. Reconcile all results against the same flow contract rather than
concatenating reports.

Honor repository and companion review limits. Execute larger rewrites through
a concrete staged plan; stages must be independently safe, not arbitrary
fragments created to bypass a bounded simplifier's limit. For an atomic local
change, use the smallest necessary transition without extra compatibility
machinery. Make cleanup of temporary paths part of completion.

**Complete when:** each implementation stage has a bounded change, preserved
guarantees, checks, stop conditions, and appropriate rollback. Planning-only
requests report the proposed flow and outstanding gates here; implementation
requests continue within their existing authority.

## 5. Execute and verify the integrated result

Apply one coherent stage or capability cut at a time. Run its focused checks;
correct a regression within scope or undo only that change. Retain verified
checkpoints and preserve unrelated work. Revisit the design when new evidence
contradicts it. Continue supported reductions within the named flow until no
candidate remains, a stated budget ends, or a material unresolved gate blocks
the next change.

Verify the complete retained scenarios against the original contract and
independent evidence, including material failures and terminal state effects.
Run relevant repository checks. Compare performance under equivalent conditions
against the agreed criteria. Inspect the final diff for dangling consumers,
stale promises, unrelated edits, and unfinished transition machinery.

Rebuild the structural account using the baseline scope and method. Claim
verified flow simplification only when:

- every retained outcome and required guarantee has adequate passing proof;
- every intentional difference is authorized and checked;
- relevant performance requirements pass representative comparisons;
- production code decreases and at least one meaningful structural dimension
  improves, with any increased burden explained; and
- required checks pass, with pre-existing failures classified separately.

**Complete when:** these gates pass for the final implementation, or the
verified portion and exact failure, evidence gap, or remaining decision are
recorded. Compilation, edited tests, and fewer lines alone cannot close a gap.

## Report one outcome

Lead with **planned**, **verified flow simplification**, **structural cleanup
only**, **no supported simplification**, **partial completion**, or
**verification limited/failed**, according to the evidence.

Return one report connecting purpose, retained scenarios, before-and-after
phases, implementation changes, authorized losses, production code measurements,
structural reductions, correctness and performance results, and unresolved work.
For a plan, distinguish runnable acceptance checks from evidence already obtained.
For incomplete work, state the smallest next action and what it would establish.

Use `humanizer` when the report or in-scope prose documentation needs rewriting;
preserve evidence, qualifications, technical terms, and measured values. Its
prose work supplies no correctness or performance proof. A compact before-and-after
flow diagram is useful when it makes the eliminated machinery clear.
