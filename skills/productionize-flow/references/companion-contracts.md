# Companion contracts

The parent owns operational acceptance and final verification. Pass each
specialist the bounded flow, revision, environment, requirements, affected state
and effects, existing evidence, remaining question, and phase authority.

Analysis companions inspect without introducing operational effects. The local
implementation phase receives only its mutable work package; runtime proof
receives isolated run-owned effects. Carry the entrypoint's route, authority,
and fallback rules into every handoff. Inconclusive results return supported
evidence, exact gaps, and the smallest next check.

## `trace-codepath`: execution identity

- **When:** Dispatch, runtime wiring, boundary selection, or completion is
  uncertain enough to affect the failure model.
- **Input:** Trigger, entry anchor, terminal sink, relevant variant, and
  unresolved segment.
- **Output:** Selected path, conditions, state effects, boundary semantics,
  evidence locations, and unknown edges.
- **Complete when:** Material execution is established or the exact unresolved
  segment is identified. Use source paths and observed execution distinctly.

## `audit-resilience`: credible risks and existing controls

- **When:** The required outcome must be assessed against failures in the
  declared operating envelope and existing evidence is insufficient.
- **Input:** Flow contract, state owners, effects, envelope, known path,
  recovery requirements, and available baseline evidence.
- **Output:** Bounded state/failure model, counterexamples, current controls,
  prioritized gaps, necessary hardening, and proof obligations.
- **Complete when:** Critical properties have supported coverage or explicit
  gaps, with severity separated from confidence.

## `model-concurrency`: critical schedules

- **When:** Correctness depends on competing actors, ordering, duplication,
  cancellation, leases, or ambiguous completion.
- **Input:** Actors, operations, state, identities, invariants, relevant
  schedule, and synchronization or ownership rules.
- **Output:** Supported model, minimal counterexample schedules, necessary
  controls, and limits of the model.
- **Complete when:** The implicated property and critical schedule are
  established, or the unresolved timing/ownership edge is named.

## `audit-observability-path`: detection and recovery evidence

- **When:** A named diagnostic question remains unanswered after reusing
  existing control and signal evidence.
- **Input:** Scenario, expected outcome, boundaries and identities, diagnostic
  questions, existing signals, and privacy/cost constraints.
- **Output:** Signal coverage, correlation gaps, answerable questions, and
  bounded instrumentation and validation needs.
- **Complete when:** Every selected question has adequate signal evidence or
  a precise gap. Definition, emission, and consumption are separate claims.

## `design-verification-strategy`: acceptance proof

- **When:** An accepted requirement lacks a discriminating oracle, independent
  proof, representative scenario, or adequate environment fidelity.
- **Input:** Reconciled requirements, risks, proposed controls, available
  checks, budgets, environment constraints, and acceptance matrix.
- **Output:** Risk-to-proof mapping, fixtures, oracles, independent evidence,
  exact gates, and limitations.
- **Complete when:** Each critical claim has suitable proof or an explicit
  unresolved obligation. A designed test is not a passing result.

## `shape-safe-change`: consequential decisions

- **When:** Proposed hardening has unresolved contract, state, dependency,
  ownership, compatibility, or rollout effects.
- **Input:** Current and proposed behavior, invariants, intentional changes,
  impacted surfaces, baseline evidence, and unresolved decisions.
- **Output:** Reconciled impact, compatibility, transition, recovery, and proof
  decisions, with readiness status.
- **Complete when:** Dependent decisions are resolved or their gate is named.
  Reuse any verification or refactor plan already produced here.

## `plan-safe-refactor`: safe structural stages

- **When:** A concrete structural target needs independently safe intermediate
  states and an adequate stage plan is not already available.
- **Input:** Current and target structure, retained behavior, affected callers
  and state, proof requirements, and transition constraints.
- **Output:** Safe stages with entry/exit states, invariants, checks, rollback,
  stop conditions, and temporary-path removal criteria.
- **Complete when:** Each stage is safe to leave and reaches the agreed target,
  or the unsupported transition is identified.

## `incremental-execution`: bounded local implementation

- **When:** The user requested hardening and a work package has settled
  acceptance criteria, authority, and recovery boundaries.
- **Input:** Required behavior/control, mutable scope, baseline, proof matrix,
  permitted effects, checkpoints, and final checks.
- **Output:** Scoped code, signals, tests, operator instructions, checks,
  recovery/cleanup status, and unresolved work.
- **Complete when:** The work package meets its criteria or returns its exact
  failure or gate. The parent still verifies the integrated flow.

## `live-test-changes`: isolated runtime evidence

- **When:** Acceptance requires behavior from the assembled running flow.
- **Input:** Exact candidate, accepted cases, controlled fixtures, local
  deployment, failure seams, allowed effects, observations, and cleanup plan.
- **Output:** Captured runtime and authoritative-state results, actual signal
  evidence, fidelity limits, and run-owned artifact/process disposition.
- **Complete when:** Selected cases are exercised and cleanup is accounted for,
  or the exact runtime gap is returned. Keep tracked application files read-only.

## `computer-use-ui-testing`: visible terminal outcome

- **When:** A required outcome depends on real visible app interaction.
- **Input:** Same candidate and fixtures, journey, visible success/failure
  conditions, durable-state checks, and allowed local effects.
- **Output:** Observed journey, captures when useful, recovery-state results,
  and interaction limitations.
- **Complete when:** The journey has observed outcomes or a precise blocker.
  Pair screenshots with independent state evidence for persistence claims.
