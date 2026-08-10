---
name: shape-safe-change
description: Shape one cross-cutting or architecture-sensitive change by aligning domain meaning, module seams, blast radius, compatibility, staged transition, rollback, and verification. Use before implementing API, event, schema, configuration, dependency, ownership, migration, or behavior changes whose impact or rollout is uncertain; produce a read-only Change Design Pack and stop before implementation.
license: MIT
metadata:
  author: William Cygan
  version: "0.1.0"
---

# Shape a Safe Change

Turn one cross-cutting or architecture-sensitive proposal into an integrated,
evidence-backed Change Design Pack. Reconcile domain meaning, module design,
impact, transition safety, rollback, and proof before anyone implements the
change.

## Preserve the authority boundary

Treat the entire shaping run as read-only. Inspect repository instructions,
source, contracts, configuration, schemas, tests, history, and available
operational artifacts, but leave the repository and external systems
unchanged. Do not implement code, update dependencies, create or apply
migrations, access production, deploy, or publish.

Running this skill does not authorize domain-document edits. Consult existing
domain language on every run. Route glossary or ADR changes to
`domain-modeling` only as a separate action after the user explicitly
authorizes updates to those files. Without that authority, record proposed
language and unresolved decisions in the pack.

If the user asks to implement an already approved plan, this is the wrong
workflow. Hand off the approved phases and stop using this skill.

## Check the proposal and companions

Shape one coherent old-to-new change. Split unrelated proposals before
analysis. If the proposal lacks a concrete anchor or target behavior, choose a
narrow stated interpretation when safe; otherwise record the decision needed
before a complete pack is possible.

Resolve companions through the client's installed skill mechanism by skill
name. Do not read sibling skill files by filesystem path or recreate a missing
companion's method inside this skill.

| Companion | Routing predicate | Phase artifact |
|---|---|---|
| `codebase-design` | Required for every run after the change contract and domain delta are understood. | Seam Decision |
| `map-change-impact` | Required for every run after a candidate seam exists. | Impact Ledger and Compatibility Matrix |
| `plan-safe-refactor` | Invoke only when the proposal contains a behavior-preserving structural lane. Pass only that lane. | Structural Slice Plan |
| `design-verification-strategy` | Required after critical risks, compatibility states, and transition phases are known. | Proof Matrix and acceptance gates |
| `domain-modeling` | Invoke only after explicit authority to update named glossary or ADR files; ordinary domain consultation does not trigger it. | Authorized domain-document change, handled separately from the read-only pack |

Before analysis, confirm that all required companions are available. If
`codebase-design`, `map-change-impact`, or `design-verification-strategy` is
missing, report the missing name and blocked artifacts, then stop without
presenting a complete Change Design Pack. If the structural predicate fires
and `plan-safe-refactor` is unavailable, report the structural lane as blocked
rather than improvising its plan. A missing `domain-modeling` skill does not
block read-only shaping; expose it only when an authorized documentation action
cannot be routed.

## Build the Change Design Pack

### 1. Define the change contract

State the anchor, current behavior, proposed behavior, reason, scope,
constraints, and non-goals. Separate:

- behavior that must remain invariant;
- intentional externally or operationally visible differences; and
- assumptions that still require a decision or evidence.

Include API, event, schema, configuration, dependency, state, ownership, and
lifecycle semantics that form part of the contract. The contract is complete
when every later artifact can point to the same old and new states without
silently changing their meaning.

### 2. Resolve the domain delta

Read the repository's current glossary, context map, ADRs, contracts, and
domain-bearing code when present. Identify terms whose meaning is preserved,
added, split, merged, deprecated, or disputed. Reconcile documentation and
code conflicts when the evidence permits; otherwise keep the conflict visible.

Produce a Domain Delta with the current term and meaning, proposed meaning,
affected contract, evidence, disposition, and unresolved owner or decision.
Proposed wording belongs in the pack until domain-document mutation is
explicitly authorized.

### 3. Select the ownership boundary and seam

Invoke `codebase-design` with the change contract and Domain Delta. Use its
vocabulary and decision criteria to select the module, interface, seam,
adapters, ownership, and dependency direction. Evaluate the proposed seam even
when the request already names one.

Record one recommended Seam Decision, rejected alternatives, the complexity it
localizes, the callers that remain insulated, and any uncertainty. Justify a
new seam through stable ownership or real old/new variation, not diagram
symmetry.

### 4. Map impact and compatibility

Invoke `map-change-impact` with the change contract and recommended seam. Make
its evidence-backed traversal cover direct and transitive callers, consumers,
contracts, persisted or retained state, configuration, generated artifacts,
operations, verification, and human-facing contract surfaces.

Carry its results into one Impact Ledger and Compatibility Matrix. Keep
unknown owners, unavailable repositories, runtime-only wiring, and weak
evidence visible. An absent search result is not proof that an external
consumer is unaffected.

### 5. Separate structural and behavioral lanes

Classify every proposed implementation slice into exactly one lane:

- **Structural:** changes ownership, location, dependency direction, or
  implementation while preserving the old behavior contract.
- **Behavioral:** introduces an intentional contract, state, policy, default,
  operational, or user-visible difference.

Attach compatibility, data, operational, proof, and cleanup obligations to the
lane that creates them. Never hide a behavioral difference inside a structural
slice. When a slice cannot be separated, classify it as behavioral and explain
why atomicity is required.

If a structural lane exists, invoke `plan-safe-refactor` with only its
behavior-preserving scope, invariants, seam, and relevant impact evidence.
Carry its Structural Slice Plan into the integrated staged plan. Do not use it
to design behavior changes, migrations, dependency updates, or deployment.

### 6. Build the staged transition

Order structural prerequisites and behavioral transition phases so every
intermediate state is supported. For each phase record:

```text
Phase and lane:
Starting state and entry gate:
Change responsibility:
Preserved invariants or intentional differences:
Compatibility state:
Owner and coordination:
Proof and exit gate:
Rollback:
Stop conditions:
Resulting state:
```

Cover old/new producer-consumer combinations, mixed deployments, retained or
queued data, dual-read or dual-write periods, long-running work, flags,
backfills, cleanup, and irreversible effects when relevant. A future cleanup
phase cannot be a prerequisite for the current phase's safety.

### 7. Make rollback executable

Define the last safe rollback point for each phase and for the transition as a
whole. State who triggers rollback, what signal triggers it, how code and data
return to a supported interpretation, which effects cannot be reversed, and
what evidence confirms recovery. A source revert alone is insufficient after
new state, messages, or external effects can exist.

Keep rollback gaps visible as decision gates. Do not relabel roll-forward-only
recovery as rollback.

### 8. Bind risks to proof

Invoke `design-verification-strategy` with the reconciled contract, domain
delta, seam, Impact Ledger, Compatibility Matrix, phase plan, rollback design,
and critical risks. Carry its authoritative oracles and acceptance gates into
one Proof Matrix.

Every critical risk and preserved invariant must map to a discriminating check
at the right environment and fidelity. Record what each check proves, what it
does not prove, its evidence artifact, owner, authority requirement, and stop
condition. Keep production-only, external-owner, unavailable, and
producer-controlled evidence limitations explicit.

### 9. Reconcile instead of concatenating

Produce one internally consistent pack, not separate companion reports. Before
reporting, verify all of these links:

- the Domain Delta uses the Change Contract's meanings;
- the Seam Decision insulates the callers claimed as unaffected;
- every required or conditional impact appears in a phase or explicit
  handoff;
- every Compatibility Matrix state is supported, prohibited, or gated;
- structural phases preserve the old behavior contract;
- behavioral phases name every intentional difference;
- every phase has rollback and stop conditions;
- every critical risk and invariant maps to authoritative proof; and
- unknown ownership and unavailable evidence remain visible until resolved.

Resolve contradictions by revising the affected artifacts together. If the
evidence cannot resolve one, mark the pack decision-blocked rather than
choosing silently.

## Report one Change Design Pack

Lead with pack status: `ready for implementation approval`,
`decision-blocked`, or `evidence-blocked`. Then report:

1. **Change Contract** — anchor, old state, new state, invariants, intentional
   differences, scope, constraints, and non-goals.
2. **Domain Delta** — terminology changes, conflicts, evidence, proposed
   wording, and documentation authority status.
3. **Seam Decision** — module, interface, seam, adapters, ownership,
   dependency direction, rationale, and rejected alternatives.
4. **Impact Ledger** — direct and transitive surfaces, required action,
   consequence, owner, evidence, and proof need.
5. **Compatibility Matrix** — supported and prohibited old/new code, contract,
   configuration, and data combinations.
6. **Staged Plan** — separate structural and behavioral lanes with entry,
   exit, compatibility, ownership, rollback, and stop conditions.
7. **Rollback** — phase rollback points, whole-transition recovery, irreversible
   effects, and confirmation evidence.
8. **Proof Matrix** — risk or invariant, scenario, oracle, tier, environment,
   evidence artifact, owner, gap, and acceptance gate.
9. **Implementation Handoff** — ordered authorized work packages,
   prerequisites, owners, acceptance criteria, and the first safe phase after
   approval. This is a handoff, not implementation.
10. **Unknowns** — unresolved meaning, ownership, consumer, evidence, authority,
    and rollback questions, with their consequence and next resolver.

End by stating that implementation has not started and naming the explicit
approval or evidence needed next.

## Trigger examples

- “Shape this cross-service API change safely.”
- “Plan this retained-event migration before implementation.”
- “Design a staged architecture change with rollback and proof.”

Do not use this workflow to rename a private helper or implement an approved
plan.
