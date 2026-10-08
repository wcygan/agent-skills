# Companion contracts

Read the section for the selected specialist. The parent owns the flow contract,
recommended redesign, phase ordering, evidence reconciliation, and final result.
Each companion receives a bounded question and returns evidence or an exact gap.

## Shared handoff

Pass the purpose, scenarios, contract sources, current and proposed phases,
revision, environment, affected scope, existing evidence, remaining question,
and phase authority. Reuse matching artifacts rather than restarting discovery.

Tracing, verification design, change shaping, and refactor planning remain
analytical. Implementation companions receive mutation authority only for the
selected local scope and necessary checks. Their completion does not revoke
already-authorized parent implementation. Prose editing is limited to requested
documentation or the report. Operational effects retain the parent's authority
boundary.

Carry the parent's route and authority ceiling into each handoff. An
inconclusive result returns supported partial evidence and the smallest
discriminating next check; apply the entrypoint's fallback policy to any gap.

## `trace-codepath`: reconstruct execution

- **When:** Selected dispatch, runtime wiring, branch conditions, or boundaries
  are unclear enough to affect the flow map or deletion decision.
- **Input:** Trigger, entry anchor, terminal outcome, relevant variant and
  configuration, and the uncertain segment.
- **Output:** Evidence-backed path with phase inputs, decisions, state effects,
  selected implementations, boundary semantics, and unknown edges.
- **Complete when:** The material trigger-to-outcome path is established, or
  the exact unresolved segment is identified. Distinguish source relationships
  from observed runtime execution.
- **Parent use:** Bound the redesign and identify which apparently redundant
  mechanisms actually uphold a guarantee.

## `design-verification-strategy`: establish discriminating proof

- **When:** Available tests or measurements cannot establish the contract,
  expected results may be edited, or proof fidelity is uncertain.
- **Input:** Retained scenarios, invariants, authorized differences, risks,
  current checks, environment constraints, and performance criteria.
- **Output:** Scenario-to-proof mapping with authoritative expected results,
  independent evidence, exact conditions, acceptance gates, and limitations.
- **Complete when:** Every critical guarantee has a suitable discriminating
  check, or an explicit unresolved proof obligation. Designing a check is not
  evidence that it passed.
- **Parent use:** Bind candidate acceptance to this proof before implementation.

## `shape-safe-change`: resolve consequential uncertainty

- **When:** A candidate has unresolved compatibility, domain, contract,
  dependency, ownership, migration, or rollout consequences.
- **Input:** Flow contract, current and proposed design, affected surfaces,
  intentional differences, baseline evidence, and specific uncertainties.
- **Output:** Reconciled change design covering impact, compatibility, separate
  structural and behavioral lanes, transition, recovery, and proof obligations.
- **Complete when:** Dependent decisions are resolved, or the exact decision
  or evidence gate is identified. Preserve the companion's readiness status.
- **Parent use:** Update the proposed flow and its stage plan together. Reuse
  any refactor or verification artifacts it already obtained.

## `plan-safe-refactor`: stage the structural rewrite

- **When:** A concrete behavior-preserving target needs several independently
  safe changes to structure, boundaries, or ownership.
- **Input:** Current and target phases and ownership, preserved behavior,
  affected callers and state, proof strategy, and transition constraints.
- **Output:** Ordered stages with starting and resulting states, invariants,
  validation, rollback, stop conditions, and temporary-path removal criteria.
- **Complete when:** Every stage is safe to leave in place and reaches the
  target without relying on future cleanup for correctness, or the unsafe
  transition is named. Public behavior changes stay outside the structural lane.
- **Parent use:** Execute the stages under parent authority; retain rollback
  and compatibility obligations through final cleanup.

## `simplify-code`: simplify a bounded portion

- **When:** A behavior-preserving portion fits the companion's target and
  review constraints without unresolved architectural changes.
- **Input:** Named target, intended behavior, mutable production and test
  scope, unchanged oracle or independent check, checks, and review constraints.
- **Output:** Scoped implementation, structural comparison, verification
  results, terminal status, and remaining candidates or escalation.
- **Complete when:** The portion meets its contract and acceptance gates, or
  its exact limit or failure is returned. An escalation is not completed work.
- **Parent use:** Review the portion against the whole flow. Respect its review
  limit; a larger parent plan does not enlarge this companion's scope.

## `logical-compaction`: remove authorized capabilities

- **When:** A permitted capability loss unlocks meaningful removal of exclusive
  code and supporting machinery.
- **Input:** Useful core, complete retained scenarios, explicit authorized
  cuts, shared invariants, changed-request outcomes, deletion scope, and proof.
- **Output:** Coherent cuts, resulting implementation, each actual behavior
  loss, unchanged proof for the core, reduction measurements, and limitations.
- **Complete when:** The retained contract passes, all losses are authorized,
  and real code and structural reduction are demonstrated, or the unsupported
  cut or missing proof is recorded.
- **Parent use:** Integrate deliberate losses into the flow contract and report.
  Core correctness, access, recovery, and performance remain required unless
  the user specifically authorizes a change to those guarantees.

## `humanizer`: explain the verified redesign

- **When:** The final report or in-scope prose documentation needs clearer,
  natural wording after technical conclusions have stabilized.
- **Input:** Evidence-backed explanation, before-and-after flow, measurements,
  authorized differences, and qualifications that must remain.
- **Output:** Revised prose preserving facts and meaning, with code, commands,
  identifiers, references, and raw evidence intact.
- **Complete when:** The explanation is clear and every technical claim and
  limitation survives the rewrite.
- **Parent use:** Review wording against evidence; keep code transformation
  and acceptance decisions with the technical phases.
