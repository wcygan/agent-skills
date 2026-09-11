---
name: shape-safe-change
description: "Plan a cross-cutting change with uncertain compatibility or rollout. Use when domain meaning, module boundaries, migration, and verification need a combined design."
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

Keep the shaping phase read-only: inspect relevant source, contracts, schemas, tests, history, and authorized operational artifacts. For a shaping-only request, report proposed changes in the pack. A combined design-and-implementation request can proceed into the authorized local work once the design and required decisions are settled. Production operations and external publication follow their own authority boundaries.

Consult existing domain language when relevant. Use `domain-modeling` for glossary or ADR changes when those changes are in scope; otherwise retain proposed wording in the pack.

If the user supplied an approved plan and asks to implement it, proceed to implementation rather than repeating this shaping phase.

## Check the proposal and companions

Shape one coherent old-to-new change. Split unrelated proposals before
analysis. If the proposal lacks a concrete anchor or target behavior, choose a
narrow stated interpretation when safe; otherwise record the decision needed
before a complete pack is possible.

Prefer the following specialists when available. Their phase evidence is required, but invoking a particular installed skill is not: use available knowledge and tools directly when sufficient, and identify any missing evidence or capability.

| Companion | Routing predicate | Phase artifact |
|---|---|---|
| `codebase-design` | Relevant after the change contract and domain delta are understood. | Seam Decision |
| `map-change-impact` | Relevant after a candidate seam exists. | Impact Ledger and Compatibility Matrix |
| `plan-safe-refactor` | Invoke only when the proposal contains a behavior-preserving structural lane. Pass only that lane. | Structural Slice Plan |
| `design-verification-strategy` | Relevant after critical risks, compatibility states, and transition phases are known. | Proof Matrix and acceptance gates |
| `domain-modeling` | Use when glossary or ADR updates are within the user's authorization; ordinary domain consultation does not trigger it. | Authorized domain-document change, following the read-only design phase |

Continue independent analysis if a companion is missing. Mark only unsupported artifacts or claims as blocked; do not present the pack as complete while essential evidence is missing.

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

Use `codebase-design` with the change contract and Domain Delta. Use its
vocabulary and decision criteria to select the module, interface, seam,
adapters, ownership, and dependency direction. Evaluate the proposed seam even
when the request already names one.

Record one recommended Seam Decision, rejected alternatives, the complexity it
localizes, the callers that remain insulated, and any uncertainty. Justify a
new seam through stable ownership or real old/new variation, not diagram
symmetry.

### 4. Map impact and compatibility

Use `map-change-impact` with the change contract and recommended seam. Make
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

Use `design-verification-strategy` with the reconciled contract, domain
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

Lead with pack status: `ready for implementation`,
`decision-blocked`, or `evidence-blocked`. Cover these areas, combining overlapping sections and omitting inapplicable detail:

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
   prerequisites, owners, acceptance criteria, and the first safe phase within the user's authorization.
10. **Unknowns** — unresolved meaning, ownership, consumer, evidence, authority,
    and rollback questions, with their consequence and next resolver.

State what is complete and any missing decision, evidence, or authority. If implementation is already requested, continue into it; otherwise the pack completes the shaping request.

## Trigger examples

- “Shape this cross-service API change safely.”
- “Plan this retained-event migration before implementation.”
- “Design a staged architecture change with rollback and proof.”

Do not use this workflow to rename a private helper or implement an approved
plan.
